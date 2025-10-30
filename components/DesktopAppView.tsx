import React from 'react';

// SVG Icons for better visual guidance
const InstallIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);
const MenuIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
);
const DatabaseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
);


const DesktopAppView: React.FC = () => {
    return (
        <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-white text-glow">Get the Desktop App Experience</h2>
                    <p className="text-slate-300 mt-2">
                        Install this tutor on your computer to run it in its own window, just like a native app.
                    </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-white/20 shadow-2xl space-y-8">
                    
                    <div>
                        <h3 className="text-2xl font-bold text-pink-400 mb-4">How to Install</h3>
                        <p className="text-slate-300 mb-6">
                            Modern browsers like Google Chrome and Microsoft Edge allow you to "install" websites as Progressive Web Apps (PWAs). This adds an icon to your Mac's Dock or Windows Start Menu for easy access.
                        </p>
                        <div className="bg-black/20 p-5 rounded-xl border border-white/10 space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="text-cyan-300 text-2xl font-bold">1.</div>
                                <p className="text-slate-200 pt-1">Open this page in a <span className="font-bold text-white">Google Chrome</span> or <span className="font-bold text-white">Microsoft Edge</span> browser.</p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="text-cyan-300 text-2xl font-bold">2.</div>
                                <p className="text-slate-200 pt-1">Click the three-dots menu icon <MenuIcon /> in the top-right corner of your browser.</p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="text-cyan-300 text-2xl font-bold">3.</div>
                                <p className="text-slate-200 pt-1">
                                    Look for an option that says <span className="font-bold text-white">"Install Gemini English Tutor"</span>. 
                                    Sometimes this is under a "Save and Share" or "Apps" sub-menu.
                                </p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="text-cyan-300 text-2xl font-bold">4.</div>
                                <p className="text-slate-200 pt-1">Follow the prompts to confirm. The app will be added to your Dock (macOS) or Start Menu & Desktop (Windows)!</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-pink-400"><DatabaseIcon /></div>
                            <h3 className="text-2xl font-bold text-white">What About a Database?</h3>
                        </div>
                        <p className="text-slate-300 leading-relaxed pl-9">
                            This application already has a database! It uses your browser's secure `localStorage` to save your vocabulary progress. This means all your data is stored privately on your own computer, and it persists even when you close the app or restart your machine. You don't need a separate database or an online account.
                        </p>
                    </div>

                </div>
            </div>
        </main>
    );
};

export default DesktopAppView;
