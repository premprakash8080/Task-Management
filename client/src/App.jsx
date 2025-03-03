import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import HomePage from './components/pages/HomePage';
import About from './components/pages/About';
import Contact from './components/pages/Contact';
import PrivacyPolicy from './components/pages/PrivacyPolicy';

// Dashboard pages
import Dashboard from './pages/dashboard';
import Projects from './pages/dashboard/Projects';
import Tasks from './pages/dashboard/Tasks';
import Story from './pages/dashboard/story';
import Calendar from './pages/dashboard/calendar';
import Chat from './pages/dashboard/chat';
import Analytics from './pages/dashboard/analytics';
import Settings from './pages/dashboard/settings';
import Users from './pages/dashboard/Users';
import MyTasks from './pages/dashboard/tasks/MyTasks';
import AllTasks from './pages/dashboard/tasks/AllTasks';
import dotenv from 'dotenv';
import userService from '../src/services/userService';

const PrivateRoute = ({ children, requiredRoles = [] }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        if (requiredRoles.length === 0) {
          setIsAuthorized(true);
          setLoading(false);
          return;
        }

        const response = await userService.getProfile();
        const userRole = response.data.role;
        setIsAuthorized(requiredRoles.includes(userRole));
        setLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthorized(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, [requiredRoles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthorized ? children : <Navigate to="/login" />;
};

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
        <a href="/" className="text-blue-600 hover:text-blue-800">
          Return to Homepage
        </a>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <DashboardLayout />
        </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:projectId" element={<Projects />} />
        <Route path="projects/:projectId/tasks" element={<Tasks />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="tasks/my-tasks" element={<MyTasks />} />
        <Route path="tasks/all-tasks" element={<AllTasks />} />
        <Route path="tasks/:projectId" element={<Tasks />} />
        <Route path="story/:id" element={<Story />} />
        <Route path="users" element={
          <PrivateRoute requiredRoles={['admin', 'manager']}>
            <Users />
          </PrivateRoute>
        } />
        <Route path="calendar" element={<Calendar />} />
        <Route path="chat" element={<Chat />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch all route for 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
