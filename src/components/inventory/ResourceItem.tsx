import type { InventoryItem } from '../../api/inventory';
import { RESOURCE_METADATA, RARITY_COLORS } from '../../constants/resources';
import './ResourceItem.css';

interface ResourceItemProps {
  item: InventoryItem;
  onClick?: () => void;
  selected?: boolean;
}

export function ResourceItem({ item, onClick, selected }: ResourceItemProps) {
  const metadata = RESOURCE_METADATA[item.resource_type];
  const qualityPercent = ((item.quality - 0.5) / 1.5) * 100; // 0.5-2.0 mapped to 0-100%

  return (
    <div
      className={`resource-item ${selected ? 'selected' : ''}`}
      onClick={onClick}
      style={{ borderColor: metadata.color }}
    >
      <div className="resource-icon" style={{ color: metadata.color }}>
        {metadata.icon}
      </div>

      <div className="resource-info">
        <h4 className="resource-name">{metadata.name}</h4>
        <p className="resource-description">{metadata.description}</p>

        <div className="resource-stats">
          <span className="resource-quantity">Qty: {item.quantity}</span>
          <span
            className="resource-rarity"
            style={{ color: RARITY_COLORS[metadata.rarity] }}
          >
            {metadata.rarity}
          </span>
        </div>

        {item.quality !== 1.0 && (
          <div className="quality-bar">
            <div className="quality-label">Quality: {item.quality.toFixed(2)}x</div>
            <div className="quality-progress">
              <div
                className="quality-fill"
                style={{
                  width: `${qualityPercent}%`,
                  backgroundColor: metadata.color
                }}
              />
            </div>
          </div>
        )}

        <div className="resource-volume">
          Volume: {item.total_volume} units
        </div>
      </div>
    </div>
  );
}
