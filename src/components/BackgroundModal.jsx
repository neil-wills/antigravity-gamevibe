import React from 'react';
import { AudioFX } from '../game/AudioController';
import '../styles/backgrounds.css';

export const BACKGROUND_THEMES = [
  {
    id: 'hearts',
    name: 'Floating Hearts (Default)',
    desc: 'Sweet glowing hearts drifting with love',
    color1: '#ffdde5',
    color2: '#ff4d6d',
    emoji: '💖',
  },
  {
    id: 'park',
    name: 'Sunny Dog Park',
    desc: 'Lush green grass and floating pollen under a blue sky',
    color1: '#a7e4f8',
    color2: '#52b72a',
    emoji: '🌳',
  },
  {
    id: 'room',
    name: 'Cozy Living Room',
    desc: 'Warm fireplace glow and soft cozy rugs',
    color1: '#ffd8a8',
    color2: '#7d4420',
    emoji: '🛋️',
  },
  {
    id: 'night',
    name: 'Starry Cosmic Pup',
    desc: 'Twinkling galaxy starfield and mystical glow',
    color1: '#1e1b4b',
    color2: '#93c5fd',
    emoji: '✨',
  },
  {
    id: 'blossom',
    name: 'Blossom Garden',
    desc: 'Gentle pink cherry blossom petals fluttering down',
    color1: '#fce7f3',
    color2: '#f472b6',
    emoji: '🌸',
  },
];

export default function BackgroundModal({ currentTheme, onSelectTheme, onClose }) {
  const handleSelect = (themeId) => {
    AudioFX.playPinSlide();
    onSelectTheme(themeId);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span>🎨</span> Select Game Background
          </div>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '16px' }}>
            Choose the backdrop for your puppy puzzle world! The default theme is <strong>Floating Hearts</strong>.
          </p>

          <div className="bg-selector-grid">
            {BACKGROUND_THEMES.map((theme) => (
              <div
                key={theme.id}
                className={`bg-choice-card ${currentTheme === theme.id ? 'selected' : ''}`}
                onClick={() => handleSelect(theme.id)}
              >
                <div
                  className="bg-preview-swatch"
                  style={{
                    background: `linear-gradient(135deg, ${theme.color1}, ${theme.color2})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                  }}
                >
                  {theme.emoji}
                </div>
                <div className="bg-choice-name">{theme.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#777', textAlign: 'center' }}>
                  {theme.desc}
                </div>
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
