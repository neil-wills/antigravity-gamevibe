// 15 Handcrafted Pin-Pulling Puzzle Levels: Easy -> Medium -> Hard
// Coordinates are normalized relative to a 400x520 puzzle arena.

export const PUZZLE_LEVELS = [
  // --- EASY LEVELS (1 - 5) ---
  {
    id: 1,
    name: "First Nibble",
    difficulty: "easy",
    tutorial: "Swipe or drag the golden pin to the right to feed the pup!",
    bowl: { x: 200, y: 470, w: 90, h: 30 },
    dog: { x: 90, y: 460 },
    pins: [
      { id: "p1", x: 200, y: 220, length: 180, orientation: "horizontal", pullDir: "right" },
    ],
    walls: [
      { x: 100, y: 150, w: 16, h: 160 },
      { x: 300, y: 150, w: 16, h: 160 },
      // Funnel to bowl
      { x: 140, y: 340, w: 16, h: 180, angle: -0.4 },
      { x: 260, y: 340, w: 16, h: 180, angle: 0.4 },
    ],
    kibbles: [
      { x: 170, y: 120 }, { x: 190, y: 110 }, { x: 210, y: 120 },
      { x: 180, y: 150 }, { x: 200, y: 140 }, { x: 220, y: 150 },
      { x: 190, y: 180 }, { x: 210, y: 180 }
    ],
    treats: [
      { x: 200, y: 80 } // Golden bone
    ],
    hazards: [],
    requiredKibble: 5,
  },
  {
    id: 2,
    name: "Double Pin Delight",
    difficulty: "easy",
    tutorial: "Pull both pins in order to clear the treat path!",
    bowl: { x: 200, y: 470, w: 90, h: 30 },
    dog: { x: 90, y: 460 },
    pins: [
      { id: "p1", x: 180, y: 180, length: 150, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 220, y: 310, length: 150, orientation: "horizontal", pullDir: "right" },
    ],
    walls: [
      { x: 90, y: 240, w: 16, h: 260 },
      { x: 310, y: 240, w: 16, h: 260 },
      { x: 140, y: 410, w: 16, h: 110, angle: -0.3 },
      { x: 260, y: 410, w: 16, h: 110, angle: 0.3 },
    ],
    kibbles: [
      { x: 180, y: 90 }, { x: 200, y: 90 }, { x: 220, y: 90 },
      { x: 190, y: 120 }, { x: 210, y: 120 }, { x: 200, y: 140 }
    ],
    treats: [
      { x: 200, y: 60 }
    ],
    hazards: [],
    requiredKibble: 4,
  },
  {
    id: 3,
    name: "Tuck's Treat Vault",
    difficulty: "easy",
    tutorial: "Separate chamber holds a juicy golden bone!",
    bowl: { x: 220, y: 470, w: 90, h: 30 },
    dog: { x: 90, y: 460 },
    pins: [
      { id: "p1", x: 160, y: 200, length: 140, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 280, y: 200, length: 110, orientation: "horizontal", pullDir: "right" },
    ],
    walls: [
      { x: 80, y: 200, w: 16, h: 200 },
      { x: 210, y: 120, w: 16, h: 160 }, // divider
      { x: 330, y: 200, w: 16, h: 200 },
      { x: 150, y: 390, w: 16, h: 140, angle: -0.35 },
      { x: 290, y: 390, w: 16, h: 140, angle: 0.35 },
    ],
    kibbles: [
      { x: 130, y: 80 }, { x: 150, y: 80 }, { x: 170, y: 80 },
      { x: 140, y: 120 }, { x: 160, y: 120 }, { x: 150, y: 150 }
    ],
    treats: [
      { x: 270, y: 130 } // In the secret vault chamber
    ],
    hazards: [],
    requiredKibble: 4,
  },
  {
    id: 4,
    name: "The Mud Trap",
    difficulty: "easy",
    tutorial: "Pull the LEFT pin first to drain the mud, then pull the RIGHT pin to feed Tuck!",
    bowl: { x: 280, y: 470, w: 90, h: 30 },
    dog: { x: 195, y: 460 },
    pins: [
      { id: "p1", x: 140, y: 220, length: 130, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 280, y: 220, length: 130, orientation: "horizontal", pullDir: "right" },
    ],
    walls: [
      // Left outer wall
      { x: 70, y: 180, w: 16, h: 220 },
      // Solid central divider separating mud from food bowl completely
      { x: 210, y: 260, w: 16, h: 360 },
      // Right outer wall
      { x: 350, y: 240, w: 16, h: 320 },
      // Mud drain slide to the far left
      { x: 120, y: 360, w: 120, h: 16, angle: 0.35 },
      // Mud catch basin at bottom left
      { x: 50, y: 480, w: 80, h: 16 },
      // Funnel directing food to bowl
      { x: 235, y: 400, w: 16, h: 90, angle: -0.22 },
      { x: 325, y: 400, w: 16, h: 90, angle: 0.22 },
    ],
    kibbles: [
      { x: 260, y: 100 }, { x: 280, y: 100 }, { x: 300, y: 100 },
      { x: 270, y: 140 }, { x: 290, y: 140 }
    ],
    treats: [
      { x: 280, y: 60 }
    ],
    hazards: [
      // Mud in left chamber
      { x: 120, y: 100, type: "mud" },
      { x: 140, y: 100, type: "mud" },
      { x: 130, y: 140, type: "mud" },
    ],
    requiredKibble: 4,
  },
  {
    id: 5,
    name: "Vertical Split",
    difficulty: "easy",
    tutorial: "Pull vertical pins up or down to release treats!",
    bowl: { x: 200, y: 470, w: 90, h: 30 },
    dog: { x: 80, y: 460 },
    pins: [
      { id: "p1", x: 200, y: 160, length: 150, orientation: "vertical", pullDir: "up" },
      { id: "p2", x: 200, y: 310, length: 150, orientation: "horizontal", pullDir: "right" },
    ],
    walls: [
      { x: 90, y: 190, w: 16, h: 220 },
      { x: 310, y: 190, w: 16, h: 220 },
      { x: 140, y: 400, w: 16, h: 120, angle: -0.3 },
      { x: 260, y: 400, w: 16, h: 120, angle: 0.3 },
    ],
    kibbles: [
      { x: 140, y: 90 }, { x: 160, y: 90 }, { x: 150, y: 120 },
      { x: 240, y: 90 }, { x: 260, y: 90 }, { x: 250, y: 120 }
    ],
    treats: [
      { x: 150, y: 50 }, { x: 250, y: 50 }
    ],
    hazards: [],
    requiredKibble: 4,
  },

  // --- MEDIUM LEVELS (6 - 10) ---
  {
    id: 6,
    name: "Mud Trap II",
    difficulty: "medium",
    tutorial: "Drain the upper mud chamber to the side before opening the food gate!",
    bowl: { x: 280, y: 470, w: 90, h: 30 },
    dog: { x: 190, y: 460 },
    pins: [
      { id: "p1", x: 140, y: 160, length: 120, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 280, y: 160, length: 120, orientation: "horizontal", pullDir: "right" },
      { id: "p3", x: 280, y: 290, length: 140, orientation: "horizontal", pullDir: "left" },
    ],
    walls: [
      { x: 70, y: 200, w: 16, h: 260 },
      { x: 210, y: 260, w: 16, h: 360 }, // Center barrier
      { x: 350, y: 240, w: 16, h: 320 },
      // Left mud drain slide
      { x: 120, y: 280, w: 120, h: 16, angle: 0.35 },
      { x: 50, y: 480, w: 80, h: 16 },
      // Funnel to bowl
      { x: 235, y: 400, w: 16, h: 90, angle: -0.22 },
      { x: 325, y: 400, w: 16, h: 90, angle: 0.22 },
    ],
    kibbles: [
      { x: 260, y: 80 }, { x: 280, y: 80 }, { x: 300, y: 80 }, { x: 270, y: 110 }
    ],
    treats: [
      { x: 280, y: 50 }
    ],
    hazards: [
      { x: 130, y: 80, type: "mud" },
      { x: 150, y: 80, type: "mud" }
    ],
    requiredKibble: 3,
  },
  {
    id: 7,
    name: "Cross Pin Grid",
    difficulty: "medium",
    tutorial: "Vertical and horizontal interlocking pins require smart timing.",
    bowl: { x: 200, y: 470, w: 90, h: 30 },
    dog: { x: 80, y: 460 },
    pins: [
      { id: "p1", x: 140, y: 220, length: 140, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 260, y: 220, length: 140, orientation: "horizontal", pullDir: "right" },
      { id: "p3", x: 200, y: 130, length: 140, orientation: "vertical", pullDir: "up" },
    ],
    walls: [
      { x: 70, y: 200, w: 16, h: 240 },
      { x: 330, y: 200, w: 16, h: 240 },
      { x: 130, y: 380, w: 16, h: 140, angle: -0.38 },
      { x: 270, y: 380, w: 16, h: 140, angle: 0.38 },
    ],
    kibbles: [
      { x: 130, y: 80 }, { x: 150, y: 80 }, { x: 140, y: 120 },
      { x: 250, y: 80 }, { x: 270, y: 80 }, { x: 260, y: 120 }
    ],
    treats: [
      { x: 200, y: 40 }
    ],
    hazards: [
      { x: 140, y: 180, type: "mud" }
    ],
    requiredKibble: 4,
  },
  {
    id: 8,
    name: "The Bouncy Chute",
    difficulty: "medium",
    tutorial: "Angles will slide food down the funnel into puppy's dish!",
    bowl: { x: 200, y: 470, w: 90, h: 30 },
    dog: { x: 80, y: 460 },
    pins: [
      { id: "p1", x: 160, y: 150, length: 130, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 250, y: 260, length: 130, orientation: "horizontal", pullDir: "right" },
      { id: "p3", x: 160, y: 350, length: 130, orientation: "horizontal", pullDir: "left" },
    ],
    walls: [
      { x: 80, y: 240, w: 16, h: 320 },
      { x: 320, y: 240, w: 16, h: 320 },
      { x: 240, y: 180, w: 90, h: 14, angle: -0.3 },
      { x: 150, y: 290, w: 90, h: 14, angle: 0.3 },
    ],
    kibbles: [
      { x: 140, y: 70 }, { x: 160, y: 70 }, { x: 180, y: 70 },
      { x: 150, y: 100 }, { x: 170, y: 100 }
    ],
    treats: [
      { x: 160, y: 40 }
    ],
    hazards: [],
    requiredKibble: 4,
  },
  {
    id: 9,
    name: "Spike Warning",
    difficulty: "medium",
    tutorial: "Sharp thorns destroy delicious food! Guide treats around them.",
    bowl: { x: 200, y: 470, w: 90, h: 30 },
    dog: { x: 80, y: 460 },
    pins: [
      { id: "p1", x: 140, y: 170, length: 130, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 260, y: 170, length: 130, orientation: "horizontal", pullDir: "right" },
      { id: "p3", x: 200, y: 330, length: 180, orientation: "horizontal", pullDir: "right" },
    ],
    walls: [
      { x: 70, y: 240, w: 16, h: 300 },
      { x: 330, y: 240, w: 16, h: 300 },
      { x: 200, y: 240, w: 40, h: 20 }, // obstacle block
    ],
    kibbles: [
      { x: 130, y: 80 }, { x: 150, y: 80 }, { x: 140, y: 110 },
      { x: 250, y: 80 }, { x: 270, y: 80 }, { x: 260, y: 110 }
    ],
    treats: [
      { x: 260, y: 40 }
    ],
    hazards: [
      { x: 200, y: 230, type: "spikes" }
    ],
    requiredKibble: 4,
  },
  {
    id: 10,
    name: "The Triple Vault",
    difficulty: "medium",
    tutorial: "Three separate chambers of gourmet puppy snacks!",
    bowl: { x: 200, y: 470, w: 90, h: 30 },
    dog: { x: 80, y: 460 },
    pins: [
      { id: "p1", x: 130, y: 210, length: 110, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 200, y: 210, length: 90, orientation: "horizontal", pullDir: "right" },
      { id: "p3", x: 270, y: 210, length: 110, orientation: "horizontal", pullDir: "right" },
    ],
    walls: [
      { x: 70, y: 200, w: 16, h: 220 },
      { x: 150, y: 120, w: 14, h: 160 },
      { x: 250, y: 120, w: 14, h: 160 },
      { x: 330, y: 200, w: 16, h: 220 },
      { x: 130, y: 380, w: 16, h: 140, angle: -0.35 },
      { x: 270, y: 380, w: 16, h: 140, angle: 0.35 },
    ],
    kibbles: [
      { x: 110, y: 80 }, { x: 120, y: 120 },
      { x: 190, y: 80 }, { x: 210, y: 80 }, { x: 200, y: 120 },
      { x: 280, y: 80 }, { x: 290, y: 120 }
    ],
    treats: [
      { x: 200, y: 40 }
    ],
    hazards: [],
    requiredKibble: 5,
  },

  // --- HARD LEVELS (11 - 15) ---
  {
    id: 11,
    name: "Hazard Separation",
    difficulty: "hard",
    tutorial: "Mud will spoil the bowl! Divert mud to the left drain before pulling food pin.",
    bowl: { x: 260, y: 470, w: 90, h: 30 },
    dog: { x: 120, y: 460 },
    pins: [
      { id: "p1", x: 130, y: 180, length: 120, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 250, y: 180, length: 120, orientation: "horizontal", pullDir: "right" },
      { id: "p3", x: 200, y: 310, length: 160, orientation: "horizontal", pullDir: "right" },
    ],
    walls: [
      { x: 60, y: 200, w: 16, h: 240 },
      { x: 190, y: 150, w: 14, h: 190 },
      { x: 330, y: 200, w: 16, h: 240 },
      { x: 100, y: 390, w: 90, h: 16, angle: 0.4 }, // divert mud left
      { x: 40, y: 480, w: 70, h: 16 }, // drain pit
    ],
    kibbles: [
      { x: 230, y: 80 }, { x: 250, y: 80 }, { x: 270, y: 80 },
      { x: 240, y: 110 }, { x: 260, y: 110 }
    ],
    treats: [
      { x: 250, y: 50 }
    ],
    hazards: [
      { x: 110, y: 80, type: "mud" },
      { x: 130, y: 80, type: "mud" },
      { x: 120, y: 110, type: "mud" }
    ],
    requiredKibble: 4,
  },
  {
    id: 12,
    name: "The Pin Labyrinth",
    difficulty: "hard",
    tutorial: "Carefully inspect each pin's path before pulling.",
    bowl: { x: 200, y: 470, w: 90, h: 30 },
    dog: { x: 80, y: 460 },
    pins: [
      { id: "p1", x: 130, y: 130, length: 110, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 270, y: 130, length: 110, orientation: "horizontal", pullDir: "right" },
      { id: "p3", x: 200, y: 220, length: 140, orientation: "horizontal", pullDir: "left" },
      { id: "p4", x: 200, y: 320, length: 150, orientation: "horizontal", pullDir: "right" },
    ],
    walls: [
      { x: 70, y: 230, w: 16, h: 320 },
      { x: 330, y: 230, w: 16, h: 320 },
      { x: 200, y: 80, w: 14, h: 90 },
      { x: 130, y: 400, w: 16, h: 120, angle: -0.3 },
      { x: 270, y: 400, w: 16, h: 120, angle: 0.3 },
    ],
    kibbles: [
      { x: 110, y: 60 }, { x: 130, y: 60 },
      { x: 260, y: 60 }, { x: 280, y: 60 }
    ],
    treats: [
      { x: 120, y: 30 }, { x: 270, y: 30 }
    ],
    hazards: [
      { x: 200, y: 170, type: "spikes" }
    ],
    requiredKibble: 3,
  },
  {
    id: 13,
    name: "Dual Pit Dilemma",
    difficulty: "hard",
    tutorial: "Don't let the golden bones fall into the empty abyss!",
    bowl: { x: 200, y: 470, w: 90, h: 30 },
    dog: { x: 80, y: 460 },
    pins: [
      { id: "p1", x: 140, y: 160, length: 120, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 260, y: 160, length: 120, orientation: "horizontal", pullDir: "right" },
      { id: "p3", x: 200, y: 260, length: 180, orientation: "horizontal", pullDir: "left" },
      { id: "p4", x: 200, y: 360, length: 140, orientation: "vertical", pullDir: "down" },
    ],
    walls: [
      { x: 60, y: 230, w: 16, h: 300 },
      { x: 340, y: 230, w: 16, h: 300 },
      { x: 140, y: 390, w: 16, h: 130, angle: -0.3 },
      { x: 260, y: 390, w: 16, h: 130, angle: 0.3 },
    ],
    kibbles: [
      { x: 120, y: 80 }, { x: 140, y: 80 }, { x: 130, y: 110 },
      { x: 250, y: 80 }, { x: 270, y: 80 }, { x: 260, y: 110 }
    ],
    treats: [
      { x: 200, y: 50 }
    ],
    hazards: [
      { x: 140, y: 210, type: "mud" }
    ],
    requiredKibble: 4,
  },
  {
    id: 14,
    name: "The Spike Gauntlet",
    difficulty: "hard",
    tutorial: "Precision timing is needed to navigate around the dual spike traps.",
    bowl: { x: 200, y: 470, w: 90, h: 30 },
    dog: { x: 80, y: 460 },
    pins: [
      { id: "p1", x: 150, y: 140, length: 130, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 250, y: 220, length: 130, orientation: "horizontal", pullDir: "right" },
      { id: "p3", x: 150, y: 300, length: 130, orientation: "horizontal", pullDir: "left" },
      { id: "p4", x: 250, y: 380, length: 130, orientation: "horizontal", pullDir: "right" },
    ],
    walls: [
      { x: 70, y: 240, w: 16, h: 340 },
      { x: 330, y: 240, w: 16, h: 340 },
    ],
    kibbles: [
      { x: 130, y: 70 }, { x: 150, y: 70 }, { x: 170, y: 70 },
      { x: 140, y: 100 }, { x: 160, y: 100 }
    ],
    treats: [
      { x: 150, y: 40 }, { x: 260, y: 40 }
    ],
    hazards: [
      { x: 250, y: 180, type: "spikes" },
      { x: 150, y: 260, type: "spikes" }
    ],
    requiredKibble: 4,
  },
  {
    id: 15,
    name: "Master Feast: Tuck's Grand Banquet",
    difficulty: "hard",
    tutorial: "The ultimate canine challenge! Unlock the mega cascade for a 3-star feast!",
    bowl: { x: 200, y: 470, w: 100, h: 32 },
    dog: { x: 75, y: 460 },
    pins: [
      { id: "p1", x: 130, y: 140, length: 110, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 270, y: 140, length: 110, orientation: "horizontal", pullDir: "right" },
      { id: "p3", x: 200, y: 230, length: 160, orientation: "horizontal", pullDir: "left" },
      { id: "p4", x: 150, y: 330, length: 120, orientation: "horizontal", pullDir: "left" },
      { id: "p5", x: 250, y: 330, length: 120, orientation: "horizontal", pullDir: "right" },
    ],
    walls: [
      { x: 60, y: 240, w: 16, h: 340 },
      { x: 340, y: 240, w: 16, h: 340 },
      { x: 200, y: 90, w: 14, h: 100 },
      { x: 130, y: 410, w: 16, h: 120, angle: -0.32 },
      { x: 270, y: 410, w: 16, h: 120, angle: 0.32 },
    ],
    kibbles: [
      { x: 110, y: 60 }, { x: 130, y: 60 }, { x: 150, y: 60 },
      { x: 120, y: 90 }, { x: 140, y: 90 },
      { x: 250, y: 60 }, { x: 270, y: 60 }, { x: 290, y: 60 },
      { x: 260, y: 90 }, { x: 280, y: 90 }
    ],
    treats: [
      { x: 130, y: 30 }, { x: 200, y: 180 }, { x: 270, y: 30 }
    ],
    hazards: [
      { x: 130, y: 280, type: "mud" },
      { x: 270, y: 280, type: "spikes" }
    ],
    requiredKibble: 6,
  },
];
