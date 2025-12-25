import './FuelGauge.css';

interface FuelGaugeProps {
  current: number;
  capacity: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export function FuelGauge({ current, capacity, size = 'medium', showLabel = true }: FuelGaugeProps) {
  // Handle undefined or null values with defaults - use 100 to match backend's initial fuel
  const currentFuel = current ?? 100;
  const maxCapacity = capacity ?? 100;
  const percentage = maxCapacity > 0 ? (currentFuel / maxCapacity) * 100 : 0;

  // Color coding
  const getColor = () => {
    if (percentage > 50) return 'fuel-gauge-bar--high';
    if (percentage > 20) return 'fuel-gauge-bar--medium';
    return 'fuel-gauge-bar--low';
  };

  return (
    <div className={`fuel-gauge fuel-gauge--${size}`}>
      {showLabel && (
        <div className="fuel-gauge-label">
          Fuel: {currentFuel.toFixed(1)}/{maxCapacity.toFixed(1)}
        </div>
      )}
      <div className="fuel-gauge-track">
        <div
          className={`fuel-gauge-bar ${getColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {percentage < 20 && (
        <div className="fuel-gauge-warning">⚠️ Low fuel warning</div>
      )}
    </div>
  );
}
