import { VocabularyItem, LeitnerWord, VocabularyStats } from '../types';

const VOCABULARY_STORAGE_KEY = 'gemini_tutor_vocabulary';
const MAX_BOX = 5;

// The number of days to wait before reviewing a word in a given box.
const reviewIntervals: { [key: number]: number } = {
  0: 0, // Review every session
  1: 1, // Review after 1 day
  2: 3, // Review after 3 days
  3: 7, // Review after 1 week
  4: 14, // Review after 2 weeks
  5: 30, // Review after 1 month
};

/**
 * Retrieves all vocabulary words from localStorage.
 */
const getVocabulary = (): LeitnerWord[] => {
  try {
    const storedVocab = localStorage.getItem(VOCABULARY_STORAGE_KEY);
    return storedVocab ? JSON.parse(storedVocab) : [];
  } catch (error) {
    console.error("Failed to parse vocabulary from localStorage:", error);
    return [];
  }
};

/**
 * Saves the entire vocabulary list to localStorage.
 */
const saveVocabulary = (vocabulary: LeitnerWord[]): void => {
  try {
    localStorage.setItem(VOCABULARY_STORAGE_KEY, JSON.stringify(vocabulary));
  } catch (error) {
    console.error("Failed to save vocabulary to localStorage:", error);
  }
};

/**
 * Adds new vocabulary items from a conversation to the Leitner system.
 * New words are placed in box 0. Avoids adding duplicates.
 */
export const addWords = (newItems: VocabularyItem[]): void => {
  const existingVocab = getVocabulary();
  const existingWords = new Set(existingVocab.map(item => item.word.toLowerCase()));

  const wordsToAdd = newItems
    .filter(item => !existingWords.has(item.word.toLowerCase()))
    .map(item => ({
      ...item,
      box: 0,
      lastReviewed: new Date().toISOString(),
    }));

  if (wordsToAdd.length > 0) {
    saveVocabulary([...existingVocab, ...wordsToAdd]);
  }
};

/**
 * Gets a list of words that are due for a practice session.
 * Words are due if the time since their last review exceeds the interval for their box.
 */
export const getPracticeSession = (): LeitnerWord[] => {
  const allVocab = getVocabulary();
  const now = new Date();

  const dueWords = allVocab.filter(word => {
    if (word.box === 0) return true; // Always review words in box 0
    if (word.box >= MAX_BOX) return false;

    const lastReviewed = new Date(word.lastReviewed);
    const intervalDays = reviewIntervals[word.box];
    if (intervalDays === undefined) return false;

    const dueDate = new Date(lastReviewed);
    dueDate.setDate(lastReviewed.getDate() + intervalDays);
    
    return now >= dueDate;
  });

  // Sort words: those in lower boxes (less known) come first.
  return dueWords.sort((a, b) => a.box - b.box);
};

/**
 * Updates a word's progress in the Leitner system.
 * If the user knew the word, it moves up a box.
 * If they didn't, it moves back to box 0.
 */
export const updateWordProgress = (word: string, known: boolean): void => {
  const existingVocab = getVocabulary();
  const wordIndex = existingVocab.findIndex(item => item.word.toLowerCase() === word.toLowerCase());

  if (wordIndex === -1) {
    console.warn(`Word "${word}" not found in vocabulary.`);
    return;
  }

  const updatedWord = { ...existingVocab[wordIndex] };
  
  if (known) {
    updatedWord.box = Math.min(updatedWord.box + 1, MAX_BOX);
  } else {
    updatedWord.box = 0;
  }
  
  updatedWord.lastReviewed = new Date().toISOString();

  existingVocab[wordIndex] = updatedWord;
  saveVocabulary(existingVocab);
};

/**
 * Gets statistics about the user's vocabulary.
 */
export const getVocabularyStats = (): VocabularyStats => {
    const allVocab = getVocabulary();
    const wordsToReview = getPracticeSession().length;

    return {
        totalWords: allVocab.length,
        wordsToReview: wordsToReview,
        wordsMastered: allVocab.filter(word => word.box >= MAX_BOX).length,
    };
};
