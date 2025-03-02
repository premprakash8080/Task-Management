import React from 'react';
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
    faFolderOpen
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/common/header';

const DashboardLayout = () => {
    const location = useLocation();

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
                        <li>
                            <Link to="/dashboard/tasks" className={location.pathname === '/dashboard/tasks' ? 'active' : ''}>
                                <FontAwesomeIcon icon={faTasks} />
                                <span className="menu-text">My Tasks</span>
                            </Link>
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
                        <li>
                            <Link to="/dashboard/stories" className={location.pathname.includes('/dashboard/stories') ? 'active' : ''}>
                                <FontAwesomeIcon icon={faClipboardList} />
                                <span className="menu-text">Stories</span>
                            </Link>
                        </li>
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