import React, { useEffect, useState } from 'react';
import { AudioFX } from '../game/AudioController';

export const DOG_BREEDS = [
  {
    id: 'tuck',
    name: 'Tuck',
    title: 'Mountain Doodle',
    desc: 'Fluffy black & white doodle with curly ears and lots of love!',
    primaryColor: '#1c1917', // Fluffy black
    secondaryColor: '#f8fafc', // Snowy white
    accentColor: '#38302e',
    earType: 'curly-flop',
    tailType: 'fluffy-curl',
    personality: 'Gentle, Cuddly & Snack-Obsessed',
    quotes: [
      'Boop my snoot! 🐾',
      'Is that cheese I smell?! 🧀',
      '10/10 goodest boy! ✨',
      'More cuddles please! 🐶',
      'Ready to vacuum up treats! 😋',
    ],
  },
  {
    id: 'waffles',
    name: 'Waffles',
    title: 'Welsh Corgi',
    desc: 'Low-rider champion with big pointy ears and a bouncy heart!',
    primaryColor: '#e07a2c', // Honey orange
    secondaryColor: '#ffffff',
    accentColor: '#c25e15',
    earType: 'upright',
    tailType: 'stub',
    personality: 'Feisty, Speedy & Super Bouncy',
    quotes: [
      'Low rider, big heart! 💖',
      'Corgi zoomies loading... ⚡',
      'Look at my fluffy drumsticks! 🍗',
      'Throw the ball already! 🎾',
      'Bouncy bouncy bouncy! ✨',
    ],
  },
  {
    id: 'barnaby',
    name: 'Barnaby',
    title: 'Golden Retriever',
    desc: 'The friendliest golden pup who lives for fetch and belly rubs.',
    primaryColor: '#f5b041', // Warm gold
    secondaryColor: '#fdebd0',
    accentColor: '#dc7633',
    earType: 'floppy',
    tailType: 'feathered',
    personality: 'Sunshine Energy & Eternal Best Friend',
    quotes: [
      'I LOVE YOU! AND THE BALL! 🎾💖',
      'Best! Day! Ever! 🌟',
      'Belly rubs required immediately! 🐾',
      'Golden boy at your service! ✨',
      'I caught it! Did you see?! 🏆',
    ],
  },
  {
    id: 'buster',
    name: 'Buster',
    title: 'French Bulldog',
    desc: 'Bat-eared powerhouse who loves naps, snorts, and snacks.',
    primaryColor: '#e2d4c0', // Fawn cream
    secondaryColor: '#f9f6f0',
    accentColor: '#635343',
    earType: 'bat',
    tailType: 'stub',
    personality: 'Goofy, Snorty & Food Motivated',
    quotes: [
      'Snort... snack time yet? 🥓',
      'I didn\'t steal that treat (I did). 🐾',
      'Ears at 100% reception! 🦇',
      'Nap hard, play hard! 💤',
      'Heavy breathing of love! ❤️',
    ],
  },
  {
    id: 'mochi',
    name: 'Mochi',
    title: 'Shiba Inu',
    desc: 'Much cute, very doge! Elegant, foxy, and always smiling.',
    primaryColor: '#d97736', // Sesame tan
    secondaryColor: '#fff5eb',
    accentColor: '#a64d13',
    earType: 'prick',
    tailType: 'curl',
    personality: 'Proud, Sassy & Meme Legend',
    quotes: [
      'Much cute. Very doge. Wow. 🐕',
      'Pet the royal floof. ✨',
      'I accept your tribute of kibble. 🍖',
      'Foxy and fabulous! 🦊',
      'Master of the side-eye! 👀',
    ],
  },
  {
    id: 'coco',
    name: 'Coco',
    title: 'Standard Poodle',
    desc: 'Fancy curly puffs and high IQ. Ready for any puzzle challenge.',
    primaryColor: '#ede0d4', // Apricot cream
    secondaryColor: '#ffffff',
    accentColor: '#ddb892',
    earType: 'poodle-puff',
    tailType: 'pom-pom',
    personality: 'Aristocratic, Clever & Glamorous',
    quotes: [
      'Mind the curls, darling! 🎀',
      'Poodle elegance in motion! 🐩✨',
      'Brains AND beauty! 💅',
      'Only gourmet snacks for me! 🥐',
      'Ready for the runway! 🌟',
    ],
  },
];

