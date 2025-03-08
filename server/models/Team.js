import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['member', 'lead'],
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        permissions: [{
            resource: String,
            actions: [String]
        }]
    }],
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    department: {
        type: String,
        trim: true
    },
    skills: [{
        name: String,
        level: {
            type: Number,
            min: 1,
            max: 5
        }
    }],
    capacity: {
        maxMembers: {
            type: Number,
            default: 10
        },
        currentLoad: {
            type: Number,
            default: 0
        }
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'archived'],
        default: 'active'
    },
    metrics: {
        completedTasks: {
            type: Number,
            default: 0
        },
        ongoingTasks: {
            type: Number,
            default: 0
        },
        averageTaskCompletion: {
            type: Number,
            default: 0
        }
    },
    meetings: [{
        title: String,
        description: String,
        date: Date,
        duration: Number, // in minutes
        attendees: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        recurring: {
            isRecurring: Boolean,
            frequency: {
                type: String,
                enum: ['daily', 'weekly', 'monthly']
            }
        }
    }]
}, {
    timestamps: true
});

// Indexes for better query performance
teamSchema.index({ name: 1 });
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ department: 1 });
teamSchema.index({ status: 1 });

// Methods
teamSchema.methods.updateMetrics = async function() {
    const tasks = await mongoose.model('Task').find({
        'assignees.user': { $in: this.members.map(m => m.user) }
    });

    this.metrics = {
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        ongoingTasks: tasks.filter(t => t.status === 'in_progress').length,
        averageTaskCompletion: tasks.length > 0 
            ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 
            : 0
    };

    await this.save();
};

teamSchema.methods.addMember = async function(userId, role = 'member') {
    if (this.members.length >= this.capacity.maxMembers) {
        throw new Error('Team has reached maximum capacity');
    }

    if (!this.members.find(m => m.user.toString() === userId.toString())) {
        this.members.push({
            user: userId,
            role,
            joinedAt: new Date()
        });
        await this.save();
    }
};

teamSchema.methods.removeMember = async function(userId) {
    this.members = this.members.filter(m => m.user.toString() !== userId.toString());
    await this.save();
};

const Team = mongoose.model('Team', teamSchema);
export default Team; 