import mongoose from "mongoose";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import moment from 'moment';

// Get Dashboard Overview
const getDashboardOverview = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Get accessible projects
    const accessibleProjects = await Project.find({
        $or: [
            { createdBy: userId },
            { 'members.user': userId }
        ]
    }).select('_id');

    const projectIds = accessibleProjects.map(p => p._id);

    // Get task statistics
    const taskStats = await Task.aggregate([
        {
            $match: {
                project: { $in: projectIds }
            }
        },
        {
            $group: {
                _id: null,
                backlogTasks: {
                    $sum: { $cond: [{ $eq: ["$status", "backlog"] }, 1, 0] }
                },
                inProgressTasks: {
                    $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] }
                },
                inReviewTasks: {
                    $sum: { $cond: [{ $eq: ["$status", "in_review"] }, 1, 0] }
                },
                completedTasks: {
                    $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] }
                },
                totalTasks: { $sum: 1 }
            }
        }
    ]);

    // Get priority distribution
    const priorityDistribution = await Task.aggregate([
        {
            $match: {
                project: { $in: projectIds }
            }
        },
        {
            $group: {
                _id: "$priority",
                count: { $sum: 1 }
            }
        }
    ]);

    // Get upcoming deadlines (next 7 days)
    const upcomingDeadlines = await Task.find({
        project: { $in: projectIds },
        dueDate: {
            $gte: new Date(),
            $lte: moment().add(7, 'days').toDate()
        },
        status: { $ne: "done" }
    })
    .sort({ dueDate: 1 })
    .limit(5)
    .populate('project', 'title');

    // Get team performance
    const teamPerformance = await Task.aggregate([
        {
            $match: {
                project: { $in: projectIds }
            }
        },
        {
            $unwind: "$assignees"
        },
        {
            $group: {
                _id: "$assignees.user",
                totalTasks: { $sum: 1 },
                completedTasks: {
                    $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] }
                }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "userInfo"
            }
        },
        {
            $project: {
                userId: "$_id",
                name: { $arrayElemAt: ["$userInfo.name", 0] },
                completionRate: {
                    $multiply: [
                        { $divide: ["$completedTasks", "$totalTasks"] },
                        100
                    ]
                }
            }
        }
    ]);

    const dashboardData = {
        taskStats: taskStats[0] || {
            backlogTasks: 0,
            inProgressTasks: 0,
            inReviewTasks: 0,
            completedTasks: 0,
            totalTasks: 0
        },
        priorityDistribution: priorityDistribution.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, { HIGH: 0, MEDIUM: 0, LOW: 0 }),
        upcomingDeadlines: upcomingDeadlines.map(task => ({
            _id: task._id,
            title: task.title,
            dueDate: task.dueDate,
            project: task.project.title
        })),
        teamPerformance: teamPerformance
    };

    res.status(200).json(
        new ApiResponse(200, dashboardData, "Dashboard data retrieved successfully")
    );
});

// Get Recent Activity
const getRecentActivity = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const accessibleProjects = await Project.find({
        $or: [
            { createdBy: userId },
            { 'members.user': userId }
        ]
    }).select('_id');

    const projectIds = accessibleProjects.map(p => p._id);

    // Get recent task updates
    const recentTasks = await Task.find({
        project: { $in: projectIds }
    })
    .sort({ updatedAt: -1 })
    .limit(10)
    .populate('assignees.user', 'name')
    .populate('project', 'title')
    .populate('createdBy', 'name');

    // Format activity feed
    const activityFeed = recentTasks.map(task => ({
        _id: task._id,
        type: 'task',
        title: task.title,
        project: task.project.title,
        status: task.status,
        updatedAt: task.updatedAt,
        createdBy: task.createdBy.name,
        assignees: task.assignees.map(a => a.user.name)
    }));

    res.status(200).json(
        new ApiResponse(200, activityFeed, "Recent activity retrieved successfully")
    );
});

// Get Project Overview
const getProjectOverview = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Get all accessible projects
    const projects = await Project.find({
        $or: [
            { createdBy: userId },
            { 'members.user': userId }
        ]
    })
    .populate('members.user', 'name email avatar')
    .populate('createdBy', 'name email')
    .sort({ updatedAt: -1 });

    // Get task counts and stats for each project
    const projectOverviews = await Promise.all(projects.map(async (project) => {
        // Get all tasks for the project
        const tasks = await Task.find({ project: project._id });
        
        // Calculate task statistics
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'done').length;
        const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
        const backlogTasks = tasks.filter(t => t.status === 'backlog').length;
        
        // Calculate progress percentage
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        // Format member data
        const formattedMembers = project.members.map(member => ({
            _id: member.user._id,
            name: member.user.name,
            email: member.user.email,
            avatar: member.user.avatar,
            role: member.role,
            joinedAt: moment(member.joinedAt).format('YYYY-MM-DD HH:mm:ss')
        }));

        return {
            _id: project._id,
            title: project.title,
            description: project.description,
            status: project.status,
            priority: project.priority,
            startDate: moment(project.startDate).format('YYYY-MM-DD'),
            endDate: project.endDate ? moment(project.endDate).format('YYYY-MM-DD') : null,
            progress: progress,
            members: formattedMembers,
            taskStats: {
                total: totalTasks,
                completed: completedTasks,
                inProgress: inProgressTasks,
                backlog: backlogTasks
            },
            createdAt: moment(project.createdAt).format('YYYY-MM-DD HH:mm:ss'),
            updatedAt: moment(project.updatedAt).format('YYYY-MM-DD HH:mm:ss')
        };
    }));

    res.status(200).json(
        new ApiResponse(200, projectOverviews, "Project overview retrieved successfully")
    );
});

// Get Task Completion Statistics
const getTaskCompletionStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Get all accessible projects
    const accessibleProjects = await Project.find({
        $or: [
            { createdBy: userId },
            { 'members.user': userId }
        ]
    }).select('_id');

    const projectIds = accessibleProjects.map(p => p._id);

    // Get all tasks from accessible projects
    const tasks = await Task.find({
        project: { $in: projectIds }
    });

    // Calculate task distribution
    const taskDistribution = {
        backlog: tasks.filter(t => t.status.toLowerCase() === 'backlog').length,
        todo: tasks.filter(t => t.status.toLowerCase() === 'todo').length,
        in_progress: tasks.filter(t => t.status.toLowerCase() === 'in_progress').length,
        in_review: tasks.filter(t => t.status.toLowerCase() === 'in_review').length,
        completed: tasks.filter(t => t.status.toLowerCase() === 'completed').length
    };

    // Calculate completion percentage
    const totalTasks = tasks.length;
    const completedTasks = taskDistribution.completed;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Format data for chart
    const formattedData = {
        totalTasks,
        completedTasks,
        completionPercentage,
        distribution: {
            labels: ['Backlog', 'To Do', 'In Progress', 'In Review', 'Completed'],
            data: [
                taskDistribution.backlog,
                taskDistribution.todo,
                taskDistribution.in_progress,
                taskDistribution.in_review,
                taskDistribution.completed
            ],
            colors: {
                background: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)'
                ],
                border: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ]
            }
        }
    };

    res.status(200).json(
        new ApiResponse(200, formattedData, "Task completion statistics retrieved successfully")
    );
});

export {
    getDashboardOverview,
    getRecentActivity,
    getProjectOverview,
    getTaskCompletionStats
}; 