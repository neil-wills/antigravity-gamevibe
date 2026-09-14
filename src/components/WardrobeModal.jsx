import React, { useState } from 'react';
import DogRenderer, { DOG_BREEDS, ACCESSORIES } from './DogRenderer';
import { AudioFX } from '../game/AudioController';
import '../styles/wardrobe.css';

export default function WardrobeModal({
  selectedBreed,
  wardrobe,
  onSave,
  onClose,
}) {
  const [currentBreed, setCurrentBreed] = useState(selectedBreed);
  const [currentWardrobe, setCurrentWardrobe] = useState({ ...wardrobe });
  const [activeTab, setActiveTab] = useState('hats');

  const handleSelectBreed = (breedId) => {
    setCurrentBreed(breedId);
    AudioFX.playBark(breedId === 'tuck' ? 1.05 : breedId === 'waffles' ? 1.3 : 1.0);
  };

  const handleEquipItem = (category, itemId) => {
    setCurrentWardrobe((prev) => ({
      ...prev,
      [category]: itemId,
    }));
    AudioFX.playPinSlide();
  };

  const handleSaveAndClose = () => {
    AudioFX.playBark(1.1);
    onSave(currentBreed, currentWardrobe);
    onClose();
  };

  const activeBreedObj = DOG_BREEDS.find((b) => b.id === currentBreed) || DOG_BREEDS[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span>🐾</span> Pup Wardrobe & Dressing Room
          </div>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="wardrobe-container">
            {/* Top: Breed Selector Carousel */}
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#555', marginBottom: '6px' }}>
                Select Your Puppy Character:
              </div>
              <div className="breed-selector-row">
                {DOG_BREEDS.map((b) => (
                  <div
                    key={b.id}
                    className={`breed-card ${currentBreed === b.id ? 'selected' : ''}`}
                    onClick={() => handleSelectBreed(b.id)}
                  >
                    <div className="breed-card-avatar">
                      <DogRenderer breedId={b.id} wardrobe={{}} size={48} />
                    </div>
                    <span className="breed-card-name">{b.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Layout: Preview Stage + Dressing Closet */}
            <div className="wardrobe-layout">
              {/* Dog Stage */}
              <div className="dog-stage">
                <DogRenderer
                  breedId={currentBreed}
                  wardrobe={currentWardrobe}
                  size={160}
                />
                <div className="dog-stage-platform" />
                <div className="dog-stage-name">
                  {activeBreedObj.name} 🐶
                </div>
                <div className="dog-stage-breed">{activeBreedObj.title}</div>
                <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '4px', textAlign: 'center' }}>
                  {activeBreedObj.desc}
                </div>
              </div>

              {/* Dressing Closet Tabs & Grid */}
              <div>
                <div className="wardrobe-tabs">
                  <button
                    className={`wardrobe-tab-btn ${activeTab === 'hats' ? 'active' : ''}`}
                    onClick={() => setActiveTab('hats')}
                  >
                    🎩 Hats
                  </button>
                  <button
                    className={`wardrobe-tab-btn ${activeTab === 'collars' ? 'active' : ''}`}
                    onClick={() => setActiveTab('collars')}
                  >
                    🧣 Collars
                  </button>
                  <button
                    className={`wardrobe-tab-btn ${activeTab === 'glasses' ? 'active' : ''}`}
                    onClick={() => setActiveTab('glasses')}
                  >
                    👓 Glasses
                  </button>
                  <button
                    className={`wardrobe-tab-btn ${activeTab === 'boots' ? 'active' : ''}`}
                    onClick={() => setActiveTab('boots')}
                  >
                    👢 Gear
                  </button>
                </div>

                <div className="wardrobe-grid">
                  {ACCESSORIES[activeTab]?.map((item) => {
                    const isEquipped = currentWardrobe[activeTab === 'hats' ? 'hat' : activeTab === 'collars' ? 'collar' : activeTab] === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`wardrobe-item-card ${isEquipped ? 'equipped' : ''}`}
                        onClick={() =>
                          handleEquipItem(
                            activeTab === 'hats' ? 'hat' : activeTab === 'collars' ? 'collar' : activeTab,
                            item.id
                          )
                        }
                      >
                        <span className="wardrobe-item-icon">{item.icon}</span>
                        <span className="wardrobe-item-name">{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-action btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-action btn-primary" onClick={handleSaveAndClose}>
            Ready to Play! ✨
          </button>
        </div>
      </div>
    </div>
  );
}
