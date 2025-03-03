import React from 'react';
import TaskBoard from '../TaskBoard';
import TaskList from '../TaskList';

const AllTasksView = ({
    tasks,
    viewMode,
    groupBy,
    onTaskClick,
    onTaskComplete,
    onTaskEdit,
    onTaskDelete
}) => {
    if (!tasks || tasks.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No tasks found</p>
            </div>
        );
    }

    return (
        <div>
            {viewMode === 'board' ? (
                <TaskBoard
                    tasks={tasks}
                    onTaskClick={onTaskClick}
                    onTaskComplete={onTaskComplete}
                    onTaskEdit={onTaskEdit}
                    onTaskDelete={onTaskDelete}
                />
            ) : (
                <TaskList
                    tasks={tasks}
                    groupBy={groupBy}
                    onTaskClick={onTaskClick}
                    onTaskComplete={onTaskComplete}
                    onTaskEdit={onTaskEdit}
                    onTaskDelete={onTaskDelete}
                />
            )}
        </div>
    );
};

export default AllTasksView; 