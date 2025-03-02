import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';

const Settings = () => {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                <button className="btn btn-primary">
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    Save Changes
                </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Settings</h2>
                        <div className="space-y-4">
                            <div className="form-group">
                                <label className="form-label">Display Name</label>
                                <input type="text" className="form-control" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input type="email" className="form-control" />
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h2>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input type="checkbox" className="mr-3" />
                                <label>Email notifications for task updates</label>
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" className="mr-3" />
                                <label>Email notifications for team chat mentions</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings; 