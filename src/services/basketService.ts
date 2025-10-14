// Request basket service with localStorage persistence
import type { BasketItem, DutyStationRequest, SubmissionResult } from '../schemas/dutyStationSchema';
import type { BasketStats, RequestHistoryEntry } from '../types/request';

const BASKET_STORAGE_KEY = 'un_duty_station_basket';
const HISTORY_STORAGE_KEY = 'un_duty_station_history';

/**
 * Generate unique ID for basket items
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Load basket from localStorage
 */
export const loadBasket = (): BasketItem[] => {
  try {
    const stored = localStorage.getItem(BASKET_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    return parsed.map((item: BasketItem) => ({
      ...item,
      addedAt: new Date(item.addedAt),
      request: {
        ...item.request,
        requestDate: new Date(item.request.requestDate),
      },
    }));
  } catch (error) {
    console.error('Error loading basket from localStorage:', error);
    return [];
  }
};

/**
 * Save basket to localStorage
 */
export const saveBasket = (basket: BasketItem[]): void => {
  try {
    localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(basket));
  } catch (error) {
    console.error('Error saving basket to localStorage:', error);
  }
};

/**
 * Add request to basket
 */
export const addToBasket = (request: DutyStationRequest): BasketItem => {
  const basket = loadBasket();
  
  const newItem: BasketItem = {
    id: generateId(),
    request,
    addedAt: new Date(),
    priority: basket.length + 1,
    status: 'pending',
  };

  basket.push(newItem);
  saveBasket(basket);
  
  return newItem;
};

/**
 * Remove request from basket
 */
export const removeFromBasket = (itemId: string): BasketItem[] => {
  const basket = loadBasket();
  const filtered = basket.filter(item => item.id !== itemId);
  saveBasket(filtered);
  return filtered;
};

/**
 * Update basket item
 */
export const updateBasketItem = (itemId: string, updates: Partial<BasketItem>): BasketItem[] => {
  const basket = loadBasket();
  const updated = basket.map(item =>
    item.id === itemId ? { ...item, ...updates } : item
  );
  saveBasket(updated);
  return updated;
};

/**
 * Reorder basket items (for drag-and-drop)
 */
export const reorderBasket = (itemId: string, newPriority: number): BasketItem[] => {
  const basket = loadBasket();
  const item = basket.find(i => i.id === itemId);
  
  if (!item) return basket;

  const oldPriority = item.priority;
  
  // Reorder priorities
  const reordered = basket.map(i => {
    if (i.id === itemId) {
      return { ...i, priority: newPriority };
    }
    if (oldPriority < newPriority && i.priority > oldPriority && i.priority <= newPriority) {
      return { ...i, priority: i.priority - 1 };
    }
    if (oldPriority > newPriority && i.priority >= newPriority && i.priority < oldPriority) {
      return { ...i, priority: i.priority + 1 };
    }
    return i;
  });

  // Sort by priority
  const sorted = reordered.sort((a, b) => a.priority - b.priority);
  saveBasket(sorted);
  return sorted;
};

/**
 * Clear entire basket
 */
export const clearBasket = (): void => {
  localStorage.removeItem(BASKET_STORAGE_KEY);
};

/**
 * Get basket statistics
 */
export const getBasketStats = (basket: BasketItem[]): BasketStats => {
  return {
    totalItems: basket.length,
    pendingItems: basket.filter(item => item.status === 'pending').length,
    addRequests: basket.filter(item => item.request.requestType === 'add').length,
    updateRequests: basket.filter(item => item.request.requestType === 'update').length,
    removeRequests: basket.filter(item => item.request.requestType === 'remove').length,
    coordinateUpdateRequests: basket.filter(item => item.request.requestType === 'coordinate_update').length,
  };
};

/**
 * Load request history from localStorage
 */
export const loadHistory = (): RequestHistoryEntry[] => {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return parsed.map((entry: RequestHistoryEntry) => ({
      ...entry,
      submittedAt: new Date(entry.submittedAt),
      request: {
        ...entry.request,
        requestDate: new Date(entry.request.requestDate),
      },
    }));
  } catch (error) {
    console.error('Error loading history from localStorage:', error);
    return [];
  }
};

/**
 * Save request history to localStorage
 */
export const saveHistory = (history: RequestHistoryEntry[]): void => {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving history to localStorage:', error);
  }
};

/**
 * Add entry to request history
 */
export const addToHistory = (item: BasketItem, confirmationId?: string): void => {
  const history = loadHistory();
  
  const entry: RequestHistoryEntry = {
    id: item.id,
    request: {
      id: item.id,
      requestType: item.request.requestType,
      requestDate: item.request.requestDate,
      submittedBy: item.request.submittedBy,
      organization: item.request.organization,
      justification: item.request.justification,
      status: item.status,
    },
    submittedAt: new Date(),
    confirmationId,
    status: 'submitted',
  };

  history.unshift(entry); // Add to beginning
  
  // Keep only last 100 entries
  const trimmed = history.slice(0, 100);
  saveHistory(trimmed);
};

/**
 * Submit basket items (batch submission)
 */
export const submitBasket = async (items: BasketItem[]): Promise<SubmissionResult> => {
  try {
    // In a real implementation, this would call an API endpoint
    // For now, we'll simulate submission and add to history
    
    const confirmationId = `CONF-${generateId().toUpperCase()}`;
    
    // Add all items to history
    items.forEach(item => {
      addToHistory(item, confirmationId);
    });

    // Remove submitted items from basket
    const currentBasket = loadBasket();
    const itemIds = items.map(i => i.id);
    const remaining = currentBasket.filter(item => !itemIds.includes(item.id));
    saveBasket(remaining);

    return {
      success: true,
      submittedAt: new Date(),
      confirmationId,
    };
  } catch (error) {
    console.error('Error submitting basket:', error);
    return {
      success: false,
      submittedAt: new Date(),
      errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
    };
  }
};

/**
 * Export basket as JSON
 */
export const exportBasketAsJson = (basket: BasketItem[]): string => {
  return JSON.stringify(basket, null, 2);
};

/**
 * Import basket from JSON
 */
export const importBasketFromJson = (jsonString: string): BasketItem[] | null => {
  try {
    const parsed = JSON.parse(jsonString);
    // Validate structure
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid basket format');
    }
    
    // Convert dates
    const items = parsed.map((item: BasketItem) => ({
      ...item,
      addedAt: new Date(item.addedAt),
      request: {
        ...item.request,
        requestDate: new Date(item.request.requestDate),
      },
    }));

    // Merge with existing basket
    const currentBasket = loadBasket();
    const merged = [...currentBasket, ...items];
    saveBasket(merged);
    
    return merged;
  } catch (error) {
    console.error('Error importing basket:', error);
    return null;
  }
};



