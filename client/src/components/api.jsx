import axios from 'axios';

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
    }
};

export const taskService = {
    // Create task
    createTask: async (taskData) => {
        try {
            const response = await api.post('/tasks', taskData);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Add comment to task
    addTaskComment: async (taskId, commentData) => {
        try {
            const response = await api.post(`/tasks/${taskId}`, commentData);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Update task
    updateTask: async (taskId, taskData) => {
        try {
            const response = await api.put(`/tasks/${taskId}`, taskData);
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
            const { project, ...otherFilters } = filters;
            const queryParams = new URLSearchParams(otherFilters).toString();
            
            // Use the correct endpoint for project tasks
            const endpoint = project 
                ? `/tasks/project/${project}${queryParams ? `?${queryParams}` : ''}`
                : `/tasks${queryParams ? `?${queryParams}` : ''}`;
            
            const response = await api.get(endpoint);
            
            // Handle the correct response structure
            if (response.data && response.data.data && response.data.data.tasks) {
                return response.data.data.tasks;
            }
            
            // Fallback handling
            if (Array.isArray(response.data.data)) {
                return response.data.data;
            }
            
            return [];
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

    // Get my tasks (tasks assigned to logged-in user)
    getMyTasks: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await api.get(`/tasks/my-tasks${queryParams ? `?${queryParams}` : ''}`);
            
            // Handle the correct response structure
            if (response.data && response.data.data && response.data.data.tasks) {
                return {
                    tasks: response.data.data.tasks,
                    pagination: response.data.data.pagination
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

    // Get chat messages with a specific user
    getChatMessages: async (userId, page = 1, limit = 50) => {
        try {
            const response = await api.get(`/messages/${userId}`, {
                params: { page, limit }
            });
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Get recent chats
    getRecentChats: async () => {
        try {
            const response = await api.get('/messages/chats');
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    },

    // Mark messages as read
    markMessagesAsRead: async (userId) => {
        try {
            const response = await api.put(`/messages/${userId}/read`);
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
    getUnreadCount: async () => {
        try {
            const response = await api.get('/messages/unread/count');
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    }
};

export default api;