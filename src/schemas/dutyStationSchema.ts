// Zod validation schema for duty station requests
import { z } from 'zod';

/**
 * Request types supported by the system
 */
export const RequestType = {
  ADD: 'add',
  UPDATE: 'update',
  REMOVE: 'remove',
  COORDINATE_UPDATE: 'coordinate_update',
} as const;

export type RequestTypeValue = typeof RequestType[keyof typeof RequestType];

/**
 * Coordinate validation schema
 */
const coordinateSchema = z.object({
  latitude: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
});

/**
 * Base duty station request schema
 */
const baseRequestSchema = z.object({
  requestType: z.enum([
    RequestType.ADD,
    RequestType.UPDATE,
    RequestType.REMOVE,
    RequestType.COORDINATE_UPDATE,
  ]),
  requestDate: z.date().default(() => new Date()),
  submittedBy: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  organization: z.string().min(1, 'Organization is required'),
  justification: z
    .string()
    .min(10, 'Please provide a detailed justification (minimum 10 characters)')
    .max(1000, 'Justification must be less than 1000 characters'),
});

/**
 * Add new duty station request schema
 */
export const addDutyStationSchema = baseRequestSchema.extend({
  requestType: z.literal(RequestType.ADD),
  name: z
    .string()
    .min(1, 'Station name is required')
    .max(100, 'Name must be less than 100 characters'),
  country: z.string().min(1, 'Country is required'),
  countryCode: z
    .string()
    .min(1, 'Country code is required')
    .max(10, 'Country code must be less than 10 characters'),
  commonName: z.string().max(100, 'Common name must be less than 100 characters').optional(),
  coordinates: coordinateSchema.refine(
    (coords) => coords.latitude !== 0 || coords.longitude !== 0,
    { message: 'Please select a valid city to populate coordinates' }
  ),
  // Proposed code is optional - system will auto-generate if not provided
  proposedCode: z
    .union([
      z.string().regex(/^[A-Z]{3}$/, 'Duty station code must be 3 uppercase letters'),
      z.literal(''),
    ])
    .optional(),
});

/**
 * Update existing duty station request schema
 */
export const updateDutyStationSchema = baseRequestSchema.extend({
  requestType: z.literal(RequestType.UPDATE),
  dutyStationCode: z
    .string()
    .min(1, 'Duty station code is required')
    .max(10, 'Code must be less than 10 characters'),
  countryCode: z
    .string()
    .min(1, 'Country code is required')
    .max(10, 'Country code must be less than 10 characters'),
  currentData: z.object({
    name: z.string(),
    country: z.string(),
    commonName: z.string().optional(),
    coordinates: coordinateSchema,
  }),
  proposedChanges: z.object({
    name: z.string().max(100).optional(),
    commonName: z.string().max(100).optional(),
    coordinates: coordinateSchema.optional(),
  }),
});

/**
 * Remove/obsolete duty station request schema
 */
export const removeDutyStationSchema = baseRequestSchema.extend({
  requestType: z.literal(RequestType.REMOVE),
  dutyStationCode: z.string().min(1, 'Duty station code is required'),
  countryCode: z
    .string()
    .min(1, 'Country code is required')
    .max(10, 'Country code must be less than 10 characters'),
  currentData: z.object({
    name: z.string(),
    country: z.string(),
    commonName: z.string().optional(),
  }),
});

/**
 * Coordinate update request schema
 */
export const coordinateUpdateSchema = baseRequestSchema.extend({
  requestType: z.literal(RequestType.COORDINATE_UPDATE),
  dutyStationCode: z.string().min(1, 'Duty station code is required'),
  countryCode: z
    .string()
    .min(1, 'Country code is required')
    .max(10, 'Country code must be less than 10 characters'),
  stationName: z.string(),
  currentCoordinates: coordinateSchema,
  proposedCoordinates: coordinateSchema,
});

/**
 * Union type for all request schemas
 */
export const dutyStationRequestSchema = z.discriminatedUnion('requestType', [
  addDutyStationSchema,
  updateDutyStationSchema,
  removeDutyStationSchema,
  coordinateUpdateSchema,
]);

/**
 * TypeScript types inferred from schemas
 */
export type AddDutyStationRequest = z.infer<typeof addDutyStationSchema>;
export type UpdateDutyStationRequest = z.infer<typeof updateDutyStationSchema>;
export type RemoveDutyStationRequest = z.infer<typeof removeDutyStationSchema>;
export type CoordinateUpdateRequest = z.infer<typeof coordinateUpdateSchema>;
export type DutyStationRequest = z.infer<typeof dutyStationRequestSchema>;

/**
 * Basket item with additional metadata
 */
export interface BasketItem {
  id: string;
  request: DutyStationRequest;
  addedAt: Date;
  priority: number;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
}

/**
 * Request submission result
 */
export interface SubmissionResult {
  success: boolean;
  submittedAt: Date;
  errors?: string[];
}





