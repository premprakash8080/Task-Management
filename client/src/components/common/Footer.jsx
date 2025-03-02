import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-100 py-8">
            <div className="container mx-auto px-4 text-center">
                <div className="mb-4">
                    <h3 className="text-xl font-bold">TaskMaster</h3>
                    <ul className="flex justify-center space-x-4 mt-2">
                        <li><Link to="/about" className="text-gray-600">About Us</Link></li>
                        <li><Link to="/contact" className="text-gray-600">Contact</Link></li>
                        <li><Link to="/privacy-policy" className="text-gray-600">Privacy Policy</Link></li>
                    </ul>
                </div>
                <div className="flex justify-center space-x-4">
                    <a href="https://facebook.com" className="text-gray-600" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="https://twitter.com" className="text-gray-600" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-twitter"></i>
                    </a>
                    <a href="https://linkedin.com" className="text-gray-600" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-linkedin-in"></i>
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
