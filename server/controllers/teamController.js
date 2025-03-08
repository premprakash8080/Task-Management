import Team from '../models/Team.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Create Team
const createTeam = asyncHandler(async (req, res) => {
    const { name, description, department, maxMembers } = req.body;

    if (!name) {
        throw new ApiError(400, "Team name is required");
    }

    const team = await Team.create({
        name,
        description,
        department,
        createdBy: req.user._id,
        capacity: { maxMembers: maxMembers || 10 },
        members: [{
            user: req.user._id,
            role: 'lead',
            joinedAt: new Date()
        }]
    });

    // Update user's teams
    await User.findByIdAndUpdate(req.user._id, {
        $push: {
            teams: {
                team: team._id,
                role: 'lead',
                joinedAt: new Date()
            }
        }
    });

    res.status(201).json(
        new ApiResponse(201, team, "Team created successfully")
    );
});

// Get All Teams
const getAllTeams = asyncHandler(async (req, res) => {
    const { department, status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (department) query.department = department;
    if (status) query.status = status;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    const teams = await Team.find(query)
        .populate('members.user', 'name email')
        .populate('createdBy', 'name email')
        .populate('projects', 'title status')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const total = await Team.countDocuments(query);

    res.status(200).json(
        new ApiResponse(200, {
            teams,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        }, "Teams retrieved successfully")
    );
});

// Get Team by ID
const getTeamById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const team = await Team.findById(id)
        .populate('members.user', 'name email skills availability')
        .populate('createdBy', 'name email')
        .populate('projects', 'title status progress');

    if (!team) {
        throw new ApiError(404, "Team not found");
    }

    res.status(200).json(
        new ApiResponse(200, team, "Team retrieved successfully")
    );
});

// Update Team
const updateTeam = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const team = await Team.findById(id);
    if (!team) {
        throw new ApiError(404, "Team not found");
    }

    // Check if user is team lead or admin
    const isTeamLead = team.members.some(member => 
        member.user.toString() === req.user._id.toString() && member.role === 'lead'
    );
    
    if (!isTeamLead && req.user.role !== 'admin') {
        throw new ApiError(403, "Not authorized to update team");
    }

    const updatedTeam = await Team.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
    ).populate('members.user', 'name email');

    res.status(200).json(
        new ApiResponse(200, updatedTeam, "Team updated successfully")
    );
});

// Add Team Member
const addTeamMember = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { userId, role = 'member' } = req.body;

    const team = await Team.findById(id);
    if (!team) {
        throw new ApiError(404, "Team not found");
    }

    // Check if user is team lead or admin
    const isTeamLead = team.members.some(member => 
        member.user.toString() === req.user._id.toString() && member.role === 'lead'
    );
    
    if (!isTeamLead && req.user.role !== 'admin') {
        throw new ApiError(403, "Not authorized to add team members");
    }

    await team.addMember(userId, role);

    // Update user's teams
    await User.findByIdAndUpdate(userId, {
        $push: {
            teams: {
                team: team._id,
                role,
                joinedAt: new Date()
            }
        }
    });

    const updatedTeam = await Team.findById(id)
        .populate('members.user', 'name email');

    res.status(200).json(
        new ApiResponse(200, updatedTeam, "Team member added successfully")
    );
});

// Remove Team Member
const removeTeamMember = asyncHandler(async (req, res) => {
    const { id, userId } = req.params;

    const team = await Team.findById(id);
    if (!team) {
        throw new ApiError(404, "Team not found");
    }

    // Check if user is team lead or admin
    const isTeamLead = team.members.some(member => 
        member.user.toString() === req.user._id.toString() && member.role === 'lead'
    );
    
    if (!isTeamLead && req.user.role !== 'admin') {
        throw new ApiError(403, "Not authorized to remove team members");
    }

    await team.removeMember(userId);

    // Update user's teams
    await User.findByIdAndUpdate(userId, {
        $pull: {
            teams: { team: team._id }
        }
    });

    const updatedTeam = await Team.findById(id)
        .populate('members.user', 'name email');

    res.status(200).json(
        new ApiResponse(200, updatedTeam, "Team member removed successfully")
    );
});

// Get Team Metrics
const getTeamMetrics = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const team = await Team.findById(id);
    if (!team) {
        throw new ApiError(404, "Team not found");
    }

    await team.updateMetrics();

    res.status(200).json(
        new ApiResponse(200, team.metrics, "Team metrics retrieved successfully")
    );
});

// Schedule Team Meeting
const scheduleTeamMeeting = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, date, duration, attendees, recurring } = req.body;

    const team = await Team.findById(id);
    if (!team) {
        throw new ApiError(404, "Team not found");
    }

    // Check if user is team lead or admin
    const isTeamLead = team.members.some(member => 
        member.user.toString() === req.user._id.toString() && member.role === 'lead'
    );
    
    if (!isTeamLead && req.user.role !== 'admin') {
        throw new ApiError(403, "Not authorized to schedule team meetings");
    }

    team.meetings.push({
        title,
        description,
        date,
        duration,
        attendees,
        recurring
    });

    await team.save();

    res.status(200).json(
        new ApiResponse(200, team, "Team meeting scheduled successfully")
    );
});

export {
    createTeam,
    getAllTeams,
    getTeamById,
    updateTeam,
    addTeamMember,
    removeTeamMember,
    getTeamMetrics,
    scheduleTeamMeeting
}; 