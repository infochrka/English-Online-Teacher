import React from 'react';
import { IScenario } from '../types';

interface ScenarioCardProps {
  scenario: IScenario;
  onSelect: (scenario: IScenario) => void;
}

const difficultyColorMap = {
  Easy: 'border-green-400/50 text-green-300 bg-green-500/10',
  Medium: 'border-yellow-400/50 text-yellow-300 bg-yellow-500/10',
  Hard: 'border-red-400/50 text-red-300 bg-red-500/10',
};

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onSelect }) => {
  const { title, description, difficulty, imageUrl } = scenario;
  const colorClasses = difficultyColorMap[difficulty];

  return (
    <button
      onClick={() => onSelect(scenario)}
      className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 text-left w-full focus:outline-none focus:ring-2 focus:ring-pink-500 overflow-hidden shadow-2xl group"
      aria-label={`Start scenario: ${title}`}
    >
      <div className="w-full h-32 overflow-hidden">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-white flex-1 pr-2">{title}</h3>
            <span
                className={`px-3 py-1 text-sm font-semibold rounded-full border ${colorClasses} flex-shrink-0`}
            >
                {difficulty}
            </span>
        </div>
        <p className="text-slate-300 text-sm">{description}</p>
      </div>
    </button>
  );
};

export default ScenarioCard;