import React from 'react';
import { ConversationTurn, IScenario } from '../types';

interface ConversationViewProps {
  scenario: IScenario;
  conversation: ConversationTurn[];
  currentTranscription: {
    user: string;
    ai: string;
  };
  achievedGoals: Set<string>;
  onExit: () => void;
}

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
);


const TurnMessage: React.FC<{ turn: ConversationTurn }> = ({ turn }) => {
  const isUser = turn.speaker === 'user';
  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center font-bold shadow-lg">
          AI
        </div>
      )}
      <div className={`max-w-md p-4 rounded-2xl shadow-xl text-white ${isUser ? 'bg-gradient-to-br from-pink-500 to-orange-400 rounded-br-none' : 'bg-slate-700/80 rounded-bl-none'}`}>
        <p>{turn.text}</p>
      </div>
       {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center font-bold shadow-lg">
          YOU
        </div>
      )}
    </div>
  );
};

const LiveTranscription: React.FC<{ userText: string; aiText: string }> = ({ userText, aiText }) => {
  if (!userText && !aiText) return null;

  return (
    <div className="opacity-60">
      {userText && <TurnMessage turn={{ speaker: 'user', text: userText }} />}
      {aiText && <TurnMessage turn={{ speaker: 'ai', text: aiText }} />}
    </div>
  );
};


const ConversationView: React.FC<ConversationViewProps> = ({ scenario, conversation, currentTranscription, achievedGoals, onExit }) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if(scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [conversation, currentTranscription]);


  return (
    <div className="h-full max-w-3xl mx-auto flex flex-col w-full">
       <div className="bg-black/20 p-4 rounded-xl mb-4 border border-white/20 sticky top-0 backdrop-blur-lg z-10 shadow-2xl">
            <div className="flex justify-between items-start gap-4">
                <div className='flex-1'>
                    <h2 className="text-xl font-bold text-white">{scenario.title}</h2>
                    <p className="text-slate-300 mt-1 text-sm">{scenario.description}</p>
                    <div className="mt-3">
                        <h3 className="text-md font-semibold text-slate-200">Your Goals:</h3>
                        <ul className="space-y-1 mt-1">
                            {scenario.goals.map((goal, index) => (
                                <li key={index} className={`flex items-center gap-2 transition-all duration-500 ${achievedGoals.has(goal) ? 'text-green-400' : 'text-slate-400'}`}>
                                    <CheckIcon className={`w-5 h-5 transition-transform duration-300 ${achievedGoals.has(goal) ? 'scale-100' : 'scale-0'}`} />
                                    <span className={achievedGoals.has(goal) ? 'line-through' : ''}>
                                      {goal}
                                    </span>
                                </li>
                            ))}
                            {scenario.targetWpm && (
                                <li className="flex items-center gap-2 text-slate-400">
                                    <ClockIcon className="w-5 h-5" />
                                    <span>
                                      Speak at ~{scenario.targetWpm} WPM
                                    </span>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
                <button 
                    onClick={onExit}
                    className="bg-pink-500/80 hover:bg-pink-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-pink-500/50 flex-shrink-0 border border-pink-400/50"
                >
                    End Session
                </button>
            </div>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-2">
            {conversation.length === 0 && !currentTranscription.user && (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mb-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <h2 className="text-xl font-semibold text-white">Scenario Started</h2>
                    <p>Click the glowing button below to begin speaking.</p>
                </div>
            )}
            {conversation.map((turn, index) => (
                <TurnMessage key={index} turn={turn} />
            ))}
            <LiveTranscription userText={currentTranscription.user} aiText={currentTranscription.ai}/>
        </div>
    </div>
  );
};

export default ConversationView;
