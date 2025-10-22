import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, HelpCircle, Loader2 } from 'lucide-react';
import mainLogo from '@/assets/mainLogo.svg';
import mainLogoDark from '@/assets/mainLogo-foreground.svg';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export const FAQPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [animate, setAnimate] = useState(false);
    const [openIndex, setOpenIndex] = useState(null);
    const [faqCategories, setFaqCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    // Fetch FAQs from the database
    useEffect(() => {
        const fetchFAQs = async () => {
            try {
                setLoading(true);
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
                const response = await fetch(`${API_BASE_URL}/faqs`);
                const data = await response.json();

                if (data.success) {
                    // Transform the grouped FAQs into the format expected by the component
                    const transformedCategories = Object.entries(data.data.categories).map(([categoryName, faqs]) => ({
                        category: categoryName,
                        faqs: faqs.map(faq => ({
                            id: faq.id,
                            question: faq.question,
                            answer: faq.answer
                        }))
                    }));

                    setFaqCategories(transformedCategories);
                } else {
                    setError('Failed to load FAQs');
                }
            } catch (err) {
                console.error('Error fetching FAQs:', err);
                setError('Failed to load FAQs. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchFAQs();
    }, []);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => {
                            if (user) {
                                // User is logged in, route to appropriate dashboard based on role
                                const roleRoutes = {
                                    'admin': '/admin-users-page',
                                    'hr_personnel': '/hr-dashboard',
                                    'benefits_officer': '/benefits-officer-dashboard',
                                    'welfare_head': '/welfare-head-dashboard',
                                    'executive_employee': '/executive-employee-dashboard'
                                };
                                const dashboardRoute = roleRoutes[user.role] || '/executive-employee-dashboard';
                                navigate(dashboardRoute);
                            } else {
                                // Not logged in, go to landing page
                                navigate('/');
                            }
                        }}
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
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Hero Section */}
                    <div className={`text-center mb-16 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <HelpCircle className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                            Find answers to common questions about using MetroExecuCare
                        </p>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                            <p className="text-muted-foreground">Loading FAQs...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="text-center py-16">
                            <p className="text-red-500 mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Category-Based FAQ List */}
                    {!loading && !error && (
                        <div className="space-y-12">
                            {faqCategories.length === 0 ? (
                                <div className="text-center py-16">
                                    <p className="text-muted-foreground">No FAQs available at the moment.</p>
                                </div>
                            ) : (
                                faqCategories.map((category, categoryIndex) => (
                            <div
                                key={categoryIndex}
                                className={cn(
                                    "transition-all duration-700",
                                    animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                )}
                                style={{ transitionDelay: `${100 + categoryIndex * 100}ms` }}
                            >
                                {/* Category Header */}
                                <div className="flex items-center gap-3 mb-6">
                                    <h2 className="text-2xl md:text-3xl font-bold text-primary">
                                        {category.category}
                                    </h2>
                                </div>

                                {/* FAQs in Category */}
                                <div className="space-y-4">
                                    {category.faqs.map((faq, faqIndex) => {
                                        const globalIndex = `${categoryIndex}-${faqIndex}`;
                                        return (
                                            <div
                                                key={faqIndex}
                                                className={cn(
                                                    "rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:scale-[1.02] p-[3px]",
                                                    openIndex === globalIndex ? 'shadow-xl scale-[1.02]' : 'hover:shadow-lg'
                                                )}
                                                style={{
                                                    background: "linear-gradient(45deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%)"
                                                }}
                                            >
                                                <div className="bg-white rounded-[calc(1rem-3px)] overflow-hidden">
                                                    {/* Question Button */}
                                                    <button
                                                        onClick={() => toggleFAQ(globalIndex)}
                                                        className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-muted/50 transition-colors cursor-pointer"
                                                    >
                                                        <span className="font-semibold text-base md:text-lg text-foreground pr-4">
                                                            {faq.question}
                                                        </span>
                                                        <ChevronDown
                                                            className={cn(
                                                                "h-5 w-5 text-primary flex-shrink-0 transition-transform duration-300",
                                                                openIndex === globalIndex ? 'rotate-180' : ''
                                                            )}
                                                        />
                                                    </button>

                                                    {/* Answer Dropdown */}
                                                    <div
                                                        className={cn(
                                                            "overflow-hidden transition-all duration-300 ease-in-out",
                                                            openIndex === globalIndex ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                                                        )}
                                                    >
                                                        <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-2 border-t border-border/50">
                                                            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                                                {faq.answer}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                            )}
                        </div>
                    )}
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

export default FAQPage;
