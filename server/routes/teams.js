import express from 'express';
import { auth } from '../middleware/auth.js';
import {
    createTeam,
    getAllTeams,
    getTeamById,
    updateTeam,
    addTeamMember,
    removeTeamMember,
    getTeamMetrics,
    scheduleTeamMeeting
} from '../controllers/teamController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Team CRUD operations
router.route('/')
    .post(createTeam)
    .get(getAllTeams);

router.route('/:id')
    .get(getTeamById)
    .put(updateTeam);

// Team member management
router.route('/:id/members')
    .post(addTeamMember);

router.route('/:id/members/:userId')
    .delete(removeTeamMember);

// Team metrics
router.route('/:id/metrics')
    .get(getTeamMetrics);

// Team meetings
router.route('/:id/meetings')
    .post(scheduleTeamMeeting);

export default router; 