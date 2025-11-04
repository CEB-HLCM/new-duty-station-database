// Request-related TypeScript interfaces
import type { DutyStation } from './dutyStation';

/**
 * Request type enumeration
 */
export type RequestType = 'add' | 'update' | 'remove' | 'coordinate_update';

/**
 * Request status
 */
export type RequestStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

/**
 * Base request interface
 */
export interface BaseRequest {
  id: string;
  requestType: RequestType;
  requestDate: Date;
  submittedBy: string;
  organization: string;
  justification: string;
  status: RequestStatus;
}

/**
 * Coordinate pair
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Request history entry
 */
export interface RequestHistoryEntry {
  id: string;
  request: BaseRequest;
  submittedAt: Date;
  confirmationId?: string;
  status: RequestStatus;
}

/**
 * Basket statistics
 */
export interface BasketStats {
  totalItems: number;
  pendingItems: number;
  addRequests: number;
  updateRequests: number;
  removeRequests: number;
  coordinateUpdateRequests: number;
}

/**
 * Form persistence data
 */
export interface FormPersistenceData {
  formData: Record<string, unknown>;
  lastSaved: Date;
  formType: RequestType;
}

/**
 * Request basket item
 */
export interface RequestBasketItem {
  id: string;
  request: BaseRequest;
  addedAt: Date;
  priority: number;
  status: RequestStatus;
}

/**
 * Request basket
 */
export interface RequestBasket {
  items: RequestBasketItem[];
  lastUpdated: Date;
}

/**
 * Basket action type
 */
export type BasketAction = 
  | { type: 'ADD'; payload: BaseRequest }
  | { type: 'REMOVE'; payload: string }
  | { type: 'UPDATE'; payload: { id: string; updates: Partial<RequestBasketItem> } }
  | { type: 'CLEAR' }
  | { type: 'REORDER'; payload: { id: string; newPriority: number } };
