import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const NavItems = [
    {name: "Home", href: "/"},
    {name: "About Us", href: "/about"},
    {name: "FAQ", href: "/faq"},
    {name: "Login", href: "/loginpage"},
]

export const NavbarSection = () => {

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [animate, setAnimate] = useState(false);

    const currentPath = window.location.pathname; 
    const isLoginPage = currentPath === "/loginpage"
    const filteredNavItems = NavItems.filter(
        (item) => !(item.name === "Login" && currentPath === "/loginpage")
    );
    
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);

        // Trigger animation on mount
        setTimeout(() => setAnimate(true), 100);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <nav className={cn(
            "fixed top-0 w-full z-40 transition-all duration-300 ease-in-out", 
            isLoginPage
                ? isScrolled 
                    ? `py-4 bg-white/20 ${animate ? "slide-in-bottom" : "opacity-0 translate-y-10"}`
                    : `py-6 bg-transparent ${animate ? "slide-in-bottom" : "opacity-0 translate-y-10"}`
                        
                : isScrolled
                    ? `py-5 bg-background/50 backdrop-blur-md shadow-xs ${animate ? 'slide-in-bottom' : 'opacity-0 translate-y-10'}` 
                    : `py-5 bg-background/50 backdrop-blur-md ${animate ? 'slide-in-bottom' : 'opacity-0 translate-y-10'}` 
        )}>

       
            {/*Desktop Navbar*/}
            <div className={`hidden md:flex space-x-8 ${!isScrolled ? "pt-8 transition-all duration-300" : "transition-all duration-300"}`}>
                <div className="container flex items-center justify-center text-l mx-auto">

                    <div className="flex space-x-8 justify-center items-center">
                        {filteredNavItems
                            .filter(item => item.name !== "Login")
                            .map((item, key) => (
                                <a
                                    key={key}
                                    href={item.href}
                                    className={cn("min-w-[120px] font-light border-2 px-15 rounded-full hover:bg-primary hover:text-primary-foreground",
                                        isLoginPage
                                            ? `border-white text-white`
                                            : `border-primary text-primary`
                                    )}
                                >
                                    {item.name}
                                </a>
                            ))
                        }
                        {filteredNavItems.find(item => item.name === "Login") && (
                            <a
                                href="/loginpage"
                                className="min-w-[120px] font-light border-2 px-15 rounded-full border-primary bg-primary text-primary-foreground hover:bg-primary-foreground hover:text-primary hover:cursor-pointer transition-colors duration-300"
                            >
                                Login
                            </a>
                        )}
                    </div>

                    {/* {filteredNavItems.map((item, key) => (
                        <a key={key} href={item.href} className={
                            item.name === "Login"
                           ? "font-light border-2 ml-50 px-10 rounded-full border-primary bg-primary text-primary-foreground hover:bg-primary-foreground hover:text-primary hover:cursor-pointer transition-colors duration-300"
                           : `font-light border-2 px-10 rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground`}>
                            {item.name}
                        </a>
                    ))} */}
                </div>
            </div>


             {/*mobile nav */}
            <button
                onClick={()=> setIsMenuOpen((prev) => !prev)}
                className={cn(
                    "md:hidden fixed top-4 right-4 z-50 p-3 rounded-lg transition-all duration-300",
                    "hover:bg-primary/10 active:scale-95",
                    isMenuOpen
                        ? "bg-white/10 backdrop-blur-sm"
                        : "bg-transparent"
                )}
                aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
                >
                {isMenuOpen
                ? <X className="text-primary-foreground transition-transform duration-300 rotate-90" size={28}/>
                : <Menu className={cn(
                    "transition-all duration-300",
                    isLoginPage ? "text-white" : "text-primary"
                )} size={28}/>}
            </button>

            {/* Mobile Menu Overlay */}
            <div className={cn(
                "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300",
                isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )} onClick={() => setIsMenuOpen(false)} />

            {/* Mobile Menu Panel */}
            <div className={cn(
                "fixed top-0 right-0 h-screen w-[280px] bg-primary z-40 md:hidden",
                "transition-transform duration-300 ease-out shadow-2xl",
                isMenuOpen ? "translate-x-0" : "translate-x-full"
            )}>
                <div className="flex flex-col h-full pt-20 px-6">
                    {/* Menu Items */}
                    <div className="flex flex-col space-y-2">
                        {NavItems.map((item, key) => (
                            <a
                                key={key}
                                href={item.href}
                                className={cn(
                                    "text-primary-foreground px-4 py-3 rounded-lg font-medium transition-all duration-200",
                                    "hover:bg-white/10 hover:pl-6 active:scale-95",
                                    item.name === "Login" && "mt-4 bg-white/20 border border-white/30"
                                )}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.name}
                            </a>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pb-8 text-center">
                        <p className="text-primary-foreground/60 text-xs">
                            MetroExecuCare © 2025
                        </p>
                    </div>
                </div>
            </div>
        </nav>
    )
}