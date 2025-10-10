import mainLogo from '@/assets/mainLogo.svg';
import mainLogoDark from '@/assets/mainLogo-foreground.svg';
import { useEffect, useState, useRef } from 'react';
import { ArrowDown } from 'lucide-react';

export const HeroSection = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [animate, setAnimate] = useState(false);
    const [showArrow, setShowArrow] = useState(true);
    const heroRef = useRef(null);

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
        
        const handleIntersect = (entries) => {
            setShowArrow(entries[0].isIntersecting);
        };
        const io = new window.IntersectionObserver(handleIntersect, { threshold: 0.5 });
        if (heroRef.current) io.observe(heroRef.current);


        return () => {
            window.removeEventListener('storage', checkDarkMode);
            observer.disconnect();
            if (heroRef.current) io.disconnect();
        };
    }, []);

    return(
        <section ref={heroRef} id="hero" className="flex items-center justify-center min-h-screen w-full bg-background px-5">
            <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-8xl mx-auto gap-8 md:gap-5">
                {/* Logo on the left */}
                <div className={`flex-shrink-0 mb-8 md:mb-0 transition-all duration-700 ${animate ? 'slide-in-bottom' : 'opacity-0 translate-y-10'}`}>
                    <img 
                        src={isDarkMode ? mainLogoDark : mainLogo} 
                        alt="MetroExecuCare Logo"
                        className="w-110 h-70 md:w-100 md:h-100 lg:w-120 xl:w-160 xl:h-120 duration-300 ease-in-out"
                    />
                </div>
                {/* Text on the right */}
                <div className={`flex flex-col items-center md:items-center justify-center p-5 w-full md:max-w-md lg:max-w-lg xl:max-w-xl transition-opacity duration-1000 ${animate ? 'opacity-100' : 'opacity-0'}`}>
                    <h1 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary leading-snug mb-4 break-words">
                        Welcome to MetroExecuCare!
                    </h1>
                    <p className="text-sm md:text-base lg:text-lg text-secondary/80 mb-8">
                        Where health meets convenience.
                    </p>
                </div>
                
                {showArrow && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
                    <span className="text-sm text-primary mb-2">Scroll</span>
                    <ArrowDown className="h-5 w-5 text-primary"/>
                </div>
                )}
            </div>
        </section>
    )
}






