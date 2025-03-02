import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faUsers, 
    faTasks,
    faCalendarAlt,
    faTag,
    faEdit,
    faTrash,
    faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import { projectService, userService } from '../../components/api';

const Projects = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        search: '',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        pages: 1
    });

    const [projectForm, setProjectForm] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        priority: 'medium',
        tags: []
    });

    const [memberForm, setMemberForm] = useState({
        userId: '',
        role: 'member'
    });

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                // Check if user is authenticated
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                await fetchProjects();
                await fetchUsers();
            } catch (err) {
                console.error('Initialization error:', err);
                setError(err.message || 'Failed to initialize');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [filters]);

    useEffect(() => {
        if (projectId) {
            fetchProjectDetails();
        }
    }, [projectId]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await projectService.getAllProjects(filters);
            if (Array.isArray(data)) {
                setProjects(data);
                setError('');
            } else {
                setError('Invalid data format received');
                setProjects([]);
            }
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError(err.message || 'Failed to fetch projects');
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await userService.getAllUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setUsers([]);
        }
    };

    const fetchProjectDetails = async () => {
        try {
            const data = await projectService.getProjectById(projectId);
            setSelectedProject(data);
            setProjectForm({
                title: data.title,
                description: data.description,
                startDate: data.startDate,
                endDate: data.endDate,
                priority: data.priority,
                tags: data.tags || []
            });
        } catch (err) {
            setError(err.message || 'Failed to fetch project details');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'tags') {
            setProjectForm(prev => ({
                ...prev,
                tags: value.split(',').map(tag => tag.trim())
            }));
        } else {
            setProjectForm(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
            page: 1
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedProject) {
                await projectService.updateProject(selectedProject._id, projectForm);
            } else {
                await projectService.createProject(projectForm);
            }
            setShowModal(false);
            setProjectForm({
                title: '',
                description: '',
                startDate: '',
                endDate: '',
                priority: 'medium',
                tags: []
            });
            fetchProjects();
        } catch (err) {
            setError(err.message || 'Failed to save project');
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            await projectService.addProjectMember(selectedProject._id, memberForm);
            setShowMemberModal(false);
            setMemberForm({ userId: '', role: 'member' });
            fetchProjectDetails();
        } catch (err) {
            setError(err.message || 'Failed to add member');
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (window.confirm('Are you sure you want to remove this member?')) {
            try {
                await projectService.removeProjectMember(selectedProject._id, memberId);
                fetchProjectDetails();
            } catch (err) {
                setError(err.message || 'Failed to remove member');
            }
        }
    };

    const handleDelete = async (projectId) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await projectService.deleteProject(projectId);
                fetchProjects();
            } catch (err) {
                setError(err.message || 'Failed to delete project');
            }
        }
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
                    <p className="text-gray-500 mt-1">Manage and track your projects</p>
                </div>
                <div className="flex space-x-4">
                    {selectedProject && (
                        <button
                            onClick={() => setShowMemberModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                        >
                            <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                            Add Member
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setSelectedProject(null);
                            setProjectForm({
                                title: '',
                                description: '',
                                startDate: '',
                                endDate: '',
                                priority: 'medium',
                                tags: []
                            });
                            setShowModal(true);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        New Project
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 grid grid-cols-4 gap-4">
                <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="rounded-md border-gray-300"
                >
                    <option value="">All Status</option>
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
                <select
                    name="priority"
                    value={filters.priority}
                    onChange={handleFilterChange}
                    className="rounded-md border-gray-300"
                >
                    <option value="">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
                <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search projects..."
                    className="rounded-md border-gray-300"
                />
            </div>

            {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                    <div key={project._id} className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">{project.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {project.status}
                                </span>
                                <span className={`mt-2 px-2 py-1 rounded-full text-xs font-semibold ${
                                    project.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    project.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                    {project.priority}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2 mt-2">
                                {project.tags?.map((tag, index) => (
                                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs flex items-center">
                                        <FontAwesomeIcon icon={faTag} className="mr-1" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                                {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <FontAwesomeIcon icon={faUsers} className="mr-2" />
                                {project.members?.length || 0} members
                            </div>
                        </div>

                        <div className="mt-4 flex justify-between items-center">
                            <Link
                                to={`/dashboard/projects/${project._id}/tasks`}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                <FontAwesomeIcon icon={faTasks} className="mr-1" />
                                View Tasks
                            </Link>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        setSelectedProject(project);
                                        setProjectForm({
                                            title: project.title,
                                            description: project.description,
                                            startDate: project.startDate,
                                            endDate: project.endDate,
                                            priority: project.priority,
                                            tags: project.tags || []
                                        });
                                        setShowModal(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button
                                    onClick={() => handleDelete(project._id)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Project Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {selectedProject ? 'Edit Project' : 'Create New Project'}
                            </h3>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Project Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={projectForm.title}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    value={projectForm.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={projectForm.startDate}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={projectForm.endDate}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Priority</label>
                                <select
                                    name="priority"
                                    value={projectForm.priority}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={projectForm.tags.join(', ')}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="development, web, etc."
                                />
                            </div>
                            <div className="flex justify-end space-x-3 mt-5">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                                >
                                    {selectedProject ? 'Update Project' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Member Modal */}
            {showMemberModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Add Project Member</h3>
                            <button 
                                onClick={() => setShowMemberModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleAddMember} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Select User</label>
                                <select
                                    name="userId"
                                    value={memberForm.userId}
                                    onChange={(e) => setMemberForm(prev => ({ ...prev, userId: e.target.value }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select a user</option>
                                    {users.map(user => (
                                        <option key={user._id} value={user._id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select
                                    name="role"
                                    value={memberForm.role}
                                    onChange={(e) => setMemberForm(prev => ({ ...prev, role: e.target.value }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowMemberModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                                >
                                    Add Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects; 