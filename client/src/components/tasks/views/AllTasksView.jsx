import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCheck, 
    faEdit, 
    faTrash,
    faCalendarAlt,
    faUser,
    faProjectDiagram
} from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import { Link } from 'react-router-dom';

const AllTasksView = ({
    tasks,
    viewMode,
    groupBy,
    onTaskClick,
    onTaskComplete,
    onTaskEdit,
    onTaskDelete
}) => {
    const groupTasksByProject = () => {
        const grouped = tasks.reduce((acc, task) => {
            const projectId = task.project?._id || 'unassigned';
            const projectTitle = task.project?.title || 'Unassigned Tasks';
            
            if (!acc[projectId]) {
                acc[projectId] = {
                    title: projectTitle,
                    projectId: task.project?._id,
                    tasks: []
                };
            }
            acc[projectId].tasks.push(task);
            return acc;
        }, {});

        return Object.values(grouped);
    };

    const renderTaskCard = (task) => (
        <div 
            key={task._id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
            <div className="flex justify-between items-start mb-2">
                <h3 
                    className="text-lg font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                    onClick={() => onTaskClick(task)}
                >
                    {task.title}
                </h3>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onTaskComplete(task._id)}
                        className="text-green-600 hover:text-green-800"
                        title="Complete Task"
                    >
                        <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button
                        onClick={() => onTaskEdit(task)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit Task"
                    >
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                        onClick={() => onTaskDelete(task._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Task"
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>
            </div>
            <div className="text-sm text-gray-600 mb-2">
                {task.description}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <FontAwesomeIcon icon={faUser} className="mr-1" />
                        {task.assignees?.[0]?.user?.name || 'Unassigned'}
                    </div>
                    {task.dueDate && (
                        <div className="flex items-center">
                            <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                            {moment(task.dueDate).format('MMM DD, YYYY')}
                        </div>
                    )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                }`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
            </div>
        </div>
    );

    const renderListView = () => {
        const groupedTasks = groupTasksByProject();

        return (
            <div className="space-y-8">
                {groupedTasks.map(group => (
                    <div key={group.title} className="space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                            <span className="text-sm text-gray-500">
                                ({group.tasks.length} tasks)
                            </span>
                            <div className="flex items-center space-x-2">
                                <FontAwesomeIcon icon={faProjectDiagram} className="text-blue-600 mr-2" />
                                <h2 className="text-xl font-semibold text-gray-800">{group.title}</h2>
                            </div>
                            {group.projectId && (
                                <Link 
                                    to={`/dashboard/projects/${group.projectId}`}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    View Project
                                </Link>
                            )}
                        </div>
                        <div className="grid gap-4">
                            {group.tasks.map(task => renderTaskCard(task))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderBoardView = () => {
        const statusColumns = {
            backlog: { title: 'Backlog', tasks: [] },
            todo: { title: 'To Do', tasks: [] },
            in_progress: { title: 'In Progress', tasks: [] },
            in_review: { title: 'In Review', tasks: [] },
            done: { title: 'Done', tasks: [] }
        };

        tasks.forEach(task => {
            if (statusColumns[task.status]) {
                statusColumns[task.status].tasks.push(task);
            }
        });

        return (
            <div className="grid grid-cols-5 gap-4">
                {Object.entries(statusColumns).map(([status, column]) => (
                    <div key={status} className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            {column.title} ({column.tasks.length})
                        </h3>
                        <div className="space-y-4">
                            {column.tasks.map(task => renderTaskCard(task))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="mt-6">
            {viewMode === 'board' ? renderBoardView() : renderListView()}
        </div>
    );
};

export default AllTasksView; 