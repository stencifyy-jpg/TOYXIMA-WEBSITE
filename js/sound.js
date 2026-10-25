// TOYXIMA Toys - Web Audio API Playful Sound Synthesizer
import { store } from './store.js';

class SoundEffects {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Playful bubble/pop sound (for clicks, filter selection)
  playPop() {
    if (!store.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {}
  }

  // Playful magic sparkle chime (for Princess doll, add to cart, wishlist)
  playSparkle() {
    if (!store.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      const now = this.ctx.currentTime;

      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + (idx * 0.05);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.24);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.26);
      });
    } catch (e) {}
  }

  // Fairy magical harp arpeggio (for Princess Realm)
  playMagicChime() {
    if (!store.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [659.25, 830.61, 987.77, 1318.51, 1661.22, 1975.53]; // E5, G#5, B5, E6, G#6, B6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + (idx * 0.045);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.38);
      });
    } catch (e) {}
  }

  // RC Drift Car powerslide & tire screech sound synthesis
  playDrift() {
    if (!store.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 1. High frequency tire screech friction
      const screechOsc = this.ctx.createOscillator();
      const screechGain = this.ctx.createGain();
      screechOsc.type = 'sawtooth';
      screechOsc.frequency.setValueAtTime(1400, now);
      screechOsc.frequency.exponentialRampToValueAtTime(2200, now + 0.15);
      screechOsc.frequency.exponentialRampToValueAtTime(1100, now + 0.4);

      screechGain.gain.setValueAtTime(0.08, now);
      screechGain.gain.exponentialRampToValueAtTime(0.12, now + 0.15);
      screechGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      screechOsc.connect(screechGain);
      screechGain.connect(this.ctx.destination);
      screechOsc.start(now);
      screechOsc.stop(now + 0.46);

      // 2. Deep brushless motor engine rev rumble
      const engineOsc = this.ctx.createOscillator();
      const engineGain = this.ctx.createGain();
      engineOsc.type = 'triangle';
      engineOsc.frequency.setValueAtTime(120, now);
      engineOsc.frequency.exponentialRampToValueAtTime(260, now + 0.18);
      engineOsc.frequency.exponentialRampToValueAtTime(95, now + 0.45);

      engineGain.gain.setValueAtTime(0.15, now);
      engineGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      engineOsc.connect(engineGain);
      engineGain.connect(this.ctx.destination);
      engineOsc.start(now);
      engineOsc.stop(now + 0.46);
    } catch (e) {}
  }

  // Soft swoosh for modal close or drawer
  playSwoosh() {
    if (!store.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {}
  }

  // Cheerful toy horn / honk
  playHonk() {
    if (!store.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [330, 440].forEach(f => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      });
    } catch (e) {}
  }
}

export const sounds = new SoundEffects();
