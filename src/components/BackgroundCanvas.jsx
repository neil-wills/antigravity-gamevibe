import React, { useEffect, useRef } from 'react';
import '../styles/backgrounds.css';

export default function BackgroundCanvas({ theme = 'hearts', onBackgroundClick }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pool based on theme
    const particles = [];
    const count = theme === 'night' ? 60 : theme === 'hearts' ? 35 : 25;

    // Helper to spawn or reset a particle
    const initParticle = (p = {}) => {
      p.x = Math.random() * width;
      p.y = theme === 'blossom' ? Math.random() * -100 : Math.random() * (height + 50);
      p.size = Math.random() * 14 + 10;
      p.speedY = theme === 'blossom' ? Math.random() * 1.5 + 0.8 : -(Math.random() * 1.2 + 0.5);
      p.speedX = Math.sin(Math.random() * Math.PI * 2) * 0.8;
      p.rotation = Math.random() * Math.PI * 2;
      p.rotationSpeed = (Math.random() - 0.5) * 0.03;
      p.opacity = Math.random() * 0.5 + 0.35;
      p.wobble = Math.random() * 10;
      p.wobbleSpeed = Math.random() * 0.03 + 0.01;
      p.color =
        theme === 'hearts'
          ? ['#ff4d6d', '#ff758f', '#ff8fa3', '#ffb3c1', '#ffffff'][Math.floor(Math.random() * 5)]
          : theme === 'blossom'
          ? ['#ffb7b2', '#ff9aa2', '#ffd3b6', '#ffffff'][Math.floor(Math.random() * 4)]
          : theme === 'night'
          ? ['#ffffff', '#fde047', '#93c5fd', '#c4b5fd'][Math.floor(Math.random() * 4)]
          : '#ffffff';
      return p;
    };

    for (let i = 0; i < count; i++) {
      particles.push(initParticle({}));
    }

    // Interactive burst spawn
    const handleCanvasClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Spawn 6 burst particles at tap/click location
      for (let i = 0; i < 6; i++) {
        particles.push({
          x: clickX,
          y: clickY,
          size: Math.random() * 16 + 12,
          speedY: -(Math.random() * 2.5 + 1.5),
          speedX: (Math.random() - 0.5) * 3,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.05,
          opacity: 0.9,
          wobble: 0,
          wobbleSpeed: 0.05,
          color: theme === 'hearts' ? '#ff3366' : '#ffd166',
          isBurst: true,
        });
      }
      if (onBackgroundClick) onBackgroundClick(e);
    };

    canvas.addEventListener('pointerdown', handleCanvasClick);

    // Draw Heart Helper
    const drawHeart = (ctx, x, y, size, color, opacity, rotation) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(0, topCurveHeight);
      // top left curve
      ctx.bezierCurveTo(-size / 2, -size / 2, -size, topCurveHeight / 3, 0, size);
      // top right curve
      ctx.bezierCurveTo(size, topCurveHeight / 3, size / 2, -size / 2, 0, topCurveHeight);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // Draw Star / Sparkle
    const drawStar = (ctx, x, y, size, color, opacity) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * size, -Math.sin(((18 + i * 72) * Math.PI) / 180) * size);
        ctx.lineTo(
          Math.cos(((54 + i * 72) * Math.PI) / 180) * (size / 2),
          -Math.sin(((54 + i * 72) * Math.PI) / 180) * (size / 2)
        );
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // Main animation loop
    let tick = 0;
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.wobble += p.wobbleSpeed;
        p.x += p.speedX + Math.sin(p.wobble) * 0.4;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        if (p.isBurst) {
          p.opacity -= 0.015;
          if (p.opacity <= 0) {
            particles.splice(i, 1);
            continue;
          }
        }

        // Render shape
        if (theme === 'hearts') {
          drawHeart(ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation);
        } else if (theme === 'night') {
          drawStar(ctx, p.x, p.y, p.size * 0.4, p.color, p.opacity * (0.6 + 0.4 * Math.sin(p.wobble)));
        } else if (theme === 'blossom') {
          // Petal shape
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (theme === 'park') {
          // Floating dandelion seeds / yellow flower sparkles
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.globalAlpha = p.opacity * 0.7;
          ctx.fillStyle = Math.sin(p.wobble) > 0 ? '#ffffff' : '#fde047';
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.25, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          // Cozy warm room dust motes
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.globalAlpha = p.opacity * 0.5;
          ctx.fillStyle = '#fed7aa';
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Reset if out of screen bounds
        if (!p.isBurst) {
          if (p.y < -50 && theme !== 'blossom') {
            p.y = height + 40;
            p.x = Math.random() * width;
          } else if (p.y > height + 50 && theme === 'blossom') {
            p.y = -30;
            p.x = Math.random() * width;
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('pointerdown', handleCanvasClick);
    };
  }, [theme]);

  return (
    <div className={`bg-canvas-container bg-theme-${theme}`}>
      <canvas ref={canvasRef} className="bg-canvas" />
    </div>
  );
}
