// Request basket types following CEB pattern

import type { DutyStationRequest } from './dutyStation';

export interface RequestBasketItem {
  id: string;
  request: DutyStationRequest;
  isSelected: boolean;
  addedAt: Date;
}

export interface RequestBasket {
  items: RequestBasketItem[];
  totalCount: number;
  selectedCount: number;
  lastUpdated: Date;
}

export type BasketAction = 
  | { type: 'ADD_REQUEST'; payload: DutyStationRequest }
  | { type: 'REMOVE_REQUEST'; payload: string }
  | { type: 'TOGGLE_SELECTION'; payload: string }
  | { type: 'SELECT_ALL' }
  | { type: 'DESELECT_ALL' }
  | { type: 'CLEAR_BASKET' }
  | { type: 'UPDATE_REQUEST'; payload: { id: string; request: Partial<DutyStationRequest> } };
