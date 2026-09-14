import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import DogRenderer from '../components/DogRenderer';
import { AudioFX } from '../game/AudioController';
import '../styles/minigames.css';

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
  const [barkBubble, setBarkBubble] = useState(null);
  const [showDpad, setShowDpad] = useState(false);
  const [dogPos, setDogPos] = useState({ x: 535, y: 410, state: 'idle', flip: true });

  const critterState = useRef({
    critter: null,
    timer: 180, // ~3s before first spontaneous critter distraction
  });

  const handleDogBark = (e) => {
    if (e) e.stopPropagation();
    AudioFX.playBreedBark(selectedBreed);
    const phrases = ['Good job! 🐾', 'Woof! 🚜', 'Clean lawn! 🌻', 'Ruff! ✨', 'Yip! 🐶'];
    setBarkBubble(phrases[Math.floor(Math.random() * phrases.length)]);
    setTimeout(() => setBarkBubble(null), 1200);
  };

  // On-demand or automatic critter spawner for the garden
  const spawnCritter = (preferredType = null) => {
    const cs = critterState.current;
    if (gameWon) return;

    if (cs.critter) {
      cs.critter.vx *= 1.35;
      AudioFX.playCritterSqueak();
      AudioFX.playBreedBark(selectedBreed);
      return;
    }

    const type = preferredType || (Math.random() < 0.5 ? 'squirrel' : 'bunny');
    const fromLeft = Math.random() < 0.5;
    const x = fromLeft ? -35 : 635;
    const y = Math.random() * 220 + 90;
    const vx = fromLeft ? 3.6 : -3.6;
    const facing = fromLeft ? 1 : -1;

    cs.critter = {
      type,
      x,
      y,
      vx,
      facing,
      phase: 0,
      jumped: false,
    };

    AudioFX.playBreedBark(selectedBreed);
    AudioFX.playCritterSqueak();

    if (type === 'squirrel') {
      const phrases = ['SQUIRREL! 🐿️💨', 'Look, a squirrel! 🌰', 'Woof! SQUIRREL! 🐾', 'Get the squirrel! 🐶'];
      setBarkBubble(phrases[Math.floor(Math.random() * phrases.length)]);
    } else {
      const phrases = ['BUNNY! 🐰💨', 'Hop hop! A bunny! ✨', 'Woof! BUNNY! 🐾', 'Get the bunny! 🥕'];
      setBarkBubble(phrases[Math.floor(Math.random() * phrases.length)]);
    }
    setTimeout(() => setBarkBubble(null), 1600);
  };

  const TOTAL_GOAL_POOPS = 10;
  const canvasRef = useRef(null);

  // Mower game state
  const mowerState = useRef({
    x: 250,
    y: 220,
    angle: 0,
    speed: 0,
    turn: 0,
    target: null, // { x, y } for point-and-click mouse steering
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
    mowerState.current.target = null;
    critterState.current.critter = null;
    critterState.current.timer = 180;
    setDogPos({ x: 535, y: 410, state: 'idle', flip: true });
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

      // Point & Click Mouse Steering Listeners
      let isPointerDown = false;

      const handlePointerDown = (e) => {
        if (gameWon) return;
        const rect = canvas.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) * (width / rect.width);
        const clickY = (e.clientY - rect.top) * (height / rect.height);

        // Check if clicked directly on the critter!
        const cs = critterState.current;
        if (cs.critter) {
          const cDist = Math.hypot(clickX - cs.critter.x, clickY - cs.critter.y);
          if (cDist < 42) {
            AudioFX.playCritterSqueak();
            AudioFX.playTreatBonus();
            onAddPoints(50);
            setScore((s) => s + 50);
            setBarkBubble(
              cs.critter.type === 'squirrel' ? 'Found Squirrel! 🐿️⭐' : 'Pet Bunny! 🐰⭐'
            );
            setTimeout(() => setBarkBubble(null), 1400);
            cs.critter.vx *= 1.6;
            return;
          }
        }

        isPointerDown = true;
        ms.target = { x: clickX, y: clickY };
      };

      const handlePointerMove = (e) => {
        if (!isPointerDown || gameWon) return;
        const rect = canvas.getBoundingClientRect();
        const curX = (e.clientX - rect.left) * (width / rect.width);
        const curY = (e.clientY - rect.top) * (height / rect.height);
        ms.target = { x: curX, y: curY };
      };

      const handlePointerUp = () => {
        isPointerDown = false;
      };

      canvas.addEventListener('pointerdown', handlePointerDown);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);

      // Loop for Mower Mode
      const mowerLoop = () => {
        ctx.clearRect(0, 0, width, height);

        // Control handling if game not won
        if (!gameWon) {
          const keys = ms.activeKeys;
          const hasManualKey =
            keys['arrowup'] || keys['w'] ||
            keys['arrowdown'] || keys['s'] ||
            keys['arrowleft'] || keys['a'] ||
            keys['arrowright'] || keys['d'];

          if (hasManualKey) {
            // Manual keyboard control overrides mouse target
            ms.target = null;
            const maxSpeed = 3.8;
            if (keys['arrowup'] || keys['w']) ms.speed = Math.min(ms.speed + 0.22, maxSpeed);
            else if (keys['arrowdown'] || keys['s']) ms.speed = Math.max(ms.speed - 0.22, -maxSpeed * 0.6);
            else ms.speed *= 0.92;

            if (keys['arrowleft'] || keys['a']) ms.angle -= 0.058;
            if (keys['arrowright'] || keys['d']) ms.angle += 0.058;
          } else if (ms.target) {
            // Point & Click Mouse Steering
            const dx = ms.target.x - ms.x;
            const dy = ms.target.y - ms.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 15) {
              const targetAngle = Math.atan2(dy, dx);
              let diffAngle = targetAngle - ms.angle;

              // Normalize diffAngle to [-PI, PI]
              while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;
              while (diffAngle < -Math.PI) diffAngle += Math.PI * 2;

              // Smooth turning towards mouse target
              const turnSpeed = Math.min(Math.abs(diffAngle), 0.095);
              ms.angle += Math.sign(diffAngle) * turnSpeed;

              // Forward acceleration aligned with steering
              const align = Math.max(0.4, Math.cos(diffAngle));
              const targetMaxSpeed = Math.min(4.2, dist * 0.15);
              ms.speed = Math.min(ms.speed + 0.25, targetMaxSpeed * align);
            } else {
              // Reached target point
              ms.speed *= 0.75;
              if (!isPointerDown) {
                ms.target = null;
              }
            }
          } else {
            // Natural coasting deceleration
            ms.speed *= 0.92;
          }

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

        // Draw Point & Click Mouse Target Indicator on Lawn
        if (ms.target && !gameWon) {
          ctx.save();
          // Dotted guide line from mower to target
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = 2.2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(ms.x, ms.y);
          ctx.lineTo(ms.target.x, ms.target.y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Animated pulsing mowing beacon
          const pulse = Math.sin(Date.now() * 0.009) * 3.5;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 10;
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(ms.target.x, ms.target.y, 14 + pulse, 0, Math.PI * 2);
          ctx.stroke();

          // Center crosshair dot
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(ms.target.x, ms.target.y, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
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

        // Scampering Critter (Bunny or Squirrel) in Garden
        const cs = critterState.current;
        if (!cs.critter && !gameWon) {
          cs.timer--;
          if (cs.timer <= 0) {
            spawnCritter();
            cs.timer = 800 + Math.floor(Math.random() * 400); // 13-20s
          }
        }

        if (cs.critter) {
          cs.critter.x += cs.critter.vx;
          cs.critter.phase += 0.22;

          if (cs.critter.type === 'bunny') {
            drawCartoonBunny(ctx, cs.critter.x, cs.critter.y, cs.critter.facing, cs.critter.phase, 0.85);
          } else {
            drawCartoonSquirrel(ctx, cs.critter.x, cs.critter.y, cs.critter.facing, cs.critter.phase, 0.85);
          }

          // Lawnmower proximity reaction (critter startled hop)
          const mDist = Math.hypot(ms.x - cs.critter.x, ms.y - cs.critter.y);
          if (mDist < 60 && !cs.critter.mowerFright) {
            cs.critter.mowerFright = true;
            cs.critter.vx *= 1.4;
            AudioFX.playCritterSqueak();
          }

          // Dog spectator runs out across the garden to playfully chase the animal!
          if (!gameWon) {
            setDogPos((prev) => {
              const dx = cs.critter.x - prev.x;
              const dy = cs.critter.y - prev.y;
              const dist = Math.hypot(dx, dy);

              if (dist < 50 && !cs.critter.dogBonus) {
                cs.critter.dogBonus = true;
                cs.critter.vx *= 1.35;
                AudioFX.playTreatBonus();
                onAddPoints(25);
                setScore((s) => s + 25);
                setBarkBubble('Almost got it! 🐶✨');
                setTimeout(() => setBarkBubble(null), 1200);
              }

              const spd = 4.8;
              return {
                x: prev.x + (Math.abs(dx) > 12 ? Math.sign(dx) * spd : 0),
                y: prev.y + (Math.abs(dy) > 12 ? Math.sign(dy) * spd * 0.75 : 0),
                state: 'walking',
                flip: dx < 0,
              };
            });
          }

          // Off-screen check
          if (cs.critter.x < -60 || cs.critter.x > width + 60) {
            cs.critter = null;
            cs.timer = 800 + Math.floor(Math.random() * 400);
            setDogPos({ x: 535, y: 410, state: 'idle', flip: true });
          }
        }

        animId = requestAnimationFrame(mowerLoop);
      };

      mowerLoop();

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        canvas.removeEventListener('pointerdown', handlePointerDown);
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        AudioFX.stopMower();
      };
    } else {
      // MODE: POOP SCOOPER (Tap & Scoop before they explode!)
      AudioFX.stopMower();
      const ss = scooperState.current;
      ss.poops = [];
      ss.explosions = [];
      ss.splats = [];

      // Helper function to spawn a timed poop on the grass
      const spawnScooperPoop = (id = Date.now() + Math.random(), initialStagger = 0) => {
        const baseTimer = 400 + Math.floor(Math.random() * 180); // ~6.5s to 9.5s
        const timer = baseTimer + initialStagger;
        ss.poops.push({
          id,
          x: Math.random() * (width - 140) + 70,
          y: Math.random() * (height - 140) + 70,
          scale: 1,
          timer,
          maxTimer: timer,
        });
      };

      // Spawn initial 5 poops with staggered fuses
      for (let i = 0; i < 5; i++) {
        spawnScooperPoop(i, i * 85);
      }

      const handleCanvasClick = (e) => {
        if (gameWon) return;
        const rect = canvas.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) * (width / rect.width);
        const clickY = (e.clientY - rect.top) * (height / rect.height);

        // Check if clicked directly on the critter!
        const cs = critterState.current;
        if (cs.critter) {
          const cDist = Math.hypot(clickX - cs.critter.x, clickY - cs.critter.y);
          if (cDist < 42) {
            AudioFX.playCritterSqueak();
            AudioFX.playTreatBonus();
            onAddPoints(50);
            setScore((s) => s + 50);
            setBarkBubble(
              cs.critter.type === 'squirrel' ? 'Found Squirrel! 🐿️⭐' : 'Pet Bunny! 🐰⭐'
            );
            setTimeout(() => setBarkBubble(null), 1400);
            cs.critter.vx *= 1.6;
            return;
          }
        }

        for (let i = ss.poops.length - 1; i >= 0; i--) {
          const p = ss.poops[i];
          const dist = Math.hypot(p.x - clickX, p.y - clickY);
          if (dist < 38) {
            // SCOOPED IN TIME! 🧹✨
            ss.poops.splice(i, 1);
            AudioFX.playScoop();

            // Golden sparkling clean burst!
            for (let k = 0; k < 16; k++) {
              const ang = (Math.PI * 2 * k) / 16 + Math.random() * 0.3;
              const spd = Math.random() * 4 + 2;
              ss.explosions.push({
                x: p.x,
                y: p.y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                size: Math.random() * 5 + 3,
                color: ['#ffbe0b', '#38bdf8', '#4ade80', '#ffffff', '#ec4899'][k % 5],
                life: 1.0,
                decay: 0.035,
              });
            }

            ss.splats.push({
              x: p.x,
              y: p.y - 18,
              text: '✨ SCOOPED! +50',
              life: 1.0,
            });

            onAddPoints(50);
            setScore((s) => s + 50);

            setPoopsCleared((prevCleared) => {
              const next = prevCleared + 1;
              if (next >= TOTAL_GOAL_POOPS) {
                setGameWon(true);
                AudioFX.playWinFanfare();
                confetti({
                  particleCount: 90,
                  spread: 80,
                  origin: { y: 0.6 },
                });
              } else {
                // Keep active poop count healthy until goal reached
                if (ss.poops.length < 4) {
                  spawnScooperPoop();
                }
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

        // 1. Lush Green Grass Lawn Background
        const lawnGrad = ctx.createLinearGradient(0, 0, 0, height);
        lawnGrad.addColorStop(0, '#22c55e'); // Vibrant emerald green
        lawnGrad.addColorStop(0.5, '#16a34a'); // Rich lawn green
        lawnGrad.addColorStop(1, '#15803d'); // Deep garden grass
        ctx.fillStyle = lawnGrad;
        ctx.fillRect(0, 0, width, height);

        // 2. Freshly Mowed Lawn Stripes (Realistic Backyard Turf)
        const stripeWidth = 44;
        for (let x = 0; x < width; x += stripeWidth) {
          const isLight = Math.floor(x / stripeWidth) % 2 === 0;
          ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)';
          ctx.fillRect(x, 0, stripeWidth, height);
        }

        // 3. Delicate Grass Tufts across the lawn
        const grassTufts = [
          { x: 45, y: 55 }, { x: 120, y: 110 }, { x: 230, y: 70 }, { x: 340, y: 130 },
          { x: 470, y: 65 }, { x: 550, y: 120 }, { x: 80, y: 220 }, { x: 190, y: 280 },
          { x: 290, y: 210 }, { x: 410, y: 260 }, { x: 520, y: 240 }, { x: 60, y: 390 },
          { x: 160, y: 440 }, { x: 270, y: 380 }, { x: 390, y: 430 }, { x: 490, y: 370 },
        ];
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 1.6;
        grassTufts.forEach(t => {
          ctx.beginPath();
          ctx.moveTo(t.x, t.y);
          ctx.lineTo(t.x - 3, t.y - 8);
          ctx.moveTo(t.x, t.y);
          ctx.lineTo(t.x, t.y - 10);
          ctx.moveTo(t.x, t.y);
          ctx.lineTo(t.x + 3, t.y - 8);
          ctx.stroke();
        });

        // 4. Sprinkled Backyard Daisies & Blossoms
        const flowers = [
          { x: 75, y: 85, color: '#fef08a' },
          { x: 210, y: 160, color: '#ffffff' },
          { x: 380, y: 80, color: '#f472b6' },
          { x: 510, y: 175, color: '#ffffff' },
          { x: 130, y: 340, color: '#fef08a' },
          { x: 320, y: 310, color: '#ffffff' },
          { x: 460, y: 420, color: '#f472b6' },
          { x: 230, y: 445, color: '#ffffff' },
        ];
        flowers.forEach(d => {
          ctx.fillStyle = d.color;
          for (let p = 0; p < 5; p++) {
            const ang = (Math.PI * 2 / 5) * p;
            ctx.beginPath();
            ctx.arc(d.x + Math.cos(ang) * 4.5, d.y + Math.sin(ang) * 4.5, 2.8, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.arc(d.x, d.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // 5. Lawn Perimeter Border
        ctx.strokeStyle = 'rgba(21, 128, 61, 0.45)';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, width - 4, height - 4);

        // 6. Update Poop Countdown Timers & Explode if Not Scooped in Time!
        for (let i = ss.poops.length - 1; i >= 0; i--) {
          const p = ss.poops[i];
          if (!gameWon) {
            p.timer--;
          }

          // 💥 DETONATION: TIME RAN OUT WITHOUT SCOOPING!
          if (p.timer <= 0 && !gameWon) {
            AudioFX.playPoopExplosion();

            for (let k = 0; k < 22; k++) {
              const ang = (Math.PI * 2 * k) / 22 + Math.random() * 0.4;
              const spd = Math.random() * 6 + 2.5;
              ss.explosions.push({
                x: p.x,
                y: p.y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                size: Math.random() * 8 + 4,
                color: ['#7f4f24', '#58311e', '#a66a38', '#ef4444', '#f59e0b'][Math.floor(Math.random() * 5)],
                life: 1.0,
                decay: Math.random() * 0.035 + 0.02,
              });
            }

            ss.splats.push({
              x: p.x,
              y: p.y - 18,
              text: '💥 TOO LATE! BOOM!',
              life: 1.0,
            });

            setBarkBubble('Boom! Scoop faster! 🐶💨');
            setTimeout(() => setBarkBubble(null), 1400);

            // Remove exploded poop
            ss.poops.splice(i, 1);

            // Spawn replacement poop with cute toot sound so player can keep playing
            spawnScooperPoop();
            AudioFX.playPoop();
            continue;
          }

          // Draw Poop with dynamic ticking fuse and tremble wobble
          const ratio = Math.max(0, p.timer / p.maxTimer);
          const isUrgent = ratio < 0.35;
          const isCritical = ratio < 0.18;

          // Wobble/tremble shake when fuse is burning down
          let drawX = p.x;
          let drawY = p.y;
          if (isUrgent) {
            const wobbleAmount = (1 - ratio) * 6;
            drawX += Math.sin(Date.now() * 0.045 + p.id) * wobbleAmount;
            drawY += Math.cos(Date.now() * 0.055 + p.id) * (wobbleAmount * 0.5);
          }

          // Glowing countdown fuse ring around poop
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, 25, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
          ctx.fill();

          // Active countdown arc
          const arcColor = ratio > 0.5 ? '#22c55e' : ratio > 0.25 ? '#f59e0b' : '#ef4444';
          ctx.strokeStyle = arcColor;
          ctx.lineWidth = isCritical ? 4.5 : 3.5;
          if (isCritical) {
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 10;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, 25, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
          ctx.stroke();
          ctx.restore();

          // Pulsing warning badge if about to explode
          if (isCritical) {
            ctx.save();
            const flash = Math.sin(Date.now() * 0.018) > 0;
            ctx.font = 'bold 13px Fredoka, sans-serif';
            ctx.fillStyle = flash ? '#ef4444' : '#fde047';
            ctx.textAlign = 'center';
            ctx.fillText('⚠️ EXPLODING!', p.x, p.y - 30);
            ctx.restore();
          }

          // Draw Poop Emoji
          ctx.save();
          ctx.font = isCritical ? '36px sans-serif' : '32px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💩', drawX, drawY);
          ctx.restore();

          // Fly buzzing around
          const flyAngle = Date.now() * 0.007 + p.id;
          const flyX = drawX + Math.cos(flyAngle) * 20;
          const flyY = drawY + Math.sin(flyAngle) * 16;
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(flyX, flyY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // 7. Render Explosion Particles
        for (let i = ss.explosions.length - 1; i >= 0; i--) {
          const ep = ss.explosions[i];
          ep.x += ep.vx;
          ep.y += ep.vy;
          ep.life -= ep.decay;
          if (ep.life <= 0) {
            ss.explosions.splice(i, 1);
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

        // 8. Render Splat Comic Badges
        for (let i = ss.splats.length - 1; i >= 0; i--) {
          const sp = ss.splats[i];
          sp.y -= 0.7;
          sp.life -= 0.03;
          if (sp.life <= 0) {
            ss.splats.splice(i, 1);
          } else {
            ctx.save();
            ctx.globalAlpha = sp.life;
            ctx.font = 'bold 16px Fredoka, sans-serif';
            ctx.fillStyle = sp.text.includes('SCOOPED') ? '#4ade80' : '#ffbe0b';
            ctx.strokeStyle = '#3b1d11';
            ctx.lineWidth = 3;
            ctx.textAlign = 'center';
            ctx.strokeText(sp.text, sp.x, sp.y);
            ctx.fillText(sp.text, sp.x, sp.y);
            ctx.restore();
          }
        }

        // 9. Scampering Critter (Bunny or Squirrel) in Garden
        const cs = critterState.current;
        if (!cs.critter && !gameWon) {
          cs.timer--;
          if (cs.timer <= 0) {
            spawnCritter();
            cs.timer = 800 + Math.floor(Math.random() * 400); // 13-20s
          }
        }

        if (cs.critter) {
          cs.critter.x += cs.critter.vx;
          cs.critter.phase += 0.22;

          if (cs.critter.type === 'bunny') {
            drawCartoonBunny(ctx, cs.critter.x, cs.critter.y, cs.critter.facing, cs.critter.phase, 0.85);
          } else {
            drawCartoonSquirrel(ctx, cs.critter.x, cs.critter.y, cs.critter.facing, cs.critter.phase, 0.85);
          }

          // Dog spectator runs out across the garden to playfully chase the animal!
          if (!gameWon) {
            setDogPos((prev) => {
              const dx = cs.critter.x - prev.x;
              const dy = cs.critter.y - prev.y;
              const dist = Math.hypot(dx, dy);

              if (dist < 50 && !cs.critter.dogBonus) {
                cs.critter.dogBonus = true;
                cs.critter.vx *= 1.35;
                AudioFX.playTreatBonus();
                onAddPoints(25);
                setScore((s) => s + 25);
                setBarkBubble('Almost got it! 🐶✨');
                setTimeout(() => setBarkBubble(null), 1200);
              }

              const spd = 4.8;
              return {
                x: prev.x + (Math.abs(dx) > 12 ? Math.sign(dx) * spd : 0),
                y: prev.y + (Math.abs(dy) > 12 ? Math.sign(dy) * spd * 0.75 : 0),
                state: 'walking',
                flip: dx < 0,
              };
            });
          }

          // Off-screen check
          if (cs.critter.x < -60 || cs.critter.x > width + 60) {
            cs.critter = null;
            cs.timer = 800 + Math.floor(Math.random() * 400);
            setDogPos({ x: 535, y: 410, state: 'idle', flip: true });
          }
        }

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
        <canvas
          ref={canvasRef}
          className="arcade-canvas"
          style={{ cursor: mode === 'mower' ? 'crosshair' : 'pointer' }}
        />

        {/* Dog in garden - Click to Bark or Pet! Runs across grass when critter appears */}
        <div
          className="dog-interactive"
          onClick={handleDogBark}
          style={{
            position: 'absolute',
            left: dogPos.x - 45,
            top: dogPos.y - 45,
            zIndex: 15,
            transition: 'left 0.06s linear, top 0.06s linear',
          }}
          title="Click to hear your pup cheer & bark! 🐶"
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
            state={barkBubble ? 'barking' : gameWon ? 'eating' : dogPos.state}
            flip={dogPos.flip}
            size={90}
          />
        </div>

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
      </div>

      {/* Garden Status Dock - Located completely OUTSIDE the grass arena! */}
      <div className="garden-status-dock">
        <div className="garden-info-pill">
          <span>🌱 Lawn:</span>
          <span style={{ color: '#16a34a' }}>{grassMowedPct}% Mowed</span>
        </div>

        <div className="garden-instruction-text">
          {mode === 'mower'
            ? '🚜 Click or drag grass to drive mower • Arrow Keys / WASD also work!'
            : '🧹 Tap poops to scoop before they explode! ⏱️💥'}
        </div>

        <button
          className="btn-dpad-toggle"
          onClick={() => spawnCritter()}
          disabled={gameWon}
          title="Distract pup with a scampering bunny or squirrel!"
        >
          🐿️ Distract Pup
        </button>

        {mode === 'mower' && !gameWon && (
          <button
            className={`btn-dpad-toggle ${showDpad ? 'active' : ''}`}
            onClick={() => setShowDpad(!showDpad)}
            title="Toggle on-screen arrow buttons below the garden"
          >
            ⌨️ {showDpad ? 'Hide Arrows' : 'Show Arrows'}
          </button>
        )}
      </div>

      {/* Optional External D-Pad Dock Below the Canvas (Never obstructs the grass!) */}
      {mode === 'mower' && showDpad && !gameWon && (
        <div className="external-dpad-dock">
          <button
            className="dpad-btn"
            onPointerDown={() => handleVirtualDir('arrowleft', true)}
            onPointerUp={() => handleVirtualDir('arrowleft', false)}
          >
            ◀ Left
          </button>
          <button
            className="dpad-btn"
            onPointerDown={() => handleVirtualDir('arrowup', true)}
            onPointerUp={() => handleVirtualDir('arrowup', false)}
          >
            ▲ Forward
          </button>
          <button
            className="dpad-btn"
            onPointerDown={() => handleVirtualDir('arrowdown', true)}
            onPointerUp={() => handleVirtualDir('arrowdown', false)}
          >
            ▼ Reverse
          </button>
          <button
            className="dpad-btn"
            onPointerDown={() => handleVirtualDir('arrowright', true)}
            onPointerUp={() => handleVirtualDir('arrowright', false)}
          >
            Right ▶
          </button>
        </div>
      )}
    </div>
  );
}
