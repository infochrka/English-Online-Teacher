import React, { useState, useEffect } from 'react';
import { LeitnerWord } from '../types';
import { getPracticeSession, updateWordProgress } from '../services/vocabularyService';
import { generateSpeech } from '../services/geminiService';
import { playBase64Audio } from '../services/audioService';

const SpeakerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.969 9.969 0 0119 10a9.969 9.969 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.97 7.97 0 0017 10a7.97 7.97 0 00-2.343-5.657 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.984 3.984 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const LoadingSpinner: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const Flashcard: React.FC<{ 
    item: LeitnerWord; 
    isFlipped: boolean; 
    onFlip: () => void;
    onPlayAudio: (word: string) => void;
    isAudioLoading: boolean;
}> = ({ item, isFlipped, onFlip, onPlayAudio, isAudioLoading }) => {
    
    const handleAudioClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isAudioLoading) {
            onPlayAudio(item.word);
        }
    };

    return (
        <div className="w-full h-80 perspective-1000">
            <div 
                className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-700 ${isFlipped ? 'rotate-y-180' : ''}`}
                onClick={onFlip}
                role="button"
                tabIndex={0}
                aria-label={`Flashcard for ${item.word}. Click to flip.`}
            >
                {/* Front of Card */}
                <div className="absolute w-full h-full backface-hidden bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer shadow-2xl">
                    <h2 className="text-4xl md:text-5xl font-bold text-white text-center text-glow mb-4">{item.word}</h2>
                    <button 
                        onClick={handleAudioClick}
                        className="bg-black/20 hover:bg-black/40 text-white p-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
                        aria-label={`Play pronunciation for ${item.word}`}
                        disabled={isAudioLoading}
                    >
                        {isAudioLoading ? <LoadingSpinner className="w-6 h-6" /> : <SpeakerIcon className="w-6 h-6" />}
                    </button>
                </div>

                {/* Back of Card */}
                <div className="absolute w-full h-full backface-hidden bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl flex flex-col justify-center p-6 rotate-y-180 cursor-pointer shadow-2xl">
                    <div className="text-center">
                        <h3 className="text-2xl font-semibold text-pink-300 mb-2">{item.word}</h3>
                        <p className="text-lg text-slate-200 mb-4">{item.definition}</p>
                        <p className="text-md text-slate-400 italic">e.g., "{item.example}"</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VocabularyPracticeView: React.FC = () => {
    const [practiceWords, setPracticeWords] = useState<LeitnerWord[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    
    useEffect(() => {
        const words = getPracticeSession();
        setPracticeWords(words);
        setCurrentIndex(0);
        setIsFlipped(false);
        setSessionComplete(words.length === 0);
    }, []);

    const handleProgressUpdate = (known: boolean) => {
        if (currentIndex >= practiceWords.length) return;
        
        const currentWord = practiceWords[currentIndex];
        updateWordProgress(currentWord.word, known);

        if (currentIndex + 1 < practiceWords.length) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        } else {
            setSessionComplete(true);
        }
    };

    const handlePlayAudio = async (word: string) => {
        setIsAudioLoading(true);
        try {
            const audioData = await generateSpeech(word);
            if (audioData) {
                await playBase64Audio(audioData);
            } else {
                console.error("Failed to generate audio for the word.");
            }
        } catch (error) {
            console.error("Error in audio playback flow:", error);
        } finally {
            setIsAudioLoading(false);
        }
    };
    
    if (sessionComplete) {
        return (
             <main className="flex-1 p-4 md:p-8 flex flex-col w-full items-center justify-center">
                <div className="max-w-md mx-auto w-full text-center bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20 shadow-2xl">
                     <h2 className="text-3xl font-bold text-white mb-4 text-glow">Practice Complete!</h2>
                     <p className="text-slate-300 mb-8">
                        {practiceWords.length > 0
                            ? `You've reviewed all ${practiceWords.length} of your due words. Check back later for more!`
                            : "You have no words due for practice right now. New words will appear here after your conversations."
                        }
                    </p>
                    <p className="text-slate-400 text-sm">Use the navigation above to go to another section.</p>
                </div>
            </main>
        );
    }

    const currentItem = practiceWords[currentIndex];

    return (
        <main className="flex-1 p-4 md:p-8 flex flex-col w-full">
            <div className="max-w-2xl mx-auto w-full flex flex-col items-center flex-grow">
                <h2 className="text-3xl font-bold text-white mb-2 text-center text-glow">Vocabulary Practice</h2>
                <p className="text-slate-300 mb-8 text-center">Click the card to flip. Then, mark if you knew the word.</p>
                
                {currentItem ? (
                    <Flashcard 
                        item={currentItem}
                        isFlipped={isFlipped}
                        onFlip={() => setIsFlipped(!isFlipped)}
                        onPlayAudio={handlePlayAudio}
                        isAudioLoading={isAudioLoading}
                    />
                ) : (
                    <div className="w-full h-80 bg-white/5 rounded-2xl flex items-center justify-center">
                        <p className="text-slate-400">Loading words...</p>
                    </div>
                )}
                
                
                <div className="text-center my-6 text-lg font-semibold text-white">
                    Card {currentIndex + 1} of {practiceWords.length}
                </div>

                {isFlipped && (
                    <div className="flex justify-center w-full gap-4 mt-4 animate-fade-in">
                        <button
                            onClick={() => handleProgressUpdate(false)}
                            className="w-40 bg-red-600/80 hover:bg-red-600 border border-red-500/50 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-red-500/50"
                        >
                            I didn't know
                        </button>
                        <button
                            onClick={() => handleProgressUpdate(true)}
                            className="w-40 bg-green-600/80 hover:bg-green-600 border border-green-500/50 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/50"
                        >
                            I knew it
                        </button>
                    </div>
                )}
            </div>
            {/* Simple CSS for 3D flip effect and fade-in animation */}
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-preserve-3d { transform-style: preserve-3d; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
            `}</style>
        </main>
    );
};

export default VocabularyPracticeView;