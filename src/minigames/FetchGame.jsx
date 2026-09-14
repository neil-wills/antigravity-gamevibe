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

// -------------------------------------------------------------
// Cartoon Bunny & Squirrel Scampering Animation Helpers
// -------------------------------------------------------------

function drawCartoonBunny(ctx, x, y, facing = 1, hopPhase = 0, scale = 1.0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing * scale, scale);

  // Hop vertical offset
  const hopY = -Math.abs(Math.sin(hopPhase)) * 14;
  ctx.translate(0, hopY);

  // Ground shadow below bunny
  const shadowScale = Math.max(0.4, 1 + hopY / 25);
  ctx.save();
  ctx.fillStyle = 'rgba(20, 60, 25, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, -hopY + 12, 16 * shadowScale, 4 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Fluffy white cotton puff tail at rear (-16, 2)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(-16, 2, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Bunny Body (soft creamy white egg shape)
  const bodyGrad = ctx.createRadialGradient(-2, 0, 4, 0, 0, 18);
  bodyGrad.addColorStop(0, '#ffffff');
  bodyGrad.addColorStop(0.7, '#f8fafc');
  bodyGrad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(-2, 4, 16, 12, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Paws
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(-8, 12, 6, 3.5, 0, 0, Math.PI * 2); // back paw
  ctx.ellipse(8, 12, 6, 3.5, 0, 0, Math.PI * 2);  // front paw
  ctx.fill();
  ctx.stroke();

  // Head (round cute sphere)
  const headGrad = ctx.createRadialGradient(10, -8, 2, 10, -8, 14);
  headGrad.addColorStop(0, '#ffffff');
  headGrad.addColorStop(0.8, '#f8fafc');
  headGrad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(10, -6, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cute Long Bunny Ears (bounce with hop!)
  const earWiggle = Math.sin(hopPhase * 2) * 0.15;
  // Back ear
  ctx.save();
  ctx.translate(6, -14);
  ctx.rotate(-0.25 + earWiggle);
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  ctx.ellipse(0, -12, 4.5, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#fbcfe8'; // pink inner ear
  ctx.beginPath();
  ctx.ellipse(0, -11, 2.2, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Front ear
  ctx.save();
  ctx.translate(12, -14);
  ctx.rotate(0.1 - earWiggle);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(0, -13, 4.8, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#f472b6'; // pink inner ear
  ctx.beginPath();
  ctx.ellipse(0, -12, 2.5, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Big Cartoon Eye with glint
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(14, -8, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(15, -9, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Cute Pink Button Nose
  ctx.fillStyle = '#fb7185';
  ctx.beginPath();
  ctx.arc(21, -5, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Whiskers
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(18, -4);
  ctx.lineTo(26, -6);
  ctx.moveTo(18, -3);
  ctx.lineTo(26, -1);
  ctx.stroke();

  // Cute rosy cheek
  ctx.fillStyle = 'rgba(251, 113, 133, 0.4)';
  ctx.beginPath();
  ctx.arc(12, -3, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawCartoonSquirrel(ctx, x, y, facing = 1, runPhase = 0, scale = 1.0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing * scale, scale);

  // scamper bobbing
  const bobY = Math.sin(runPhase * 2) * 3;
  ctx.translate(0, bobY);

  // Ground shadow
  ctx.save();
  ctx.fillStyle = 'rgba(20, 60, 25, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 12, 18, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Giant Bushy Squirrel Tail (curving upwards and forwards, swishing!)
  const tailSwish = Math.sin(runPhase * 2.5) * 0.18;
  ctx.save();
  ctx.translate(-14, 2);
  ctx.rotate(tailSwish);

  // Bushy tail outer gradient
  const tailGrad = ctx.createRadialGradient(-10, -18, 5, -8, -16, 26);
  tailGrad.addColorStop(0, '#f59e0b');
  tailGrad.addColorStop(0.5, '#d97706');
  tailGrad.addColorStop(1, '#92400e');
  ctx.fillStyle = tailGrad;
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-18, -6, -26, -22, -18, -34);
  ctx.bezierCurveTo(-12, -44, 2, -46, 6, -34);
  ctx.bezierCurveTo(9, -24, 4, -14, 0, 0);
  ctx.fill();
  ctx.stroke();

  // Fluffy tail texture highlights
  ctx.strokeStyle = 'rgba(254, 243, 199, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(-10, -28, 8, -Math.PI * 0.5, Math.PI * 0.3);
  ctx.stroke();
  ctx.restore();

  // Squirrel Body (warm reddish-brown / amber)
  const bodyGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 16);
  bodyGrad.addColorStop(0, '#f59e0b');
  bodyGrad.addColorStop(0.8, '#d97706');
  bodyGrad.addColorStop(1, '#b45309');
  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(0, 2, 14, 11, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Creamy belly patch
  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.ellipse(2, 4, 8, 7, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Back leg / paw
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.ellipse(-6, 10, 7, 3.5, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Head (cute round face)
  const headGrad = ctx.createRadialGradient(10, -8, 2, 10, -8, 12);
  headGrad.addColorStop(0, '#f59e0b');
  headGrad.addColorStop(0.8, '#d97706');
  headGrad.addColorStop(1, '#b45309');
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(11, -7, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pointy Squirrel Ears
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.moveTo(6, -14);
  ctx.lineTo(8, -22);
  ctx.lineTo(12, -15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Tuft
  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.moveTo(8, -15);
  ctx.lineTo(9, -19);
  ctx.lineTo(11, -16);
  ctx.closePath();
  ctx.fill();

  // Cartoon Eye with bright twinkle
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(14, -8, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(15, -9, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Cute Little Snout and Nose
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.arc(19, -5, 2, 0, Math.PI * 2);
  ctx.fill();

  // Golden Acorn held in hands! 🌰
  ctx.save();
  ctx.translate(14, 2);
  // Acorn cup
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.ellipse(0, -2, 4.5, 2.8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Acorn nut
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.ellipse(0, 2, 4, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Nut tip
  ctx.fillStyle = '#92400e';
  ctx.beginPath();
  ctx.arc(0, 6, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Tiny Front Paws holding acorn
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.ellipse(12, 1, 3.5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

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
    critter: null, // { type: 'bunny' | 'squirrel', x, y, vx, facing, phase, jumped }
    critterCooldown: 180, // ~3s before first distraction
    critterParticles: [], // running dust puffs
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

  // On-demand or automatic critter spawner (Bunny or Squirrel)
  const spawnCritter = (preferredType = null) => {
    const gs = gameState.current;
    if (gameWon) return;

    if (gs.critter) {
      // If already on screen, give a speed boost & playful chirp!
      gs.critter.vx *= 1.35;
      AudioFX.playCritterSqueak();
      AudioFX.playBreedBark(selectedBreed);
      return;
    }

    const type = preferredType || (Math.random() < 0.5 ? 'squirrel' : 'bunny');
    const fromLeft = Math.random() < 0.5;
    const x = fromLeft ? -35 : gs.width + 35;
    const vx = fromLeft ? 4.2 : -4.2;
    const facing = fromLeft ? 1 : -1;

    gs.critter = {
      type,
      x,
      y: gs.groundY - 14,
      vx,
      facing,
      phase: 0,
      jumped: false,
    };

    AudioFX.playBreedBark(selectedBreed);
    AudioFX.playCritterSqueak();

    // Cute animated speech bubble over dog
    if (type === 'squirrel') {
      const phrases = ['SQUIRREL! 🐿️💨', 'Look, a squirrel! 🌰', 'Woof! SQUIRREL! 🐾', 'Get the squirrel! 🐶'];
      setBarkBubble(phrases[Math.floor(Math.random() * phrases.length)]);
    } else {
      const phrases = ['BUNNY! 🐰💨', 'Hop hop! A bunny! ✨', 'Woof! BUNNY! 🐾', 'Get the bunny! 🥕'];
      setBarkBubble(phrases[Math.floor(Math.random() * phrases.length)]);
    }
    setTimeout(() => setBarkBubble(null), 1600);
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
    gameState.current.critter = null;
    gameState.current.critterCooldown = 180;
    gameState.current.critterParticles = [];
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
      if (gameWon) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) * (width / rect.width);
      const clickY = (e.clientY - rect.top) * (height / rect.height);

      // Check if clicked directly on the critter!
      if (gs.critter) {
        const distToCritter = Math.hypot(clickX - gs.critter.x, clickY - (gs.critter.y - 6));
        if (distToCritter < 45) {
          AudioFX.playCritterSqueak();
          AudioFX.playTreatBonus();
          for (let i = 0; i < 16; i++) {
            const angle = (Math.PI * 2 / 16) * i;
            gs.celebrationParticles.push({
              x: gs.critter.x,
              y: gs.critter.y - 12,
              vx: Math.cos(angle) * (3.5 + Math.random() * 4),
              vy: Math.sin(angle) * (3.5 + Math.random() * 4) - 2,
              color: ['#ffbe0b', '#ec4899', '#00f5d4', '#a855f7'][i % 4],
              life: 1.0,
            });
          }
          onAddPoints(50);
          setScore((s) => s + 50);
          setBarkBubble(
            gs.critter.type === 'squirrel' ? 'Found Squirrel! 🐿️⭐' : 'Pet Bunny! 🐰⭐'
          );
          setTimeout(() => setBarkBubble(null), 1400);
          gs.critter.vx *= 1.6; // playful scamper escape dash!
          return;
        }
      }

      if (gs.ball.active || gs.dog.holdingItem) return;

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

      // Automatic random bunny / squirrel distraction spawner
      if (!gs.critter && !gameWon) {
        gs.critterCooldown--;
        if (gs.critterCooldown <= 0) {
          spawnCritter();
          gs.critterCooldown = 750 + Math.floor(Math.random() * 400); // 12-19s
        }
      }

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

        // 7. Anticipatory Smart Dog AI (Fetch pursuit when NOT distracted by critter)
        const dogSpeed = 8.5; // Fast enough to easily intercept!
        if (!gs.dog.holdingItem && !gs.critter) {
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
        if (!gs.critter) {
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

      // 9. Scampering Cartoon Bunny or Squirrel & Dog Distraction Chase!
      if (gs.critter) {
        // Move critter across the lawn
        gs.critter.x += gs.critter.vx;
        gs.critter.phase += 0.24;

        // Ground dust puffs as critter scampers
        if (gs.tick % 4 === 0) {
          gs.critterParticles.push({
            x: gs.critter.x - gs.critter.facing * 10,
            y: gs.groundY - 4,
            vx: -gs.critter.facing * (0.6 + Math.random() * 0.8),
            vy: -0.4 - Math.random() * 0.7,
            color: 'rgba(215, 235, 180, 0.75)',
            size: 3.5 + Math.random() * 2.5,
            life: 0.6,
          });
        }

        // Render the cartoon animal
        if (gs.critter.type === 'bunny') {
          drawCartoonBunny(ctx, gs.critter.x, gs.critter.y, gs.critter.facing, gs.critter.phase);
        } else {
          drawCartoonSquirrel(ctx, gs.critter.x, gs.critter.y, gs.critter.facing, gs.critter.phase);
        }

        // Dog playfully chases the animal across the grass!
        if (!gameWon) {
          const dogChaseSpeed = 7.8;
          if (gs.dog.x < gs.critter.x - 20) {
            gs.dog.x += dogChaseSpeed;
            gs.dog.facing = 1;
            gs.dog.state = 'walking';
            onAddSteps(1);
          } else if (gs.dog.x > gs.critter.x + 20) {
            gs.dog.x -= dogChaseSpeed;
            gs.dog.facing = -1;
            gs.dog.state = 'walking';
            onAddSteps(1);
          }

          // Close encounter: playful leap and bonus!
          const distToDog = Math.hypot(gs.dog.x - gs.critter.x, (gs.dog.y - 20) - gs.critter.y);
          if (distToDog < 55 && !gs.critter.jumped) {
            gs.critter.jumped = true;
            gs.critter.vx *= 1.45; // Startled scamper burst!
            AudioFX.playCritterSqueak();
            AudioFX.playTreatBonus();

            for (let i = 0; i < 14; i++) {
              const angle = (Math.PI * 2 / 14) * i;
              gs.celebrationParticles.push({
                x: gs.critter.x,
                y: gs.critter.y - 14,
                vx: Math.cos(angle) * (3 + Math.random() * 3),
                vy: Math.sin(angle) * (3 + Math.random() * 3) - 2,
                color: ['#ffbe0b', '#ff006e', '#00f5d4', '#a855f7'][i % 4],
                life: 1.0,
              });
            }

            onAddPoints(25);
            setScore((s) => s + 25);
            setBarkBubble('Almost got it! 🐾✨');
            setTimeout(() => setBarkBubble(null), 1400);
          }
        }

        // Off-screen check
        if (gs.critter.x < -70 || gs.critter.x > width + 70) {
          gs.critter = null;
          gs.critterCooldown = 750 + Math.floor(Math.random() * 400);
          if (!gs.ball.active && !gs.dog.holdingItem) {
            setBarkBubble("Where'd it go?! 🐶🐾");
            setTimeout(() => setBarkBubble(null), 1200);
            gs.dog.state = 'idle';
          }
        }
      }

      // Render Critter Dust Puffs
      for (let i = gs.critterParticles.length - 1; i >= 0; i--) {
        const cp = gs.critterParticles[i];
        cp.x += cp.vx;
        cp.y += cp.vy;
        cp.life -= 0.04;
        ctx.save();
        ctx.globalAlpha = Math.max(0, cp.life);
        ctx.fillStyle = cp.color;
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, cp.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        if (cp.life <= 0) {
          gs.critterParticles.splice(i, 1);
        }
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
        <button
          className="btn-quick-throw btn-throw-critter"
          onClick={() => spawnCritter()}
          disabled={gameWon}
          title="Send a cute bunny or squirrel across the grass to distract your pup!"
        >
          <span>🐿️ Distract Pup!</span>
          <span className="throw-desc">Bunny / Squirrel Chase</span>
        </button>
      </div>
    </div>
  );
}
