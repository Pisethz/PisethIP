import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('pisethip-theme') || 'black';
    });

    const themes = {
        black: {
            name: 'Black',
            colors: {
                '--primary': '#ffffff',
                '--primary-light': '#f5f5f5',
                '--secondary': '#d1d5db',
                '--accent': '#9ca3af',
                '--bg-primary': '#000000',
                '--bg-secondary': '#0a0a0a',
                '--text-primary': '#ffffff',
                '--text-secondary': '#9ca3af',
                '--glass-bg': 'rgba(255, 255, 255, 0.03)',
                '--glass-border': 'rgba(255, 255, 255, 0.1)',
            }
        },
        cosmic: {
            name: 'Cosmic',
            colors: {
                '--primary': '#6366f1',
                '--primary-light': '#818cf8',
                '--secondary': '#ec4899',
                '--accent': '#14b8a6',
                '--bg-primary': '#0a0e27',
                '--bg-secondary': '#151932',
                '--text-primary': '#ffffff',
                '--text-secondary': '#a0aec0',
                '--glass-bg': 'rgba(255, 255, 255, 0.1)',
                '--glass-border': 'rgba(255, 255, 255, 0.2)',
            }
        },
        ocean: {
            name: 'Ocean',
            colors: {
                '--primary': '#0ea5e9',
                '--primary-light': '#38bdf8',
                '--secondary': '#10b981',
                '--accent': '#06b6d4',
                '--bg-primary': '#0f172a',
                '--bg-secondary': '#1e293b',
                '--text-primary': '#ffffff',
                '--text-secondary': '#94a3b8',
                '--glass-bg': 'rgba(255, 255, 255, 0.08)',
                '--glass-border': 'rgba(255, 255, 255, 0.15)',
            }
        },
        sunset: {
            name: 'Sunset',
            colors: {
                '--primary': '#f59e0b',
                '--primary-light': '#fbbf24',
                '--secondary': '#ef4444',
                '--accent': '#f97316',
                '--bg-primary': '#1a0f0a',
                '--bg-secondary': '#2d1810',
                '--text-primary': '#ffffff',
                '--text-secondary': '#d1a684',
                '--glass-bg': 'rgba(255, 255, 255, 0.06)',
                '--glass-border': 'rgba(255, 255, 255, 0.12)',
            }
        },
        forest: {
            name: 'Forest',
            colors: {
                '--primary': '#22c55e',
                '--primary-light': '#4ade80',
                '--secondary': '#eab308',
                '--accent': '#84cc16',
                '--bg-primary': '#052e16',
                '--bg-secondary': '#064e3b',
                '--text-primary': '#ffffff',
                '--text-secondary': '#86efac',
                '--glass-bg': 'rgba(255, 255, 255, 0.07)',
                '--glass-border': 'rgba(255, 255, 255, 0.14)',
            }
        }
    };

    useEffect(() => {
        const root = document.documentElement;
        const body = document.body;
        const currentTheme = themes[theme];

        // If theme doesn't exist (e.g., old 'default' in localStorage), fallback to 'black'
        if (!currentTheme) {
            setTheme('black');
            return;
        }

        // Set theme class for conditional CSS
        body.className = `theme-${theme}`;

        Object.entries(currentTheme.colors).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });

        localStorage.setItem('pisethip-theme', theme);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, themes }}>
            {children}
        </ThemeContext.Provider>
    );
};
