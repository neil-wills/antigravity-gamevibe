import React, { useEffect, useRef, useState } from 'react';
import DogRenderer from '../components/DogRenderer';
import { AudioFX } from '../game/AudioController';
import '../styles/minigames.css';

export default function DogParkGame({
  selectedBreed = 'tuck',
  wardrobe = {},
  onAddPoints,
  onAddSteps,
  onBack,
}) {
  const [score, setScore] = useState(0);
  const [biscuits, setBiscuits] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const canvasRef = useRef(null);

  const state = useRef({
    dogY: 340,
    dogVY: 0,
    isJumping: false,
    groundY: 360,
    obstacles: [],
    biscuits: [],
    speed: 4.2,
    distance: 0,
  });

  const handleJump = () => {
    const s = state.current;
    if (!s.isJumping && !gameOver) {
      s.isJumping = true;
      s.dogVY = -12;
      AudioFX.playBark(1.2);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const width = 600;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    const s = state.current;
    s.dogY = 340;
    s.dogVY = 0;
    s.isJumping = false;
    s.obstacles = [
      { x: 500, type: 'hurdle', w: 24, h: 36 },
      { x: 800, type: 'hurdle', w: 24, h: 36 },
    ];
    s.biscuits = [
      { x: 420, y: 280, collected: false },
      { x: 650, y: 250, collected: false },
      { x: 720, y: 280, collected: false },
    ];
    s.distance = 0;

    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        handleJump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    let tick = 0;
    const loop = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, s.groundY);
      skyGrad.addColorStop(0, '#bae6fd');
      skyGrad.addColorStop(1, '#f0f9ff');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, s.groundY);

      // Distant Trees
      ctx.fillStyle = '#86efac';
      for (let i = 0; i < 6; i++) {
        const treeX = ((i * 120 - (s.distance * 0.5)) % (width + 120)) - 60;
        ctx.beginPath();
        ctx.arc(treeX, 310, 45, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dog Park Turf Ground
      const groundGrad = ctx.createLinearGradient(0, s.groundY, 0, height);
      groundGrad.addColorStop(0, '#22c55e');
      groundGrad.addColorStop(1, '#15803d');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, s.groundY, width, height - s.groundY);

      // Path stripe
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(0, s.groundY + 4, width, 4);

      if (!gameOver) {
        s.distance += s.speed;

        // Dog jump physics
        if (s.isJumping) {
          s.dogY += s.dogVY;
          s.dogVY += 0.65; // gravity
          if (s.dogY >= 340) {
            s.dogY = 340;
            s.dogVY = 0;
            s.isJumping = false;
            AudioFX.playStep();
          }
        }

        // Increment walking steps
        if (tick % 18 === 0) {
          onAddSteps(1);
          onAddPoints(2);
          setScore((sc) => sc + 2);
        }

        // Spawn obstacles & treats
        if (tick % 110 === 0) {
          s.obstacles.push({
            x: width + 40,
            type: 'hurdle',
            w: 24,
            h: 36,
          });
          if (Math.random() < 0.7) {
            s.biscuits.push({
              x: width + 90,
              y: 250 + Math.random() * 40,
              collected: false,
            });
          }
        }
      }

      // Move & draw obstacles (Hurdles)
      for (let i = s.obstacles.length - 1; i >= 0; i--) {
        const obs = s.obstacles[i];
        if (!gameOver) obs.x -= s.speed;

        // Draw Agility Hurdle
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(obs.x, s.groundY - obs.h, obs.w, obs.h);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(obs.x, s.groundY - obs.h + 10, obs.w, 8);

        // Check collision with dog (dog is at x: 110, y: s.dogY)
        const dogBox = { x: 110, y: s.dogY - 40, w: 50, h: 50 };
        if (
          obs.x < dogBox.x + dogBox.w &&
          obs.x + obs.w > dogBox.x &&
          s.groundY - obs.h < dogBox.y + dogBox.h
        ) {
          // Hit hurdle!
          setGameOver(true);
          AudioFX.playPoop();
        }

        if (obs.x < -40) {
          s.obstacles.splice(i, 1);
        }
      }

      // Move & draw biscuits
      for (let i = s.biscuits.length - 1; i >= 0; i--) {
        const b = s.biscuits[i];
        if (!gameOver) b.x -= s.speed;

        if (!b.collected) {
          // Draw dog biscuit
          ctx.fillStyle = '#f59e0b';
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(b.x, b.y, 22, 10, 4);
          ctx.fill();
          ctx.stroke();

          // Check collect
          const dist = Math.hypot(b.x - 130, b.y - s.dogY);
          if (dist < 40) {
            b.collected = true;
            AudioFX.playTreatBonus();
            onAddPoints(25);
            setScore((sc) => sc + 25);
            setBiscuits((bc) => bc + 1);
          }
        }

        if (b.x < -30) {
          s.biscuits.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameOver]);

  const handleRestart = () => {
    setGameOver(false);
    setScore(0);
    setBiscuits(0);
    state.current.obstacles = [];
    state.current.biscuits = [];
    state.current.dogY = 340;
    state.current.dogVY = 0;
    state.current.isJumping = false;
  };

  return (
    <div className="minigame-container">
      {/* Top HUD */}
      <div className="arcade-top-hud">
        <button
          className="btn-action btn-secondary"
          onClick={() => {
            AudioFX.playPinSlide();
            onBack();
          }}
        >
          ⬅ Back
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="arcade-pill">
            <span>🦴 Biscuits:</span>
            <span style={{ color: '#ffbe0b' }}>{biscuits}</span>
          </div>
          <div className="arcade-pill">
            <span>⭐ Score:</span>
            <span style={{ color: '#d97706' }}>{score} pts</span>
          </div>
        </div>

        <button className="btn-action btn-gold" onClick={handleJump}>
          ⬆ JUMP!
        </button>
      </div>

      {/* Arcade Viewport */}
      <div
        className="arcade-viewport"
        onClick={handleJump}
        style={{ cursor: 'pointer' }}
      >
        <canvas ref={canvasRef} className="arcade-canvas" />

        {/* Animated Dog Jumping/Running */}
        <div
          style={{
            position: 'absolute',
            left: 70,
            top: state.current.dogY - 70,
            pointerEvents: 'none',
            zIndex: 15,
          }}
        >
          <DogRenderer
            breedId={selectedBreed}
            wardrobe={wardrobe}
            state={state.current.isJumping ? 'eating' : 'walking'}
            size={110}
          />
        </div>

        {/* Game Over Screen */}
        {gameOver && (
          <div className="victory-overlay">
            <div className="victory-title">Park Run Finished! 🌳🐾</div>
            <div className="victory-subtitle">
              {selectedBreed.toUpperCase()} had a wonderful run at the park!
            </div>
            <div className="victory-stats-card">
              <div className="victory-stat-row">
                <span>Biscuits Grabbed:</span>
                <span style={{ color: '#ffbe0b' }}>{biscuits} (+{biscuits * 25} pts)</span>
              </div>
              <div className="victory-stat-row">
                <span>Total Run Score:</span>
                <span style={{ color: '#ff4d6d' }}>{score} pts</span>
              </div>
            </div>
            <div className="victory-actions">
              <button className="btn-action btn-primary" onClick={handleRestart}>
                Run Again! 🔄
              </button>
              <button className="btn-action btn-secondary" onClick={onBack}>
                Main Menu 🏠
              </button>
            </div>
          </div>
        )}

        {/* Touch / Click Hint */}
        {!gameOver && (
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255,255,255,0.9)',
              padding: '6px 18px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontFamily: 'Fredoka, sans-serif',
              fontWeight: 600,
              color: '#444',
              pointerEvents: 'none',
            }}
          >
            👆 Tap screen or press SPACE to jump over hurdles!
          </div>
        )}
      </div>
    </div>
  );
}
