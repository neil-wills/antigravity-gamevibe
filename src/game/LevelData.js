// 15 Handcrafted Pin-Pulling Puzzle Levels: Easy -> Medium -> Hard
// Enhanced with multiple pins per level, dependency locks, bouncy bumpers, and shaped walls.
// Coordinates are normalized relative to a 400x520 puzzle arena.

export const PUZZLE_LEVELS = [
  // --- EASY LEVELS (1 - 5) ---
  {
    id: 1,
    name: "First Nibble & The Bouncy Peg",
    difficulty: "easy",
    tutorial: "Pull the upper pin, then the lower gate! Watch the kibble bounce off the peg!",
    bowl: { x: 200, y: 470, w: 90, h: 30 },
    dog: { x: 90, y: 460 },
    pins: [
      { id: "p1", x: 200, y: 190, length: 170, orientation: "horizontal", pullDir: "right" },
      { id: "p2", x: 200, y: 280, length: 150, orientation: "horizontal", pullDir: "left" },
    ],
    bumpers: [
      { x: 200, y: 360, radius: 24, color: "#00f5d4", pulse: 0 },
    ],
    walls: [
      { x: 100, y: 150, w: 16, h: 160, isBouncy: false },
      { x: 300, y: 150, w: 16, h: 160, isBouncy: false },
      // Angled Bouncy Funnel to bowl
      { x: 130, y: 360, w: 16, h: 160, angle: -0.42, isBouncy: true },
      { x: 270, y: 360, w: 16, h: 160, angle: 0.42, isBouncy: true },
    ],
    kibbles: [
      { x: 170, y: 110 }, { x: 190, y: 100 }, { x: 210, y: 110 },
      { x: 180, y: 140 }, { x: 200, y: 130 }, { x: 220, y: 140 },
      { x: 190, y: 165 }, { x: 210, y: 165 }
    ],
    treats: [
      { x: 200, y: 70 } // Golden bone
    ],
    hazards: [],
    requiredKibble: 5,
  },
  {
    id: 2,
    name: "Triple Pin Cascade",
    difficulty: "easy",
    tutorial: "Pull pins in order from top to bottom across the dual bounce bumpers!",
    bowl: { x: 200, y: 470, w: 90, h: 30 },
    dog: { x: 90, y: 460 },
    pins: [
      { id: "p1", x: 180, y: 160, length: 140, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 220, y: 240, length: 140, orientation: "horizontal", pullDir: "right" },
      { id: "p3", x: 200, y: 330, length: 160, orientation: "horizontal", pullDir: "left" },
    ],
    bumpers: [
      { x: 150, y: 395, radius: 20, color: "#ff007f", pulse: 0 },
      { x: 250, y: 395, radius: 20, color: "#00f5d4", pulse: 0 },
    ],
    walls: [
      { x: 90, y: 230, w: 16, h: 250 },
      { x: 310, y: 230, w: 16, h: 250 },
      // Curved funnel chutes
      { x: 135, y: 420, w: 16, h: 100, angle: -0.32, isBouncy: true },
      { x: 265, y: 420, w: 16, h: 100, angle: 0.32, isBouncy: true },
    ],
    kibbles: [
      { x: 180, y: 80 }, { x: 200, y: 80 }, { x: 220, y: 80 },
      { x: 190, y: 110 }, { x: 210, y: 110 }, { x: 200, y: 135 }
    ],
    treats: [
      { x: 200, y: 50 }
    ],
    hazards: [],
    requiredKibble: 4,
  },
  {
    id: 3,
    name: "Tuck's Locked Vault",
    difficulty: "easy",
    tutorial: "Pull Pin 1 & 2 first, then unlock the Secret Treat Vault!",
    bowl: { x: 220, y: 470, w: 90, h: 30 },
    dog: { x: 90, y: 460 },
    pins: [
      { id: "p1", x: 150, y: 180, length: 120, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 270, y: 180, length: 110, orientation: "horizontal", pullDir: "right" },
      { id: "p3", x: 180, y: 270, length: 140, orientation: "horizontal", pullDir: "left" },
      { id: "p4", x: 270, y: 270, length: 110, orientation: "horizontal", pullDir: "right", lockedBy: "p2" },
    ],
    bumpers: [
      { x: 210, y: 355, radius: 22, color: "#ffbe0b", pulse: 0 },
    ],
    walls: [
      { x: 80, y: 200, w: 16, h: 220 },
      { x: 210, y: 130, w: 16, h: 180 }, // divider
      { x: 330, y: 200, w: 16, h: 220 },
      { x: 145, y: 395, w: 16, h: 130, angle: -0.38, isBouncy: true },
      { x: 295, y: 395, w: 16, h: 130, angle: 0.38, isBouncy: true },
    ],
    kibbles: [
      { x: 130, y: 80 }, { x: 150, y: 80 }, { x: 170, y: 80 },
      { x: 140, y: 120 }, { x: 160, y: 120 }, { x: 150, y: 150 }
    ],
    treats: [
      { x: 270, y: 120 } // In the secret locked vault
    ],
    hazards: [],
    requiredKibble: 4,
  },
  {
    id: 4,
    name: "The Mud Trap & Safety Pin",
    difficulty: "easy",
    tutorial: "Pull Pin 1 to drain mud, then Pin 2 & 3 to feed Tuck safely!",
    bowl: { x: 280, y: 470, w: 90, h: 30 },
    dog: { x: 195, y: 460 },
    pins: [
      { id: "p1", x: 140, y: 190, length: 120, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 280, y: 190, length: 120, orientation: "horizontal", pullDir: "right" },
      { id: "p3", x: 280, y: 280, length: 120, orientation: "horizontal", pullDir: "left" },
    ],
    bumpers: [
      { x: 130, y: 330, radius: 18, color: "#fb7185", pulse: 0 },
      { x: 280, y: 360, radius: 22, color: "#38bdf8", pulse: 0 },
    ],
    walls: [
      { x: 70, y: 180, w: 16, h: 220 },
      { x: 210, y: 260, w: 16, h: 360 }, // Center barrier
      { x: 350, y: 240, w: 16, h: 320 },
      // Mud drain slide
      { x: 120, y: 360, w: 120, h: 16, angle: 0.35, isBouncy: true },
      { x: 50, y: 480, w: 80, h: 16 },
      // Funnel to bowl
      { x: 235, y: 410, w: 16, h: 90, angle: -0.25, isBouncy: true },
      { x: 325, y: 410, w: 16, h: 90, angle: 0.25, isBouncy: true },
    ],
    kibbles: [
      { x: 260, y: 90 }, { x: 280, y: 90 }, { x: 300, y: 90 },
      { x: 270, y: 130 }, { x: 290, y: 130 }
    ],
    treats: [
      { x: 280, y: 50 }
    ],
    hazards: [
      { x: 120, y: 90, type: "mud" },
      { x: 140, y: 90, type: "mud" },
      { x: 130, y: 130, type: "mud" },
    ],
    requiredKibble: 4,
  },
  {
    id: 5,
    name: "Vertical Split & Pinball Bumper",
    difficulty: "easy",
    tutorial: "Pull vertical pins up and side pins to clear both chambers!",
    bowl: { x: 200, y: 470, w: 90, h: 30 },
    dog: { x: 80, y: 460 },
    pins: [
      { id: "p1", x: 200, y: 150, length: 140, orientation: "vertical", pullDir: "up" },
      { id: "p2", x: 150, y: 270, length: 120, orientation: "horizontal", pullDir: "left" },
      { id: "p3", x: 250, y: 270, length: 120, orientation: "horizontal", pullDir: "right" },
    ],
    bumpers: [
      { x: 200, y: 350, radius: 26, color: "#a855f7", pulse: 0 },
    ],
    walls: [
      { x: 90, y: 190, w: 16, h: 220 },
      { x: 310, y: 190, w: 16, h: 220 },
      { x: 140, y: 400, w: 16, h: 120, angle: -0.32, isBouncy: true },
      { x: 260, y: 400, w: 16, h: 120, angle: 0.32, isBouncy: true },
    ],
    kibbles: [
      { x: 140, y: 80 }, { x: 160, y: 80 }, { x: 150, y: 110 },
      { x: 240, y: 80 }, { x: 260, y: 80 }, { x: 250, y: 110 }
    ],
    treats: [
      { x: 150, y: 40 }, { x: 250, y: 40 }
    ],
    hazards: [],
    requiredKibble: 4,
  },

  // --- MEDIUM LEVELS (6 - 10) ---
  {
    id: 6,
    name: "Mud Trap II: Dual Bouncers",
    difficulty: "medium",
    tutorial: "Divert upper mud to the left, then open the lower locked gate!",
    bowl: { x: 280, y: 470, w: 90, h: 30 },
    dog: { x: 190, y: 460 },
    pins: [
      { id: "p1", x: 140, y: 150, length: 120, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 280, y: 150, length: 120, orientation: "horizontal", pullDir: "right" },
      { id: "p3", x: 280, y: 250, length: 130, orientation: "horizontal", pullDir: "left" },
      { id: "p4", x: 280, y: 340, length: 130, orientation: "horizontal", pullDir: "right", lockedBy: "p3" },
    ],
    bumpers: [
      { x: 120, y: 340, radius: 20, color: "#fb7185", pulse: 0 },
      { x: 280, y: 390, radius: 22, color: "#00f5d4", pulse: 0 },
    ],
    walls: [
      { x: 70, y: 200, w: 16, h: 260 },
      { x: 210, y: 260, w: 16, h: 360 }, // Center barrier
      { x: 350, y: 240, w: 16, h: 320 },
      { x: 120, y: 280, w: 120, h: 16, angle: 0.35, isBouncy: true },
      { x: 50, y: 480, w: 80, h: 16 },
      { x: 235, y: 410, w: 16, h: 90, angle: -0.22, isBouncy: true },
      { x: 325, y: 410, w: 16, h: 90, angle: 0.22, isBouncy: true },
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
    name: "Cross Pin Grid & Spring Pegs",
    difficulty: "medium",
    tutorial: "Vertical and horizontal interlocking pins. Watch for the mud hazard!",
    bowl: { x: 200, y: 470, w: 90, h: 30 },
    dog: { x: 80, y: 460 },
    pins: [
      { id: "p1", x: 140, y: 180, length: 130, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 260, y: 180, length: 130, orientation: "horizontal", pullDir: "right" },
      { id: "p3", x: 200, y: 120, length: 130, orientation: "vertical", pullDir: "up" },
      { id: "p4", x: 200, y: 280, length: 160, orientation: "horizontal", pullDir: "left" },
    ],
    bumpers: [
      { x: 150, y: 350, radius: 22, color: "#ffbe0b", pulse: 0 },
      { x: 250, y: 350, radius: 22, color: "#38bdf8", pulse: 0 },
    ],
    walls: [
      { x: 70, y: 200, w: 16, h: 240 },
      { x: 330, y: 200, w: 16, h: 240 },
      { x: 130, y: 390, w: 16, h: 140, angle: -0.38, isBouncy: true },
      { x: 270, y: 390, w: 16, h: 140, angle: 0.38, isBouncy: true },
    ],
    kibbles: [
      { x: 130, y: 70 }, { x: 150, y: 70 }, { x: 140, y: 100 },
      { x: 250, y: 70 }, { x: 270, y: 70 }, { x: 260, y: 100 }
    ],
    treats: [
      { x: 200, y: 35 }
    ],
    hazards: [
      { x: 140, y: 150, type: "mud" }
    ],
    requiredKibble: 4,
  },
  {
    id: 8,
    name: "The Bouncy Pachinko Chute",
    difficulty: "medium",
    tutorial: "Zig-zag down the bouncy bumpers into puppy's dish!",
    bowl: { x: 200, y: 470, w: 90, h: 30 },
    dog: { x: 80, y: 460 },
    pins: [
      { id: "p1", x: 160, y: 130, length: 120, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 250, y: 210, length: 120, orientation: "horizontal", pullDir: "right" },
      { id: "p3", x: 160, y: 290, length: 120, orientation: "horizontal", pullDir: "left" },
      { id: "p4", x: 250, y: 360, length: 130, orientation: "horizontal", pullDir: "right" },
    ],
    bumpers: [
      { x: 260, y: 165, radius: 22, color: "#00f5d4", pulse: 0 },
      { x: 140, y: 250, radius: 22, color: "#ff007f", pulse: 0 },
      { x: 260, y: 325, radius: 22, color: "#facc15", pulse: 0 },
    ],
    walls: [
      { x: 80, y: 240, w: 16, h: 320 },
      { x: 320, y: 240, w: 16, h: 320 },
      { x: 240, y: 170, w: 90, h: 14, angle: -0.3, isBouncy: true },
      { x: 150, y: 260, w: 90, h: 14, angle: 0.3, isBouncy: true },
      { x: 240, y: 330, w: 90, h: 14, angle: -0.3, isBouncy: true },
    ],
    kibbles: [
      { x: 140, y: 60 }, { x: 160, y: 60 }, { x: 180, y: 60 },
      { x: 150, y: 90 }, { x: 170, y: 90 }
    ],
    treats: [
      { x: 160, y: 30 }
    ],
    hazards: [],
    requiredKibble: 4,
  },
  {
    id: 9,
    name: "Spike Warning & Deflector",
    difficulty: "medium",
    tutorial: "Thorns destroy food! Use the spring bumper to deflect kibble safely around!",
    bowl: { x: 200, y: 470, w: 90, h: 30 },
    dog: { x: 80, y: 460 },
    pins: [
      { id: "p1", x: 140, y: 150, length: 120, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 260, y: 150, length: 120, orientation: "horizontal", pullDir: "right" },
      { id: "p3", x: 200, y: 240, length: 150, orientation: "horizontal", pullDir: "left" },
      { id: "p4", x: 200, y: 340, length: 180, orientation: "horizontal", pullDir: "right" },
    ],
    bumpers: [
      { x: 130, y: 290, radius: 24, color: "#38bdf8", pulse: 0 },
      { x: 270, y: 290, radius: 24, color: "#00f5d4", pulse: 0 },
    ],
    walls: [
      { x: 70, y: 240, w: 16, h: 300 },
      { x: 330, y: 240, w: 16, h: 300 },
      { x: 200, y: 240, w: 40, h: 20 },
    ],
    kibbles: [
      { x: 130, y: 70 }, { x: 150, y: 70 }, { x: 140, y: 100 },
      { x: 250, y: 70 }, { x: 270, y: 70 }, { x: 260, y: 100 }
    ],
    treats: [
      { x: 260, y: 35 }
    ],
    hazards: [
      { x: 200, y: 215, type: "spikes" }
    ],
    requiredKibble: 4,
  },
  {
    id: 10,
    name: "The Triple Vault Maze",
    difficulty: "medium",
    tutorial: "Three separate chambers of puppy snacks with locked security gates!",
    bowl: { x: 200, y: 470, w: 90, h: 30 },
    dog: { x: 80, y: 460 },
    pins: [
      { id: "p1", x: 130, y: 180, length: 110, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 200, y: 180, length: 90, orientation: "horizontal", pullDir: "right" },
      { id: "p3", x: 270, y: 180, length: 110, orientation: "horizontal", pullDir: "right" },
      { id: "p4", x: 200, y: 290, length: 180, orientation: "horizontal", pullDir: "left", lockedBy: "p2" },
    ],
    bumpers: [
      { x: 140, y: 360, radius: 20, color: "#fb7185", pulse: 0 },
      { x: 260, y: 360, radius: 20, color: "#facc15", pulse: 0 },
    ],
    walls: [
      { x: 70, y: 200, w: 16, h: 220 },
      { x: 150, y: 120, w: 14, h: 160 },
      { x: 250, y: 120, w: 14, h: 160 },
      { x: 330, y: 200, w: 16, h: 220 },
      { x: 130, y: 390, w: 16, h: 140, angle: -0.35, isBouncy: true },
      { x: 270, y: 390, w: 16, h: 140, angle: 0.35, isBouncy: true },
    ],
    kibbles: [
      { x: 110, y: 70 }, { x: 120, y: 100 },
      { x: 190, y: 70 }, { x: 210, y: 70 }, { x: 200, y: 100 },
      { x: 280, y: 70 }, { x: 290, y: 100 }
    ],
    treats: [
      { x: 200, y: 35 }
    ],
    hazards: [],
    requiredKibble: 5,
  },

  // --- HARD LEVELS (11 - 15) ---
  {
    id: 11,
    name: "Hazard Separation Matrix",
    difficulty: "hard",
    tutorial: "Divert toxic mud to the left pit before unlatching the treat gate!",
    bowl: { x: 260, y: 470, w: 90, h: 30 },
    dog: { x: 120, y: 460 },
    pins: [
      { id: "p1", x: 130, y: 160, length: 120, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 250, y: 160, length: 120, orientation: "horizontal", pullDir: "right" },
      { id: "p3", x: 190, y: 240, length: 120, orientation: "vertical", pullDir: "up" },
      { id: "p4", x: 260, y: 310, length: 140, orientation: "horizontal", pullDir: "right", lockedBy: "p2" },
    ],
    bumpers: [
      { x: 110, y: 320, radius: 22, color: "#ef4444", pulse: 0 },
      { x: 260, y: 380, radius: 22, color: "#00f5d4", pulse: 0 },
    ],
    walls: [
      { x: 60, y: 200, w: 16, h: 240 },
      { x: 190, y: 150, w: 14, h: 190 },
      { x: 330, y: 200, w: 16, h: 240 },
      { x: 100, y: 390, w: 90, h: 16, angle: 0.4, isBouncy: true },
      { x: 40, y: 480, w: 70, h: 16 },
    ],
    kibbles: [
      { x: 230, y: 70 }, { x: 250, y: 70 }, { x: 270, y: 70 },
      { x: 240, y: 100 }, { x: 260, y: 100 }
    ],
    treats: [
      { x: 250, y: 40 }
    ],
    hazards: [
      { x: 110, y: 70, type: "mud" },
      { x: 130, y: 70, type: "mud" },
      { x: 120, y: 100, type: "mud" }
    ],
    requiredKibble: 4,
  },
  {
    id: 12,
    name: "The Pin Labyrinth & Trampoline",
    difficulty: "hard",
    tutorial: "Pull in sequence: Pin 1 ➔ Pin 2 ➔ Pin 3 ➔ Pin 4! Watch for spikes!",
    bowl: { x: 200, y: 470, w: 90, h: 30 },
    dog: { x: 80, y: 460 },
    pins: [
      { id: "p1", x: 130, y: 120, length: 110, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 270, y: 120, length: 110, orientation: "horizontal", pullDir: "right" },
      { id: "p3", x: 200, y: 210, length: 140, orientation: "horizontal", pullDir: "left" },
      { id: "p4", x: 200, y: 310, length: 160, orientation: "horizontal", pullDir: "right", lockedBy: "p3" },
    ],
    bumpers: [
      { x: 140, y: 360, radius: 24, color: "#a855f7", pulse: 0 },
      { x: 260, y: 360, radius: 24, color: "#38bdf8", pulse: 0 },
    ],
    walls: [
      { x: 70, y: 230, w: 16, h: 320 },
      { x: 330, y: 230, w: 16, h: 320 },
      { x: 200, y: 80, w: 14, h: 90 },
      { x: 130, y: 410, w: 16, h: 120, angle: -0.3, isBouncy: true },
      { x: 270, y: 410, w: 16, h: 120, angle: 0.3, isBouncy: true },
    ],
    kibbles: [
      { x: 110, y: 50 }, { x: 130, y: 50 },
      { x: 260, y: 50 }, { x: 280, y: 50 }
    ],
    treats: [
      { x: 120, y: 25 }, { x: 270, y: 25 }
    ],
    hazards: [
      { x: 200, y: 165, type: "spikes" }
    ],
    requiredKibble: 3,
  },
  {
    id: 13,
    name: "Dual Pit Dilemma & Quad Pins",
    difficulty: "hard",
    tutorial: "Keep bones away from the empty pit using the dual spring bouncers!",
    bowl: { x: 200, y: 470, w: 90, h: 30 },
    dog: { x: 80, y: 460 },
    pins: [
      { id: "p1", x: 140, y: 140, length: 120, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 260, y: 140, length: 120, orientation: "horizontal", pullDir: "right" },
      { id: "p3", x: 200, y: 230, length: 170, orientation: "horizontal", pullDir: "left" },
      { id: "p4", x: 200, y: 320, length: 140, orientation: "vertical", pullDir: "down" },
      { id: "p5", x: 200, y: 390, length: 160, orientation: "horizontal", pullDir: "right", lockedBy: "p3" },
    ],
    bumpers: [
      { x: 130, y: 290, radius: 22, color: "#ffbe0b", pulse: 0 },
      { x: 270, y: 290, radius: 22, color: "#00f5d4", pulse: 0 },
    ],
    walls: [
      { x: 60, y: 230, w: 16, h: 300 },
      { x: 340, y: 230, w: 16, h: 300 },
      { x: 140, y: 410, w: 16, h: 130, angle: -0.3, isBouncy: true },
      { x: 260, y: 410, w: 16, h: 130, angle: 0.3, isBouncy: true },
    ],
    kibbles: [
      { x: 120, y: 70 }, { x: 140, y: 70 }, { x: 130, y: 95 },
      { x: 250, y: 70 }, { x: 270, y: 70 }, { x: 260, y: 95 }
    ],
    treats: [
      { x: 200, y: 45 }
    ],
    hazards: [
      { x: 140, y: 185, type: "mud" }
    ],
    requiredKibble: 4,
  },
  {
    id: 14,
    name: "The Spike Gauntlet & Pachinko Field",
    difficulty: "hard",
    tutorial: "Pull pins with precision to bounce treats safely through the spike gaps!",
    bowl: { x: 200, y: 470, w: 90, h: 30 },
    dog: { x: 80, y: 460 },
    pins: [
      { id: "p1", x: 150, y: 130, length: 130, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 250, y: 200, length: 130, orientation: "horizontal", pullDir: "right" },
      { id: "p3", x: 150, y: 280, length: 130, orientation: "horizontal", pullDir: "left" },
      { id: "p4", x: 250, y: 350, length: 130, orientation: "horizontal", pullDir: "right" },
      { id: "p5", x: 200, y: 410, length: 160, orientation: "horizontal", pullDir: "left", lockedBy: "p3" },
    ],
    bumpers: [
      { x: 200, y: 165, radius: 20, color: "#f43f5e", pulse: 0 },
      { x: 200, y: 245, radius: 20, color: "#00f5d4", pulse: 0 },
      { x: 200, y: 320, radius: 20, color: "#facc15", pulse: 0 },
    ],
    walls: [
      { x: 70, y: 240, w: 16, h: 340 },
      { x: 330, y: 240, w: 16, h: 340 },
    ],
    kibbles: [
      { x: 130, y: 65 }, { x: 150, y: 65 }, { x: 170, y: 65 },
      { x: 140, y: 95 }, { x: 160, y: 95 }
    ],
    treats: [
      { x: 150, y: 35 }, { x: 260, y: 35 }
    ],
    hazards: [
      { x: 260, y: 165, type: "spikes" },
      { x: 140, y: 245, type: "spikes" }
    ],
    requiredKibble: 4,
  },
  {
    id: 15,
    name: "Master Feast: Tuck's Grand Banquet",
    difficulty: "hard",
    tutorial: "The ultimate 5-pin challenge! Master the bouncy bumpers for a 3-star feast!",
    bowl: { x: 200, y: 470, w: 100, h: 32 },
    dog: { x: 75, y: 460 },
    pins: [
      { id: "p1", x: 130, y: 130, length: 110, orientation: "horizontal", pullDir: "left" },
      { id: "p2", x: 270, y: 130, length: 110, orientation: "horizontal", pullDir: "right" },
      { id: "p3", x: 200, y: 210, length: 160, orientation: "horizontal", pullDir: "left" },
      { id: "p4", x: 140, y: 310, length: 120, orientation: "horizontal", pullDir: "left", lockedBy: "p1" },
      { id: "p5", x: 260, y: 310, length: 120, orientation: "horizontal", pullDir: "right", lockedBy: "p2" },
      { id: "p6", x: 200, y: 390, length: 180, orientation: "horizontal", pullDir: "right", lockedBy: "p3" },
    ],
    bumpers: [
      { x: 130, y: 260, radius: 22, color: "#00f5d4", pulse: 0 },
      { x: 270, y: 260, radius: 22, color: "#ff007f", pulse: 0 },
      { x: 200, y: 350, radius: 24, color: "#facc15", pulse: 0 },
    ],
    walls: [
      { x: 60, y: 240, w: 16, h: 340 },
      { x: 340, y: 240, w: 16, h: 340 },
      { x: 200, y: 80, w: 14, h: 100 },
      { x: 130, y: 420, w: 16, h: 110, angle: -0.32, isBouncy: true },
      { x: 270, y: 420, w: 16, h: 110, angle: 0.32, isBouncy: true },
    ],
    kibbles: [
      { x: 110, y: 55 }, { x: 130, y: 55 }, { x: 150, y: 55 },
      { x: 120, y: 85 }, { x: 140, y: 85 },
      { x: 250, y: 55 }, { x: 270, y: 55 }, { x: 290, y: 55 },
      { x: 260, y: 85 }, { x: 280, y: 85 }
    ],
    treats: [
      { x: 130, y: 25 }, { x: 200, y: 165 }, { x: 270, y: 25 }
    ],
    hazards: [
      { x: 130, y: 255, type: "mud" },
      { x: 270, y: 255, type: "spikes" }
    ],
    requiredKibble: 6,
  },
];
