import { useEffect } from 'react';
import type {
  ShipJumpedEvent,
  ShipDockedEvent,
  ShipUndockedEvent,
} from '../types/movement';

interface MovementEvent {
  type: 'SHIP_JUMPED' | 'SHIP_DOCKED' | 'SHIP_UNDOCKED';
  data: ShipJumpedEvent | ShipDockedEvent | ShipUndockedEvent;
}

/**
 * Hook to subscribe to movement-related SSE events
 * @param playerId - The ID of the player to listen for events
 * @param onEvent - Callback to handle incoming events
 */
export function useMovementEvents(
  playerId: string,
  onEvent: (event: MovementEvent) => void
) {
  useEffect(() => {
    if (!playerId) return;

    // API base URL from environment or default
    const API_BASE = '/v1';

    // Create EventSource for SSE
    const eventSource = new EventSource(
      `${API_BASE}/events?channels=player.${playerId},game.movement.jump,game.movement.dock,game.movement.undock`
    );

    // Ship jumped event
    eventSource.addEventListener('SHIP_JUMPED', (e: MessageEvent) => {
      try {
        const event: ShipJumpedEvent = JSON.parse(e.data);
        onEvent({ type: 'SHIP_JUMPED', data: event });
      } catch (error) {
        console.error('Error parsing SHIP_JUMPED event:', error);
      }
    });

    // Ship docked event
    eventSource.addEventListener('SHIP_DOCKED', (e: MessageEvent) => {
      try {
        const event: ShipDockedEvent = JSON.parse(e.data);
        onEvent({ type: 'SHIP_DOCKED', data: event });
      } catch (error) {
        console.error('Error parsing SHIP_DOCKED event:', error);
      }
    });

    // Ship undocked event
    eventSource.addEventListener('SHIP_UNDOCKED', (e: MessageEvent) => {
      try {
        const event: ShipUndockedEvent = JSON.parse(e.data);
        onEvent({ type: 'SHIP_UNDOCKED', data: event });
      } catch (error) {
        console.error('Error parsing SHIP_UNDOCKED event:', error);
      }
    });

    // Error handling
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, [playerId, onEvent]);
}

/**
 * Helper to check if an event is for a specific ship
 */
export function isEventForShip(event: MovementEvent, shipId: string): boolean {
  return event.data.ship_id === shipId;
}
