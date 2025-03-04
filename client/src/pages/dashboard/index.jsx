import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheckCircle,
    faCalendarAlt,
    faChartLine,
    faProjectDiagram,
    faTasks,
    faUserClock,
    faSpinner,
    faFlag,
    faClock
} from '@fortawesome/free-solid-svg-icons';
import TaskCompletionStats from '../../components/dashboard/TaskCompletionStats';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import ProjectOverview from '../../components/dashboard/ProjectOverview';
import { analyticsService, taskService, projectService } from '../../components/api';
import moment from 'moment';
import { toast } from 'react-toastify';

const Dashboard = () => {
    const location = useLocation();
    const [analyticsData, setAnalyticsData] = useState({
        taskStats: null,
        projectStats: null,
        userEngagement: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [analytics, projectStats, userEngagement] = await Promise.all([
                analyticsService.getAnalyticsOverview(),
                analyticsService.getProjectAnalytics(),
                analyticsService.getUserEngagement()
            ]);

            setAnalyticsData({
                taskStats: analytics,
                projectStats: projectStats,
                userEngagement: userEngagement
            });
        } catch (error) {
            toast.error('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-500">Welcome back! Here's an overview of your workspace.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-400">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-1">Backlog</p>
                            <h3 className="text-xl font-bold text-gray-800">
                                {analyticsData.taskStats?.backlogTasks || 0}
                            </h3>
                        </div>
                        <FontAwesomeIcon icon={faFlag} className="text-2xl text-yellow-400" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-400">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-1">In Progress</p>
                            <h3 className="text-xl font-bold text-gray-800">
                                {analyticsData.taskStats?.inProgressTasks || 0}
                            </h3>
                        </div>
                        <FontAwesomeIcon icon={faSpinner} className="text-2xl text-blue-400" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-indigo-400">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-1">Under Review</p>
                            <h3 className="text-xl font-bold text-gray-800">
                                {analyticsData.taskStats?.inReviewTasks || 0}
                            </h3>
                        </div>
                        <FontAwesomeIcon icon={faClock} className="text-2xl text-indigo-400" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-400">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-1">Completed</p>
                            <h3 className="text-xl font-bold text-gray-800">
                                {analyticsData.taskStats?.completedTasks || 0}
                            </h3>
                        </div>
                        <FontAwesomeIcon icon={faCheckCircle} className="text-2xl text-green-400" />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Task Completion</h2>
                            <TaskCompletionStats tasks={analyticsData.taskStats?.allTasks || []} />
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                            <ActivityFeed />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Projects Overview</h2>
                                <div className="flex space-x-2">
                                    <select className="form-select text-sm border rounded-md px-3 py-2">
                                        <option>All Projects</option>
                                        <option>Active</option>
                                        <option>Completed</option>
                                    </select>
                                </div>
                            </div>
                            <ProjectOverview />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Priority Distribution</h2>
                            <div className="space-y-4">
                                {['HIGH', 'MEDIUM', 'LOW'].map(priority => (
                                    <div key={priority} className="flex items-center">
                                        <div className={`w-2 h-2 rounded-full mr-2 ${
                                            priority === 'HIGH' ? 'bg-red-500' :
                                            priority === 'MEDIUM' ? 'bg-yellow-500' :
                                            'bg-green-500'
                                        }`}></div>
                                        <span className="flex-1">{priority}</span>
                                        <span className="font-semibold">
                                            {analyticsData.taskStats?.priorityDistribution?.[priority] || 0}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Upcoming Deadlines</h2>
                            <div className="space-y-3">
                                {analyticsData.taskStats?.upcomingDeadlines?.map(task => (
                                    <div key={task._id} className="flex items-center">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 mr-2" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{task.title}</p>
                                            <p className="text-xs text-gray-500">
                                                {moment(task.dueDate).format('MMM D, YYYY')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Team Performance</h2>
                            <div className="space-y-4">
                                {analyticsData.userEngagement?.teamPerformance?.map(member => (
                                    <div key={member.userId} className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <p className="text-sm font-medium">{member.name}</p>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${member.completionRate}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <span className="ml-2 text-sm font-medium">
                                            {member.completionRate}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard; 