import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { taskService, userService, projectService } from '../../../components/api';
import TaskDetailView from '../../../components/TaskDetailView';
import TaskFilters from '../../../components/tasks/TaskFilters';
import ProjectTasksView from '../../../components/tasks/views/ProjectTasksView';
import AllTasksView from '../../../components/tasks/views/AllTasksView';
import moment from 'moment';

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        search: '',
        assignedTo: '',
        dueDate: '',
        sortBy: 'dueDate',
        sortOrder: 'asc'
    });
    const [viewMode, setViewMode] = useState('board');
    const [viewType, setViewType] = useState('project');
    const [groupBy, setGroupBy] = useState('status');
    const [projectTasks, setProjectTasks] = useState([]);
    const [showTaskDetail, setShowTaskDetail] = useState(false);
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        project: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: '',
        estimatedTime: '',
        actualTime: 0,
        status: 'todo',
        subtasks: []
    });
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                await Promise.all([fetchMyTasks(), fetchUsers(), fetchProjects()]);
            } catch (err) {
                console.error('Initialization error:', err);
                setError(err.message || 'Failed to initialize');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [filters]);

    const fetchMyTasks = async () => {
        try {
            const response = await taskService.getMyTasks(filters);
            
            if (response && response.tasks) {
                if (viewType === 'project') {
                    // Group tasks by project
                    const tasksByProject = response.tasks.reduce((acc, task) => {
                        if (!acc[task.project._id]) {
                            acc[task.project._id] = {
                                _id: task.project._id,
                                projectTitle: task.project.title,
                                tasks: [],
                                taskCount: 0,
                                completedTasks: 0
                            };
                        }
                        acc[task.project._id].tasks.push(task);
                        acc[task.project._id].taskCount++;
                        if (task.status === 'done') {
                            acc[task.project._id].completedTasks++;
                        }
                        return acc;
                    }, {});

                    setProjectTasks(Object.values(tasksByProject));
                }
                setTasks(response.tasks);
                setError('');
            } else {
                setError('No tasks found');
                setProjectTasks([]);
                setTasks([]);
            }
        } catch (err) {
            console.error('Error fetching my tasks:', err);
            setError(err.message || 'Failed to fetch tasks');
            setProjectTasks([]);
            setTasks([]);
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

    const fetchProjects = async () => {
        try {
            const response = await projectService.getAccessibleProjectNames();
            setProjects(response || []);
        } catch (err) {
            console.error('Failed to fetch projects:', err);
            setProjects([]);
        }
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setShowTaskDetail(true);
    };

    const handleCompleteTask = async (taskId) => {
        try {
            await taskService.markTaskComplete(taskId);
            fetchMyTasks();
        } catch (err) {
            setError(err.message || 'Failed to complete task');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await taskService.deleteTask(taskId);
                fetchMyTasks();
            } catch (err) {
                setError(err.message || 'Failed to delete task');
            }
        }
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTaskForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAssigneeChange = (userId, checked) => {
        setTaskForm(prev => {
            const assignees = checked
                ? [...prev.assignees, { user: userId, role: 'responsible' }]
                : prev.assignees.filter(a => a.user !== userId);
            return { ...prev, assignees };
        });
    };

    const handleSubtaskAdd = () => {
        setTaskForm(prev => ({
            ...prev,
            subtasks: [...prev.subtasks, { title: '', status: 'todo', assignedTo: '' }]
        }));
    };

    const handleSubtaskChange = (index, field, value) => {
        setTaskForm(prev => ({
            ...prev,
            subtasks: prev.subtasks.map((subtask, i) => 
                i === index ? { ...subtask, [field]: value } : subtask
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = {
                title: taskForm.title,
                description: taskForm.description,
                project: taskForm.project || null,
                assignedTo: taskForm.assignedTo || null,
                priority: taskForm.priority,
                dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : null,
                estimatedTime: parseInt(taskForm.estimatedTime) || 0,
                actualTime: parseInt(taskForm.actualTime) || 0,
                status: taskForm.status,
                subtasks: taskForm.subtasks.map(subtask => ({
                    title: subtask.title,
                    status: subtask.status || 'todo',
                    assignedTo: subtask.assignedTo || null
                })).filter(subtask => subtask.title.trim() !== '')
            };

            if (selectedTask) {
                await taskService.updateTask(selectedTask._id, formData);
            } else {
                await taskService.createTask(formData);
            }
            
            setShowModal(false);
            setTaskForm({
                title: '',
                description: '',
                project: '',
                assignedTo: '',
                priority: 'medium',
                dueDate: '',
                estimatedTime: '',
                actualTime: 0,
                status: 'todo',
                subtasks: []
            });
            setSelectedTask(null);
            fetchMyTasks();
        } catch (err) {
            console.error('Error saving task:', err);
            setError(err.message || 'Failed to save task');
        }
    };

    const handleTaskEdit = (task) => {
        setSelectedTask(task);
        setTaskForm({
            title: task.title,
            description: task.description,
            project: task.project?._id || '',
            assignedTo: task.assignedTo?._id || task.assignedTo || '',
            priority: task.priority || 'medium',
            dueDate: task.dueDate ? moment(task.dueDate).format('YYYY-MM-DDTHH:mm') : '',
            estimatedTime: task.estimatedTime || '',
            actualTime: task.actualTime || 0,
            status: task.status || 'todo',
            subtasks: task.subtasks?.map(s => ({
                title: s.title,
                status: s.status || 'todo',
                assignedTo: s.assignedTo?._id || s.assignedTo || ''
            })) || []
        });
        setShowModal(true);
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
                    <h1 className="text-2xl font-bold text-gray-800">My Tasks</h1>
                    <p className="text-gray-500 mt-1">View and manage your assigned tasks</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setViewType('project')}
                            className={`p-2 rounded ${
                                viewType === 'project' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                            }`}
                        >
                            By Project
                        </button>
                        <button
                            onClick={() => setViewType('all')}
                            className={`p-2 rounded ${
                                viewType === 'all' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                            }`}
                        >
                            All Tasks
                        </button>
                    </div>
                    {viewType === 'all' && (
                        <div className="flex items-center space-x-2">
                            <select
                                value={groupBy}
                                onChange={(e) => setGroupBy(e.target.value)}
                                className="rounded-md border-gray-300"
                            >
                                <option value="status">Group by Status</option>
                                <option value="project">Group by Project</option>
                                <option value="none">No Grouping</option>
                            </select>
                        </div>
                    )}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setViewMode('board')}
                            className={`p-2 rounded ${
                                viewMode === 'board' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                            }`}
                        >
                            Board View
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${
                                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                            }`}
                        >
                            List View
                        </button>
                    </div>
                </div>
            </div>

            <TaskFilters
                filters={filters}
                users={users}
                onFilterChange={handleFilterChange}
            />

            {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {viewType === 'project' ? (
                <ProjectTasksView
                    projectTasks={projectTasks}
                    onTaskClick={handleTaskClick}
                    onTaskComplete={handleCompleteTask}
                    onTaskEdit={handleTaskEdit}
                    onTaskDelete={handleDeleteTask}
                />
            ) : (
                <AllTasksView
                    tasks={tasks}
                    viewMode={viewMode}
                    groupBy={groupBy}
                    onTaskClick={handleTaskClick}
                    onTaskComplete={handleCompleteTask}
                    onTaskEdit={handleTaskEdit}
                    onTaskDelete={handleDeleteTask}
                />
            )}

            {showTaskDetail && selectedTask && (
                <TaskDetailView
                    task={selectedTask}
                    onClose={() => {
                        setShowTaskDetail(false);
                        setSelectedTask(null);
                    }}
                />
            )}

            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {selectedTask ? 'Edit Task' : 'Create New Task'}
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
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={taskForm.title}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        name="status"
                                        value={taskForm.status}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="backlog">Backlog</option>
                                        <option value="todo">To Do</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="in_review">In Review</option>
                                        <option value="done">Done</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    value={taskForm.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                ></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                                    <select
                                        name="assignedTo"
                                        value={taskForm.assignedTo}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Select Assignee</option>
                                        {users.map(user => (
                                            <option key={user._id} value={user._id}>
                                                {user.name} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Project</label>
                                    <select
                                        name="project"
                                        value={taskForm.project}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Select Project</option>
                                        {projects.map(project => (
                                            <option key={project._id} value={project._id}>
                                                {project.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                                    <select
                                        name="priority"
                                        value={taskForm.priority}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                                    <input
                                        type="datetime-local"
                                        name="dueDate"
                                        value={taskForm.dueDate}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Estimated Time (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        name="estimatedTime"
                                        value={taskForm.estimatedTime}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Subtasks */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Subtasks</label>
                                    <button
                                        type="button"
                                        onClick={handleSubtaskAdd}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        + Add Subtask
                                    </button>
                                </div>
                                {taskForm.subtasks.map((subtask, index) => (
                                    <div key={index} className="grid grid-cols-3 gap-2 mt-2">
                                        <input
                                            type="text"
                                            value={subtask.title}
                                            onChange={(e) => handleSubtaskChange(index, 'title', e.target.value)}
                                            placeholder="Subtask title"
                                            className="col-span-2 rounded-md border-gray-300"
                                        />
                                        <select
                                            value={subtask.assignedTo}
                                            onChange={(e) => handleSubtaskChange(index, 'assignedTo', e.target.value)}
                                            className="rounded-md border-gray-300"
                                        >
                                            <option value="">Assign to</option>
                                            {users.map(user => (
                                                <option key={user._id} value={user._id}>
                                                    {user.name} ({user.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
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
                                    {selectedTask ? 'Update Task' : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyTasks; 