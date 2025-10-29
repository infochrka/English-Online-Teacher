import React from 'react';
import { ConversationStatus } from '../types';

interface StatusIndicatorProps {
  status: ConversationStatus;
  error: string | null;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, error }) => {
  let text = '';
  let textColor = 'text-slate-300';

  switch (status) {
    case ConversationStatus.IDLE:
      text = 'Ready to practice';
      break;
    case ConversationStatus.CONNECTING:
      text = 'Connecting to Gemini...';
      textColor = 'text-yellow-300';
      break;
    case ConversationStatus.LISTENING:
      text = 'Listening... Speak now!';
      textColor = 'text-green-300 animate-pulse';
      break;
    case ConversationStatus.ANALYZING:
      text = 'Analyzing your conversation...';
      textColor = 'text-cyan-300 animate-pulse';
      break;
    case ConversationStatus.ERROR:
      text = error || 'An error occurred. Please try again.';
      textColor = 'text-red-400';
      break;
  }

  return (
    <div className="h-6 text-center">
      <p className={`text-lg font-semibold transition-colors duration-300 ${textColor}`}>{text}</p>
    </div>
  );
};

export default StatusIndicator;