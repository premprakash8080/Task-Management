import api from '../components/api';

const userService = {
    // Get user profile
    getProfile: async () => {
        try {
            const response = await api.get('/users/profile');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get all users (admin/manager only)
    getAllUsers: async () => {
        try {
            const response = await api.get('/users');
            return response.data.data || [];
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Login user
    login: async (credentials) => {
        try {
            const response = await api.post('/users/login', credentials);
            const { token, user } = response.data.data;
            if (token) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Register new user
    register: async (userData) => {
        try {
            const response = await api.post('/users/register', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Update user profile
    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/users/profile', profileData);
            const { user } = response.data.data;
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Change password
    changePassword: async (passwordData) => {
        try {
            const response = await api.put('/users/profile', passwordData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Delete user (admin only)
    deleteUser: async (userId) => {
        try {
            const response = await api.delete(`/users/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        return !!token;
    },

    // Get current user role
    getCurrentUserRole: () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.role || null;
    },

    // Logout user
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
};

export default userService; 