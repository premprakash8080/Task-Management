import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { taskService, userService } from '../../../components/api';
import TaskDetailView from '../../../components/TaskDetailView';
import TaskFilters from '../../../components/tasks/TaskFilters';
import ProjectTasksView from '../../../components/tasks/views/ProjectTasksView';
import AllTasksView from '../../../components/tasks/views/AllTasksView';

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

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                await Promise.all([fetchMyTasks(), fetchUsers()]);
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
                    onTaskEdit={(task) => {
                        setSelectedTask(task);
                        setShowModal(true);
                    }}
                    onTaskDelete={handleDeleteTask}
                />
            ) : (
                <AllTasksView
                    tasks={tasks}
                    viewMode={viewMode}
                    groupBy={groupBy}
                    onTaskClick={handleTaskClick}
                    onTaskComplete={handleCompleteTask}
                    onTaskEdit={(task) => {
                        setSelectedTask(task);
                        setShowModal(true);
                    }}
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
        </div>
    );
};

export default MyTasks; 