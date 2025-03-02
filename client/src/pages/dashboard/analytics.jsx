import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

const Analytics = () => {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
                <button className="btn btn-primary">
                    <FontAwesomeIcon icon={faDownload} className="mr-2" />
                    Export Report
                </button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Task Completion Rate</h2>
                    <p className="text-gray-500">Chart will be implemented here</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Team Performance</h2>
                    <p className="text-gray-500">Chart will be implemented here</p>
                </div>
            </div>
        </div>
    );
};

export default Analytics; 