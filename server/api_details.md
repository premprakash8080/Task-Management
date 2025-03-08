# Task Management API Documentation

## Base URL
```
{baseUrl}
```

## Authentication
All routes require authentication using Bearer token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## User Routes

### Authentication
| URL | Method | Data (Request Body) | Description |
|-----|--------|-------------------|-------------|
| `{baseUrl}/users/register` | POST | `{ username, email, name, lastName, password }` | Register a new user |
| `{baseUrl}/users/login` | POST | `{ email, password }` | Login user and get token |
| `{baseUrl}/users/profile` | GET | - | Get current user profile |
| `{baseUrl}/users/profile` | PUT | `{ name, lastName, email }` | Update user profile |
| `{baseUrl}/users/profile/password` | PUT | `{ currentPassword, newPassword }` | Change user password |
| `{baseUrl}/users/all` | GET | - | Get all users (admin only) |
| `{baseUrl}/users/:id` | DELETE | - | Delete user account |

## Task Routes

### Task Management
| URL | Method | Data (Request Body) | Description |
|-----|--------|-------------------|-------------|
| `{baseUrl}/tasks` | POST | `{ title, description, project, assignees, priority, dueDate, estimatedTime, status, category, labels, subtasks }` | Create a new task |
| `{baseUrl}/tasks` | GET | Query params: `project, status, priority, assignedTo, search, startDate, endDate, sortBy, sortOrder, page, limit` | Get all tasks with filters |
| `{baseUrl}/tasks/:id` | GET | - | Get task by ID |
| `{baseUrl}/tasks/:id` | PUT | `{ title, description, status, priority, dueDate, etc. }` | Update task |
| `{baseUrl}/tasks/:id` | DELETE | - | Delete task |
| `{baseUrl}/tasks/my-tasks` | GET | Query params: `status, priority, project, search, startDate, endDate, page, limit` | Get user's assigned tasks |
| `{baseUrl}/tasks/stats` | GET | Query params: `projectId` | Get task statistics |

### Task Dependencies
| URL | Method | Data (Request Body) | Description |
|-----|--------|-------------------|-------------|
| `{baseUrl}/tasks/:id/dependencies` | POST | `{ dependencyId, type }` | Add task dependency |
| `{baseUrl}/tasks/:id/dependencies/:dependencyId` | DELETE | - | Remove task dependency |

### Time Tracking
| URL | Method | Data (Request Body) | Description |
|-----|--------|-------------------|-------------|
| `{baseUrl}/tasks/:id/time-logs` | POST | `{ duration, description, startTime, endTime }` | Add time log to task |

### Task Status
| URL | Method | Data (Request Body) | Description |
|-----|--------|-------------------|-------------|
| `{baseUrl}/tasks/:id/complete` | PUT | `{ completionNotes }` | Mark task as complete |

### Comments
| URL | Method | Data (Request Body) | Description |
|-----|--------|-------------------|-------------|
| `{baseUrl}/tasks/:id/comments` | POST | `{ content }` | Add comment to task |

### Recurring Tasks
| URL | Method | Data (Request Body) | Description |
|-----|--------|-------------------|-------------|
| `{baseUrl}/tasks/:id/recurring` | POST | `{ frequency, customPattern, startDate, endDate }` | Set up recurring task |

### Custom Fields
| URL | Method | Data (Request Body) | Description |
|-----|--------|-------------------|-------------|
| `{baseUrl}/tasks/:id/custom-fields` | PUT | `{ customFields: [{ name, value, type, options }] }` | Update task custom fields |

### Batch Operations
| URL | Method | Data (Request Body) | Description |
|-----|--------|-------------------|-------------|
| `{baseUrl}/tasks/batch` | PUT | `{ taskIds: [], updates: {} }` | Update multiple tasks |

## Project Routes

### Project Management
| URL | Method | Data (Request Body) | Description |
|-----|--------|-------------------|-------------|
| `{baseUrl}/projects` | POST | `{ title, description, startDate, endDate, priority, tags }` | Create new project |
| `{baseUrl}/projects` | GET | Query params: `status, priority, search, page, limit` | Get all projects |
| `{baseUrl}/projects/:id` | GET | - | Get project by ID |
| `{baseUrl}/projects/:id` | PUT | `{ title, status, priority }` | Update project |
| `{baseUrl}/projects/:id/members` | POST | `{ userId, role }` | Add project member |
| `{baseUrl}/projects/:id/members/:userId` | DELETE | - | Remove project member |
| `{baseUrl}/projects/:id/stats` | GET | - | Get project statistics |

## Category Routes

### Category Management
| URL | Method | Data (Request Body) | Description |
|-----|--------|-------------------|-------------|
| `{baseUrl}/categories` | POST | `{ name, description, color, icon, projectId, isGlobal }` | Create category |
| `{baseUrl}/categories` | GET | Query params: `projectId` | Get categories |
| `{baseUrl}/categories/:id` | PUT | `{ name, description, color, icon }` | Update category |
| `{baseUrl}/categories/:id` | DELETE | - | Delete category |

## Label Routes

