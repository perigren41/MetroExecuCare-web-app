import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Shield, Clock, Users } from 'lucide-react';
import mainLogo from '@/assets/mainLogo.svg';
import mainLogoDark from '@/assets/mainLogo-foreground.svg';

export const AboutUsPage = () => {
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [animate, setAnimate] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };
        checkDarkMode();
        window.addEventListener('storage', checkDarkMode);
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        // Trigger animation on mount
        setTimeout(() => setAnimate(true), 100);

        return () => {
            window.removeEventListener('storage', checkDarkMode);
            observer.disconnect();
        };
    }, []);

    const features = [
        {
            icon: Heart,
            title: "Employee-Centric Care",
            description: "We prioritize the health and well-being of Metrobank executives through streamlined healthcare request processing."
        },
        {
            icon: Shield,
            title: "Secure & Compliant",
            description: "Advanced security measures ensure all health information and requests are handled with the utmost confidentiality."
        },
        {
            icon: Clock,
            title: "Efficient Workflow",
            description: "Our 5-stage approval process ensures thorough review while maintaining quick turnaround times."
        },
        {
            icon: Users,
            title: "Multi-Level Approval",
            description: "Comprehensive review from Human Resource, Benefits Officer, and Division Head ensures proper authorization."
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-medium">Back to Home</span>
                    </button>
                    <img
                        src={isDarkMode ? mainLogoDark : mainLogo}
                        alt="MetroExecuCare Logo"
                        className="h-12 w-auto"
                    />
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Hero Section */}
                    <div className={`text-center mb-16 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
                            About MetroExecuCare
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                            Your trusted partner in executive healthcare management
                        </p>
                    </div>

                    {/* Mission Section */}
                    <div
                        ref={contentRef}
                        className={`rounded-3xl shadow-lg mb-12 p-[3px] transition-all duration-700 delay-100 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                        style={{
                            background: "linear-gradient(45deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%)"
                        }}
                    >
                        <div className="bg-white rounded-[calc(1.5rem-3px)] p-8 md:p-12">
                            <h2 className="text-3xl font-bold text-primary mb-6">Our Mission</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                                MetroExecuCare is dedicated to streamlining the executive checkup request process for Metrobank.
                                We provide a comprehensive digital platform that simplifies healthcare authorization workflows,
                                ensuring that executives receive timely access to quality healthcare services.
                            </p>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Our system facilitates seamless communication between executives, Human Resource personnel,
                                Benefits Officers, and Division Heads, creating an efficient and transparent approval process
                                from submission to final authorization.
                            </p>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-8 md:mb-10">Why Choose MetroExecuCare?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className={`rounded-2xl shadow-md p-[3px] hover:shadow-xl transition-all duration-300 hover:scale-105 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                                    style={{
                                        transitionDelay: `${200 + index * 100}ms`,
                                        background: "linear-gradient(45deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%)"
                                    }}
                                >
                                    <div className="bg-white rounded-[calc(1rem-3px)] p-6 md:p-8 h-full">
                                        <div className="flex items-start gap-4 h-full">
                                            <div className="flex-shrink-0">
                                                <feature.icon className="h-8 w-8 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
                                                    {feature.title}
                                                </h3>
                                                <p className="text-muted-foreground">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Workflow Overview */}
                    <div
                        className={`rounded-3xl p-[3px] transition-all duration-700 delay-300 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                        style={{
                            background: "linear-gradient(45deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%)"
                        }}
                    >
                        <div className="bg-white rounded-[calc(1.5rem-3px)] p-8 md:p-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 md:mb-6 text-center">Our Process</h2>
                        <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6 md:mb-8 text-center max-w-3xl mx-auto">
                            MetroExecuCare implements a comprehensive 5-stage approval workflow to ensure thorough review and proper authorization of all executive checkup requests.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                            {[
                                { step: '1', title: 'Request Submission', desc: 'Executive submits checkup request' },
                                { step: '2', title: 'Human Resource Review', desc: 'Initial processing and hospital assignment' },
                                { step: '3', title: 'Benefits Officer Review', desc: 'Benefits validation and approval' },
                                { step: '4', title: 'Division Head Review', desc: 'Final policy approval' },
                                { step: '5', title: 'Final Verification', desc: 'Document verification and completion' }
                            ].map((stage, index) => (
                                <div key={index} className="text-center">
                                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                                        {stage.step}
                                    </div>
                                    <h4 className="font-semibold text-foreground mb-1 text-sm">
                                        {stage.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        {stage.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                        </div>
                    </div>

                    {/* Contact CTA */}
                    <div className={`text-center mt-16 transition-all duration-700 delay-400 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <h2 className="text-2xl font-bold text-primary mb-4">Ready to Get Started?</h2>
                        <p className="text-muted-foreground mb-6">
                            Access your executive healthcare benefits with ease.
                        </p>
                        <button
                            onClick={() => navigate('/loginpage')}
                            className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl cursor-pointer"
                        >
                            Login to Your Account
                        </button>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border py-8">
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                    <p className="text-sm">
                        © {new Date().getFullYear()} MetroExecuCare. All rights reserved.
                    </p>
                    <p className="text-xs mt-2">
                        A healthcare management solution for Metrobank executives.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default AboutUsPage;
