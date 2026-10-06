/**
 * Dependency-free WebAudio soundscape for Crystal Labyrinth.
 *
 * No AudioContext is created until `unlock()` runs from a user gesture. By
 * default the manager installs lightweight pointer/key/touch unlock listeners.
 */

export const AUDIO_CUES = Object.freeze({
  PICKUP: "pickup",
  CHUNK: "chunk",
  RESONANCE: "resonance",
  FIRE: "fire",
  CHARGE: "charge",
  CHARGE_READY: "charge-ready",
  HIT: "hit",
  HEART: "heart",
  DOOR: "door",
  LOCKED: "locked",
  ENEMY: "enemy",
  WIN: "win",
  UI: "ui",
});

const CUE_ALIASES = Object.freeze({
  shard: AUDIO_CUES.PICKUP,
  crystal: AUDIO_CUES.PICKUP,
  crystalChunk: AUDIO_CUES.CHUNK,
  laser: AUDIO_CUES.FIRE,
  laserCharge: AUDIO_CUES.CHARGE,
  damage: AUDIO_CUES.HIT,
  heal: AUDIO_CUES.HEART,
  unlock: AUDIO_CUES.DOOR,
  blocked: AUDIO_CUES.LOCKED,
  alert: AUDIO_CUES.ENEMY,
  victory: AUDIO_CUES.WIN,
  click: AUDIO_CUES.UI,
});

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const positive = (value) => Math.max(0.0001, value);

function browserAudioContextClass() {
  if (typeof globalThis === "undefined") return null;
  return globalThis.AudioContext ?? globalThis.webkitAudioContext ?? null;
}

export class AudioManager {
  constructor({
    masterVolume = 0.55,
    sfxVolume = 0.8,
    ambienceVolume = 0.2,
    muted = false,
    ambience = true,
    autoUnlock = true,
    unlockTarget = typeof window !== "undefined" ? window : null,
    AudioContextClass = browserAudioContextClass(),
  } = {}) {
    this.masterVolume = clamp(Number(masterVolume) || 0, 0, 1);
    this.sfxVolume = clamp(Number(sfxVolume) || 0, 0, 1);
    this.ambienceVolume = clamp(Number(ambienceVolume) || 0, 0, 1);
    this.muted = Boolean(muted);

    this._AudioContextClass = AudioContextClass;
    this._context = null;
    this._masterGain = null;
    this._sfxGain = null;
    this._ambienceGain = null;
    this._compressor = null;
    this._noiseBuffer = null;
    this._brownNoiseBuffer = null;

    this._sources = new Set();
    this._cleanupTimers = new Set();
    this._ambienceWanted = Boolean(ambience);
    this._ambienceRoot = null;
    this._ambienceSources = [];
    this._ambienceNodes = [];
    this._ambienceTimer = null;

    this._unlockTarget = null;
    this._unlockPromise = null;
    this._destroyed = false;
    this._onUserGesture = this._onUserGesture.bind(this);
    this._gestureOptions = { capture: true, passive: true };

    if (autoUnlock) this.bindUnlock(unlockTarget);
  }

  get supported() {
    return Boolean(this._AudioContextClass);
  }

  get unlocked() {
    return this._context?.state === "running";
  }

  get state() {
    if (this._destroyed) return "closed";
    return this._context?.state ?? (this.supported ? "locked" : "unsupported");
  }

  get context() {
    return this._context;
  }

  bindUnlock(target = typeof window !== "undefined" ? window : null) {
    if (!target?.addEventListener || this._destroyed) return this;
    if (this._unlockTarget === target) return this;

    this.unbindUnlock();
    this._unlockTarget = target;
    target.addEventListener("pointerdown", this._onUserGesture, this._gestureOptions);
    target.addEventListener("keydown", this._onUserGesture, this._gestureOptions);
    target.addEventListener("touchend", this._onUserGesture, this._gestureOptions);
    return this;
  }

  unbindUnlock() {
    if (!this._unlockTarget?.removeEventListener) {
      this._unlockTarget = null;
      return this;
    }

    this._unlockTarget.removeEventListener(
      "pointerdown",
      this._onUserGesture,
      this._gestureOptions,
    );
    this._unlockTarget.removeEventListener(
      "keydown",
      this._onUserGesture,
      this._gestureOptions,
    );
    this._unlockTarget.removeEventListener(
      "touchend",
      this._onUserGesture,
      this._gestureOptions,
    );
    this._unlockTarget = null;
    return this;
  }

