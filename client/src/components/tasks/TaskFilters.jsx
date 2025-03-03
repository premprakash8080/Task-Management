import React from 'react';

const TaskFilters = ({ filters, users, onFilterChange }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="grid grid-cols-6 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => onFilterChange('status', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">All</option>
                        <option value="backlog">Backlog</option>
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="in_review">In Review</option>
                        <option value="done">Done</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <select
                        value={filters.priority}
                        onChange={(e) => onFilterChange('priority', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">All</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                    <select
                        value={filters.assignedTo}
                        onChange={(e) => onFilterChange('assignedTo', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">All</option>
                        {users.map(user => (
                            <option key={user._id} value={user._id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                    <input
                        type="date"
                        value={filters.dueDate}
                        onChange={(e) => onFilterChange('dueDate', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Sort By</label>
                    <select
                        value={filters.sortBy}
                        onChange={(e) => onFilterChange('sortBy', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="dueDate">Due Date</option>
                        <option value="priority">Priority</option>
                        <option value="createdAt">Created Date</option>
                        <option value="title">Title</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                    <select
                        value={filters.sortOrder}
                        onChange={(e) => onFilterChange('sortOrder', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default TaskFilters; 