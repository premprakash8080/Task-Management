import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import moment from 'moment';

// Get Analytics Overview
const getAnalyticsOverview = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const today = moment().startOf('day');
    const startOfMonth = moment().startOf('month');

    // Get task statistics
    const taskStats = await Task.aggregate([
        {
            $match: {
                $or: [
                    { 'assignees.user': userId },
                    { createdBy: userId }
                ]
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    // Get project statistics
    const projectStats = await Project.aggregate([
        {
            $match: {
                $or: [
                    { 'members.user': userId },
                    { createdBy: userId }
                ]
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    // Get recent activity
    const recentActivity = await Task.find({
        $or: [
            { 'assignees.user': userId },
            { createdBy: userId }
        ],
        updatedAt: { $gte: startOfMonth.toDate() }
    })
    .sort('-updatedAt')
    .limit(10)
    .populate('project', 'title');

    res.status(200).json(
        new ApiResponse(200, {
            taskStats,
            projectStats,
            recentActivity
        }, "Analytics overview retrieved successfully")
    );
});

// Get Task Analytics
const getTaskAnalytics = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;
    const start = startDate ? moment(startDate).startOf('day') : moment().subtract(30, 'days').startOf('day');
    const end = endDate ? moment(endDate).endOf('day') : moment().endOf('day');

    // Get task completion trends
    const taskTrends = await Task.aggregate([
        {
            $match: {
                $or: [
                    { 'assignees.user': userId },
                    { createdBy: userId }
                ],
                createdAt: {
                    $gte: start.toDate(),
                    $lte: end.toDate()
                }
            }
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    status: "$status"
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { "_id.date": 1 }
        }
    ]);

    // Get task distribution by priority
    const priorityDistribution = await Task.aggregate([
        {
            $match: {
                $or: [
                    { 'assignees.user': userId },
                    { createdBy: userId }
                ]
            }
        },
        {
            $group: {
                _id: '$priority',
                count: { $sum: 1 }
            }
        }
    ]);

    res.status(200).json(
        new ApiResponse(200, {
            taskTrends,
            priorityDistribution
        }, "Task analytics retrieved successfully")
    );
});

// Get Project Analytics
const getProjectAnalytics = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Get project progress statistics
    const projectProgress = await Project.aggregate([
        {
            $match: {
                $or: [
                    { 'members.user': userId },
                    { createdBy: userId }
                ]
            }
        },
        {
            $lookup: {
                from: 'tasks',
                localField: '_id',
                foreignField: 'project',
                as: 'tasks'
            }
        },
        {
            $project: {
                title: 1,
                status: 1,
                totalTasks: { $size: '$tasks' },
                completedTasks: {
                    $size: {
                        $filter: {
                            input: '$tasks',
                            as: 'task',
                            cond: { $eq: ['$$task.status', 'COMPLETED'] }
                        }
                    }
                }
            }
        }
    ]);

    res.status(200).json(
        new ApiResponse(200, {
            projectProgress
        }, "Project analytics retrieved successfully")
    );
});

// Get User Engagement
const getUserEngagement = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const startOfMonth = moment().startOf('month');

    // Get task completion rate
    const taskCompletionRate = await Task.aggregate([
        {
            $match: {
                'assignees.user': userId,
                createdAt: { $gte: startOfMonth.toDate() }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                completed: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0]
                    }
                }
            }
        }
    ]);

    // Get contribution to projects
    const projectContributions = await Project.aggregate([
        {
            $match: {
                'members.user': userId
            }
        },
        {
            $lookup: {
                from: 'tasks',
                localField: '_id',
                foreignField: 'project',
                as: 'tasks'
            }
        },
        {
            $project: {
                title: 1,
                contributionCount: {
                    $size: {
                        $filter: {
                            input: '$tasks',
                            as: 'task',
                            cond: {
                                $or: [
                                    { $eq: ['$$task.createdBy', userId] },
                                    {
                                        $in: [userId, '$$task.assignees.user']
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        }
    ]);

    res.status(200).json(
        new ApiResponse(200, {
            taskCompletionRate: taskCompletionRate[0] || { total: 0, completed: 0 },
            projectContributions
        }, "User engagement metrics retrieved successfully")
    );
});

// Get Custom Analytics
const getCustomAnalytics = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate, metrics = [] } = req.query;
    const start = moment(startDate).startOf('day');
    const end = moment(endDate).endOf('day');

    const analyticsData = {};

    // Process requested metrics
    if (metrics.includes('taskProgress')) {
        analyticsData.taskProgress = await Task.aggregate([
            {
                $match: {
                    $or: [
                        { 'assignees.user': userId },
                        { createdBy: userId }
                    ],
                    createdAt: {
                        $gte: start.toDate(),
                        $lte: end.toDate()
                    }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        status: "$status"
                    },
                    count: { $sum: 1 }
                }
            }
        ]);
    }

    if (metrics.includes('projectHealth')) {
        analyticsData.projectHealth = await Project.aggregate([
            {
                $match: {
                    $or: [
                        { 'members.user': userId },
                        { createdBy: userId }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'tasks',
                    localField: '_id',
                    foreignField: 'project',
                    as: 'tasks'
                }
            },
            {
                $project: {
                    title: 1,
                    health: {
                        $cond: {
                            if: { $eq: [{ $size: '$tasks' }, 0] },
                            then: 'NO_TASKS',
                            else: {
                                $switch: {
                                    branches: [
                                        {
                                            case: {
                                                $gte: [
                                                    {
                                                        $divide: [
                                                            {
                                                                $size: {
                                                                    $filter: {
                                                                        input: '$tasks',
                                                                        as: 'task',
                                                                        cond: { $eq: ['$$task.status', 'COMPLETED'] }
                                                                    }
                                                                }
                                                            },
                                                            { $size: '$tasks' }
                                                        ]
                                                    },
                                                    0.7
                                                ]
                                            },
                                            then: 'HEALTHY'
                                        },
                                        {
                                            case: {
                                                $gte: [
                                                    {
                                                        $divide: [
                                                            {
                                                                $size: {
                                                                    $filter: {
                                                                        input: '$tasks',
                                                                        as: 'task',
                                                                        cond: { $eq: ['$$task.status', 'COMPLETED'] }
                                                                    }
                                                                }
                                                            },
                                                            { $size: '$tasks' }
                                                        ]
                                                    },
                                                    0.3
                                                ]
                                            },
                                            then: 'AT_RISK'
                                        }
                                    ],
                                    default: 'CRITICAL'
                                }
                            }
                        }
                    }
                }
            }
        ]);
    }

    res.status(200).json(
        new ApiResponse(200, analyticsData, "Custom analytics retrieved successfully")
    );
});

export {
    getAnalyticsOverview,
    getTaskAnalytics,
    getProjectAnalytics,
    getUserEngagement,
    getCustomAnalytics
}; 