import React from 'react';
import { Bar } from 'react-chartjs-2';
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

const TaskCompletionStats = ({ tasks = [] }) => {
    // Ensure tasks is an array
    const tasksArray = Array.isArray(tasks) ? tasks : [];

    const tasksByStatus = tasksArray.reduce((acc, task) => {
        const status = task?.status?.toLowerCase() || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const completedTasks = tasksArray.filter(task => task?.status?.toLowerCase() === 'completed').length;
    const completionPercentage = tasksArray.length ? Math.round((completedTasks / tasksArray.length) * 100) : 0;

    const chartData = {
        labels: ['Backlog', 'To Do', 'In Progress', 'In Review', 'Completed'],
        datasets: [
            {
                label: 'Tasks by Status',
                data: [
                    tasksByStatus['backlog'] || 0,
                    tasksByStatus['todo'] || 0,
                    tasksByStatus['in_progress'] || 0,
                    tasksByStatus['in_review'] || 0,
                    tasksByStatus['completed'] || 0,
                ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
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
                    <span className="font-semibold">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${completionPercentage}%` }}
                    ></div>
                </div>
            </div>
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default TaskCompletionStats; 