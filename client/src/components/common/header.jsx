import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RippleButton } from '@/components/ui/ripple-button';
import { DotPattern } from '@/components/ui/dot-pattern';

const Header = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="relative">
                <DotPattern
                    className="absolute inset-0 opacity-5"
                    size={32}
                    radius={1.5}
                    offset={0}
                />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-8">
                            <Link to="/" className="flex items-center gap-2">
                                <motion.div
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-8 h-8 bg-blue-600 rounded-lg"
                                />
                                <span className="text-xl font-semibold">TaskMaster</span>
                            </Link>
                            <nav className="hidden md:flex items-center gap-6">
                                <Link to="/features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                    Features
                                </Link>
                                <Link to="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                    Pricing
                                </Link>
                                <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                    About
                                </Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-4">
                            <RippleButton
                                as={Link}
                                to="/login"
                                variant="outline"
                                className="hidden md:block px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                            >
                                Log in
                            </RippleButton>
                            <RippleButton
                                as={Link}
                                to="/signup"
                                variant="primary"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                                Get Started
                            </RippleButton>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;