import React, { useState, useEffect } from 'react';
import { taskService } from '../../api';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCheckCircle, 
    faExclamationTriangle,
    faClock,
    faUserCircle,
    faSpinner
} from '@fortawesome/free-solid-svg-icons';

const ActivityFeed = () => {
    const [recentTasks, setRecentTasks] = useState([]);
    const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivities();
        const interval = setInterval(fetchActivities, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchActivities = async () => {
        try {
            const response = await taskService.getTasks({
                sortBy: 'updatedAt',
                sortOrder: 'desc',
                limit: 5
            });
            
            const deadlines = await taskService.getTasks({
                sortBy: 'dueDate',
                sortOrder: 'asc',
                status: 'in_progress',
                limit: 5
            });

            setRecentTasks(response.tasks);
            setUpcomingDeadlines(deadlines.tasks);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching activities:', error);
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />;
            case 'in_progress':
                return <FontAwesomeIcon icon={faSpinner} className="text-blue-500" />;
            default:
                return <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500" />;
        }
    };

    const getTimeAgo = (date) => {
        return moment(date).fromNow();
    };

    const getDeadlineClass = (dueDate) => {
        const days = moment(dueDate).diff(moment(), 'days');
        if (days < 0) return 'text-red-500';
        if (days < 2) return 'text-yellow-500';
        return 'text-green-500';
    };

    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'high':
                return 'text-red-600';
            case 'medium':
                return 'text-orange-500';
            case 'low':
                return 'text-green-600';
            default:
                return 'text-gray-600';
        }
    };

    if (loading) {
        return <div className="animate-pulse h-64 bg-gray-100 rounded-lg"></div>;
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-4">
                    {recentTasks.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                                {getStatusIcon(activity.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                    {activity.user} {activity.action} {activity.taskName}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {getTimeAgo(activity.updatedAt)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">Upcoming Deadlines</h2>
                <div className="space-y-4">
                    {upcomingDeadlines.map((task, index) => (
                        <div key={index} className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                                <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                    {task.title}
                                </p>
                                <p className={`text-sm ${getDeadlineClass(task.dueDate)}`}>
                                    Due {moment(task.dueDate).format('MMM DD, YYYY')}
                                </p>
                                <div className="flex items-center mt-1">
                                    {task.assignees.map(assignee => (
                                        <div 
                                            key={assignee.user._id} 
                                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center -ml-2 first:ml-0"
                                            title={assignee.user.name}
                                        >
                                            {assignee.user.avatar ? (
                                                <img 
                                                    src={assignee.user.avatar} 
                                                    alt={assignee.user.name}
                                                    className="w-6 h-6 rounded-full"
                                                />
                                            ) : (
                                                <FontAwesomeIcon icon={faUserCircle} className="text-gray-400" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ActivityFeed; 