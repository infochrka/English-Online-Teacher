import React, { useState, useEffect } from 'react';

interface RealtimeHintProps {
    hint: string | null;
}

const LightbulbIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path d="M11 3a1 1 0 100 2h.01a1 1 0 100-2H11zM12 2.251A7.483 7.483 0 004.75 9.75c0 2.53 1.25 4.832 3.14 6.361.32.257.41.696.223 1.045l-.813 1.505A1 1 0 008.29 19.5h3.42a1 1 0 00.894-.539l-.813-1.505a1.001 1.001 0 00-.188-1.015A6.483 6.483 0 0112 16.5c1.67 0 3.185-.599 4.35-1.642a1 1 0 10-1.428-1.401A4.483 4.483 0 0012 14.5a4.483 4.483 0 00-3.072-1.072A1 1 0 009 12.5v-2.75a.75.75 0 01.75-.75h.5a1 1 0 100-2h-.5A2.25 2.25 0 007.5 9.25v.5a1 1 0 102 0v-.5a.25.25 0 01.25-.25h.5a1 1 0 100-2h-.5A2.75 2.75 0 009.25 4 1 1 0 1011 3z" />
    </svg>
);


const RealtimeHint: React.FC<RealtimeHintProps> = ({ hint }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (hint) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [hint]);

    return (
        <div 
            className={`transition-all duration-500 ease-in-out w-full max-w-lg ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            aria-live="polite"
            aria-hidden={!isVisible}
        >
            {hint && (
                <div className="bg-cyan-900/50 backdrop-blur-md p-3 rounded-xl border border-cyan-500/30 flex items-center gap-3 shadow-lg">
                    <div className="text-cyan-300">
                        <LightbulbIcon />
                    </div>
                    <div>
                        <span className="font-semibold text-cyan-300 text-sm">Tutor's Hint:</span>
                        <p className="text-white text-sm">"{hint}"</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RealtimeHint;