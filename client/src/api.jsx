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

export const dashboardService = {
    // Get dashboard overview
    getDashboardOverview: async () => {
        try {
            const response = await api.get('/dashboard/overview');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching dashboard overview:', error);
            throw error.response?.data?.message || error.message;
        }
    },

    // Get recent activity
    getRecentActivity: async () => {
        try {
            const response = await api.get('/dashboard/activity');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching recent activity:', error);
            throw error.response?.data?.message || error.message;
        }
    },

    // Get project overview
    getProjectOverview: async () => {
        try {
            const response = await api.get('/dashboard/projects');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching project overview:', error);
            throw error.response?.data?.message || error.message;
        }
    },

    // Get task completion stats
    getTaskCompletionStats: async () => {
        try {
            const response = await api.get('/dashboard/task-stats');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching task completion stats:', error);
            throw error.response?.data?.message || error.message;
        }
    }
};

export default api; 