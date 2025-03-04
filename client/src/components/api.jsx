import axios from 'axios';
import moment from 'moment';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add interceptor to add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const userService = {
    // Register user
    register: async (userData) => {
        try {
            const response = await api.post('/users/register', userData);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Login user
    login: async (email, password) => {
        try {
            const response = await api.post('/users/login', {
                email,
                password
            });
            const { data } = response.data;
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }
            return data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Update user profile
    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/users/profile', profileData);
            const { data } = response.data;
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }
            return data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Change password
    changePassword: async (passwordData) => {
        try {
            const response = await api.put('/users/profile', passwordData);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Get user profile
    getProfile: async () => {
        try {
            const response = await api.get('/users/profile');
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Get all users
    getAllUsers: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authorization token not found');
        }
        try {
            const response = await api.get('/users/all', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            
            // Check if response has error structure
            if (response.data && response.data.success === false) {
                throw new Error(response.data.message || 'Failed to fetch users');
            }
            
            // Handle different response structures
            const userData = response.data.data || response.data;
            return Array.isArray(userData) ? userData : [];
        } catch (error) {
            if (error.response?.status === 403) {
                throw new Error('Not authorized to access users data. Please check your permissions.');
            } else if (error.response?.status === 500) {
                throw new Error('Server error occurred. Please try again later.');
            }
            throw new Error(error.response?.data?.message || error.message || 'Failed to fetch users');
        }
    },

    // Delete user
    deleteUser: async (userId) => {
        try {
            const response = await api.delete(`/users/${userId}`);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

export const projectService = {
    // Create project
    createProject: async (projectData) => {
        try {
            const response = await api.post('/projects', projectData);
            return response.data.data || response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Add project member
    addProjectMember: async (projectId, memberData) => {
        try {
            const response = await api.post(`/projects/${projectId}/members`, memberData);
            return response.data.data || response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Remove project member
    removeProjectMember: async (projectId, memberId) => {
        try {
            const response = await api.delete(`/projects/${projectId}/members/${memberId}`);
            return response.data.data || response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Update project
    updateProject: async (projectId, projectData) => {
        try {
            const response = await api.put(`/projects/${projectId}`, projectData);
            return response.data.data || response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Get all projects with filters
    getAllProjects: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await api.get(`/projects${queryParams ? `?${queryParams}` : ''}`);
            
            // Handle the correct response structure
            if (response.data && response.data.data && response.data.data.projects) {
                return response.data.data.projects;
            }
            
            // Fallback handling
            if (Array.isArray(response.data.data)) {
                return response.data.data;
            }
            
            return [];
        } catch (error) {
            console.error('Error fetching projects:', error);
            return []; // Return empty array on error to prevent mapping errors
        }
    },

    // Get project by ID
    getProjectById: async (projectId) => {
        try {
            const response = await api.get(`/projects/${projectId}`);
            return response.data.data || response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Get project stats
    getProjectStats: async (projectId) => {
        try {
            const response = await api.get(`/projects/${projectId}/stats`);
            return response.data.data || response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Delete project
    deleteProject: async (projectId) => {
        try {
            const response = await api.delete(`/projects/${projectId}`);
            return response.data.data || response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Get accessible project names
    getAccessibleProjectNames: async () => {
        try {
            const response = await api.get('/projects/names');
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching project names:', error);
            return [];
        }
    }
};

export const taskService = {
    // Create task
    createTask: async (taskData) => {
        try {
            // Validate and format subtasks
            const formattedSubtasks = taskData.subtasks?.map(subtask => ({
                title: subtask.title || '',  // Ensure title is never undefined
                description: subtask.description || '',
                status: subtask.status || 'TODO',
                dueDate: subtask.dueDate ? moment(subtask.dueDate).format('YYYY-MM-DD') : null,
                assignedTo: subtask.assignedTo || null,
                estimatedTime: subtask.estimatedTime || 0
            })).filter(subtask => subtask.title.trim() !== ''); // Remove subtasks with empty titles

            // Format dates and handle empty assignees before sending
            const formattedData = {
                ...taskData,
                dueDate: taskData.dueDate ? moment(taskData.dueDate).format('YYYY-MM-DD') : null,
                subtasks: formattedSubtasks
            };

            const response = await api.post('/tasks', formattedData);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Add comment to task
    addTaskComment: async (taskId, commentData) => {
        try {
            const response = await api.post(`/tasks/${taskId}/comments`, commentData);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Update task
    updateTask: async (taskId, taskData) => {
        try {
            // Validate and format subtasks
            const formattedSubtasks = taskData.subtasks?.map(subtask => ({
                title: subtask.title || '',  // Ensure title is never undefined
                description: subtask.description || '',
                status: subtask.status || 'TODO',
                dueDate: subtask.dueDate ? moment(subtask.dueDate).format('YYYY-MM-DD') : null,
                assignedTo: subtask.assignedTo || null,
                estimatedTime: subtask.estimatedTime || 0
            })).filter(subtask => subtask.title.trim() !== ''); // Remove subtasks with empty titles

            // Format dates and handle empty assignees before sending
            const formattedData = {
                ...taskData,
                dueDate: taskData.dueDate ? moment(taskData.dueDate).format('YYYY-MM-DD') : null,
                subtasks: formattedSubtasks
            };

            const response = await api.put(`/tasks/${taskId}`, formattedData);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Delete task
    deleteTask: async (taskId) => {
        try {
            const response = await api.delete(`/tasks/${taskId}`);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Get tasks by project
    getTasks: async (filters = {}) => {
        try {
            const { project, startDate, endDate, ...otherFilters } = filters;
            
            // Remove empty values and format dates
            const formattedFilters = Object.entries({
                ...otherFilters,
                startDate: startDate && startDate !== 'undefined' ? moment(startDate).format('YYYY-MM-DD') : undefined,
                endDate: endDate && endDate !== 'undefined' ? moment(endDate).format('YYYY-MM-DD') : undefined
            }).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    acc[key] = value;
                }
                return acc;
            }, {});
            
            // Use the project-specific endpoint if project ID is provided
            const endpoint = project 
                ? `/tasks/project/${project}`
                : '/tasks';
            
            const queryParams = new URLSearchParams(formattedFilters).toString();
            const response = await api.get(`${endpoint}${queryParams ? `?${queryParams}` : ''}`);
            
            if (response.data && response.data.data) {
                return {
                    tasks: response.data.data.tasks || [],
                    pagination: response.data.data.pagination || {
                        total: response.data.data.tasks?.length || 0,
                        page: 1,
                        pages: 1
                    }
                };
            }
            
            return {
                tasks: [],
                pagination: {
                    total: 0,
                    page: 1,
                    pages: 1
                }
            };
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw error.response?.data?.message || error.message;
        }
    },

    // Get task by ID
    getTaskById: async (taskId) => {
        try {
            const response = await api.get(`/tasks/${taskId}`);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Get my tasks
    getMyTasks: async (filters = {}) => {
        try {
            const { startDate, endDate, dueDate, ...otherFilters } = filters;
            
            // Remove empty string values and format dates
            const formattedFilters = Object.entries(otherFilters).reduce((acc, [key, value]) => {
                if (value !== '' && value !== undefined && value !== null) {
                    acc[key] = value;
                }
                return acc;
            }, {});

            // Add formatted dates if they exist
            if (startDate && startDate !== 'undefined') {
                formattedFilters.startDate = moment(startDate).format('YYYY-MM-DD');
            }
            if (endDate && endDate !== 'undefined') {
                formattedFilters.endDate = moment(endDate).format('YYYY-MM-DD');
            }
            if (dueDate && dueDate !== 'undefined') {
                formattedFilters.dueDate = moment(dueDate).format('YYYY-MM-DD');
            }
            
            const queryParams = new URLSearchParams(formattedFilters).toString();
            const response = await api.get(`/tasks/my-tasks${queryParams ? `?${queryParams}` : ''}`);
            
            if (response.data && response.data.data) {
                return {
                    tasks: response.data.data.tasks || [],
                    pagination: response.data.data.pagination || {
                        total: 0,
                        page: 1,
                        pages: 1
                    }
                };
            }
            
            return {
                tasks: [],
                pagination: {
                    total: 0,
                    page: 1,
                    pages: 1
                }
            };
        } catch (error) {
            console.error('Error fetching my tasks:', error);
            throw error.response?.data?.message || error.message;
        }
    },

    // Get accessible projects with tasks
    getAccessibleProjectsWithTasks: async (filters = {}) => {
        try {
            const { status, priority, search, page = 1, limit = 10 } = filters;
            
            // Remove empty values
            const formattedFilters = Object.entries({
                status,
                priority,
                search,
                page,
                limit
            }).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    acc[key] = value;
                }
                return acc;
            }, {});
            
            const queryParams = new URLSearchParams(formattedFilters).toString();
            const response = await api.get(`/tasks/projects-with-tasks${queryParams ? `?${queryParams}` : ''}`);
            
            if (response.data && response.data.data) {
                return {
                    projects: response.data.data.projects || [],
                    pagination: response.data.data.pagination || {
                        total: 0,
                        page: 1,
                        pages: 1
                    }
                };
            }
            
            return {
                projects: [],
                pagination: {
                    total: 0,
                    page: 1,
                    pages: 1
                }
            };
        } catch (error) {
            console.error('Error fetching accessible projects with tasks:', error);
            throw error.response?.data?.message || error.message;
        }
    }
};

export const messageService = {
    // Send a new message
    sendMessage: async (messageData) => {
        try {
            const response = await api.post('/messages', messageData);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Get chat messages with a specific user or project
    getChatMessages: async (userId = null, projectId = null, page = 1, limit = 50) => {
        try {
            const endpoint = userId 
                ? `/messages/user/${userId}`
                : `/messages/project/${projectId}`;
            
            const response = await api.get(endpoint, {
                params: { page, limit }
            });

            // Transform messages to include proper user data
            const messages = response.data.data.messages.map(message => ({
                ...message,
                sender: message.sender || { _id: message.sender, name: 'Unknown' },
                recipient: message.recipient || null
            }));

            return {
                ...response.data.data,
                messages
            };
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Get recent chats
    getRecentChats: async (projectId = null) => {
        try {
            const response = await api.get('/messages/chats', {
                params: { projectId }
            });

            // Transform chat data to ensure consistent structure
            const chats = response.data.data.map(chat => ({
                ...chat,
                user: chat.user || { _id: chat._id, name: 'Unknown' },
                lastMessage: chat.lastMessage || { content: 'No messages yet', createdAt: new Date() }
            }));

            return chats;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Mark messages as read
    markMessagesAsRead: async (userId = null, projectId = null) => {
        try {
            const endpoint = userId 
                ? `/messages/user/${userId}/read`
                : `/messages/project/${projectId}/read`;
            
            const response = await api.put(endpoint);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Delete a message
    deleteMessage: async (messageId) => {
        try {
            const response = await api.delete(`/messages/${messageId}`);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Get unread message count
    getUnreadCount: async (projectId = null) => {
        try {
            const response = await api.get('/messages/unread/count', {
                params: { projectId }
            });
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    }
};

export const categoryService = {
    // Create a new category
    createCategory: async (categoryData) => {
        try {
            const response = await api.post('/categories', categoryData);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Get categories (all or project-specific)
    getCategories: async (projectId = null) => {
        try {
            const url = projectId 
                ? `/categories?projectId=${projectId}`
                : '/categories';
            
            const response = await api.get(url);
            
            // Handle the correct response structure
            if (response.data && response.data.data) {
                return response.data.data;
            }
            
            return [];
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error.response?.data?.message || error.message;
        }
    },

    // Update a category
    updateCategory: async (categoryId, updateData) => {
        try {
            const response = await api.put(`/categories/${categoryId}`, updateData);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Delete a category
    deleteCategory: async (categoryId) => {
        try {
            const response = await api.delete(`/categories/${categoryId}`);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    }
};

export const labelService = {
    // Create a new label
    createLabel: async (labelData) => {
        try {
            const response = await api.post('/labels', labelData);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Get labels for a project
    getLabels: async (projectId) => {
        try {
            const response = await api.get('/labels', {
                params: { projectId }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching labels:', error);
            throw error.response?.data?.message || error.message;
        }
    },

    // Update a label
    updateLabel: async (labelId, updateData) => {
        try {
            const response = await api.put(`/labels/${labelId}`, updateData);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Delete a label
    deleteLabel: async (labelId) => {
        try {
            const response = await api.delete(`/labels/${labelId}`);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    }
};

export const notificationService = {
    // Get user's notifications with filters
    getNotifications: async (filters = {}) => {
        try {
            const response = await api.get('/notifications', { params: filters });
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Mark a notification as read
    markAsRead: async (notificationId) => {
        try {
            const response = await api.put(`/notifications/${notificationId}/read`);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        try {
            const response = await api.put('/notifications/mark-all-read');
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Archive a notification
    archiveNotification: async (notificationId) => {
        try {
            const response = await api.put(`/notifications/${notificationId}/archive`);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Delete a notification
    deleteNotification: async (notificationId) => {
        try {
            const response = await api.delete(`/notifications/${notificationId}`);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Get unread notification count
    getUnreadCount: async () => {
        try {
            const response = await api.get('/notifications/unread/count');
            return response.data.data.count;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    }
};

export const calendarService = {
    // Get calendar overview
    getCalendarOverview: async () => {
        try {
            const response = await api.get('/calendar');
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Get calendar events
    getCalendarEvents: async (startDate, endDate, view = 'month') => {
        try {
            const response = await api.get('/calendar/events', {
                params: { startDate, endDate, view }
            });
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Create calendar event
    createCalendarEvent: async (eventData) => {
        try {
            const response = await api.post('/calendar/event', eventData);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Update calendar event
    updateCalendarEvent: async (eventId, eventData) => {
        try {
            const response = await api.put(`/calendar/event/${eventId}`, eventData);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Delete calendar event
    deleteCalendarEvent: async (eventId) => {
        try {
            const response = await api.delete(`/calendar/event/${eventId}`);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    }
};

export const analyticsService = {
    // Get analytics overview
    getAnalyticsOverview: async () => {
        try {
            const response = await api.get('/analytics');
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Get task analytics
    getTaskAnalytics: async (startDate, endDate) => {
        try {
            const response = await api.get('/analytics/tasks', {
                params: { startDate, endDate }
            });
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Get project analytics
    getProjectAnalytics: async () => {
        try {
            const response = await api.get('/analytics/projects');
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Get user engagement metrics
    getUserEngagement: async () => {
        try {
            const response = await api.get('/analytics/user-engagement');
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Get custom analytics
    getCustomAnalytics: async (startDate, endDate, metrics = []) => {
        try {
            const response = await api.get('/analytics/custom', {
                params: { startDate, endDate, metrics }
            });
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    }
};

export default api;