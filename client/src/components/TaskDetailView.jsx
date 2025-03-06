import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarAlt,
    faCheckCircle,
    faUserCircle,
    faClock,
    faList,
    faComment,
    faPaperclip,
    faTags,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import { taskService } from './api';

const TaskDetailView = ({ task, onClose, onUpdate }) => {
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState(task.comments || []);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            setIsSubmitting(true);
            const response = await taskService.addTaskComment(task._id, {
                content: newComment
            });
            
            setComments([...comments, response.comment]);
            setNewComment('');
            if (onUpdate) {
                onUpdate();
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'text-green-500';
            case 'in_progress':
                return 'text-blue-500';
            case 'in_review':
                return 'text-yellow-500';
            default:
                return 'text-gray-500';
        }
    };

    if (!task) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{task.title}</h2>
                        <p className="text-gray-500 mt-1">
                            {task.project?.title && `Project: ${task.project.title}`}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 text-2xl font-semibold"
                    >
                        <FontAwesomeIcon icon={faTimes} className="text-xl" />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 space-y-6">
                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                            <p className="text-gray-600">{task.description}</p>
                        </div>

                        {/* Subtasks */}
                        {task.subtasks && task.subtasks.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">
                                    <FontAwesomeIcon icon={faList} className="mr-2" />
                                    Subtasks
                                </h3>
                                <div className="space-y-2">
                                    {task.subtasks.map((subtask, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center p-2 bg-gray-50 rounded"
                                        >
                                            <span className={`mr-2 ${
                                                subtask.status === 'done'
                                                    ? 'text-green-500'
                                                    : 'text-gray-400'
                                            }`}>
                                                <FontAwesomeIcon icon={faCheckCircle} />
                                            </span>
                                            <span className={subtask.status === 'done' ? 'line-through' : ''}>
                                                {subtask.title}
                                            </span>
                                            {subtask.assignedTo && (
                                                <span className="ml-auto text-sm text-gray-500">
                                                    {subtask.assignedTo.name}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comments */}
                        {task.comments && task.comments.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">
                                    <FontAwesomeIcon icon={faComment} className="mr-2" />
                                    Comments
                                </h3>
                                <div className="space-y-3">
                                    {task.comments.map((comment, index) => (
                                        <div key={index} className="bg-gray-50 p-3 rounded">
                                            <div className="flex items-center mb-2">
                                                <span className="font-medium">{comment.user.name}</span>
                                                <span className="text-gray-500 text-sm ml-2">
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-600">{comment.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Status and Priority */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                                task.status === 'done' ? 'bg-green-100 text-green-800' :
                                task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {task.status.replace('_', ' ').toUpperCase()}
                            </span>

                            <h3 className="text-sm font-medium text-gray-500 mt-4 mb-2">Priority</h3>
                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                                task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                task.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                                {task.priority.toUpperCase()}
                            </span>
                        </div>

                        {/* Dates */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Due Date</h3>
                            <div className="flex items-center text-gray-600">
                                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
                            </div>

                            {task.estimatedTime && (
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                                        Estimated Time
                                    </h3>
                                    <div className="flex items-center text-gray-600">
                                        <FontAwesomeIcon icon={faClock} className="mr-2" />
                                        {task.estimatedTime} minutes
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Assignees */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Assignees</h3>
                            <div className="space-y-2">
                                {task.assignees.map((assignee, index) => (
                                    <div key={index} className="flex items-center">
                                        <img
                                            src={assignee.user.profilePhoto || '/assets/img/default-avatar.png'}
                                            alt={assignee.user.name}
                                            className="w-6 h-6 rounded-full mr-2"
                                        />
                                        <span className="text-gray-600">{assignee.user.name}</span>
                                        <span className="text-xs text-gray-500 ml-2">
                                            ({assignee.role})
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Attachments */}
                        {task.attachments && task.attachments.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">
                                    <FontAwesomeIcon icon={faPaperclip} className="mr-2" />
                                    Attachments
                                </h3>
                                <div className="space-y-2">
                                    {task.attachments.map((attachment, index) => (
                                        <a
                                            key={index}
                                            href={attachment.fileUrl}
                                            className="block text-blue-600 hover:text-blue-800"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {attachment.fileName}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Labels */}
                        {task.labels && task.labels.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">
                                    <FontAwesomeIcon icon={faTags} className="mr-2" />
                                    Labels
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {task.labels.map((label, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 rounded-full text-xs font-medium"
                                            style={{
                                                backgroundColor: label.color + '20',
                                                color: label.color
                                            }}
                                        >
                                            {label.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Comments</h3>
                    <div className="space-y-4 mb-4">
                        {comments.map((comment, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        {comment.user.avatar ? (
                                            <img
                                                src={comment.user.avatar}
                                                alt={comment.user.name}
                                                className="h-8 w-8 rounded-full"
                                            />
                                        ) : (
                                            <FontAwesomeIcon
                                                icon={faUserCircle}
                                                className="h-8 w-8 text-gray-400"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium text-gray-900">
                                                {comment.user.name}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {moment(comment.createdAt).fromNow()}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 mt-1">{comment.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleCommentSubmit} className="mt-4">
                        <div className="flex items-start space-x-3">
                            <div className="flex-1">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    rows="3"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting || !newComment.trim()}
                                className={`px-4 py-2 rounded-md text-white ${
                                    isSubmitting || !newComment.trim()
                                        ? 'bg-gray-400'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {isSubmitting ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailView; 