### Label Management
| URL | Method | Data (Request Body) | Description |
|-----|--------|-------------------|-------------|
| `{baseUrl}/labels` | POST | `{ name, color, description, projectId }` | Create label |
| `{baseUrl}/labels` | GET | Query params: `projectId` | Get labels |
| `{baseUrl}/labels/:id` | PUT | `{ name, color, description }` | Update label |
| `{baseUrl}/labels/:id` | DELETE | - | Delete label |

## Message Routes

### Messaging
| URL | Method | Data (Request Body) | Description |
|-----|--------|-------------------|-------------|
| `{baseUrl}/messages` | POST | `{ recipient, content, attachments }` | Send message |
| `{baseUrl}/messages/:userId` | GET | Query params: `page, limit` | Get chat messages |
| `{baseUrl}/messages/chats` | GET | - | Get recent chats |
| `{baseUrl}/messages/:userId/read` | PUT | - | Mark messages as read |
| `{baseUrl}/messages/unread/count` | GET | - | Get unread message count |

## Notification Routes

### Notifications
| URL | Method | Data (Request Body) | Description |
|-----|--------|-------------------|-------------|
| `{baseUrl}/notifications` | GET | Query params: `page, limit, isRead, isArchived` | Get notifications |
| `{baseUrl}/notifications/unread/count` | GET | - | Get unread notification count |
| `{baseUrl}/notifications/mark-all-read` | PUT | - | Mark all notifications as read |
| `{baseUrl}/notifications/:id/read` | PUT | - | Mark notification as read |
| `{baseUrl}/notifications/:id/archive` | PUT | - | Archive notification |
| `{baseUrl}/notifications/:id` | DELETE | - | Delete notification |

## Team Routes

### Team Management
| URL | Method | Data (Request Body) | Description |
|-----|--------|-------------------|-------------|
| `{baseUrl}/teams` | POST | `{ name, description, department, maxMembers }` | Create new team |
| `{baseUrl}/teams` | GET | Query params: `department, status, search, page, limit` | Get all teams |
| `{baseUrl}/teams/:id` | GET | - | Get team by ID |
| `{baseUrl}/teams/:id` | PUT | `{ name, description, department, status }` | Update team |

### Team Members
| URL | Method | Data (Request Body) | Description |
|-----|--------|-------------------|-------------|
| `{baseUrl}/teams/:id/members` | POST | `{ userId, role }` | Add team member |
| `{baseUrl}/teams/:id/members/:userId` | DELETE | - | Remove team member |

### Team Metrics & Meetings
| URL | Method | Data (Request Body) | Description |
|-----|--------|-------------------|-------------|
| `{baseUrl}/teams/:id/metrics` | GET | - | Get team metrics |
| `{baseUrl}/teams/:id/meetings` | POST | `{ title, description, date, duration, attendees, recurring }` | Schedule team meeting |

## User Management

### User Preferences
| URL | Method | Data (Request Body) | Description |
|-----|--------|-------------------|-------------|
| `{baseUrl}/users/preferences` | GET | - | Get user preferences |
| `{baseUrl}/users/preferences` | PUT | `{ theme, notifications, dashboard, timezone, language }` | Update user preferences |

### User Activity
| URL | Method | Data (Request Body) | Description |
|-----|--------|-------------------|-------------|
| `{baseUrl}/users/activity` | GET | Query params: `startDate, endDate, page, limit` | Get user activity log |
| `{baseUrl}/users/availability` | GET | - | Get user availability |
| `{baseUrl}/users/availability` | PUT | `{ schedule, vacations }` | Update user availability |

### Skills & Expertise
| URL | Method | Data (Request Body) | Description |
|-----|--------|-------------------|-------------|
| `{baseUrl}/users/skills` | GET | - | Get user skills |
| `{baseUrl}/users/skills` | PUT | `{ skills: [{ name, level }] }` | Update user skills |

## Response Format
All API responses follow this format:
```json
{
    "success": true/false,
    "data": {}, // Response data
    "message": "Success/Error message"
}
```

## Error Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Response Examples

### Team Creation Response
```json
{
    "success": true,
    "data": {
        "id": "team_id",
        "name": "Development Team",
        "description": "Main development team",
        "department": "Engineering",
        "members": [{
            "user": {
                "id": "user_id",
                "name": "John Doe",
                "email": "john@example.com"
            },
            "role": "lead"
        }],
        "metrics": {
            "completedTasks": 0,
            "ongoingTasks": 0,
            "averageTaskCompletion": 0
        }
    },
    "message": "Team created successfully"
}
```

### User Preferences Response
```json
{
    "success": true,
    "data": {
        "theme": "dark",
        "notifications": {
            "email": {
                "enabled": true,
                "frequency": "daily"
            },
            "push": {
                "enabled": true,
                "types": {
                    "taskAssigned": true,
                    "taskUpdated": true
                }
            }
        },
        "dashboard": {
            "layout": "comfortable",
            "widgets": [
                {
                    "type": "tasks",
                    "position": 1,
                    "enabled": true
                }
            ]
        },
        "timezone": "UTC",
        "language": "en"
    },
    "message": "Preferences retrieved successfully"
}
```
