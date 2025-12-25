import './CargoCapacityBar.css';

interface CargoCapacityBarProps {
  used: number;
  capacity: number;
}

export function CargoCapacityBar({ used, capacity }: CargoCapacityBarProps) {
  const percentage = (used / capacity) * 100;
  const isNearFull = percentage >= 80;
  const isFull = percentage >= 100;

  return (
    <div className="cargo-capacity">
      <div className="cargo-header">
        <span className="cargo-label">Cargo Hold</span>
        <span className={`cargo-stats ${isNearFull ? 'warning' : ''} ${isFull ? 'full' : ''}`}>
          {used} / {capacity} units ({percentage.toFixed(1)}%)
        </span>
      </div>

      <div className="cargo-bar">
        <div
          className={`cargo-fill ${isNearFull ? 'warning' : ''} ${isFull ? 'full' : ''}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
