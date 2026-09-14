import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import DogRenderer from '../components/DogRenderer';
import { AudioFX } from '../game/AudioController';
import '../styles/minigames.css';

export default function FetchGame({
  selectedBreed = 'tuck',
  wardrobe = {},
  onAddPoints,
  onAddSteps,
  onBack,
}) {
  const [score, setScore] = useState(0);
  const [catches, setCatches] = useState(0);
  const [itemType, setItemType] = useState('ball'); // 'ball' | 'frisbee'
  const [gameWon, setGameWon] = useState(false);
  const [resetCount, setResetCount] = useState(0);

  const GOAL_CATCHES = 5;
  const canvasRef = useRef(null);

  const gameState = useRef({
    ball: { x: 80, y: 380, vx: 0, vy: 0, active: false, inAir: false },
    dog: { x: 70, y: 380, vx: 0, state: 'idle', facing: 1, holdingItem: false },
    slingshot: { dragging: false, startX: 80, startY: 380, curX: 80, curY: 380 },
    groundY: 420,
    width: 600,
    height: 480,
  });

  const [dogDisplay, setDogDisplay] = useState({
    x: 70,
    state: 'idle',
    flip: false,
    hasBall: false,
  });
  const [barkBubble, setBarkBubble] = useState(null);

  const handleDogBark = (e) => {
    if (e) e.stopPropagation();
    AudioFX.playBreedBark(selectedBreed);
    const phrases = ['Fetch! 🎾', 'Woof! 🐾', 'Arf arf! 🦴', 'Throw it! ✨', 'Awoo! ❤️'];
    setBarkBubble(phrases[Math.floor(Math.random() * phrases.length)]);
    setTimeout(() => setBarkBubble(null), 1200);
  };

  const handleRestart = () => {
    AudioFX.playPinSlide();
    setScore(0);
    setCatches(0);
    setGameWon(false);
    setBarkBubble(null);
    gameState.current.ball = { x: 80, y: 380, vx: 0, vy: 0, active: false, inAir: false };
    gameState.current.dog = { x: 70, y: 380, vx: 0, state: 'idle', facing: 1, holdingItem: false };
    setResetCount((c) => c + 1);
  };

  const handleCancelExit = () => {
    AudioFX.playPinSlide();
    onBack();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const width = (gameState.current.width = 600);
    const height = (gameState.current.height = 480);
    canvas.width = width;
    canvas.height = height;

    const gs = gameState.current;

    const handlePointerDown = (e) => {
      if (gameWon) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) * (width / rect.width);
      const clickY = (e.clientY - rect.top) * (height / rect.height);

      // Only allow throw if dog is idle and ball is ready
      if (!gs.ball.active && !gs.dog.holdingItem) {
        gs.slingshot.dragging = true;
        gs.slingshot.startX = clickX;
        gs.slingshot.startY = clickY;
        gs.slingshot.curX = clickX;
        gs.slingshot.curY = clickY;
      }
    };

    const handlePointerMove = (e) => {
      if (!gs.slingshot.dragging || gameWon) return;
      const rect = canvas.getBoundingClientRect();
      gs.slingshot.curX = (e.clientX - rect.left) * (width / rect.width);
      gs.slingshot.curY = (e.clientY - rect.top) * (height / rect.height);
    };

    const handlePointerUp = () => {
      if (!gs.slingshot.dragging || gameWon) return;
      gs.slingshot.dragging = false;

      // Calculate throw vector
      const dx = gs.slingshot.startX - gs.slingshot.curX;
      const dy = gs.slingshot.startY - gs.slingshot.curY;
      const power = Math.min(Math.hypot(dx, dy), 140) * 0.16;
      const angle = Math.atan2(dy, dx);

      if (power > 2) {
        gs.ball.active = true;
        gs.ball.inAir = true;
        gs.ball.x = 90;
        gs.ball.y = 380;
        gs.ball.vx = Math.cos(angle) * power * 1.6;
        gs.ball.vy = Math.sin(angle) * power * 1.6;

        AudioFX.playThrow();

        // Dog starts running after ball!
        gs.dog.state = 'walking';
        gs.dog.facing = 1;
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // Loop
    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      // Sky & Clouds
      const skyGrad = ctx.createLinearGradient(0, 0, 0, gs.groundY);
      skyGrad.addColorStop(0, '#7dd3fc');
      skyGrad.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, gs.groundY);

      // Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(140, 90, 30, 0, Math.PI * 2);
      ctx.arc(175, 80, 40, 0, Math.PI * 2);
      ctx.arc(210, 90, 30, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(430, 110, 25, 0, Math.PI * 2);
      ctx.arc(460, 100, 35, 0, Math.PI * 2);
      ctx.arc(490, 110, 25, 0, Math.PI * 2);
      ctx.fill();

      // Grass Field
      const grassGrad = ctx.createLinearGradient(0, gs.groundY, 0, height);
      grassGrad.addColorStop(0, '#4ade80');
      grassGrad.addColorStop(1, '#16a34a');
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, gs.groundY, width, height - gs.groundY);

      // Slingshot guide line while aiming
      if (gs.slingshot.dragging && !gameWon) {
        ctx.strokeStyle = '#ff3366';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(90, 380);
        const aimDx = gs.slingshot.startX - gs.slingshot.curX;
        const aimDy = gs.slingshot.startY - gs.slingshot.curY;
        ctx.lineTo(90 + aimDx * 2, 380 + aimDy * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Physics: Ball / Frisbee flight
      if (gs.ball.active) {
        gs.ball.x += gs.ball.vx;
        gs.ball.y += gs.ball.vy;
        gs.ball.vy += itemType === 'ball' ? 0.35 : 0.18; // frisbee floats longer!
        gs.ball.vx *= 0.995;

        // Bounce on ground
        if (gs.ball.y >= gs.groundY - 8) {
          gs.ball.y = gs.groundY - 8;
          gs.ball.vy = -gs.ball.vy * 0.55;
          gs.ball.vx *= 0.8;
          if (Math.abs(gs.ball.vy) < 1) {
            gs.ball.inAir = false;
          }
        }
        if (gs.ball.x > width - 20) {
          gs.ball.x = width - 20;
          gs.ball.vx = -gs.ball.vx * 0.6;
        }

        // Draw Ball / Frisbee
        ctx.save();
        ctx.translate(gs.ball.x, gs.ball.y);
        if (itemType === 'ball') {
          ctx.fillStyle = '#ccff00';
          ctx.beginPath();
          ctx.arc(0, 0, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          ctx.fillStyle = '#ff006e';
          ctx.beginPath();
          ctx.ellipse(0, 0, 16, 6, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.restore();

        // Dog logic: chase ball!
        const dogSpeed = 4.8;
        if (!gs.dog.holdingItem) {
          if (gs.dog.x < gs.ball.x - 10) {
            gs.dog.x += dogSpeed;
            gs.dog.facing = 1;
            onAddSteps(1);
          }

          // Catch check!
          const dist = Math.hypot(gs.dog.x - gs.ball.x, gs.dog.y - 20 - gs.ball.y);
          if (dist < 32 || (gs.ball.y >= gs.groundY - 10 && Math.abs(gs.dog.x - gs.ball.x) < 25)) {
            // CAUGHT!
            gs.dog.holdingItem = true;
            gs.ball.active = false;
            AudioFX.playCatch();
            onAddPoints(50);
            setScore((s) => s + 50);
            setCatches((prevCatches) => {
              const next = prevCatches + 1;
              if (next >= GOAL_CATCHES) {
                // GOAL ACCOMPLISHED!
                setGameWon(true);
                AudioFX.playWinFanfare();
                confetti({
                  particleCount: 80,
                  spread: 75,
                  origin: { y: 0.6 },
                });
              }
              return next;
            });
          }
        }
      }

      // Dog returning with item
      if (gs.dog.holdingItem) {
        const returnTargetX = 80;
        if (gs.dog.x > returnTargetX) {
          gs.dog.x -= 3.6;
          gs.dog.facing = -1;
          onAddSteps(1);
        } else {
          // Returned successfully!
          gs.dog.holdingItem = false;
          gs.dog.state = 'idle';
          gs.dog.facing = 1;
        }
      }

      // Update React state for DogRenderer
      setDogDisplay({
        x: gs.dog.x,
        state: gameWon ? 'eating' : gs.dog.state,
        flip: gs.dog.facing === -1,
        hasBall: gs.dog.holdingItem,
      });

      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [itemType, gameWon, resetCount]);

  return (
    <div className="minigame-container">
      {/* Top HUD */}
      <div className="arcade-top-hud">
        <button
          className="btn-action btn-secondary"
          onClick={handleCancelExit}
          title="Exit and return to puzzle levels"
        >
          ✕ Cancel / Exit
        </button>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div className="arcade-pill">
            <span>🎾 Goal:</span>
            <span style={{ color: '#ff4d6d' }}>
              {catches} / {GOAL_CATCHES} catches
            </span>
          </div>
          <div className="arcade-pill">
            <span>⭐ Score:</span>
            <span style={{ color: '#d97706' }}>{score} pts</span>
          </div>
        </div>

        {/* Item Selector */}
        <div className="submode-switch">
          <button
            className={`submode-switch-btn ${itemType === 'ball' ? 'active' : ''}`}
            onClick={() => setItemType('ball')}
          >
            🎾 Ball
          </button>
          <button
            className={`submode-switch-btn ${itemType === 'frisbee' ? 'active' : ''}`}
            onClick={() => setItemType('frisbee')}
          >
            🥏 Frisbee
          </button>
        </div>
      </div>

      {/* Arcade Viewport */}
      <div className="arcade-viewport">
        <canvas ref={canvasRef} className="arcade-canvas" />

        {/* Animated Dog rendered at ground level - Click to Bark! */}
        <div
          className="dog-interactive"
          onClick={handleDogBark}
          style={{
            position: 'absolute',
            left: dogDisplay.x - 70,
            top: 310,
            zIndex: 15,
          }}
          title="Click to pet & hear your pup bark! 🐶"
        >
          {barkBubble && (
            <div className="dog-bark-bubble">
              <span>{barkBubble}</span>
              <div className="bark-bubble-tail" />
            </div>
          )}

          <DogRenderer
            breedId={selectedBreed}
            wardrobe={wardrobe}
            state={barkBubble ? 'barking' : dogDisplay.state}
            flip={dogDisplay.flip}
            size={120}
          />
        </div>

        {/* Throw Guide Banner */}
        {!gameWon && (
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255,255,255,0.92)',
              padding: '6px 18px',
              borderRadius: '20px',
              fontSize: '0.88rem',
              fontFamily: 'Fredoka, sans-serif',
              fontWeight: 600,
              color: '#444',
              pointerEvents: 'none',
            }}
          >
            🎯 Drag on screen and release to throw {itemType === 'ball' ? 'the ball' : 'the frisbee'}! Complete {GOAL_CATCHES} catches to win!
          </div>
        )}

        {/* Victory Overlay when Goal is Accomplished */}
        {gameWon && (
          <div className="victory-overlay">
            <div className="victory-title">Fetch Champion! 🎾🐶</div>
            <div className="victory-subtitle">
              {selectedBreed.toUpperCase()} caught all {GOAL_CATCHES} throws with spectacular leaps!
            </div>
            <div style={{ fontSize: '3rem', margin: '10px 0' }}>🏆🎾</div>
            <div className="victory-stats-card">
              <div className="victory-stat-row">
                <span>Catches:</span>
                <span style={{ color: '#16a34a' }}>{GOAL_CATCHES} / {GOAL_CATCHES}</span>
              </div>
              <div className="victory-stat-row">
                <span>Total Points:</span>
                <span style={{ color: '#ff4d6d' }}>+{score} pts ⭐</span>
              </div>
            </div>
            <div className="victory-actions">
              <button className="btn-action btn-primary" onClick={handleRestart}>
                Play Again 🔄
              </button>
              <button className="btn-action btn-secondary" onClick={handleCancelExit}>
                Return to Puzzles 🏠
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
