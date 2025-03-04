import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import moment from 'moment';

// Get calendar overview with upcoming events and deadlines
export const getCalendarOverview = async (req, res) => {
    try {
        const userId = req.user.id;
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

        res.json({
            upcomingTasks,
            projectDeadlines
        });
    } catch (error) {
        console.error('Error in getCalendarOverview:', error);
        res.status(500).json({ message: 'Error fetching calendar overview' });
    }
};

// Get calendar events for a specific date range
export const getCalendarEvents = async (req, res) => {
    try {
        const userId = req.user.id;
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

        res.json(events);
    } catch (error) {
        console.error('Error in getCalendarEvents:', error);
        res.status(500).json({ message: 'Error fetching calendar events' });
    }
};

// Create a new calendar event (task)
export const createCalendarEvent = async (req, res) => {
    try {
        const { title, description, dueDate, projectId, priority } = req.body;
        const userId = req.user.id;

        const task = new Task({
            title,
            description,
            dueDate,
            project: projectId,
            priority,
            createdBy: userId,
            assignees: [{ user: userId }]
        });

        await task.save();

        res.status(201).json(task);
    } catch (error) {
        console.error('Error in createCalendarEvent:', error);
        res.status(500).json({ message: 'Error creating calendar event' });
    }
};

// Update a calendar event
export const updateCalendarEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, dueDate, projectId, priority, status } = req.body;
        const userId = req.user.id;

        const task = await Task.findOne({
            _id: id,
            $or: [
                { assignees: { $elemMatch: { user: userId } } },
                { createdBy: userId }
            ]
        });

        if (!task) {
            return res.status(404).json({ message: 'Event not found' });
        }

        task.title = title || task.title;
        task.description = description || task.description;
        task.dueDate = dueDate || task.dueDate;
        task.project = projectId || task.project;
        task.priority = priority || task.priority;
        task.status = status || task.status;

        await task.save();

        res.json(task);
    } catch (error) {
        console.error('Error in updateCalendarEvent:', error);
        res.status(500).json({ message: 'Error updating calendar event' });
    }
};

// Delete a calendar event
export const deleteCalendarEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const task = await Task.findOneAndDelete({
            _id: id,
            $or: [
                { assignees: { $elemMatch: { user: userId } } },
                { createdBy: userId }
            ]
        });

        if (!task) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error in deleteCalendarEvent:', error);
        res.status(500).json({ message: 'Error deleting calendar event' });
    }
};

export {
    getCalendarOverview,
    getCalendarEvents,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent
}; 