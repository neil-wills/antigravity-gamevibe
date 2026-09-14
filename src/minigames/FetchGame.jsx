import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import DogRenderer from '../components/DogRenderer';
import { AudioFX } from '../game/AudioController';
import '../styles/minigames.css';

// -------------------------------------------------------------
// High-Visibility 3D Rendering Helpers for Ball & Frisbee
// -------------------------------------------------------------

function drawTennisBall(ctx, x, y, radius = 16, rot = 0, scale = 1.0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.rotate(rot);

  // Vibrant outer neon glow
  ctx.shadowColor = 'rgba(204, 255, 0, 0.75)';
  ctx.shadowBlur = 12;

  // 3D Spherical Radial Gradient
  const grad = ctx.createRadialGradient(-radius * 0.35, -radius * 0.35, radius * 0.08, 0, 0, radius);
  grad.addColorStop(0, '#faff99'); // Glint highlight
  grad.addColorStop(0.35, '#d4ff00'); // Neon chartreuse core
  grad.addColorStop(0.8, '#99cc00'); // Body shade
  grad.addColorStop(1, '#5c8000'); // Rim shadow

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  // Bright white curved tennis seams
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';

  // Left arc seam
  ctx.beginPath();
  ctx.arc(-radius * 0.6, 0, radius * 0.8, -Math.PI * 0.38, Math.PI * 0.38);
  ctx.stroke();

  // Right arc seam
  ctx.beginPath();
  ctx.arc(radius * 0.6, 0, radius * 0.8, Math.PI * 0.62, Math.PI * 1.38);
  ctx.stroke();

  // Highlight glint dot
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.arc(-radius * 0.35, -radius * 0.35, radius * 0.22, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawFrisbee(ctx, x, y, width = 48, height = 18, tiltAngle = 0, spinRot = 0, scale = 1.0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.rotate(tiltAngle);

  // Vibrant outer neon magenta glow
  ctx.shadowColor = 'rgba(255, 0, 128, 0.75)';
  ctx.shadowBlur = 14;

  // Disc Outer Bevel Gradient
  const grad = ctx.createLinearGradient(0, -height, 0, height);
  grad.addColorStop(0, '#ff4da6');
  grad.addColorStop(0.4, '#ff006e');
  grad.addColorStop(1, '#8c003e');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, width / 2, height / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  // White concentric aerodynamic grip ridges
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 0, width * 0.38, height * 0.38, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, width * 0.24, height * 0.24, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Center golden star emblem
  ctx.save();
  ctx.rotate(spinRot);
  ctx.fillStyle = '#ffbe0b';
  ctx.beginPath();
  ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Dynamic specular highlight along top lip
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, -height * 0.18, width * 0.42, height * 0.25, 0, Math.PI, 0);
  ctx.stroke();

  ctx.restore();
}

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
  const [isThrowActive, setIsThrowActive] = useState(false);

  const GOAL_CATCHES = 5;
  const canvasRef = useRef(null);

  const LAUNCH_X = 95;
  const LAUNCH_Y = 350;
  const GROUND_Y = 420;

  const gameState = useRef({
    ball: {
      x: LAUNCH_X,
      y: LAUNCH_Y,
      vx: 0,
      vy: 0,
      rot: 0,
      spinRot: 0,
      active: false,
      inAir: false,
      trail: [],
    },
    dog: {
      x: 70,
      y: 380,
      vx: 0,
      state: 'idle',
      facing: 1,
      holdingItem: false,
    },
    slingshot: {
      dragging: false,
      startX: LAUNCH_X,
      startY: LAUNCH_Y,
      curX: LAUNCH_X,
      curY: LAUNCH_Y,
      aimVx: 7.0,
      aimVy: -9.0,
    },
    groundY: GROUND_Y,
    width: 600,
    height: 480,
    tick: 0,
    celebrationParticles: [],
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
    setIsThrowActive(false);

    gameState.current.ball = {
      x: LAUNCH_X,
      y: LAUNCH_Y,
      vx: 0,
      vy: 0,
      rot: 0,
      spinRot: 0,
      active: false,
      inAir: false,
      trail: [],
    };
    gameState.current.dog = {
      x: 70,
      y: 380,
      vx: 0,
      state: 'idle',
      facing: 1,
      holdingItem: false,
    };
    gameState.current.celebrationParticles = [];
    setResetCount((c) => c + 1);
  };

  const handleCancelExit = () => {
    AudioFX.playPinSlide();
    onBack();
  };

  // Quick Throw Function (1-Tap, super easy & fun!)
  const doQuickThrow = (type = 'easy') => {
    const gs = gameState.current;
    if (gs.ball.active || gs.dog.holdingItem || gameWon) return;

    let vx, vy;
    if (type === 'easy') {
      // Gentle, high-floating arc that allows pup to easily intercept
      vx = itemType === 'ball' ? 7.2 : 6.4;
      vy = itemType === 'ball' ? -9.5 : -7.2;
    } else if (type === 'long') {
      // Long distance sailing throw
      vx = itemType === 'ball' ? 10.5 : 9.5;
      vy = itemType === 'ball' ? -10.5 : -8.5;
    } else if (type === 'mega') {
      // Sky-high archer with maximum hang time
      vx = itemType === 'ball' ? 8.2 : 7.6;
      vy = itemType === 'ball' ? -13.5 : -11.0;
    }

    gs.ball.active = true;
    gs.ball.inAir = true;
    gs.ball.x = LAUNCH_X;
    gs.ball.y = LAUNCH_Y;
    gs.ball.vx = vx;
    gs.ball.vy = vy;
    gs.ball.rot = 0;
    gs.ball.spinRot = 0;
    gs.ball.trail = [];

    AudioFX.playThrow();
    gs.dog.state = 'walking';
    gs.dog.facing = 1;
    setIsThrowActive(true);
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
      if (gameWon || gs.ball.active || gs.dog.holdingItem) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) * (width / rect.width);
      const clickY = (e.clientY - rect.top) * (height / rect.height);

      gs.slingshot.dragging = true;
      gs.slingshot.startX = clickX;
      gs.slingshot.startY = clickY;
      gs.slingshot.curX = clickX;
      gs.slingshot.curY = clickY;
    };

    const handlePointerMove = (e) => {
      if (!gs.slingshot.dragging || gameWon) return;
      const rect = canvas.getBoundingClientRect();
      gs.slingshot.curX = (e.clientX - rect.left) * (width / rect.width);
      gs.slingshot.curY = (e.clientY - rect.top) * (height / rect.height);

      // Support BOTH slingshot pullback (drag back to shoot forward)
      // AND forward flick (drag forward to fling)
      const dx = gs.slingshot.startX - gs.slingshot.curX;
      const dy = gs.slingshot.startY - gs.slingshot.curY;

      let vx, vy;
      if (gs.slingshot.curX > gs.slingshot.startX + 12) {
        // Forward flick mode
        vx = (gs.slingshot.curX - gs.slingshot.startX) * 0.11;
        vy = (gs.slingshot.curY - gs.slingshot.startY) * 0.11;
      } else {
        // Slingshot pull-back mode
        vx = dx * 0.12;
        vy = dy * 0.12;
      }

      // Safe, fun launch limits
      gs.slingshot.aimVx = Math.max(4.5, Math.min(12.5, vx));
      gs.slingshot.aimVy = Math.min(-4.5, Math.max(-14.0, vy));
    };

    const handlePointerUp = () => {
      if (!gs.slingshot.dragging || gameWon) return;
      gs.slingshot.dragging = false;

      const pullDist = Math.hypot(
        gs.slingshot.startX - gs.slingshot.curX,
        gs.slingshot.startY - gs.slingshot.curY
      );

      // Require a small gesture, or execute default easy toss
      if (pullDist > 14) {
        gs.ball.active = true;
        gs.ball.inAir = true;
        gs.ball.x = LAUNCH_X;
        gs.ball.y = LAUNCH_Y;
        gs.ball.vx = gs.slingshot.aimVx;
        gs.ball.vy = gs.slingshot.aimVy;
        gs.ball.rot = 0;
        gs.ball.spinRot = 0;
        gs.ball.trail = [];

        AudioFX.playThrow();
        gs.dog.state = 'walking';
        gs.dog.facing = 1;
        setIsThrowActive(true);
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // Main Game Loop
    const loop = () => {
      ctx.clearRect(0, 0, width, height);
      gs.tick++;

      // 1. Sky & Sun Atmosphere
      const skyGrad = ctx.createLinearGradient(0, 0, 0, gs.groundY);
      skyGrad.addColorStop(0, '#38bdf8'); // Sunny azure sky
      skyGrad.addColorStop(0.7, '#bae6fd');
      skyGrad.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, gs.groundY);

      // Warm Sun in upper right
      ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
      ctx.beginPath();
      ctx.arc(520, 70, 55, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(520, 70, 32, 0, Math.PI * 2);
      ctx.fill();

      // Soft Fluffy Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      const drawCloud = (cx, cy, r) => {
        ctx.beginPath();
        ctx.arc(cx - r * 0.8, cy + 2, r * 0.7, 0, Math.PI * 2);
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.arc(cx + r * 0.8, cy + 2, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
      };
      drawCloud(150, 75, 28);
      drawCloud(370, 95, 22);

      // Rolling Hills Backdrop
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.moveTo(0, gs.groundY);
      ctx.quadraticCurveTo(180, gs.groundY - 50, 360, gs.groundY - 20);
      ctx.quadraticCurveTo(480, gs.groundY - 45, width, gs.groundY - 15);
      ctx.lineTo(width, gs.groundY);
      ctx.closePath();
      ctx.fill();

      // 2. Lush Green Grass Lawn
      const grassGrad = ctx.createLinearGradient(0, gs.groundY, 0, height);
      grassGrad.addColorStop(0, '#22c55e'); // Vibrant park grass
      grassGrad.addColorStop(0.15, '#16a34a');
      grassGrad.addColorStop(1, '#15803d');
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, gs.groundY, width, height - gs.groundY);

      // Grass Edge Detail Line
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, gs.groundY);
      ctx.lineTo(width, gs.groundY);
      ctx.stroke();

      // Scattered cute little flower blossoms on the grass
      const flowers = [
        { x: 50, y: 440, color: '#fef08a' },
        { x: 190, y: 455, color: '#f472b6' },
        { x: 320, y: 435, color: '#ffffff' },
        { x: 450, y: 460, color: '#fef08a' },
        { x: 560, y: 445, color: '#a78bfa' },
      ];
      flowers.forEach((f) => {
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Launch Stand / Wooden Slingshot Structure (x: 95, y: 350)
      const postX = 95;
      const standBaseY = gs.groundY;

      // Wooden Pedestal
      ctx.fillStyle = '#78350f'; // Dark wood
      ctx.fillRect(postX - 10, 365, 20, standBaseY - 365);
      ctx.fillStyle = '#92400e'; // Light wood highlight
      ctx.fillRect(postX - 7, 365, 6, standBaseY - 365);

      // Slingshot Left & Right Prongs
      const prongLeft = { x: postX - 18, y: 335 };
      const prongRight = { x: postX + 18, y: 335 };

      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(postX, 365);
      ctx.lineTo(prongLeft.x, prongLeft.y);
      ctx.moveTo(postX, 365);
      ctx.lineTo(prongRight.x, prongRight.y);
      ctx.stroke();

      // Slingshot Elastic Tension Bands
      const isAiming = gs.slingshot.dragging && !gameWon;
      const pullDx = isAiming ? gs.slingshot.startX - gs.slingshot.curX : 0;
      const pullDy = isAiming ? gs.slingshot.startY - gs.slingshot.curY : 0;

      const pocketX = isAiming ? LAUNCH_X - pullDx * 0.45 : LAUNCH_X;
      const pocketY = isAiming ? LAUNCH_Y - pullDy * 0.45 : LAUNCH_Y;

      ctx.strokeStyle = '#ef4444'; // Red rubber band
      ctx.lineWidth = isAiming ? 3 : 4;
      ctx.beginPath();
      ctx.moveTo(prongLeft.x, prongLeft.y);
      ctx.lineTo(pocketX, pocketY);
      ctx.moveTo(prongRight.x, prongRight.y);
      ctx.lineTo(pocketX, pocketY);
      ctx.stroke();

      // 4. Predictive Parabolic Trajectory Arc (when aiming)
      if (isAiming) {
        const gravity = itemType === 'ball' ? 0.32 : 0.14;
        const trajVx = gs.slingshot.aimVx;
        const trajVy = gs.slingshot.aimVy;

        let landingX = LAUNCH_X;
        ctx.save();
        for (let step = 1; step <= 20; step++) {
          const t = step * 1.8;
          const px = LAUNCH_X + trajVx * t;
          const py = LAUNCH_Y + trajVy * t + 0.5 * gravity * t * t;

          if (py >= gs.groundY - 10) {
            landingX = px;
            break;
          }

          // Glowing trajectory dots
          ctx.fillStyle = step % 2 === 0 ? '#ffbe0b' : '#00f5d4';
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Pulsing Landing Target Reticle on the grass
        const pulse = Math.sin(gs.tick * 0.15) * 4;
        ctx.save();
        ctx.strokeStyle = '#ff006e';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.ellipse(landingX, gs.groundY - 3, 24 + pulse, 7 + pulse * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ff006e';
        ctx.font = 'bold 11px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎯 CATCH ZONE', landingX, gs.groundY + 16);
        ctx.restore();
      }

      // 5. Item State 1: Ready to Throw (sitting visibly on the launch stand)
      if (!gs.ball.active && !gs.dog.holdingItem) {
        if (itemType === 'ball') {
          drawTennisBall(ctx, pocketX, pocketY, 16, gs.tick * 0.02);
        } else {
          drawFrisbee(ctx, pocketX, pocketY, 48, 18, 0, gs.tick * 0.05);
        }

        // Bouncing "Drag or Tap to Throw!" helper indicator above launcher
        if (!isAiming) {
          const bounceY = Math.sin(gs.tick * 0.1) * 5;
          ctx.save();
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#2b2b2b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(LAUNCH_X - 60, LAUNCH_Y - 50 + bounceY, 120, 26, 12);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#d97706';
          ctx.font = 'bold 12px Fredoka, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('👆 Throw Here!', LAUNCH_X, LAUNCH_Y - 33 + bounceY);
          ctx.restore();
        }
      }

      // 6. Item State 2: In Flight
      if (gs.ball.active) {
        const gravity = itemType === 'ball' ? 0.32 : 0.14; // Frisbee glides gracefully!
        gs.ball.x += gs.ball.vx;
        gs.ball.y += gs.ball.vy;
        gs.ball.vy += gravity;
        gs.ball.vx *= 0.996;
        gs.ball.rot += gs.ball.vx * 0.07;
        gs.ball.spinRot += 0.25;

        // Save motion trail
        gs.ball.trail.push({ x: gs.ball.x, y: gs.ball.y });
        if (gs.ball.trail.length > 7) gs.ball.trail.shift();

        // Bounce on ground
        if (gs.ball.y >= gs.groundY - 14) {
          gs.ball.y = gs.groundY - 14;
          gs.ball.vy = -gs.ball.vy * 0.52;
          gs.ball.vx *= 0.8;
          if (Math.abs(gs.ball.vy) < 1.0) {
            gs.ball.inAir = false;
          }
        }

        // Right edge bound
        if (gs.ball.x > width - 24) {
          gs.ball.x = width - 24;
          gs.ball.vx = -gs.ball.vx * 0.5;
        }

        // Draw Dynamic Ground Shadow
        const heightAboveGround = Math.max(0, gs.groundY - gs.ball.y);
        const shadowScale = Math.max(0.25, 1 - heightAboveGround / 360);
        ctx.save();
        ctx.fillStyle = `rgba(15, 60, 20, ${0.4 * shadowScale})`;
        ctx.beginPath();
        const shadowWidth = (itemType === 'ball' ? 22 : 36) * shadowScale;
        ctx.ellipse(gs.ball.x, gs.groundY - 3, shadowWidth, 5 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Draw Motion Trail Streaks
        ctx.save();
        gs.ball.trail.forEach((pt, idx) => {
          const alpha = (idx + 1) / gs.ball.trail.length * 0.45;
          ctx.fillStyle = itemType === 'ball' ? `rgba(204, 255, 0, ${alpha})` : `rgba(255, 0, 110, ${alpha})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, (itemType === 'ball' ? 8 : 12) * (idx / gs.ball.trail.length), 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();

        // Draw Large, High-Contrast Flying Ball or Frisbee
        if (itemType === 'ball') {
          drawTennisBall(ctx, gs.ball.x, gs.ball.y, 16, gs.ball.rot);
        } else {
          const tilt = Math.atan2(gs.ball.vy, gs.ball.vx) * 0.35;
          drawFrisbee(ctx, gs.ball.x, gs.ball.y, 48, 18, tilt, gs.ball.spinRot);
        }

        // 7. Anticipatory Smart Dog AI (Fast & Easy to Catch!)
        const dogSpeed = 8.5; // Fast enough to easily intercept!
        if (!gs.dog.holdingItem) {
          // Dog runs towards the ball
          if (gs.dog.x < gs.ball.x - 10) {
            gs.dog.x += dogSpeed;
            gs.dog.facing = 1;
            onAddSteps(1);
          } else if (gs.dog.x > gs.ball.x + 10) {
            gs.dog.x -= dogSpeed;
            gs.dog.facing = -1;
            onAddSteps(1);
          }

          // Generous Catch Hitbox (Super easy & fun!)
          const dist = Math.hypot(gs.dog.x - gs.ball.x, gs.dog.y - 25 - gs.ball.y);
          const isGroundedNear = gs.ball.y >= gs.groundY - 24 && Math.abs(gs.dog.x - gs.ball.x) < 85;

          if (dist < 70 || isGroundedNear) {
            // CAUGHT!
            gs.dog.holdingItem = true;
            gs.ball.active = false;
            setIsThrowActive(false);

            AudioFX.playCatch();
            AudioFX.playBreedBark(selectedBreed);

            // Trigger celebration sparkle burst
            for (let i = 0; i < 16; i++) {
              const angle = (Math.PI * 2 / 16) * i;
              gs.celebrationParticles.push({
                x: gs.dog.x,
                y: gs.dog.y - 25,
                vx: Math.cos(angle) * (3 + Math.random() * 4),
                vy: Math.sin(angle) * (3 + Math.random() * 4) - 2,
                color: ['#ffbe0b', '#ff006e', '#00f5d4', '#ccff00'][i % 4],
                life: 1.0,
              });
            }

            onAddPoints(50);
            setScore((s) => s + 50);

            // Cheerful catch bubble
            const catchQuotes = ['Pawsome catch! 🎾', 'Got it! 🐾', 'Good boy! ✨', 'Super dog! 🦴'];
            setBarkBubble(catchQuotes[Math.floor(Math.random() * catchQuotes.length)]);
            setTimeout(() => setBarkBubble(null), 1400);

            setCatches((prev) => {
              const next = prev + 1;
              if (next >= GOAL_CATCHES) {
                setGameWon(true);
                AudioFX.playWinFanfare();
                confetti({
                  particleCount: 100,
                  spread: 80,
                  origin: { y: 0.6 },
                });
              }
              return next;
            });
          }
        }
      }

      // 8. Item State 3: Held in Dog's Mouth While Trotting Back!
      if (gs.dog.holdingItem) {
        const returnTargetX = 80;
        if (gs.dog.x > returnTargetX) {
          gs.dog.x -= 5.0;
          gs.dog.facing = -1;
          onAddSteps(1);
        } else {
          // Returned successfully!
          gs.dog.holdingItem = false;
          gs.dog.state = 'idle';
          gs.dog.facing = 1;
          setIsThrowActive(false);
        }

        // Draw the item visibly in the dog's mouth!
        const mouthX = gs.dog.x + (gs.dog.facing === 1 ? 30 : -30);
        const mouthY = gs.groundY - 44;
        if (itemType === 'ball') {
          drawTennisBall(ctx, mouthX, mouthY, 13, 0);
        } else {
          drawFrisbee(ctx, mouthX, mouthY, 38, 14, 0.1, 0);
        }

        // Sparkle above dog
        ctx.fillStyle = '#ffbe0b';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('✨', gs.dog.x, mouthY - 24);
      }

      // 9. Render Celebration Particles
      for (let i = gs.celebrationParticles.length - 1; i >= 0; i--) {
        const p = gs.celebrationParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life -= 0.035;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.life <= 0) {
          gs.celebrationParticles.splice(i, 1);
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
            <span>{itemType === 'ball' ? '🎾' : '🥏'} Goal:</span>
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

      {/* 1-Tap Quick Throw Controls Dock (Easy, Fun, Accessible!) */}
      <div className="fetch-throw-dock">
        <button
          className="btn-quick-throw btn-throw-easy"
          onClick={() => doQuickThrow('easy')}
          disabled={isThrowActive || gameWon}
          title="Gentle, high floating toss - super easy for pup to catch!"
        >
          <span>🎯 Easy Lob</span>
          <span className="throw-desc">Gentle & High (Best for Pup)</span>
        </button>
        <button
          className="btn-quick-throw btn-throw-long"
          onClick={() => doQuickThrow('long')}
          disabled={isThrowActive || gameWon}
          title="Fast, long distance throw across the field!"
        >
          <span>🚀 Long Throw</span>
          <span className="throw-desc">Far & Fast</span>
        </button>
        <button
          className="btn-quick-throw btn-throw-mega"
          onClick={() => doQuickThrow('mega')}
          disabled={isThrowActive || gameWon}
          title="Sky-high archer with maximum hang time!"
        >
          <span>⭐ Mega Launch</span>
          <span className="throw-desc">High Float</span>
        </button>
      </div>
    </div>
  );
}