export const ACCESSORIES = {
  hats: [
    { id: 'none', name: 'No Hat', icon: '🚫' },
    { id: 'party', name: 'Party Cone', icon: '🎉' },
    { id: 'detective', name: 'Detective Cap', icon: '🕵️' },
    { id: 'crown', name: 'Royal Crown', icon: '👑' },
    { id: 'chef', name: 'Chef Toque', icon: '👨‍🍳' },
    { id: 'beanie', name: 'Cozy Beanie', icon: '🧶' },
    { id: 'aviator', name: 'Aviator Goggles', icon: '🥽' },
  ],
  collars: [
    { id: 'none', name: 'No Collar', icon: '🚫' },
    { id: 'bandana', name: 'Red Bandana', icon: '🧣' },
    { id: 'diamond', name: 'Diamond Collar', icon: '💎' },
    { id: 'bowtie', name: 'Dapper Bowtie', icon: '🎀' },
    { id: 'bell', name: 'Jingle Bell', icon: '🔔' },
  ],
  glasses: [
    { id: 'none', name: 'No Glasses', icon: '🚫' },
    { id: 'sunglasses', name: 'Cool Shades', icon: '🕶️' },
    { id: 'star_glasses', name: 'Star Glasses', icon: '⭐' },
    { id: 'monocle', name: 'Fancy Monocle', icon: '🧐' },
  ],
  boots: [
    { id: 'none', name: 'Bare Paws', icon: '🐾' },
    { id: 'yellow_boots', name: 'Rain Boots', icon: '👢' },
    { id: 'cape', name: 'Hero Cape', icon: '🦸' },
    { id: 'backpack', name: 'Snack Pack', icon: '🎒' },
  ],
};

