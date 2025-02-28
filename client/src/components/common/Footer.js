import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-100 py-8">
            <div className="container mx-auto px-4 text-center">
                <div className="mb-4">
                    <h3 className="text-xl font-bold">TaskMaster</h3>
                    <ul className="flex justify-center space-x-4 mt-2">
                        <li><a className="text-gray-600" href="#">About Us</a></li>
                        <li><a className="text-gray-600" href="#">Contact</a></li>
                        <li><a className="text-gray-600" href="#">Privacy Policy</a></li>
                    </ul>
                </div>
                <div className="flex justify-center space-x-4">
                    <a className="text-gray-600" href="#"><i className="fab fa-facebook-f"></i></a>
                    <a className="text-gray-600" href="#"><i className="fab fa-twitter"></i></a>
                    <a className="text-gray-600" href="#"><i className="fab fa-linkedin-in"></i></a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
