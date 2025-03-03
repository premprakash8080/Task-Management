import React from 'react';
import { Link } from 'react-router-dom';
import TaskCard from '../TaskCard';

const ProjectTasksView = ({ 
    projectTasks, 
    onTaskClick, 
    onTaskComplete, 
    onTaskEdit, 
    onTaskDelete 
}) => {
    if (!projectTasks || projectTasks.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No tasks found</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {projectTasks.map(project => (
                <div key={project._id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {project.projectTitle}
                            </h2>
                            <p className="text-gray-500 mt-1">
                                {project.taskCount} tasks • {project.completedTasks} completed
                            </p>
                        </div>
                        <Link
                            to={`/dashboard/projects/${project._id}`}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            View Project
                        </Link>
                    </div>

                    <div className="grid grid-cols-5 gap-4">
                        {['backlog', 'todo', 'in_progress', 'in_review', 'done'].map(status => (
                            <div key={status} className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-4 capitalize">
                                    {status.replace('_', ' ')}
                                </h3>
                                <div className="space-y-4">
                                    {project.tasks
                                        .filter(task => task.status === status)
                                        .map(task => (
                                            <TaskCard
                                                key={task._id}
                                                task={task}
                                                onClick={() => onTaskClick(task)}
                                                onComplete={onTaskComplete}
                                                onEdit={onTaskEdit}
                                                onDelete={onTaskDelete}
                                            />
                                        ))
                                    }
                                    {project.tasks.filter(task => task.status === status).length === 0 && (
                                        <div className="text-center py-4 text-gray-400 text-sm">
                                            No tasks
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProjectTasksView; 