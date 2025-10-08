// Custom hook for form data persistence with localStorage
import { useEffect, useCallback } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { RequestType } from '../types/request';

const FORM_PERSISTENCE_KEY_PREFIX = 'un_duty_station_form_';

interface FormPersistenceOptions {
  formType: RequestType;
  enabled?: boolean;
  debounceMs?: number;
}

/**
 * Custom hook for persisting form data to localStorage
 */
export const useFormPersistence = <TFormData extends Record<string, unknown>>(
  form: UseFormReturn<TFormData>,
  options: FormPersistenceOptions
): {
  clearPersistedData: () => void;
  hasPersistedData: boolean;
} => {
  const { formType, enabled = true, debounceMs = 1000 } = options;
  const storageKey = `${FORM_PERSISTENCE_KEY_PREFIX}${formType}`;

  /**
   * Load persisted data on mount
   */
  useEffect(() => {
    if (!enabled) return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Only restore if data is recent (within 24 hours)
        const lastSaved = new Date(parsed.lastSaved);
        const hoursSinceLastSave = (Date.now() - lastSaved.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastSave < 24 && parsed.formData) {
          // Restore form data
          Object.entries(parsed.formData).forEach(([key, value]) => {
            form.setValue(key as keyof TFormData, value as TFormData[keyof TFormData]);
          });
        } else {
          // Clear old data
          localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.error('Error loading persisted form data:', error);
    }
  }, [storageKey, enabled, form]);

  /**
   * Save form data to localStorage on changes (with debouncing)
   */
  useEffect(() => {
    if (!enabled) return;

    const subscription = form.watch((formData) => {
      const timeoutId = setTimeout(() => {
        try {
          const persistenceData = {
            formData,
            lastSaved: new Date().toISOString(),
            formType,
          };
          localStorage.setItem(storageKey, JSON.stringify(persistenceData));
        } catch (error) {
          console.error('Error saving form data:', error);
        }
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    });

    return () => subscription.unsubscribe();
  }, [form, storageKey, formType, enabled, debounceMs]);

  /**
   * Clear persisted data
   */
  const clearPersistedData = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  /**
   * Check if persisted data exists
   */
  const hasPersistedData = useCallback((): boolean => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored !== null;
    } catch {
      return false;
    }
  }, [storageKey]);

  return {
    clearPersistedData,
    hasPersistedData: hasPersistedData(),
  };
};