  _onUserGesture() {
    void this.unlock();
  }

  async unlock() {
    if (this._destroyed || !this.supported) return false;
    if (this._unlockPromise) return this._unlockPromise;

    this._unlockPromise = this._performUnlock();
    try {
      return await this._unlockPromise;
    } finally {
      this._unlockPromise = null;
    }
  }

  async _performUnlock() {
    try {
      if (!this._context) {
        this._context = new this._AudioContextClass();
        this._createAudioGraph();
      }

      if (this._context.state === "suspended" || this._context.state === "interrupted") {
        await this._context.resume();
      }

      if (this._context.state !== "running") return false;

      this.unbindUnlock();
      if (this._ambienceWanted) this._startAmbienceGraph();
      return true;
    } catch (error) {
      console.warn("Crystal Labyrinth audio could not be unlocked.", error);
      return false;
    }
  }

  _createAudioGraph() {
    const context = this._context;
    const now = context.currentTime;

    this._masterGain = context.createGain();
    this._sfxGain = context.createGain();
    this._ambienceGain = context.createGain();
    this._compressor = context.createDynamicsCompressor();

    this._masterGain.gain.setValueAtTime(this.muted ? 0 : this.masterVolume, now);
    this._sfxGain.gain.setValueAtTime(this.sfxVolume, now);
    this._ambienceGain.gain.setValueAtTime(this.ambienceVolume, now);

    this._compressor.threshold.setValueAtTime(-16, now);
    this._compressor.knee.setValueAtTime(18, now);
    this._compressor.ratio.setValueAtTime(5, now);
    this._compressor.attack.setValueAtTime(0.004, now);
    this._compressor.release.setValueAtTime(0.18, now);

    this._sfxGain.connect(this._masterGain);
    this._ambienceGain.connect(this._masterGain);
    this._masterGain.connect(this._compressor);
    this._compressor.connect(context.destination);
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    this._rampGain(this._masterGain?.gain, this.muted ? 0 : this.masterVolume, 0.035);
    return this.muted;
  }

  toggleMute() {
    return this.setMuted(!this.muted);
  }

  setMasterVolume(volume) {
    this.masterVolume = clamp(Number(volume) || 0, 0, 1);
    if (!this.muted) this._rampGain(this._masterGain?.gain, this.masterVolume, 0.035);
    return this.masterVolume;
  }

  setSfxVolume(volume) {
    this.sfxVolume = clamp(Number(volume) || 0, 0, 1);
    this._rampGain(this._sfxGain?.gain, this.sfxVolume, 0.035);
    return this.sfxVolume;
  }

  setAmbienceVolume(volume) {
    this.ambienceVolume = clamp(Number(volume) || 0, 0, 1);
    this._rampGain(this._ambienceGain?.gain, this.ambienceVolume, 0.08);
    return this.ambienceVolume;
  }

  _rampGain(parameter, target, duration) {
    if (!parameter || !this._context || this._context.state === "closed") return;
    const now = this._context.currentTime;
    const current = Number.isFinite(parameter.value) ? parameter.value : target;
    parameter.cancelScheduledValues(now);
    parameter.setValueAtTime(current, now);
    parameter.linearRampToValueAtTime(target, now + duration);
  }

