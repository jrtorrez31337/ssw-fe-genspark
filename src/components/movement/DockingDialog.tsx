import { useState, useEffect } from 'react';
import type { Ship } from '../../api/ships';
import type { Station } from '../../types/movement';
import { movementApi } from '../../api/movement';
import { Button } from '../ui/Button';
import './DockingDialog.css';

interface DockingDialogProps {
  ship: Ship;
  isOpen: boolean;
  onClose: () => void;
  onDock: (stationId: string) => Promise<void>;
}

export function DockingDialog({ ship, isOpen, onClose, onDock }: DockingDialogProps) {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDocking, setIsDocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch stations when dialog opens
  useEffect(() => {
    if (isOpen && ship.location_sector) {
      loadStations();
    }
  }, [isOpen, ship.location_sector]);

  const loadStations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await movementApi.getStations(ship.location_sector);
      setStations(response.stations || []);
    } catch (err) {
      setError('Failed to load stations');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDistance = (station: Station): number => {
    const shipPos = ship.position ?? { x: 0, y: 0, z: 0 };
    return Math.sqrt(
      Math.pow(station.position.x - shipPos.x, 2) +
      Math.pow(station.position.y - shipPos.y, 2) +
      Math.pow(station.position.z - shipPos.z, 2)
    );
  };

  const handleDock = async () => {
    if (!selectedStation) return;

    setIsDocking(true);
    try {
      await onDock(selectedStation.id);
      onClose();
    } catch (err: any) {
      setError(movementApi.handleError(err.response?.data));
    } finally {
      setIsDocking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="docking-dialog-overlay" onClick={onClose}>
      <div className="docking-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="docking-dialog-header">
          <h2 className="docking-dialog-title">Select Station to Dock</h2>
          <button className="docking-dialog-close" onClick={onClose}>×</button>
        </div>

        <div className="docking-dialog-content">
          {isLoading ? (
            <div className="docking-dialog-loading">Loading stations...</div>
          ) : stations.length === 0 ? (
            <div className="docking-dialog-empty">
              No stations in this sector
            </div>
          ) : (
            <div className="docking-stations-list">
              {stations.map((station) => {
                const distance = calculateDistance(station);
                const inRange = distance <= 5000;
                const hasCapacity = station.docked_ships_count < station.docking_capacity;
                const canDock = inRange && hasCapacity;

                return (
                  <div
                    key={station.id}
                    onClick={() => canDock && setSelectedStation(station)}
                    className={`
                      docking-station-card
                      ${selectedStation?.id === station.id ? 'docking-station-card--selected' : ''}
                      ${!canDock ? 'docking-station-card--disabled' : ''}
                    `}
                  >
                    <div className="docking-station-content">
                      <div className="docking-station-info">
                        <div className="docking-station-name">{station.name}</div>
                        <div className="docking-station-type">
                          {station.station_type.charAt(0).toUpperCase() + station.station_type.slice(1)} Station
                        </div>

                        {/* Services */}
                        <div className="docking-station-services">
                          {station.services.map((service) => (
                            <span
                              key={service}
                              className="docking-station-service-badge"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Status indicators */}
                      <div className="docking-station-status">
                        {/* Distance */}
                        <div className={`docking-station-distance ${inRange ? 'docking-station-distance--in-range' : 'docking-station-distance--out-of-range'}`}>
                          {distance.toFixed(0)} units
                          {!inRange && ' (out of range)'}
                        </div>

                        {/* Capacity */}
                        <div className={`docking-station-capacity ${hasCapacity ? '' : 'docking-station-capacity--full'}`}>
                          {station.docked_ships_count}/{station.docking_capacity} docked
                          {!hasCapacity && ' (FULL)'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {error && (
            <div className="docking-dialog-error">
              {error}
            </div>
          )}
        </div>

        <div className="docking-dialog-actions">
          <Button onClick={onClose} disabled={isDocking} variant="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleDock}
            disabled={!selectedStation || isDocking}
            variant="primary"
          >
            {isDocking ? 'Docking...' : 'Dock'}
          </Button>
        </div>
      </div>
    </div>
  );
}
