import React from 'react';
import { faCheckCircle, faClock, faSpinner, faFlag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Dashboard = () => {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-400">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-1">Backlog</p>
                            <h3 className="text-xl font-bold text-gray-800">12</h3>
                        </div>
                        <FontAwesomeIcon icon={faFlag} className="text-2xl text-yellow-400" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-400">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-1">In Progress</p>
                            <h3 className="text-xl font-bold text-gray-800">5</h3>
                        </div>
                        <FontAwesomeIcon icon={faSpinner} className="text-2xl text-blue-400" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-indigo-400">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-1">Under Review</p>
                            <h3 className="text-xl font-bold text-gray-800">7</h3>
                        </div>
                        <FontAwesomeIcon icon={faClock} className="text-2xl text-indigo-400" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-400">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-1">Completed</p>
                            <h3 className="text-xl font-bold text-gray-800">25</h3>
                        </div>
                        <FontAwesomeIcon icon={faCheckCircle} className="text-2xl text-green-400" />
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <FontAwesomeIcon icon={faSpinner} className="text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-800">Task moved to In Progress</p>
                            <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-800">Task completed</p>
                            <p className="text-xs text-gray-500">3 hours ago</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 