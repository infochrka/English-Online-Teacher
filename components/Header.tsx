import React from 'react';
import { AppView } from '../types';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const NavItem: React.FC<{
    view: AppView;
    currentView: AppView;
    onNavigate: (view: AppView) => void;
    children: React.ReactNode;
}> = ({ view, currentView, onNavigate, children }) => {
    const isActive = view === currentView;
    return (
        <button 
            onClick={() => onNavigate(view)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-400/80 ${
                isActive 
                ? 'bg-white/10 text-white shadow-lg' 
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
        >
            {children}
        </button>
    );
};

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  return (
    <header className="sticky top-0 z-20 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
                <div className="flex-shrink-0">
                    <h1 
                        className="text-2xl font-bold text-glow cursor-pointer"
                        onClick={() => onNavigate('home')}
                    >
                        Gemini English Tutor
                    </h1>
                </div>
                <nav className="flex items-center gap-2">
                    <NavItem view="home" currentView={currentView} onNavigate={onNavigate}>Home</NavItem>
                    <NavItem view="scenarios" currentView={currentView} onNavigate={onNavigate}>Scenarios</NavItem>
                    <NavItem view="vocabulary" currentView={currentView} onNavigate={onNavigate}>Vocabulary</NavItem>
                    <NavItem view="history" currentView={currentView} onNavigate={onNavigate}>History</NavItem>
                    <NavItem view="desktop" currentView={currentView} onNavigate={onNavigate}>Desktop App</NavItem>
                </nav>
            </div>
        </div>
    </header>
  );
};

export default Header;
