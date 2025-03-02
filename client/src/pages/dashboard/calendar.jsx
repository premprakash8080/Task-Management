import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarPlus } from '@fortawesome/free-solid-svg-icons';

const Calendar = () => {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
                <button className="btn btn-primary">
                    <FontAwesomeIcon icon={faCalendarPlus} className="mr-2" />
                    Add Event
                </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
                <p className="text-gray-500">Calendar component will be implemented here</p>
            </div>
        </div>
    );
};

export default Calendar; 