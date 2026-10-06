import { AudioManager } from "./audio.js";
import {
  DIFFICULTY_CONFIG,
  ENEMY_TYPES,
  LEVEL_CONFIG,
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
  PLAYER_DEFAULTS,
  RULES,
  SAVE_KEY,
  TILE_SIZE,
  TILE_TYPES,
} from "./config.js";
import { createPlayer, populateWorld } from "./entities.js";
import {
  canEnemyContactAttack,
  ENEMY_COORDINATION,
  planEnemyCoordination,
} from "./enemy-coordination.js";
import { InputManager } from "./input.js";
import {
  DEFAULT_LASER_FOCUS_ID,
  getLaserFocus,
  isSpecialLaserFocus,
  normalizeLaserFocusIds,
} from "./laser-focus.js";
import { generateMaze, SeededRNG } from "./maze.js";
import { findPath, hasLineOfSight } from "./pathfinding.js";
import { Renderer } from "./renderer.js";
import {
  clamp,
  distance,
  distanceSquared,
  normalize,
  rotateTowards,
  shortestAngle,
  TAU,
} from "./utils.js";

const GAME_STATES = Object.freeze({
  MENU: "menu",
  PLAYING: "playing",
  PAUSED: "paused",
  DEAD: "dead",
  COMPLETE: "complete",
  VICTORY: "victory",
  EXIT: "exit",
  FOCUS_CHOICE: "focus-choice",
});

const FACING_VECTORS = Object.freeze({
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
});

const MODAL_IDS = [
  "pauseOverlay",
  "deathOverlay",
  "levelCompleteOverlay",
  "winOverlay",
  "exitOverlay",
  "focusSwapOverlay",
];

function byId(id) {
  return document.getElementById(id);
}

function tileCenter(cell) {
  return { x: (cell.x + 0.5) * TILE_SIZE, y: (cell.y + 0.5) * TILE_SIZE };
}

function worldToTile(entity) {
  return { x: Math.floor(entity.x / TILE_SIZE), y: Math.floor(entity.y / TILE_SIZE) };
}

function readableTime(seconds) {
  const whole = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(whole / 60);
  return `${String(minutes).padStart(2, "0")}:${String(whole % 60).padStart(2, "0")}`;
}

export class CrystalLabyrinthGame {
  constructor() {
    this.dom = this.collectDom();
    this.input = new InputManager({ element: this.dom.canvas });
    this.audio = new AudioManager({ ambience: true });
    this.renderer = new Renderer(this.dom.canvas);

    this.save = this.loadSave();
    this.selectedDifficulty = this.save.difficulty;
    this.selectedLevel = Math.min(this.save.unlockedLevel, this.save.selectedLevel || 1);
    this.reducedMotion = Boolean(this.save.reducedMotion);
    this.audio.setMuted(Boolean(this.save.muted));

    this.state = GAME_STATES.MENU;
    this.world = null;
    this.player = null;
    this.door = null;
    this.pickups = [];
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.camera = { x: 0, y: 0 };
    this.levelId = this.selectedLevel;
    this.difficultyId = this.selectedDifficulty;
    this.time = 0;
    this.levelTime = 0;
    this.runTime = 0;
    this.totalShardsCollected = 0;
    this.pendingContinuation = null;
    this.pendingFocusChoice = null;
    this.nightmareResetRequired = false;
    this.lastResonanceAt = -Infinity;
    this.damageFlash = 0;
    this.toastTimer = 0;
    this.messageTimer = 0;
    this.crystalEmergencyNotice = false;
    this.enemyCueCooldown = 0;
    this.seed = 0;
    this.rng = new SeededRNG(Date.now());
    this.lastTimestamp = 0;
    this.rafId = 0;

    this.bindUi();
    this.applyPreferences();
    this.updateMenu();
    this.showMenu();
    this.frame = this.frame.bind(this);
    this.rafId = requestAnimationFrame(this.frame);
  }

  collectDom() {
    const ids = [
      "app", "menuScreen", "gameScreen", "gameCanvas", "gameViewport",
      "playButton", "exitButton", "audioToggle", "motionToggle", "pauseButton",
      "livesDisplay", "livesHearts", "shardCount", "shardGoal", "levelNumber",
      "difficultyLabel", "storedHalfHeart",
      "laserFocusSlot", "laserFocusGlyph", "laserFocusName", "focusChargeTrack",
      "focusChargeFill", "focusPicker", "focusSwapName", "focusSwapDescription",
      "equipFocusButton", "keepFocusButton",
      "controlHintKey", "controlHintText", "gameMessage", "gameMessageIcon",
      "gameMessageText", "toast", "toastText", "levelHint", "resumeButton",
      "restartLevelButton", "pauseMenuButton", "retryButton", "deathMenuButton",
      "nextLevelButton", "replayLevelButton", "completeMenuButton", "newRunButton",
      "winMenuButton", "cancelExitButton", "confirmExitButton", "deathShardCount",
      "deathLevelNumber", "deathDescription", "completeShardCount", "completeShardGoal",
      "completeTime", "levelCompleteDescription", "winShardCount", "winTime",
      "exitTitle", "exitDescription",
    ];
    const dom = {};
    for (const id of ids) dom[id] = byId(id);
    dom.canvas = dom.gameCanvas;
    dom.difficultyButtons = [...document.querySelectorAll("[data-difficulty]")];
    dom.levelButtons = [...document.querySelectorAll("[data-level]")];
    dom.hotbarButtons = [...document.querySelectorAll(".hotbar-slot")];
    dom.hearts = [...document.querySelectorAll("[data-heart]")];
    dom.modals = MODAL_IDS.map(byId);
    return dom;
  }

