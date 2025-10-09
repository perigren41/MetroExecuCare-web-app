import { Send, LocateFixed, Download } from 'lucide-react';
import { Footer } from "@/Components/Footer.jsx";

export const HowItWorksSection = () => {
    return (
        <section 
            id="how-it-works" 
            className="flex flex-col min-h-screen w-full sm:pt-20 md:pt-20 lg:pt-20"
        >
            <div className="w-full bg flex-1">
                <h2 className="text-2xl md:text-4xl lg:text-4xl font-bold text-primary text-center mb-10 mt-5">
                    How It Works
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 mb-10">
                    {/* Feature 1 */}
                    <div className="flex flex-col items-center p-6 transition-transform transform hover:scale-105">
                        <h3 className="text-xl text-primary mb-4">Request</h3>
                        <Send className="w-30 h-30 text-primary" />
                        <p className="text-primary text-sm mt-3">
                            Submit your check-up request easily.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="flex flex-col items-center p-6 transition-transform transform hover:scale-105">
                        <h3 className="text-xl text-primary mb-4">Track</h3>
                        <LocateFixed className="w-30 h-30 text-primary" />
                        <p className="text-primary text-sm mt-3">
                            Stay updated every step of the way.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="flex flex-col items-center p-6 transition-transform transform hover:scale-105">
                        <h3 className="text-xl text-primary mb-4">Download</h3>
                        <Download className="w-30 h-30 text-primary" />
                        <p className="text-primary text-sm mt-3">
                            Download your LOA request with ease.
                        </p>
                    </div>
                </div>
            </div>

            {/* 👇 Footer only for this section */}
            <Footer />
        </section>
    )
}
