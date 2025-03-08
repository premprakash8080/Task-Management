import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Task Management System</span>
            <span className="block text-blue-600">Organize. Collaborate. Succeed.</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Streamline your workflow, manage tasks efficiently, and collaborate with your team in real-time.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                to="/login"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const features = [
  {
    title: 'Task Management',
    description: 'Create, assign, and track tasks with ease. Set priorities, deadlines, and monitor progress in real-time.',
    icon: '📋'
  },
  {
    title: 'Team Collaboration',
    description: 'Work together seamlessly with team members. Share updates, files, and communicate effectively.',
    icon: '👥'
  },
  {
    title: 'Project Overview',
    description: 'Get a bird\'s eye view of all your projects. Track milestones and monitor team performance.',
    icon: '📊'
  },
  {
    title: 'Calendar Integration',
    description: 'Schedule meetings, set reminders, and manage deadlines with integrated calendar features.',
    icon: '📅'
  },
  {
    title: 'Analytics & Reports',
    description: 'Generate detailed reports and analyze team performance with comprehensive analytics.',
    icon: '📈'
  },
  {
    title: 'Real-time Updates',
    description: 'Stay informed with instant notifications and real-time updates on task progress.',
    icon: '🔔'
  }
];

export default HomePage; 