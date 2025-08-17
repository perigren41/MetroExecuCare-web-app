import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";


const NavItems = [
    {name: "Home", href: "#home"},
    {name: "About us", href: "#about"},
    {name: "FAQ", href: "#faq"},
    {name: "Contact", href: "#contact"},
    {name: "Login", href: "/loginpage"},
]

export const NavbarSection = () => {

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [animate, setAnimate] = useState(false);
    
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
        <nav className={cn("fixed w-full z-40 transition-all duration-300 ease-in-out", 
        isScrolled ? `py-5 bg-background/50 backdrop-blur-md shadow-xs ${animate ? 'slide-in-bottom' : 'opacity-0 translate-y-10'}` : `py-5 bg-background/50 backdrop-blur-md ${animate ? 'slide-in-bottom' : 'opacity-0 translate-y-10'}`)}>

            {/*Desktop Navbar*/}
            <div className={`hidden md:flex space-x-8 ${!isScrolled ? "pt-8 transition-all duration-300" : "transition-all duration-300"}`}>
                <div className="container flex items-center justify-between text-l w-2xl mx-auto">
                    {NavItems.map((item, key) => (
                        <a key={key} href={item.href} className={
                            item.name === "Login"
                           ? "font-light border-2 ml-5 px-10 rounded-full border-primary bg-primary text-primary-foreground hover:bg-primary-foreground hover:text-primary hover:cursor-pointer transition-colors duration-300"
                           : `font-light border-2 px-6 rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground`}>
                            {item.name}
                        </a>
                    ))}
                </div>
            </div>


             {/*mobile nav */}
            <button 
                onClick={()=> setIsMenuOpen((prev) => !prev)}
                className="md:hidden px-7 text-foreground z-50 flex justify-start"
                aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
                > 
                {isMenuOpen 
                ? <X className="text-primary-foreground z-50" size={34}/> 
                : <Menu className="text-primary" size={34}/>}

            </button>

            <div className={cn(
                "fixed h-screen inset-0 bg-background/80 backdrop-blur-md z-40 flex flex-col items-center justify-center",
                "transition-all duration-300 md:hidden", 
                isMenuOpen 
                ? "bg-primary text-primary opacity-95 pointer-events-auto" 
                : "opacity-0 pointer-events-none"

            )}>
                <div className="flex flex-col space-y-15 text-2xl">
                    {NavItems.map((item, key) =>(
                        <a key={key}
                            href={item.href}
                            className="text-primary-foreground hover:text-primary transition-colors duration-300"
                            onClick={() => setIsMenuOpen(false)} >
                            {item.name}
                        </a>
                    ))}
                </div>
            </div>
        </nav>
    )
}