import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainHeader from '../common/MainHeader.jsx';
import Footer from '../common/Footer.jsx';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col">
            <MainHeader />
            <main className="flex-grow">
                <section className="text-center py-16 bg-white">
                    <h1 className="text-4xl font-bold mb-4">Manage Your Tasks Efficiently</h1>
                    <p className="text-gray-600 mb-8">
                        Our platform helps you organize, prioritize, and accomplish more with seamless collaboration and time management tools.
                    </p>
                    
                    <button 
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded transition-colors duration-200"
                        onClick={() => navigate('/signup')}
                    >
                        Get Started
                    </button>
                </section>
                <section className="py-16 bg-gray-100">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-white p-6 rounded shadow text-center">
                                <i className="fas fa-tasks text-green-600 text-3xl mb-4"></i>
                                <h3 className="text-xl font-semibold mb-2">Task Creation</h3>
                                <p className="text-gray-600">Easily create tasks and sub-tasks to keep everything organized.</p>
                            </div>
                            <div className="bg-white p-6 rounded shadow text-center">
                                <i className="fas fa-users text-green-600 text-3xl mb-4"></i>
                                <h3 className="text-xl font-semibold mb-2">Collaboration</h3>
                                <p className="text-gray-600">Work together with your team to achieve goals faster.</p>
                            </div>
                            <div className="bg-white p-6 rounded shadow text-center">
                                <i className="fas fa-clock text-green-600 text-3xl mb-4"></i>
                                <h3 className="text-xl font-semibold mb-2">Deadlines</h3>
                                <p className="text-gray-600">Set and track deadlines to ensure timely task completion.</p>
                            </div>
                            <div className="bg-white p-6 rounded shadow text-center">
                                <i className="fas fa-bell text-green-600 text-3xl mb-4"></i>
                                <h3 className="text-xl font-semibold mb-2">Notifications</h3>
                                <p className="text-gray-600">Stay updated with real-time notifications for task updates.</p>
                            </div>
                            <div className="bg-white p-6 rounded shadow text-center">
                                <i className="fas fa-chart-line text-green-600 text-3xl mb-4"></i>
                                <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
                                <p className="text-gray-600">Monitor progress with detailed analytics and reports.</p>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div className="bg-gray-100 p-6 rounded shadow">
                                <i className="fas fa-sign-in-alt text-green-600 text-3xl mb-4"></i>
                                <h3 className="text-xl font-semibold mb-2">Step 1</h3>
                                <p className="text-gray-600">Sign up and create an account.</p>
                            </div>
                            <div className="bg-gray-100 p-6 rounded shadow">
                                <i className="fas fa-tasks text-green-600 text-3xl mb-4"></i>
                                <h3 className="text-xl font-semibold mb-2">Step 2</h3>
                                <p className="text-gray-600">Add tasks and organize them.</p>
                            </div>
                            <div className="bg-gray-100 p-6 rounded shadow">
                                <i className="fas fa-chart-line text-green-600 text-3xl mb-4"></i>
                                <h3 className="text-xl font-semibold mb-2">Step 3</h3>
                                <p className="text-gray-600">Track your progress and meet deadlines.</p>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="py-16 bg-gray-100">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-12">Testimonials</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white p-6 rounded shadow text-center">
                                <img alt="Portrait of Alex Thomson" className="w-24 h-24 rounded-full mx-auto mb-4" src="https://storage.googleapis.com/a1aa/image/SlUY1eKn3MQxzW6QvBXs3_csbw_Xmt0c5Hk3iRAJY4c.jpg" />
                                <p className="text-gray-600 mb-4">"TaskMaster has revolutionized the way we work. Our team's productivity has soared!"</p>
                                <p className="font-semibold">- Alex Thomson, Project Manager</p>
                            </div>
                            <div className="bg-white p-6 rounded shadow text-center">
                                <img alt="Portrait of Sarah Lee" className="w-24 h-24 rounded-full mx-auto mb-4" src="https://storage.googleapis.com/a1aa/image/epQElNOkRUf5u1CyE05I3L-cJ3gzzUT9xzhatexrB_Y.jpg" />
                                <p className="text-gray-600 mb-4">"I love the intuitive design and easy collaboration features of TaskMaster."</p>
                                <p className="font-semibold">- Sarah Lee, Freelance Designer</p>
                            </div>
                            <div className="bg-white p-6 rounded shadow text-center">
                                <img alt="Portrait of Mark Johnson" className="w-24 h-24 rounded-full mx-auto mb-4" src="https://storage.googleapis.com/a1aa/image/orUX1v_Q1pY6ZwNHd38kaomKPmgIL7dEpS4uA70ueIs.jpg" />
                                <p className="text-gray-600 mb-4">"The best task management tool I've used. Highly recommend it to everyone!"</p>
                                <p className="font-semibold">- Mark Johnson, Entrepreneur</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;
