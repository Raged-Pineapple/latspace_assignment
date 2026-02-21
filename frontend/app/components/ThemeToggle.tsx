"use client";

import React from "react";

interface ThemeToggleProps {
    isDark: boolean;
    onToggle: () => void;
}

export default function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
    return (
        <button
            className="theme-toggle"
            onClick={onToggle}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
        >
            <span className={`theme-icon ${isDark ? "dark" : "light"}`}>
                {isDark ? "🌙" : "☀️"}
            </span>
        </button>
    );
}
