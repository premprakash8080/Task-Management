import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBell, 
    faCheck, 
    faArchive, 
    faTrash,
    faCheckDouble
} from '@fortawesome/free-solid-svg-icons';
import { notificationService } from './api';

const NotificationsPanel = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPanel, setShowPanel] = useState(false);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
        isArchived: false
    });

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (showPanel) {
            fetchNotifications();
        }
    }, [showPanel, filters]);

    const fetchUnreadCount = async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    };

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getNotifications(filters);
            setNotifications(data.notifications);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            await fetchUnreadCount();
            setNotifications(notifications.map(notif => 
                notif._id === notificationId ? { ...notif, isRead: true } : notif
            ));
        } catch (err) {
            setError(err.message || 'Failed to mark notification as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            await fetchUnreadCount();
            setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
        } catch (err) {
            setError(err.message || 'Failed to mark all notifications as read');
        }
    };

    const handleArchive = async (notificationId) => {
        try {
            await notificationService.archiveNotification(notificationId);
            setNotifications(notifications.filter(notif => notif._id !== notificationId));
        } catch (err) {
            setError(err.message || 'Failed to archive notification');
        }
    };

    const handleDelete = async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications(notifications.filter(notif => notif._id !== notificationId));
        } catch (err) {
            setError(err.message || 'Failed to delete notification');
        }
    };

    return (
        <div className="relative">
            {/* Notification Bell Icon */}
            <button
                onClick={() => setShowPanel(!showPanel)}
                className="relative p-2 text-gray-600 hover:text-gray-800"
            >
                <FontAwesomeIcon icon={faBell} className="text-xl" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Notifications Panel */}
            {showPanel && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
                    <div className="p-4 border-b">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Notifications</h3>
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                <FontAwesomeIcon icon={faCheckDouble} className="mr-1" />
                                Mark all as read
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No notifications
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification._id}
                                    className={`p-4 border-b hover:bg-gray-50 ${
                                        !notification.isRead ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="flex justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm">{notification.message}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex items-start space-x-2 ml-2">
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification._id)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Mark as read"
                                                >
                                                    <FontAwesomeIcon icon={faCheck} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleArchive(notification._id)}
                                                className="text-gray-600 hover:text-gray-800"
                                                title="Archive"
                                            >
                                                <FontAwesomeIcon icon={faArchive} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(notification._id)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 border-t">
                        <button
                            onClick={() => setFilters(prev => ({
                                ...prev,
                                isArchived: !prev.isArchived
                            }))}
                            className="text-sm text-gray-600 hover:text-gray-800"
                        >
                            {filters.isArchived ? 'Show Active' : 'Show Archived'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsPanel; 