import React from 'react';
import { AudioFX } from '../game/AudioController';
import '../styles/minigames.css';

export default function MiniGameHub({ onSelectGame, onClose }) {
  const games = [
    {
      id: 'fetch',
      title: 'Fetch with Pup! 🎾',
      desc: 'Throw tennis balls & frisbees across the park. Watch your pup sprint, jump, and fetch!',
      icon: '🎾',
      badge: 'Classic Fun',
      color: '#ff4d6d',
    },
    {
      id: 'poop',
      title: 'Garden Poop Patrol 🚜',
      desc: 'Clean the garden! Scoop up poops with the hand scooper or drive the turbo ride-along lawn mower!',
      icon: '💩',
      badge: 'Scooper & Mower',
      color: '#16a34a',
    },
    {
      id: 'park',
      title: 'Dog Park Agility 🌳',
      desc: 'Run through the dog park obstacle course, leap over agility hurdles, and grab tasty biscuits!',
      icon: '🐕',
      badge: 'Speed & Agility',
      color: '#d97706',
    },
  ];

  const handlePick = (id) => {
    AudioFX.playPinSlide();
    onSelectGame(id);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span>🎪</span> Bonus Puppy Mini-Games
          </div>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="minigame-menu-grid" style={{ padding: '4px' }}>
            {games.map((g) => (
              <div
                key={g.id}
                className="minigame-card"
                onClick={() => handlePick(g.id)}
              >
                <div className="minigame-card-icon" style={{ background: `${g.color}20` }}>
                  {g.icon}
                </div>
                <div className="minigame-card-title">{g.title}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: g.color, background: `${g.color}15`, padding: '3px 10px', borderRadius: '12px' }}>
                  {g.badge}
                </div>
                <div className="minigame-card-desc">{g.desc}</div>
                <button
                  className="btn-action btn-primary"
                  style={{ width: '100%', marginTop: '6px', fontSize: '0.9rem', padding: '8px 16px' }}
                >
                  Play Now ➔
                </button>
              </div>
            ))}
          </div>
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
