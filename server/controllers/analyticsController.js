import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
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
                ],
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
                },
                inProgress: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0]
                    }
                }
            }
        }
    ]);

    // Get project statistics
    const projectStats = await Project.aggregate([
        {
            $match: {
                $or: [
                    { members: userId },
                    { createdBy: userId }
                ]
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                active: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $lt: ['$startDate', today.toDate()] },
                                    { $gt: ['$endDate', today.toDate()] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ]);

    res.status(200).json(
        new ApiResponse(200, {
            tasks: taskStats[0] || { total: 0, completed: 0, inProgress: 0 },
            projects: projectStats[0] || { total: 0, active: 0 }
        }, "Analytics overview retrieved successfully")
    );
});

// Get Task Analytics
const getTaskAnalytics = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        throw new ApiError(400, "Start date and end date are required");
    }

    const start = moment(startDate).startOf('day');
    const end = moment(endDate).endOf('day');

    // Get task trends
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
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    status: '$status'
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.date': 1 } }
    ]);

    // Get priority distribution
    const priorityDistribution = await Task.aggregate([
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

    const projectProgress = await Project.aggregate([
        {
            $match: {
                $or: [
                    { members: userId },
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
    const thirtyDaysAgo = moment().subtract(30, 'days').startOf('day');

    // Get task completion rate
    const taskCompletionRate = await Task.aggregate([
        {
            $match: {
                $or: [
                    { 'assignees.user': userId },
                    { createdBy: userId }
                ],
                createdAt: { $gte: thirtyDaysAgo.toDate() }
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

    // Get daily activity
    const dailyActivity = await Task.aggregate([
        {
            $match: {
                $or: [
                    { 'assignees.user': userId },
                    { createdBy: userId }
                ],
                updatedAt: { $gte: thirtyDaysAgo.toDate() }
            }
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.date': 1 } }
    ]);

    res.status(200).json(
        new ApiResponse(200, {
            taskCompletionRate: taskCompletionRate[0] || { total: 0, completed: 0 },
            dailyActivity
        }, "User engagement metrics retrieved successfully")
    );
});

// Get Custom Analytics
const getCustomAnalytics = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate, metrics } = req.query;

    if (!startDate || !endDate || !metrics) {
        throw new ApiError(400, "Start date, end date, and metrics are required");
    }

    const start = moment(startDate).startOf('day');
    const end = moment(endDate).endOf('day');
    const result = {};

    if (metrics.includes('taskDistribution')) {
        result.taskDistribution = await Task.aggregate([
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
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
    }

    if (metrics.includes('projectProgress')) {
        result.projectProgress = await Project.aggregate([
            {
                $match: {
                    $or: [
                        { members: userId },
                        { createdBy: userId }
                    ],
                    startDate: { $lte: end.toDate() },
                    endDate: { $gte: start.toDate() }
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
                    progress: {
                        $multiply: [
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
                            100
                        ]
                    }
                }
            }
        ]);
    }

    res.status(200).json(
        new ApiResponse(200, result, "Custom analytics retrieved successfully")
    );
});

export {
    getAnalyticsOverview,
    getTaskAnalytics,
    getProjectAnalytics,
    getUserEngagement,
    getCustomAnalytics
}; 