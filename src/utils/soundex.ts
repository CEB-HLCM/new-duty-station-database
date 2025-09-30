// Soundex algorithm utility
// Wrapper around the soundex package for consistency and potential customization

import soundexPackage from 'soundex';

/**
 * Generate soundex code for a given word
 * Soundex is a phonetic algorithm for indexing names by sound
 * @param word - The word to generate soundex for
 * @returns The soundex code (4 characters)
 */
export function generateSoundex(word: string): string {
  if (!word || typeof word !== 'string') return '';
  
  // Clean the word - remove non-alphabetic characters
  const cleanWord = word.replace(/[^a-zA-Z]/g, '');
  if (!cleanWord) return '';
  
  return soundexPackage(cleanWord);
}

/**
 * Check if two words sound similar using soundex
 * @param word1 - First word
 * @param word2 - Second word
 * @returns True if the words have the same soundex code
 */
export function soundsLike(word1: string, word2: string): boolean {
  if (!word1 || !word2) return false;
  
  const soundex1 = generateSoundex(word1);
  const soundex2 = generateSoundex(word2);
  
  return soundex1 === soundex2 && soundex1 !== '';
}

/**
 * Find words in an array that sound like the target word
 * @param targetWord - The word to match against
 * @param words - Array of words to search through
 * @returns Array of words that sound similar to the target
 */
export function findSimilarSounding(targetWord: string, words: string[]): string[] {
  const targetSoundex = generateSoundex(targetWord);
  if (!targetSoundex) return [];
  
  return words.filter(word => {
    const wordSoundex = generateSoundex(word);
    return wordSoundex === targetSoundex && word !== targetWord;
  });
}

/**
 * Group words by their soundex codes
 * @param words - Array of words to group
 * @returns Map where keys are soundex codes and values are arrays of words
 */
export function groupBySoundex(words: string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  
  words.forEach(word => {
    const soundex = generateSoundex(word);
    if (soundex) {
      const existing = groups.get(soundex) || [];
      existing.push(word);
      groups.set(soundex, existing);
    }
  });
  
  return groups;
}

/**
 * Create a soundex index for faster lookups
 * @param items - Array of objects with a searchable field
 * @param fieldExtractor - Function to extract the searchable field from each item
 * @returns Map where keys are soundex codes and values are arrays of items
 */
export function createSoundexIndex<T>(
  items: T[], 
  fieldExtractor: (item: T) => string
): Map<string, T[]> {
  const index = new Map<string, T[]>();
  
  items.forEach(item => {
    const field = fieldExtractor(item);
    if (field) {
      // Handle multi-word fields by indexing each word
      const words = field.split(/\s+/);
      words.forEach(word => {
        const soundex = generateSoundex(word);
        if (soundex) {
          const existing = index.get(soundex) || [];
          // Avoid duplicates
          if (!existing.includes(item)) {
            existing.push(item);
            index.set(soundex, existing);
          }
        }
      });
    }
  });
  
  return index;
}

// Re-export the original soundex function for direct use
export { default as soundex } from 'soundex';
