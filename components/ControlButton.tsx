import React from 'react';
import { ConversationStatus } from '../types';

interface ControlButtonProps {
  status: ConversationStatus;
  onClick: () => void;
}

const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v1a7 7 0 0 1-14 0v-1h2v1a5 5 0 0 0 10 0v-1h2z"></path>
        <path d="M12 19a1 1 0 0 1-1-1v-2a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1z"></path>
    </svg>
);

const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
     <rect x="8" y="8" width="8" height="8" rx="1" />
  </svg>
);


const ControlButton: React.FC<ControlButtonProps> = ({ status, onClick }) => {
  const isListening = status === ConversationStatus.LISTENING;
  const isConnecting = status === ConversationStatus.CONNECTING;
  const isIdle = status === ConversationStatus.IDLE || status === ConversationStatus.ERROR;

  const getButtonClass = () => {
    let baseClass = "w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl transform transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 relative";
    if (isIdle) return `${baseClass} bg-gradient-to-br from-pink-500 to-orange-400 hover:scale-110 focus:ring-pink-400/50 shadow-pink-500/40`;
    if (isConnecting) return `${baseClass} bg-gradient-to-br from-yellow-500 to-orange-400 cursor-not-allowed animate-pulse shadow-yellow-500/40`;
    if (isListening) return `${baseClass} bg-gradient-to-br from-red-500 to-yellow-400 hover:scale-110 focus:ring-red-400/50 shadow-red-500/40`;
    return `${baseClass} bg-gray-500`;
  };

  const getIcon = () => {
    if (isIdle || isConnecting) return <MicrophoneIcon className="w-12 h-12" />;
    return <StopIcon className="w-12 h-12" />;
  }

  return (
    <button
      onClick={onClick}
      disabled={isConnecting}
      className={getButtonClass()}
      aria-label={isIdle ? "Start conversation" : "Stop conversation"}
    >
      {isListening && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
      <span className="relative z-10">{getIcon()}</span>
    </button>
  );
};

export default ControlButton;