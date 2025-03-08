import React, { useState, useEffect, useCallback, memo } from 'react';
import { userService } from '../../components/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faUserPlus } from '@fortawesome/free-solid-svg-icons';

// Memoized Modal component to prevent unnecessary re-renders
const Modal = memo(({ show, onClose, title, children }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ×
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
});

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        name: '',
        lastName: '',
        password: '',
        currentPassword: '',
        newPassword: ''
    });

    const checkUserAccess = useCallback(async () => {
        try {
            setLoading(true);
            const response = await userService.getProfile();
            const role = response.role;
            
            setUserRole(role);
            await fetchUsers();
        } catch (err) {
            console.error('Error checking user access:', err);
            setError('Failed to verify user permissions');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            const data = await userService.getAllUsers();
            setUsers(Array.isArray(data) ? data : []);
            setError('');
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.message || 'Failed to load users');
            setUsers([]);
        }
    }, []);

    useEffect(() => {
        checkUserAccess();
    }, [checkUserAccess]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const resetForm = useCallback(() => {
        setFormData({
            username: '',
            email: '',
            name: '',
            lastName: '',
            password: '',
            currentPassword: '',
            newPassword: ''
        });
    }, []);

    const handleRegister = useCallback(async (e) => {
        e.preventDefault();
        try {
            await userService.register({
                username: formData.username,
                email: formData.email,
                name: formData.name,
                lastName: formData.lastName,
                password: formData.password
            });
            setShowModal(false);
            resetForm();
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    }, [formData, fetchUsers, resetForm]);

    const handleUpdateProfile = useCallback(async (e) => {
        e.preventDefault();
        try {
            await userService.updateProfile({
                name: formData.name,
                lastName: formData.lastName,
                email: formData.email
            });
            setShowModal(false);
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    }, [formData, fetchUsers]);

    const handleChangePassword = useCallback(async (e) => {
        e.preventDefault();
        try {
            await userService.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            setShowModal(false);
            setError('Password updated successfully');
        } catch (err) {
            setError(err.message);
        }
    }, [formData]);

    const handleDelete = useCallback(async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await userService.deleteUser(userId);
                fetchUsers();
            } catch (err) {
                setError(err.message);
            }
        }
    }, [fetchUsers]);

    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        resetForm();
    }, [resetForm]);

    const handleEditUser = useCallback((user) => {
        setSelectedUser(user);
        setFormData({
            ...formData,
            name: user.name,
            lastName: user.lastName,
            email: user.email
        });
        setShowModal(true);
    }, [formData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error && (error.includes('Access denied') || error.includes('verify user permissions'))) {
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-500 p-4 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Team Members</h1>
                {(userRole === 'admin' || userRole === 'manager') && (
                    <button
                        onClick={() => {
                            setSelectedUser(null);
                            resetForm();
                            setShowModal(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                        Add Member
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            {(userRole === 'admin' || userRole === 'manager') && (
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.name} {user.lastName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.role}
                                </td>
                                {(userRole === 'admin' || userRole === 'manager') && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => handleEditUser(user)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user._id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                show={showModal}
                onClose={handleCloseModal}
                title={selectedUser ? 'Edit User' : 'Add New User'}
            >
                <form onSubmit={selectedUser ? handleUpdateProfile : handleRegister}>
                    {!selectedUser && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    )}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    {!selectedUser && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    )}
                    <div className="flex justify-end mt-6">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="mr-4 px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            {selectedUser ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Users; 