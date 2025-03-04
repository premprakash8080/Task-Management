import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faCalendar, faFilter } from '@fortawesome/free-solid-svg-icons';
import { analyticsService } from '../../components/api';
import moment from 'moment';
import { toast } from 'react-toastify';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Cell
} from 'recharts';

const Analytics = () => {
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD')
    });
    const [taskAnalytics, setTaskAnalytics] = useState(null);
    const [projectAnalytics, setProjectAnalytics] = useState(null);
    const [userEngagement, setUserEngagement] = useState(null);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [tasks, projects, engagement] = await Promise.all([
                analyticsService.getTaskAnalytics(dateRange.startDate, dateRange.endDate),
                analyticsService.getProjectAnalytics(),
                analyticsService.getUserEngagement()
            ]);
            
            setTaskAnalytics(tasks);
            setProjectAnalytics(projects);
            setUserEngagement(engagement);
        } catch (error) {
            toast.error('Failed to fetch analytics data');
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = (range) => {
        setDateRange(range);
    };

    const formatTaskTrendsData = (data) => {
        if (!data?.taskTrends) return [];
        return data.taskTrends.reduce((acc, item) => {
            const date = item._id.date;
            const existingDate = acc.find(d => d.date === date);
            
            if (existingDate) {
                existingDate[item._id.status] = item.count;
            } else {
                acc.push({
                    date,
                    [item._id.status]: item.count,
                    total: item.count
                });
            }
            return acc;
        }, []);
    };

    const formatPriorityData = (data) => {
        if (!data?.priorityDistribution) return [];
        return data.priorityDistribution.map(item => ({
            name: item._id,
            value: item.count
        }));
    };

    const formatProjectProgressData = (data) => {
        if (!data?.projectProgress) return [];
        return data.projectProgress.map(project => ({
            name: project.title,
            completed: project.completedTasks,
            total: project.totalTasks,
            progress: (project.completedTasks / project.totalTasks) * 100
        }));
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
                <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => handleDateRangeChange({ ...dateRange, startDate: e.target.value })}
                            className="form-input rounded-md border-gray-300"
                        />
                        <span>to</span>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => handleDateRangeChange({ ...dateRange, endDate: e.target.value })}
                            className="form-input rounded-md border-gray-300"
                        />
                    </div>
                    <button className="btn btn-primary">
                        <FontAwesomeIcon icon={faDownload} className="mr-2" />
                        Export Report
                    </button>
                </div>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Task Completion Trends */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Task Completion Trends</h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={formatTaskTrendsData(taskAnalytics)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="COMPLETED" stroke="#00C49F" name="Completed" />
                                    <Line type="monotone" dataKey="IN_PROGRESS" stroke="#0088FE" name="In Progress" />
                                    <Line type="monotone" dataKey="TODO" stroke="#FFBB28" name="Todo" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Task Priority Distribution */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Task Priority Distribution</h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={formatPriorityData(taskAnalytics)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label
                                    >
                                        {formatPriorityData(taskAnalytics).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Project Progress */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Progress</h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={formatProjectProgressData(projectAnalytics)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="completed" fill="#00C49F" name="Completed Tasks" />
                                    <Bar dataKey="total" fill="#0088FE" name="Total Tasks" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* User Engagement */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">User Engagement</h2>
                        {userEngagement?.taskCompletionRate && (
                            <div className="mb-4">
                                <p className="text-sm text-gray-600">Task Completion Rate</p>
                                <div className="relative pt-1">
                                    <div className="flex mb-2 items-center justify-between">
                                        <div>
                                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                                                {Math.round((userEngagement.taskCompletionRate.completed / userEngagement.taskCompletionRate.total) * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                                        <div
                                            style={{ width: `${(userEngagement.taskCompletionRate.completed / userEngagement.taskCompletionRate.total) * 100}%` }}
                                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics; 