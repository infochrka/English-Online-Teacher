import { IScenario, ConversationTurn, Feedback, ConversationHistoryItem } from '../types';

const HISTORY_STORAGE_KEY = 'gemini_tutor_history';
const MAX_HISTORY_ITEMS = 50; // To prevent localStorage from getting too large

/**
 * Retrieves all conversation history items from localStorage.
 */
export const getConversationHistory = (): ConversationHistoryItem[] => {
  try {
    const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    const history = storedHistory ? JSON.parse(storedHistory) : [];
    // Ensure items are sorted from most recent to oldest
    return history.sort((a: ConversationHistoryItem, b: ConversationHistoryItem) => new Date(b.id).getTime() - new Date(a.id).getTime());
  } catch (error) {
    console.error("Failed to parse conversation history from localStorage:", error);
    return [];
  }
};

/**
 * Saves a completed conversation and its feedback to localStorage.
 */
export const saveConversation = (scenario: IScenario, conversation: ConversationTurn[], feedback: Feedback): void => {
  try {
    const history = getConversationHistory();
    const newHistoryItem: ConversationHistoryItem = {
      id: new Date().toISOString(),
      scenario,
      conversation,
      feedback,
    };

    const updatedHistory = [newHistoryItem, ...history].slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Failed to save conversation to localStorage:", error);
  }
};
