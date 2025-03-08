import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { userService } from '../components/api';
import { 
    faHome, 
    faUsers, 
    faTasks,
    faProjectDiagram,
    faChartLine,
    faCog, 
    faSignOutAlt,
    faCalendarAlt,
    faClipboardList,
    faComments,
    faFolderOpen,
    faChevronDown,
    faListCheck,
    faUserCog
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/common/header';

const DashboardLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [tasksDropdownOpen, setTasksDropdownOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await userService.logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            // Still clear local storage and redirect even if API call fails
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    const renderSidebar = () => (
        <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10 flex flex-col">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <FontAwesomeIcon icon={faProjectDiagram} className="text-blue-600 text-2xl" />
                    <span className="text-xl font-semibold text-gray-800">Task Manager</span>
                </div>
            </div>
            
            <nav className="flex-1 overflow-y-auto px-4 py-6">
                <div className="space-y-8">
                    {/* Main Navigation */}
                    <div>
                        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Main
                        </h3>
                        <div className="mt-3 space-y-1">
                            <Link 
                                to="/dashboard" 
                                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                                    location.pathname === '/dashboard' 
                                    ? 'bg-blue-50 text-blue-600' 
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <FontAwesomeIcon icon={faHome} className="mr-3 flex-shrink-0" />
                                <span>Dashboard</span>
                            </Link>

                            {/* Tasks Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setTasksDropdownOpen(!tasksDropdownOpen)}
                                    className={`w-full group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg ${
                                        location.pathname.includes('/dashboard/tasks')
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <FontAwesomeIcon icon={faTasks} className="mr-3 flex-shrink-0" />
                                        <span>Tasks</span>
                                    </div>
                                    <FontAwesomeIcon
                                        icon={faChevronDown}
                                        className={`transition-transform duration-200 ${tasksDropdownOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>
                                
                                {tasksDropdownOpen && (
                                    <div className="mt-1 ml-6 space-y-1">
                                        <Link
                                            to="/dashboard/tasks/my-tasks"
                                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                                                location.pathname === '/dashboard/tasks/my-tasks'
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <FontAwesomeIcon icon={faUserCog} className="mr-3 flex-shrink-0" />
                                            My Tasks
                                        </Link>
                                        <Link
                                            to="/dashboard/tasks/all-tasks"
                                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                                                location.pathname === '/dashboard/tasks/all-tasks'
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <FontAwesomeIcon icon={faListCheck} className="mr-3 flex-shrink-0" />
                                            All Tasks
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <Link 
                                to="/dashboard/calendar" 
                                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                                    location.pathname === '/dashboard/calendar'
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <FontAwesomeIcon icon={faCalendarAlt} className="mr-3 flex-shrink-0" />
                                <span>Calendar</span>
                            </Link>
                        </div>
                    </div>

                    {/* Projects Section */}
                    <div>
                        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Projects
                        </h3>
                        <div className="mt-3 space-y-1">
                            <Link 
                                to="/dashboard/projects" 
                                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                                    location.pathname === '/dashboard/projects'
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <FontAwesomeIcon icon={faFolderOpen} className="mr-3 flex-shrink-0" />
                                <span>All Projects</span>
                            </Link>
                        </div>
                    </div>

                    

                    {/* Team Section */}
                    <div>
                        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Team
                        </h3>
                        <div className="mt-3 space-y-1">
                            <Link 
                                to="/dashboard/users" 
                                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                                    location.pathname === '/dashboard/users'
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <FontAwesomeIcon icon={faUsers} className="mr-3 flex-shrink-0" />
                                <span>Team Members</span>
                            </Link>
                            <Link 
                                to="/dashboard/chat" 
                                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                                    location.pathname === '/dashboard/chat'
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <FontAwesomeIcon icon={faComments} className="mr-3 flex-shrink-0" />
                                <span>Team Chat</span>
                            </Link>
                        </div>
                    </div>

                    {/* Reports Section */}
                    <div>
                        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Reports
                        </h3>
                        <div className="mt-3 space-y-1">
                            <Link 
                                to="/dashboard/analytics" 
                                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                                    location.pathname === '/dashboard/analytics'
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <FontAwesomeIcon icon={faChartLine} className="mr-3 flex-shrink-0" />
                                <span>Analytics</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Bottom Section */}
            <div className="border-t border-gray-200 p-4 space-y-2">
                <Link 
                    to="/dashboard/settings" 
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                        location.pathname === '/dashboard/settings'
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <FontAwesomeIcon icon={faCog} className="mr-3 flex-shrink-0" />
                    <span>Settings</span>
                </Link>
                <button 
                    className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                    onClick={handleLogout}
                >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 flex-shrink-0" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {renderSidebar()}
            <div className="pl-64">
                {/* <Header /> */}
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout; 