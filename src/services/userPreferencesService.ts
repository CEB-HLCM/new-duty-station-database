// User Preferences Service - Stores user information persistently
const USER_PREFERENCES_KEY = 'un_duty_station_user_preferences';

export interface UserPreferences {
  email: string;
  organization: string;
  lastUpdated: string;
}

/**
 * Get user preferences from localStorage
 */
export const getUserPreferences = (): UserPreferences | null => {
  try {
    const stored = localStorage.getItem(USER_PREFERENCES_KEY);
    if (stored) {
      return JSON.parse(stored) as UserPreferences;
    }
  } catch (error) {
    console.error('Error loading user preferences:', error);
  }
  return null;
};

/**
 * Save user preferences to localStorage
 */
export const saveUserPreferences = (email: string, organization: string): void => {
  try {
    const preferences: UserPreferences = {
      email,
      organization,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving user preferences:', error);
  }
};

/**
 * Clear user preferences from localStorage
 */
export const clearUserPreferences = (): void => {
  try {
    localStorage.removeItem(USER_PREFERENCES_KEY);
  } catch (error) {
    console.error('Error clearing user preferences:', error);
  }
};

