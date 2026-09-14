import React from 'react';
import { PUZZLE_LEVELS } from '../game/LevelData';
import { AudioFX } from '../game/AudioController';

export default function LevelSelectModal({ currentLevel, onSelectLevel, onClose }) {
  const handlePick = (id) => {
    AudioFX.playPinSlide();
    onSelectLevel(id);
    onClose();
  };

  const easyLevels = PUZZLE_LEVELS.filter((l) => l.difficulty === 'easy');
  const medLevels = PUZZLE_LEVELS.filter((l) => l.difficulty === 'medium');
  const hardLevels = PUZZLE_LEVELS.filter((l) => l.difficulty === 'hard');

  const renderGrid = (levels, tierTitle, color) => (
    <div style={{ marginBottom: '18px' }}>
      <div
        style={{
          fontFamily: 'Fredoka, sans-serif',
          fontWeight: 700,
          fontSize: '1rem',
          color: color,
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span>●</span> {tierTitle}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(65px, 1fr))',
          gap: '10px',
        }}
      >
        {levels.map((lvl) => {
          const isActive = currentLevel === lvl.id;
          return (
            <div
              key={lvl.id}
              onClick={() => handlePick(lvl.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 4px',
                borderRadius: '12px',
                background: isActive ? '#ffe4ec' : '#ffffff',
                border: isActive ? '2.5px solid #ff4d6d' : '2px solid #e5e7eb',
                cursor: 'pointer',
                boxShadow: isActive ? '0 4px 12px rgba(255, 77, 109, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'all 0.2s',
              }}
            >
              <span
                style={{
                  fontFamily: 'Fredoka, sans-serif',
                  fontWeight: 700,
                  fontSize: '1.15rem',
                  color: isActive ? '#ff4d6d' : '#333',
                }}
              >
                {lvl.id}
              </span>
              <span style={{ fontSize: '0.65rem', color: '#ffbe0b' }}>⭐⭐⭐</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span>🗺️</span> Puzzle Level Select
          </div>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {renderGrid(easyLevels, 'Easy Puppies (Levels 1 - 5)', '#059669')}
          {renderGrid(medLevels, 'Clever Canines (Levels 6 - 10)', '#d97706')}
          {renderGrid(hardLevels, 'Master Paws (Levels 11 - 15)', '#dc2626')}
        </div>

        <div className="modal-footer">
          <button className="btn-action btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
