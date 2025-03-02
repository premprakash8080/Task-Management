import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faComment, 
    faClock,
    faCheckCircle,
    faPaperclip,
    faUserCircle
} from '@fortawesome/free-solid-svg-icons';
import { taskService, userService } from '../../components/api';

const Tasks = () => {
    const { projectId } = useParams();
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        pages: 1
    });

    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        project: projectId,
        assignedTo: '',
        priority: 'medium',
        dueDate: '',
        estimatedTime: '',
        subtasks: []
    });

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                if (!projectId) {
                    setError('No project selected');
                    return;
                }
                await Promise.all([fetchTasks(), fetchUsers()]);
            } catch (err) {
                console.error('Initialization error:', err);
                setError(err.message || 'Failed to initialize');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [projectId]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await taskService.getTasks({ project: projectId });
            
            if (Array.isArray(response)) {
                setTasks(response);
                setError('');
            } else {
                setError('Invalid data format received');
                setTasks([]);
            }
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError(err.message || 'Failed to fetch tasks');
            setTasks([]);
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTaskForm(prev => ({
            ...prev,
            [name]: value
        }));
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
            if (selectedTask) {
                await taskService.updateTask(selectedTask._id, taskForm);
            } else {
                await taskService.createTask(taskForm);
            }
            setShowModal(false);
            setTaskForm({
                title: '',
                description: '',
                project: projectId,
                assignedTo: '',
                priority: 'medium',
                dueDate: '',
                estimatedTime: '',
                subtasks: []
            });
            fetchTasks();
        } catch (err) {
            setError(err.message || 'Failed to save task');
        }
    };

    const handleAddComment = async () => {
        try {
            await taskService.addTaskComment(selectedTask._id, { content: newComment });
            setShowCommentModal(false);
            setNewComment('');
            fetchTasks();
        } catch (err) {
            setError(err.message || 'Failed to add comment');
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
                    <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
                    <p className="text-gray-500 mt-1">Manage project tasks and subtasks</p>
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

            {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <div className="grid gap-6">
                {tasks.map((task) => (
                    <div key={task._id} className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    task.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                    {task.priority}
                                </span>
                                <button
                                    onClick={() => {
                                        setSelectedTask(task);
                                        setTaskForm(task);
                                        setShowModal(true);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FontAwesomeIcon icon={faPaperclip} />
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div className="flex items-center text-sm text-gray-600">
                                <FontAwesomeIcon icon={faUserCircle} className="mr-2" />
                                Assigned to: {users.find(u => u._id === task.assignedTo)?.name || 'Unassigned'}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <FontAwesomeIcon icon={faClock} className="mr-2" />
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <FontAwesomeIcon icon={faComment} className="mr-2" />
                                {task.comments?.length || 0} comments
                            </div>
                        </div>

                        {task.subtasks?.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Subtasks</h4>
                                <div className="space-y-2">
                                    {task.subtasks.map((subtask, index) => (
                                        <div key={index} className="flex items-center">
                                            <FontAwesomeIcon 
                                                icon={faCheckCircle} 
                                                className={`mr-2 ${
                                                    subtask.status === 'completed' ? 'text-green-500' : 'text-gray-300'
                                                }`}
                                            />
                                            <span className="text-sm text-gray-600">{subtask.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Task Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                                <select
                                    name="assignedTo"
                                    value={taskForm.assignedTo}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">Select User</option>
                                    {users.map(user => (
                                        <option key={user._id} value={user._id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
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
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                                <input
                                    type="datetime-local"
                                    name="dueDate"
                                    value={taskForm.dueDate}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
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
                                    <div key={index} className="flex gap-2 mt-2">
                                        <input
                                            type="text"
                                            value={subtask.title}
                                            onChange={(e) => handleSubtaskChange(index, 'title', e.target.value)}
                                            placeholder="Subtask title"
                                            className="flex-1 rounded-md border-gray-300"
                                        />
                                        <select
                                            value={subtask.assignedTo}
                                            onChange={(e) => handleSubtaskChange(index, 'assignedTo', e.target.value)}
                                            className="w-40 rounded-md border-gray-300"
                                        >
                                            <option value="">Assign to</option>
                                            {users.map(user => (
                                                <option key={user._id} value={user._id}>
                                                    {user.name}
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

            {/* Comment Modal */}
            {showCommentModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Add Comment</h3>
                            <button 
                                onClick={() => setShowCommentModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                ×
                            </button>
                        </div>
                        <div className="space-y-4">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                rows="4"
                                className="w-full rounded-md border-gray-300"
                                placeholder="Write your comment..."
                            ></textarea>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowCommentModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddComment}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                                >
                                    Add Comment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks; 