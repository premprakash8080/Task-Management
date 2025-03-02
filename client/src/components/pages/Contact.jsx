import React from 'react';
import Header from '../common/MainHeader';
import Footer from '../common/Footer';

const Contact = () => {
    return (
        <div>
            <Header />
            <div className="container">
                <h2>Contact Us</h2>
                <p>Email: contact@example.com</p>
                <p>Phone: +123 456 7890</p>
            </div>
            <Footer />
        </div>
    );
};

export default Contact;