export default function DogRenderer({
  breedId = 'tuck',
  wardrobe = { hat: 'party', collar: 'bandana', glasses: 'none', boots: 'none' },
  state = 'idle', // 'idle' | 'walking' | 'eating' | 'pooping' | 'barking'
  size = 140,
  flip = false,
  className = '',
  onClick,
}) {
  const [blink, setBlink] = useState(false);
  const [wink, setWink] = useState(false);
  const [headTilt, setHeadTilt] = useState(0);
  const [tailTick, setTailTick] = useState(0);
  const [breathTick, setBreathTick] = useState(0);
  const [isPetted, setIsPetted] = useState(false);
  const [petHearts, setPetHearts] = useState([]);
  const [petThought, setPetThought] = useState(null);

  // Find breed specs
  const breed = DOG_BREEDS.find((b) => b.id === breedId) || DOG_BREEDS[0];

  // Natural breathing cycle
  useEffect(() => {
    const breathInterval = setInterval(() => {
      setBreathTick((b) => (b + 1) % 100);
    }, 40);
    return () => clearInterval(breathInterval);
  }, []);

  const breathScale = 1 + Math.sin(breathTick * 0.1) * 0.022;

  // Natural curiosity head tilts and occasional sweet winks in idle
  useEffect(() => {
    const tiltInterval = setInterval(() => {
      if (state !== 'idle' || isPetted) return;
      const tilts = [0, 11, -9, 0, 14, 0, -11];
      const nextTilt = tilts[Math.floor(Math.random() * tilts.length)];
      setHeadTilt(nextTilt);
      if (Math.random() < 0.28) {
        setWink(true);
        setTimeout(() => setWink(false), 260);
      }
    }, 3200 + Math.random() * 2400);

    return () => clearInterval(tiltInterval);
  }, [state, isPetted]);

  // Natural blinking cycle
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, 3000 + Math.random() * 2200);

    return () => clearInterval(blinkInterval);
  }, []);

  // Tail wag loop - accelerated when happy or petted!
  useEffect(() => {
    const wagSpeed = isPetted ? 55 : state === 'walking' ? 85 : 115;
    const wagInterval = setInterval(() => {
      setTailTick((t) => (t + 1) % 6);
    }, wagSpeed);
    return () => clearInterval(wagInterval);
  }, [isPetted, state]);

  const tailAngles = [-26, -14, 12, 28, 16, -12];
  const currentTailAngle =
    isPetted
      ? tailAngles[tailTick] * 1.8 + 12
      : state === 'eating'
      ? 30
      : state === 'barking'
      ? tailAngles[tailTick] * 1.6 + 8
      : state === 'walking'
      ? tailAngles[tailTick] * 1.3
      : tailAngles[tailTick];

  // Loving interactive petting handler!
  const handlePet = (e) => {
    if (e) e.stopPropagation();
    if (onClick) onClick(e);

    AudioFX.playHappyWhimper();
    setIsPetted(true);
    setHeadTilt(14); // Blissful cuddle lean

    // Spawn floating love particles
    const emojis = ['💖', '✨', '🐾', '⭐', '🥰'];
    const newHearts = Array.from({ length: 5 }).map((_, i) => ({
      id: Date.now() + i,
      emoji: emojis[i % emojis.length],
      x: 35 + i * 16 + (Math.random() * 10 - 5),
      y: 25 + Math.random() * 12,
    }));
    setPetHearts(newHearts);

    // Pick random adorable breed quote
    const qList = breed.quotes || ['Goodest pup! 🐾'];
    setPetThought(qList[Math.floor(Math.random() * qList.length)]);

    setTimeout(() => {
      setIsPetted(false);
      setHeadTilt(0);
      setPetHearts([]);
      setPetThought(null);
    }, 2200);
  };

  return (
    <div
      className={`dog-svg-wrapper ${state === 'barking' ? 'barking' : ''} ${className}`}
      onClick={handlePet}
      title={`Click to pet ${breed.name}! 🐾`}
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: flip ? 'scaleX(-1)' : 'none',
        transition: 'transform 0.2s',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* Floating Petting Hearts & Stars */}
      {petHearts.map((h, i) => (
        <div
          key={h.id}
          style={{
            position: 'absolute',
            left: `${h.x}%`,
            top: `${h.y}%`,
            fontSize: '18px',
            pointerEvents: 'none',
            zIndex: 20,
            animation: `floatUpLove 1.8s ease-out forwards ${i * 0.1}s`,
          }}
        >
          {h.emoji}
        </div>
      ))}

      {/* Floating Breed Thought Bubble */}
      {petThought && (
        <div
          style={{
            position: 'absolute',
            bottom: '102%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#ffffff',
            color: '#1e293b',
            padding: '5px 12px',
            borderRadius: '16px',
            fontSize: '11.5px',
            fontWeight: 'bold',
            fontFamily: 'Fredoka, sans-serif',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.22)',
            border: '2px solid #facc15',
            whiteSpace: 'nowrap',
            zIndex: 25,
            pointerEvents: 'none',
            animation: 'popInPet 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
        >
          {petThought}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '6px solid #facc15',
            }}
          />
        </div>
      )}

      <svg
        viewBox="0 0 160 160"
        width="100%"
        height="100%"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <radialGradient id="tuckSpotGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#2c2a29" />
            <stop offset="100%" stopColor="#141312" />
          </radialGradient>
          <filter id="dogShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Hero Cape (Back layer) */}
        {wardrobe.boots === 'cape' && (
          <path
            d="M 50 85 Q 20 100 15 130 Q 55 125 70 95 Z"
            fill="#e63946"
            stroke="#9d0208"
            strokeWidth="2"
            style={{
              transform: state === 'walking' ? 'rotate(-6deg)' : 'none',
              transformOrigin: '50px 85px',
              transition: 'transform 0.15s',
            }}
          />
        )}

        {/* Tail - Real graceful canine tail */}
        <g
          style={{
            transform: `rotate(${currentTailAngle}deg)`,
            transformOrigin: '48px 104px',
            transition: 'transform 0.11s ease-in-out',
          }}
        >
          {breed.id === 'tuck' ? (
            // Tuck's fluffy doodle plume tail: upward curving with soft curls and snowy white tip!
            <g id="tuckTail">
              {/* Main curved tail plume */}
              <path
                d="M 48 104 C 34 98, 14 84, 12 58 C 12 42, 26 36, 34 46 C 38 56, 44 76, 54 96 Z"
                fill="#1c1917"
              />
              {/* Fluffy fleece tufts along the curve */}
              <circle cx="16" cy="74" r="7" fill="#1c1917" />
              <circle cx="13" cy="62" r="8" fill="#1c1917" />
              <circle cx="16" cy="50" r="8" fill="#1c1917" />
              {/* Fluffy snowy white cloud tip */}
              <path
                d="M 16 52 C 16 36, 32 34, 35 46 C 37 54, 28 62, 21 60 Z"
                fill="#ffffff"
              />
              <circle cx="23" cy="40" r="7.5" fill="#ffffff" />
              <circle cx="31" cy="44" r="6.5" fill="#ffffff" />
              <circle cx="27" cy="52" r="5.5" fill="#f8fafc" />
            </g>
          ) : breed.tailType === 'stub' ? (
            // Corgi / Frenchie cute wagging nub
            <g id="stubTail">
              <ellipse cx="38" cy="104" rx="10" ry="8" fill={breed.primaryColor} />
              <circle cx="32" cy="100" r="5" fill="#ffffff" />
            </g>
          ) : breed.tailType === 'curl' ? (
            // Shiba curled sickle donut tail looping up over the hip
            <g id="shibaTail">
              <path
                d="M 48 104 C 32 94, 16 70, 24 48 C 34 32, 54 40, 46 60 C 40 72, 36 86, 52 96 Z"
                fill={breed.primaryColor}
              />
              <path
                d="M 43 96 C 33 86, 22 68, 28 52 C 34 42, 46 48, 41 60 Z"
                fill="#fff5eb"
              />
            </g>
          ) : breed.tailType === 'pom-pom' ? (
            // Poodle tail with fluffy pom-pom cloud
            <g id="poodleTail">
              <path d="M 47 104 Q 28 84 26 62" stroke={breed.primaryColor} strokeWidth="5.5" strokeLinecap="round" fill="none" />
              <circle cx="26" cy="56" r="13" fill={breed.secondaryColor} stroke={breed.accentColor} strokeWidth="1.5" />
              <circle cx="20" cy="52" r="7" fill={breed.secondaryColor} />
              <circle cx="32" cy="52" r="7" fill={breed.secondaryColor} />
            </g>
          ) : (
            // Barnaby Golden feathery retriever plume tail
            <g id="goldenTail">
              <path
                d="M 48 104 C 32 96, 14 78, 12 54 C 14 42, 28 40, 34 52 C 36 66, 44 84, 53 96 Z"
                fill={breed.primaryColor}
              />
              <path d="M 12 68 Q 5 60 14 54 Q 7 46 17 40 Q 26 36 32 46" fill={breed.accentColor} opacity="0.75" />
              <circle cx="29" cy="46" r="6" fill={breed.primaryColor} />
            </g>
          )}
        </g>

        {/* Dog Main Body */}
        <g filter="url(#dogShadow)">
          {/* Pooping squat transformation vs Normal sitting/walking body */}
          <g
            style={{
              transform:
                state === 'pooping'
                  ? 'translate(0, 10px) scale(1.05, 0.9)'
                  : state === 'walking'
                  ? 'translate(0, -3px)'
                  : `scale(1, ${breathScale})`,
              transformOrigin: '75px 125px',
              transition: 'transform 0.2s',
            }}
          >
            {/* Back Torso */}
            <ellipse
              cx="75"
              cy="108"
              rx="36"
              ry="26"
              fill={breed.id === 'tuck' ? '#1c1917' : breed.primaryColor}
            />

            {/* Breed Body Patches */}
            {breed.id === 'tuck' && (
              // Tuck's white chest blaze & doodle fleece fluff
              <g>
                <path
                  d="M 68 90 Q 88 95 90 120 Q 75 132 60 125 Q 56 100 68 90 Z"
                  fill="#ffffff"
                />
                {/* Wavy curly texture puffs on body */}
                <circle cx="58" cy="98" r="6" fill="#1c1917" />
                <circle cx="68" cy="115" r="5" fill="#f8fafc" />
                <circle cx="85" cy="104" r="7" fill="#1c1917" />
              </g>
            )}

            {breed.id === 'waffles' && (
              // Corgi white chest
              <path d="M 75 92 Q 95 100 90 125 Q 75 130 65 120 Z" fill="#ffffff" />
            )}

            {breed.id === 'mochi' && (
              // Shiba white underside
              <path d="M 68 98 Q 88 105 85 125 Q 70 128 62 118 Z" fill="#fff5eb" />
            )}

            {/* Legs & Paws */}
            {/* Back paws */}
            <ellipse cx="50" cy="130" rx="10" ry="7" fill={breed.id === 'tuck' ? '#ffffff' : breed.accentColor} />
            <ellipse cx="68" cy="132" rx="9" ry="7" fill={breed.id === 'tuck' ? '#1c1917' : breed.primaryColor} />

            {/* Front paws */}
            <g
              style={{
                transform: state === 'walking' ? 'rotate(-8deg)' : 'none',
                transformOrigin: '95px 125px',
                transition: 'transform 0.15s',
              }}
            >
              <ellipse
                cx="94"
                cy="132"
                rx="10"
                ry="7"
                fill={breed.id === 'tuck' ? '#ffffff' : breed.primaryColor}
              />
            </g>
            <ellipse
              cx="108"
              cy="130"
              rx="9"
              ry="7"
              fill={breed.id === 'tuck' ? '#ffffff' : breed.secondaryColor}
            />

            {/* Booties on Paws */}
            {wardrobe.boots === 'yellow_boots' && (
              <g>
                <rect x="42" y="125" width="16" height="12" rx="5" fill="#ffbe0b" stroke="#e09f00" strokeWidth="1.5" />
                <rect x="86" y="127" width="16" height="12" rx="5" fill="#ffbe0b" stroke="#e09f00" strokeWidth="1.5" />
                <rect x="100" y="125" width="16" height="12" rx="5" fill="#ffbe0b" stroke="#e09f00" strokeWidth="1.5" />
              </g>
            )}

            {/* Snack Backpack */}
            {wardrobe.boots === 'backpack' && (
              <g>
                <rect x="62" y="92" width="22" height="24" rx="6" fill="#3a86ff" stroke="#1d4ed8" strokeWidth="1.5" />
                <path d="M 66 100 L 80 100" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                <circle cx="73" cy="106" r="3" fill="#ffbe0b" />
              </g>
            )}
          </g>

          {/* Dog Head Group */}
          <g
            style={{
              transform:
                state === 'pooping'
                  ? 'translate(6px, 12px) rotate(8deg)'
                  : state === 'eating'
                  ? 'translate(2px, 4px) rotate(4deg)'
                  : state === 'walking'
                  ? 'translate(0, -2px) rotate(-2deg)'
                  : `rotate(${headTilt}deg)`,
              transformOrigin: '96px 68px',
              transition: 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Head Base */}
            <circle
              cx="96"
              cy="65"
              r="29"
              fill={breed.id === 'tuck' ? '#1c1917' : breed.primaryColor}
            />

            {/* Breed Head Specific Details */}
            {breed.id === 'tuck' && (
              // Tuck's signature fluffy doodle face with white blaze & cute cheek puffs
              <g id="tuckFaceDetails">
                {/* Fluffy white doodle cheeks & muzzle puffs */}
                <ellipse cx="107" cy="74" rx="18" ry="14" fill="#ffffff" />
                <ellipse cx="85" cy="74" rx="16" ry="14" fill="#ffffff" />

                {/* White forehead flame blaze */}
                <path
                  d="M 96 38 Q 103 48 101 68 Q 96 74 91 68 Q 89 48 96 38 Z"
                  fill="#ffffff"
                />

                {/* Cute black patch surrounding left eye - framing big cartoon eye */}
                <ellipse cx="84" cy="61" rx="14.5" ry="15.5" fill="#1c1917" />

                {/* Soft curly doodle texture bumps on forehead */}
                <circle cx="96" cy="36" r="6.5" fill="#f8fafc" />
                <circle cx="87" cy="39" r="5.5" fill="#1c1917" />
                <circle cx="105" cy="39" r="5.5" fill="#1c1917" />
                <circle cx="78" cy="46" r="4.5" fill="#1c1917" />
                <circle cx="114" cy="46" r="4.5" fill="#1c1917" />
              </g>
            )}

            {breed.id === 'waffles' && (
              // Corgi white blaze
              <path d="M 96 38 Q 100 52 96 68 Q 92 52 96 38 Z" fill="#ffffff" />
            )}

            {breed.id === 'mochi' && (
              // Shiba white cheeks & cute eyebrow dots
              <g>
                <ellipse cx="78" cy="71" rx="12" ry="13" fill="#fff5eb" />
                <ellipse cx="114" cy="71" rx="12" ry="13" fill="#fff5eb" />
                <circle cx="84" cy="48" r="4" fill="#fff5eb" />
                <circle cx="108" cy="48" r="4" fill="#fff5eb" />
              </g>
            )}

            {breed.id === 'coco' && (
              // Poodle curly topknot puff
              <g>
                <circle cx="96" cy="36" r="15" fill={breed.secondaryColor} />
                <circle cx="87" cy="39" r="12" fill={breed.secondaryColor} />
                <circle cx="105" cy="39" r="12" fill={breed.secondaryColor} />
              </g>
            )}

            {/* Rosy Blush Cheeks on all pups */}
            <ellipse cx="73" cy="73" rx="5.5" ry="3.5" fill="#ff758f" opacity="0.55" />
            <ellipse cx="119" cy="73" rx="5.5" ry="3.5" fill="#ff758f" opacity="0.55" />

            {/* Ears */}
            {breed.id === 'tuck' ? (
              // Tuck's fluffy, wavy, floppy doodle ears framing his face like a sweet teddy bear
              <g id="tuckEars">
                {/* Left Ear */}
                <path
                  d="M 72 50 C 58 54, 52 82, 66 98 C 74 95, 78 82, 75 58 Z"
                  fill="#1c1917"
                />
                <circle cx="62" cy="74" r="7" fill="#2c2a29" />
                <circle cx="64" cy="88" r="6.5" fill="#1c1917" />
                <circle cx="68" cy="98" r="5.5" fill="#1c1917" />
                {/* Right Ear */}
                <path
                  d="M 120 50 C 134 54, 140 82, 126 98 C 118 95, 114 82, 117 58 Z"
                  fill="#1c1917"
                />
                <circle cx="130" cy="74" r="7" fill="#2c2a29" />
                <circle cx="128" cy="88" r="6.5" fill="#1c1917" />
                <circle cx="124" cy="98" r="5.5" fill="#1c1917" />
              </g>
            ) : breed.earType === 'upright' || breed.earType === 'bat' ? (
              // Corgi / Frenchie Ears
              <g>
                <path
                  d="M 74 54 C 64 28, 72 14, 85 26 C 87 36, 83 48, 78 54 Z"
                  fill={breed.primaryColor}
                />
                <path d="M 76 45 C 70 30, 75 22, 83 30 Z" fill="#ffccd5" />
                <path
                  d="M 118 54 C 128 28, 120 14, 107 26 C 105 36, 109 48, 114 54 Z"
                  fill={breed.primaryColor}
                />
                <path d="M 116 45 C 122 30, 117 22, 109 30 Z" fill="#ffccd5" />
              </g>
            ) : breed.earType === 'prick' ? (
              // Shiba triangular prick ears
              <g>
                <polygon points="72,55 78,32 90,48" fill={breed.primaryColor} />
                <polygon points="75,52 79,37 87,48" fill="#ffffff" />
                <polygon points="120,55 114,32 102,48" fill={breed.primaryColor} />
                <polygon points="117,52 113,37 105,48" fill="#ffffff" />
              </g>
            ) : (
              // Floppy retriever / poodle ears
              <g>
                <path d="M 72 54 C 58 62, 58 88, 74 92 C 78 80, 76 64, 76 56 Z" fill={breed.accentColor} />
                <path d="M 120 54 C 134 62, 134 88, 118 92 C 114 80, 116 64, 116 56 Z" fill={breed.accentColor} />
              </g>
            )}

            {/* Expressive Cartoon Eyebrows */}
            <g id="cartoonEyebrows">
              <path d="M 76 47 Q 84 43 92 46" stroke="#1c1917" strokeWidth="2.4" strokeLinecap="round" fill="none" />
              <path d="M 100 46 Q 108 43 116 47" stroke="#1c1917" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            </g>

            {/* Big, Soulful Cartoon Pixar-Style Eyes */}
            {state === 'eating' || isPetted ? (
              // Blissful happy closed anime eyes with pink hearts!
              <g stroke="#ff3366" strokeWidth="3.4" strokeLinecap="round" fill="none">
                <path d="M 75 62 Q 84 53 93 62" />
                <path d="M 99 62 Q 108 53 117 62" />
                {/* Floating mini heart */}
                <path d="M 96 46 Q 93 42 96 39 Q 99 42 96 46 Z" fill="#ff3366" />
              </g>
            ) : state === 'pooping' ? (
              // Goofy shocked cartoon eyes with tiny pupils & sweat drops
              <g>
                <ellipse cx="84" cy="61" rx="9" ry="11" fill="#ffffff" stroke="#1c1917" strokeWidth="2" />
                <circle cx="87" cy="60" r="3.2" fill="#1c1917" />
                <ellipse cx="108" cy="61" rx="9" ry="11" fill="#ffffff" stroke="#1c1917" strokeWidth="2" />
                <circle cx="111" cy="60" r="3.2" fill="#1c1917" />
                {/* Blue sweat drop for comical embarrassment */}
                <path d="M 120 46 C 117 41, 122 36, 122 36 C 122 36, 127 41, 124 46 C 123 48, 121 48, 120 46 Z" fill="#38bdf8" />
              </g>
            ) : blink ? (
              // Blinking cartoon eyelids with cute lashes
              <g stroke="#1c1917" strokeWidth="3" strokeLinecap="round">
                <path d="M 75 61 Q 84 68 93 61" fill="none" />
                <path d="M 99 61 Q 108 68 117 61" fill="none" />
              </g>
            ) : wink ? (
              // Playful knowing wink!
              <g>
                {/* Left eye open with sparkles */}
                <ellipse cx="84" cy="61" rx="9.5" ry="11.5" fill="#ffffff" stroke="#1c1917" strokeWidth="1.8" />
                <ellipse cx="84.5" cy="61.5" rx="7.2" ry="8.6" fill="#382216" />
                <circle cx="81.5" cy="57.5" r="3.2" fill="#ffffff" />
                <circle cx="87.5" cy="65.5" r="1.6" fill="#ffffff" />
                {/* Right eye winking shut with cute curved lash */}
                <path d="M 99 62 Q 108 54 117 62" stroke="#1c1917" strokeWidth="3.2" strokeLinecap="round" fill="none" />
                <path d="M 116 59 L 120 56" stroke="#1c1917" strokeWidth="2.2" strokeLinecap="round" />
              </g>
            ) : (
              // Big, glossy, soulful cartoon puppy eyes with 3-tier sparkles!
              <g id="bigCartoonEyes">
                {/* Left Eye */}
                <ellipse cx="84" cy="61" rx="9.5" ry="11.5" fill="#ffffff" stroke="#1c1917" strokeWidth="1.8" />
                <ellipse cx="84.5" cy="61.5" rx="7.2" ry="8.6" fill="#382216" />
                <ellipse cx="85" cy="62" rx="5.2" ry="6.2" fill="#140d0a" />
                {/* Warm amber reflective crescent */}
                <path d="M 79 63 C 81 68, 88 68, 90 63 C 88 66, 81 66, 79 63 Z" fill="#b45309" opacity="0.75" />
                {/* Triple Glossy Catchlights */}
                <circle cx="81.5" cy="57.5" r="3.2" fill="#ffffff" />
                <circle cx="87.5" cy="65.5" r="1.8" fill="#ffffff" />
                <circle cx="81.5" cy="64" r="1.1" fill="#ffffff" />

                {/* Right Eye */}
                <ellipse cx="108" cy="61" rx="9.5" ry="11.5" fill="#ffffff" stroke="#1c1917" strokeWidth="1.8" />
                <ellipse cx="107.5" cy="61.5" rx="7.2" ry="8.6" fill="#382216" />
                <ellipse cx="107" cy="62" rx="5.2" ry="6.2" fill="#140d0a" />
                {/* Warm amber reflective crescent */}
                <path d="M 102 63 C 104 68, 111 68, 113 63 C 111 66, 104 66, 102 63 Z" fill="#b45309" opacity="0.75" />
                {/* Triple Glossy Catchlights */}
                <circle cx="104.5" cy="57.5" r="3.2" fill="#ffffff" />
                <circle cx="110.5" cy="65.5" r="1.8" fill="#ffffff" />
                <circle cx="104.5" cy="64" r="1.1" fill="#ffffff" />
              </g>
            )}

            {/* Glasses Accessory (Proportioned to big cartoon eyes) */}
            {wardrobe.glasses === 'sunglasses' && (
              <g>
                <rect x="73" y="49" width="22" height="22" rx="6" fill="#18181b" stroke="#3f3f46" strokeWidth="1.8" />
                <rect x="97" y="49" width="22" height="22" rx="6" fill="#18181b" stroke="#3f3f46" strokeWidth="1.8" />
                <line x1="93" y1="58" x2="99" y2="58" stroke="#3f3f46" strokeWidth="3" />
                <line x1="76" y1="52" x2="82" y2="67" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
                <line x1="100" y1="52" x2="106" y2="67" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
              </g>
            )}
            {wardrobe.glasses === 'star_glasses' && (
              <g fill="#ffbe0b" stroke="#d97706" strokeWidth="1.8">
                <polygon points="84,48 88,57 98,57 90,63 93,73 84,67 75,73 78,63 70,57 80,57" />
                <polygon points="108,48 112,57 122,57 114,63 117,73 108,67 99,73 102,63 94,57 104,57" />
                <line x1="94" y1="60" x2="98" y2="60" stroke="#d97706" strokeWidth="2.5" />
              </g>
            )}
            {wardrobe.glasses === 'monocle' && (
              <g>
                <circle cx="108" cy="61" r="10.5" fill="rgba(147, 197, 253, 0.25)" stroke="#eab308" strokeWidth="2.2" />
                <path d="M 117 66 Q 121 82 116 92" stroke="#eab308" strokeWidth="1.8" fill="none" />
              </g>
            )}

            {/* Snout & Nose */}
            <g id="cuteSnout">
              <ellipse cx="96" cy="72" rx="12" ry="9" fill={breed.id === 'tuck' ? '#ffffff' : breed.secondaryColor} />
              <path d="M 91 68 Q 96 65 101 68 Q 96 74 91 68 Z" fill="#18181b" />
              <ellipse cx="96" cy="69" rx="4.8" ry="3.2" fill="#18181b" />
              {/* Cute shine reflection on button nose */}
              <ellipse cx="94.5" cy="67.5" rx="1.6" ry="1.1" fill="#ffffff" opacity="0.85" />
              
              {/* Mouth */}
              {state === 'pooping' ? (
                // Wavy embarrassed squiggly mouth
                <path d="M 90 76 Q 93 73 96 76 Q 99 79 102 76" stroke="#444" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              ) : state === 'eating' || isPetted ? (
                // Wide happy smile with licking tongue
                <g>
                  <path d="M 89 74 Q 96 84 103 74" fill="#d90429" stroke="#1c1917" strokeWidth="1.8" />
                  <ellipse cx="96" cy="78" rx="4.5" ry="3.8" fill="#ff758f" />
                </g>
              ) : state === 'barking' ? (
                // Open joyful barking mouth with tongue, teeth, and vocal sound waves
                <g>
                  <path d="M 88 73 Q 96 86 104 73 Z" fill="#9d0208" stroke="#1c1917" strokeWidth="2" />
                  <ellipse cx="96" cy="79" rx="4.5" ry="3.6" fill="#ff758f" />
                  {/* Little puppy canine teeth */}
                  <polygon points="90,73 92,76 94,73" fill="#ffffff" />
                  <polygon points="98,73 100,76 102,73" fill="#ffffff" />
                  {/* Sound vibration waves */}
                  <path d="M 112 68 Q 117 72 112 77" stroke="#ff4d6d" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.9" />
                  <path d="M 117 64 Q 124 72 117 81" stroke="#ff4d6d" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.7" />
                </g>
              ) : (
                // Happy resting puppy smile with cute tongue blep!
                <g>
                  <path d="M 92 73 Q 96 77 100 73" stroke="#2b2b2b" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                  {/* Sweet pink puppy tongue blep */}
                  <path d="M 94 74 Q 96 81 98 74 Z" fill="#ff758f" />
                  <line x1="96" y1="74" x2="96" y2="78" stroke="#e11d48" strokeWidth="0.8" strokeLinecap="round" />
                  {/* Buster Frenchie cute snaggletooth! */}
                  {breed.id === 'buster' && (
                    <polygon points="91,73 93,69 95,73" fill="#ffffff" stroke="#1c1917" strokeWidth="0.8" />
                  )}
                </g>
              )}
            </g>

            {/* Hat Accessory */}
            {wardrobe.hat === 'party' && (
              <g>
                <polygon points="96,15 84,40 108,40" fill="#ff4d6d" stroke="#c9184a" strokeWidth="1.5" />
                <line x1="87" y1="34" x2="105" y2="34" stroke="#ffbe0b" strokeWidth="2" />
                <line x1="90" y1="26" x2="102" y2="26" stroke="#06d6a0" strokeWidth="2" />
                <circle cx="96" cy="14" r="4.5" fill="#ffbe0b" />
              </g>
            )}
            {wardrobe.hat === 'crown' && (
              <g>
                <polygon points="82,42 85,26 91,34 96,22 101,34 107,26 110,42" fill="#ffbe0b" stroke="#d97706" strokeWidth="1.5" />
                <circle cx="85" cy="25" r="2.5" fill="#ef4444" />
                <circle cx="96" cy="21" r="3" fill="#3b82f6" />
                <circle cx="107" cy="25" r="2.5" fill="#ef4444" />
                <rect x="83" y="39" width="26" height="4" rx="2" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
              </g>
            )}
            {wardrobe.hat === 'detective' && (
              <g>
                <path d="M 78 40 Q 96 24 114 40 Z" fill="#78716c" stroke="#44403c" strokeWidth="2" />
                <path d="M 72 40 L 120 40" stroke="#44403c" strokeWidth="3" strokeLinecap="round" />
                <path d="M 96 26 L 96 32" stroke="#eab308" strokeWidth="2" />
              </g>
            )}
            {wardrobe.hat === 'chef' && (
              <g>
                <path d="M 84 38 C 76 34, 76 18, 88 18 C 90 14, 102 14, 104 18 C 116 18, 116 34, 108 38 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                <rect x="85" y="36" width="22" height="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              </g>
            )}
            {wardrobe.hat === 'beanie' && (
              <g>
                <path d="M 80 42 C 80 26, 112 26, 112 42 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
                <rect x="78" y="38" width="36" height="6" rx="3" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
                <circle cx="96" cy="24" r="5" fill="#ffffff" />
              </g>
            )}
            {wardrobe.hat === 'aviator' && (
              <g>
                <path d="M 80 40 C 80 28, 112 28, 112 40 Z" fill="#57361e" />
                <rect x="84" y="34" width="10" height="7" rx="2" fill="#38bdf8" stroke="#facc15" strokeWidth="1.5" />
                <rect x="98" y="34" width="10" height="7" rx="2" fill="#38bdf8" stroke="#facc15" strokeWidth="1.5" />
                <line x1="94" y1="37" x2="98" y2="37" stroke="#facc15" strokeWidth="2" />
              </g>
            )}

            {/* Collar Accessory */}
            {wardrobe.collar === 'bandana' && (
              <g>
                <path d="M 84 86 Q 96 90 108 86 Q 96 104 84 86 Z" fill="#e63946" stroke="#ba181b" strokeWidth="1.5" />
                <circle cx="96" cy="92" r="2" fill="#ffffff" />
                <circle cx="92" cy="89" r="1.5" fill="#ffffff" />
                <circle cx="100" cy="89" r="1.5" fill="#ffffff" />
              </g>
            )}
            {wardrobe.collar === 'diamond' && (
              <g>
                <path d="M 84 85 Q 96 89 108 85" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" fill="none" />
                <polygon points="96,87 99,92 96,97 93,92" fill="#67e8f9" stroke="#0284c7" strokeWidth="1" />
              </g>
            )}
            {wardrobe.collar === 'bowtie' && (
              <g>
                <polygon points="90,84 96,87 90,90" fill="#18181b" />
                <polygon points="102,84 96,87 102,90" fill="#18181b" />
                <circle cx="96" cy="87" r="2.5" fill="#ef4444" />
              </g>
            )}
            {wardrobe.collar === 'bell' && (
              <g>
                <path d="M 84 85 Q 96 89 108 85" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" fill="none" />
                <circle cx="96" cy="90" r="4.5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
                <circle cx="96" cy="91" r="1" fill="#78350f" />
              </g>
            )}
          </g>
        </g>
      </svg>
    </div>
  );
}
