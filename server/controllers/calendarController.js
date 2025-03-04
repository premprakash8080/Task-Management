import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import moment from 'moment';

// Get calendar overview with upcoming events and deadlines
const getCalendarOverview = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const today = moment().startOf('day');
    const endOfWeek = moment().endOf('week');

    // Get upcoming tasks
    const upcomingTasks = await Task.find({
        $or: [
            { assignees: { $elemMatch: { user: userId } } },
            { createdBy: userId }
        ],
        dueDate: {
            $gte: today.toDate(),
            $lte: endOfWeek.toDate()
        }
    }).populate('project', 'title');

    // Get project deadlines
    const projectDeadlines = await Project.find({
        $or: [
            { members: userId },
            { createdBy: userId }
        ],
        endDate: {
            $gte: today.toDate(),
            $lte: endOfWeek.toDate()
        }
    });

    res.status(200).json(
        new ApiResponse(200, {
            upcomingTasks,
            projectDeadlines
        }, "Calendar overview retrieved successfully")
    );
});

// Get calendar events for a specific date range
const getCalendarEvents = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    const start = moment(startDate).startOf('day');
    const end = moment(endDate).endOf('day');

    // Get tasks within date range
    const tasks = await Task.find({
        $or: [
            { assignees: { $elemMatch: { user: userId } } },
            { createdBy: userId }
        ],
        dueDate: {
            $gte: start.toDate(),
            $lte: end.toDate()
        }
    }).populate('project', 'title');

    // Get projects within date range
    const projects = await Project.find({
        $or: [
            { members: userId },
            { createdBy: userId }
        ],
        $or: [
            {
                startDate: { $gte: start.toDate(), $lte: end.toDate() }
            },
            {
                endDate: { $gte: start.toDate(), $lte: end.toDate() }
            }
        ]
    });

    // Format events for calendar
    const events = [
        ...tasks.map(task => ({
            id: task._id,
            title: task.title,
            start: task.dueDate,
            type: 'task',
            project: task.project?.title || 'No Project',
            priority: task.priority,
            status: task.status
        })),
        ...projects.map(project => ({
            id: project._id,
            title: project.title,
            start: project.startDate,
            end: project.endDate,
            type: 'project',
            progress: project.progress || 0
        }))
    ];

    res.status(200).json(
        new ApiResponse(200, events, "Calendar events retrieved successfully")
    );
});

// Create a new calendar event (task)
const createCalendarEvent = asyncHandler(async (req, res) => {
    const { title, description, dueDate, projectId, priority } = req.body;
    const userId = req.user._id;

    if (!title || !dueDate) {
        throw new ApiError(400, "Title and due date are required");
    }

    const task = await Task.create({
        title,
        description,
        dueDate,
        project: projectId,
        priority,
        createdBy: userId,
        assignees: [{ user: userId }]
    });

    res.status(201).json(
        new ApiResponse(201, task, "Calendar event created successfully")
    );
});

// Update a calendar event
const updateCalendarEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, dueDate, projectId, priority, status } = req.body;
    const userId = req.user._id;

    const task = await Task.findOne({
        _id: id,
        $or: [
            { assignees: { $elemMatch: { user: userId } } },
            { createdBy: userId }
        ]
    });

    if (!task) {
        throw new ApiError(404, "Event not found");
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.dueDate = dueDate || task.dueDate;
    task.project = projectId || task.project;
    task.priority = priority || task.priority;
    task.status = status || task.status;

    const updatedTask = await task.save();

    res.status(200).json(
        new ApiResponse(200, updatedTask, "Calendar event updated successfully")
    );
});

// Delete a calendar event
const deleteCalendarEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const task = await Task.findOneAndDelete({
        _id: id,
        $or: [
            { assignees: { $elemMatch: { user: userId } } },
            { createdBy: userId }
        ]
    });

    if (!task) {
        throw new ApiError(404, "Event not found");
    }

    res.status(200).json(
        new ApiResponse(200, null, "Calendar event deleted successfully")
    );
});

export {
    getCalendarOverview,
    getCalendarEvents,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent
}; 