import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft,
    faCalendarAlt,
    faClock,
    faUser,
    faTag,
    faCheckCircle,
    faEdit,
    faTrash,
    faComment
} from '@fortawesome/free-solid-svg-icons';
import { taskService } from '../../../components/api';
import moment from 'moment';

const TaskDetail = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTaskDetails();
    }, [taskId]);

    const fetchTaskDetails = async () => {
        try {
            setLoading(true);
            const data = await taskService.getTaskById(taskId);
            // Ensure assignees is always an array
            data.assignees = data.assignees || [];
            setTask(data);
            setError('');
        } catch (err) {
            console.error('Error fetching task details:', err);
            setError(err.message || 'Failed to fetch task details');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            if (newStatus === 'done') {
                // Use the markTaskComplete endpoint
                await taskService.markTaskComplete(taskId);
            } else {
                // For other status changes, use updateTask with correct assignees structure and maintain priority case
                await taskService.updateTask(taskId, { 
                    status: newStatus,
                    priority: task.priority, // Keep the existing priority with correct case
                    assignees: task.assignees.map(a => ({
                        user: a.user._id,
                        role: a.role || 'responsible'
                    }))
                });
            }
            await fetchTaskDetails();
        } catch (err) {
            setError(err.message || 'Failed to update task status');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <div className="bg-red-50 text-red-500 p-4 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="p-4">
                <div className="text-gray-500">Task not found</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header with back button */}
            <div className="flex items-center mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="mr-4 text-gray-600 hover:text-gray-800"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Task Details</h1>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                {/* Task Title and Status */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-semibold">{task?.title}</h2>
                        <p className="text-gray-600 mt-2">{task?.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            task?.priority === 'high' ? 'bg-red-100 text-red-800' :
                            task?.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                        }`}>
                            {task?.priority}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            task?.status === 'done' ? 'bg-green-100 text-green-800' :
                            task?.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                            {task?.status?.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                {/* Task Details Grid */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Due Date */}
                    <div className="flex items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 mr-2" />
                        <div>
                            <p className="text-sm text-gray-500">Due Date</p>
                            <p className="font-medium">
                                {task.dueDate ? moment(task.dueDate).format('MMM DD, YYYY') : 'No due date'}
                            </p>
                        </div>
                    </div>

                    {/* Estimated Time */}
                    <div className="flex items-center">
                        <FontAwesomeIcon icon={faClock} className="text-gray-400 mr-2" />
                        <div>
                            <p className="text-sm text-gray-500">Estimated Time</p>
                            <p className="font-medium">{task.estimatedTime || 0} hours</p>
                        </div>
                    </div>
                </div>

                {/* Assignees */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Assignees</h3>
                    <div className="flex flex-wrap gap-2">
                        {task?.assignees?.map(assignee => (
                            <div
                                key={assignee.user._id}
                                className="flex items-center bg-gray-50 px-3 py-2 rounded-full"
                            >
                                <img
                                    src={assignee.user.profilePhoto || '/default-avatar.png'}
                                    alt={assignee.user.name}
                                    className="w-6 h-6 rounded-full mr-2"
                                />
                                <span className="text-sm font-medium">{assignee.user.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Labels/Tags */}
                {task.labels && task.labels.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Labels</h3>
                        <div className="flex flex-wrap gap-2">
                            {task.labels.map(label => (
                                <span
                                    key={label._id}
                                    className="px-3 py-1 rounded-full text-sm"
                                    style={{
                                        backgroundColor: `${label.color}20`,
                                        color: label.color
                                    }}
                                >
                                    <FontAwesomeIcon icon={faTag} className="mr-1" />
                                    {label.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Subtasks */}
                {task.subtasks && task.subtasks.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Subtasks</h3>
                        <div className="space-y-2">
                            {task.subtasks.map(subtask => (
                                <div
                                    key={subtask._id}
                                    className="flex items-center justify-between bg-gray-50 p-3 rounded"
                                >
                                    <div className="flex items-center">
                                        <FontAwesomeIcon
                                            icon={faCheckCircle}
                                            className={`mr-2 ${
                                                subtask.status === 'completed'
                                                    ? 'text-green-500'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                        <span className={subtask.status === 'completed' ? 'line-through text-gray-500' : ''}>
                                            {subtask.title}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {subtask.dueDate && moment(subtask.dueDate).format('MMM DD')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Comments */}
                {task.comments && task.comments.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Comments</h3>
                        <div className="space-y-4">
                            {task.comments.map(comment => (
                                <div key={comment._id} className="bg-gray-50 p-4 rounded">
                                    <div className="flex items-center mb-2">
                                        <img
                                            src={comment.user.profilePhoto || '/default-avatar.png'}
                                            alt={comment.user.name}
                                            className="w-6 h-6 rounded-full mr-2"
                                        />
                                        <span className="font-medium text-sm">{comment.user.name}</span>
                                        <span className="text-gray-500 text-sm ml-2">
                                            {moment(comment.createdAt).fromNow()}
                                        </span>
                                    </div>
                                    <p className="text-gray-700">{comment.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                        onClick={() => navigate(`/dashboard/tasks/edit/${taskId}`)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <FontAwesomeIcon icon={faEdit} className="mr-2" />
                        Edit Task
                    </button>
                    <button
                        onClick={() => handleStatusChange('done')}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                        Mark Complete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskDetail; 