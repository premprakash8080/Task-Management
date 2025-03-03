import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { taskService, userService } from '../../../components/api';
import TaskDetailView from '../../../components/TaskDetailView';
import TaskFilters from '../../../components/tasks/TaskFilters';
import AllTasksView from '../../../components/tasks/views/AllTasksView';

const AllTasks = () => {
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
        sortOrder: 'asc',
        page: 1
    });
    const [viewMode, setViewMode] = useState('board');
    const [groupBy, setGroupBy] = useState('status');
    const [showTaskDetail, setShowTaskDetail] = useState(false);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        pages: 1
    });

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                await Promise.all([fetchTasks(), fetchUsers()]);
            } catch (err) {
                console.error('Initialization error:', err);
                setError(err.message || 'Failed to initialize');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [filters, pagination.page]);

    const fetchTasks = async () => {
        try {
            const response = await taskService.getTasks({
                ...filters,
                page: pagination.page
            });
            
            if (response && response.tasks) {
                setTasks(response.tasks);
                setPagination(response.pagination || {
                    total: response.tasks.length,
                    page: 1,
                    pages: 1
                });
                setError('');
            } else {
                setError('No tasks found');
                setTasks([]);
                setPagination({
                    total: 0,
                    page: 1,
                    pages: 1
                });
            }
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError(err.message || 'Failed to fetch tasks');
            setTasks([]);
            setPagination({
                total: 0,
                page: 1,
                pages: 1
            });
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
            fetchTasks();
        } catch (err) {
            setError(err.message || 'Failed to complete task');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await taskService.deleteTask(taskId);
                fetchTasks();
            } catch (err) {
                setError(err.message || 'Failed to delete task');
            }
        }
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
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
                    <h1 className="text-2xl font-bold text-gray-800">All Tasks</h1>
                    <p className="text-gray-500 mt-1">
                        Total Tasks: {tasks.length} • 
                        Completed: {tasks.filter(t => t.status === 'done').length} •
                        In Progress: {tasks.filter(t => t.status === 'in_progress').length}
                    </p>
                </div>
                <div className="flex items-center space-x-4">
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
                    <button
                        onClick={() => {
                            setSelectedTask(null);
                            setShowModal(true);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        New Task
                    </button>
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

            {showTaskDetail && selectedTask && (
                <TaskDetailView
                    task={selectedTask}
                    onClose={() => {
                        setShowTaskDetail(false);
                        setSelectedTask(null);
                    }}
                />
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex justify-center mt-6">
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    page === pagination.page
                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </nav>
                </div>
            )}
        </div>
    );
};

export default AllTasks; 