  /**
   * Plays a synthesized cue. Returns false while WebAudio is still locked.
   * Options: volume (0..1), pan (-1..1), pitch (semitones), delay (seconds).
   */
  play(cue, options = {}) {
    if (this._destroyed || this.muted || !this._context || !this._sfxGain) return false;
    if (this._context.state === "closed") return false;

    if (this._context.state !== "running") void this.unlock();

    const name = CUE_ALIASES[cue] ?? cue;
    const volume = clamp(Number(options.volume ?? 1), 0, 1.5);
    const pan = clamp(Number(options.pan ?? 0), -1, 1);
    const pitch = 2 ** (Number(options.pitch ?? 0) / 12);
    const time = this._context.currentTime + 0.004 + Math.max(0, Number(options.delay) || 0);
    const cueOptions = { volume, pan, pitch, variant: options.variant };

    switch (name) {
      case AUDIO_CUES.PICKUP:
        this._cuePickup(time, cueOptions);
        break;
      case AUDIO_CUES.CHUNK:
        this._cueChunk(time, cueOptions);
        break;
      case AUDIO_CUES.RESONANCE:
        this._cueResonance(time, cueOptions);
        break;
      case AUDIO_CUES.FIRE:
        this._cueFire(time, cueOptions);
        break;
      case AUDIO_CUES.CHARGE:
        this._cueCharge(time, cueOptions);
        break;
      case AUDIO_CUES.CHARGE_READY:
        this._cueChargeReady(time, cueOptions);
        break;
      case AUDIO_CUES.HIT:
        this._cueHit(time, cueOptions);
        break;
      case AUDIO_CUES.HEART:
        this._cueHeart(time, cueOptions);
        break;
      case AUDIO_CUES.DOOR:
        this._cueDoor(time, cueOptions);
        break;
      case AUDIO_CUES.LOCKED:
        this._cueLocked(time, cueOptions);
        break;
      case AUDIO_CUES.ENEMY:
        this._cueEnemy(time, cueOptions);
        break;
      case AUDIO_CUES.WIN:
        this._cueWin(time, cueOptions);
        break;
      case AUDIO_CUES.UI:
        this._cueUi(time, cueOptions);
        break;
      default:
        return false;
    }

    return true;
  }

  playCue(cue, options) {
    return this.play(cue, options);
  }

  pickup(options) { return this.play(AUDIO_CUES.PICKUP, options); }
  chunk(options) { return this.play(AUDIO_CUES.CHUNK, options); }
  resonance(options) { return this.play(AUDIO_CUES.RESONANCE, options); }
  fire(options) { return this.play(AUDIO_CUES.FIRE, options); }
  charge(options) { return this.play(AUDIO_CUES.CHARGE, options); }
  chargeReady(options) { return this.play(AUDIO_CUES.CHARGE_READY, options); }
  hit(options) { return this.play(AUDIO_CUES.HIT, options); }
  heart(options) { return this.play(AUDIO_CUES.HEART, options); }
  door(options) { return this.play(AUDIO_CUES.DOOR, options); }
  locked(options) { return this.play(AUDIO_CUES.LOCKED, options); }
  enemy(options) { return this.play(AUDIO_CUES.ENEMY, options); }
  win(options) { return this.play(AUDIO_CUES.WIN, options); }
  ui(options) { return this.play(AUDIO_CUES.UI, options); }

  _cuePickup(time, { volume, pan, pitch }) {
    const shimmer = 1 + (Math.random() - 0.5) * 0.035;
    this._tone({
      time,
      duration: 0.09,
      frequency: 690 * pitch * shimmer,
      endFrequency: 980 * pitch * shimmer,
      type: "triangle",
      gain: 0.09 * volume,
      pan,
    });
    this._tone({
      time: time + 0.055,
      duration: 0.15,
      frequency: 1040 * pitch * shimmer,
      endFrequency: 1370 * pitch * shimmer,
      type: "sine",
      gain: 0.065 * volume,
      pan,
    });
  }

  _cueChunk(time, { volume, pan, pitch }) {
    this._tone({
      time,
      duration: 0.24,
      frequency: 310 * pitch,
      endFrequency: 420 * pitch,
      type: "triangle",
      gain: 0.105 * volume,
      pan,
    });
    [620, 830, 1110].forEach((frequency, index) => {
      this._tone({
        time: time + 0.045 * index,
        duration: 0.23 + index * 0.03,
        frequency: frequency * pitch,
        endFrequency: frequency * 1.08 * pitch,
        type: index === 0 ? "triangle" : "sine",
        gain: 0.064 * volume,
        pan: pan + (index - 1) * 0.08,
      });
    });
  }

  _cueResonance(time, { volume, pan, pitch }) {
    [220, 329.63, 440, 659.25].forEach((frequency, index) => {
      this._tone({
        time: time + index * 0.035,
        duration: 1.05 + index * 0.09,
        frequency: frequency * pitch,
        endFrequency: frequency * 1.012 * pitch,
        type: index < 2 ? "triangle" : "sine",
        gain: (0.054 - index * 0.005) * volume,
        attack: 0.06,
        release: 0.75,
        pan: pan + (index % 2 === 0 ? -0.22 : 0.22),
      });
    });
  }

