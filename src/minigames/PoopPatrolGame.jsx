import React, { useEffect, useRef, useState } from 'react';
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
    gridCols: 20,
    gridRows: 16,
    activeKeys: {},
  });

  // Scooper game state
  const scooperState = useRef({
    poops: [],
    spawnTimer: null,
  });

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

      // Spawn initial poops in garden
      ms.poops = [];
      for (let i = 0; i < 10; i++) {
        ms.poops.push({
          id: i,
          x: Math.random() * (width - 80) + 40,
          y: Math.random() * (height - 80) + 40,
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

        // Control handling
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
          if (pDist < 28) {
            p.cleared = true;
            AudioFX.playScoop();
            onAddPoints(50);
            setScore((s) => s + 50);
            setPoopsCleared((c) => c + 1);
          } else {
            // Draw Poop Emoji
            ctx.font = '22px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💩', p.x, p.y);
          }
        });

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

      // Spawn initial poops
      for (let i = 0; i < 6; i++) {
        ss.poops.push({
          id: i,
          x: Math.random() * (width - 100) + 50,
          y: Math.random() * (height - 100) + 50,
          scale: 1,
        });
      }

      const handleCanvasClick = (e) => {
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
            setPoopsCleared((c) => c + 1);

            // Spawn replacement after short delay
            setTimeout(() => {
              ss.poops.push({
                id: Date.now() + Math.random(),
                x: Math.random() * (width - 100) + 50,
                y: Math.random() * (height - 100) + 50,
                scale: 1,
              });
            }, 1200);
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
  }, [mode]);

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
          onClick={() => {
            AudioFX.playPinSlide();
            onBack();
          }}
        >
          ⬅ Back
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="arcade-pill">
            <span>💩 Poops Cleared:</span>
            <span style={{ color: '#ff4d6d' }}>{poopsCleared}</span>
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
            onClick={() => setMode('mower')}
          >
            🚜 Ride Mower
          </button>
          <button
            className={`submode-switch-btn ${mode === 'scooper' ? 'active' : ''}`}
            onClick={() => setMode('scooper')}
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
            state="idle"
            flip={true}
            size={90}
          />
        </div>

        {/* Instruction Footer */}
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
            ? '🎮 Desktop: WASD / Arrow Keys to drive. Mobile: Use on-screen D-Pad below!'
            : '👆 Tap the poops with your scooper to clean up the garden!'}
        </div>

        {/* Mobile Virtual D-Pad for Ride-Along Mower */}
        {mode === 'mower' && (
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
