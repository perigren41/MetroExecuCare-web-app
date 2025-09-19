import { Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export const ThemeToggle = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const storedThemeToggle = localStorage.getItem('theme');

        if (storedThemeToggle === "dark"){
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        }
        else {
            localStorage.setItem('theme', 'light');~
            setIsDarkMode(false);
        }
    }, []);

    const themeToggle = () => {
        if(isDarkMode){
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDarkMode(false);
        }
        else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDarkMode(true);
        }
    }

    return (
            <button
                className="fixed z-41 top-5 right-5 p-2 rounded-full hover:bg-primary/90 hover:text-primary cursor-pointer transition-colors duration-300"
                onClick={themeToggle}>
                {isDarkMode ? 
                    <Sun className="w-6 h-6 text-yellow-500" />
                    :
                    <Moon className="w-6 h-6 text-blue-600"/>
                }
            </button>
    );
}