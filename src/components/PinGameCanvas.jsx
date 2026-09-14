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
  const [dogState, setDogState] = useState('idle'); // 'idle' | 'walking' | 'eating' | 'pooping' | 'barking'
  const [dogPos, setDogPos] = useState({ x: 80, y: 460 });
  const [pawPrints, setPawPrints] = useState([]);
  const [poopEvent, setPoopEvent] = useState(null); // null or { x, y }
  const [floatingPoints, setFloatingPoints] = useState([]);
  const [barkBubble, setBarkBubble] = useState(null);
  const barkTimerRef = useRef(null);

  // Movable Food Bowl State
  const initialBowlData = (PUZZLE_LEVELS.find((l) => l.id === levelId) || PUZZLE_LEVELS[0]).bowl;
  const [currentBowlX, setCurrentBowlX] = useState(initialBowlData.x);
  const bowlPosRef = useRef({
    x: initialBowlData.x,
    y: initialBowlData.y,
    w: initialBowlData.w,
    h: initialBowlData.h,
    isHovered: false,
  });
  const bowlBodyRef = useRef(null);

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
    bowlPosRef.current = {
      x: found.bowl.x,
      y: found.bowl.y,
      w: found.bowl.w,
      h: found.bowl.h,
      isHovered: false,
    };
    setCurrentBowlX(found.bowl.x);
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

  // Movable Bowl Handler (Arrow keys, on-screen buttons, or mouse drag)
  const moveBowlBy = (delta) => {
    const b = bowlPosRef.current;
    if (!b) return;
    const minX = b.w / 2 + 10;
    const maxX = 400 - b.w / 2 - 10;
    const newX = Math.max(minX, Math.min(maxX, b.x + delta));
    b.x = newX;
    setCurrentBowlX(newX);
    if (bowlBodyRef.current) {
      Matter.Body.setPosition(bowlBodyRef.current, { x: newX, y: b.y });
    }
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

    // 2. Create Dog Food Bowl Sensor (Movable!)
    const initialBowlPos = bowlPosRef.current;
    const bowl = Bodies.rectangle(
      initialBowlPos.x,
      initialBowlPos.y,
      initialBowlPos.w,
      initialBowlPos.h,
      {
        isStatic: true,
        isSensor: true,
        label: 'bowlSensor',
      }
    );
    bowlBodyRef.current = bowl;
    World.add(world, bowl);

    // 3. Create Pins
    const pinObjects = levelData.pins.map((p) => {
      const isHoriz = p.orientation === 'horizontal';
      const bodyWidth = isHoriz ? p.length : 18;
      const bodyHeight = isHoriz ? 18 : p.length;

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
        isSlidingOut: false,
        isHovered: false,
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

    // Helpers for Pin Ring positioning and hit-testing
    const getPinRingPos = (pinBody) => {
      const pData = pinBody.customPinData;
      const isHoriz = pData.orientation === 'horizontal';
      const pW = isHoriz ? pData.length : 18;
      const pH = isHoriz ? 18 : pData.length;
      const handleX = isHoriz ? (pData.pullDir === 'right' ? pW / 2 : -pW / 2) : 0;
      const handleY = !isHoriz ? (pData.pullDir === 'down' ? pH / 2 : -pH / 2) : 0;
      const ringOffset = 28;
      const ringRelX = isHoriz ? (pData.pullDir === 'right' ? handleX + ringOffset : handleX - ringOffset) : 0;
      const ringRelY = !isHoriz ? (pData.pullDir === 'down' ? handleY + ringOffset : handleY - ringOffset) : 0;
      return {
        x: pinBody.position.x + ringRelX,
        y: pinBody.position.y + ringRelY,
        relX: ringRelX,
        relY: ringRelY,
        handleRelX: handleX,
        handleRelY: handleY,
        pW,
        pH,
        isHoriz,
      };
    };

    const checkPinHit = (pinBody, coords) => {
      const pData = pinBody.customPinData;
      if (pData.isRemoved || pData.isSlidingOut) return false;
      const { x: ringX, y: ringY } = getPinRingPos(pinBody);
      const distToRing = Math.hypot(coords.x - ringX, coords.y - ringY);
      if (distToRing <= 32) return true;
      const bounds = pinBody.bounds;
      if (
        coords.x >= bounds.min.x - 16 &&
        coords.x <= bounds.max.x + 16 &&
        coords.y >= bounds.min.y - 16 &&
        coords.y <= bounds.max.y + 16
      ) {
        return true;
      }
      return false;
    };

    const startSlideOut = (pinBody) => {
      const pData = pinBody.customPinData;
      if (pData.isSlidingOut || pData.isRemoved) return;
      pData.isSlidingOut = true;
      AudioFX.playPinSlide();
      isDragging = false;
      activePin = null;
      dragPinRef.current = null;
      canvas.style.cursor = 'default';
    };

    // Canvas Pointer Interaction for Pins & Movable Bowl
    let isDragging = false;
    let dragStartPos = { x: 0, y: 0 };
    let dragStartTime = 0;
    let activePin = null;

    // Movable bowl drag state
    let isDraggingBowl = false;
    let dragStartBowlX = initialBowlPos.x;
    let dragStartBowlPointerX = 0;

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

      // 1. Check if user clicked on the movable food bowl
      const b = bowlPosRef.current;
      const isBowlHit =
        coords.x >= b.x - b.w / 2 - 25 &&
        coords.x <= b.x + b.w / 2 + 25 &&
        coords.y >= b.y - b.h / 2 - 25 &&
        coords.y <= b.y + b.h / 2 + 35;

      if (isBowlHit) {
        isDraggingBowl = true;
        dragStartBowlX = b.x;
        dragStartBowlPointerX = coords.x;
        canvas.style.cursor = 'ew-resize';
        return;
      }

      // 2. Check if user clicked on a pin's handle or body
      for (const pinBody of pinObjects) {
        if (checkPinHit(pinBody, coords)) {
          isDragging = true;
          activePin = pinBody;
          dragPinRef.current = pinBody;
          dragStartPos = coords;
          dragStartTime = performance.now();
          canvas.style.cursor = 'grabbing';
          break;
        }
      }
    };

    const handlePointerMove = (e) => {
      const coords = getCanvasCoords(e);

      // Handle dragging the food bowl
      if (isDraggingBowl) {
        const deltaX = coords.x - dragStartBowlPointerX;
        const b = bowlPosRef.current;
        const minX = b.w / 2 + 10;
        const maxX = 400 - b.w / 2 - 10;
        const newX = Math.max(minX, Math.min(maxX, dragStartBowlX + deltaX));
        b.x = newX;
        setCurrentBowlX(newX);
        if (bowlBodyRef.current) {
          Body.setPosition(bowlBodyRef.current, { x: newX, y: b.y });
        }
        canvas.style.cursor = 'ew-resize';
        return;
      }

      // When not dragging anything, update hover cursor
      if (!isDragging || !activePin) {
        const b = bowlPosRef.current;
        const isHoverBowl =
          coords.x >= b.x - b.w / 2 - 25 &&
          coords.x <= b.x + b.w / 2 + 25 &&
          coords.y >= b.y - b.h / 2 - 25 &&
          coords.y <= b.y + b.h / 2 + 35;
        b.isHovered = isHoverBowl;

        let anyHover = false;
        for (const pinBody of pinObjects) {
          if (checkPinHit(pinBody, coords)) {
            pinBody.customPinData.isHovered = true;
            anyHover = true;
          } else {
            pinBody.customPinData.isHovered = false;
          }
        }

        if (isHoverBowl) {
          canvas.style.cursor = 'ew-resize';
        } else if (anyHover) {
          canvas.style.cursor = 'pointer';
        } else {
          canvas.style.cursor = 'default';
        }
        return;
      }

      const pData = activePin.customPinData;
      const isHoriz = pData.orientation === 'horizontal';

      if (isHoriz) {
        const deltaX = coords.x - dragStartPos.x;
        const isValid = (pData.pullDir === 'right' && deltaX > 0) || (pData.pullDir === 'left' && deltaX < 0);
        if (isValid) {
          pData.offset = deltaX;
          const newX = pData.origX + deltaX;
          Body.setPosition(activePin, { x: newX, y: pData.origY });

          if (Math.abs(deltaX) > pData.length * 0.35) {
            startSlideOut(activePin);
          }
        }
      } else {
        const deltaY = coords.y - dragStartPos.y;
        const isValid = (pData.pullDir === 'down' && deltaY > 0) || (pData.pullDir === 'up' && deltaY < 0);
        if (isValid) {
          pData.offset = deltaY;
          const newY = pData.origY + deltaY;
          Body.setPosition(activePin, { x: pData.origX, y: newY });

          if (Math.abs(deltaY) > pData.length * 0.35) {
            startSlideOut(activePin);
          }
        }
      }
    };

    const handlePointerUp = (e) => {
      if (isDraggingBowl) {
        isDraggingBowl = false;
        canvas.style.cursor = 'default';
      }

      if (!isDragging || !activePin) return;
      const coords = getCanvasCoords(e);
      const pData = activePin.customPinData;
      const elapsed = performance.now() - dragStartTime;
      const dist = Math.hypot(coords.x - dragStartPos.x, coords.y - dragStartPos.y);

      const isQuickTap = dist < 18 && elapsed < 550;
      const pulledFarEnough = Math.abs(pData.offset) >= 15;

      if (isQuickTap || pulledFarEnough) {
        startSlideOut(activePin);
      } else {
        pData.offset = 0;
        Body.setPosition(activePin, { x: pData.origX, y: pData.origY });
      }

      isDragging = false;
      activePin = null;
      dragPinRef.current = null;
      canvas.style.cursor = 'default';
    };

    // Keyboard support for moving the bowl with arrow keys or A/D
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        moveBowlBy(-25);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        moveBowlBy(25);
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('keydown', handleKeyDown);

    // Animation & Render Loop
    let animId;
    const render = () => {
      Matter.Engine.update(engine, 1000 / 60);

      // Advance sliding pins frame-by-frame with synchronous physics updates
      pinObjects.forEach((pinBody) => {
        const pData = pinBody.customPinData;
        if (!pData.isSlidingOut || pData.isRemoved) return;

        const slideSpeed = 16;
        if (pData.pullDir === 'right' || pData.pullDir === 'down') {
          pData.offset += slideSpeed;
        } else {
          pData.offset -= slideSpeed;
        }

        const isHoriz = pData.orientation === 'horizontal';
        const newX = isHoriz ? pData.origX + pData.offset : pData.origX;
        const newY = !isHoriz ? pData.origY + pData.offset : pData.origY;
        Body.setPosition(pinBody, { x: newX, y: newY });

        // Remove from Matter world once cleared beyond arena
        if (Math.abs(pData.offset) > pData.length + 90) {
          pData.isRemoved = true;
          World.remove(world, pinBody);
        }
      });

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

      // Draw Movable Food Bowl & Floor Slider Rail
      ctx.save();
      const b = bowlPosRef.current;
      const bX = b ? b.x : levelData.bowl.x;
      const bY = b ? b.y : levelData.bowl.y;
      const bW = b ? b.w : levelData.bowl.w;
      const bH = b ? b.h : levelData.bowl.h;

      // 1. Sleek dashed guide track on the floor
      ctx.save();
      ctx.strokeStyle = 'rgba(180, 120, 70, 0.45)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(55, bY + bH / 2 + 8);
      ctx.lineTo(345, bY + bH / 2 + 8);
      ctx.stroke();
      ctx.setLineDash([]);

      // Guide end stoppers
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(52, bY + bH / 2 + 5, 4, 6);
      ctx.fillRect(344, bY + bH / 2 + 5, 4, 6);

      // Track helper hint text
      ctx.fillStyle = 'rgba(100, 60, 20, 0.65)';
      ctx.font = '700 9.5px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('◀ ━ ━ 🐾 DRAG BOWL TO CATCH FOOD ━ ━ ▶', 200, bY + bH / 2 + 20);
      ctx.restore();

      // 2. Soft Drop Shadow under bowl
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.roundRect(bX - bW / 2, bY - bH / 2, bW, bH, [6, 6, 18, 18]);
      ctx.fill();
      ctx.restore();

      // 3. Hover / Active glowing aura
      if (b && (b.isHovered || isDraggingBowl)) {
        ctx.save();
        ctx.shadowColor = '#ff4d6d';
        ctx.shadowBlur = 16;
        ctx.strokeStyle = 'rgba(255, 77, 109, 0.85)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(bX - bW / 2 - 3, bY - bH / 2 - 3, bW + 6, bH + 6, [8, 8, 22, 22]);
        ctx.stroke();
        ctx.restore();
      }

      // 4. Ceramic Bowl Body with Rim Gradient
      const bowlGrad = ctx.createLinearGradient(bX - bW / 2, bY, bX + bW / 2, bY);
      bowlGrad.addColorStop(0, '#e11d48');
      bowlGrad.addColorStop(0.2, '#ff4d6d');
      bowlGrad.addColorStop(0.5, '#ff758f');
      bowlGrad.addColorStop(0.8, '#ff4d6d');
      bowlGrad.addColorStop(1, '#be123c');

      ctx.fillStyle = bowlGrad;
      ctx.beginPath();
      ctx.roundRect(bX - bW / 2, bY - bH / 2, bW, bH, [6, 6, 18, 18]);
      ctx.fill();
      ctx.strokeStyle = '#9f1239';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Inner Bowl Rim Specular Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(bX, bY - bH / 2 + 5, bW / 2 - 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Left & Right Chrome Slider Arrow Grips
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#9f1239';
      ctx.lineWidth = 1.5;
      ctx.font = '900 12px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeText('◀', bX - bW / 2 + 13, bY);
      ctx.fillText('◀', bX - bW / 2 + 13, bY);
      ctx.strokeText('▶', bX + bW / 2 - 13, bY);
      ctx.fillText('▶', bX + bW / 2 - 13, bY);

      // Dog Paw icon on food bowl center
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bX, bY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bX - 5, bY - 6, 2.5, 0, Math.PI * 2);
      ctx.arc(bX, bY - 8, 2.5, 0, Math.PI * 2);
      ctx.arc(bX + 5, bY - 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw Classic "Pull the Pin" Style Pins
      const now = performance.now();

      pinObjects.forEach((pinBody, pinIdx) => {
        const pData = pinBody.customPinData;
        if (pData.isRemoved) return;

        ctx.save();
        ctx.translate(pinBody.position.x, pinBody.position.y);

        const isHoriz = pData.orientation === 'horizontal';
        const pW = isHoriz ? pData.length : 18;
        const pH = isHoriz ? 18 : pData.length;

        // Determine handle and tip coordinates
        let handleX = 0, handleY = 0;
        let tipX = 0, tipY = 0;
        if (isHoriz) {
          if (pData.pullDir === 'right') {
            handleX = pW / 2;
            tipX = -pW / 2;
          } else {
            handleX = -pW / 2;
            tipX = pW / 2;
          }
        } else {
          if (pData.pullDir === 'down') {
            handleY = pH / 2;
            tipY = -pH / 2;
          } else {
            handleY = -pH / 2;
            tipY = pH / 2;
          }
        }

        // Prominent Ring position extending cleanly outside the wall
        const ringOffset = 28;
        const ringX = isHoriz ? (pData.pullDir === 'right' ? handleX + ringOffset : handleX - ringOffset) : 0;
        const ringY = !isHoriz ? (pData.pullDir === 'down' ? handleY + ringOffset : handleY - ringOffset) : 0;
        const ringOuterRad = 22;
        const ringHoleRad = 12;

        // 1. Soft Realistic Drop Shadow under the entire pin assembly
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.roundRect(-pW / 2, -pH / 2, pW, pH, 5);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ringX, ringY, ringOuterRad, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 2. Wall Mounting Bracket Grommet with Rivets where pin penetrates wall
        ctx.save();
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        if (isHoriz) {
          ctx.beginPath();
          ctx.roundRect(handleX - 4, -pH / 2 - 4, 8, pH + 8, 2);
          ctx.fill();
          ctx.stroke();
          // Silver rivet dots
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.arc(handleX, -pH / 2 - 1, 1.8, 0, Math.PI * 2);
          ctx.arc(handleX, pH / 2 + 1, 1.8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.roundRect(-pW / 2 - 4, handleY - 4, pW + 8, 8, 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.arc(-pW / 2 - 1, handleY, 1.8, 0, Math.PI * 2);
          ctx.arc(pW / 2 + 1, handleY, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // 3. Pin Shaft (3D Cylindrical Metallic Shading)
        if (isHoriz) {
          const shaftGrad = ctx.createLinearGradient(0, -pH / 2, 0, pH / 2);
          shaftGrad.addColorStop(0, '#fffbeb');   // bright rim light
          shaftGrad.addColorStop(0.18, '#fef08a'); // gold specular highlight
          shaftGrad.addColorStop(0.48, '#f59e0b'); // rich warm gold
          shaftGrad.addColorStop(0.8, '#d97706');  // deep amber tone
          shaftGrad.addColorStop(1, '#78350f');    // dark bottom edge
          ctx.fillStyle = shaftGrad;
          ctx.beginPath();
          ctx.roundRect(-pW / 2, -pH / 2, pW, pH, 5);
          ctx.fill();

          // Longitudinal Chrome Specular Stripe along top of rod
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.fillRect(-pW / 2 + 6, -pH / 2 + 2, pW - 12, 2.5);

          // Lathed Machined Groove Rings along the shaft
          [-0.25, 0, 0.25].forEach((ratio) => {
            const gx = ratio * pW;
            ctx.fillStyle = '#78350f';
            ctx.fillRect(gx - 1, -pH / 2 + 1, 2, pH - 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillRect(gx + 1, -pH / 2 + 1, 1, pH - 2);
          });

          // Tapered Conical Locking Bullet Tip
          ctx.fillStyle = '#b45309';
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          if (pData.pullDir === 'right') {
            ctx.moveTo(tipX, -pH / 2);
            ctx.lineTo(tipX - 10, 0);
            ctx.lineTo(tipX, pH / 2);
          } else {
            ctx.moveTo(tipX, -pH / 2);
            ctx.lineTo(tipX + 10, 0);
            ctx.lineTo(tipX, pH / 2);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else {
          // Vertical Pin Shaft
          const shaftGrad = ctx.createLinearGradient(-pW / 2, 0, pW / 2, 0);
          shaftGrad.addColorStop(0, '#fffbeb');
          shaftGrad.addColorStop(0.18, '#fef08a');
          shaftGrad.addColorStop(0.48, '#f59e0b');
          shaftGrad.addColorStop(0.8, '#d97706');
          shaftGrad.addColorStop(1, '#78350f');
          ctx.fillStyle = shaftGrad;
          ctx.beginPath();
          ctx.roundRect(-pW / 2, -pH / 2, pW, pH, 5);
          ctx.fill();

          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.fillRect(-pW / 2 + 2, -pH / 2 + 6, 2.5, pH - 12);

          // Grooves
          [-0.25, 0, 0.25].forEach((ratio) => {
            const gy = ratio * pH;
            ctx.fillStyle = '#78350f';
            ctx.fillRect(-pW / 2 + 1, gy - 1, pW - 2, 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillRect(-pW / 2 + 1, gy + 1, pW - 2, 1);
          });

          // Conical Bullet Tip
          ctx.fillStyle = '#b45309';
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          if (pData.pullDir === 'down') {
            ctx.moveTo(-pW / 2, tipY);
            ctx.lineTo(0, tipY - 10);
            ctx.lineTo(pW / 2, tipY);
          } else {
            ctx.moveTo(-pW / 2, tipY);
            ctx.lineTo(0, tipY + 10);
            ctx.lineTo(pW / 2, tipY);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // 4. Dynamic Traveling Gleam Shine across the shaft
        const gleamCycle = 2600;
        const gleamTime = (now + pinIdx * 700) % gleamCycle;
        if (gleamTime < 850) {
          const tGleam = gleamTime / 850;
          ctx.save();
          if (isHoriz) {
            const gx = -pW / 2 + tGleam * pW;
            const gleamGrad = ctx.createLinearGradient(gx - 22, 0, gx + 22, 0);
            gleamGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            gleamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
            gleamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gleamGrad;
            ctx.fillRect(gx - 22, -pH / 2, 44, pH);
          } else {
            const gy = -pH / 2 + tGleam * pH;
            const gleamGrad = ctx.createLinearGradient(0, gy - 22, 0, gy + 22);
            gleamGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            gleamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
            gleamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gleamGrad;
            ctx.fillRect(-pW / 2, gy - 22, pW, 44);
          }
          ctx.restore();
        }

        // 5. Heavy Brass Hinge Collar connecting Rod to Pull Ring
        ctx.fillStyle = '#b45309';
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(handleX, handleY, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Connecting Hinge Bar
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(
          Math.min(handleX, ringX) - 2,
          Math.min(handleY, ringY) - 5,
          Math.abs(handleX - ringX) + 4 || 10,
          Math.abs(handleY - ringY) + 10 || 10,
          4
        );
        ctx.fill();
        ctx.stroke();

        // Center Pivot Bolt Rivet
        ctx.fillStyle = '#fef08a';
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(handleX, handleY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 6. Hover / Active Golden Halo Glow
        if (pData.isHovered || (isDragging && activePin === pinBody)) {
          ctx.save();
          ctx.shadowColor = '#fde047';
          ctx.shadowBlur = 14;
          ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(ringX, ringY, ringOuterRad + 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // 7. The Classic "Pull the Pin" Hollow Donut Loop (True Hole Cutout)
        ctx.save();
        const ringGrad = ctx.createRadialGradient(ringX - 6, ringY - 6, 4, ringX, ringY, ringOuterRad + 2);
        ringGrad.addColorStop(0, '#fffbeb');
        ringGrad.addColorStop(0.2, '#fde047');
        ringGrad.addColorStop(0.55, '#f59e0b');
        ringGrad.addColorStop(0.85, '#d97706');
        ringGrad.addColorStop(1, '#78350f');

        ctx.fillStyle = ringGrad;
        ctx.beginPath();
        // Outer loop (clockwise)
        ctx.arc(ringX, ringY, ringOuterRad, 0, Math.PI * 2, false);
        // Inner cutout hole (counter-clockwise -> evenodd punch-out)
        ctx.arc(ringX, ringY, ringHoleRad, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill('evenodd');

        // Outer polished gold bevel stroke
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ringX, ringY, ringOuterRad, 0, Math.PI * 2);
        ctx.stroke();

        // Inner dark hole bevel stroke
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ringX, ringY, ringHoleRad, 0, Math.PI * 2);
        ctx.stroke();

        // Top-left Specular Crescent Arc Glint
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(ringX, ringY, ringOuterRad - 3, -Math.PI * 0.85, -Math.PI * 0.15);
        ctx.stroke();
        ctx.restore();

        // 8. Animated Pulsing Pull Direction Cue
        const bounce = Math.sin(now * 0.008) * 3.5;
        let cueX = ringX;
        let cueY = ringY;
        let arrowStr = '➔';
        if (isHoriz) {
          if (pData.pullDir === 'right') {
            cueX += bounce;
            arrowStr = '➔';
          } else {
            cueX -= bounce;
            arrowStr = '⬅';
          }
        } else {
          if (pData.pullDir === 'down') {
            cueY += bounce;
            arrowStr = '⬇';
          } else {
            cueY -= bounce;
            arrowStr = '⬆';
          }
        }

        ctx.save();
        ctx.fillStyle = '#b91c1c';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.font = '900 13px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(arrowStr, cueX, cueY);
        ctx.fillText(arrowStr, cueX, cueY);
        ctx.restore();

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
      window.removeEventListener('keydown', handleKeyDown);
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

      // Dog walks towards the bowl wherever it was moved!
      setDogState('walking');
      const b = bowlPosRef.current;
      const finalBowlX = b ? b.x : levelData.bowl.x;
      const targetX = dogPos.x < finalBowlX ? finalBowlX - 65 : finalBowlX + 65;
      let currentX = dogPos.x;
      const walkDir = targetX > currentX ? 1 : -1;
      const stepInterval = setInterval(() => {
        const arrived = walkDir > 0 ? currentX >= targetX : currentX <= targetX;
        if (!arrived) {
          currentX += walkDir * 8;
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
    setBarkBubble(null);
  };

  const handleDogBark = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    AudioFX.playBreedBark(selectedBreed);

    const phrases = [
      'Woof! 🐾',
      'Arf arf! 🦴',
      'Ruff! ✨',
      'Awoo! ❤️',
      'Yip yip! 🐶',
      'Bork! 🍖',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    setBarkBubble(phrase);

    if (barkTimerRef.current) clearTimeout(barkTimerRef.current);
    barkTimerRef.current = setTimeout(() => {
      setBarkBubble(null);
    }, 1300);

    if (dogState === 'idle') {
      setDogState('barking');
      setTimeout(() => {
        setDogState((cur) => (cur === 'barking' ? 'idle' : cur));
      }, 420);
    }

    setFloatingPoints((prev) => [
      ...prev.slice(-3),
      { id: Date.now() + Math.random(), x: dogPos.x, y: dogPos.y - 45, text: '💖 +5 Pet Bonus!' },
    ]);

    if (onAddPoints) {
      onAddPoints(5);
    }
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
    setBarkBubble(null);
  };

  return (
    <div className="puzzle-view">
      {/* Top Header Card: Level Info + Clean Tutorial Hint (Cleanly outside the canvas!) */}
      <div className="puzzle-header-card">
        <div className="puzzle-top-row">
          <div className="level-badge">
            <span>Level {levelData.id}: {levelData.name}</span>
            <span className={`difficulty-tag difficulty-${levelData.difficulty}`}>
              {levelData.difficulty.toUpperCase()}
            </span>
          </div>

          <div className="puzzle-top-actions">
            <div className="kibble-goal-pill" title="Kibbles fed to puppy">
              <span>🍖</span>
              <span>{kibbleInBowl}/{levelData.requiredKibble} Goal</span>
            </div>
            <button className="btn-icon btn-sm" onClick={handleRestart} title="Restart Level">
              🔄
            </button>
          </div>
        </div>

        {/* Tutorial Hint Banner - In the header card, NEVER hides any text or canvas! */}
        <div className="puzzle-tutorial-hint">
          <span className="hint-icon">💡</span>
          <span className="hint-text">{levelData.tutorial}</span>
        </div>
      </div>

      {/* Physics Arena Board */}
      <div className="puzzle-board-container">
        {/* Poop Pause Surprise Alert (Floating in upper-mid space, never overlaps tutorial!) */}
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

        {/* Animated Cartoon Dog at Ground Position - Click to Bark! */}
        <div
          className="dog-interactive"
          onClick={handleDogBark}
          style={{
            position: 'absolute',
            left: dogPos.x - 70,
            top: dogPos.y - 70,
            zIndex: 25,
          }}
          title={`Click ${selectedBreed === 'tuck' ? 'Tuck' : selectedBreed} to pet & make them bark! 🐶`}
        >
          {/* Cartoon Bark Speech Bubble */}
          {barkBubble && (
            <div className="dog-bark-bubble">
              <span>{barkBubble}</span>
              <div className="bark-bubble-tail" />
            </div>
          )}

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

      {/* Movable Bowl Control Dock */}
      <div className="bowl-control-dock">
        <button
          className="btn-bowl-arrow"
          onClick={() => moveBowlBy(-30)}
          title="Move bowl left (or drag bowl on screen / use Left Arrow)"
        >
          ◀ Move Left
        </button>
        <div className="bowl-control-info">
          <span>🥣 Drag Bowl or Use Arrows to Catch Food!</span>
        </div>
        <button
          className="btn-bowl-arrow"
          onClick={() => moveBowlBy(30)}
          title="Move bowl right (or drag bowl on screen / use Right Arrow)"
        >
          Move Right ▶
        </button>
      </div>
    </div>
  );
}
