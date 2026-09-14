import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import confetti from 'canvas-confetti';
import DogRenderer from './DogRenderer';
import { AudioFX } from '../game/AudioController';
import { PUZZLE_LEVELS } from '../game/LevelData';
import '../styles/puzzle.css';

export default function PinGameCanvas({
  levelId = 1,
  selectedBreed = 'tuck',
  wardrobe = {},
  onLevelComplete,
  onAddPoints,
  onAddSteps,
  onSelectLevel,
}) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const runnerRef = useRef(null);

  const [levelData, setLevelData] = useState(
    PUZZLE_LEVELS.find((l) => l.id === levelId) || PUZZLE_LEVELS[0]
  );
  const [resetCount, setResetCount] = useState(0);
  const [kibbleInBowl, setKibbleInBowl] = useState(0);
  const [treatsInBowl, setTreatsInBowl] = useState(0);
  const [levelState, setLevelState] = useState('playing'); // 'playing' | 'victory' | 'failed'
  const [dogState, setDogState] = useState('idle'); // 'idle' | 'walking' | 'eating' | 'pooping'
  const [dogPos, setDogPos] = useState({ x: 80, y: 460 });
  const [pawPrints, setPawPrints] = useState([]);
  const [poopEvent, setPoopEvent] = useState(null); // null or { x, y }
  const [floatingPoints, setFloatingPoints] = useState([]);

  // Active pin dragging state
  const dragPinRef = useRef(null);

  // Update level when levelId or resetCount changes
  useEffect(() => {
    const found = PUZZLE_LEVELS.find((l) => l.id === levelId) || PUZZLE_LEVELS[0];
    setLevelData(found);
    setKibbleInBowl(0);
    setTreatsInBowl(0);
    setLevelState('playing');
    setDogState('idle');
    setDogPos({ ...found.dog });
    setPawPrints([]);
    setPoopEvent(null);
  }, [levelId, resetCount]);

  // Trigger Random Poop Event during puzzle gameplay
  useEffect(() => {
    if (levelState !== 'playing') return;

    // Trigger random poop check every 12-18 seconds
    const poopTimer = setTimeout(() => {
      if (levelState === 'playing' && !poopEvent && Math.random() < 0.6) {
        // Dog poops!
        setDogState('pooping');
        AudioFX.playPoop();
        setPoopEvent({
          x: dogPos.x + 38,
          y: dogPos.y + 24,
        });

        // Resume idle after squatting
        setTimeout(() => {
          setDogState((current) => (current === 'pooping' ? 'idle' : current));
        }, 1200);
      }
    }, 10000 + Math.random() * 8000);

    return () => clearTimeout(poopTimer);
  }, [levelState, poopEvent, dogPos]);

  // Clean up poop handler
  const handleScoopPoop = () => {
    if (!poopEvent) return;
    AudioFX.playScoop();
    onAddPoints(50);
    spawnFloatingText('+50 Cleanliness! 💩✨', poopEvent.x, poopEvent.y - 20);
    setPoopEvent(null);
    AudioFX.playBark(1.2);
  };

  const spawnFloatingText = (text, x, y) => {
    const id = Date.now() + Math.random();
    setFloatingPoints((prev) => [...prev, { id, text, x, y }]);
    setTimeout(() => {
      setFloatingPoints((prev) => prev.filter((p) => p.id !== id));
    }, 1200);
  };

  // Main Matter.js Engine Setup & Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { Engine, World, Bodies, Body, Events } = Matter;

    const engine = Engine.create({
      gravity: { x: 0, y: 1.1, scale: 0.001 },
    });
    engineRef.current = engine;

    const world = engine.world;
    const width = 400;
    const height = 520;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    // 1. Create Boundaries / Walls
    const wallBodies = [];
    levelData.walls.forEach((w) => {
      const wall = Bodies.rectangle(w.x, w.y, w.w, w.h, {
        isStatic: true,
        angle: w.angle || 0,
        render: { fillStyle: '#e0a96d' },
      });
      wallBodies.push(wall);
    });

    // Outer stage bounds
    const floor = Bodies.rectangle(200, 525, 420, 20, { isStatic: true });
    const leftWall = Bodies.rectangle(-10, 260, 20, 520, { isStatic: true });
    const rightWall = Bodies.rectangle(410, 260, 20, 520, { isStatic: true });
    wallBodies.push(floor, leftWall, rightWall);
    World.add(world, wallBodies);

    // 2. Create Dog Food Bowl Sensor
    const bowl = Bodies.rectangle(
      levelData.bowl.x,
      levelData.bowl.y,
      levelData.bowl.w,
      levelData.bowl.h,
      {
        isStatic: true,
        isSensor: true,
        label: 'bowlSensor',
      }
    );
    World.add(world, bowl);

    // 3. Create Pins
    const pinObjects = levelData.pins.map((p) => {
      const isHoriz = p.orientation === 'horizontal';
      const bodyWidth = isHoriz ? p.length : 14;
      const bodyHeight = isHoriz ? 14 : p.length;

      const body = Bodies.rectangle(p.x, p.y, bodyWidth, bodyHeight, {
        isStatic: true,
        label: 'pin',
      });
      body.customPinData = {
        id: p.id,
        origX: p.x,
        origY: p.y,
        currentX: p.x,
        currentY: p.y,
        length: p.length,
        orientation: p.orientation,
        pullDir: p.pullDir,
        offset: 0,
        isRemoved: false,
      };
      World.add(world, body);
      return body;
    });

    // 4. Create Kibbles
    const kibbleBodies = levelData.kibbles.map((k) => {
      const kibble = Bodies.circle(k.x, k.y, 8, {
        restitution: 0.25,
        friction: 0.1,
        density: 0.002,
        label: 'kibble',
      });
      kibble.customColor = '#8d5b4c';
      World.add(world, kibble);
      return kibble;
    });

    // 5. Create Golden Bone Treats
    const treatBodies = levelData.treats.map((t) => {
      const treat = Bodies.rectangle(t.x, t.y, 24, 12, {
        restitution: 0.3,
        friction: 0.1,
        density: 0.002,
        label: 'treat',
      });
      World.add(world, treat);
      return treat;
    });

    // 6. Create Hazards (Mud / Spikes)
    const hazardBodies = (levelData.hazards || []).map((h) => {
      const hazard = Bodies.circle(h.x, h.y, 10, {
        restitution: 0.1,
        friction: 0.5,
        density: 0.004,
        label: h.type === 'mud' ? 'mud' : 'spikes',
      });
      hazard.customColor = h.type === 'mud' ? '#b91c1c' : '#475569';
      World.add(world, hazard);
      return hazard;
    });

    // Tracking items that fell into bowl
    let collectedKibbles = 0;
    let collectedTreats = 0;
    const handledBodies = new Set();

    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        const checkBody = (target, other) => {
          if (target.label === 'bowlSensor' && !handledBodies.has(other.id)) {
            if (other.label === 'kibble') {
              handledBodies.add(other.id);
              collectedKibbles++;
              setKibbleInBowl(collectedKibbles);
              AudioFX.playKibbleDrop();
              onAddPoints(10);
              spawnFloatingText('+10', other.position.x, other.position.y - 10);
              // Fade out / remove kibble from physics
              setTimeout(() => World.remove(world, other), 100);
            } else if (other.label === 'treat') {
              handledBodies.add(other.id);
              collectedTreats++;
              setTreatsInBowl(collectedTreats);
              AudioFX.playTreatBonus();
              onAddPoints(100);
              spawnFloatingText('⭐ +100 TREAT!', other.position.x, other.position.y - 15);
              setTimeout(() => World.remove(world, other), 100);
            } else if (other.label === 'mud') {
              // Mud hit the bowl! Level failed!
              setLevelState('failed');
              AudioFX.playPoop();
            }
          }
        };
        checkBody(bodyA, bodyB);
        checkBody(bodyB, bodyA);
      });
    });

    // Canvas Pointer Interaction for Pins
    let isDragging = false;
    let dragStartPos = { x: 0, y: 0 };
    let activePin = null;

    const getCanvasCoords = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const handlePointerDown = (e) => {
      const coords = getCanvasCoords(e);
      // Check if user clicked on a pin's handle or body
      for (const pinBody of pinObjects) {
        if (pinBody.customPinData.isRemoved) continue;
        const pData = pinBody.customPinData;
        const isHoriz = pData.orientation === 'horizontal';
        const bounds = pinBody.bounds;

        // Expanded clickable grab area
        if (
          coords.x >= bounds.min.x - 25 &&
          coords.x <= bounds.max.x + 25 &&
          coords.y >= bounds.min.y - 25 &&
          coords.y <= bounds.max.y + 25
        ) {
          isDragging = true;
          activePin = pinBody;
          dragPinRef.current = pinBody;
          dragStartPos = coords;
          AudioFX.playPinSlide();
          break;
        }
      }
    };

    const handlePointerMove = (e) => {
      if (!isDragging || !activePin) return;
      const coords = getCanvasCoords(e);
      const pData = activePin.customPinData;
      const isHoriz = pData.orientation === 'horizontal';

      if (isHoriz) {
        const deltaX = coords.x - dragStartPos.x;
        // Check direction constraint
        if ((pData.pullDir === 'right' && deltaX > 0) || (pData.pullDir === 'left' && deltaX < 0)) {
          pData.offset = deltaX;
          const newX = pData.origX + deltaX;
          Body.setPosition(activePin, { x: newX, y: pData.origY });

          // Threshold to pull out completely
          if (Math.abs(deltaX) > pData.length * 0.65) {
            removePin(activePin);
          }
        }
      } else {
        const deltaY = coords.y - dragStartPos.y;
        if ((pData.pullDir === 'down' && deltaY > 0) || (pData.pullDir === 'up' && deltaY < 0)) {
          pData.offset = deltaY;
          const newY = pData.origY + deltaY;
          Body.setPosition(activePin, { x: pData.origX, y: newY });

          if (Math.abs(deltaY) > pData.length * 0.65) {
            removePin(activePin);
          }
        }
      }
    };

    const removePin = (pinBody) => {
      pinBody.customPinData.isRemoved = true;
      AudioFX.playPinSlide();
      World.remove(world, pinBody);
      isDragging = false;
      activePin = null;
      dragPinRef.current = null;
    };

    const handlePointerUp = () => {
      if (!isDragging || !activePin) return;
      // Snap back if not pulled far enough
      const pData = activePin.customPinData;
      if (!pData.isRemoved) {
        pData.offset = 0;
        Body.setPosition(activePin, { x: pData.origX, y: pData.origY });
      }
      isDragging = false;
      activePin = null;
      dragPinRef.current = null;
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // Animation & Render Loop
    let animId;
    const render = () => {
      Matter.Engine.update(engine, 1000 / 60);
      ctx.clearRect(0, 0, width, height);

      // Draw Walls & Chambers
      ctx.fillStyle = '#8b5a2b';
      ctx.strokeStyle = '#5c3a1e';
      ctx.lineWidth = 3;

      wallBodies.forEach((w) => {
        if (w.label === 'bowlSensor') return;
        ctx.save();
        ctx.translate(w.position.x, w.position.y);
        ctx.rotate(w.angle);
        const wWidth = w.bounds.max.x - w.bounds.min.x;
        const wHeight = w.bounds.max.y - w.bounds.min.y;
        ctx.beginPath();
        ctx.roundRect(-wWidth / 2, -wHeight / 2, wWidth, wHeight, 6);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });

      // Draw Food Bowl
      ctx.save();
      const bX = levelData.bowl.x;
      const bY = levelData.bowl.y;
      const bW = levelData.bowl.w;
      const bH = levelData.bowl.h;

      // Bowl rim gradient
      const bowlGrad = ctx.createLinearGradient(bX - bW / 2, bY, bX + bW / 2, bY);
      bowlGrad.addColorStop(0, '#ff4d6d');
      bowlGrad.addColorStop(0.5, '#ff758f');
      bowlGrad.addColorStop(1, '#ff4d6d');

      ctx.fillStyle = bowlGrad;
      ctx.beginPath();
      ctx.roundRect(bX - bW / 2, bY - bH / 2, bW, bH, [4, 4, 18, 18]);
      ctx.fill();
      ctx.strokeStyle = '#c9184a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dog Paw icon on food bowl
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bX, bY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bX - 6, bY - 6, 2.5, 0, Math.PI * 2);
      ctx.arc(bX, bY - 8, 2.5, 0, Math.PI * 2);
      ctx.arc(bX + 6, bY - 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw Pins
      pinObjects.forEach((pinBody) => {
        const pData = pinBody.customPinData;
        if (pData.isRemoved) return;

        ctx.save();
        ctx.translate(pinBody.position.x, pinBody.position.y);

        const isHoriz = pData.orientation === 'horizontal';
        const pW = isHoriz ? pData.length : 14;
        const pH = isHoriz ? 14 : pData.length;

        // Pin Shaft (Metallic Golden rod)
        const pinGrad = ctx.createLinearGradient(-pW / 2, -pH / 2, pW / 2, pH / 2);
        pinGrad.addColorStop(0, '#ffe066');
        pinGrad.addColorStop(0.5, '#ffd166');
        pinGrad.addColorStop(1, '#f77f00');

        ctx.fillStyle = pinGrad;
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-pW / 2, -pH / 2, pW, pH, 6);
        ctx.fill();
        ctx.stroke();

        // Pin Pull Handle (Ring on outer edge)
        const handleX = isHoriz ? (pData.pullDir === 'right' ? pW / 2 : -pW / 2) : 0;
        const handleY = !isHoriz ? (pData.pullDir === 'down' ? pH / 2 : -pH / 2) : 0;

        ctx.fillStyle = '#ff3366';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(handleX, handleY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Arrow on pin handle
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const arrowChar = isHoriz
          ? pData.pullDir === 'right'
            ? '➔'
            : '⬅'
          : pData.pullDir === 'down'
          ? '⬇'
          : '⬆';
        ctx.fillText(arrowChar, handleX, handleY);

        ctx.restore();
      });

      // Draw Kibbles (Shiny brown tasty kibble pellets)
      kibbleBodies.forEach((k) => {
        if (!k.parent) return;
        ctx.save();
        ctx.translate(k.position.x, k.position.y);
        ctx.fillStyle = '#8d5b4c';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#b07d62';
        ctx.beginPath();
        ctx.arc(-2, -2, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Golden Treats (Bones)
      treatBodies.forEach((t) => {
        if (!t.parent) return;
        ctx.save();
        ctx.translate(t.position.x, t.position.y);
        ctx.rotate(t.angle);

        // Golden bone shape
        ctx.fillStyle = '#ffbe0b';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        // Bone center bar
        ctx.beginPath();
        ctx.roundRect(-10, -3, 20, 6, 2);
        ctx.fill();
        ctx.stroke();
        // Left bone lobes
        ctx.beginPath();
        ctx.arc(-10, -5, 4, 0, Math.PI * 2);
        ctx.arc(-10, 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Right bone lobes
        ctx.beginPath();
        ctx.arc(10, -5, 4, 0, Math.PI * 2);
        ctx.arc(10, 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      });

      // Draw Hazards (Mud / Spikes)
      hazardBodies.forEach((h) => {
        if (!h.parent) return;
        ctx.save();
        ctx.translate(h.position.x, h.position.y);
        if (h.label === 'mud') {
          // Bubbling red sludge
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fca5a5';
          ctx.beginPath();
          ctx.arc(-2, -2, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Spikes
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.moveTo(0, -10);
          ctx.lineTo(8, 8);
          ctx.lineTo(-8, 8);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      Events.off(engine);
      World.clear(world);
      Engine.clear(engine);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [levelData, resetCount]);

  // Check victory condition
  useEffect(() => {
    if (levelState === 'playing' && kibbleInBowl >= levelData.requiredKibble) {
      // WIN SEQUENCE!
      setLevelState('victory');
      AudioFX.playWinFanfare();
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Dog walks towards the bowl!
      setDogState('walking');
      const targetX = levelData.bowl.x - 70;
      let currentX = dogPos.x;
      const stepInterval = setInterval(() => {
        if (currentX < targetX) {
          currentX += 8;
          setDogPos((prev) => ({ ...prev, x: currentX }));
          onAddSteps(1);
          onAddPoints(5);
          AudioFX.playStep();
          // Add paw print
          setPawPrints((prev) => [
            ...prev,
            { id: Date.now() + Math.random(), x: currentX + 15, y: dogPos.y + 35 },
          ]);
        } else {
          clearInterval(stepInterval);
          // Dog arrived at bowl! Starts eating happily!
          setDogState('eating');
          AudioFX.playBark(1.2);
          // Heart celebration
          confetti({
            particleCount: 40,
            spread: 60,
            shapes: ['circle'],
            colors: ['#ff4d6d', '#ff758f', '#ffd166'],
          });
        }
      }, 140);
    }
  }, [kibbleInBowl, levelData, levelState]);

  const handleNextLevel = () => {
    AudioFX.playPinSlide();
    const nextId = levelData.id < PUZZLE_LEVELS.length ? levelData.id + 1 : 1;
    onSelectLevel(nextId);
    setResetCount((c) => c + 1);
    setLevelState('playing');
    setKibbleInBowl(0);
    setTreatsInBowl(0);
    setDogState('idle');
    setPoopEvent(null);
    setPawPrints([]);
  };

  const handleRestart = () => {
    AudioFX.playPinSlide();
    setResetCount((c) => c + 1);
    setLevelState('playing');
    setKibbleInBowl(0);
    setTreatsInBowl(0);
    setDogState('idle');
    setPoopEvent(null);
    setPawPrints([]);
  };

  return (
    <div className="puzzle-view">
      {/* Level Header Bar */}
      <div className="puzzle-top-bar">
        <div className="level-badge">
          <span>Level {levelData.id}: {levelData.name}</span>
          <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: '#e0edff', color: '#1d4ed8' }}>
            {levelData.difficulty.toUpperCase()}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-icon" onClick={handleRestart} title="Restart Level">
            🔄
          </button>
        </div>
      </div>

      {/* Physics Arena Board */}
      <div className="puzzle-board-container">
        {/* Tutorial Banner */}
        <div style={{ padding: '6px 12px', background: '#fff9e6', borderBottom: '1.5px solid #ffe066', fontSize: '0.8rem', color: '#8c6200', textAlign: 'center', fontWeight: '600' }}>
          💡 {levelData.tutorial} (Feed: {kibbleInBowl}/{levelData.requiredKibble} kibble)
        </div>

        {/* Poop Pause Surprise Alert */}
        {poopEvent && (
          <div className="poop-alert-container">
            <div className="poop-alert-banner">
              <span>💩</span>
              <span>Oops! Puppy took a potty break!</span>
            </div>
            <button className="poop-scoop-btn" onClick={handleScoopPoop}>
              <span>🧹</span> Quick Scoop! (+50 pts)
            </button>
          </div>
        )}

        {/* Floating points/cleanliness toasts */}
        {floatingPoints.map((fp) => (
          <div
            key={fp.id}
            style={{
              position: 'absolute',
              left: fp.x,
              top: fp.y,
              fontFamily: 'Fredoka, sans-serif',
              fontWeight: 700,
              fontSize: '1rem',
              color: '#d97706',
              textShadow: '0 2px 4px rgba(255,255,255,0.9)',
              pointerEvents: 'none',
              transform: 'translate(-50%, -50%)',
              animation: 'toastDrop 0.6s ease-out',
              zIndex: 35,
            }}
          >
            {fp.text}
          </div>
        ))}

        {/* Canvas for Matter.js Physics */}
        <canvas ref={canvasRef} className="puzzle-canvas" />

        {/* Paw Prints Left on Ground */}
        {pawPrints.map((paw) => (
          <div
            key={paw.id}
            style={{
              position: 'absolute',
              left: paw.x,
              top: paw.y,
              fontSize: '0.8rem',
              opacity: 0.5,
              pointerEvents: 'none',
              transform: 'rotate(15deg)',
            }}
          >
            🐾
          </div>
        ))}

        {/* Surprise Poop on Canvas (Clickable directly) */}
        {poopEvent && (
          <div
            onClick={handleScoopPoop}
            style={{
              position: 'absolute',
              left: poopEvent.x,
              top: poopEvent.y,
              fontSize: '1.8rem',
              cursor: 'pointer',
              zIndex: 25,
              animation: 'bounceIn 0.3s var(--ease-bouncy)',
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))',
            }}
            title="Tap to scoop!"
          >
            💩
          </div>
        )}

        {/* Animated Cartoon Dog at Ground Position */}
        <div
          style={{
            position: 'absolute',
            left: dogPos.x - 70,
            top: dogPos.y - 70,
            pointerEvents: 'none',
            zIndex: 15,
          }}
        >
          <DogRenderer
            breedId={selectedBreed}
            wardrobe={wardrobe}
            state={dogState}
            size={130}
          />
        </div>

        {/* Level Complete Victory Screen Overlay */}
        {levelState === 'victory' && (
          <div className="victory-overlay">
            <div className="victory-title">Pawsome Job! 🐶🎉</div>
            <div className="victory-subtitle">
              You guided the food safely to {selectedBreed.toUpperCase()}!
            </div>

            <div className="victory-stars">
              <span style={{ color: '#ffbe0b' }}>⭐</span>
              <span style={{ color: treatsInBowl > 0 ? '#ffbe0b' : '#ccc' }}>⭐</span>
              <span style={{ color: '#ffbe0b' }}>⭐</span>
            </div>

            <div className="victory-stats-card">
              <div className="victory-stat-row">
                <span>Kibbles Fed:</span>
                <span style={{ color: '#ff4d6d' }}>{kibbleInBowl} pellets (+{kibbleInBowl * 10} pts)</span>
              </div>
              <div className="victory-stat-row">
                <span>Bonus Treat:</span>
                <span style={{ color: '#ffbe0b' }}>{treatsInBowl > 0 ? `+${treatsInBowl * 100} pts 🦴` : 'None'}</span>
              </div>
              <div className="victory-stat-row">
                <span>Steps Walked:</span>
                <span style={{ color: '#06d6a0' }}>+{(pawPrints.length) * 5} pts 🐾</span>
              </div>
            </div>

            <div className="victory-actions">
              <button className="btn-action btn-secondary" onClick={handleRestart}>
                Replay 🔄
              </button>
              <button className="btn-action btn-primary" onClick={handleNextLevel}>
                Next Level ➔
              </button>
            </div>
          </div>
        )}

        {/* Level Failed Overlay */}
        {levelState === 'failed' && (
          <div className="victory-overlay">
            <div className="victory-title" style={{ color: '#e63946' }}>Oh No! Yuck! 🐾</div>
            <div className="victory-subtitle">
              Mud contaminated the dog food! What would you like to do?
            </div>
            <div style={{ fontSize: '3.2rem', margin: '12px 0' }}>🥺</div>
            <div className="victory-actions" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn-action btn-primary" onClick={handleRestart}>
                Try Again 🔄
              </button>
              <button className="btn-action btn-secondary" onClick={handleNextLevel}>
                Skip Level ➔
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
