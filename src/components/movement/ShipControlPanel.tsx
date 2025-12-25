import { useState } from 'react';
import type { Ship } from '../../api/ships';
import { movementApi } from '../../api/movement';
import { Button } from '../ui/Button';
import { FuelGauge } from './FuelGauge';
import { JumpCooldownTimer } from './JumpCooldownTimer';
import { JumpDialog } from './JumpDialog';
import { DockingDialog } from './DockingDialog';
import './ShipControlPanel.css';

interface ShipControlPanelProps {
  ship: Ship;
  onRefresh: () => void;
}

export function ShipControlPanel({ ship, onRefresh }: ShipControlPanelProps) {
  const [jumpDialogOpen, setJumpDialogOpen] = useState(false);
  const [dockDialogOpen, setDockDialogOpen] = useState(false);
  const [isUndocking, setIsUndocking] = useState(false);
  const [jumpOnCooldown, setJumpOnCooldown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDocked = !!ship.docked_at;

  // Debug logging - check what fuel values we're receiving
  console.log('🚀 Ship Control Panel - Fuel Debug:', {
    shipName: ship.name,
    fuel_current: ship.fuel_current,
    fuel_capacity: ship.fuel_capacity,
    position: ship.position,
    hasMovementData: ship.fuel_current !== undefined && ship.fuel_capacity !== undefined && ship.position !== undefined
  });

  // Check if ship has required movement data from backend
  const hasMovementData = ship.fuel_current !== undefined &&
                          ship.fuel_capacity !== undefined &&
                          ship.position !== undefined;

  // Provide defaults for missing data
  const shipWithDefaults = {
    ...ship,
    fuel_current: ship.fuel_current ?? 100,
    fuel_capacity: ship.fuel_capacity ?? 100,
    position: ship.position ?? { x: 0, y: 0, z: 0 },
    in_combat: ship.in_combat ?? false,
  };

  const handleJump = async (targetSector: string) => {
    try {
      await movementApi.jump(ship.id, targetSector);
      onRefresh();
    } catch (err: any) {
      throw err; // Re-throw for JumpDialog to handle
    }
  };

  const handleDock = async (stationId: string) => {
    try {
      await movementApi.dock(ship.id, stationId);
      onRefresh();
    } catch (err: any) {
      throw err; // Re-throw for DockingDialog to handle
    }
  };

  const handleUndock = async () => {
    setIsUndocking(true);
    setError(null);
    try {
      await movementApi.undock(ship.id);
      onRefresh();
    } catch (err: any) {
      setError(movementApi.handleError(err.response?.data));
    } finally {
      setIsUndocking(false);
    }
  };

  return (
    <div className="ship-control-panel">
      <h3 className="ship-control-panel-title">Ship Controls</h3>

      {/* Warning if backend data is incomplete */}
      {!hasMovementData && (
        <div className="ship-control-panel-warning">
          ⚠️ Movement system using default values (100 fuel). Backend fuel system not yet deployed. Jump functionality will work once backend is updated.
        </div>
      )}

      {/* Ship status */}
      <div className="ship-control-panel-status">
        <div className="ship-control-panel-stat">
          <span className="ship-control-panel-stat-label">Location:</span>
          <span className="ship-control-panel-stat-value">{ship.location_sector}</span>
        </div>
        <div className="ship-control-panel-stat">
          <span className="ship-control-panel-stat-label">Status:</span>
          <span className={`ship-control-panel-stat-value ship-control-panel-stat-value--${isDocked ? 'docked' : 'free'}`}>
            {isDocked ? 'Docked' : 'Free Flight'}
          </span>
        </div>
      </div>

      {/* Fuel gauge */}
      <div className="ship-control-panel-section">
        <FuelGauge current={shipWithDefaults.fuel_current} capacity={shipWithDefaults.fuel_capacity} />
      </div>

      {/* Jump cooldown */}
      {ship.last_jump_at && (
        <JumpCooldownTimer
          lastJumpAt={ship.last_jump_at}
          onCooldownComplete={() => setJumpOnCooldown(false)}
        />
      )}

      {/* Error display */}
      {error && (
        <div className="ship-control-panel-error">
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div className="ship-control-panel-actions">
        {isDocked ? (
          <Button
            onClick={handleUndock}
            disabled={isUndocking}
            size="large"
            variant="secondary"
          >
            {isUndocking ? 'Undocking...' : 'Undock from Station'}
          </Button>
        ) : (
          <>
            <Button
              onClick={() => setJumpDialogOpen(true)}
              disabled={jumpOnCooldown || shipWithDefaults.in_combat}
              size="large"
              variant="primary"
            >
              Jump to Sector
            </Button>
            <Button
              onClick={() => setDockDialogOpen(true)}
              disabled={shipWithDefaults.in_combat}
              size="large"
              variant="secondary"
            >
              Dock at Station
            </Button>
          </>
        )}
      </div>

      {/* Dialogs */}
      <JumpDialog
        ship={shipWithDefaults}
        isOpen={jumpDialogOpen}
        onClose={() => setJumpDialogOpen(false)}
        onJump={handleJump}
      />
      <DockingDialog
        ship={shipWithDefaults}
        isOpen={dockDialogOpen}
        onClose={() => setDockDialogOpen(false)}
        onDock={handleDock}
      />
    </div>
  );
}
