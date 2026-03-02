import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const navLinks = [
    { path: '/', label: 'Feed' },
    { path: '/guide', label: 'How It Works' },
    { path: '/profile', label: 'Profile' },
];

export const Navbar: React.FC = () => {
    const location = useLocation();

    return (
        <>
            {/* Logo */}
            <Link to="/" className="cv-nav__logo">
                <span className="cv-nav__logo-mark">◈</span>
                <span className="cv-nav__logo-text">CivicVoice</span>
            </Link>

            {/* Navigation Links */}
            <nav className="cv-nav__links">
                {navLinks.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`cv-nav__link ${location.pathname === link.path ? 'cv-nav__link--active' : ''}`}
                    >
                        {link.label}
                    </Link>
                ))}
                <Link to="/report" className="cv-nav__cta">
                    File a Report
                </Link>
            </nav>
        </>
    );
};