  _cueFire(time, { volume, pan, pitch }) {
    this._tone({
      time,
      duration: 0.14,
      frequency: 920 * pitch,
      endFrequency: 125 * pitch,
      type: "sawtooth",
      gain: 0.09 * volume,
      release: 0.11,
      pan,
      filter: { type: "lowpass", frequency: 2300, q: 0.9 },
    });
    this._noise({
      time,
      duration: 0.08,
      gain: 0.075 * volume,
      pan,
      filter: { type: "bandpass", frequency: 1550, q: 0.8 },
    });
  }

  _cueCharge(time, { volume, pan, pitch }) {
    this._tone({
      time,
      duration: 0.16,
      frequency: 250 * pitch,
      endFrequency: 390 * pitch,
      type: "triangle",
      gain: 0.045 * volume,
      attack: 0.025,
      release: 0.1,
      pan,
      filter: { type: "bandpass", frequency: 980 * pitch, q: 0.75 },
    });
  }

  _cueChargeReady(time, { volume, pan, pitch }) {
    [520, 780].forEach((frequency, index) => {
      this._tone({
        time: time + index * 0.035,
        duration: 0.24,
        frequency: frequency * pitch,
        endFrequency: frequency * 1.18 * pitch,
        type: index === 0 ? "triangle" : "sine",
        gain: (0.065 - index * 0.012) * volume,
        attack: 0.012,
        release: 0.17,
        pan: pan + (index === 0 ? -0.05 : 0.05),
      });
    });
  }

  _cueHit(time, { volume, pan, pitch }) {
    this._noise({
      time,
      duration: 0.18,
      gain: 0.14 * volume,
      pan,
      filter: { type: "lowpass", frequency: 720, q: 0.5 },
    });
    this._tone({
      time,
      duration: 0.19,
      frequency: 118 * pitch,
      endFrequency: 58 * pitch,
      type: "square",
      gain: 0.08 * volume,
      release: 0.15,
      pan,
      filter: { type: "lowpass", frequency: 480, q: 0.7 },
    });
  }

  _cueHeart(time, { volume, pan, pitch }) {
    [392, 523.25, 659.25].forEach((frequency, index) => {
      this._tone({
        time: time + index * 0.105,
        duration: 0.3,
        frequency: frequency * pitch,
        endFrequency: frequency * 1.02 * pitch,
        type: "sine",
        gain: 0.07 * volume,
        attack: 0.015,
        release: 0.2,
        pan: pan + (index - 1) * 0.05,
      });
    });
  }

  _cueDoor(time, { volume, pan, pitch }) {
    this._noise({
      time,
      duration: 0.95,
      gain: 0.12 * volume,
      pan,
      filter: { type: "lowpass", frequency: 190, q: 0.5 },
      attack: 0.04,
      release: 0.5,
    });
    this._tone({
      time,
      duration: 1.05,
      frequency: 62 * pitch,
      endFrequency: 42 * pitch,
      type: "sine",
      gain: 0.095 * volume,
      attack: 0.04,
      release: 0.62,
      pan,
    });
    [146.83, 220, 293.66].forEach((frequency, index) => {
      this._tone({
        time: time + 0.26 + index * 0.055,
        duration: 0.72,
        frequency: frequency * pitch,
        endFrequency: frequency * 1.01 * pitch,
        type: "triangle",
        gain: 0.045 * volume,
        attack: 0.08,
        release: 0.48,
        pan: pan + (index - 1) * 0.12,
      });
    });
  }

  _cueLocked(time, { volume, pan, pitch }) {
    [175, 139].forEach((frequency, index) => {
      this._tone({
        time: time + index * 0.115,
        duration: 0.1,
        frequency: frequency * pitch,
        endFrequency: frequency * 0.83 * pitch,
        type: "square",
        gain: 0.06 * volume,
        release: 0.07,
        pan,
        filter: { type: "lowpass", frequency: 720, q: 0.5 },
      });
    });
  }

