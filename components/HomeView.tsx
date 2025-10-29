import React, { useState, useEffect } from 'react';
import { AppView, VocabularyStats } from '../types';
import { getVocabularyStats } from '../services/vocabularyService';

interface HomeViewProps {
    onNavigate: (view: AppView) => void;
}

const StatCard: React.FC<{ value: number; label: string; }> = ({ value, label }) => (
    <div className="bg-white/5 p-6 rounded-xl text-center border border-white/10">
        <p className="text-4xl font-bold text-cyan-300">{value}</p>
        <p className="text-sm text-slate-300 mt-1">{label}</p>
    </div>
);

const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
    const [stats, setStats] = useState<VocabularyStats | null>(null);

    useEffect(() => {
        setStats(getVocabularyStats());
    }, []);


    return (
        <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full flex items-center justify-center">
            <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-5xl font-bold text-white mb-4 text-glow">Welcome to Your AI English Tutor</h2>
                <p className="text-lg text-slate-300 mb-12">
                    Practice real-world conversations, get instant feedback, and build your vocabulary with a personalized learning system.
                </p>

                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                       <StatCard value={stats.wordsToReview} label="Words to Review" />
                       <StatCard value={stats.totalWords} label="Total Words Learned" />
                       <StatCard value={stats.wordsMastered} label="Words Mastered" />
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <button
                        onClick={() => onNavigate('scenarios')}
                        className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-orange-400 hover:scale-105 text-white font-bold py-4 px-10 rounded-lg transition-all duration-300 shadow-lg text-lg"
                    >
                        Practice Scenarios
                    </button>
                    <button
                        onClick={() => onNavigate('vocabulary')}
                        className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-10 rounded-lg border border-white/20 transition-all duration-300"
                    >
                        Review Vocabulary
                    </button>
                </div>
                <p className="text-xs text-slate-500 mt-12 italic">
                    Please note: This English-language tutor only listens for and transcribes in English.
                </p>
            </div>
        </main>
    );
};

export default HomeView;