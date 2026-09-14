import React from 'react';
import DogRenderer, { DOG_BREEDS } from './DogRenderer';
import { AudioFX } from '../game/AudioController';

export default function HeaderHUD({
  totalPoints,
  totalSteps,
  currentBreed,
  wardrobe,
  currentLevel,
  bgTheme,
  onOpenWardrobe,
  onOpenBgModal,
  onOpenLevelModal,
  isMuted,
  onToggleMute,
}) {
  const breedObj = DOG_BREEDS.find((b) => b.id === currentBreed) || DOG_BREEDS[0];

  return (
    <header className="hud-header">
      {/* Left: Dog Profile & Dress Up Trigger */}
      <div className="hud-left">
        <button
          className="dog-profile-btn"
          onClick={() => {
            AudioFX.playBreedBark(currentBreed);
            onOpenWardrobe();
          }}
          title={`Dress up ${breedObj.name} or tap to bark!`}
        >
          <div className="dog-avatar-mini">
            <DogRenderer breedId={currentBreed} wardrobe={wardrobe} size={30} />
          </div>
          <span className="dog-profile-name">{breedObj.name} 🐶</span>
        </button>

        {/* Level Indicator button */}
        <button
          className="stat-pill"
          onClick={onOpenLevelModal}
          title="Change Level"
          style={{ cursor: 'pointer' }}
        >
          <span className="icon">🗺️</span>
          <span>Lv. {currentLevel}</span>
        </button>
      </div>

      {/* Right: Scores, Steps, Audio, Backgrounds */}
      <div className="hud-right">
        <div className="stat-pill score-pill" title="Total Feeding & Bonus Points">
          <span className="icon">⭐</span>
          <span>{totalPoints.toLocaleString()}</span>
        </div>

        <div className="stat-pill step-pill" title="Dog Walking Steps">
          <span className="icon">🐾</span>
          <span>{totalSteps.toLocaleString()}</span>
        </div>

        <button
          className="btn-icon"
          onClick={onOpenBgModal}
          title="Change Background"
        >
          {bgTheme === 'hearts' ? '💖' : '🎨'}
        </button>

        <button
          className="btn-icon"
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>
    </header>
  );
}
