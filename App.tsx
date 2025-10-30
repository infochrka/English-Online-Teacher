import React, { useState, useRef, useCallback } from 'react';
import { ConversationStatus, ConversationTurn, IScenario, Feedback, AppView, ScenarioState } from './types';
import { startConversation, LiveSession, getConversationFeedback, getRealtimeFeedback } from './services/geminiService';
import * as audioService from './services/audioService';
import * as historyService from './services/historyService';
import { scenarios } from './services/scenarios';
import ConversationView from './components/ConversationView';
import ControlButton from './components/ControlButton';
import StatusIndicator from './components/StatusIndicator';
import ScenarioSelectionView from './components/ScenarioSelectionView';
import FeedbackView from './components/FeedbackView';
import VocabularyPracticeView from './components/VocabularyPracticeView';
import HomeView from './components/HomeView';
import Header from './components/Header';
import DesktopAppView from './components/DesktopAppView';
import RealtimeHint from './components/RealtimeHint';
import HistoryView from './components/HistoryView';

const App: React.FC = () => {
  const [status, setStatus] = useState<ConversationStatus>(ConversationStatus.IDLE);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [view, setView] = useState<AppView>('home');
  const [scenarioState, setScenarioState] = useState<ScenarioState>('selection');
  const [selectedScenario, setSelectedScenario] = useState<IScenario | null>(null);
  const [achievedGoals, setAchievedGoals] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [realtimeHint, setRealtimeHint] = useState<string | null>(null);

  const currentTranscriptionRef = useRef<{ user: string; ai: string }>({ user: '', ai: '' });
  const liveSessionRef = useRef<LiveSession | null>(null);
  const hintTimeoutRef = useRef<number | null>(null);

  const forceUpdate = useForceUpdate();

  const clearHint = () => {
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = null;
    }
    setRealtimeHint(null);
  }

  const closeLiveSession = useCallback(() => {
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }
  }, []);

  const handleMessage = useCallback((messageData: { user: string; ai: string; isFinal: boolean }) => {
    currentTranscriptionRef.current = { user: messageData.user, ai: messageData.ai };

    if (messageData.isFinal && (messageData.user || messageData.ai)) {
      audioService.playMessageSound();
      const userText = messageData.user.trim();

      if (userText) {
          getRealtimeFeedback(userText).then(correction => {
            if (correction) {
                if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
                setRealtimeHint(correction);
                hintTimeoutRef.current = window.setTimeout(() => {
                    setRealtimeHint(null);
                }, 7000); // Hint disappears after 7 seconds
            }
        });
      }

      setConversation(prev => [
        ...prev,
        { speaker: 'user' as const, text: messageData.user },
        { speaker: 'ai' as const, text: messageData.ai }
      ].filter(turn => turn.text.trim() !== ''));
      currentTranscriptionRef.current = { user: '', ai: '' };
    }
    
    forceUpdate();
  }, [forceUpdate]);

  const handleError = useCallback((error: string) => {
    audioService.playErrorSound();
    setStatus(ConversationStatus.ERROR);
    setCurrentError(error);
    console.error('Live session error:', error);
    closeLiveSession();
  }, [closeLiveSession]);

  const handleOpen = useCallback(() => {
    audioService.playConnectSound();
    setStatus(ConversationStatus.LISTENING);
  }, []);

  const handleClose = useCallback(() => {
    if (status !== ConversationStatus.ANALYZING) {
        setStatus(ConversationStatus.IDLE);
    }
  }, [status]);

  const handleGoalAchieved = useCallback((goal: string) => {
    setAchievedGoals(prev => {
        if (!prev.has(goal)) {
            audioService.playGoalAchievedSound();
            const newSet = new Set(prev);
            newSet.add(goal);
            return newSet;
        }
        return prev;
    });
  }, []);

  const startSession = async () => {
    if ((status !== ConversationStatus.IDLE && status !== ConversationStatus.ERROR) || !selectedScenario) return;

    setStatus(ConversationStatus.CONNECTING);
    setCurrentError(null);
   
    try {
      liveSessionRef.current = await startConversation(
        {
          onMessage: handleMessage,
          onError: handleError,
          onOpen: handleOpen,
          onClose: handleClose,
          onGoalAchieved: handleGoalAchieved
        },
        selectedScenario.systemInstruction,
        selectedScenario.targetWpm
      );
    } catch (e) {
        const error = e instanceof Error ? e.message : 'An unknown error occurred.';
        handleError(`Failed to start session: ${error}`);
    }
  };

  const stopSessionAndGetFeedback = async () => {
    closeLiveSession();
    clearHint();
    setStatus(ConversationStatus.ANALYZING);
    
    const validConversation = conversation.filter(turn => turn.text.trim() !== '');
    if (validConversation.length > 0 && selectedScenario) {
        const analysis = await getConversationFeedback(validConversation);
        setFeedback(analysis);
        historyService.saveConversation(selectedScenario, validConversation, analysis);
    } else {
        setFeedback({
            intonation: "No conversation was recorded.",
            grammar: "No conversation was recorded.",
            suggestions: "Try speaking for a bit longer next time to get feedback!",
            pronunciation: [],
            speakingRate: { wpm: 0, feedback: "No conversation was recorded." },
            vocabulary: []
        });
    }
    
    setStatus(ConversationStatus.IDLE);
    setScenarioState('feedback');
  };

  const handleToggleConversation = () => {
    if (status === ConversationStatus.IDLE || status === ConversationStatus.ERROR) {
      startSession();
    } else {
      stopSessionAndGetFeedback();
    }
  };
  
  const resetConversationState = () => {
    setConversation([]);
    setCurrentError(null);
    setStatus(ConversationStatus.IDLE);
    setAchievedGoals(new Set());
    setFeedback(null);
    clearHint();
    currentTranscriptionRef.current = { user: '', ai: '' };
  }

  const handleSelectScenario = (scenario: IScenario) => {
    setSelectedScenario(scenario);
    resetConversationState();
    setScenarioState('conversation');
  };
  
  const handleReturnToSelection = () => {
    closeLiveSession();
    setSelectedScenario(null);
    resetConversationState();
    setScenarioState('selection');
  }

  const handleRetryScenario = () => {
    resetConversationState();
    setScenarioState('conversation');
  };
  
  const handleNavigate = (targetView: AppView) => {
    // If leaving a conversation, end it gracefully
    if (view === 'scenarios' && scenarioState === 'conversation' && targetView !== 'scenarios') {
        closeLiveSession();
        setStatus(ConversationStatus.IDLE);
    }
    clearHint();
    setView(targetView);
  }

  const renderScenarioContent = () => {
    switch(scenarioState) {
        case 'selection':
            return <ScenarioSelectionView scenarios={scenarios} onSelectScenario={handleSelectScenario} />;
        case 'conversation':
             if (selectedScenario) {
                return (
                    <div className="flex flex-col h-full w-full">
                        <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full">
                            <ConversationView 
                                scenario={selectedScenario}
                                conversation={conversation}
                                currentTranscription={currentTranscriptionRef.current}
                                achievedGoals={achievedGoals}
                                onExit={stopSessionAndGetFeedback}
                            />
                        </main>
                        <footer className="p-4 bg-black/10 backdrop-blur-sm">
                            <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
                                <RealtimeHint hint={realtimeHint} />
                                <StatusIndicator status={status} error={currentError} />
                                <ControlButton status={status} onClick={handleToggleConversation} />
                            </div>
                        </footer>
                    </div>
                );
            }
            return null;
        case 'feedback':
            return feedback ? <FeedbackView feedback={feedback} onReturnToSelection={handleReturnToSelection} onStartVocabularyPractice={() => setView('vocabulary')} onRetry={handleRetryScenario} /> : null;
    }
  }

  const renderContent = () => {
    switch (view) {
        case 'home':
            return <HomeView onNavigate={handleNavigate} />;
        case 'scenarios':
            return renderScenarioContent();
        case 'vocabulary':
            return <VocabularyPracticeView />;
        case 'desktop':
            return <DesktopAppView />;
        case 'history':
            return <HistoryView />;
        default:
            return <HomeView onNavigate={handleNavigate} />;
    }
  }

  return (
    <div className="flex flex-col h-screen font-sans text-white max-w-4xl mx-auto">
        <Header currentView={view} onNavigate={handleNavigate} />
        <div className="flex-1 flex flex-col min-h-0 items-center">
            {renderContent()}
        </div>
    </div>
  );
};

// Custom hook to force re-render for refs
function useForceUpdate() {
  const [, setValue] = useState(0);
  return useCallback(() => setValue(value => value + 1), []);
}

export default App;
