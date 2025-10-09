import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, HelpCircle } from 'lucide-react';
import mainLogo from '@/assets/mainLogo.svg';
import mainLogoDark from '@/assets/mainLogo-foreground.svg';
import { cn } from '@/lib/utils';

export const FAQPage = () => {
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [animate, setAnimate] = useState(false);
    const [openIndex, setOpenIndex] = useState(null);

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

    const faqs = [
        {
            question: "How do I submit an executive checkup request?",
            answer: "To submit a request, log in to your account and navigate to your dashboard. Click on 'Submit New Request' button, fill out the required information including request type (Letter of Approval or Letter of Authorization), hospital preference, and upload any necessary supporting documents. Once completed, click 'Submit Request' to send it for Human Resource review."
        },
        {
            question: "What are the different stages of the approval process?",
            answer: "The MetroExecuCare system follows a comprehensive 5-stage approval workflow:\n\n1. **Request Submission** - You submit your checkup request with supporting documents\n2. **Human Resource Review** - HR Personnel review and assign the appropriate hospital\n3. **Benefits Officer Review** - Benefits Officer validates and approves benefits allocation\n4. **Division Head Review** - Division Head provides final policy approval\n5. **Final Human Resource Verification** - HR performs final document verification before sending to you\n\nEach stage ensures thorough review and proper authorization of your request."
        },
        {
            question: "How long does the approval process typically take?",
            answer: "The approval timeline varies depending on the complexity of your request and current workload. Typically:\n\n- Human Resource initial review: 1-2 business days\n- Benefits Officer review: 1-2 business days\n- Division Head review: 1-2 business days\n- Final HR verification: 1 business day\n\nTotal processing time is usually 4-7 business days. You'll receive email notifications at each stage, and you can track your request's progress in real-time through the Request Status Tracker."
        },
        {
            question: "What types of checkup requests can I submit?",
            answer: "MetroExecuCare supports two types of executive checkup requests:\n\n1. **Letter of Approval** - For standard executive checkup procedures at accredited hospitals\n2. **Letter of Authorization** - For specific medical procedures requiring special authorization\n\nBoth types follow the same 5-stage approval workflow and require proper documentation and hospital assignment."
        },
        {
            question: "How do I track the status of my request?",
            answer: "You can track your request status in multiple ways:\n\n1. **Dashboard Status Cards** - Your dashboard displays the current status of all your requests with color-coded indicators\n2. **Request Status Tracker** - Click on any request card to view detailed progress through all 5 stages\n3. **Email Notifications** - You'll receive automatic email updates whenever your request moves to a new stage\n4. **Request History** - Access your complete request history from your profile to review past submissions\n\nThe status tracker shows you exactly which stage your request is in and what action is being taken."
        },
        {
            question: "What documents do I need to upload with my request?",
            answer: "**Required Documents:**\n\n**For Letter of Approval:**\n- The filled-out Letter of Approval template (available in the submission form)\n- Supporting medical documents if needed (prescriptions, referrals, etc.)\n\n**For Letter of Authorization:**\n- The filled-out Letter of Authorization template (available in the submission form)\n- Supporting medical documents if needed (medical certificates, test results, etc.)\n\n**Upload Guidelines:**\n- Documents must be in PDF format only\n- Maximum file size: 10MB per file\n- You can upload multiple documents by using the upload button multiple times\n- Each upload adds one file to your submission\n\n**Important:** Ensure all necessary documents are complete and uploaded before submitting your request. Reviewers will evaluate based solely on the initially submitted materials. Incomplete documentation may result in rejection."
        },
        {
            question: "Can I edit or cancel my request after submission?",
            answer: "Once submitted, requests cannot be edited to maintain audit trail integrity and ensure proper documentation.\n\n**Important Notes:**\n- There is no edit functionality after submission\n- Reviewers can only approve or reject requests based on the initially submitted documents\n- If your request is rejected at any stage, you will receive feedback explaining the reason\n- After rejection, you can submit a new request with corrected information and complete documentation\n\n**Best Practice:** Ensure all information and documents are complete and accurate before submitting your request to avoid rejection."
        },
        {
            question: "What happens after my request is approved?",
            answer: "After final approval and HR verification (Stage 5), you will:\n\n1. **Receive Email Notification** - You'll get a comprehensive email with all approved documents\n2. **Download Documents** - Access your Letter of Approval/Authorization and other documents from your dashboard\n3. **Hospital Coordination** - The assigned hospital will be notified and you can schedule your checkup\n4. **Request Completion** - Your request status changes to 'Completed' and moves to your request history\n\nAll approved documents include download links and can be accessed anytime from your account."
        },
        {
            question: "Why was my request rejected and what should I do?",
            answer: "Requests may be rejected at any stage for various reasons:\n\n**Common Rejection Reasons:**\n- Incomplete or missing documentation\n- Non-compliance with benefits policy\n- Ineligibility for requested checkup type\n- Issues with hospital assignment or availability\n\n**What to Do:**\n1. Check your email for detailed rejection feedback from the reviewer\n2. Review the comments provided in your request details\n3. Address the issues mentioned in the rejection\n4. Submit a new request with corrected information and proper documentation\n\nYou'll receive guidance from Human Resource if you need clarification on the rejection."
        },
        {
            question: "How do I download my approved checkup documents?",
            answer: "Once your request reaches 'Completed' status:\n\n1. **Via Email** - Click the download links in your final approval email\n2. **Via Dashboard** - Go to your dashboard, click on the completed request card, and use the 'Download' buttons for each document\n3. **Via Request History** - Access your request history from your profile and download documents from past requests\n\nAll documents are securely stored and accessible anytime. Downloaded files include:\n- Letter of Approval/Authorization\n- Hospital assignment details\n- Any additional supporting documents\n\nDocuments are in PDF format and can be presented to the assigned hospital for your checkup."
        }
    ];

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

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

                    {/* FAQ List */}
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:scale-[1.02] p-[3px]",
                                    animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
                                    openIndex === index ? 'shadow-xl scale-[1.02]' : 'hover:shadow-lg'
                                )}
                                style={{
                                    transitionDelay: `${100 + index * 50}ms`,
                                    background: "linear-gradient(45deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%)"
                                }}
                            >
                                <div className="bg-white rounded-[calc(1rem-3px)] overflow-hidden">
                                    {/* Question Button */}
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-muted/50 transition-colors cursor-pointer"
                                    >
                                        <span className="font-semibold text-base md:text-lg text-foreground pr-4">
                                            {faq.question}
                                        </span>
                                        <ChevronDown
                                            className={cn(
                                                "h-5 w-5 text-primary flex-shrink-0 transition-transform duration-300",
                                                openIndex === index ? 'rotate-180' : ''
                                            )}
                                        />
                                    </button>

                                    {/* Answer Dropdown */}
                                    <div
                                        className={cn(
                                            "overflow-hidden transition-all duration-300 ease-in-out",
                                            openIndex === index ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
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
                        ))}
                    </div>

                    {/* Still Have Questions CTA */}
                    <div
                        className={`text-center mt-16 rounded-3xl p-[3px] transition-all duration-700 delay-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                        style={{
                            background: "linear-gradient(45deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%)"
                        }}
                    >
                        <div className="bg-white rounded-[calc(1.5rem-3px)] p-8 md:p-12">
                            <h2 className="text-2xl font-bold text-primary mb-4">Still Have Questions?</h2>
                            <p className="text-muted-foreground mb-6">
                                Contact your Human Resource Personnel for additional assistance with your checkup requests.
                            </p>
                            <button
                                onClick={() => navigate('/loginpage')}
                                className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl cursor-pointer"
                            >
                                Login to Your Account
                            </button>
                        </div>
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

export default FAQPage;
