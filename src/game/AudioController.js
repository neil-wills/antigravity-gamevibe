// Procedural Web Audio API Sound Synthesizer for Puppy Pin Rescue
class SoundController {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('puppy_muted') === 'true';
    this.mowerOsc = null;
    this.mowerGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('puppy_muted', this.muted);
    if (this.muted && this.mowerGain) {
      this.stopMower();
    }
    return this.muted;
  }

  // Playful, resonant cartoon dog bark with rich dual-harmonic acoustic body
  playBark(pitchMultiplier = 1.0, isDouble = null) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const playSingleBark = (startTime, pitch, volume = 0.32) => {
      const t = startTime;

      // Primary body oscillator (throat / vocal formant)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'triangle';
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(650 * pitch, t);
      filter.Q.setValueAtTime(2.8, t);

      // Natural pitch drop contour
      osc1.frequency.setValueAtTime(480 * pitch, t);
      osc1.frequency.exponentialRampToValueAtTime(160 * pitch, t + 0.13);

      gain1.gain.setValueAtTime(0.01, t);
      gain1.gain.linearRampToValueAtTime(volume, t + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc1.connect(filter);
      filter.connect(gain1);
      gain1.connect(this.ctx.destination);

      osc1.start(t);
      osc1.stop(t + 0.16);

      // Secondary chest/sub resonance for warm acoustic canine punch
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(220 * pitch, t);
      osc2.frequency.exponentialRampToValueAtTime(110 * pitch, t + 0.11);

      gain2.gain.setValueAtTime(0.01, t);
      gain2.gain.linearRampToValueAtTime(volume * 0.45, t + 0.015);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc2.start(t);
      osc2.stop(t + 0.14);
    };

    const t = this.ctx.currentTime;
    playSingleBark(t, pitchMultiplier, 0.32);

    // Random or requested double woof ("Woof-woof!")
    const shouldDouble = isDouble !== null ? isDouble : Math.random() < 0.4;
    if (shouldDouble) {
      playSingleBark(t + 0.13, pitchMultiplier * 1.08, 0.28);
    }
  }

  // Play breed-tuned bark
  playBreedBark(breedId = 'tuck') {
    const pitches = {
      tuck: 0.94,     // Warm, bouncy doodle woof
      waffles: 1.26,  // Energetic, high-spirited corgi yip
      barnaby: 0.82,  // Hearty, deep golden retriever bark
      buster: 1.10,   // Playful frenchie snort-woof
      mochi: 1.25,    // Sassy shiba inu awoo/yip
      coco: 1.34,     // Bright, melodic poodle bark
    };
    this.playBark(pitches[breedId] || 1.0);
  }

  // Pin sliding out sound (crisp metallic cotter-pin slide & swoosh)
  playPinSlide() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Harmonic 1: Metallic chime
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(480, t);
    osc1.frequency.exponentialRampToValueAtTime(1250, t + 0.18);

    gain1.gain.setValueAtTime(0.01, t);
    gain1.gain.linearRampToValueAtTime(0.22, t + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.24);

    // Harmonic 2: High metallic resonance
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1400, t);
    osc2.frequency.exponentialRampToValueAtTime(2200, t + 0.15);

    gain2.gain.setValueAtTime(0.08, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(t);
    osc2.stop(t + 0.18);
  }


  // Kibble dropping in bowl
  playKibbleDrop() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    
    osc.frequency.setValueAtTime(randomNote, t);
    osc.frequency.exponentialRampToValueAtTime(randomNote * 0.9, t + 0.08);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  // Golden treat bonus chime
  playTreatBonus() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + idx * 0.05;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.28);
    });
  }

  // Walking paw step
  playStep() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.04);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Comical poop toot/drop sound
  playPoop() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.25);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  // Comical poop explosion sound when run over by mower
  playPoopExplosion() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(340, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.24);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.28);
  }

  // Poop scooper clean up sound
  playScoop() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.15);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  // Ball throw / frisbee whoosh
  playThrow() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.15);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  // Catch sound
  playCatch() {
    if (this.muted) return;
    this.playBark(1.2);
  }

  // Cute playful critter squeak / chirp when bunny hops or squirrel scampers
  playCritterSqueak() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.linearRampToValueAtTime(1850, t + 0.05);
    osc.frequency.linearRampToValueAtTime(1200, t + 0.11);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  // Start lawn mower engine hum
  startMower() {
    if (this.muted || this.mowerOsc) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    this.mowerOsc = this.ctx.createOscillator();
    this.mowerGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    this.mowerOsc.type = 'sawtooth';
    this.mowerOsc.frequency.setValueAtTime(75, t); // deep engine rumble

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);

    this.mowerGain.gain.setValueAtTime(0.01, t);
    this.mowerGain.gain.linearRampToValueAtTime(0.12, t + 0.2);

    this.mowerOsc.connect(filter);
    filter.connect(this.mowerGain);
    this.mowerGain.connect(this.ctx.destination);

    this.mowerOsc.start(t);
  }

  // Stop lawn mower
  stopMower() {
    if (!this.mowerOsc || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.mowerGain.gain.linearRampToValueAtTime(0.001, t + 0.1);
    setTimeout(() => {
      if (this.mowerOsc) {
        try {
          this.mowerOsc.stop();
          this.mowerOsc.disconnect();
        } catch (e) {}
        this.mowerOsc = null;
        this.mowerGain = null;
      }
    }, 120);
  }

  // Level Complete Win Fanfare
  playWinFanfare() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // C - E - G - C arpeggio
    const chords = [523.25, 659.25, 783.99, 1046.50];
    chords.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = t + idx * 0.12;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + (idx === 3 ? 0.6 : 0.25));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + (idx === 3 ? 0.65 : 0.3));
    });
  }
}

export const AudioFX = new SoundController();