  _cueEnemy(time, { volume, pan, pitch }) {
    this._tone({
      time,
      duration: 0.32,
      frequency: 112 * pitch,
      endFrequency: 56 * pitch,
      type: "sawtooth",
      gain: 0.07 * volume,
      release: 0.22,
      pan,
      filter: { type: "lowpass", frequency: 430, q: 1.2 },
    });
    this._noise({
      time: time + 0.015,
      duration: 0.24,
      gain: 0.09 * volume,
      pan,
      filter: { type: "bandpass", frequency: 310, q: 1.5 },
      release: 0.18,
    });
  }

  _cueWin(time, { volume, pan, pitch }) {
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      this._tone({
        time: time + [0, 0.13, 0.26, 0.43][index],
        duration: 0.54,
        frequency: frequency * pitch,
        endFrequency: frequency * 1.012 * pitch,
        type: index < 2 ? "triangle" : "sine",
        gain: 0.075 * volume,
        release: 0.37,
        pan: pan + (index % 2 === 0 ? -0.16 : 0.16),
      });
    });

    [523.25, 659.25, 783.99].forEach((frequency, index) => {
      this._tone({
        time: time + 0.62,
        duration: 1.1,
        frequency: frequency * pitch,
        endFrequency: frequency * 1.008 * pitch,
        type: "sine",
        gain: 0.045 * volume,
        attack: 0.035,
        release: 0.78,
        pan: pan + (index - 1) * 0.24,
      });
    });
  }

  _cueUi(time, { volume, pan, pitch, variant }) {
    const baseFrequency = variant === "back" ? 390 : variant === "confirm" ? 760 : 560;
    const direction = variant === "back" ? 0.82 : 1.12;
    this._tone({
      time,
      duration: 0.055,
      frequency: baseFrequency * pitch,
      endFrequency: baseFrequency * direction * pitch,
      type: "square",
      gain: 0.037 * volume,
      release: 0.037,
      pan,
      filter: { type: "lowpass", frequency: 1900, q: 0.4 },
    });
  }

  _tone({
    time,
    duration,
    frequency,
    endFrequency = frequency,
    type = "sine",
    gain = 0.06,
    attack = 0.006,
    release = Math.min(0.08, duration * 0.6),
    detune = 0,
    pan = 0,
    filter = null,
    destination = this._sfxGain,
  }) {
    if (!this._context || !destination) return null;

    const context = this._context;
    const start = Math.max(context.currentTime, time);
    const end = start + Math.max(0.012, duration);
    const attackEnd = Math.min(end, start + Math.max(0.001, attack));
    const releaseStart = Math.max(attackEnd, end - Math.max(0.005, release));
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const nodes = [envelope];

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(positive(frequency), start);
    oscillator.frequency.exponentialRampToValueAtTime(positive(endFrequency), end);
    oscillator.detune.setValueAtTime(detune, start);

    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.linearRampToValueAtTime(positive(gain), attackEnd);
    envelope.gain.setValueAtTime(positive(gain), releaseStart);
    envelope.gain.exponentialRampToValueAtTime(0.0001, end);

    let previous = oscillator;
    if (filter) {
      const filterNode = context.createBiquadFilter();
      filterNode.type = filter.type ?? "lowpass";
      filterNode.frequency.setValueAtTime(positive(filter.frequency ?? 1200), start);
      filterNode.Q.setValueAtTime(Math.max(0.0001, filter.q ?? 0.7), start);
      previous.connect(filterNode);
      previous = filterNode;
      nodes.push(filterNode);
    }

    previous.connect(envelope);
    this._connectWithPan(envelope, destination, pan, nodes);
    this._trackSource(oscillator, nodes);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
    return oscillator;
  }

  _noise({
    time,
    duration,
    gain = 0.06,
    attack = 0.003,
    release = Math.min(0.1, duration * 0.7),
    pan = 0,
    filter = null,
    destination = this._sfxGain,
  }) {
    if (!this._context || !destination) return null;

    const context = this._context;
    const start = Math.max(context.currentTime, time);
    const end = start + Math.max(0.012, duration);
    const attackEnd = Math.min(end, start + Math.max(0.001, attack));
    const releaseStart = Math.max(attackEnd, end - Math.max(0.005, release));
    const source = context.createBufferSource();
    const envelope = context.createGain();
    const nodes = [envelope];

    source.buffer = this._getNoiseBuffer();
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.linearRampToValueAtTime(positive(gain), attackEnd);
    envelope.gain.setValueAtTime(positive(gain), releaseStart);
    envelope.gain.exponentialRampToValueAtTime(0.0001, end);

    let previous = source;
    if (filter) {
      const filterNode = context.createBiquadFilter();
      filterNode.type = filter.type ?? "bandpass";
      filterNode.frequency.setValueAtTime(positive(filter.frequency ?? 900), start);
      filterNode.Q.setValueAtTime(Math.max(0.0001, filter.q ?? 0.8), start);
      previous.connect(filterNode);
      previous = filterNode;
      nodes.push(filterNode);
    }

    previous.connect(envelope);
    this._connectWithPan(envelope, destination, pan, nodes);
    this._trackSource(source, nodes);

    const availableOffset = Math.max(0, source.buffer.duration - duration - 0.01);
    source.start(start, Math.random() * availableOffset);
    source.stop(end + 0.02);
    return source;
  }

  _connectWithPan(source, destination, pan, nodes) {
    if (typeof this._context.createStereoPanner === "function") {
      const panner = this._context.createStereoPanner();
      panner.pan.setValueAtTime(clamp(pan, -1, 1), this._context.currentTime);
      source.connect(panner);
      panner.connect(destination);
      nodes.push(panner);
    } else {
      source.connect(destination);
    }
  }

  _trackSource(source, nodes = []) {
    this._sources.add(source);
    source.onended = () => {
      this._sources.delete(source);
      try { source.disconnect(); } catch {}
      for (const node of nodes) {
        try { node.disconnect(); } catch {}
      }
    };
  }

  _getNoiseBuffer() {
    if (this._noiseBuffer) return this._noiseBuffer;

    const context = this._context;
    const length = context.sampleRate * 2;
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < length; index += 1) {
      channel[index] = Math.random() * 2 - 1;
    }
    this._noiseBuffer = buffer;
    return buffer;
  }

  _getBrownNoiseBuffer() {
    if (this._brownNoiseBuffer) return this._brownNoiseBuffer;

    const context = this._context;
    const length = context.sampleRate * 4;
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const channel = buffer.getChannelData(0);
    let previous = 0;

    for (let index = 0; index < length; index += 1) {
      const white = Math.random() * 2 - 1;
      previous = (previous + 0.018 * white) / 1.018;
      channel[index] = previous * 3.2;
    }

    this._brownNoiseBuffer = buffer;
    return buffer;
  }

  startAmbience() {
    this._ambienceWanted = true;
    if (this.unlocked) this._startAmbienceGraph();
    return Boolean(this._ambienceRoot);
  }

  stopAmbience({ fade = 0.4 } = {}) {
    this._ambienceWanted = false;
    this._stopAmbienceGraph(Math.max(0, Number(fade) || 0));
  }

  _startAmbienceGraph() {
    if (this._ambienceRoot || !this._context || !this._ambienceGain) return;

    const context = this._context;
    const now = context.currentTime;
    const root = context.createGain();
    root.gain.setValueAtTime(0.0001, now);
    root.gain.linearRampToValueAtTime(1, now + 1.2);
    root.connect(this._ambienceGain);

    const rumbleSource = context.createBufferSource();
    const rumbleFilter = context.createBiquadFilter();
    const rumbleGain = context.createGain();
    rumbleSource.buffer = this._getBrownNoiseBuffer();
    rumbleSource.loop = true;
    rumbleFilter.type = "lowpass";
    rumbleFilter.frequency.setValueAtTime(230, now);
    rumbleFilter.Q.setValueAtTime(0.35, now);
    rumbleGain.gain.setValueAtTime(0.12, now);
    rumbleSource.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(root);

    const droneGain = context.createGain();
    droneGain.gain.setValueAtTime(0.014, now);
    droneGain.connect(root);

    const droneA = context.createOscillator();
    const droneB = context.createOscillator();
    droneA.type = "sine";
    droneB.type = "triangle";
    droneA.frequency.setValueAtTime(43.65, now);
    droneB.frequency.setValueAtTime(65.41, now);
    droneB.detune.setValueAtTime(-7, now);
    droneA.connect(droneGain);
    droneB.connect(droneGain);

    const lfo = context.createOscillator();
    const lfoDepth = context.createGain();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.055, now);
    lfoDepth.gain.setValueAtTime(0.005, now);
    lfo.connect(lfoDepth);
    lfoDepth.connect(droneGain.gain);

    rumbleSource.start(now);
    droneA.start(now);
    droneB.start(now);
    lfo.start(now);

    this._ambienceRoot = root;
    this._ambienceSources = [rumbleSource, droneA, droneB, lfo];
    this._ambienceNodes = [rumbleFilter, rumbleGain, droneGain, lfoDepth, root];
    this._scheduleAmbienceAccent();
  }

  _scheduleAmbienceAccent() {
    if (!this._ambienceRoot || this._destroyed) return;
    clearTimeout(this._ambienceTimer);

    const delay = 2800 + Math.random() * 5600;
    this._ambienceTimer = setTimeout(() => {
      this._ambienceTimer = null;
      if (this._ambienceRoot && !this.muted) this._playAmbienceAccent();
      this._scheduleAmbienceAccent();
    }, delay);
  }

  _playAmbienceAccent() {
    if (!this._ambienceRoot || !this._context) return;

    const time = this._context.currentTime + 0.02;
    const pan = Math.random() * 1.6 - 0.8;
    const choice = Math.random();

    if (choice < 0.62) {
      const base = 760 + Math.random() * 620;
      this._tone({
        time,
        duration: 0.52,
        frequency: base,
        endFrequency: base * 1.42,
        type: "sine",
        gain: 0.018,
        attack: 0.012,
        release: 0.46,
        pan,
        destination: this._ambienceRoot,
      });
      this._tone({
        time: time + 0.075,
        duration: 0.64,
        frequency: base * 1.51,
        endFrequency: base * 1.49,
        type: "sine",
        gain: 0.008,
        release: 0.57,
        pan: -pan * 0.6,
        destination: this._ambienceRoot,
      });
    } else {
      const base = 72 + Math.random() * 28;
      this._tone({
        time,
        duration: 1.8,
        frequency: base,
        endFrequency: base * 0.72,
        type: "sine",
        gain: 0.013,
        attack: 0.32,
        release: 1.1,
        pan,
        destination: this._ambienceRoot,
      });
    }
  }

  _stopAmbienceGraph(fade = 0) {
    clearTimeout(this._ambienceTimer);
    this._ambienceTimer = null;
    if (!this._ambienceRoot || !this._context) return;

    const root = this._ambienceRoot;
    const sources = this._ambienceSources;
    const nodes = this._ambienceNodes;
    const now = this._context.currentTime;

    this._ambienceRoot = null;
    this._ambienceSources = [];
    this._ambienceNodes = [];

    const finish = () => {
      for (const source of sources) {
        try { source.stop(); } catch {}
        try { source.disconnect(); } catch {}
      }
      for (const node of nodes) {
        try { node.disconnect(); } catch {}
      }
      try { root.disconnect(); } catch {}
    };

    if (fade <= 0) {
      finish();
      return;
    }

    root.gain.cancelScheduledValues(now);
    root.gain.setValueAtTime(Math.max(0.0001, root.gain.value), now);
    root.gain.exponentialRampToValueAtTime(0.0001, now + fade);

    const timer = setTimeout(() => {
      this._cleanupTimers.delete(timer);
      finish();
    }, fade * 1000 + 30);
    this._cleanupTimers.add(timer);
  }

  stopAll({ fade = 0.025, includeAmbience = false } = {}) {
    if (includeAmbience) {
      this._ambienceWanted = false;
      this._stopAmbienceGraph(fade);
    }

    for (const source of [...this._sources]) {
      try { source.stop(this._context.currentTime + Math.max(0, fade)); } catch {}
    }
  }

  async destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this.unbindUnlock();
    this._ambienceWanted = false;
    this._stopAmbienceGraph(0);

    for (const timer of this._cleanupTimers) clearTimeout(timer);
    this._cleanupTimers.clear();

    for (const source of [...this._sources]) {
      try { source.stop(); } catch {}
      try { source.disconnect(); } catch {}
    }
    this._sources.clear();

    const context = this._context;
    this._context = null;
    this._masterGain = null;
    this._sfxGain = null;
    this._ambienceGain = null;
    this._compressor = null;
    this._noiseBuffer = null;
    this._brownNoiseBuffer = null;

    if (context && context.state !== "closed") {
      try { await context.close(); } catch {}
    }
  }
}

export default AudioManager;
