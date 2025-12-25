import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory';
import type { InventoryItem, OwnerType, TransferRequest } from '../../api/inventory';
import { RESOURCE_METADATA } from '../../constants/resources';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import './TransferModal.css';

interface TransferModalProps {
  sourceId: string;
  sourceType: OwnerType;
  item: InventoryItem;
  onClose: () => void;
}

export function TransferModal({ sourceId, sourceType, item, onClose }: TransferModalProps) {
  const [targetId, setTargetId] = useState('');
  const [targetType, setTargetType] = useState<OwnerType>('station');
  const [quantity, setQuantity] = useState(1);
  const queryClient = useQueryClient();

  const metadata = RESOURCE_METADATA[item.resource_type];

  const transferMutation = useMutation({
    mutationFn: (request: TransferRequest) => inventoryApi.transfer(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    transferMutation.mutate({
      source_id: sourceId,
      source_type: sourceType,
      target_id: targetId,
      target_type: targetType,
      resource_type: item.resource_type,
      quantity,
      quality: item.quality,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Transfer Resources</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="transfer-info">
          <div className="transfer-resource">
            <span className="transfer-icon" style={{ color: metadata.color }}>
              {metadata.icon}
            </span>
            <div>
              <h3>{metadata.name}</h3>
              <p>Available: {item.quantity} units (Quality: {item.quality}x)</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="transfer-form">
          <div className="form-group">
            <label>Target Type</label>
            <select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value as OwnerType)}
              className="form-select"
            >
              <option value="ship">Ship</option>
              <option value="station">Station</option>
              <option value="planet">Planet</option>
            </select>
          </div>

          <div className="form-group">
            <label>Target ID</label>
            <Input
              type="text"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder="Enter target UUID"
              required
            />
          </div>

          <div className="form-group">
            <label>Quantity (max: {item.quantity})</label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 0, item.quantity))}
              min={1}
              max={item.quantity}
              required
            />
            <input
              type="range"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              min={1}
              max={item.quantity}
              className="quantity-slider"
            />
          </div>

          {transferMutation.isError && (
            <div className="error-message">
              {(transferMutation.error as any)?.response?.data?.error?.message || 'Transfer failed'}
            </div>
          )}

          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={transferMutation.isPending || !targetId}
            >
              {transferMutation.isPending ? 'Transferring...' : 'Transfer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
