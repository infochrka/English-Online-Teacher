import React from 'react';
import { ConversationHistoryItem, ConversationTurn, Feedback, PronunciationFeedbackItem, VocabularyItem } from '../types';

// Reusing icons and some components from FeedbackView for consistency
const IntonationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.636 8.464a5 5 0 000 7.072m2.828 9.9a9 9 0 000-12.728" /></svg>;
const SpeakingRateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PronunciationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const GrammarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-9-5.747h18" /></svg>;
const VocabularyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-9-5.747h18" /></svg>;
const SuggestionsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 017.072 0" /></svg>;

const getScoreColor = (score: number): string => {
  if (score >= 85) return 'text-green-300 border-green-400/50 bg-green-500/10';
  if (score >= 60) return 'text-yellow-300 border-yellow-400/50 bg-yellow-500/10';
  return 'text-red-300 border-red-400/50 bg-red-500/10';
};

const FeedbackSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-black/20 p-5 rounded-xl border border-white/10">
        <div className="flex items-center gap-3 mb-4">
            <div className="text-pink-400">{icon}</div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <div className="pl-9">{children}</div>
    </div>
);

const PronunciationFeedbackCard: React.FC<{ item: PronunciationFeedbackItem }> = ({ item }) => (
  <div className="bg-black/20 p-4 rounded-lg border border-white/10">
    <div className="flex justify-between items-center">
      <p className="text-lg font-semibold text-white">{item.word}</p>
      <span className={`text-md font-bold px-3 py-1 border rounded-full ${getScoreColor(item.score)}`}>
        {item.score}<span className="text-xs font-normal text-slate-400">/100</span>
      </span>
    </div>
    <p className="text-slate-300 mt-2 text-sm">{item.feedback}</p>
  </div>
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


interface HistoryDetailViewProps {
    item: ConversationHistoryItem;
    onBack: () => void;
}

const HistoryDetailView: React.FC<HistoryDetailViewProps> = ({ item, onBack }) => {
    const { scenario, conversation, feedback } = item;

    return (
        <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-300 hover:text-white mb-6 group transition-all duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to History
                </button>

                <div className="bg-white/10 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-white/20 shadow-2xl space-y-8">
                    {/* Header */}
                    <div>
                        <h2 className="text-3xl font-bold text-white text-glow">{scenario.title}</h2>
                        <p className="text-slate-300 mt-1">
                            Session from {new Date(item.id).toLocaleString()}
                        </p>
                    </div>

                    {/* Transcript Section */}
                    <div>
                        <h3 className="text-2xl font-bold text-pink-400 mb-4 pb-2 border-b-2 border-white/10">Conversation Transcript</h3>
                        <div className="max-h-96 overflow-y-auto bg-black/20 p-4 rounded-xl border border-white/10">
                            {conversation.map((turn, index) => (
                                <TurnMessage key={index} turn={turn} />
                            ))}
                        </div>
                    </div>
                    
                    {/* Feedback Section */}
                    <div>
                        <h3 className="text-2xl font-bold text-pink-400 mb-6 pb-2 border-b-2 border-white/10">Feedback Report</h3>
                        <div className="space-y-6">
                            <FeedbackSection title="Intonation & Phrasing" icon={<IntonationIcon />}>
                                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{feedback.intonation}</p>
                            </FeedbackSection>
                            
                            <FeedbackSection title="Speaking Rate" icon={<SpeakingRateIcon />}>
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col items-center justify-center">
                                        <p className="text-4xl font-bold text-cyan-300">{feedback.speakingRate.wpm}</p>
                                        <p className="text-sm text-slate-400 font-semibold">WPM</p>
                                    </div>
                                    <p className="flex-1 text-slate-300 leading-relaxed">{feedback.speakingRate.feedback}</p>
                                </div>
                            </FeedbackSection>

                            <FeedbackSection title="Pronunciation Score" icon={<PronunciationIcon />}>
                                <div className="space-y-3">
                                    {feedback.pronunciation.map((pItem, index) => <PronunciationFeedbackCard key={index} item={pItem} />)}
                                </div>
                            </FeedbackSection>
                            
                            <FeedbackSection title="Grammar Review" icon={<GrammarIcon />}>
                                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{feedback.grammar}</p>
                            </FeedbackSection>

                            <FeedbackSection title="Vocabulary Builder" icon={<VocabularyIcon />}>
                                {feedback.vocabulary?.length > 0 ? (
                                    <ul className="list-disc list-inside space-y-3 text-slate-300">
                                    {feedback.vocabulary.map((vItem, index) => (
                                        <li key={index}>
                                            <strong className="text-white font-semibold">{vItem.word}:</strong>
                                            <span className="text-slate-300"> {vItem.definition}</span>
                                        </li>
                                    ))}
                                    </ul>
                                ) : <p className="text-slate-400">No new vocabulary was identified in this session.</p>}
                            {/* FIX: Corrected a malformed closing tag for FeedbackSection. */}
                            </FeedbackSection>

                            <FeedbackSection title="Suggestions for Improvement" icon={<SuggestionsIcon />}>
                                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{feedback.suggestions}</p>
                            </FeedbackSection>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
};

export default HistoryDetailView;