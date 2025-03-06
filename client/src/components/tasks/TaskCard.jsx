import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faClock,
    faCheckCircle,
    faEdit,
    faTrash
} from '@fortawesome/free-solid-svg-icons';

const TaskCard = ({ task, onComplete, onEdit, onDelete, onClick }) => (
    <div
        onClick={() => onClick(task)}
        className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow ${
            task.status === 'done' ? 'opacity-75' : ''
        }`}
    >
        <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
            <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                }`}>
                    {task.priority}
                </span>
                <div className="flex -space-x-2">
                    {task.assignees.map(assignee => (
                        <img
                            key={assignee.user._id}
                            src={assignee.user.profilePhoto || '/assets/img/default-avatar.png'}
                            alt={assignee.user.name}
                            className="w-6 h-6 rounded-full border-2 border-white"
                            title={assignee.user.name}
                        />
                    ))}
                </div>
            </div>
        </div>
        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
                <FontAwesomeIcon icon={faClock} className="mr-1" />
                {new Date(task.dueDate).toLocaleDateString()}
            </div>
            <div className="flex items-center space-x-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onComplete(task._id);
                    }}
                    className={`p-1 rounded ${
                        task.status === 'done'
                            ? 'text-green-600'
                            : 'text-gray-400 hover:text-green-600'
                    }`}
                >
                    <FontAwesomeIcon icon={faCheckCircle} />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(task);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600"
                >
                    <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(task._id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600"
                >
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </div>
        </div>
        {task.subtasks.length > 0 && (
            <div className="mt-3 pt-3 border-t">
                <div className="text-xs text-gray-500 mb-2">
                    Subtasks ({task.subtasks.filter(st => st.status === 'done').length}/{task.subtasks.length})
                </div>
                <div className="space-y-1">
                    {task.subtasks.map((subtask, index) => (
                        <div key={index} className="flex items-center text-sm">
                            <span className={`mr-2 ${
                                subtask.status === 'done' ? 'text-green-500' : 'text-gray-400'
                            }`}>
                                <FontAwesomeIcon icon={faCheckCircle} />
                            </span>
                            <span className={subtask.status === 'done' ? 'line-through text-gray-400' : ''}>
                                {subtask.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);

export default TaskCard; 