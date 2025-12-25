import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { inventoryApi } from '../api/inventory';
import { shipApi } from '../api/ships';
import { ResourceItem } from '../components/inventory/ResourceItem';
import { CargoCapacityBar } from '../components/inventory/CargoCapacityBar';
import { TransferModal } from '../components/inventory/TransferModal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import type { InventoryItem } from '../api/inventory';
import './ShipInventoryPage.css';

export function ShipInventoryPage() {
  const { shipId } = useParams<{ shipId: string }>();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const shipQuery = useQuery({
    queryKey: ['ship', shipId],
    queryFn: () => shipApi.getById(shipId!),
    enabled: !!shipId,
  });

  const inventoryQuery = useQuery({
    queryKey: ['inventory', shipId],
    queryFn: () => inventoryApi.getInventory(shipId!, 'ship'),
    enabled: !!shipId,
  });

  const ship = shipQuery.data;
  const inventory = inventoryQuery.data;

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item);
  };

  const handleTransfer = () => {
    if (selectedItem) {
      setShowTransferModal(true);
    }
  };

  if (shipQuery.isLoading || inventoryQuery.isLoading) {
    return <div className="loading-container">Loading inventory...</div>;
  }

  if (!ship || !inventory) {
    return <div className="error-container">Ship or inventory not found</div>;
  }

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </Button>
        <div className="ship-title">
          <h1>{ship.name || 'Unnamed Ship'}</h1>
          <span className="ship-type-tag">{ship.ship_type}</span>
        </div>
      </div>

      <div className="inventory-content">
        <Card title="Cargo Hold">
          <CargoCapacityBar
            used={inventory.used}
            capacity={inventory.capacity}
          />

          {inventory.items.length === 0 ? (
            <div className="empty-cargo">
              <p>Your cargo hold is empty</p>
              <p className="empty-hint">Collect resources through mining or trading</p>
            </div>
          ) : (
            <div className="resource-grid">
              {inventory.items.map((item) => (
                <ResourceItem
                  key={item.id}
                  item={item}
                  onClick={() => handleItemClick(item)}
                  selected={selectedItem?.id === item.id}
                />
              ))}
            </div>
          )}

          {selectedItem && (
            <div className="inventory-actions">
              <Button onClick={handleTransfer}>
                Transfer Selected Resource
              </Button>
              <Button
                variant="secondary"
                onClick={() => setSelectedItem(null)}
              >
                Deselect
              </Button>
            </div>
          )}
        </Card>

        <Card title="Ship Details">
          <div className="ship-stats">
            <div className="stat-row">
              <span className="stat-label">Hull:</span>
              <span className="stat-value">{ship.hull_points} / {ship.hull_max}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Shield:</span>
              <span className="stat-value">{ship.shield_points} / {ship.shield_max}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Location:</span>
              <span className="stat-value">{ship.location_sector}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Cargo Capacity:</span>
              <span className="stat-value">{ship.cargo_capacity} units</span>
            </div>
          </div>
        </Card>
      </div>

      {showTransferModal && selectedItem && shipId && (
        <TransferModal
          sourceId={shipId}
          sourceType="ship"
          item={selectedItem}
          onClose={() => setShowTransferModal(false)}
        />
      )}
    </div>
  );
}
