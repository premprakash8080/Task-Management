import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUser,
    faSignOutAlt,
    faCog
} from '@fortawesome/free-solid-svg-icons';
import NotificationsPanel from './NotificationsPanel';
import { userService } from './api';

const Header = () => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        userService.logout();
        window.location.href = '/login';
    };

    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex-shrink-0">
                        <Link to="/dashboard" className="text-xl font-bold text-gray-800">
                            Task Manager
                        </Link>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <NotificationsPanel />

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faUser} />
                                </div>
                                <span className="hidden md:block">{user.name}</span>
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                    <Link
                                        to="/dashboard/settings"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <FontAwesomeIcon icon={faCog} className="mr-2" />
                                        Settings
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header; 