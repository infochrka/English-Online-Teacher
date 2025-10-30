import React, { useState, useEffect } from 'react';
import { ConversationHistoryItem } from '../types';
import { getConversationHistory } from '../services/historyService';
import HistoryDetailView from './HistoryDetailView';

const difficultyColorMap: { [key in 'Easy' | 'Medium' | 'Hard']: string } = {
  Easy: 'border-green-400/50 text-green-300 bg-green-500/10',
  Medium: 'border-yellow-400/50 text-yellow-300 bg-yellow-500/10',
  Hard: 'border-red-400/50 text-red-300 bg-red-500/10',
};

const HistoryItemCard: React.FC<{ item: ConversationHistoryItem; onSelect: () => void }> = ({ item, onSelect }) => (
    <button 
        onClick={onSelect}
        className="w-full text-left bg-white/5 hover:bg-white/10 p-5 rounded-xl border border-white/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
    >
        <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{item.scenario.title}</h3>
                <p className="text-sm text-slate-400 mt-1">
                    {new Date(item.id).toLocaleString(undefined, {
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                </p>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${difficultyColorMap[item.scenario.difficulty]} flex-shrink-0 mt-1`}>
                {item.scenario.difficulty}
            </span>
        </div>
    </button>
);


const HistoryView: React.FC = () => {
    const [history, setHistory] = useState<ConversationHistoryItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<ConversationHistoryItem | null>(null);

    useEffect(() => {
        setHistory(getConversationHistory());
    }, []);

    if (selectedItem) {
        return <HistoryDetailView item={selectedItem} onBack={() => setSelectedItem(null)} />;
    }

    return (
        <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-white text-glow">Conversation History</h2>
                    <p className="text-slate-300 mt-2">Review your past practice sessions and feedback.</p>
                </div>
                
                {history.length > 0 ? (
                    <div className="space-y-4">
                        {history.map(item => (
                            <HistoryItemCard key={item.id} item={item} onSelect={() => setSelectedItem(item)} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center bg-white/5 p-8 rounded-xl border border-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <h3 className="mt-4 text-xl font-semibold text-white">No History Yet</h3>
                        <p className="mt-1 text-slate-400">Complete a scenario to see your session history here.</p>
                    </div>
                )}
            </div>
        </main>
    );
};

export default HistoryView;
