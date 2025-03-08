import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const Schema = mongoose.Schema;
const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'team_lead', 'project_manager', 'admin'],
        default: 'user'
    },
    // New fields for enhanced user management
    teams: [{
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team'
        },
        role: {
            type: String,
            enum: ['member', 'lead'],
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    permissions: [{
        resource: String,
        actions: [String] // e.g., ['create', 'read', 'update', 'delete']
    }],
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'system'
        },
        notifications: {
            email: {
                enabled: { type: Boolean, default: true },
                frequency: { type: String, enum: ['instant', 'daily', 'weekly'], default: 'instant' }
            },
            push: {
                enabled: { type: Boolean, default: true },
                types: {
                    taskAssigned: { type: Boolean, default: true },
                    taskUpdated: { type: Boolean, default: true },
                    taskCommented: { type: Boolean, default: true },
                    projectUpdated: { type: Boolean, default: true },
                    teamUpdated: { type: Boolean, default: true }
                }
            }
        },
        dashboard: {
            layout: {
                type: String,
                enum: ['compact', 'comfortable', 'detailed'],
                default: 'comfortable'
            },
            widgets: [{
                type: String,
                position: Number,
                enabled: Boolean
            }]
        },
        timezone: {
            type: String,
            default: 'UTC'
        },
        language: {
            type: String,
            default: 'en'
        }
    },
    activityLog: [{
        action: String,
        resource: String,
        resourceId: mongoose.Schema.Types.ObjectId,
        timestamp: {
            type: Date,
            default: Date.now
        },
        details: mongoose.Schema.Types.Mixed
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    lastActive: Date,
    skills: [{
        name: String,
        level: {
            type: Number,
            min: 1,
            max: 5
        }
    }],
    availability: {
        schedule: [{
            day: {
                type: String,
                enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            },
            hours: [{
                start: String,
                end: String
            }]
        }],
        vacations: [{
            startDate: Date,
            endDate: Date,
            type: {
                type: String,
                enum: ['vacation', 'sick_leave', 'personal']
            }
        }]
    },
    public: {
        type: Boolean,
    },
    profilePhoto: {
        type: String,
        default: 'default.jpg'
    },
    notifications: [{
        message: String,
        isRead: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],
    createdDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
UserSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Activity logging method
UserSchema.methods.logActivity = async function(action, resource, resourceId, details = {}) {
    this.activityLog.push({
        action,
        resource,
        resourceId,
        details,
        timestamp: new Date()
    });
    await this.save();
};

// Update last active timestamp
UserSchema.methods.updateLastActive = async function() {
    this.lastActive = new Date();
    await this.save();
};

const User = mongoose.model('User', UserSchema);
export default User;