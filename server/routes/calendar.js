import express from 'express';
import { auth } from '../middleware/auth.js';
import {
    getCalendarEvents,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    getCalendarOverview
} from '../controllers/calendarController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Calendar routes
router.get('/', getCalendarOverview);
router.get('/events', getCalendarEvents);
router.post('/event', createCalendarEvent);
router.put('/event/:id', updateCalendarEvent);
router.delete('/event/:id', deleteCalendarEvent);

export default router; 