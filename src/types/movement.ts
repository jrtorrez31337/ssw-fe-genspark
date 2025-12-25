// ==================== CORE TYPES ====================

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export type StationType = 'trade' | 'military' | 'research' | 'mining';
export type StationService = 'market' | 'refuel' | 'repair' | 'missions';

export interface Station {
  id: string;
  name: string;
  location_sector: string;
  station_type: StationType;
  position: Vector3;
  faction_id?: string;
  services: StationService[];
  docking_capacity: number;
  docked_ships_count: number;
  created_at: string;
}

// ==================== API REQUEST/RESPONSE TYPES ====================

export interface JumpRequest {
  ship_id: string;
  target_sector: string;
}

export interface JumpResponse {
  success: boolean;
  ship_id: string;
  from_sector: string;
  to_sector: string;
  fuel_consumed: number;
  fuel_remaining: number;
  position: [number, number, number];
  message?: string;
}

export interface DockRequest {
  ship_id: string;
  station_id: string;
}

export interface DockResponse {
  success: boolean;
  ship_id: string;
  station: Station;
  message?: string;
}

export interface UndockRequest {
  ship_id: string;
}

export interface UndockResponse {
  success: boolean;
  ship_id: string;
  message?: string;
}

// ==================== SSE EVENT TYPES ====================

export interface ShipJumpedEvent {
  ship_id: string;
  player_id: string;
  from_sector: string;
  to_sector: string;
  fuel_consumed: number;
  fuel_remaining: number;
  position: [number, number, number];
}

export interface ShipDockedEvent {
  ship_id: string;
  player_id: string;
  station_id: string;
  station_name: string;
  sector: string;
}

export interface ShipUndockedEvent {
  ship_id: string;
  player_id: string;
  station_id: string;
  station_name: string;
  sector: string;
}

// ==================== UI STATE TYPES ====================

export interface JumpDialogState {
  isOpen: boolean;
  targetSector: string;
  fuelCost: number | null;
  isCalculating: boolean;
  error: string | null;
}

export interface DockingDialogState {
  isOpen: boolean;
  stations: Station[];
  selectedStation: Station | null;
  isLoading: boolean;
  error: string | null;
}

export interface MovementState {
  isJumping: boolean;
  isDocking: boolean;
  isUndocking: boolean;
  jumpCooldownRemaining: number; // seconds
  lastError: string | null;
}

// ==================== ERROR TYPES ====================

export type MovementErrorCode =
  | 'INSUFFICIENT_FUEL'       // Not enough fuel for jump
  | 'SHIP_DOCKED'             // Ship must undock before jumping
  | 'SHIP_IN_COMBAT'          // Cannot move during combat
  | 'JUMP_ON_COOLDOWN'        // Jump drive recharging (10s)
  | 'INVALID_SECTOR'          // Invalid sector format
  | 'STATION_NOT_FOUND'       // Station doesn't exist
  | 'NOT_IN_RANGE'            // Ship too far from station (>5000 units)
  | 'STATION_FULL'            // No available docking slots
  | 'SHIP_NOT_DOCKED'         // Ship not currently docked
  | 'SHIP_NOT_FOUND'          // Ship doesn't exist
  | 'VALIDATION_ERROR';       // Invalid request parameters

export interface MovementApiError {
  error: {
    code: MovementErrorCode;
    message: string;
  };
}
