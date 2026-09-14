import React, { useEffect, useState } from 'react';

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
  state = 'idle', // 'idle' | 'walking' | 'eating' | 'pooping'
  size = 140,
  flip = false,
  className = '',
}) {
  const [blink, setBlink] = useState(false);
  const [tailTick, setTailTick] = useState(0);

  // Find breed specs
  const breed = DOG_BREEDS.find((b) => b.id === breedId) || DOG_BREEDS[0];

  // Natural blinking cycle
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, 3200 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Tail wag loop
  useEffect(() => {
    const wagInterval = setInterval(() => {
      setTailTick((t) => (t + 1) % 4);
    }, 180);
    return () => clearInterval(wagInterval);
  }, []);

  const tailAngles = [-15, 0, 18, 5];
  const currentTailAngle = state === 'eating' ? 25 : tailAngles[tailTick];

  return (
    <div
      className={`dog-svg-wrapper ${className}`}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: flip ? 'scaleX(-1)' : 'none',
        transition: 'transform 0.2s',
      }}
    >
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

        {/* Tail */}
        <g
          style={{
            transform: `rotate(${currentTailAngle}deg)`,
            transformOrigin: '45px 105px',
            transition: 'transform 0.12s ease-in-out',
          }}
        >
          {breed.id === 'tuck' ? (
            // Tuck's fluffy doodle curly tail (black with white fluffy tip)
            <g>
              <path
                d="M 45 105 Q 20 85 28 65 Q 38 60 40 75 Q 35 95 45 105 Z"
                fill="#1c1917"
              />
              {/* Curly Doodle cloud puffs on Tuck's tail */}
              <circle cx="28" cy="65" r="9" fill="#ffffff" />
              <circle cx="34" cy="62" r="7" fill="#ffffff" />
              <circle cx="23" cy="69" r="6" fill="#1c1917" />
            </g>
          ) : breed.tailType === 'stub' ? (
            // Corgi / Frenchie cute nub tail
            <ellipse cx="40" cy="108" rx="8" ry="6" fill={breed.primaryColor} />
          ) : breed.tailType === 'curl' ? (
            // Shiba curled donut tail
            <path
              d="M 45 105 C 30 90, 20 60, 40 60 C 50 60, 52 75, 42 85 Z"
              fill={breed.primaryColor}
            />
          ) : breed.tailType === 'pom-pom' ? (
            // Poodle tail with pom-pom
            <g>
              <path d="M 45 105 Q 30 90 28 75" stroke={breed.primaryColor} strokeWidth="5" strokeLinecap="round" />
              <circle cx="28" cy="72" r="10" fill={breed.secondaryColor} />
            </g>
          ) : (
            // Barnaby Golden fluffy tail
            <path
              d="M 45 105 Q 15 90 20 70 Q 35 80 45 105 Z"
              fill={breed.primaryColor}
            />
          )}
        </g>

        {/* Dog Main Body */}
        <g filter="url(#dogShadow)">
          {/* Pooping squat transformation vs Normal sitting/walking body */}
          <g
            style={{
              transform: state === 'pooping' ? 'translate(0, 10px) scale(1.05, 0.9)' : state === 'walking' ? 'translate(0, -3px)' : 'none',
              transformOrigin: '80px 110px',
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
                  : 'none',
              transformOrigin: '96px 68px',
              transition: 'transform 0.2s',
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
              // Tuck's signature white doodle blaze down forehead & snout
              <g>
                {/* White forehead patch */}
                <path
                  d="M 96 42 Q 102 52 100 68 Q 96 74 92 68 Q 90 52 96 42 Z"
                  fill="#ffffff"
                />
                {/* White fluffy doodle cheeks & muzzle */}
                <ellipse cx="106" cy="74" rx="16" ry="12" fill="#ffffff" />
                <ellipse cx="88" cy="74" rx="14" ry="12" fill="#ffffff" />
                {/* Black spot around left eye */}
                <ellipse cx="86" cy="62" rx="8" ry="9" fill="#1c1917" />
                {/* Fluffy wavy curl bumps on forehead */}
                <circle cx="96" cy="39" r="6" fill="#f8fafc" />
                <circle cx="88" cy="42" r="5" fill="#1c1917" />
                <circle cx="104" cy="42" r="5" fill="#1c1917" />
              </g>
            )}

            {breed.id === 'waffles' && (
              // Corgi white blaze
              <path d="M 96 40 Q 99 54 96 68 Q 93 54 96 40 Z" fill="#ffffff" />
            )}

            {breed.id === 'mochi' && (
              // Shiba white cheeks
              <g>
                <ellipse cx="80" cy="70" rx="10" ry="12" fill="#fff5eb" />
                <ellipse cx="112" cy="70" rx="10" ry="12" fill="#fff5eb" />
                {/* White eyebrow dots */}
                <circle cx="87" cy="53" r="3.5" fill="#fff5eb" />
                <circle cx="105" cy="53" r="3.5" fill="#fff5eb" />
              </g>
            )}

            {breed.id === 'coco' && (
              // Poodle curly topknot puff
              <g>
                <circle cx="96" cy="38" r="14" fill={breed.secondaryColor} />
                <circle cx="88" cy="40" r="11" fill={breed.secondaryColor} />
                <circle cx="104" cy="40" r="11" fill={breed.secondaryColor} />
              </g>
            )}

            {/* Ears */}
            {breed.id === 'tuck' ? (
              // Tuck's curly floppy doodle ears (rich black wavy ears framing face)
              <g>
                {/* Left Ear */}
                <path
                  d="M 72 52 C 60 55, 55 80, 68 95 C 75 92, 78 80, 75 60 Z"
                  fill="#1c1917"
                />
                <circle cx="64" cy="85" r="6" fill="#2c2a29" />
                <circle cx="68" cy="95" r="5" fill="#1c1917" />
                {/* Right Ear */}
                <path
                  d="M 118 52 C 130 55, 134 80, 122 95 C 115 92, 112 80, 115 60 Z"
                  fill="#1c1917"
                />
                <circle cx="126" cy="85" r="6" fill="#2c2a29" />
                <circle cx="122" cy="95" r="5" fill="#1c1917" />
              </g>
            ) : breed.earType === 'upright' || breed.earType === 'bat' ? (
              // Corgi / Frenchie Ears
              <g>
                <path
                  d="M 74 54 C 64 30, 72 16, 84 28 C 86 38, 82 50, 78 54 Z"
                  fill={breed.primaryColor}
                />
                <path d="M 76 46 C 70 32, 75 24, 82 32 Z" fill="#ffccd5" />
                <path
                  d="M 118 54 C 128 30, 120 16, 108 28 C 106 38, 110 50, 114 54 Z"
                  fill={breed.primaryColor}
                />
                <path d="M 116 46 C 122 32, 117 24, 110 32 Z" fill="#ffccd5" />
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
                <path d="M 72 54 C 60 62, 60 85, 74 88 C 78 78, 76 64, 76 56 Z" fill={breed.accentColor} />
                <path d="M 120 54 C 132 62, 132 85, 118 88 C 114 78, 116 64, 116 56 Z" fill={breed.accentColor} />
              </g>
            )}

            {/* Eyes */}
            {state === 'eating' ? (
              // Happy closed eye arches / heart eyes!
              <g stroke="#ff3366" strokeWidth="3" strokeLinecap="round" fill="none">
                <path d="M 82 62 Q 88 56 94 62" />
                <path d="M 98 62 Q 104 56 110 62" />
              </g>
            ) : state === 'pooping' ? (
              // Embarrassed wide / apologetic sideways eyes
              <g>
                <circle cx="87" cy="62" r="6" fill="#ffffff" stroke="#333" strokeWidth="2" />
                <circle cx="89" cy="61" r="2.5" fill="#333" />
                <circle cx="105" cy="62" r="6" fill="#ffffff" stroke="#333" strokeWidth="2" />
                <circle cx="107" cy="61" r="2.5" fill="#333" />
                {/* Blue sweat drop for comical embarrassment */}
                <path d="M 115 48 C 113 44, 117 40, 117 40 C 117 40, 121 44, 119 48 C 118 50, 116 50, 115 48 Z" fill="#38bdf8" />
              </g>
            ) : blink ? (
              // Blinking eyes
              <g stroke="#2b2b2b" strokeWidth="3" strokeLinecap="round">
                <line x1="83" y1="62" x2="91" y2="62" />
                <line x1="101" y1="62" x2="109" y2="62" />
              </g>
            ) : (
              // Loving Puppy Eyes
              <g>
                <circle cx="87" cy="62" r="5" fill="#221811" />
                <circle cx="85.5" cy="60.5" r="2" fill="#ffffff" />
                <circle cx="105" cy="62" r="5" fill="#221811" />
                <circle cx="103.5" cy="60.5" r="2" fill="#ffffff" />
              </g>
            )}

            {/* Glasses Accessory */}
            {wardrobe.glasses === 'sunglasses' && (
              <g>
                <rect x="80" y="56" width="16" height="12" rx="4" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
                <rect x="96" y="56" width="16" height="12" rx="4" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
                <line x1="94" y1="61" x2="98" y2="61" stroke="#3f3f46" strokeWidth="2" />
                <line x1="82" y1="58" x2="86" y2="66" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                <line x1="98" y1="58" x2="102" y2="66" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              </g>
            )}
            {wardrobe.glasses === 'star_glasses' && (
              <g fill="#ffbe0b" stroke="#d97706" strokeWidth="1.5">
                <polygon points="88,54 91,60 97,60 92,64 94,70 88,66 82,70 84,64 79,60 85,60" />
                <polygon points="104,54 107,60 113,60 108,64 110,70 104,66 98,70 100,64 95,60 101,60" />
                <line x1="96" y1="61" x2="98" y2="61" stroke="#d97706" strokeWidth="2" />
              </g>
            )}
            {wardrobe.glasses === 'monocle' && (
              <g>
                <circle cx="105" cy="62" r="8" fill="rgba(147, 197, 253, 0.25)" stroke="#eab308" strokeWidth="2" />
                <path d="M 112 66 Q 116 80 112 90" stroke="#eab308" strokeWidth="1.5" fill="none" />
              </g>
            )}

            {/* Snout & Nose */}
            <g>
              <ellipse cx="96" cy="72" rx="11" ry="8" fill={breed.id === 'tuck' ? '#ffffff' : breed.secondaryColor} />
              <path d="M 92 68 Q 96 66 100 68 Q 96 73 92 68 Z" fill="#18181b" />
              <ellipse cx="96" cy="69" rx="4" ry="2.5" fill="#18181b" />
              
              {/* Mouth */}
              {state === 'pooping' ? (
                // Wavy embarrassed squiggly mouth
                <path d="M 91 76 Q 94 74 96 76 Q 98 78 101 76" stroke="#444" strokeWidth="2" strokeLinecap="round" fill="none" />
              ) : state === 'eating' ? (
                // Wide eating smile with tongue
                <g>
                  <path d="M 90 74 Q 96 82 102 74" fill="#d90429" stroke="#333" strokeWidth="1.5" />
                  <ellipse cx="96" cy="77" rx="3.5" ry="3" fill="#ff758f" />
                </g>
              ) : (
                // Happy resting smile with panting tongue
                <g>
                  <path d="M 93 73 Q 96 76 99 73" stroke="#2b2b2b" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <path d="M 94 74 Q 96 80 98 74 Z" fill="#ff758f" />
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
