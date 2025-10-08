// Custom hook for managing request basket state
import { useState, useEffect, useCallback } from 'react';
import type { BasketItem, DutyStationRequest, SubmissionResult } from '../schemas/dutyStationSchema';
import type { BasketStats } from '../types/request';
import {
  loadBasket,
  addToBasket as addToBasketService,
  removeFromBasket as removeFromBasketService,
  updateBasketItem as updateBasketItemService,
  reorderBasket as reorderBasketService,
  clearBasket as clearBasketService,
  getBasketStats as getBasketStatsService,
  submitBasket as submitBasketService,
  exportBasketAsJson,
  importBasketFromJson,
} from '../services/basketService';

export interface UseBasketReturn {
  basket: BasketItem[];
  stats: BasketStats;
  addToBasket: (request: DutyStationRequest) => void;
  removeFromBasket: (itemId: string) => void;
  updateBasketItem: (itemId: string, updates: Partial<BasketItem>) => void;
  reorderBasket: (itemId: string, newPriority: number) => void;
  clearBasket: () => void;
  submitBasket: (items?: BasketItem[]) => Promise<SubmissionResult>;
  exportAsJson: () => string;
  importFromJson: (jsonString: string) => boolean;
  isSubmitting: boolean;
}

/**
 * Custom hook for managing request basket
 */
export const useBasket = (): UseBasketReturn => {
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load basket from localStorage on mount
  useEffect(() => {
    const loadedBasket = loadBasket();
    setBasket(loadedBasket);
  }, []);

  // Calculate stats whenever basket changes
  const stats = getBasketStatsService(basket);

  /**
   * Add request to basket
   */
  const addToBasket = useCallback((request: DutyStationRequest) => {
    const newItem = addToBasketService(request);
    setBasket(prev => [...prev, newItem]);
  }, []);

  /**
   * Remove request from basket
   */
  const removeFromBasket = useCallback((itemId: string) => {
    const updated = removeFromBasketService(itemId);
    setBasket(updated);
  }, []);

  /**
   * Update basket item
   */
  const updateBasketItem = useCallback((itemId: string, updates: Partial<BasketItem>) => {
    const updated = updateBasketItemService(itemId, updates);
    setBasket(updated);
  }, []);

  /**
   * Reorder basket items (for drag-and-drop)
   */
  const reorderBasket = useCallback((itemId: string, newPriority: number) => {
    const updated = reorderBasketService(itemId, newPriority);
    setBasket(updated);
  }, []);

  /**
   * Clear entire basket
   */
  const clearBasket = useCallback(() => {
    clearBasketService();
    setBasket([]);
  }, []);

  /**
   * Submit basket items
   */
  const submitBasket = useCallback(async (items?: BasketItem[]): Promise<SubmissionResult> => {
    const itemsToSubmit = items || basket.filter(item => item.status === 'pending');
    
    if (itemsToSubmit.length === 0) {
      return {
        success: false,
        submittedAt: new Date(),
        errors: ['No items to submit'],
      };
    }

    setIsSubmitting(true);
    
    try {
      const result = await submitBasketService(itemsToSubmit);
      
      if (result.success) {
        // Reload basket after submission
        const remainingBasket = loadBasket();
        setBasket(remainingBasket);
      }
      
      return result;
    } finally {
      setIsSubmitting(false);
    }
  }, [basket]);

  /**
   * Export basket as JSON
   */
  const exportAsJson = useCallback((): string => {
    return exportBasketAsJson(basket);
  }, [basket]);

  /**
   * Import basket from JSON
   */
  const importFromJson = useCallback((jsonString: string): boolean => {
    const imported = importBasketFromJson(jsonString);
    if (imported) {
      setBasket(imported);
      return true;
    }
    return false;
  }, []);

  return {
    basket,
    stats,
    addToBasket,
    removeFromBasket,
    updateBasketItem,
    reorderBasket,
    clearBasket,
    submitBasket,
    exportAsJson,
    importFromJson,
    isSubmitting,
  };
};

