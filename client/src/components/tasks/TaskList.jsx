import React from 'react';
import TaskCard from './TaskCard';

const TaskList = ({ tasks, groupBy, onTaskClick, onTaskComplete, onTaskEdit, onTaskDelete }) => {
    const groupedTasks = tasks.reduce((acc, task) => {
        const key = groupBy === 'status' ? task.status :
                   groupBy === 'project' ? task.project._id : 'all';
        
        if (!acc[key]) {
            acc[key] = {
                title: groupBy === 'status' ? task.status.replace('_', ' ') :
                       groupBy === 'project' ? task.project.title : 'All Tasks',
                tasks: []
            };
        }
        acc[key].tasks.push(task);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            {Object.entries(groupedTasks).map(([key, group]) => (
                <div key={key} className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-lg font-semibold mb-4 capitalize">{group.title}</h3>
                    <div className="space-y-4">
                        {group.tasks.map(task => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onClick={onTaskClick}
                                onComplete={onTaskComplete}
                                onEdit={onTaskEdit}
                                onDelete={onTaskDelete}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TaskList; 