import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RippleButton } from '@/components/ui/ripple-button';
import { DotPattern } from '@/components/ui/dot-pattern';
import { AnimatedBeam } from '@/components/ui/animated-beam';
import { SafariWindow } from '@/components/ui/safari-window';
import { Marquee } from '@/components/ui/marquee';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';

const HomePage = () => {
    // Refs for animated beams
    const containerRef = useRef(null);
    const feature1Ref = useRef(null);
    const feature2Ref = useRef(null);
    const feature3Ref = useRef(null);
    const feature4Ref = useRef(null);
    const feature5Ref = useRef(null);
    const feature6Ref = useRef(null);

    const features = [
        {
            title: "Task Organization",
            description: "Organize tasks with intuitive drag-and-drop interfaces and smart categorization.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            )
        },
        {
            title: "Team Collaboration",
            description: "Work together seamlessly with real-time updates and team chat features.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            title: "Progress Tracking",
            description: "Monitor project progress with visual charts and detailed analytics.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        },
        {
            title: "Smart Automation",
            description: "Automate repetitive tasks and workflows with intelligent rules.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            )
        },
        {
            title: "File Management",
            description: "Organize and share files with built-in document management.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            title: "Integration Hub",
            description: "Connect with your favorite tools and services seamlessly.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            )
        }
    ];

    const testimonials = [
        {
            quote: "TaskMaster has transformed how our team collaborates. It's intuitive and powerful!",
            author: "Sarah Johnson",
            role: "Product Manager at TechCorp",
            image: "/assets/img/default-avatar.png"
        },
        {
            quote: "The best task management tool we've ever used. It's helped us increase productivity by 40%.",
            author: "Michael Chen",
            role: "CTO at StartupX",
            image: "/assets/img/default-avatar.png"
        },
        {
            quote: "The automation features have saved us countless hours. Highly recommended!",
            author: "Emma Davis",
            role: "Project Manager at DesignCo",
            image: "/assets/img/default-avatar.png"
        },
        {
            quote: "TaskMaster's analytics have given us valuable insights into team performance.",
            author: "David Wilson",
            role: "Team Lead at DataFlow",
            image: "/assets/img/default-avatar.png"
        }
    ];

    const pricingPlans = [
        {
            name: "Free",
            price: "$0",
            features: [
                "Up to 5 team members",
                "Basic task management",
                "File sharing",
                "Basic analytics"
            ],
            cta: "Get Started"
        },
        {
            name: "Pro",
            price: "$12",
            features: [
                "Unlimited team members",
                "Advanced task management",
                "Priority support",
                "Advanced analytics",
                "Custom integrations"
            ],
            cta: "Start Free Trial",
            popular: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            features: [
                "Everything in Pro",
                "Dedicated support",
                "Custom branding",
                "SLA guarantee",
                "Advanced security"
            ],
            cta: "Contact Sales"
        }
    ];

    return (
        <div className="hero-gradient">
            <div className="hero-glow" />
            
            {/* Navigation */}
            <nav className="nav-glass">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
                        <span className="text-white font-semibold text-xl">TaskMaster</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link to="/signin" className="text-white/80 hover:text-white transition-colors">
                            Sign in
                        </Link>
                        <Link to="/signup" className="button-primary">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32">
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="glass-effect inline-block mb-8 px-4 py-2 text-white/80 text-sm font-medium"
                        >
                            🚀 The Future of Task Management
                        </motion.div>
                        <h1 className="gradient-text text-6xl font-bold mb-6">
                            A powerful suite of user-centric products
                        </h1>
                        <p className="text-xl text-blue-100/80 mb-8 max-w-2xl mx-auto">
                            Our landing page template works on all devices, so you only have to set it up once, and get beautiful results forever.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button className="button-primary">
                                Get Started Free
                            </button>
                            <button className="button-secondary">
                                Watch Demo
                            </button>
                        </div>
                    </motion.div>
                </div>
                
                {/* Preview Window */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mt-20 relative max-w-6xl mx-auto px-4"
                >
                    <div className="glass-effect p-2 rounded-2xl shadow-2xl shadow-blue-500/10">
                        <img
                            src="/assets/img/hero-image.png"
                            alt="TaskMaster Dashboard Preview"
                            className="w-full h-auto rounded-xl"
                        />
                    </div>
                </motion.div>
            </section>

            {/* Features Section with Modern Cards */}
            <section className="py-24 bg-white relative">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-block mb-4 px-4 py-2 rounded-full bg-purple-50 text-purple-600 text-sm font-medium"
                        >
                            Features
                        </motion.div>
                        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Everything you need to manage tasks
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Powerful features to help your team succeed and stay organized
                        </p>
                    </div>
                    <div ref={containerRef} className="relative">
                        <BentoGrid className="max-w-6xl mx-auto">
                            {features.map((feature, index) => (
                                <div key={feature.title} ref={
                                    index === 0 ? feature1Ref :
                                    index === 1 ? feature2Ref :
                                    index === 2 ? feature3Ref :
                                    index === 3 ? feature4Ref :
                                    index === 4 ? feature5Ref :
                                    feature6Ref
                                }>
                                    <BentoGridItem
                                        title={feature.title}
                                        description={feature.description}
                                        icon={feature.icon}
                                        className={`animate-in fade-in delay-${index * 100} bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300`}
                                    />
                                </div>
                            ))}
                        </BentoGrid>

                        {/* Animated Beams with Updated Style */}
                        <AnimatedBeam
                            containerRef={containerRef}
                            fromRef={feature1Ref}
                            toRef={feature2Ref}
                            curvature={-50}
                            duration={8}
                            className="opacity-30"
                        />
                        <AnimatedBeam
                            containerRef={containerRef}
                            fromRef={feature2Ref}
                            toRef={feature3Ref}
                            curvature={50}
                            duration={8}
                            className="opacity-30"
                        />
                        <AnimatedBeam
                            containerRef={containerRef}
                            fromRef={feature3Ref}
                            toRef={feature4Ref}
                            curvature={-50}
                            duration={8}
                            className="opacity-30"
                        />
                        <AnimatedBeam
                            containerRef={containerRef}
                            fromRef={feature4Ref}
                            toRef={feature5Ref}
                            curvature={50}
                            duration={8}
                            className="opacity-30"
                        />
                        <AnimatedBeam
                            containerRef={containerRef}
                            fromRef={feature5Ref}
                            toRef={feature6Ref}
                            curvature={-50}
                            duration={8}
                            className="opacity-30"
                        />
                    </div>
                </div>
            </section>

            {/* How It Works Section with Modern Design */}
            <section className="py-24 bg-gradient-to-b from-white to-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-block mb-4 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-medium"
                        >
                            How It Works
                        </motion.div>
                        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Simple steps to get started
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Get up and running in minutes with our intuitive setup process
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            {
                                step: "1",
                                title: "Create Your Workspace",
                                description: "Set up your team workspace and invite members in seconds."
                            },
                            {
                                step: "2",
                                title: "Organize Tasks",
                                description: "Create, assign, and organize tasks with our intuitive interface."
                            },
                            {
                                step: "3",
                                title: "Track Progress",
                                description: "Monitor team progress and celebrate achievements together."
                            }
                        ].map((item) => (
                            <motion.div
                                key={item.step}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-6">
                                    {item.step}
                                </div>
                                <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
                                <p className="text-gray-600 text-lg">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section with Modern Cards */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-block mb-4 px-4 py-2 rounded-full bg-purple-50 text-purple-600 text-sm font-medium"
                        >
                            Testimonials
                        </motion.div>
                        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Loved by teams worldwide
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            See what others are saying about TaskMaster
                        </p>
                    </div>
                    <Marquee className="py-12" pauseOnHover speed={50}>
                        {testimonials.map((testimonial) => (
                            <div
                                key={testimonial.author}
                                className="mx-4 bg-white p-8 rounded-2xl shadow-lg min-w-[350px] border border-gray-100"
                            >
                                <div className="flex items-center mb-6">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.author}
                                        className="w-16 h-16 rounded-full mr-4 border-4 border-blue-100"
                                    />
                                    <div>
                                        <h4 className="font-semibold text-lg">{testimonial.author}</h4>
                                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 text-lg leading-relaxed">"{testimonial.quote}"</p>
                                <div className="mt-6 flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </Marquee>
                </div>
            </section>

            {/* Pricing Section with Modern Cards */}
            <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-block mb-4 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-medium"
                        >
                            Pricing
                        </motion.div>
                        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Choose the plan that's right for your team
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {pricingPlans.map((plan) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className={`bg-white p-8 rounded-2xl shadow-lg relative ${
                                    plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                                }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-1 rounded-full text-sm font-medium">
                                        Most Popular
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <div className="text-5xl font-bold mb-6">
                                    {plan.price}
                                    {plan.price !== "Custom" && <span className="text-gray-500 text-lg">/month</span>}
                                </div>
                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center text-gray-600">
                                            <svg className="w-5 h-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <RippleButton
                                    as={Link}
                                    to={plan.name === "Enterprise" ? "/contact" : "/signup"}
                                    variant={plan.popular ? "primary" : "outline"}
                                    className={`w-full py-4 rounded-xl ${
                                        plan.popular 
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25' 
                                            : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
                                    }`}
                                >
                                    {plan.cta}
                                </RippleButton>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Integration Section with Modern Design */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-block mb-4 px-4 py-2 rounded-full bg-purple-50 text-purple-600 text-sm font-medium"
                        >
                            Integrations
                        </motion.div>
                        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Works with Your Favorite Tools
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Seamlessly integrate with the tools you already use
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                        {[
                            "Slack", "GitHub", "Google Drive", "Microsoft Teams",
                            "Jira", "Trello", "Asana", "Notion"
                        ].map((tool) => (
                            <motion.div
                                key={tool}
                                whileHover={{ scale: 1.05 }}
                                className="bg-white p-6 rounded-2xl shadow-lg text-center border border-gray-100 hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <span className="text-gray-700 font-medium">{tool}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section with Modern Design */}
            <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-600 relative overflow-hidden">
                <DotPattern
                    className="absolute inset-0 opacity-10"
                    size={32}
                    radius={1.5}
                    offset={0}
                    invert
                />
                <div className="container mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl mx-auto"
                    >
                        <h2 className="text-4xl font-bold text-white mb-6">
                            Ready to transform your task management?
                        </h2>
                        <p className="text-xl text-blue-100 mb-8">
                            Join thousands of teams who have already improved their productivity with TaskMaster.
                        </p>
                        <RippleButton
                            as={Link}
                            to="/signup"
                            variant="secondary"
                            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-full font-semibold hover:bg-blue-50 shadow-lg"
                        >
                            Start Your Free Trial
                        </RippleButton>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
