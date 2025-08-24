import { FastForward,  LockKeyhole, RefreshCw, Folders } from 'lucide-react';

export const FeaturesSection = () => {
    return (
        <section id="features" className="flex flex-col items-center justify-center min-h-screen w-full">
            <div className="w-full gradient-bg-border p-8">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-mainWhite mb-8 text-center">
                    MetroExecuCare Features
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ">

                    {/* Feature 1 */}
                    <div className="flex flex-col items-center p-6 transition-transform transform hover:scale-105">
                            
                        <h3 className="text-xl from-thin text-mainWhite mb-4">Faster Processing</h3>
                        <FastForward className="w-30 h-30 text-mainWhite"/>
                        <p className="text-mainWhite text-sm mt-3">Speeding up your workflow effortlessly.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="flex flex-col items-center p-6 transition-transform transform hover:scale-105">
                        <h3 className="text-xl from-thin text-mainWhite mb-4">Secure Access</h3>
                        <LockKeyhole className="w-30 h-30 text-mainWhite"/>
                        <p className="text-mainWhite text-sm mt-3">
                            Access with confidence and safety.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="flex flex-col items-center p-6 transition-transform transform hover:scale-105">
                        <h3 className="text-xl from-thin text-mainWhite mb-4">Real Time Updates</h3>
                        <RefreshCw className="w-30 h-30 text-mainWhite"/>

                        <p className="text-mainWhite text-sm mt-3">
                            Always up-to-date, always informed.
                        </p>
                    </div>
                    {/* Feature 4 */}
                    <div className="flex flex-col items-center p-6 transition-transform transform hover:scale-105">
                        <h3 className="text-xl from-thin text-mainWhite mb-4">Accessible Records</h3>
                        <Folders className="w-30 h-30 text-mainWhite"/>

                        <p className="text-mainWhite text-sm mt-3">
                            Keeping your history within reach.
                        </p>
                    </div>
                    
                </div>
            </div>
        </section>
    )
}