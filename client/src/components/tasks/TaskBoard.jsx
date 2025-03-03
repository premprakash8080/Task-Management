import React from 'react';
import TaskCard from './TaskCard';

const TaskBoard = ({ tasks, onTaskClick, onTaskComplete, onTaskEdit, onTaskDelete }) => {
    const statusColumns = {
        backlog: {
            title: 'Backlog',
            tasks: tasks.filter(t => t.status === 'backlog')
        },
        todo: {
            title: 'To Do',
            tasks: tasks.filter(t => t.status === 'todo')
        },
        in_progress: {
            title: 'In Progress',
            tasks: tasks.filter(t => t.status === 'in_progress')
        },
        in_review: {
            title: 'In Review',
            tasks: tasks.filter(t => t.status === 'in_review')
        },
        done: {
            title: 'Done',
            tasks: tasks.filter(t => t.status === 'done')
        }
    };

    return (
        <div className="grid grid-cols-5 gap-4">
            {Object.entries(statusColumns).map(([status, column]) => (
                <div key={status} className="bg-gray-100 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold capitalize">
                            {column.title}
                        </h3>
                        <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded">
                            {column.tasks.length}
                        </span>
                    </div>
                    <div className="space-y-4 min-h-[200px]">
                        {column.tasks.map(task => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onClick={onTaskClick}
                                onComplete={onTaskComplete}
                                onEdit={onTaskEdit}
                                onDelete={onTaskDelete}
                            />
                        ))}
                        {column.tasks.length === 0 && (
                            <div className="text-center py-4 text-gray-400 text-sm">
                                No tasks
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TaskBoard; 