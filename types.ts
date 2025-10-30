export enum ConversationStatus {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  LISTENING = 'LISTENING',
  ANALYZING = 'ANALYZING',
  ERROR = 'ERROR',
}

export type AppView = 'home' | 'scenarios' | 'vocabulary' | 'desktop' | 'history';
export type ScenarioState = 'selection' | 'conversation' | 'feedback';


export interface ConversationTurn {
  speaker: 'user' | 'ai';
  text: string;
}

export interface IScenario {
    id: string;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    systemInstruction: string;
    goals: string[];
    imageUrl: string;
    targetWpm?: number;
}

export interface PronunciationFeedbackItem {
  word: string;
  score: number;
  feedback: string;
}

export interface SpeakingRateFeedback {
  wpm: number;
  feedback: string;
}

export interface VocabularyItem {
  word: string;
  definition: string;
  example: string;
}

export interface LeitnerWord extends VocabularyItem {
  box: number; // The Leitner box number (e.g., 0, 1, 2, 3, 4)
  lastReviewed: string; // ISO date string
}

export interface Feedback {
    intonation: string;
    grammar: string;
    suggestions: string;
    pronunciation: PronunciationFeedbackItem[];
    speakingRate: SpeakingRateFeedback;
    vocabulary: VocabularyItem[];
}

export interface VocabularyStats {
    totalWords: number;
    wordsToReview: number;
    wordsMastered: number;
}

export interface ConversationHistoryItem {
    id: string; // ISO date string of when the conversation was saved
    scenario: IScenario;
    conversation: ConversationTurn[];
    feedback: Feedback;
}
