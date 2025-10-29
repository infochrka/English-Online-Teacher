import React from 'react';
import { Feedback, PronunciationFeedbackItem, VocabularyItem } from '../types';
import { addWords } from '../services/vocabularyService';

interface FeedbackViewProps {
  feedback: Feedback;
  onReturnToSelection: () => void;
  onStartVocabularyPractice: () => void;
  onRetry: () => void;
}

// SVG Icons for section headers
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

const VocabularyItemCard: React.FC<{ item: VocabularyItem }> = ({ item }) => (
    <li>
        <strong className="text-white font-semibold">{item.word}:</strong>
        <span className="text-slate-300"> {item.definition}</span>
    </li>
);

const FeedbackView: React.FC<FeedbackViewProps> = ({ feedback, onReturnToSelection, onStartVocabularyPractice, onRetry }) => {
  
  const handlePracticeClick = () => {
    if (feedback.vocabulary && feedback.vocabulary.length > 0) {
      addWords(feedback.vocabulary);
    }
    onStartVocabularyPractice();
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-white/20 shadow-2xl">
        <h2 className="text-4xl font-bold text-white mb-8 text-center text-glow">Conversation Feedback</h2>
        
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
                <div className="flex-1">
                    <p className="text-slate-300 leading-relaxed">{feedback.speakingRate.feedback}</p>
                    <p className="text-xs text-slate-500 mt-2">Typical conversational pace: 120-150 WPM.</p>
                </div>
            </div>
          </FeedbackSection>

          <FeedbackSection title="Pronunciation Score" icon={<PronunciationIcon />}>
            {feedback.pronunciation?.length > 0 ? (
              <div className="space-y-3">
                {feedback.pronunciation.map((item, index) => <PronunciationFeedbackCard key={index} item={item} />)}
              </div>
            ) : <p className="text-slate-400">No specific pronunciation feedback was generated.</p>}
          </FeedbackSection>
          
          <FeedbackSection title="Grammar Review" icon={<GrammarIcon />}>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{feedback.grammar}</p>
          </FeedbackSection>
          
          <FeedbackSection title="Vocabulary Builder" icon={<VocabularyIcon />}>
            {feedback.vocabulary?.length > 0 ? (
              <div>
                <ul className="list-disc list-inside space-y-3 text-slate-300 mb-6">
                  {feedback.vocabulary.map((item, index) => <VocabularyItemCard key={index} item={item} />)}
                </ul>
                <button
                    onClick={handlePracticeClick}
                    className="w-full bg-cyan-500/80 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-cyan-500/50 border border-cyan-400/50"
                  >
                    Add to Vocabulary & Practice
                </button>
              </div>
            ) : (
                <div>
                    <p className="text-slate-400 mb-4">No new vocabulary was identified. You can still practice words from previous sessions.</p>
                    <button
                        onClick={handlePracticeClick}
                        className="w-full bg-cyan-500/80 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-cyan-500/50 border border-cyan-400/50"
                    >
                        Practice Stored Vocabulary
                    </button>
                </div>
            )}
          </FeedbackSection>

          <FeedbackSection title="Suggestions for Improvement" icon={<SuggestionsIcon />}>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{feedback.suggestions}</p>
          </FeedbackSection>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row-reverse items-center justify-center gap-4">
          <button
            onClick={onReturnToSelection}
            className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-orange-400 hover:scale-105 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg"
          >
            New Scenario
          </button>
          <button
            onClick={onRetry}
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-lg border border-white/20 transition-all duration-200"
          >
            Practice Again
          </button>
        </div>
      </div>
    </main>
  );
};

export default FeedbackView;
