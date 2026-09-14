// Procedural Web Audio API Sound Synthesizer for Puppy Pin Rescue
class SoundController {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('puppy_muted') === 'true';
    this.mowerNodes = null;
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
    if (this.muted && this.mowerNodes) {
      this.stopMower();
    }
    // Dispatch global event so all components and HUDs update their mute state in real time!
    try {
      window.dispatchEvent(
        new CustomEvent('puppy_audio_mute_changed', { detail: { muted: this.muted } })
      );
    } catch (e) {}
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

  // Playful rubber ball bounce sound
  playBounce() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.09);

    gain.gain.setValueAtTime(0.24, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.11);
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

  // Start realistic multi-layered lawn mower engine
  startMower() {
    if (this.muted || this.mowerNodes) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Master Mower Gain
    const mainGain = this.ctx.createGain();
    mainGain.gain.setValueAtTime(0.001, t);
    mainGain.gain.linearRampToValueAtTime(0.12, t + 0.25);
    mainGain.connect(this.ctx.destination);

    // 1. Engine Cylinder Resonant Filter
    const engineFilter = this.ctx.createBiquadFilter();
    engineFilter.type = 'lowpass';
    engineFilter.frequency.setValueAtTime(320, t);
    engineFilter.Q.setValueAtTime(2.4, t);
    engineFilter.connect(mainGain);

    // 2. Dual Engine Oscillators (Sawtooth + Triangle)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(52, t); // 52 Hz deep 4-stroke throb

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(104, t); // second harmonic body

    // 3. Engine Putter / Stroke LFO (Amplitude Modulation for realistic "put-put-put" pulse)
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(17, t); // 17 strokes/sec idle

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.24, t);

    const enginePutterGain = this.ctx.createGain();
    enginePutterGain.gain.setValueAtTime(0.76, t);
    lfo.connect(lfoGain);
    lfoGain.connect(enginePutterGain.gain);

    osc1.connect(enginePutterGain);
    osc2.connect(enginePutterGain);
    enginePutterGain.connect(engineFilter);

    // 4. Spinning Blade Airflow & Deck Turbulence (Filtered Noise)
    const bufferSize = Math.floor(this.ctx.sampleRate * 1.5);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.025 * white) / 1.025; // warm pink noise
      lastOut = output[i];
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Bandpass filter for blade slicing whoosh
    const bladeFilter = this.ctx.createBiquadFilter();
    bladeFilter.type = 'bandpass';
    bladeFilter.frequency.setValueAtTime(460, t);
    bladeFilter.Q.setValueAtTime(1.9, t);

    const bladeGain = this.ctx.createGain();
    bladeGain.gain.setValueAtTime(0.09, t);

    noiseSource.connect(bladeFilter);
    bladeFilter.connect(bladeGain);
    bladeGain.connect(mainGain);

    // Crank ignition sputter ramp
    osc1.frequency.setValueAtTime(35, t);
    osc1.frequency.exponentialRampToValueAtTime(52, t + 0.22);
    osc2.frequency.setValueAtTime(70, t);
    osc2.frequency.exponentialRampToValueAtTime(104, t + 0.22);

    osc1.start(t);
    osc2.start(t);
    lfo.start(t);
    noiseSource.start(t);

    this.mowerNodes = {
      osc1,
      osc2,
      lfo,
      noiseSource,
      engineFilter,
      bladeFilter,
      bladeGain,
      mainGain,
      isRevving: false,
    };
  }

  // Dynamic throttle revving when mower is actively driving
  setMowerThrottle(isDriving) {
    if (!this.mowerNodes || !this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const { osc1, osc2, lfo, engineFilter, bladeFilter, bladeGain, isRevving } = this.mowerNodes;

    if (isDriving && !isRevving) {
      this.mowerNodes.isRevving = true;
      osc1.frequency.linearRampToValueAtTime(70, t + 0.2);
      osc2.frequency.linearRampToValueAtTime(140, t + 0.2);
      lfo.frequency.linearRampToValueAtTime(24, t + 0.2);
      engineFilter.frequency.linearRampToValueAtTime(480, t + 0.2);
      bladeFilter.frequency.linearRampToValueAtTime(580, t + 0.2);
      bladeGain.gain.linearRampToValueAtTime(0.15, t + 0.2);
    } else if (!isDriving && isRevving) {
      this.mowerNodes.isRevving = false;
      osc1.frequency.linearRampToValueAtTime(52, t + 0.25);
      osc2.frequency.linearRampToValueAtTime(104, t + 0.25);
      lfo.frequency.linearRampToValueAtTime(17, t + 0.25);
      engineFilter.frequency.linearRampToValueAtTime(320, t + 0.25);
      bladeFilter.frequency.linearRampToValueAtTime(460, t + 0.25);
      bladeGain.gain.linearRampToValueAtTime(0.09, t + 0.25);
    }
  }

  // Stop lawn mower with realistic spin-down
  stopMower() {
    if (!this.mowerNodes || !this.ctx) return;
    const t = this.ctx.currentTime;
    const { mainGain, osc1, osc2, lfo, noiseSource } = this.mowerNodes;

    try {
      mainGain.gain.linearRampToValueAtTime(0.001, t + 0.18);
      osc1.frequency.exponentialRampToValueAtTime(25, t + 0.18);
      osc2.frequency.exponentialRampToValueAtTime(50, t + 0.18);
    } catch (e) {}

    const nodesToStop = this.mowerNodes;
    this.mowerNodes = null;

    setTimeout(() => {
      try {
        nodesToStop.osc1.stop();
        nodesToStop.osc2.stop();
        nodesToStop.lfo.stop();
        nodesToStop.noiseSource.stop();
        nodesToStop.osc1.disconnect();
        nodesToStop.osc2.disconnect();
        nodesToStop.lfo.disconnect();
        nodesToStop.noiseSource.disconnect();
        nodesToStop.mainGain.disconnect();
      } catch (e) {}
    }, 200);
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
