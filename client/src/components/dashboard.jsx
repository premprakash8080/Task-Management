import React from 'react';
import { useLocation } from 'react-router-dom';
import TaskCompletionStats from './dashboard/TaskCompletionStats';
import ActivityFeed from './dashboard/ActivityFeed';
import ProjectOverview from './dashboard/ProjectOverview';
import Header from './common/header';

const Dashboard = () => {
    const location = useLocation();

    return (
        <div className="dashboard-container">
            <main className="p-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-500">Welcome back! Here's an overview of your tasks and projects.</p>
                </div>

                <div className="mb-8">
                    <TaskCompletionStats />
                </div>

                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Projects Overview</h2>
                    <ProjectOverview />
                </div>

                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Activity & Deadlines</h2>
                    <ActivityFeed />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;