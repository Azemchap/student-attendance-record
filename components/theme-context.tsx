// context/ThemeProvider.tsx

"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

interface ThemeContextType {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
        }
        return 'light';
    });

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme); // Persist the theme
    };

    useEffect(() => {
        document.body.className = theme; // Apply the theme to the body
    }, [theme]);

    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <ThemeContext.Provider value={{ theme, toggleTheme }}>
                {children}
            </ThemeContext.Provider>
        </NextThemesProvider>
    );
};

// Custom hook to use the ThemeContext
export const useThemeContext = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useThemeContext must be used within a ThemeProvider");
    }
    return context;
};