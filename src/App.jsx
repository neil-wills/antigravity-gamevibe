import React, { useState, useEffect } from 'react';
import HeaderHUD from './components/HeaderHUD';
import BackgroundCanvas from './components/BackgroundCanvas';
import PinGameCanvas from './components/PinGameCanvas';
import WardrobeModal from './components/WardrobeModal';
import BackgroundModal from './components/BackgroundModal';
import LevelSelectModal from './components/LevelSelectModal';
import MiniGameHub from './minigames/MiniGameHub';
import FetchGame from './minigames/FetchGame';
import PoopPatrolGame from './minigames/PoopPatrolGame';
import DogParkGame from './minigames/DogParkGame';
import { AudioFX } from './game/AudioController';
import './styles/main.css';

export default function App() {
  // Persistent Scores & Steps
  const [totalPoints, setTotalPoints] = useState(() => {
    return parseInt(localStorage.getItem('puppy_points') || '0', 10);
  });
  const [totalSteps, setTotalSteps] = useState(() => {
    return parseInt(localStorage.getItem('puppy_steps') || '0', 10);
  });

  // Selected Dog & Wardrobe
  const [currentBreed, setCurrentBreed] = useState(() => {
    return localStorage.getItem('puppy_breed') || 'tuck';
  });
  const [wardrobe, setWardrobe] = useState(() => {
    try {
      const saved = localStorage.getItem('puppy_wardrobe');
      return saved ? JSON.parse(saved) : { hat: 'party', collar: 'bandana', glasses: 'none', boots: 'none' };
    } catch {
      return { hat: 'party', collar: 'bandana', glasses: 'none', boots: 'none' };
    }
  });

  // Background Theme (DEFAULT: HEARTS!)
  const [bgTheme, setBgTheme] = useState(() => {
    return localStorage.getItem('puppy_bg_theme') || 'hearts';
  });

  // Puzzle Level State
  const [currentLevel, setCurrentLevel] = useState(() => {
    return parseInt(localStorage.getItem('puppy_level') || '1', 10);
  });

  // Active View: 'puzzle' | 'fetch' | 'poop' | 'park'
  const [activeView, setActiveView] = useState('puzzle');

  // Modals
  const [showWardrobe, setShowWardrobe] = useState(false);
  const [showBgModal, setShowBgModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showMiniGameHub, setShowMiniGameHub] = useState(false);
  const [isMuted, setIsMuted] = useState(() => AudioFX.muted);

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem('puppy_points', totalPoints.toString());
  }, [totalPoints]);

  useEffect(() => {
    localStorage.setItem('puppy_steps', totalSteps.toString());
  }, [totalSteps]);

  useEffect(() => {
    localStorage.setItem('puppy_breed', currentBreed);
  }, [currentBreed]);

  useEffect(() => {
    localStorage.setItem('puppy_wardrobe', JSON.stringify(wardrobe));
  }, [wardrobe]);

  useEffect(() => {
    localStorage.setItem('puppy_bg_theme', bgTheme);
  }, [bgTheme]);

  useEffect(() => {
    localStorage.setItem('puppy_level', currentLevel.toString());
  }, [currentLevel]);

  // Points & Steps mutators
  const handleAddPoints = (amount) => {
    setTotalPoints((prev) => prev + amount);
  };

  const handleAddSteps = (count) => {
    setTotalSteps((prev) => prev + count);
  };

  const handleToggleMute = () => {
    const muted = AudioFX.toggleMute();
    setIsMuted(muted);
  };

  // Global Quick Mute Keyboard Shortcut ('M' or 'm') & Event Sync
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) {
        return;
      }
      if (e.key === 'm' || e.key === 'M') {
        const nextMuted = AudioFX.toggleMute();
        setIsMuted(nextMuted);
      }
    };

    const handleMuteEvent = (e) => {
      if (e?.detail?.muted !== undefined) {
        setIsMuted(e.detail.muted);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('puppy_audio_mute_changed', handleMuteEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('puppy_audio_mute_changed', handleMuteEvent);
    };
  }, []);

  const handleSaveWardrobe = (newBreed, newWardrobe) => {
    setCurrentBreed(newBreed);
    setWardrobe(newWardrobe);
  };

  return (
    <div className="game-viewport">
      {/* Dynamic Animated Background (Hearts by default) */}
      <div className="background-layer">
        <BackgroundCanvas theme={bgTheme} />
      </div>

      {/* Top HUD Bar */}
      <HeaderHUD
        totalPoints={totalPoints}
        totalSteps={totalSteps}
        currentBreed={currentBreed}
        wardrobe={wardrobe}
        currentLevel={currentLevel}
        bgTheme={bgTheme}
        onOpenWardrobe={() => setShowWardrobe(true)}
        onOpenBgModal={() => setShowBgModal(true)}
        onOpenLevelModal={() => setShowLevelModal(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Game Stage */}
      <main className="main-stage">
        {activeView === 'puzzle' && (
          <PinGameCanvas
            levelId={currentLevel}
            selectedBreed={currentBreed}
            wardrobe={wardrobe}
            onAddPoints={handleAddPoints}
            onAddSteps={handleAddSteps}
            onSelectLevel={(id) => setCurrentLevel(id)}
          />
        )}

        {activeView === 'fetch' && (
          <FetchGame
            selectedBreed={currentBreed}
            wardrobe={wardrobe}
            onAddPoints={handleAddPoints}
            onAddSteps={handleAddSteps}
            onBack={() => setActiveView('puzzle')}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        )}

        {activeView === 'poop' && (
          <PoopPatrolGame
            selectedBreed={currentBreed}
            wardrobe={wardrobe}
            onAddPoints={handleAddPoints}
            onAddSteps={handleAddSteps}
            onBack={() => setActiveView('puzzle')}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        )}

        {activeView === 'park' && (
          <DogParkGame
            selectedBreed={currentBreed}
            wardrobe={wardrobe}
            onAddPoints={handleAddPoints}
            onAddSteps={handleAddSteps}
            onBack={() => setActiveView('puzzle')}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button
          className={`nav-tab ${activeView === 'puzzle' ? 'active' : ''}`}
          onClick={() => {
            AudioFX.playPinSlide();
            setActiveView('puzzle');
          }}
        >
          <span className="tab-icon">🧩</span>
          <span>Puzzle</span>
        </button>

        <button
          className={`nav-tab ${activeView !== 'puzzle' ? 'active' : ''}`}
          onClick={() => {
            AudioFX.playPinSlide();
            setShowMiniGameHub(true);
          }}
        >
          <span className="tab-icon">🎪</span>
          <span>Mini-Games</span>
        </button>

        <button
          className="nav-tab"
          onClick={() => {
            AudioFX.playPinSlide();
            setShowWardrobe(true);
          }}
        >
          <span className="tab-icon">👗</span>
          <span>Dress Up</span>
        </button>

        <button
          className="nav-tab"
          onClick={() => {
            AudioFX.playPinSlide();
            setShowBgModal(true);
          }}
        >
          <span className="tab-icon">💖</span>
          <span>Background</span>
        </button>
      </nav>

      {/* Modals */}
      {showWardrobe && (
        <WardrobeModal
          selectedBreed={currentBreed}
          wardrobe={wardrobe}
          onSave={handleSaveWardrobe}
          onClose={() => setShowWardrobe(false)}
        />
      )}

      {showBgModal && (
        <BackgroundModal
          currentTheme={bgTheme}
          onSelectTheme={(theme) => setBgTheme(theme)}
          onClose={() => setShowBgModal(false)}
        />
      )}

      {showLevelModal && (
        <LevelSelectModal
          currentLevel={currentLevel}
          onSelectLevel={(id) => setCurrentLevel(id)}
          onClose={() => setShowLevelModal(false)}
        />
      )}

      {showMiniGameHub && (
        <MiniGameHub
          onSelectGame={(gameId) => {
            setActiveView(gameId);
            setShowMiniGameHub(false);
          }}
          onClose={() => setShowMiniGameHub(false)}
        />
      )}
    </div>
  );
}
