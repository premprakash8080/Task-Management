import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
    faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/common/header';

const DashboardLayout = () => {
    const location = useLocation();
    const [tasksDropdownOpen, setTasksDropdownOpen] = useState(false);

    const renderSidebar = () => (
        <div className="side">
            <div className="logo">
                <FontAwesomeIcon icon={faProjectDiagram} className="text-blue-500 mr-2" />
                Task Manager
            </div>
            
            <nav className="side-menu">
                <div className="menu-section">
                    <div className="menu-header">Main</div>
                    <ul>
                        <li>
                            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
                                <FontAwesomeIcon icon={faHome} />
                                <span className="menu-text">Dashboard</span>
                            </Link>
                        </li>
                        <li className="relative">
                            <div
                                className={`flex items-center justify-between cursor-pointer p-2 hover:bg-gray-100 rounded ${
                                    location.pathname.startsWith('/dashboard/tasks') ? 'active' : ''
                                }`}
                                onClick={() => setTasksDropdownOpen(!tasksDropdownOpen)}
                            >
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faTasks} />
                                    <span className="menu-text ml-2">Tasks</span>
                                </div>
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className={`transition-transform ${tasksDropdownOpen ? 'rotate-180' : ''}`}
                                />
                            </div>
                            {tasksDropdownOpen && (
                                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                    <div className="py-1" role="menu">
                                        <Link
                                            to="/dashboard/tasks/my-tasks"
                                            className={`block px-4 py-2 text-sm ${
                                                location.pathname === '/dashboard/tasks/my-tasks'
                                                    ? 'bg-gray-100 text-gray-900'
                                                    : 'text-gray-700'
                                            } hover:bg-gray-100`}
                                            role="menuitem"
                                        >
                                            My Tasks
                                        </Link>
                                        <Link
                                            to="/dashboard/tasks/all-tasks"
                                            className={`block px-4 py-2 text-sm ${
                                                location.pathname === '/dashboard/tasks/all-tasks'
                                                    ? 'bg-gray-100 text-gray-900'
                                                    : 'text-gray-700'
                                            } hover:bg-gray-100`}
                                            role="menuitem"
                                        >
                                            All Tasks
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </li>
                        <li>
                            <Link to="/dashboard/calendar" className={location.pathname === '/dashboard/calendar' ? 'active' : ''}>
                                <FontAwesomeIcon icon={faCalendarAlt} />
                                <span className="menu-text">Calendar</span>
                            </Link>
                        </li>
                    </ul>
                </div>

                <div className="menu-section">
                    <div className="menu-header">Projects</div>
                    <ul>
                        <li>
                            <Link to="/dashboard/projects" className={location.pathname === '/dashboard/projects' ? 'active' : ''}>
                                <FontAwesomeIcon icon={faFolderOpen} />
                                <span className="menu-text">All Projects</span>
                            </Link>
                        </li>
                        {/* <li>
                            <Link to="/dashboard/stories" className={location.pathname.includes('/dashboard/stories') ? 'active' : ''}>
                                <FontAwesomeIcon icon={faClipboardList} />
                                <span className="menu-text">Stories</span>
                            </Link>
                        </li> */}
                    </ul>
                </div>

                <div className="menu-section">
                    <div className="menu-header">Team</div>
                    <ul>
                        <li>
                            <Link to="/dashboard/users" className={location.pathname === '/dashboard/users' ? 'active' : ''}>
                                <FontAwesomeIcon icon={faUsers} />
                                <span className="menu-text">Team Members</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/dashboard/chat" className={location.pathname === '/dashboard/chat' ? 'active' : ''}>
                                <FontAwesomeIcon icon={faComments} />
                                <span className="menu-text">Team Chat</span>
                            </Link>
                        </li>
                    </ul>
                </div>

                <div className="menu-section">
                    <div className="menu-header">Reports</div>
                    <ul>
                        <li>
                            <Link to="/dashboard/analytics" className={location.pathname === '/dashboard/analytics' ? 'active' : ''}>
                                <FontAwesomeIcon icon={faChartLine} />
                                <span className="menu-text">Analytics</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>

            <div className="otherMenu">
                <Link to="/dashboard/settings" className={`settings-link ${location.pathname === '/dashboard/settings' ? 'active' : ''}`}>
                    <FontAwesomeIcon icon={faCog} />
                    <span className="menu-text">Settings</span>
                </Link>
                <button className="logout-button">
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="dashboard-container">
            {renderSidebar()}
            <main className="con">
                <Header />
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout; 