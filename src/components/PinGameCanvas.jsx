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
  onPlayBonusRound,
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
  const [bonusRound, setBonusRound] = useState(null);
  const [lockedPinAlert, setLockedPinAlert] = useState(null);
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
    setBonusRound(null);
    setLockedPinAlert(null);
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
    const bb = bowlBodyRef.current;
    if (bb) {
      if (bb.sensor) Matter.Body.setPosition(bb.sensor, { x: newX, y: b.y - 35 });
      if (bb.bottom) Matter.Body.setPosition(bb.bottom, { x: newX, y: b.y + b.h / 2 - 2 });
      if (bb.left) Matter.Body.setPosition(bb.left, { x: newX - b.w / 2 + 3, y: b.y - 30 });
      if (bb.right) Matter.Body.setPosition(bb.right, { x: newX + b.w / 2 - 3, y: b.y - 30 });
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
      const isBouncy = !!w.isBouncy;
      const wall = Bodies.rectangle(w.x, w.y, w.w, w.h, {
        isStatic: true,
        angle: w.angle || 0,
        restitution: isBouncy ? 1.25 : 0.1,
        friction: isBouncy ? 0.02 : 0.5,
        label: isBouncy ? 'bouncyWall' : 'wall',
        render: { fillStyle: w.color || (isBouncy ? '#06d6a0' : '#e0a96d') },
      });
      wall.customWallData = {
        isBouncy,
        angle: w.angle || 0,
        w: w.w,
        h: w.h,
        color: w.color,
      };
      wallBodies.push(wall);
    });

    // Outer stage bounds
    const floor = Bodies.rectangle(200, 525, 420, 20, { isStatic: true });
    const leftWall = Bodies.rectangle(-10, 260, 20, 520, { isStatic: true });
    const rightWall = Bodies.rectangle(410, 260, 20, 520, { isStatic: true });
    wallBodies.push(floor, leftWall, rightWall);
    World.add(world, wallBodies);

    // 1b. Create Bouncy Bumpers
    const bumperBodies = (levelData.bumpers || []).map((bmp, idx) => {
      const bBody = Bodies.circle(bmp.x, bmp.y, bmp.radius || 22, {
        isStatic: true,
        restitution: 1.45,
        friction: 0.0,
        label: 'bumper',
      });
      bBody.customBumperData = {
        id: `bmp_${idx}`,
        x: bmp.x,
        y: bmp.y,
        radius: bmp.radius || 22,
        color: bmp.color || '#ec4899',
        pulse: 0,
      };
      World.add(world, bBody);
      return bBody;
    });

    // 2. Create Dog Food Bowl with Solid Basin & Extended High-Stacking Walls (Movable!)
    const initialBowlPos = bowlPosRef.current;
    const bowlSensor = Bodies.rectangle(
      initialBowlPos.x,
      initialBowlPos.y - 35,
      initialBowlPos.w + 6,
      initialBowlPos.h + 80,
      {
        isStatic: true,
        isSensor: true,
        label: 'bowlSensor',
      }
    );
    const bowlBottom = Bodies.rectangle(
      initialBowlPos.x,
      initialBowlPos.y + initialBowlPos.h / 2 - 2,
      initialBowlPos.w - 4,
      10,
      {
        isStatic: true,
        label: 'bowlBottom',
        friction: 0.9,
        restitution: 0.1,
      }
    );
    const bowlLeftWall = Bodies.rectangle(
      initialBowlPos.x - initialBowlPos.w / 2 + 3,
      initialBowlPos.y - 30,
      8,
      initialBowlPos.h + 60,
      {
        isStatic: true,
        label: 'bowlWall',
        friction: 0.5,
      }
    );
    const bowlRightWall = Bodies.rectangle(
      initialBowlPos.x + initialBowlPos.w / 2 - 3,
      initialBowlPos.y - 30,
      8,
      initialBowlPos.h + 60,
      {
        isStatic: true,
        label: 'bowlWall',
        friction: 0.5,
      }
    );

    bowlBodyRef.current = {
      sensor: bowlSensor,
      bottom: bowlBottom,
      left: bowlLeftWall,
      right: bowlRightWall,
    };
    World.add(world, [bowlSensor, bowlBottom, bowlLeftWall, bowlRightWall]);

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
        lockedBy: p.lockedBy || null,
        rattle: 0,
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

    // 5. Create Gourmet Treats (Bones, Cheese Triangles, Stars, Hearts, Bacon)
    const treatBodies = levelData.treats.map((t) => {
      const shape = t.shape || 'bone';
      let treat;
      if (shape === 'cheese' || shape === 'triangle') {
        // Triangular Swiss Cheese Wedge Body
        treat = Bodies.polygon(t.x, t.y, 3, 15, {
          restitution: 0.35,
          friction: 0.1,
          density: 0.002,
          label: 'treat',
        });
      } else if (shape === 'star') {
        treat = Bodies.polygon(t.x, t.y, 5, 14, {
          restitution: 0.35,
          friction: 0.1,
          density: 0.002,
          label: 'treat',
        });
      } else if (shape === 'heart') {
        treat = Bodies.circle(t.x, t.y, 12, {
          restitution: 0.35,
          friction: 0.1,
          density: 0.002,
          label: 'treat',
        });
      } else if (shape === 'bacon') {
        treat = Bodies.rectangle(t.x, t.y, 28, 10, {
          restitution: 0.3,
          friction: 0.1,
          density: 0.002,
          label: 'treat',
        });
      } else if (shape === 'fish') {
        treat = Bodies.rectangle(t.x, t.y, 24, 12, {
          restitution: 0.35,
          friction: 0.1,
          density: 0.002,
          label: 'treat',
        });
      } else {
        treat = Bodies.rectangle(t.x, t.y, 24, 12, {
          restitution: 0.3,
          friction: 0.1,
          density: 0.002,
          label: 'treat',
        });
      }
      treat.customTreatData = {
        shape,
        x: t.x,
        y: t.y,
      };
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

    // Stack slots representing an appetizing pyramid mound rising high out of the bowl
    const stackSlots = [
      // Layer 0: nestled in bottom basin of bowl (y: +4)
      { x: -30, y: 4 },
      { x: -15, y: 4 },
      { x: 0, y: 4 },
      { x: 15, y: 4 },
      { x: 30, y: 4 },
      // Layer 1: rim level (y: -8)
      { x: -26, y: -8 },
      { x: -13, y: -8 },
      { x: 0, y: -8 },
      { x: 13, y: -8 },
      { x: 26, y: -8 },
      // Layer 2: stacked high above the rim! (y: -20)
      { x: -21, y: -20 },
      { x: -10, y: -20 },
      { x: 0, y: -20 },
      { x: 10, y: -20 },
      { x: 21, y: -20 },
      // Layer 3: stacked higher! (y: -32)
      { x: -16, y: -32 },
      { x: -6, y: -32 },
      { x: 6, y: -32 },
      { x: 16, y: -32 },
      // Layer 4: high pyramid peak! (y: -44)
      { x: -11, y: -44 },
      { x: 0, y: -44 },
      { x: 11, y: -44 },
      // Layer 5: mountain peak! (y: -56)
      { x: -6, y: -56 },
      { x: 6, y: -56 },
      // Layer 6: summit (y: -68)
      { x: 0, y: -68 },
    ];

    const catchKibble = (kibbleBody) => {
      if (handledBodies.has(kibbleBody.id)) return;
      handledBodies.add(kibbleBody.id);
      collectedKibbles++;
      setKibbleInBowl(collectedKibbles);
      AudioFX.playKibbleDrop();
      onAddPoints(10);

      const curB = bowlPosRef.current;
      const slot = stackSlots[(collectedKibbles - 1) % stackSlots.length];
      const jitterX = (Math.random() - 0.5) * 3;
      const jitterY = (Math.random() - 0.5) * 2;

      kibbleBody.inBowl = true;
      kibbleBody.bowlOffsetX = slot.x + jitterX;
      kibbleBody.bowlOffsetY = slot.y + jitterY;
      Body.setVelocity(kibbleBody, { x: 0, y: 0 });
      Body.setStatic(kibbleBody, true);

      // Check if ALL food in the level has been collected and stacked
      if (collectedKibbles >= levelData.kibbles.length) {
        AudioFX.playTreatBonus();
        onAddPoints(100);
        spawnFloatingText('🏆 ALL FOOD STACKED! +100', curB.x, curB.y - 70);
      } else {
        spawnFloatingText('+10', kibbleBody.position.x, kibbleBody.position.y - 12);
      }
    };

    const catchTreat = (treatBody) => {
      if (handledBodies.has(treatBody.id)) return;
      handledBodies.add(treatBody.id);
      collectedTreats++;
      setTreatsInBowl(collectedTreats);
      AudioFX.playTreatBonus();
      onAddPoints(100);

      const curB = bowlPosRef.current;
      treatBody.inBowl = true;
      const topHeight = Math.min(-20, -16 - (Math.floor(collectedKibbles / 4) * 12));
      treatBody.bowlOffsetX = (collectedTreats % 2 === 1 ? -6 : 6);
      treatBody.bowlOffsetY = topHeight;
      Body.setVelocity(treatBody, { x: 0, y: 0 });
      Body.setStatic(treatBody, true);

      const treatShape = treatBody.customTreatData?.shape || 'bone';
      let treatText = '⭐ +100 TREAT!';
      if (treatShape === 'cheese' || treatShape === 'triangle') treatText = '🧀 +100 CHEESE TREAT!';
      else if (treatShape === 'star') treatText = '⭐ +100 STAR COOKIE!';
      else if (treatShape === 'heart') treatText = '💖 +100 HEART BISCUIT!';
      else if (treatShape === 'bacon') treatText = '🥓 +100 BACON CHEW!';
      else if (treatShape === 'fish') treatText = '🐟 +100 SALMON BITE!';
      else treatText = '🦴 +100 GOLDEN BONE!';
      spawnFloatingText(treatText, curB.x, curB.y - 80);
    };

    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        const checkBody = (target, other) => {
          const targetIsBowl =
            target.label === 'bowlSensor' ||
            target.label === 'bowlBottom' ||
            target.label === 'bowlWall' ||
            target.inBowl;
          if (targetIsBowl && !handledBodies.has(other.id)) {
            if (other.label === 'kibble') {
              catchKibble(other);
            } else if (other.label === 'treat') {
              catchTreat(other);
            } else if (other.label === 'mud') {
              // Mud hit the bowl! Level failed!
              setLevelState('failed');
              AudioFX.playPoop();
            }
          }
        };
        checkBody(bodyA, bodyB);
        checkBody(bodyB, bodyA);

        const checkBumper = (target, other) => {
          if (target.label === 'bumper' && (other.label === 'kibble' || other.label === 'treat')) {
            if (target.customBumperData) {
              target.customBumperData.pulse = 1.0;
            }
            AudioFX.playBumperBounce();
            const dx = other.position.x - target.position.x;
            const dy = other.position.y - target.position.y;
            const dist = Math.hypot(dx, dy) || 1;
            Body.applyForce(other, other.position, {
              x: (dx / dist) * 0.008,
              y: (dy / dist) * 0.008,
            });
            spawnFloatingText('💥 BOING!', target.position.x, target.position.y - 18);
          } else if (target.label === 'bouncyWall' && (other.label === 'kibble' || other.label === 'treat')) {
            AudioFX.playBumperBounce();
          }
        };
        checkBumper(bodyA, bodyB);
        checkBumper(bodyB, bodyA);
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
          const pData = pinBody.customPinData;
          // Check if pin is locked by an unremoved pin!
          if (pData.lockedBy) {
            const blockingPin = pinObjects.find(
              (p) => p.customPinData.id === pData.lockedBy && !p.customPinData.isRemoved
            );
            if (blockingPin) {
              pData.rattle = 20;
              AudioFX.playLockedRattle();
              setLockedPinAlert(`🔒 Pin ${pData.id} is blocked by Pin ${pData.lockedBy}! Pull Pin ${pData.lockedBy} first!`);
              setTimeout(() => setLockedPinAlert(null), 2500);
              return;
            }
          }

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
        const bb = bowlBodyRef.current;
        if (bb) {
          if (bb.sensor) Body.setPosition(bb.sensor, { x: newX, y: b.y - 35 });
          if (bb.bottom) Body.setPosition(bb.bottom, { x: newX, y: b.y + b.h / 2 - 2 });
          if (bb.left) Body.setPosition(bb.left, { x: newX - b.w / 2 + 3, y: b.y - 30 });
          if (bb.right) Body.setPosition(bb.right, { x: newX + b.w / 2 - 3, y: b.y - 30 });
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
          coords.y >= b.y - b.h / 2 - 55 &&
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
          const prevStep = Math.floor(Math.abs(pData.offset || 0) / 20);
          pData.offset = deltaX;
          const nextStep = Math.floor(Math.abs(deltaX) / 20);
          if (nextStep !== prevStep) {
            AudioFX.playPinRatchet();
          }

          const newX = pData.origX + deltaX;
          Body.setPosition(activePin, { x: newX, y: pData.origY });

          if (Math.abs(deltaX) >= pData.length * 0.70) {
            startSlideOut(activePin);
          }
        }
      } else {
        const deltaY = coords.y - dragStartPos.y;
        const isValid = (pData.pullDir === 'down' && deltaY > 0) || (pData.pullDir === 'up' && deltaY < 0);
        if (isValid) {
          const prevStep = Math.floor(Math.abs(pData.offset || 0) / 20);
          pData.offset = deltaY;
          const nextStep = Math.floor(Math.abs(deltaY) / 20);
          if (nextStep !== prevStep) {
            AudioFX.playPinRatchet();
          }

          const newY = pData.origY + deltaY;
          Body.setPosition(activePin, { x: pData.origX, y: newY });

          if (Math.abs(deltaY) >= pData.length * 0.70) {
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
      const pData = activePin.customPinData;
      const pulledFarEnough = Math.abs(pData.offset) >= pData.length * 0.70;

      if (pulledFarEnough) {
        startSlideOut(activePin);
      } else {
        // Snap back! Stiff mechanical spring locks it back in place
        if (Math.abs(pData.offset) > 6) {
          AudioFX.playPinSnap();
          spawnFloatingText('Snapped Back! 🧲', pData.origX, pData.origY - 15);
        }
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

      // Active bowl mouth & high-stack interceptor
      const curB = bowlPosRef.current;
      kibbleBodies.forEach((k) => {
        if (!handledBodies.has(k.id)) {
          // Intercept anywhere entering the bowl column, even stacked high!
          const inH = Math.abs(k.position.x - curB.x) <= curB.w / 2 + 10;
          const inV = k.position.y >= curB.y - 85 && k.position.y <= curB.y + curB.h / 2 + 10;
          if (inH && inV) {
            catchKibble(k);
          }
        } else if (k.inBowl) {
          Body.setPosition(k, {
            x: curB.x + (k.bowlOffsetX || 0),
            y: curB.y + (k.bowlOffsetY || 2),
          });
        }
      });

      treatBodies.forEach((t) => {
        if (!handledBodies.has(t.id)) {
          const inH = Math.abs(t.position.x - curB.x) <= curB.w / 2 + 12;
          const inV = t.position.y >= curB.y - 95 && t.position.y <= curB.y + curB.h / 2 + 10;
          if (inH && inV) {
            catchTreat(t);
          }
        } else if (t.inBowl) {
          Body.setPosition(t, {
            x: curB.x + (t.bowlOffsetX || 0),
            y: curB.y + (t.bowlOffsetY || -20),
          });
        }
      });

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
      wallBodies.forEach((w) => {
        if (w.label === 'bowlSensor') return;
        ctx.save();
        ctx.translate(w.position.x, w.position.y);
        ctx.rotate(w.angle);
        const wWidth = w.customWallData ? w.customWallData.w : (w.bounds.max.x - w.bounds.min.x);
        const wHeight = w.customWallData ? w.customWallData.h : (w.bounds.max.y - w.bounds.min.y);

        const isBouncy = w.customWallData?.isBouncy;
        if (isBouncy) {
          // Sleek Bouncy wall: slim vibrant rubber cushion with subtle glow
          ctx.save();
          ctx.shadowColor = w.customWallData.color || '#06d6a0';
          ctx.shadowBlur = 8;
          ctx.fillStyle = w.customWallData.color || '#06d6a0';
          ctx.beginPath();
          ctx.roundRect(-wWidth / 2, -wHeight / 2, wWidth, wHeight, 4);
          ctx.fill();
          ctx.restore();

          // Subtle diagonal candy pinstripes
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(-wWidth / 2, -wHeight / 2, wWidth, wHeight, 4);
          ctx.clip();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 2;
          for (let sx = -wWidth - wHeight; sx < wWidth + wHeight; sx += 10) {
            ctx.beginPath();
            ctx.moveTo(sx, -wHeight / 2);
            ctx.lineTo(sx + wHeight, wHeight / 2);
            ctx.stroke();
          }
          ctx.restore();

          ctx.strokeStyle = '#047857';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(-wWidth / 2, -wHeight / 2, wWidth, wHeight, 4);
          ctx.stroke();
        } else {
          // Sleek Standard barrier
          ctx.fillStyle = w.customWallData?.color || '#8b5a2b';
          ctx.strokeStyle = '#5c3a1e';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(-wWidth / 2, -wHeight / 2, wWidth, wHeight, 4);
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      });

      // Draw Pinball Bumpers
      bumperBodies.forEach((bBody) => {
        const bmp = bBody.customBumperData;
        if (!bmp) return;
        ctx.save();
        ctx.translate(bBody.position.x, bBody.position.y);

        // Expanding pulse shockwave when hit
        if (bmp.pulse > 0) {
          ctx.save();
          ctx.strokeStyle = bmp.color;
          ctx.lineWidth = 3 * bmp.pulse;
          ctx.globalAlpha = bmp.pulse;
          ctx.beginPath();
          ctx.arc(0, 0, bmp.radius + (1.0 - bmp.pulse) * 24, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          bmp.pulse = Math.max(0, bmp.pulse - 0.04);
        }

        // Bumper Drop Shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(0, 0, bmp.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Glowing outer neon rim
        ctx.save();
        ctx.shadowColor = bmp.color;
        ctx.shadowBlur = 12;
        ctx.strokeStyle = bmp.color;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(0, 0, bmp.radius - 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Inner radial gradient body
        const bGrad = ctx.createRadialGradient(-4, -4, 2, 0, 0, bmp.radius);
        bGrad.addColorStop(0, '#ffffff');
        bGrad.addColorStop(0.35, bmp.color);
        bGrad.addColorStop(0.85, '#471533');
        bGrad.addColorStop(1, '#1f0d19');
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(0, 0, bmp.radius - 3, 0, Math.PI * 2);
        ctx.fill();

        // Bumper center lightning emblem
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 13px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡', 0, 1);

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

        // Check if pin is locked by another active pin
        let isLocked = false;
        if (pData.lockedBy) {
          const blockingPin = pinObjects.find(
            (p) => p.customPinData.id === pData.lockedBy && !p.customPinData.isRemoved
          );
          if (blockingPin) isLocked = true;
        }

        // Rattle shake animation if user tried pulling while locked
        let shakeX = 0;
        let shakeY = 0;
        if (pData.rattle > 0) {
          shakeX = (Math.random() - 0.5) * (pData.rattle * 0.45);
          shakeY = (Math.random() - 0.5) * (pData.rattle * 0.45);
          pData.rattle = Math.max(0, pData.rattle - 1);
        }

        ctx.save();
        ctx.translate(pinBody.position.x + shakeX, pinBody.position.y + shakeY);

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

        // 8. Animated Pulsing Pull Direction Cue OR Lock Badge
        if (isLocked) {
          ctx.save();
          ctx.fillStyle = '#ef4444';
          ctx.font = '900 15px Fredoka, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🔒', ringX, ringY);
          ctx.restore();
        } else {
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
        }

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

      // Draw Gourmet Treats (3D Cheese Triangles, Star Cookies, Hearts, Bacon, Fish, Bones)
      treatBodies.forEach((t) => {
        if (!t.parent) return;
        ctx.save();
        ctx.translate(t.position.x, t.position.y);
        ctx.rotate(t.angle);

        const shape = t.customTreatData?.shape || 'bone';

        if (shape === 'cheese' || shape === 'triangle') {
          // 🧀 3D Swiss Cheese Wedge Triangle
          // Triangular body
          const cheeseGrad = ctx.createLinearGradient(0, -14, 0, 12);
          cheeseGrad.addColorStop(0, '#fef08a'); // sunny yellow highlight
          cheeseGrad.addColorStop(0.35, '#fbb024'); // golden cheddar
          cheeseGrad.addColorStop(0.85, '#f59e0b'); // rich orange
          cheeseGrad.addColorStop(1, '#b45309'); // baked crust base

          ctx.beginPath();
          ctx.moveTo(0, -14);
          ctx.lineTo(13, 11);
          ctx.lineTo(-13, 11);
          ctx.closePath();
          ctx.fillStyle = cheeseGrad;
          ctx.fill();

          // Darker cheese rind base
          ctx.beginPath();
          ctx.moveTo(-13, 11);
          ctx.lineTo(13, 11);
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#92400e';
          ctx.stroke();

          // Outer cheddar bevel stroke
          ctx.lineWidth = 1;
          ctx.strokeStyle = '#d97706';
          ctx.stroke();

          // 3D Swiss Cheese Holes with recessed depth shadow & bottom rim light
          const cheeseHoles = [
            { x: -3, y: 1, rx: 3.5, ry: 3 },
            { x: 4, y: 6, rx: 2.5, ry: 2 },
            { x: -6, y: 7, rx: 2, ry: 2 },
            { x: 1, y: -6, rx: 2, ry: 2.2 },
          ];
          cheeseHoles.forEach((h) => {
            // Shadow base
            ctx.beginPath();
            ctx.ellipse(h.x, h.y, h.rx, h.ry, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#b45309';
            ctx.fill();
            // Dark recessed core
            ctx.beginPath();
            ctx.ellipse(h.x, h.y - 0.5, h.rx * 0.75, h.ry * 0.75, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#78350f';
            ctx.fill();
            // Inner rim light
            ctx.beginPath();
            ctx.arc(h.x, h.y + h.ry * 0.5, h.rx * 0.6, 0.2, Math.PI - 0.2);
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 0.8;
            ctx.stroke();
          });

          // Top apex specular shine
          ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
          ctx.beginPath();
          ctx.arc(0, -10, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (shape === 'star') {
          // ⭐ Baked Golden Star Cookie
          const starGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
          starGrad.addColorStop(0, '#fef08a');
          starGrad.addColorStop(0.6, '#facc15');
          starGrad.addColorStop(1, '#ca8a04');

          ctx.beginPath();
          const spikes = 5;
          const outerR = 13;
          const innerR = 6;
          let rot = (Math.PI / 2) * 3;
          const step = Math.PI / spikes;
          ctx.moveTo(0, -outerR);
          for (let i = 0; i < spikes; i++) {
            let sx = Math.cos(rot) * outerR;
            let sy = Math.sin(rot) * outerR;
            ctx.lineTo(sx, sy);
            rot += step;
            sx = Math.cos(rot) * innerR;
            sy = Math.sin(rot) * innerR;
            ctx.lineTo(sx, sy);
            rot += step;
          }
          ctx.lineTo(0, -outerR);
          ctx.closePath();
          ctx.fillStyle = starGrad;
          ctx.fill();
          ctx.strokeStyle = '#a16207';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Baked cookie center dot
          ctx.fillStyle = '#854d0e';
          ctx.beginPath();
          ctx.arc(0, 0, 2, 0, Math.PI * 2);
          ctx.fill();

          // Little cookie tip perforations
          for (let i = 0; i < 5; i++) {
            const angle = (i * 72 - 90) * (Math.PI / 180);
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * 7.5, Math.sin(angle) * 7.5, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (shape === 'heart') {
          // 💖 Glazed Puppy Heart Biscuit
          ctx.beginPath();
          ctx.moveTo(0, 2);
          ctx.bezierCurveTo(-11, -8, -13, 6, 0, 13);
          ctx.bezierCurveTo(13, 6, 11, -8, 0, 2);
          ctx.closePath();

          const heartGrad = ctx.createLinearGradient(0, -8, 0, 13);
          heartGrad.addColorStop(0, '#fda4af');
          heartGrad.addColorStop(0.5, '#f43f5e');
          heartGrad.addColorStop(1, '#be123c');
          ctx.fillStyle = heartGrad;
          ctx.fill();
          ctx.strokeStyle = '#9f1239';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // White icing bone sprinkle
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.beginPath();
          ctx.roundRect(-4, 3, 8, 2.5, 1);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(-4, 2.5, 1.6, 0, Math.PI * 2);
          ctx.arc(-4, 5.5, 1.6, 0, Math.PI * 2);
          ctx.arc(4, 2.5, 1.6, 0, Math.PI * 2);
          ctx.arc(4, 5.5, 1.6, 0, Math.PI * 2);
          ctx.fill();
        } else if (shape === 'bacon') {
          // 🥓 Savory Wavy Bacon Chew
          ctx.beginPath();
          ctx.roundRect(-14, -5, 28, 10, 3);
          ctx.fillStyle = '#991b1b';
          ctx.fill();
          ctx.strokeStyle = '#7f1d1d';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Alternating wavy savory fat layers
          ctx.fillStyle = '#fed7aa';
          ctx.beginPath();
          ctx.ellipse(-4, -1, 12, 1.5, 0.05, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(4, 2, 11, 1.3, -0.05, 0, Math.PI * 2);
          ctx.fill();
        } else if (shape === 'fish') {
          // 🐟 Salmon Bite Biscuit
          const fishGrad = ctx.createLinearGradient(-10, 0, 10, 0);
          fishGrad.addColorStop(0, '#fb923c');
          fishGrad.addColorStop(1, '#f97316');
          ctx.fillStyle = fishGrad;
          ctx.beginPath();
          ctx.ellipse(-2, 0, 9, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          // Tail
          ctx.beginPath();
          ctx.moveTo(6, 0);
          ctx.lineTo(13, -6);
          ctx.lineTo(11, 0);
          ctx.lineTo(13, 6);
          ctx.closePath();
          ctx.fillStyle = '#ea580c';
          ctx.fill();

          // Eye
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-6, -2, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(-6.5, -2, 0.9, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // 🦴 Classic Golden Bone with 3D Specular Luster
          const boneGrad = ctx.createLinearGradient(0, -6, 0, 6);
          boneGrad.addColorStop(0, '#fef08a');
          boneGrad.addColorStop(0.5, '#f59e0b');
          boneGrad.addColorStop(1, '#b45309');
          ctx.fillStyle = boneGrad;
          ctx.strokeStyle = '#92400e';
          ctx.lineWidth = 1.2;

          ctx.beginPath();
          ctx.roundRect(-9, -3, 18, 6, 2);
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(-9, -4, 3.5, 0, Math.PI * 2);
          ctx.arc(-9, 4, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(9, -4, 3.5, 0, Math.PI * 2);
          ctx.arc(9, 4, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
          ctx.fillRect(-5, -2, 10, 1.5);
        }

        ctx.restore();
      });

      // Draw Hazards (Mud Sludge / Prickly Thistle Burr)
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
          // Prickly Thistle Burr hazard (8 thorny needles radiating with warning core)
          ctx.fillStyle = '#701a75';
          ctx.beginPath();
          ctx.arc(0, 0, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#a21caf';
          ctx.lineWidth = 2;
          for (let i = 0; i < 8; i++) {
            const a = (i * Math.PI) / 4;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 4, Math.sin(a) * 4);
            ctx.lineTo(Math.cos(a) * 11, Math.sin(a) * 11);
            ctx.stroke();
          }

          // Glowing danger center
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
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

      // Randomly select a bonus round minigame
      const bonusOptions = [
        { id: 'fetch', name: 'Ball Fetch Sprint', emoji: '🎾', desc: 'Dog sprints and leaps after fast bouncing tennis balls!' },
        { id: 'poop', name: 'Poop Patrol Scoop-a-Thon', emoji: '💩', desc: 'Scoop the backyard lawn fast before the poops explode!' },
        { id: 'park', name: 'Lawn Mower Dash', emoji: '🚜', desc: 'Mow fresh grass patches while playful bunnies & squirrels dash by!' },
      ];
      const picked = bonusOptions[Math.floor(Math.random() * bonusOptions.length)];
      setBonusRound(picked);

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
            <div className="kibble-goal-pill" title="Kibbles stacked in puppy's bowl">
              <span>🍖</span>
              <span>
                {kibbleInBowl}/{levelData.requiredKibble}
                {kibbleInBowl >= levelData.kibbles.length ? ' ⭐ All Food Stacked!' : kibbleInBowl >= levelData.requiredKibble ? ' 🐾 Stacking High!' : ' Goal'}
              </span>
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
        {/* Locked Pin Alert Warning Banner */}
        {lockedPinAlert && (
          <div className="locked-pin-banner">
            {lockedPinAlert}
          </div>
        )}

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
                <span style={{ color: '#ff4d6d' }}>
                  {kibbleInBowl}/{levelData.kibbles.length} {kibbleInBowl >= levelData.kibbles.length ? '🌟 (All Food Stacked!)' : 'pellets'} (+{kibbleInBowl * 10} pts)
                </span>
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

            {/* Random Bonus Round Card */}
            {bonusRound && (
              <div className="bonus-round-card">
                <div className="bonus-round-badge">
                  <span>🎁</span>
                  <span>BONUS ROUND UNLOCKED!</span>
                </div>
                <div className="bonus-round-title">
                  {bonusRound.emoji} {bonusRound.name}
                </div>
                <div className="bonus-round-desc">
                  {bonusRound.desc}
                </div>
                <button
                  className="btn-bonus-play"
                  onClick={() => {
                    if (onPlayBonusRound) {
                      onPlayBonusRound(bonusRound.id);
                    }
                  }}
                >
                  <span>🚀</span> Play Bonus Round!
                </button>
              </div>
            )}

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
