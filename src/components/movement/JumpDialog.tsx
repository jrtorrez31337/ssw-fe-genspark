import { useState, useEffect } from 'react';
import type { Ship } from '../../api/ships';
import type { Vector3 } from '../../types/movement';
import { movementApi } from '../../api/movement';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FuelGauge } from './FuelGauge';
import './JumpDialog.css';

interface JumpDialogProps {
  ship: Ship;
  isOpen: boolean;
  onClose: () => void;
  onJump: (targetSector: string) => Promise<void>;
}

export function JumpDialog({ ship, isOpen, onClose, onJump }: JumpDialogProps) {
  const [targetSector, setTargetSector] = useState('');
  const [fuelCost, setFuelCost] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isJumping, setIsJumping] = useState(false);

  // Calculate fuel cost when target sector changes
  useEffect(() => {
    if (!targetSector) {
      setFuelCost(null);
      return;
    }

    try {
      const cost = calculateFuelCost(
        ship.location_sector,
        targetSector,
        5.0, // ship speed (TODO: get from ship stats)
        'normal' // sector type (TODO: could fetch from API)
      );
      setFuelCost(cost);
      setError(null);
    } catch (err) {
      setError('Invalid sector format. Use x.y.z (e.g., 1.0.0)');
      setFuelCost(null);
    }
  }, [targetSector, ship.location_sector]);

  const handleJump = async () => {
    // Use consistent defaults - if backend hasn't deployed fuel system, use 100
    const currentFuel = ship.fuel_current ?? 100;

    if (!fuelCost || fuelCost > currentFuel) {
      setError('Insufficient fuel for this jump');
      return;
    }

    setIsJumping(true);
    try {
      await onJump(targetSector);
      onClose();
    } catch (err: any) {
      setError(movementApi.handleError(err.response?.data));
    } finally {
      setIsJumping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="jump-dialog-overlay" onClick={onClose}>
      <div className="jump-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="jump-dialog-header">
          <h2 className="jump-dialog-title">Jump to Sector</h2>
          <button className="jump-dialog-close" onClick={onClose}>×</button>
        </div>

        <div className="jump-dialog-content">
          {/* Current location */}
          <div className="jump-dialog-field">
            <label className="jump-dialog-label">Current Sector</label>
            <div className="jump-dialog-value">{ship.location_sector}</div>
          </div>

          {/* Target sector input */}
          <div className="jump-dialog-field">
            <label className="jump-dialog-label">Target Sector</label>
            <Input
              type="text"
              placeholder="e.g., 1.0.0"
              value={targetSector}
              onChange={(e) => setTargetSector(e.target.value)}
            />
            <div className="jump-dialog-hint">
              Format: x.y.z (numbers separated by dots)
            </div>
          </div>

          {/* Fuel cost estimate */}
          {fuelCost !== null && (
            <div className="jump-dialog-estimate">
              <div className="jump-dialog-estimate-label">Estimated fuel cost:</div>
              <div className="jump-dialog-estimate-value">{fuelCost.toFixed(2)} units</div>
              <div className="jump-dialog-estimate-remaining">
                Remaining after jump: {((ship.fuel_current ?? 100) - fuelCost).toFixed(2)}
              </div>
            </div>
          )}

          {/* Fuel gauge */}
          <FuelGauge current={ship.fuel_current ?? 100} capacity={ship.fuel_capacity ?? 100} />

          {/* Error message */}
          {error && (
            <div className="jump-dialog-error">
              {error}
            </div>
          )}
        </div>

        <div className="jump-dialog-actions">
          <Button onClick={onClose} disabled={isJumping} variant="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleJump}
            disabled={!fuelCost || fuelCost > (ship.fuel_current ?? 100) || isJumping}
            variant="primary"
          >
            {isJumping ? 'Jumping...' : 'Execute Jump'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate fuel cost
function calculateFuelCost(
  fromSector: string,
  toSector: string,
  shipSpeed: number,
  sectorType: 'normal' | 'nebula' | 'void' | 'hazard'
): number {
  const from = parseSectorCoords(fromSector);
  const to = parseSectorCoords(toSector);

  const distance = Math.sqrt(
    Math.pow(to.x - from.x, 2) +
    Math.pow(to.y - from.y, 2) +
    Math.pow(to.z - from.z, 2)
  );

  const sectorModifiers = {
    normal: 1.0,
    nebula: 1.5,
    void: 0.8,
    hazard: 2.0,
  };

  return distance * (1.0 / shipSpeed) * sectorModifiers[sectorType];
}

function parseSectorCoords(sector: string): Vector3 {
  const parts = sector.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid sector format');
  }
  return {
    x: parseFloat(parts[0]),
    y: parseFloat(parts[1]),
    z: parseFloat(parts[2]),
  };
}
