import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { characterApi } from '../api/characters';
import { shipApi } from '../api/ships';
import type { Ship } from '../api/ships';
import { useAuthStore } from '../features/auth/store';
import { useAuth } from '../features/auth/hooks/useAuth';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShipControlPanel } from '../components/movement/ShipControlPanel';
import './DashboardPage.css';

export function DashboardPage() {
  const profileId = useAuthStore((state) => state.profileId);
  const displayName = useAuthStore((state) => state.displayName);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);

  const charactersQuery = useQuery({
    queryKey: ['characters', profileId],
    queryFn: () => characterApi.getByProfile(profileId!),
    enabled: !!profileId,
  });

  const shipsQuery = useQuery({
    queryKey: ['ships', profileId],
    queryFn: () => shipApi.getByOwner(profileId!),
    enabled: !!profileId,
  });

  const characters = charactersQuery.data || [];
  const ships = shipsQuery.data || [];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Welcome, {displayName}</h1>
          <p className="dashboard-subtitle">Command Center</p>
        </div>
        <Button variant="secondary" onClick={logout}>
          Logout
        </Button>
      </div>

      <div className="dashboard-content">
        <Card title="Your Characters">
          {charactersQuery.isLoading && <p className="loading-text">Loading characters...</p>}
          
          {characters.length === 0 && !charactersQuery.isLoading && (
            <div className="empty-state">
              <p>You haven't created any characters yet.</p>
              <Button onClick={() => navigate('/character-create')}>
                Create Character
              </Button>
            </div>
          )}

          {characters.length > 0 && (
            <div className="items-grid">
              {characters.map((character) => (
                <div key={character.id} className="item-card">
                  <h3 className="item-name">{character.name}</h3>
                  <p className="item-detail">Home: {character.home_sector}</p>
                  <div className="item-stats">
                    <div className="stat-badge">
                      🚀 Piloting: {character.attributes.piloting}
                    </div>
                    <div className="stat-badge">
                      🔧 Engineering: {character.attributes.engineering}
                    </div>
                    <div className="stat-badge">
                      🔬 Science: {character.attributes.science}
                    </div>
                    <div className="stat-badge">
                      ⚔️ Tactics: {character.attributes.tactics}
                    </div>
                    <div className="stat-badge">
                      👑 Leadership: {character.attributes.leadership}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Your Ships">
          {shipsQuery.isLoading && <p className="loading-text">Loading ships...</p>}
          
          {ships.length === 0 && !shipsQuery.isLoading && (
            <div className="empty-state">
              <p>You haven't customized any ships yet.</p>
              <Button onClick={() => navigate('/ship-create')}>
                Customize Ship
              </Button>
            </div>
          )}

          {ships.length > 0 && (
            <div className="items-grid">
              {ships.map((ship) => (
                <div key={ship.id} className="item-card">
                  <div className="ship-type-badge">{ship.ship_type}</div>
                  <h3 className="item-name">{ship.name || 'Unnamed Ship'}</h3>
                  <div className="item-stats">
                    <div className="stat-badge">
                      🛡️ Hull: {ship.hull_points}/{ship.hull_max}
                    </div>
                    <div className="stat-badge">
                      ✨ Shield: {ship.shield_points}/{ship.shield_max}
                    </div>
                    <div className="stat-badge">
                      📦 Cargo: {ship.cargo_capacity}
                    </div>
                  </div>
                  <p className="item-detail">Location: {ship.location_sector}</p>
                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                    <Button
                      size="small"
                      onClick={() => navigate(`/ship/${ship.id}/inventory`)}
                      style={{ flex: 1 }}
                    >
                      Inventory
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setSelectedShip(ship)}
                      variant="primary"
                      style={{ flex: 1 }}
                    >
                      Ship Controls
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Quick Actions">
          <div className="actions-grid">
            <Button onClick={() => navigate('/character-create')} size="large">
              Create New Character
            </Button>
            <Button onClick={() => navigate('/ship-create')} size="large">
              Customize New Ship
            </Button>
          </div>
        </Card>
      </div>

      {/* Ship Control Modal */}
      {selectedShip && (
        <div className="ship-control-modal-overlay" onClick={() => setSelectedShip(null)}>
          <div className="ship-control-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ship-control-modal-header">
              <h2 className="ship-control-modal-title">
                {selectedShip.name || 'Unnamed Ship'} - {selectedShip.ship_type}
              </h2>
              <button className="ship-control-modal-close" onClick={() => setSelectedShip(null)}>
                ×
              </button>
            </div>
            <div className="ship-control-modal-content">
              <ShipControlPanel
                ship={selectedShip}
                onRefresh={() => {
                  shipsQuery.refetch();
                  // Update the selected ship with the latest data
                  shipsQuery.data?.forEach(s => {
                    if (s.id === selectedShip.id) {
                      setSelectedShip(s);
                    }
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
