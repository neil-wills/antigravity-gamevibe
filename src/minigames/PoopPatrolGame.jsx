import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import DogRenderer from '../components/DogRenderer';
import { AudioFX } from '../game/AudioController';
import '../styles/minigames.css';

export default function PoopPatrolGame({
  selectedBreed = 'tuck',
  wardrobe = {},
  onAddPoints,
  onAddSteps,
  onBack,
}) {
  const [mode, setMode] = useState('mower'); // 'scooper' | 'mower'
  const [score, setScore] = useState(0);
  const [poopsCleared, setPoopsCleared] = useState(0);
  const [grassMowedPct, setGrassMowedPct] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameResetCount, setGameResetCount] = useState(0);

  const TOTAL_GOAL_POOPS = 10;
  const canvasRef = useRef(null);

  // Mower game state
  const mowerState = useRef({
    x: 250,
    y: 220,
    angle: 0,
    speed: 0,
    turn: 0,
    poops: [],
    grassGrid: [],
    explosions: [],
    splats: [],
    gridCols: 20,
    gridRows: 16,
    activeKeys: {},
  });

  // Scooper game state
  const scooperState = useRef({
    poops: [],
    explosions: [],
    splats: [],
  });

  // Restart / Reset game
  const handleRestartGame = () => {
    AudioFX.playPinSlide();
    setScore(0);
    setPoopsCleared(0);
    setGrassMowedPct(0);
    setGameWon(false);
    setGameResetCount((c) => c + 1);
  };

  // Exit / Cancel Handler
  const handleCancelExit = () => {
    AudioFX.stopMower();
    AudioFX.playPinSlide();
    onBack();
  };

  // Initialize or Switch Modes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const width = 600;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    if (mode === 'mower') {
      AudioFX.startMower();

      // Init grass grid
      const ms = mowerState.current;
      ms.x = 300;
      ms.y = 240;
      ms.angle = 0;
      ms.speed = 0;
      ms.explosions = [];
      ms.splats = [];
      ms.grassGrid = [];
      for (let r = 0; r < ms.gridRows; r++) {
        for (let c = 0; c < ms.gridCols; c++) {
          ms.grassGrid.push({
            c,
            r,
            x: c * (width / ms.gridCols),
            y: r * (height / ms.gridRows),
            w: width / ms.gridCols,
            h: height / ms.gridRows,
            mowed: false,
          });
        }
      }

      // Spawn initial 10 poops in garden
      ms.poops = [];
      for (let i = 0; i < TOTAL_GOAL_POOPS; i++) {
        ms.poops.push({
          id: i,
          x: Math.random() * (width - 100) + 50,
          y: Math.random() * (height - 100) + 50,
          cleared: false,
        });
      }

      const handleKeyDown = (e) => {
        ms.activeKeys[e.key.toLowerCase()] = true;
      };
      const handleKeyUp = (e) => {
        ms.activeKeys[e.key.toLowerCase()] = false;
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      // Loop for Mower Mode
      const mowerLoop = () => {
        ctx.clearRect(0, 0, width, height);

        // Control handling if game not won
        if (!gameWon) {
          const keys = ms.activeKeys;
          const maxSpeed = 3.6;
          if (keys['arrowup'] || keys['w']) ms.speed = Math.min(ms.speed + 0.2, maxSpeed);
          else if (keys['arrowdown'] || keys['s']) ms.speed = Math.max(ms.speed - 0.2, -maxSpeed * 0.6);
          else ms.speed *= 0.92;

          if (keys['arrowleft'] || keys['a']) ms.angle -= 0.055;
          if (keys['arrowright'] || keys['d']) ms.angle += 0.055;

          ms.x += Math.cos(ms.angle) * ms.speed;
          ms.y += Math.sin(ms.angle) * ms.speed;

          // Boundaries
          ms.x = Math.max(25, Math.min(width - 25, ms.x));
          ms.y = Math.max(25, Math.min(height - 25, ms.y));
        }

        // Draw Grass Grid (Tall lush grass vs Neat cut stripes)
        let mowedCount = 0;
        ms.grassGrid.forEach((cell) => {
          // Check collision with mower blade
          const dist = Math.hypot(cell.x + cell.w / 2 - ms.x, cell.y + cell.h / 2 - ms.y);
          if (dist < 26) {
            if (!cell.mowed) {
              cell.mowed = true;
              onAddPoints(2);
              setScore((s) => s + 2);
            }
          }

          if (cell.mowed) {
            mowedCount++;
            // Striped manicured turf
            ctx.fillStyle = (cell.c + cell.r) % 2 === 0 ? '#4ade80' : '#22c55e';
            ctx.fillRect(cell.x, cell.y, cell.w, cell.h);
          } else {
            // Wild tall grass
            ctx.fillStyle = '#15803d';
            ctx.fillRect(cell.x, cell.y, cell.w, cell.h);
            // Grass blade texture
            ctx.fillStyle = '#166534';
            ctx.fillRect(cell.x + 4, cell.y + 4, 3, 8);
            ctx.fillRect(cell.x + 16, cell.y + 10, 3, 8);
          }
        });

        setGrassMowedPct(Math.round((mowedCount / ms.grassGrid.length) * 100));

        // Draw & Check Poops in Garden
        ms.poops.forEach((p) => {
          if (p.cleared) return;
          // Mower vacuum collision
          const pDist = Math.hypot(p.x - ms.x, p.y - ms.y);
          if (pDist < 28 && !gameWon) {
            p.cleared = true;

            // 💥 HILARIOUS POOP EXPLOSION EFFECT!
            AudioFX.playPoopExplosion();
            for (let k = 0; k < 18; k++) {
              const ang = (Math.PI * 2 * k) / 18 + Math.random() * 0.4;
              const spd = Math.random() * 5 + 2.5;
              ms.explosions.push({
                x: p.x,
                y: p.y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                size: Math.random() * 7 + 4,
                color: ['#7f4f24', '#58311e', '#a66a38', '#f59e0b', '#84cc16', '#22c55e'][
                  Math.floor(Math.random() * 6)
                ],
                life: 1.0,
                decay: Math.random() * 0.04 + 0.025,
              });
            }

            // Comic text badge
            ms.splats.push({
              x: p.x,
              y: p.y - 12,
              text: '💥 SPLAT!',
              life: 1.0,
            });

            onAddPoints(50);
            setScore((s) => s + 50);
            setPoopsCleared((prevCleared) => {
              const next = prevCleared + 1;
              if (next >= TOTAL_GOAL_POOPS) {
                // GOAL ACCOMPLISHED! End bonus game
                setGameWon(true);
                AudioFX.stopMower();
                AudioFX.playWinFanfare();
                confetti({
                  particleCount: 80,
                  spread: 75,
                  origin: { y: 0.6 },
                });
              }
              return next;
            });
          } else {
            // Draw Poop Emoji
            ctx.font = '22px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💩', p.x, p.y);
          }
        });

        // Update & Render Explosion Particles
        for (let i = ms.explosions.length - 1; i >= 0; i--) {
          const ep = ms.explosions[i];
          ep.x += ep.vx;
          ep.y += ep.vy;
          ep.life -= ep.decay;
          if (ep.life <= 0) {
            ms.explosions.splice(i, 1);
          } else {
            ctx.save();
            ctx.globalAlpha = ep.life;
            ctx.fillStyle = ep.color;
            ctx.beginPath();
            ctx.arc(ep.x, ep.y, ep.size * ep.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }

        // Render Splat Comic Badges
        for (let i = ms.splats.length - 1; i >= 0; i--) {
          const sp = ms.splats[i];
          sp.y -= 0.7;
          sp.life -= 0.03;
          if (sp.life <= 0) {
            ms.splats.splice(i, 1);
          } else {
            ctx.save();
            ctx.globalAlpha = sp.life;
            ctx.font = 'bold 16px Fredoka, sans-serif';
            ctx.fillStyle = '#ffbe0b';
            ctx.strokeStyle = '#7f4f24';
            ctx.lineWidth = 3;
            ctx.textAlign = 'center';
            ctx.strokeText(sp.text, sp.x, sp.y);
            ctx.fillText(sp.text, sp.x, sp.y);
            ctx.restore();
          }
        }

        // Draw Ride-Along Lawn Mower
        ctx.save();
        ctx.translate(ms.x, ms.y);
        ctx.rotate(ms.angle);

        // Mower Wheels
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-22, -18, 12, 6);
        ctx.fillRect(-22, 12, 12, 6);
        ctx.fillRect(12, -18, 10, 5);
        ctx.fillRect(12, 13, 10, 5);

        // Mower Body (Bright red tractor / lawn mower)
        ctx.fillStyle = '#dc2626';
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-20, -14, 38, 28, 5);
        ctx.fill();
        ctx.stroke();

        // Mower Engine Hood & Headlights
        ctx.fillStyle = '#f87171';
        ctx.fillRect(4, -10, 12, 20);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(16, -9, 3, 5);
        ctx.fillRect(16, 4, 3, 5);

        // Steering Wheel & Seat
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-12, -9, 14, 18);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(2, 0, 5, 0, Math.PI * 2);
        ctx.stroke();

        // Grass Bagger / Hopper on Back
        ctx.fillStyle = '#eab308';
        ctx.fillRect(-28, -12, 9, 24);

        ctx.restore();

        animId = requestAnimationFrame(mowerLoop);
      };

      mowerLoop();

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        AudioFX.stopMower();
      };
    } else {
      // MODE: POOP SCOOPER (Tap & Scoop)
      AudioFX.stopMower();
      const ss = scooperState.current;
      ss.poops = [];
      ss.explosions = [];
      ss.splats = [];

      // Spawn initial poops
      for (let i = 0; i < TOTAL_GOAL_POOPS; i++) {
        ss.poops.push({
          id: i,
          x: Math.random() * (width - 100) + 50,
          y: Math.random() * (height - 100) + 50,
          scale: 1,
        });
      }

      const handleCanvasClick = (e) => {
        if (gameWon) return;
        const rect = canvas.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) * (width / rect.width);
        const clickY = (e.clientY - rect.top) * (height / rect.height);

        for (let i = ss.poops.length - 1; i >= 0; i--) {
          const p = ss.poops[i];
          const dist = Math.hypot(p.x - clickX, p.y - clickY);
          if (dist < 35) {
            // SCOOPED!
            ss.poops.splice(i, 1);
            AudioFX.playScoop();
            onAddPoints(30);
            setScore((s) => s + 30);
            setPoopsCleared((prevCleared) => {
              const next = prevCleared + 1;
              if (next >= TOTAL_GOAL_POOPS) {
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
            break;
          }
        }
      };

      canvas.addEventListener('pointerdown', handleCanvasClick);

      const scooperLoop = () => {
        ctx.clearRect(0, 0, width, height);

        // Garden Soil & Flower Bed Background
        ctx.fillStyle = '#78350f';
        ctx.fillRect(0, 0, width, height);

        // Grass patches
        ctx.fillStyle = '#22c55e';
        for (let r = 0; r < 6; r++) {
          for (let c = 0; c < 8; c++) {
            ctx.beginPath();
            ctx.roundRect(c * 80 + 10, r * 80 + 10, 60, 60, 16);
            ctx.fill();
          }
        }

        // Draw Poops with flies
        ss.poops.forEach((p) => {
          ctx.font = '34px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💩', p.x, p.y);

          // Fly buzzing around
          const flyAngle = Date.now() * 0.006;
          const flyX = p.x + Math.cos(flyAngle) * 18;
          const flyY = p.y + Math.sin(flyAngle) * 18;
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(flyX, flyY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });

        animId = requestAnimationFrame(scooperLoop);
      };

      scooperLoop();

      return () => {
        cancelAnimationFrame(animId);
        canvas.removeEventListener('pointerdown', handleCanvasClick);
      };
    }
  }, [mode, gameWon, gameResetCount]);

  // Virtual Controls for Mobile Mower Steering
  const handleVirtualDir = (key, pressed) => {
    mowerState.current.activeKeys[key] = pressed;
  };

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
            <span>💩 Goal:</span>
            <span style={{ color: '#ff4d6d' }}>
              {poopsCleared} / {TOTAL_GOAL_POOPS}
            </span>
          </div>
          {mode === 'mower' && (
            <div className="arcade-pill">
              <span>🌱 Mowed:</span>
              <span style={{ color: '#16a34a' }}>{grassMowedPct}%</span>
            </div>
          )}
          <div className="arcade-pill">
            <span>⭐ Score:</span>
            <span style={{ color: '#d97706' }}>{score} pts</span>
          </div>
        </div>

        {/* Mode Switcher: Scooper vs Ride Mower */}
        <div className="submode-switch">
          <button
            className={`submode-switch-btn ${mode === 'mower' ? 'active' : ''}`}
            onClick={() => {
              setMode('mower');
              setGameWon(false);
              setPoopsCleared(0);
            }}
          >
            🚜 Ride Mower
          </button>
          <button
            className={`submode-switch-btn ${mode === 'scooper' ? 'active' : ''}`}
            onClick={() => {
              setMode('scooper');
              setGameWon(false);
              setPoopsCleared(0);
            }}
          >
            🧹 Hand Scooper
          </button>
        </div>
      </div>

      {/* Arcade Viewport */}
      <div className="arcade-viewport">
        <canvas ref={canvasRef} className="arcade-canvas" />

        {/* Dog spectator in garden corner */}
        <div
          style={{
            position: 'absolute',
            right: 12,
            bottom: 12,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <DogRenderer
            breedId={selectedBreed}
            wardrobe={wardrobe}
            state={gameWon ? 'eating' : 'idle'}
            flip={true}
            size={90}
          />
        </div>

        {/* Instruction Footer */}
        {!gameWon && (
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              left: 12,
              background: 'rgba(255,255,255,0.92)',
              padding: '4px 14px',
              borderRadius: '16px',
              fontSize: '0.8rem',
              fontFamily: 'Fredoka, sans-serif',
              color: '#444',
              pointerEvents: 'none',
            }}
          >
            {mode === 'mower'
              ? '💥 Drive over poops with the lawn mower to EXPLODE them! Clear all 10 to win!'
              : '👆 Tap the poops with your scooper to clean up all 10!'}
          </div>
        )}

        {/* Goal Accomplished / Victory Overlay */}
        {gameWon && (
          <div className="victory-overlay">
            <div className="victory-title">Garden Spotless! 🚜🌻</div>
            <div className="victory-subtitle">
              All {TOTAL_GOAL_POOPS} poops exploded and cleared! The backyard is sparkling clean!
            </div>
            <div style={{ fontSize: '3rem', margin: '10px 0' }}>🏆✨</div>
            <div className="victory-stats-card">
              <div className="victory-stat-row">
                <span>Poops Cleared:</span>
                <span style={{ color: '#16a34a' }}>{TOTAL_GOAL_POOPS} / {TOTAL_GOAL_POOPS} (100%)</span>
              </div>
              <div className="victory-stat-row">
                <span>Total Clean Score:</span>
                <span style={{ color: '#ff4d6d' }}>+{score} pts ⭐</span>
              </div>
            </div>
            <div className="victory-actions">
              <button className="btn-action btn-primary" onClick={handleRestartGame}>
                Play Again 🔄
              </button>
              <button className="btn-action btn-secondary" onClick={handleCancelExit}>
                Return to Puzzles 🏠
              </button>
            </div>
          </div>
        )}

        {/* Mobile Virtual D-Pad for Ride-Along Mower */}
        {mode === 'mower' && !gameWon && (
          <div className="virtual-controls">
            <div className="dpad-container">
              <button
                className="dpad-btn dpad-up"
                onPointerDown={() => handleVirtualDir('arrowup', true)}
                onPointerUp={() => handleVirtualDir('arrowup', false)}
              >
                ▲
              </button>
              <button
                className="dpad-btn dpad-left"
                onPointerDown={() => handleVirtualDir('arrowleft', true)}
                onPointerUp={() => handleVirtualDir('arrowleft', false)}
              >
                ◀
              </button>
              <button
                className="dpad-btn dpad-right"
                onPointerDown={() => handleVirtualDir('arrowright', true)}
                onPointerUp={() => handleVirtualDir('arrowright', false)}
              >
                ▶
              </button>
              <button
                className="dpad-btn dpad-down"
                onPointerDown={() => handleVirtualDir('arrowdown', true)}
                onPointerUp={() => handleVirtualDir('arrowdown', false)}
              >
                ▼
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
