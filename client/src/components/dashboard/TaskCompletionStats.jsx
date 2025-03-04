import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { dashboardService } from '../../api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const TaskCompletionStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTaskStats();
    }, []);

    const fetchTaskStats = async () => {
        try {
            const data = await dashboardService.getTaskCompletionStats();
            setStats(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching task stats:', error);
            setLoading(false);
        }
    };

    if (loading || !stats) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-32 bg-gray-200 rounded w-full"></div>
                </div>
            </div>
        );
    }

    const chartData = {
        labels: stats.distribution.labels,
        datasets: [
            {
                label: 'Tasks by Status',
                data: stats.distribution.data,
                backgroundColor: stats.distribution.colors.background,
                borderColor: stats.distribution.colors.border,
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Task Distribution',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                },
            },
        },
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Task Completion</h2>
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-semibold">{stats.completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${stats.completionPercentage}%` }}
                    ></div>
                </div>
            </div>
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default TaskCompletionStats; 