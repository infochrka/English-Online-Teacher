import React from 'react';
import { IScenario } from '../types';
import ScenarioCard from './ScenarioCard';

interface ScenarioSelectionViewProps {
  scenarios: IScenario[];
  onSelectScenario: (scenario: IScenario) => void;
}

const ScenarioSelectionView: React.FC<ScenarioSelectionViewProps> = ({ scenarios, onSelectScenario }) => {
  const groupedScenarios = scenarios.reduce((acc, scenario) => {
    (acc[scenario.difficulty] = acc[scenario.difficulty] || []).push(scenario);
    return acc;
  }, {} as Record<IScenario['difficulty'], IScenario[]>);

  const difficultyOrder: IScenario['difficulty'][] = ['Easy', 'Medium', 'Hard'];

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white">Choose a Scenario</h2>
            <p className="text-slate-300 mt-2">Select a role-playing exercise to start practicing your English.</p>
        </div>
        
        <div className="space-y-12">
            {difficultyOrder.map(difficulty => (
                groupedScenarios[difficulty] && (
                    <section key={difficulty}>
                        <h3 className="text-2xl font-bold text-pink-400 mb-6 pb-2">{difficulty} Scenarios</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {groupedScenarios[difficulty].map(scenario => (
                                <ScenarioCard key={scenario.id} scenario={scenario} onSelect={onSelectScenario} />
                            ))}
                        </div>
                    </section>
                )
            ))}
        </div>
      </div>
    </main>
  );
};

export default ScenarioSelectionView;