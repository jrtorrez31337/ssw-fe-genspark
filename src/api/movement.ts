import { apiClient } from './client';
import type {
  JumpResponse,
  DockResponse,
  UndockResponse,
  Station,
  MovementApiError,
  MovementErrorCode,
} from '../types/movement';

// ==================== MOVEMENT ENDPOINTS ====================

/**
 * Execute a hyperspace jump to a target sector
 */
export async function jumpToSector(shipId: string, targetSector: string): Promise<JumpResponse> {
  const response = await apiClient.post<{ data: JumpResponse }>('/actions/jump', {
    ship_id: shipId,
    target_sector: targetSector,
  });
  return response.data.data;
}

/**
 * Dock at a space station
 */
export async function dockAtStation(shipId: string, stationId: string): Promise<DockResponse> {
  const response = await apiClient.post<{ data: DockResponse }>('/actions/dock', {
    ship_id: shipId,
    station_id: stationId,
  });
  return response.data.data;
}

/**
 * Undock from current station
 */
export async function undockFromStation(shipId: string): Promise<UndockResponse> {
  const response = await apiClient.post<{ data: UndockResponse }>('/actions/undock', {
    ship_id: shipId,
  });
  return response.data.data;
}

/**
 * Get list of stations in a sector
 */
export async function getStationsInSector(sector: string): Promise<{ stations: Station[] }> {
  const response = await apiClient.get<{ data: { stations: Station[] } }>(`/stations?sector=${sector}`);
  return response.data.data;
}

// ==================== ERROR HANDLER ====================

/**
 * Converts API error codes to user-friendly messages
 */
export function handleMovementError(error: MovementApiError | any): string {
  const code = error.error?.code as MovementErrorCode;

  switch (code) {
    case 'INSUFFICIENT_FUEL':
      return 'Not enough fuel for this jump. Find a station to refuel.';
    case 'SHIP_DOCKED':
      return 'You must undock from the station before jumping.';
    case 'SHIP_IN_COMBAT':
      return 'Cannot jump or dock while in combat!';
    case 'JUMP_ON_COOLDOWN':
      return 'Jump drive is recharging. Wait 10 seconds.';
    case 'INVALID_SECTOR':
      return 'Invalid sector coordinates. Use format: x.y.z';
    case 'STATION_NOT_FOUND':
      return 'Station not found in this sector.';
    case 'NOT_IN_RANGE':
      return 'Too far from station. Must be within 5000 units.';
    case 'STATION_FULL':
      return 'Station is at maximum capacity. Try another station.';
    case 'SHIP_NOT_DOCKED':
      return 'Ship is not currently docked at a station.';
    case 'SHIP_NOT_FOUND':
      return 'Ship not found.';
    default:
      return error.error?.message || error.message || 'An error occurred';
  }
}

// ==================== MOVEMENT API NAMESPACE ====================

export const movementApi = {
  jump: jumpToSector,
  dock: dockAtStation,
  undock: undockFromStation,
  getStations: getStationsInSector,
  handleError: handleMovementError,
};
