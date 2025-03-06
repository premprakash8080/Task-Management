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
    faUserPlus,
    faTags,
    faList,
    faComments,
    faUser,
    faEye
} from '@fortawesome/free-solid-svg-icons';
import { projectService, userService, categoryService, taskService } from '../../components/api';
import LabelManager from '../../components/LabelManager';
import moment from 'moment';

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

    const [categories, setCategories] = useState([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        description: '',
        color: '#000000',
        icon: '',
        isGlobal: false,
        projectId: ''
    });

    const [showLabelManager, setShowLabelManager] = useState(false);

    const [projectTasks, setProjectTasks] = useState({});
    const [selectedTask, setSelectedTask] = useState(null);
    const [showTaskDetail, setShowTaskDetail] = useState(false);

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
                await Promise.all([fetchProjects(), fetchUsers()]);
                await fetchCategories();
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
            setLoading(true);
            const data = await projectService.getProjectById(projectId);
            setSelectedProject(data);
            setProjectForm({
                title: data.title,
                description: data.description,
                startDate: data.startDate ? moment(data.startDate).format('YYYY-MM-DD') : '',
                endDate: data.endDate ? moment(data.endDate).format('YYYY-MM-DD') : '',
                priority: data.priority,
                tags: data.tags || []
            });
            await fetchProjectTasks(projectId);
            setError('');
        } catch (err) {
            console.error('Error fetching project details:', err);
            setError(err.message || 'Failed to fetch project details');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async (projectId = null) => {
        try {
            const data = await categoryService.getCategories(projectId);
            setCategories(data);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            setError(err.message || 'Failed to fetch categories');
        }
    };

    const fetchProjectTasks = async (projectId) => {
        try {
            const response = await taskService.getTasks({ project: projectId });
            setProjectTasks(prev => ({
                ...prev,
                [projectId]: response.tasks
            }));
        } catch (err) {
            console.error('Error fetching project tasks:', err);
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

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedCategory) {
                await categoryService.updateCategory(selectedCategory._id, categoryForm);
            } else {
                await categoryService.createCategory(categoryForm);
            }
            setShowCategoryModal(false);
            setCategoryForm({
                name: '',
                description: '',
                color: '#000000',
                icon: '',
                isGlobal: false,
                projectId: ''
            });
            await fetchCategories(selectedProject?._id);
        } catch (err) {
            setError(err.message || 'Failed to save category');
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await categoryService.deleteCategory(categoryId);
                await fetchCategories(selectedProject?._id);
            } catch (err) {
                setError(err.message || 'Failed to delete category');
            }
        }
    };

    const handleTaskClick = (task) => {
        navigate(`/dashboard/tasks/detail/${task._id}`);
    };

    const ProjectTaskList = ({ project }) => {
        const tasks = projectTasks[project._id] || [];
        
        return (
            <div className="mt-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium">Tasks</h3>
                    <Link
                        to={`/dashboard/tasks?project=${project._id}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        View All Tasks
                    </Link>
                </div>
                <div className="space-y-2">
                    {tasks.slice(0, 5).map(task => (
                        <div
                            key={task._id}
                            onClick={() => handleTaskClick(task)}
                            className="bg-white p-3 rounded-lg shadow-sm hover:shadow cursor-pointer transition-all duration-200"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium">{task.title}</h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {task.description.substring(0, 100)}
                                        {task.description.length > 100 ? '...' : ''}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                        task.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                        {task.priority}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        task.status === 'done' ? 'bg-green-100 text-green-800' :
                                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {task.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-3">
                                <div className="flex -space-x-2">
                                    {task.assignees.map(assignee => (
                                        <img
                                            key={`${task._id}-assignee-${assignee.user._id}`}
                                            src={assignee.user.profilePhoto || '/default-avatar.png'}
                                            alt={assignee.user.name}
                                            className="w-6 h-6 rounded-full border-2 border-white"
                                            title={assignee.user.name}
                                        />
                                    ))}
                                </div>
                                {task.dueDate && (
                                    <span className="text-sm text-gray-500">
                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                    {tasks.length > 5 && (
                        <div className="text-center mt-2">
                            <Link
                                to={`/dashboard/tasks?project=${project._id}`}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                View {tasks.length - 5} more tasks
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const categoryModal = (
        showCategoryModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            {selectedCategory ? 'Edit Category' : 'Create New Category'}
                        </h3>
                        <button 
                            onClick={() => setShowCategoryModal(false)}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            ×
                        </button>
                    </div>
                    <form onSubmit={handleCategorySubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category Name</label>
                            <input
                                type="text"
                                value={categoryForm.name}
                                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                value={categoryForm.description}
                                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                rows="3"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Color</label>
                            <input
                                type="color"
                                value={categoryForm.color}
                                onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Icon (FontAwesome class)</label>
                            <input
                                type="text"
                                value={categoryForm.icon}
                                onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="fa-tag"
                            />
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isGlobal"
                                checked={categoryForm.isGlobal}
                                onChange={(e) => setCategoryForm(prev => ({ ...prev, isGlobal: e.target.checked }))}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="isGlobal" className="ml-2 block text-sm text-gray-700">
                                Global Category
                            </label>
                        </div>
                        {!categoryForm.isGlobal && selectedProject && (
                            <input
                                type="hidden"
                                value={selectedProject._id}
                                onChange={(e) => setCategoryForm(prev => ({ ...prev, projectId: e.target.value }))}
                            />
                        )}
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowCategoryModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                            >
                                {selectedCategory ? 'Update Category' : 'Create Category'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    );

    const categoryButton = (
        <button
            onClick={() => {
                setSelectedCategory(null);
                setCategoryForm({
                    name: '',
                    description: '',
                    color: '#000000',
                    icon: '',
                    isGlobal: false,
                    projectId: selectedProject?._id || ''
                });
                setShowCategoryModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
            <FontAwesomeIcon icon={faTags} className="mr-2" />
            Manage Categories
        </button>
    );

    const labelManagerModal = (
        showLabelManager && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            Manage Labels
                        </h3>
                        <button 
                            onClick={() => setShowLabelManager(false)}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            ×
                        </button>
                    </div>
                    <LabelManager 
                        projectId={selectedProject?._id} 
                        onLabelSelect={(label) => {
                            // Handle label selection if needed
                            console.log('Selected label:', label);
                        }}
                    />
                </div>
            </div>
        )
    );

    const labelButton = selectedProject && (
        <button
            onClick={() => setShowLabelManager(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
            <FontAwesomeIcon icon={faList} className="mr-2" />
            Manage Labels
        </button>
    );

    const categoriesSection = (project) => (
        <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Categories</h4>
            <div className="flex flex-wrap gap-2">
                {categories
                    .filter(cat => cat.isGlobal || cat.projectId === project._id)
                    .map(category => (
                        <span
                            key={`${project._id}-category-${category._id}`}
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: category.color + '20', color: category.color }}
                        >
                            {category.icon && <FontAwesomeIcon icon={category.icon} className="mr-1" />}
                            {category.name}
                        </span>
                    ))
                }
            </div>
        </div>
    );

    const projectModal = (
        showModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
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
                        <div className="grid grid-cols-2 gap-4">
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
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tags</label>
                            <input
                                type="text"
                                name="tags"
                                value={projectForm.tags.join(', ')}
                                onChange={handleInputChange}
                                placeholder="Enter tags separated by commas"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        {selectedProject && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Team Members</label>
                                <div className="space-y-2">
                                    {selectedProject.members.map(member => (
                                        <div key={`${selectedProject._id}-member-${member.user._id}`} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                            <div className="flex items-center">
                                                <span className="font-medium">{member.user.name}</span>
                                                <span className="text-sm text-gray-500 ml-2">({member.role})</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMember(member.user._id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setShowMemberModal(true)}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                                        Add Member
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 pt-4">
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
        )
    );

    const projectCard = (project) => {
        if (!project) return null;

        return (
            <div key={project._id} className="bg-white rounded-lg shadow-sm p-6 mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                        <p className="text-gray-600 mt-1">{project.description}</p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => {
                                navigate(`/dashboard/projects/${project._id}`);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Details"
                        >
                            <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                            onClick={() => {
                                navigate(`/dashboard/chat?projectId=${project._id}&projectTitle=${encodeURIComponent(project.title)}`);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="Team Chat"
                        >
                            <FontAwesomeIcon icon={faComments} />
                        </button>
                        <button
                            onClick={() => {
                                setSelectedProject(project);
                                setProjectForm({
                                    title: project.title,
                                    description: project.description,
                                    startDate: project.startDate ? moment(project.startDate).format('YYYY-MM-DD') : '',
                                    endDate: project.endDate ? moment(project.endDate).format('YYYY-MM-DD') : '',
                                    priority: project.priority,
                                    tags: project.tags || []
                                });
                                setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit Project"
                        >
                            <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                            onClick={() => handleDelete(project._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Project"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </div>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                    {project.tags && project.tags.map((tag, index) => (
                        <span
                            key={`${project._id}-tag-${index}-${tag}`}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="mt-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>
                            {project.startDate ? moment(project.startDate).format('MMM DD, YYYY') : 'No start date'} - 
                            {project.endDate ? moment(project.endDate).format('MMM DD, YYYY') : 'Ongoing'}
                        </span>
                    </div>
                </div>

                <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Team Members</h4>
                    <div className="flex flex-wrap gap-2">
                        {project.members && project.members.map(member => (
                            <span
                                key={`${project._id}-member-${member.user._id}`}
                                className="px-2 py-1 bg-gray-100 rounded-full text-sm flex items-center"
                            >
                                <FontAwesomeIcon icon={faUser} className="mr-1" />
                                {member.user.name}
                            </span>
                        ))}
                    </div>
                </div>

                <ProjectTaskList project={project} />
            </div>
        );
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
                    <p className="text-gray-500 mt-1">Manage and track your projects</p>
                </div>
                <div className="flex space-x-4">
                    {categoryButton}
                    {labelButton}
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
                    <div key={project._id}>
                        {projectCard(project)}
                    </div>
                ))}
            </div>

            {projectModal}
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

            {categoryModal}
            {labelManagerModal}

            {showTaskDetail && selectedTask && (
                <TaskDetailView
                    task={selectedTask}
                    onClose={() => {
                        setShowTaskDetail(false);
                        setSelectedTask(null);
                    }}
                />
            )}
        </div>
    );
};

export default Projects; 