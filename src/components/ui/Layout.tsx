import React from 'react';
import './Layout.css';

/* AppShell — main app wrapper */
interface AppShellProps {
    children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
    return <div className="cv-shell">{children}</div>;
};

/* Header — top navigation */
interface HeaderProps {
    children: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ children }) => {
    return (
        <header className="cv-header">
            <div className="container">
                {children}
            </div>
        </header>
    );
};

/* Main content area */
interface MainProps {
    children: React.ReactNode;
    className?: string;
}

export const Main: React.FC<MainProps> = ({ children, className = '' }) => {
    return (
        <main className={`cv-main ${className}`}>
            <div className="container">
                {children}
            </div>
        </main>
    );
};

/* BentoGrid — Grid system for the feed */
interface BentoGridProps {
    children: React.ReactNode;
    className?: string;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ children, className = '' }) => {
    return (
        <div className={`cv-bento ${className}`}>
            {children}
        </div>
    );
};

/* BentoItem — individual grid cell */
interface BentoItemProps {
    children: React.ReactNode;
    span?: 1 | 2;
    className?: string;
}

export const BentoItem: React.FC<BentoItemProps> = ({ children, span = 1, className = '' }) => {
    return (
        <div className={`cv-bento__item cv-bento__item--span-${span} ${className}`}>
            {children}
        </div>
    );
};

/* Footer — Mesh gradient footer (Doczai style) */
export const Footer: React.FC = () => {
    return (
        <footer className="cv-footer">
            <div className="container">
                <h2 className="cv-footer__title">Stay Connected</h2>
                <p className="cv-footer__subtitle">
                    CivicVoice — Infrastructure for Truth. Empowering citizens to document and verify civic evidence.
                </p>

                <div className="cv-footer__links">
                    <a href="/" className="cv-footer__link">Witness Feed</a>
                    <a href="/report" className="cv-footer__link">File a Report</a>
                    <a href="/guide" className="cv-footer__link">How It Works</a>
                    <a href="/profile" className="cv-footer__link">Your Profile</a>
                </div>

                <div className="cv-footer__bottom">
                    <span>© {new Date().getFullYear()} CivicVoice. All rights reserved.</span>
                    <div className="cv-footer__social">
                        <a href="#" className="cv-footer__social-icon" aria-label="Twitter">𝕏</a>
                        <a href="#" className="cv-footer__social-icon" aria-label="GitHub">⌂</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