  bindUi() {
    this.dom.playButton.addEventListener("click", () => this.startRun(this.selectedLevel));
    this.dom.exitButton.addEventListener("click", () => this.openExit());
    this.dom.audioToggle.addEventListener("click", () => this.toggleAudio());
    this.dom.motionToggle.addEventListener("click", () => this.toggleMotion());
    this.dom.pauseButton.addEventListener("click", () => this.pause());

    for (const button of this.dom.difficultyButtons) {
      button.addEventListener("click", () => this.selectDifficulty(button.dataset.difficulty));
    }
    for (const button of this.dom.levelButtons) {
      button.addEventListener("click", () => this.selectLevel(Number(button.dataset.level)));
    }
    for (const button of this.dom.hotbarButtons) {
      button.addEventListener("click", () => {
        if (!this.player) return;
        this.player.selectedSlot = Number(button.dataset.slot) - 1;
        this.audio.ui({ volume: 0.35, pitch: this.player.selectedSlot });
        this.updateHud();
      });
    }

    this.dom.resumeButton.addEventListener("click", () => this.resume());
    this.dom.restartLevelButton.addEventListener("click", () => this.startRun(this.levelId));
    this.dom.pauseMenuButton.addEventListener("click", () => this.showMenu());
    this.dom.retryButton.addEventListener("click", () => this.retryAfterDeath());
    this.dom.deathMenuButton.addEventListener("click", () => this.showMenu());
    this.dom.nextLevelButton.addEventListener("click", () => this.advanceLevel());
    this.dom.replayLevelButton.addEventListener("click", () => this.startRun(this.levelId));
    this.dom.completeMenuButton.addEventListener("click", () => this.showMenu());
    this.dom.newRunButton.addEventListener("click", () => this.startRun(1));
    this.dom.winMenuButton.addEventListener("click", () => this.showMenu());
    this.dom.cancelExitButton.addEventListener("click", () => this.closeExit());
    this.dom.confirmExitButton.addEventListener("click", () => this.confirmExit());
    this.dom.equipFocusButton.addEventListener("click", () => this.resolveFocusChoice(true));
    this.dom.keepFocusButton.addEventListener("click", () => this.resolveFocusChoice(false));

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && this.state === GAME_STATES.PLAYING) this.pause();
    });
  }

  loadSave() {
    const defaults = {
      version: 1,
      unlockedLevel: 1,
      selectedLevel: 1,
      difficulty: "normal",
      muted: false,
      reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false,
    };
    try {
      const parsed = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
      if (!parsed || parsed.version !== 1) return defaults;
      const unlockedLevel = clamp(Math.trunc(Number(parsed.unlockedLevel)) || 1, 1, 3);
      const selectedLevel = clamp(Math.trunc(Number(parsed.selectedLevel)) || 1, 1, unlockedLevel);
      return {
        ...defaults,
        ...parsed,
        unlockedLevel,
        selectedLevel,
        difficulty: DIFFICULTY_CONFIG[parsed.difficulty] ? parsed.difficulty : "normal",
      };
    } catch {
      return defaults;
    }
  }

  persistSave() {
    this.save.difficulty = this.selectedDifficulty;
    this.save.selectedLevel = this.selectedLevel;
    this.save.muted = this.audio.muted;
    this.save.reducedMotion = this.reducedMotion;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.save));
    } catch {
      // Private browsing and local file policies may disallow storage; gameplay continues.
    }
  }

  applyPreferences() {
    document.documentElement.dataset.reducedMotion = String(this.reducedMotion);
    this.dom.motionToggle.setAttribute("aria-pressed", String(this.reducedMotion));
    this.dom.motionToggle.setAttribute("aria-label", this.reducedMotion ? "Use full animation" : "Reduce animation");
    this.dom.audioToggle.setAttribute("aria-pressed", String(this.audio.muted));
    this.dom.audioToggle.setAttribute("aria-label", this.audio.muted ? "Unmute sound" : "Mute sound");
  }

  selectDifficulty(id) {
    if (!DIFFICULTY_CONFIG[id]) return;
    this.selectedDifficulty = id;
    if (this.pendingContinuation?.difficultyId !== id) this.pendingContinuation = null;
    if (id !== "nightmare") this.nightmareResetRequired = false;
    this.audio.ui({ volume: 0.35, pitch: Object.keys(DIFFICULTY_CONFIG).indexOf(id) });
    this.persistSave();
    this.updateMenu();
  }

  selectLevel(levelId) {
    if (levelId < 1 || levelId > this.menuUnlockedLevel()) {
      this.audio.locked({ volume: 0.4 });
      return;
    }
    if (this.nightmareResetRequired && this.selectedDifficulty === "nightmare" && levelId !== 1) {
      this.audio.locked({ volume: 0.4 });
      this.dom.levelHint.textContent = "A fallen Nightmare run must rekindle from Level 1.";
      return;
    }
    this.selectedLevel = levelId;
    if (this.pendingContinuation?.levelId !== levelId) this.pendingContinuation = null;
    this.audio.ui({ volume: 0.35, pitch: levelId * 2 });
    this.persistSave();
    this.updateMenu();
  }

  updateMenu() {
    const availableLevel = this.menuUnlockedLevel();
    for (const button of this.dom.difficultyButtons) {
      const selected = button.dataset.difficulty === this.selectedDifficulty;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    }

    for (const button of this.dom.levelButtons) {
      const levelId = Number(button.dataset.level);
      const unlocked = levelId <= availableLevel;
      const selected = levelId === this.selectedLevel;
      button.disabled = !unlocked;
      button.dataset.unlocked = String(unlocked);
      button.classList.toggle("is-locked", !unlocked);
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
      button.setAttribute(
        "aria-label",
        unlocked ? `Level ${levelId}${selected ? ", selected" : ", unlocked"}` : `Level ${levelId}, locked`,
      );
      const status = button.querySelector(".level-status");
      if (status) status.textContent = unlocked ? (selected ? "Selected" : "Open") : "Locked";
    }

    this.dom.levelHint.textContent = availableLevel >= 3
      ? "All chambers unlocked — the Abyss awaits."
      : "Beat the previous level to unlock the next one.";
  }

  menuUnlockedLevel() {
    const runLevel = this.pendingContinuation?.difficultyId === this.selectedDifficulty
      ? this.pendingContinuation.levelId
      : 1;
    return Math.max(this.save.unlockedLevel, runLevel);
  }

  toggleAudio() {
    const muted = this.audio.toggleMute();
    if (!muted) {
      void this.audio.unlock();
      this.audio.ui({ volume: 0.4 });
      if (this.state === GAME_STATES.PLAYING) this.audio.startAmbience();
    }
    this.applyPreferences();
    this.persistSave();
  }

  toggleMotion() {
    this.reducedMotion = !this.reducedMotion;
    this.applyPreferences();
    this.persistSave();
  }

  showMenu() {
    this.cancelLaserCharge();
    this.pendingFocusChoice = null;
    this.state = GAME_STATES.MENU;
    this.dom.app.dataset.screen = "menu";
    this.dom.menuScreen.hidden = false;
    this.dom.gameScreen.hidden = true;
    this.hideModals();
    this.input.reset();
    this.audio.stopAmbience({ fade: 0.5 });
    this.updateMenu();
    this.dom.playButton.focus({ preventScroll: true });
  }

  startRun(levelId = 1) {
    let requestedLevel = clamp(Math.trunc(Number(levelId)) || 1, 1, 3);
    if (this.nightmareResetRequired && this.selectedDifficulty === "nightmare") requestedLevel = 1;
    const continuation = this.pendingContinuation
      && this.pendingContinuation.levelId === requestedLevel
      && this.pendingContinuation.difficultyId === this.selectedDifficulty
      ? this.pendingContinuation
      : null;
    this.pendingContinuation = null;
    this.nightmareResetRequired = false;
    if (continuation) {
      this.runTime = continuation.runTime;
      this.totalShardsCollected = continuation.totalShardsCollected;
      this.startLevel(requestedLevel, continuation.carry);
      return;
    }
    this.runTime = 0;
    this.totalShardsCollected = 0;
    this.startLevel(requestedLevel, null);
  }

  startLevel(levelId, carry) {
    this.hideModals();
    this.dom.app.dataset.screen = "game";
    this.dom.menuScreen.hidden = true;
    this.dom.gameScreen.hidden = false;
    this.state = GAME_STATES.PLAYING;
    this.levelId = clamp(Math.trunc(Number(levelId)) || 1, 1, 3);
    this.difficultyId = this.selectedDifficulty;
    this.levelTime = 0;
    this.damageFlash = 0;
    this.lastResonanceAt = -Infinity;
    this.crystalEmergencyNotice = false;
    this.projectiles = [];
    this.particles = [];
    this.pendingFocusChoice = null;

    const randomPart = Math.floor(Math.random() * 0xffffffff).toString(36);
    this.seed = `${Date.now().toString(36)}-${randomPart}-L${this.levelId}-${this.difficultyId}`;
    this.world = generateMaze({ level: this.levelId, difficulty: this.difficultyId, seed: this.seed });
    this.rng = new SeededRNG(`${this.seed}:runtime`);
    this.player = createPlayer(this.world.spawn, carry || {});
    const population = populateWorld(this.world, this.levelId, this.difficultyId, this.seed);
    this.pickups = population.pickups.filter(
      (pickup) => pickup.kind !== "laser-focus" || !this.player.laserFocusIds.includes(pickup.focusId),
    );
    this.enemies = population.enemies;
    this.door = {
      x: this.world.door.worldX,
      y: this.world.door.worldY,
      facing: this.world.door.facing,
      progress: 0,
      activationSeconds: RULES.doorActivationSeconds,
      activating: false,
      chargeStep: 0,
    };
    this.camera.x = clamp(this.player.x - LOGICAL_WIDTH / 2, 0, Math.max(0, this.world.pixelWidth - LOGICAL_WIDTH));
    this.camera.y = clamp(this.player.y - LOGICAL_HEIGHT / 2, 0, Math.max(0, this.world.pixelHeight - LOGICAL_HEIGHT));
    this.input.reset();
    this.audio.startAmbience();
    this.showGameMessage(
      this.levelId === 1
        ? "Gather 10 shards. Your light grows with every crystal — but firing spends one."
        : this.levelId === 2
          ? "The paths run deeper here. Break sight around corners to escape a chase."
          : "In the Abyss, trust the glow. Distant eyes may be all the warning you get.",
      7,
      "✦",
    );
    this.updateHud();
    this.dom.canvas.focus({ preventScroll: true });
  }

  frame(timestamp) {
    const dt = this.lastTimestamp ? clamp((timestamp - this.lastTimestamp) / 1000, 0, 0.034) : 0;
    this.lastTimestamp = timestamp;
    this.time += dt;

    if (this.state !== GAME_STATES.PLAYING && this.input.consumePressed("action")) {
      const focusedButton = document.activeElement instanceof HTMLButtonElement
        ? document.activeElement
        : null;
      const target = focusedButton || (this.state === GAME_STATES.MENU ? this.dom.playButton : null);
      if (target && !target.disabled && !target.hidden) target.click();
    }

    if (this.input.wasPressed("pause")) {
      if (this.state === GAME_STATES.PLAYING) this.pause();
      else if (this.state === GAME_STATES.PAUSED) this.resume();
    }

    if (this.state === GAME_STATES.PLAYING) this.update(dt);
    this.updateUiTimers(dt);
    if (this.world && !this.dom.gameScreen.hidden) this.renderer.render(this);
    this.input.endFrame();
    this.rafId = requestAnimationFrame(this.frame);
  }

  update(dt) {
    this.levelTime += dt;
    this.runTime += dt;
    this.damageFlash = Math.max(0, this.damageFlash - dt * 2.8);
    this.enemyCueCooldown = Math.max(0, this.enemyCueCooldown - dt);
    this.player.invulnerability = Math.max(0, this.player.invulnerability - dt);
    this.player.fireCooldown = Math.max(0, this.player.fireCooldown - dt);

    this.handleLaserFocusInput();
    this.handleHotbarInput();
    this.updatePlayer(dt);
    this.updateDoor(dt);
    if (this.state !== GAME_STATES.PLAYING) {
      this.updateParticles(dt);
      this.updateCamera(dt);
      this.updateHud();
      return;
    }
    this.updateProjectiles(dt);
    this.updateEnemies(dt);
    if (this.state !== GAME_STATES.PLAYING) {
      this.updateParticles(dt);
      this.updateCamera(dt);
      this.updateHud();
      return;
    }
    this.updateCrystalRespawns();
    this.updatePickups();
    this.updateParticles(dt);
    this.updateCamera(dt);
    this.updateControlHint();
    this.updateHud();
  }

  handleHotbarInput() {
    let command = this.input.consumeHotbarCommand();
    while (command) {
      if (command.type === "select") this.player.selectedSlot = command.index;
      else this.player.selectedSlot = (this.player.selectedSlot + command.direction + RULES.hotbarSlots) % RULES.hotbarSlots;
      this.audio.ui({ volume: 0.22, pitch: this.player.selectedSlot });
      command = this.input.consumeHotbarCommand();
    }
    if (this.input.wasPressed("useItem")) this.useSelectedItem();
  }

  handleLaserFocusInput() {
    let focusIndex = this.input.consumeFocusSelection();
    while (focusIndex !== null) {
      const focusId = this.player.laserFocusIds[focusIndex];
      if (!focusId) {
        this.audio.locked({ volume: 0.22, pitch: 5 });
        this.showToast(`No Laser Focus is attuned to Tab + ${focusIndex + 1}.`, 1.5);
      } else {
        this.equipLaserFocus(focusId);
      }
      focusIndex = this.input.consumeFocusSelection();
    }
  }

  equipLaserFocus(focusId) {
    if (!this.player.laserFocusIds.includes(focusId) || this.player.equippedFocusId === focusId) return false;
    this.cancelLaserCharge();
    this.player.equippedFocusId = focusId;
    const focus = getLaserFocus(focusId);
    this.audio.ui({ volume: 0.5, pitch: focus.damage > 1 ? -2 : 4 });
    this.showToast(`${focus.name} equipped.`, 1.5);
    this.updateHud();
    return true;
  }

  updatePlayer(dt) {
    const movement = this.input.getMovement();
    this.player.previousX = this.player.x;
    this.player.previousY = this.player.y;
    this.player.moving = movement.x !== 0 || movement.y !== 0;

    if (this.player.moving) {
      if (Math.abs(movement.x) > Math.abs(movement.y)) {
        this.player.facing = movement.x > 0 ? "right" : "left";
      } else {
        this.player.facing = movement.y > 0 ? "down" : "up";
      }
      this.player.facingVector = FACING_VECTORS[this.player.facing];
      this.moveActor(
        this.player,
        movement.x * this.player.moveSpeed * dt,
        movement.y * this.player.moveSpeed * dt,
      );
    }

    if (this.input.wasPressed("action")) this.performContextAction();
    if (this.player.focusCharging && !this.input.isHeld("action")) this.releaseLaserCharge();
    else this.updateLaserCharge(dt);
  }

  performContextAction() {
    if (this.canInteractWithDoor()) {
      this.cancelLaserCharge();
      if (this.player.shards < RULES.shardGoal) {
        this.door.activating = false;
        this.door.progress = 0;
        this.door.chargeStep = 0;
        this.audio.locked({ volume: 0.6 });
        this.showToast(`The seal needs ${RULES.shardGoal - this.player.shards} more shard${RULES.shardGoal - this.player.shards === 1 ? "" : "s"}.`, 2.4);
      } else {
        this.door.activating = true;
        this.audio.door({ volume: 0.45, pitch: -3 });
        this.showToast("Hold your ground while the seal awakens…", 2.2);
      }
      return;
    }
    const focus = this.getEquippedLaserFocus();
    if (focus.chargeTime > 0) this.beginLaserCharge(focus);
    else this.fireLaser(focus);
  }

  getEquippedLaserFocus() {
    return getLaserFocus(this.player?.equippedFocusId ?? DEFAULT_LASER_FOCUS_ID);
  }

  beginLaserCharge(focus = this.getEquippedLaserFocus()) {
    if (this.player.fireCooldown > 0) return;
    if (this.player.shards < focus.shardCost) {
      this.audio.locked({ volume: 0.32, pitch: 3 });
      this.showToast("No crystal charge — find a shard to fire.", 1.8);
      return;
    }
    this.player.focusCharging = true;
    this.player.focusCharge = 0;
    this.player.focusChargeReady = false;
    this.player.chargingFocusId = focus.id;
    this.player.focusChargeParticleTimer = 0;
    this.player.focusChargeSoundStep = -1;
  }

  updateLaserCharge(dt) {
    if (!this.player.focusCharging) return;
    if (!this.input.isHeld("action")) {
      this.cancelLaserCharge();
      return;
    }
    const focus = getLaserFocus(this.player.chargingFocusId);
    if (focus.chargeTime <= 0 || this.player.equippedFocusId !== focus.id) {
      this.cancelLaserCharge();
      return;
    }

    const previousRatio = this.player.focusCharge / focus.chargeTime;
    this.player.focusCharge = Math.min(focus.chargeTime, this.player.focusCharge + dt);
    const ratio = clamp(this.player.focusCharge / focus.chargeTime, 0, 1);
    this.player.focusChargeParticleTimer -= dt;
    if (this.player.focusChargeParticleTimer <= 0) {
      const direction = this.player.facingVector;
      const crystalX = this.player.x + direction.x * 15;
      const crystalY = this.player.y + direction.y * 15;
      this.emitParticles(crystalX, crystalY, focus.color, 1 + Math.floor(ratio * 2), true);
      this.player.focusChargeParticleTimer = 0.14 - ratio * 0.075;
    }

    const soundStep = Math.min(4, Math.floor(ratio * 5));
    if (soundStep > this.player.focusChargeSoundStep) {
      this.player.focusChargeSoundStep = soundStep;
      this.audio.charge({ volume: 0.22 + ratio * 0.18, pitch: soundStep * 2 });
    }
    if (previousRatio < 1 && ratio >= 1) {
      this.player.focusChargeReady = true;
      this.audio.chargeReady({ volume: 0.58 });
      const direction = this.player.facingVector;
      this.emitParticles(
        this.player.x + direction.x * 16,
        this.player.y + direction.y * 16,
        focus.coreColor,
        12,
        true,
      );
    }
  }

  releaseLaserCharge() {
    if (!this.player.focusCharging) return;
    const focus = getLaserFocus(this.player.chargingFocusId);
    const ready = this.player.focusCharge >= focus.chargeTime && focus.chargeTime > 0;
    this.cancelLaserCharge();
    if (ready) {
      this.fireLaser(focus, { charged: true });
    } else {
      this.audio.locked({ volume: 0.16, pitch: 8 });
      this.showToast(`${focus.name} needs a full charge.`, 1.25);
    }
  }

  cancelLaserCharge() {
    if (!this.player) return;
    this.player.focusCharging = false;
    this.player.focusCharge = 0;
    this.player.focusChargeReady = false;
    this.player.chargingFocusId = null;
    this.player.focusChargeParticleTimer = 0;
    this.player.focusChargeSoundStep = -1;
  }

  fireLaser(focus = this.getEquippedLaserFocus(), { charged = false } = {}) {
    if (this.player.fireCooldown > 0) return false;
    if (focus.chargeTime > 0 && !charged) return false;
    if (this.player.shards < focus.shardCost) {
      this.audio.locked({ volume: 0.32, pitch: 3 });
      this.showToast("No crystal charge — find a shard to fire.", 1.8);
      return false;
    }
    const direction = this.player.facingVector;
    this.player.shards -= focus.shardCost;
    this.player.fireCooldown = focus.fireCooldown;
    this.projectiles.push({
      x: this.player.x + direction.x * 18,
      y: this.player.y + direction.y * 18,
      vx: direction.x * focus.projectileSpeed,
      vy: direction.y * focus.projectileSpeed,
      radius: Math.max(2, focus.beamWidth * 0.5),
      life: focus.range / focus.projectileSpeed,
      damage: focus.damage,
      shardCost: focus.shardCost,
      beamWidth: focus.beamWidth,
      focusId: focus.id,
      color: focus.color,
      coreColor: focus.coreColor,
    });
    this.audio.fire({ volume: 0.52 + focus.damage * 0.13, pitch: focus.damage > 1 ? -5 : 0 });
    this.emitParticles(
      this.player.x + direction.x * 15,
      this.player.y + direction.y * 15,
      focus.color,
      3 + focus.damage * 4,
      true,
    );
    if (this.door.activating) this.cancelDoorActivation();
    return true;
  }

  updateProjectiles(dt) {
    const survivors = [];
    for (const projectile of this.projectiles) {
      projectile.life -= dt;
      if (projectile.life <= 0) continue;
      const steps = Math.max(1, Math.ceil(Math.hypot(projectile.vx, projectile.vy) * dt / 10));
      let destroyed = false;
      for (let step = 0; step < steps; step += 1) {
        projectile.x += (projectile.vx * dt) / steps;
        projectile.y += (projectile.vy * dt) / steps;
        if (!this.isPixelWalkable(projectile.x, projectile.y)) {
          this.emitParticles(projectile.x, projectile.y, "#54dcff", 7, true);
          destroyed = true;
          break;
        }
        const hit = this.enemies.find(
          (enemy) => !enemy.dead && distanceSquared(enemy, projectile) <= (enemy.radius + projectile.radius) ** 2,
        );
        if (hit) {
          this.damageEnemy(hit, projectile);
          destroyed = true;
          break;
        }
      }
      if (!destroyed) survivors.push(projectile);
    }
    this.projectiles = survivors;
  }

  damageEnemy(enemy, projectile) {
    enemy.health -= Math.max(1, projectile.damage || 1);
    enemy.state = "chase";
    enemy.lastSeen = worldToTile(this.player);
    enemy.pathCooldown = 0;
    this.emitParticles(enemy.x, enemy.y, enemy.type === "brute" ? "#df73ff" : "#6af4ff", enemy.type === "brute" ? 13 : 9, true);
    if (enemy.health <= 0) {
      enemy.dead = true;
      this.audio.chunk({ volume: 0.4, pitch: -5 });
    } else {
      enemy.stun = 0.22;
      this.audio.hit({ volume: 0.32, pitch: 4 });
      this.showToast("The Brute's crystal hide cracks — one more shot!", 1.8);
    }
    projectile.life = 0;
  }

  updatePickups() {
    for (const pickup of this.pickups) {
      const pickupDistance = distanceSquared(this.player, pickup);
      if (pickup.kind === "laser-focus" && pickup.promptSuppressed && pickupDistance > 42 ** 2) {
        pickup.promptSuppressed = false;
      }
      if (pickup.collected || pickupDistance > 24 ** 2) continue;
      if (pickup.kind === "laser-focus") {
        if (!pickup.promptSuppressed) this.collectLaserFocus(pickup);
        continue;
      }
      if (pickup.kind === "half-heart") {
        const emptySlot = this.player.hotbar.indexOf(null);
        if (emptySlot === -1) {
          if (!pickup.fullNoticeAt || this.time - pickup.fullNoticeAt > 3) {
            pickup.fullNoticeAt = this.time;
            this.showToast("Hotbar full — use a Half Heart before collecting this one.", 2.2);
          }
          continue;
        }
        this.player.hotbar[emptySlot] = "half-heart";
        pickup.collected = true;
        this.audio.heart({ volume: 0.5, pitch: 4 });
        this.emitParticles(pickup.x, pickup.y, "#ff69a6", 10, true);
        this.showToast(`Half Heart stored in slot ${emptySlot + 1}. Press F to use it.`, 2.4);
        continue;
      }

      if (this.player.shards >= RULES.shardCapacity) continue;
      const value = pickup.kind === "crystal-chunk" ? RULES.crystalChunkValue : RULES.regularCrystalValue;
      const before = this.player.shards;
      this.player.shards = Math.min(RULES.shardCapacity, this.player.shards + value);
      const gained = this.player.shards - before;
      this.totalShardsCollected += gained;
      pickup.collected = true;
      this.scheduleCrystalRespawn(pickup);
      this.audio[pickup.kind === "crystal-chunk" ? "chunk" : "pickup"]({
        volume: pickup.kind === "crystal-chunk" ? 0.62 : 0.46,
        pitch: Math.min(7, this.player.shards * 0.5),
      });
      this.emitParticles(pickup.x, pickup.y, pickup.kind === "crystal-chunk" ? "#ffc84a" : "#4feaff", pickup.kind === "crystal-chunk" ? 14 : 8, true);
      if (pickup.kind === "crystal-chunk") this.showToast(`Crystal Chunk +${gained}`, 1.5);

      if (before < RULES.shardGoal && this.player.shards >= RULES.shardGoal && this.time - this.lastResonanceAt >= RULES.resonanceCooldownSeconds) {
        this.lastResonanceAt = this.time;
        this.audio.resonance({ volume: 0.76 });
        this.showGameMessage("Resonance! The exit seal can now be awakened. Return to the crystal gate.", 5.5, "◆");
      }
    }
  }

  collectLaserFocus(pickup) {
    const focus = getLaserFocus(pickup.focusId);
    if (this.player.laserFocusIds.includes(focus.id)) {
      pickup.collected = true;
      this.showToast(`${focus.name} is already attuned.`, 1.5);
      return;
    }
    const carriedSpecialId = this.player.laserFocusIds.find((focusId) => isSpecialLaserFocus(focusId));
    if (carriedSpecialId) {
      this.offerFocusReplacement(pickup, this.player.equippedFocusId);
      return;
    }
    this.acquireLaserFocus(pickup);
  }

  acquireLaserFocus(pickup) {
    const focus = getLaserFocus(pickup.focusId);
    this.cancelLaserCharge();
    this.player.laserFocusIds = normalizeLaserFocusIds([...this.player.laserFocusIds, focus.id]);
    this.player.equippedFocusId = focus.id;
    const focusNumber = this.player.laserFocusIds.indexOf(focus.id) + 1;
    pickup.collected = true;
    this.audio.resonance({ volume: 0.72, pitch: 2 });
    this.emitParticles(pickup.x, pickup.y, focus.color, 28, true);
    this.showGameMessage(
      `${focus.name} attuned. Hold Tab and press ${focusNumber} to return to it after selecting Standard with Tab + 1.`,
      6,
      focus.icon,
    );
    this.updateHud();
  }

  offerFocusReplacement(pickup, carriedSpecialId) {
    const discovered = getLaserFocus(pickup.focusId);
    const carried = getLaserFocus(carriedSpecialId);
    this.cancelLaserCharge();
    this.pendingFocusChoice = { pickupId: pickup.id, focusId: discovered.id };
    this.state = GAME_STATES.FOCUS_CHOICE;
    this.input.reset();
    this.dom.focusSwapName.textContent = discovered.name;
    this.dom.focusSwapDescription.textContent = `Attune ${discovered.name} and equip it instead of ${carried.name}? Both remain available through Tab + number selection.`;
    this.showModal("focusSwapOverlay", this.dom.equipFocusButton);
  }

  resolveFocusChoice(replaceCurrent) {
    if (this.state !== GAME_STATES.FOCUS_CHOICE || !this.pendingFocusChoice) return;
    const pickup = this.pickups.find((candidate) => candidate.id === this.pendingFocusChoice.pickupId);
    if (pickup) {
      const equippedBeforeChoice = this.player.equippedFocusId;
      this.acquireLaserFocus(pickup);
      if (!replaceCurrent) this.player.equippedFocusId = equippedBeforeChoice;
    }
    this.pendingFocusChoice = null;
    this.hideModals();
    this.state = GAME_STATES.PLAYING;
    this.input.reset();
    this.dom.canvas.focus({ preventScroll: true });
    this.updateHud();
    if (!replaceCurrent) this.showToast("New Focus attuned; current Focus remains equipped.", 2);
  }

  isCrystalPickup(pickup) {
    return pickup.kind === "regular-crystal" || pickup.kind === "crystal-chunk";
  }

  scheduleCrystalRespawn(pickup) {
    const settings = RULES.crystalRespawn;
    const baseSeconds = pickup.kind === "crystal-chunk"
      ? settings.chunkSeconds
      : settings.regularSeconds;
    const difficultyMultiplier = DIFFICULTY_CONFIG[this.difficultyId].crystalRespawnMultiplier;
    const jitter = this.rng.range(-settings.jitterSeconds, settings.jitterSeconds);
    pickup.respawnAt = this.time + Math.max(settings.emergencySeconds, baseSeconds * difficultyMultiplier + jitter);
  }

  updateCrystalRespawns() {
    const dormant = this.pickups.filter((pickup) => this.isCrystalPickup(pickup) && pickup.collected);
    if (dormant.length === 0) {
      this.crystalEmergencyNotice = false;
      return;
    }

    const activeCount = this.pickups.reduce(
      (count, pickup) => count + Number(this.isCrystalPickup(pickup) && !pickup.collected),
      0,
    );

    if (activeCount === 0 && this.player.shards < RULES.shardGoal) {
      const nextCrystal = dormant.reduce((earliest, pickup) =>
        (pickup.respawnAt ?? Infinity) < (earliest.respawnAt ?? Infinity) ? pickup : earliest
      );
      const emergencyAt = this.time + RULES.crystalRespawn.emergencySeconds;
      if (!Number.isFinite(nextCrystal.respawnAt) || nextCrystal.respawnAt > emergencyAt) {
        nextCrystal.respawnAt = emergencyAt;
        if (!this.crystalEmergencyNotice) {
          this.crystalEmergencyNotice = true;
          this.showToast("The crystal veins are reforming nearby…", 2.4);
        }
      }
    }

    for (const pickup of dormant) {
      if (Number.isFinite(pickup.respawnAt) && pickup.respawnAt <= this.time) {
        this.respawnCrystalPickup(pickup);
      }
    }
  }

  respawnCrystalPickup(pickup) {
    const candidates = this.world.pickupSpawnCandidates || [];
    const playerTile = worldToTile(this.player);
    const activeCrystals = this.pickups.filter(
      (other) => other !== pickup && this.isCrystalPickup(other) && !other.collected,
    );
    const livingEnemies = this.enemies.filter((enemy) => !enemy.dead);
    const tileDistanceSquared = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
    const isOpenVein = (cell, keepDistance) => {
      if (keepDistance && tileDistanceSquared(cell, playerTile) < 6 ** 2) return false;
      if (activeCrystals.some((other) => tileDistanceSquared(cell, { x: other.tileX, y: other.tileY }) < 2 ** 2)) return false;
      if (keepDistance && livingEnemies.some((enemy) => tileDistanceSquared(cell, worldToTile(enemy)) < 2 ** 2)) return false;
      return true;
    };

    let available = candidates.filter((cell) => isOpenVein(cell, true));
    if (available.length === 0) available = candidates.filter((cell) => isOpenVein(cell, false));
    const cell = this.rng.pick(available.length > 0 ? available : candidates);
    if (!cell) {
      pickup.respawnAt = this.time + RULES.crystalRespawn.emergencySeconds;
      return;
    }

    pickup.x = (cell.x + 0.5) * TILE_SIZE;
    pickup.y = (cell.y + 0.5) * TILE_SIZE;
    pickup.tileX = cell.x;
    pickup.tileY = cell.y;
    pickup.phase = this.rng.range(0, TAU);
    pickup.collected = false;
    pickup.respawnAt = null;
    this.crystalEmergencyNotice = false;
    if (distanceSquared(this.player, pickup) < (LOGICAL_WIDTH * 0.7) ** 2) {
      this.emitParticles(pickup.x, pickup.y, pickup.color, pickup.kind === "crystal-chunk" ? 12 : 7, true);
    }
  }

  useSelectedItem() {
    const slot = this.player.selectedSlot;
    if (this.player.hotbar[slot] !== "half-heart") {
      this.audio.locked({ volume: 0.22, pitch: 4 });
      this.showToast(`Slot ${slot + 1} is empty.`, 1.2);
      return;
    }

    if (this.player.healProgress === 1 && this.player.lives >= this.player.maxLives) {
      this.audio.locked({ volume: 0.3 });
      this.showToast("A half-heart is already stored, but your lives are full.", 2.1);
      return;
    }

    this.player.hotbar[slot] = null;
    if (this.player.healProgress === 0) {
      this.player.healProgress = 1;
      this.audio.heart({ volume: 0.55, pitch: 0 });
      this.showToast("Half a life stored. Another Half Heart completes it.", 2.6);
    } else {
      this.player.healProgress = 0;
      this.player.lives = Math.min(this.player.maxLives, this.player.lives + 1);
      this.audio.heart({ volume: 0.8, pitch: 7 });
      this.emitParticles(this.player.x, this.player.y, "#ff6eaf", 22, true);
      this.showToast("A full life has been restored!", 2.2);
    }
    this.updateHud();
  }

  updateDoor(dt) {
    if (!this.door.activating) return;
    if (this.player.shards < RULES.shardGoal || !this.canInteractWithDoor()) {
      this.cancelDoorActivation();
      return;
    }
    this.door.progress = Math.min(this.door.activationSeconds, this.door.progress + dt);
    const nextChargeStep = Math.min(
      RULES.shardGoal,
      Math.floor((this.door.progress / this.door.activationSeconds) * RULES.shardGoal + 1e-6),
    );
    if (nextChargeStep > this.door.chargeStep) {
      this.door.chargeStep = nextChargeStep;
      this.audio.pickup({ volume: 0.2 + nextChargeStep * 0.012, pitch: nextChargeStep - 5 });
      this.emitParticles(
        this.door.x + this.rng.range(-30, 30),
        this.door.y + this.rng.range(-38, 10),
        nextChargeStep % 3 === 0 ? "#4feaff" : "#d75cff",
        5,
        true,
      );
    }
    if (this.rng.chance(dt * 9)) {
      this.emitParticles(this.door.x + this.rng.range(-22, 22), this.door.y + this.rng.range(-28, 24), "#ad5cff", 1, true);
    }
    if (this.door.progress >= this.door.activationSeconds) this.completeLevel();
  }

  canInteractWithDoor() {
    if (!this.door || !this.player) return false;
    const toDoor = normalize(this.door.x - this.player.x, this.door.y - this.player.y);
    if (toDoor.length > TILE_SIZE * 1.75) return false;
    const facing = this.player.facingVector;
    return facing.x * toDoor.x + facing.y * toDoor.y > 0.15;
  }

  cancelDoorActivation() {
    if (this.door.progress > 0.12) this.showToast("The seal's charge was interrupted.", 1.5);
    this.door.activating = false;
    this.door.progress = 0;
    this.door.chargeStep = 0;
  }

  completeLevel() {
    if (this.state !== GAME_STATES.PLAYING) return;
    this.cancelLaserCharge();
    this.state = this.levelId === 3 ? GAME_STATES.VICTORY : GAME_STATES.COMPLETE;
    this.door.progress = this.door.activationSeconds;
    this.door.activating = false;
    this.door.chargeStep = RULES.shardGoal;
    this.projectiles = [];
    this.audio.stopAmbience({ fade: 1 });
    this.audio.win({ volume: 0.8, pitch: this.levelId === 3 ? 5 : 0 });

    if (this.levelId < 3) {
      if (!DIFFICULTY_CONFIG[this.difficultyId].nightmareRunReset) {
        this.save.unlockedLevel = Math.max(this.save.unlockedLevel, this.levelId + 1);
      }
      this.selectedLevel = this.levelId + 1;
      this.pendingContinuation = {
        levelId: this.levelId + 1,
        difficultyId: this.difficultyId,
        carry: {
          lives: this.player.lives,
          hotbar: [...this.player.hotbar],
          selectedSlot: this.player.selectedSlot,
          healProgress: this.player.healProgress,
          laserFocusIds: [...this.player.laserFocusIds],
          equippedFocusId: this.player.equippedFocusId,
        },
        runTime: this.runTime,
        totalShardsCollected: this.totalShardsCollected,
      };
    } else {
      this.save.unlockedLevel = 3;
      this.selectedLevel = 3;
      this.pendingContinuation = null;
    }
    this.persistSave();
    this.updateMenu();

    if (this.levelId === 3) {
      this.dom.winShardCount.textContent = String(this.totalShardsCollected);
      this.dom.winTime.textContent = readableTime(this.runTime);
      this.showModal("winOverlay", this.dom.newRunButton);
    } else {
      this.dom.completeShardCount.textContent = String(this.player.shards);
      this.dom.completeShardGoal.textContent = String(RULES.shardGoal);
      this.dom.completeTime.textContent = readableTime(this.levelTime);
      this.dom.levelCompleteDescription.textContent = `The path to ${LEVEL_CONFIG[this.levelId + 1].name} is now open. Lives, items, and your Laser Focus will carry forward; shards will not.`;
      this.dom.nextLevelButton.textContent = `Enter Level ${this.levelId + 1}`;
      this.showModal("levelCompleteOverlay", this.dom.nextLevelButton);
    }
  }

  advanceLevel() {
    if (this.levelId >= 3) return;
    const nextLevel = this.levelId + 1;
    const continuation = this.pendingContinuation;
    this.pendingContinuation = null;
    const carry = continuation?.levelId === nextLevel
      ? continuation.carry
      : {
          lives: this.player.lives,
          hotbar: [...this.player.hotbar],
          selectedSlot: this.player.selectedSlot,
          healProgress: this.player.healProgress,
          laserFocusIds: [...this.player.laserFocusIds],
          equippedFocusId: this.player.equippedFocusId,
        };
    this.startLevel(nextLevel, carry);
  }

  updateEnemies(dt) {
    this.assignEnemyCoordination();
    for (const enemy of this.enemies) {
      if (enemy.dead) continue;
      enemy.stun = Math.max(0, enemy.stun - dt);
      enemy.contactCooldown = Math.max(0, enemy.contactCooldown - dt);
      enemy.pathCooldown -= dt;
      if (enemy.stun <= 0) this.updateEnemyAi(enemy, dt);

      if (
        this.player.invulnerability <= 0 &&
        enemy.contactCooldown <= 0 &&
        canEnemyContactAttack(enemy) &&
        distanceSquared(enemy, this.player) <= (enemy.radius + this.player.radius) ** 2
      ) {
        this.damagePlayer(enemy);
        if (this.state !== GAME_STATES.PLAYING) break;
      }
    }
  }

  assignEnemyCoordination() {
    const assignments = planEnemyCoordination(this.enemies, this.player);
    for (const enemy of this.enemies) {
      if (enemy.dead) continue;
      const assignment = assignments.get(String(enemy.id));
      const nextRole = assignment?.role || "solo";
      const roleChanged = enemy.coordinationRole !== nextRole;
      enemy.coordinationMode = assignment?.mode || "solo";
      enemy.coordinationRole = nextRole;
      enemy.coordinationGroupId = assignment?.groupId || null;
      enemy.coordinationGroupSize = assignment?.groupSize || 1;
      enemy.coordinationPartnerId = assignment?.partnerId || null;
      enemy.coordinationSlotAngle = assignment?.slotAngle ?? null;
      if (roleChanged) {
        enemy.path = [];
        enemy.pathCooldown = 0;
      }
    }
  }

  updateEnemyAi(enemy, dt) {
    const profile = ENEMY_TYPES[enemy.type];
    const difficulty = DIFFICULTY_CONFIG[this.difficultyId];
    const toPlayer = normalize(this.player.x - enemy.x, this.player.y - enemy.y);
    const playerAngle = Math.atan2(toPlayer.y, toPlayer.x);
    const enemyTile = worldToTile(enemy);
    const playerTile = worldToTile(this.player);
    const lineOfSight = toPlayer.length <= profile.detectionRange * difficulty.detectionMultiplier
      && hasLineOfSight(enemyTile, playerTile, (x, y) => this.isTileWalkable(x, y));
    const inFov = Math.abs(shortestAngle(enemy.facingAngle, playerAngle)) <= profile.fieldOfViewRadians / 2;
    const seesPlayer = lineOfSight && (inFov || enemy.state === "chase" || enemy.state === "alert" || enemy.state === "search");

    if (seesPlayer) {
      enemy.lastSeen = { ...playerTile };
      enemy.lostSightTimer = 0;
      if (!["alert", "chase"].includes(enemy.state)) {
        enemy.state = "alert";
        enemy.stateTimer = 0.42;
        enemy.path = [];
        if (this.enemyCueCooldown <= 0 && toPlayer.length < 420) {
          const pan = clamp((enemy.x - this.player.x) / 400, -1, 1);
          this.audio.enemy({ volume: 0.5, pan, pitch: enemy.type === "brute" ? -5 : enemy.type === "crawler" ? 4 : 0 });
          this.enemyCueCooldown = 0.8;
        }
      }
    } else if (enemy.state === "chase") {
      enemy.lostSightTimer += dt;
      if (enemy.lostSightTimer > 0.72) {
        enemy.state = "search";
        enemy.stateTimer = profile.searchSeconds;
        enemy.pathCooldown = 0;
      }
    }

    switch (enemy.state) {
      case "wander":
        enemy.stateTimer -= dt;
        if (!enemy.target || this.enemyReached(enemy, enemy.target)) {
          enemy.target = this.chooseWanderTarget(enemy, profile.territoryRadiusTiles);
          this.planEnemyPath(enemy, enemy.target);
        }
        this.followEnemyPath(enemy, dt, profile.moveSpeed * difficulty.enemySpeedMultiplier * 0.68);
        if (enemy.stateTimer <= 0) {
          enemy.state = "scan";
          enemy.stateTimer = this.rng.range(0.8, 1.7);
          enemy.scanOriginAngle = enemy.facingAngle;
          enemy.scanDirection = this.rng.chance(0.5) ? -1 : 1;
          enemy.path = [];
        }
        break;
      case "scan":
        enemy.stateTimer -= dt;
        enemy.facingAngle += enemy.scanDirection * profile.turnRate * 0.42 * dt;
        if (enemy.stateTimer <= 0) {
          enemy.state = "wander";
          enemy.stateTimer = this.rng.range(1.4, 4.2);
          enemy.target = null;
        }
        break;
      case "alert":
        enemy.facingAngle = rotateTowards(enemy.facingAngle, playerAngle, profile.turnRate * dt);
        enemy.stateTimer -= dt;
        if (enemy.stateTimer <= 0) {
          enemy.state = "chase";
          enemy.pathCooldown = 0;
        }
        break;
      case "chase": {
        const chasePlan = this.getEnemyChasePlan(enemy, playerTile);
        if (chasePlan.hold) {
          enemy.path = [];
          enemy.pathIndex = 0;
          enemy.facingAngle = rotateTowards(enemy.facingAngle, playerAngle, profile.turnRate * dt);
          break;
        }
        if (enemy.pathCooldown <= 0) {
          this.planEnemyPath(enemy, chasePlan.targetCell);
          const baseCooldown = enemy.type === "crawler" ? 0.28 : 0.42;
          enemy.pathCooldown = baseCooldown * (enemy.coordinationRole === "duo-reserve" ? 1.35 : 1);
        }
        this.followEnemyPath(
          enemy,
          dt,
          profile.moveSpeed * difficulty.enemySpeedMultiplier * chasePlan.speedMultiplier,
        );
        if (chasePlan.facePlayerAtTarget && this.enemyReached(enemy, chasePlan.targetCell)) {
          enemy.facingAngle = rotateTowards(enemy.facingAngle, playerAngle, profile.turnRate * dt);
        }
        break;
      }
      case "search":
        enemy.stateTimer -= dt;
        if (enemy.pathCooldown <= 0 && enemy.lastSeen) {
          this.planEnemyPath(enemy, enemy.lastSeen);
          enemy.pathCooldown = 0.75;
        }
        this.followEnemyPath(enemy, dt, profile.moveSpeed * difficulty.enemySpeedMultiplier * 0.78);
        if (enemy.stateTimer <= 0 || (enemy.lastSeen && this.enemyReached(enemy, enemy.lastSeen))) {
          enemy.state = "return";
          enemy.pathCooldown = 0;
          enemy.target = { ...enemy.home };
        }
        break;
      case "return":
        if (enemy.pathCooldown <= 0) {
          this.planEnemyPath(enemy, enemy.home);
          enemy.pathCooldown = 0.9;
        }
        this.followEnemyPath(enemy, dt, profile.moveSpeed * difficulty.enemySpeedMultiplier * 0.62);
        if (this.enemyReached(enemy, enemy.home)) {
          enemy.state = "wander";
          enemy.stateTimer = this.rng.range(1.4, 3.5);
          enemy.target = null;
          enemy.path = [];
        }
        break;
      default:
        enemy.state = "wander";
        break;
    }
  }

  chooseWanderTarget(enemy, radiusTiles) {
    for (let attempt = 0; attempt < 42; attempt += 1) {
      const cell = this.world.floorCells[this.rng.int(0, this.world.floorCells.length - 1)];
      const dx = cell.x - enemy.home.x;
      const dy = cell.y - enemy.home.y;
      if (dx * dx + dy * dy <= radiusTiles * radiusTiles && dx * dx + dy * dy > 6) return { x: cell.x, y: cell.y };
    }
    return { ...enemy.home };
  }

  findNearestWalkableCell(target, fallback, maxRadius = 4) {
    if (this.isTileWalkable(target.x, target.y)) return target;
    for (let radius = 1; radius <= maxRadius; radius += 1) {
      const candidates = [];
      for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
        for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
          if (Math.max(Math.abs(offsetX), Math.abs(offsetY)) !== radius) continue;
          const cell = { x: target.x + offsetX, y: target.y + offsetY };
          if (this.isTileWalkable(cell.x, cell.y)) candidates.push(cell);
        }
      }
      if (candidates.length > 0) {
        return candidates.sort((left, right) =>
          (left.x - target.x) ** 2 + (left.y - target.y) ** 2
          - ((right.x - target.x) ** 2 + (right.y - target.y) ** 2)
          || left.y - right.y
          || left.x - right.x
        )[0];
      }
    }
    return fallback;
  }

  getEnemyChasePlan(enemy, playerTile) {
    if (enemy.coordinationRole === "duo-reserve") {
      let away = normalize(enemy.x - this.player.x, enemy.y - this.player.y);
      if (away.length === 0) {
        away = { x: Math.cos(enemy.facingAngle || 0), y: Math.sin(enemy.facingAngle || 0), length: 1 };
      }
      const holdDistance = ENEMY_COORDINATION.duoHoldDistanceTiles * TILE_SIZE;
      const desired = {
        x: Math.floor((this.player.x + away.x * holdDistance) / TILE_SIZE),
        y: Math.floor((this.player.y + away.y * holdDistance) / TILE_SIZE),
      };
      const targetCell = this.findNearestWalkableCell(desired, worldToTile(enemy));
      return {
        targetCell,
        speedMultiplier: ENEMY_COORDINATION.duoReserveSpeedMultiplier,
        hold: this.enemyReached(enemy, targetCell),
        facePlayerAtTarget: true,
      };
    }

    if (enemy.coordinationRole === "pack-flanker" && Number.isFinite(enemy.coordinationSlotAngle)) {
      const leadDistance = this.player.moving ? TILE_SIZE * 0.8 : 0;
      const centerX = this.player.x + this.player.facingVector.x * leadDistance;
      const centerY = this.player.y + this.player.facingVector.y * leadDistance;
      const flankDistance = ENEMY_COORDINATION.packFlankDistanceTiles * TILE_SIZE;
      const desired = {
        x: Math.floor((centerX + Math.cos(enemy.coordinationSlotAngle) * flankDistance) / TILE_SIZE),
        y: Math.floor((centerY + Math.sin(enemy.coordinationSlotAngle) * flankDistance) / TILE_SIZE),
      };
      return {
        targetCell: this.findNearestWalkableCell(desired, playerTile),
        speedMultiplier: ENEMY_COORDINATION.packFlankSpeedMultiplier,
        hold: false,
        facePlayerAtTarget: true,
      };
    }

    return { targetCell: playerTile, speedMultiplier: 1, hold: false, facePlayerAtTarget: false };
  }

  planEnemyPath(enemy, targetCell) {
    if (!targetCell) return;
    const start = worldToTile(enemy);
    enemy.path = findPath(start, targetCell, (x, y) => this.isTileWalkable(x, y), this.world.width * this.world.height);
    enemy.pathIndex = 0;
  }

  followEnemyPath(enemy, dt, speed) {
    while (enemy.pathIndex < enemy.path.length) {
      const cell = enemy.path[enemy.pathIndex];
      const target = tileCenter(cell);
      const vector = normalize(target.x - enemy.x, target.y - enemy.y);
      if (vector.length < 5) {
        enemy.pathIndex += 1;
        continue;
      }
      const profile = ENEMY_TYPES[enemy.type];
      const desiredAngle = Math.atan2(vector.y, vector.x);
      enemy.facingAngle = rotateTowards(enemy.facingAngle, desiredAngle, profile.turnRate * dt);
      const turnError = Math.abs(shortestAngle(enemy.facingAngle, desiredAngle));
      const turnFactor = clamp(1 - turnError / 1.6, 0.18, 1);
      const moved = this.moveActor(
        enemy,
        Math.cos(enemy.facingAngle) * speed * turnFactor * dt,
        Math.sin(enemy.facingAngle) * speed * turnFactor * dt,
      );
      if (!moved) enemy.pathCooldown = 0;
      break;
    }
  }

  enemyReached(enemy, cell) {
    const center = tileCenter(cell);
    return distanceSquared(enemy, center) < (TILE_SIZE * 0.55) ** 2;
  }

  damagePlayer(enemy) {
    const beforeShards = this.player.shards;
    this.cancelLaserCharge();
    this.player.lives -= 1;
    if (this.player.shards > 0) this.player.shards -= 1;
    this.player.invulnerability = PLAYER_DEFAULTS.invulnerabilitySeconds;
    this.damageFlash = 1;
    enemy.contactCooldown = 1.1;
    this.advanceDuoAttack(enemy);
    this.cancelDoorActivation();

    const separation = normalize(this.player.x - enemy.x, this.player.y - enemy.y);
    const away = separation.length > 0
      ? separation
      : { x: Math.cos(enemy.facingAngle || 0), y: Math.sin(enemy.facingAngle || 0) };
    const pushed = this.pushActor(this.player, away.x, away.y, TILE_SIZE);
    if (pushed < TILE_SIZE - 0.5) {
      this.pushActor(enemy, -away.x, -away.y, TILE_SIZE * 1.15);
      enemy.stun = 0.62;
      enemy.state = "search";
      enemy.stateTimer = 1.2;
    }
    this.audio.hit({ volume: 0.85, pan: clamp((enemy.x - this.player.x) / 300, -1, 1) });
    this.emitParticles(this.player.x, this.player.y, "#ff4f72", 18, true);
    this.showToast(beforeShards > 0 ? "Life lost — and one carried shard shattered." : "Life lost — move while your light is protected!", 2.2);

    if (this.player.lives <= 0) this.fullDeath();
  }

  advanceDuoAttack(attacker) {
    if (attacker.coordinationMode !== "duo" || attacker.coordinationRole !== "duo-striker") return;
    const partner = this.enemies.find((enemy) =>
      !enemy.dead &&
      String(enemy.id) === attacker.coordinationPartnerId &&
      enemy.coordinationGroupId === attacker.coordinationGroupId
    );
    if (!partner) return;

    attacker.coordinationRole = "duo-reserve";
    attacker.coordinationPartnerId = String(partner.id);
    attacker.path = [];
    attacker.pathCooldown = 0;
    partner.coordinationMode = "duo";
    partner.coordinationRole = "duo-striker";
    partner.coordinationPartnerId = String(attacker.id);
    partner.path = [];
    partner.pathCooldown = 0;
  }

  fullDeath() {
    this.cancelLaserCharge();
    this.state = GAME_STATES.DEAD;
    this.projectiles = [];
    this.pendingContinuation = null;
    this.audio.stopAmbience({ fade: 0.7 });
    this.dom.deathShardCount.textContent = String(this.player.shards);
    this.dom.deathLevelNumber.textContent = String(this.levelId);
    const nightmare = DIFFICULTY_CONFIG[this.difficultyId].nightmareRunReset;
    if (nightmare) {
      this.selectedLevel = 1;
      this.nightmareResetRequired = true;
      this.persistSave();
      this.updateMenu();
    }
    this.dom.deathDescription.textContent = nightmare
      ? "Nightmare extinguishes the whole run. Your hotbar and special Laser Focus are lost, and the next attempt begins at Level 1."
      : `Your hotbar and special Laser Focus are lost. The next attempt restarts ${LEVEL_CONFIG[this.levelId].name} with Standard Focus.`;
    this.dom.retryButton.textContent = nightmare ? "Return to Level 1" : "Retry this level";
    this.showModal("deathOverlay", this.dom.retryButton);
  }

  retryAfterDeath() {
    const restartLevel = DIFFICULTY_CONFIG[this.difficultyId].nightmareRunReset ? 1 : this.levelId;
    this.startRun(restartLevel);
  }

  pause() {
    if (this.state !== GAME_STATES.PLAYING) return;
    this.cancelLaserCharge();
    this.state = GAME_STATES.PAUSED;
    this.input.reset();
    this.audio.stopAmbience({ fade: 0.25 });
    this.showModal("pauseOverlay", this.dom.resumeButton);
  }

  resume() {
    if (this.state !== GAME_STATES.PAUSED) return;
    this.hideModals();
    this.state = GAME_STATES.PLAYING;
    this.input.reset();
    this.audio.startAmbience();
    this.dom.canvas.focus({ preventScroll: true });
  }

  openExit() {
    this.cancelLaserCharge();
    this.stateBeforeExit = this.state;
    this.state = GAME_STATES.EXIT;
    this.showModal("exitOverlay", this.dom.cancelExitButton);
  }

  closeExit() {
    this.hideModals();
    this.state = this.stateBeforeExit || GAME_STATES.MENU;
    if (this.state === GAME_STATES.MENU) this.dom.playButton.focus({ preventScroll: true });
  }

  confirmExit() {
    this.persistSave();
    window.close();
    this.dom.exitTitle.textContent = "Progress Saved";
    this.dom.exitDescription.textContent = "Browsers only close tabs opened by a game. You can safely close this tab, or stay and keep exploring.";
    this.dom.confirmExitButton.hidden = true;
    this.dom.cancelExitButton.textContent = "Return to title";
    this.dom.cancelExitButton.focus();
  }

  showModal(id, focusTarget) {
    this.hideModals();
    const modal = byId(id);
    modal.hidden = false;
    focusTarget?.focus({ preventScroll: true });
  }

  hideModals() {
    for (const modal of this.dom.modals) modal.hidden = true;
    this.dom.confirmExitButton.hidden = false;
    this.dom.cancelExitButton.textContent = "Stay";
  }

  isTileWalkable(x, y) {
    return x >= 0 && y >= 0 && x < this.world.width && y < this.world.height && this.world.tiles[y][x] === TILE_TYPES.FLOOR;
  }

  isPixelWalkable(x, y) {
    return this.isTileWalkable(Math.floor(x / TILE_SIZE), Math.floor(y / TILE_SIZE));
  }

  canOccupy(x, y, radius) {
    // A circle exactly touching a tile boundary is not penetrating that wall.
    // Probe infinitesimally inside the radius so 16px Brutes can traverse a
    // 32px tile without their perimeter flooring into the neighbouring cell.
    const probeRadius = Math.max(0, radius - 0.01);
    const diagonal = probeRadius * Math.SQRT1_2;
    const points = [
      [probeRadius, 0], [-probeRadius, 0], [0, probeRadius], [0, -probeRadius],
      [diagonal, diagonal], [diagonal, -diagonal], [-diagonal, diagonal], [-diagonal, -diagonal],
    ];
    return points.every(([offsetX, offsetY]) => this.isPixelWalkable(x + offsetX, y + offsetY));
  }

  moveActor(actor, dx, dy) {
    let moved = false;
    if (dx !== 0 && this.canOccupy(actor.x + dx, actor.y, actor.radius)) {
      actor.x += dx;
      moved = true;
    }
    if (dy !== 0 && this.canOccupy(actor.x, actor.y + dy, actor.radius)) {
      actor.y += dy;
      moved = true;
    }
    return moved;
  }

  pushActor(actor, directionX, directionY, distanceToPush) {
    let pushed = 0;
    let attempts = 0;
    const increment = 4;
    while (pushed < distanceToPush && attempts < 24) {
      attempts += 1;
      const step = Math.min(increment, distanceToPush - pushed);
      const beforeX = actor.x;
      const beforeY = actor.y;
      if (!this.moveActor(actor, directionX * step, directionY * step)) break;
      const actualDistance = Math.hypot(actor.x - beforeX, actor.y - beforeY);
      if (actualDistance < 0.01) break;
      pushed += actualDistance;
    }
    return pushed;
  }

  updateCamera(dt) {
    const facing = this.player.facingVector;
    const lookAhead = this.reducedMotion ? 0 : 28;
    const maxX = Math.max(0, this.world.pixelWidth - LOGICAL_WIDTH);
    const maxY = Math.max(0, this.world.pixelHeight - LOGICAL_HEIGHT);
    const targetX = clamp(this.player.x - LOGICAL_WIDTH / 2 + facing.x * lookAhead, 0, maxX);
    const targetY = clamp(this.player.y - LOGICAL_HEIGHT / 2 + facing.y * lookAhead, 0, maxY);
    const ease = this.reducedMotion ? 1 : 1 - Math.exp(-dt * 8.5);
    this.camera.x += (targetX - this.camera.x) * ease;
    this.camera.y += (targetY - this.camera.y) * ease;
  }

  emitParticles(x, y, color, count, glow = false) {
    const actualCount = this.reducedMotion ? Math.max(1, Math.ceil(count * 0.4)) : count;
    for (let index = 0; index < actualCount; index += 1) {
      const angle = this.rng.range(0, TAU);
      const speed = this.rng.range(22, 105);
      const maxLife = this.rng.range(0.28, 0.8);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: maxLife,
        maxLife,
        size: this.rng.int(2, 5),
        color,
        glow,
      });
    }
  }

  updateParticles(dt) {
    for (const particle of this.particles) {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= Math.max(0, 1 - dt * 2.2);
      particle.vy = particle.vy * Math.max(0, 1 - dt * 1.4) + 16 * dt;
    }
    this.particles = this.particles.filter((particle) => particle.life > 0).slice(-500);
  }

  updateControlHint() {
    if (this.canInteractWithDoor()) {
      this.dom.controlHintKey.textContent = "Space";
      this.dom.controlHintText.textContent = this.player.shards >= RULES.shardGoal
        ? (this.door.activating ? "awakening seal…" : "awaken exit seal")
        : `seal needs ${RULES.shardGoal - this.player.shards} shard${RULES.shardGoal - this.player.shards === 1 ? "" : "s"}`;
    } else {
      const focus = this.getEquippedLaserFocus();
      this.dom.controlHintKey.textContent = "Space";
      this.dom.controlHintText.textContent = this.player.shards >= focus.shardCost
        ? (focus.chargeTime > 0
            ? `hold to charge ${focus.shortName} · release to fire`
            : `fire ${focus.shortName}`)
        : "find a shard to fire";
    }
  }

  updateHud() {
    if (!this.player) return;
    this.dom.shardCount.textContent = String(this.player.shards);
    this.dom.shardGoal.textContent = String(RULES.shardGoal);
    this.dom.levelNumber.textContent = String(this.levelId);
    this.dom.difficultyLabel.textContent = DIFFICULTY_CONFIG[this.difficultyId].label;
    this.dom.difficultyLabel.dataset.difficulty = this.difficultyId;
    const hasHalfLife = this.player.healProgress === 1;
    const halfLifeSlot = this.player.lives < this.player.maxLives ? this.player.lives : -1;
    const storedPastFullLives = hasHalfLife && halfLifeSlot === -1;
    const livesLabel = hasHalfLife
      ? (storedPastFullLives
          ? `${this.player.lives} lives, one Half Heart stored`
          : `${this.player.lives} and a half lives`)
      : `${this.player.lives} ${this.player.lives === 1 ? "life" : "lives"}`;
    this.dom.livesDisplay.setAttribute("aria-label", livesLabel);

    this.dom.hearts.forEach((heart, index) => {
      const full = index < this.player.lives;
      const half = hasHalfLife && index === halfLifeSlot;
      heart.classList.toggle("is-full", full);
      heart.classList.toggle("is-half", half);
      heart.classList.toggle("is-empty", !full && !half);
      heart.textContent = full || half ? "♥" : "♡";
    });

    this.dom.storedHalfHeart.hidden = !storedPastFullLives;
    this.dom.storedHalfHeart.classList.toggle("is-half", storedPastFullLives);

    this.updateLaserFocusHud();

    this.dom.hotbarButtons.forEach((button, index) => {
      const item = this.player.hotbar[index];
      const selected = index === this.player.selectedSlot;
      button.dataset.item = item || "";
      button.classList.toggle("is-empty", !item);
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
      button.setAttribute("aria-label", `Slot ${index + 1}, ${item ? "Half Heart" : "empty"}${selected ? ", selected" : ""}`);
      const icon = button.querySelector(".slot-icon");
      const tooltip = button.querySelector(".slot-tooltip");
      if (icon) {
        icon.textContent = "";
        icon.classList.toggle("is-half-heart", item === "half-heart");
      }
      if (tooltip) tooltip.textContent = item ? "Half Heart · F to use" : "Empty";
    });
  }

  updateLaserFocusHud() {
    const focus = this.getEquippedLaserFocus();
    const chargeFocus = this.player.focusCharging
      ? getLaserFocus(this.player.chargingFocusId)
      : focus;
    const chargeRatio = this.player.focusCharging && chargeFocus.chargeTime > 0
      ? clamp(this.player.focusCharge / chargeFocus.chargeTime, 0, 1)
      : 0;
    this.dom.laserFocusSlot.dataset.focusId = focus.id;
    this.dom.laserFocusSlot.style.setProperty("--focus-color", focus.color);
    this.dom.laserFocusSlot.classList.toggle("is-charging", this.player.focusCharging);
    this.dom.laserFocusSlot.classList.toggle("is-ready", this.player.focusChargeReady);
    this.dom.laserFocusSlot.setAttribute(
      "aria-label",
      `Equipped Laser Focus: ${focus.name}. ${focus.damage} damage, ${focus.shardCost} shard per shot${focus.chargeTime > 0 ? `, ${focus.chargeTime.toFixed(2)} second charge` : ""}.`,
    );
    this.dom.laserFocusGlyph.textContent = focus.icon;
    this.dom.laserFocusName.textContent = focus.shortName;
    this.dom.focusChargeFill.style.setProperty("--charge", `${chargeRatio * 100}%`);

    const signature = `${this.player.laserFocusIds.join(",")}|${this.player.equippedFocusId}`;
    if (this.dom.focusPicker.dataset.signature !== signature) {
      this.dom.focusPicker.dataset.signature = signature;
      const options = this.player.laserFocusIds.map((focusId, index) => {
        const optionFocus = getLaserFocus(focusId);
        const option = document.createElement("div");
        option.className = "focus-option";
        option.classList.toggle("is-equipped", focusId === this.player.equippedFocusId);
        option.style.setProperty("--option-color", optionFocus.color);
        option.setAttribute("role", "option");
        option.setAttribute("aria-selected", String(focusId === this.player.equippedFocusId));

        const key = document.createElement("kbd");
        key.textContent = String(index + 1);
        const name = document.createElement("span");
        name.textContent = optionFocus.name;
        const state = document.createElement("span");
        state.className = "focus-option-state";
        state.textContent = focusId === this.player.equippedFocusId ? "Equipped" : `${optionFocus.damage} DMG`;
        option.append(key, name, state);
        return option;
      });
      this.dom.focusPicker.replaceChildren(...options);
    }
    this.dom.focusPicker.hidden = !this.input.isHeld("focusModifier");
  }

  showToast(text, duration = 2) {
    this.dom.toastText.textContent = text;
    this.dom.toast.hidden = false;
    this.toastTimer = duration;
  }

  showGameMessage(text, duration = 5, icon = "✦") {
    this.dom.gameMessageText.textContent = text;
    this.dom.gameMessageIcon.textContent = icon;
    this.dom.gameMessage.hidden = false;
    this.messageTimer = duration;
  }

  updateUiTimers(dt) {
    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) this.dom.toast.hidden = true;
    }
    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
      if (this.messageTimer <= 0) this.dom.gameMessage.hidden = true;
    }
  }
}

export default CrystalLabyrinthGame;
