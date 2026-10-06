import {
  DIFFICULTY_CONFIG,
  ENEMY_TYPES,
  ITEM_TYPES,
  PLAYER_DEFAULTS,
  RULES,
  TILE_SIZE,
} from "./config.js";
import { SeededRNG } from "./maze.js";
import {
  DEFAULT_LASER_FOCUS_ID,
  getDiscoverableLaserFocuses,
  normalizeEquippedLaserFocus,
  normalizeLaserFocusIds,
} from "./laser-focus.js";
import { weightedChoice } from "./utils.js";

export function createPlayer(spawn, carry = {}) {
  const laserFocusIds = normalizeLaserFocusIds(carry.laserFocusIds);
  return {
    x: spawn.worldX,
    y: spawn.worldY,
    previousX: spawn.worldX,
    previousY: spawn.worldY,
    radius: PLAYER_DEFAULTS.radius,
    moveSpeed: PLAYER_DEFAULTS.moveSpeed,
    lives: carry.lives ?? PLAYER_DEFAULTS.lives,
    maxLives: PLAYER_DEFAULTS.maxLives,
    shards: 0,
    facing: "down",
    facingVector: { x: 0, y: 1 },
    moving: false,
    invulnerability: 0,
    fireCooldown: 0,
    hotbar: carry.hotbar ? [...carry.hotbar] : Array(RULES.hotbarSlots).fill(null),
    selectedSlot: carry.selectedSlot ?? 0,
    healProgress: carry.healProgress ?? 0,
    laserFocusIds,
    equippedFocusId: normalizeEquippedLaserFocus(
      carry.equippedFocusId ?? DEFAULT_LASER_FOCUS_ID,
      laserFocusIds,
    ),
    focusCharging: false,
    focusCharge: 0,
    focusChargeReady: false,
    chargingFocusId: null,
    focusChargeParticleTimer: 0,
    focusChargeSoundStep: -1,
  };
}

export function createEnemy(typeId, cell, id, rng) {
  const profile = ENEMY_TYPES[typeId];
  const angle = rng.range(0, Math.PI * 2);
  return {
    id,
    type: typeId,
    x: (cell.x + 0.5) * TILE_SIZE,
    y: (cell.y + 0.5) * TILE_SIZE,
    radius: profile.radius,
    health: profile.maxHealth,
    maxHealth: profile.maxHealth,
    state: "wander",
    stateTimer: rng.range(1.2, 3.2),
    facingAngle: angle,
    home: { x: cell.x, y: cell.y },
    target: null,
    lastSeen: null,
    path: [],
    pathIndex: 0,
    pathCooldown: rng.range(0, 0.45),
    scanDirection: rng.chance(0.5) ? -1 : 1,
    scanOriginAngle: angle,
    lostSightTimer: 0,
    stun: 0,
    contactCooldown: 0,
    coordinationMode: "solo",
    coordinationRole: "solo",
    coordinationGroupId: null,
    coordinationGroupSize: 1,
    coordinationPartnerId: null,
    coordinationSlotAngle: null,
    dead: false,
  };
}

function enemyWeightsForLevel(levelId) {
  if (levelId === 1) {
    return [
      { value: "basic", weight: 0.62 },
      { value: "crawler", weight: 0.3 },
      { value: "brute", weight: 0.08 },
    ];
  }
  if (levelId === 2) {
    return [
      { value: "basic", weight: 0.47 },
      { value: "crawler", weight: 0.34 },
      { value: "brute", weight: 0.19 },
    ];
  }
  return [
    { value: "basic", weight: 0.36 },
    { value: "crawler", weight: 0.34 },
    { value: "brute", weight: 0.3 },
  ];
}

function cellDistanceSquared(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function chooseUniqueCells(candidates, count, rng, occupied, minimumSeparation = 2) {
  const selected = [];
  const separationSquared = minimumSeparation * minimumSeparation;
  for (const cell of rng.shuffle(candidates)) {
    if (selected.length >= count) break;
    const key = `${cell.x},${cell.y}`;
    if (occupied.has(key)) continue;
    if (selected.some((other) => cellDistanceSquared(cell, other) < separationSquared)) continue;
    occupied.add(key);
    selected.push(cell);
  }
  return selected;
}

function chooseFocusChamber(world, rng, occupied) {
  const rooms = world.rooms || [];
  const candidates = rooms.filter((room) => {
    if (room.id === 0 || !room.center) return false;
    const center = room.center;
    if (cellDistanceSquared(center, world.spawn) < 11 ** 2) return false;
    if (cellDistanceSquared(center, world.door) < 5 ** 2) return false;
    return !occupied.has(`${center.x},${center.y}`);
  });
  if (candidates.length === 0) return null;

  // Favour larger, remote chambers, then retain seeded variation among the best.
  const ranked = candidates
    .map((room) => ({
      room,
      score: room.width * room.height + Math.sqrt(cellDistanceSquared(room.center, world.spawn)) * 2 + rng.range(0, 24),
    }))
    .sort((left, right) => right.score - left.score);
  const chamber = rng.pick(ranked.slice(0, Math.max(1, Math.ceil(ranked.length / 3)))).room;
  return { ...chamber.center, roomId: chamber.id };
}

/** Populate one generated map with balanced pickups and territory-based enemies. */
export function populateWorld(world, levelId, difficultyId, seed) {
  const rng = new SeededRNG(`${seed}:population`);
  const difficulty = DIFFICULTY_CONFIG[difficultyId];
  const occupied = new Set();
  const candidatePool = [...world.pickupSpawnCandidates];

  // Leave enough ammunition beyond the ten-shard objective to reward combat while
  // keeping avoidance viable. Full-cap pickups remain in the world for later use.
  const regularCount = Math.max(13, Math.round((17 + levelId * 2) * difficulty.crystalSpawnMultiplier));
  const chunkCount = Math.max(3, Math.round((4 + levelId) * Math.max(0.8, difficulty.crystalSpawnMultiplier)));
  const heartCount = Math.max(1, Math.round((6 - levelId) * difficulty.halfHeartSpawnMultiplier));
  const discoverableFocus = rng.pick(getDiscoverableLaserFocuses());
  const focusCell = discoverableFocus ? chooseFocusChamber(world, rng, occupied) : null;
  if (focusCell) occupied.add(`${focusCell.x},${focusCell.y}`);
  const pickupCount = regularCount + chunkCount + heartCount;
  const pickupCells = chooseUniqueCells(candidatePool, pickupCount, rng, occupied, 2);
  const pickups = [];
  let cursor = 0;

  if (focusCell) {
    pickups.push({
      id: `focus-${discoverableFocus.id}`,
      kind: "laser-focus",
      focusId: discoverableFocus.id,
      chamberType: "focus-chamber",
      roomId: focusCell.roomId,
      x: (focusCell.x + 0.5) * TILE_SIZE,
      y: (focusCell.y + 0.5) * TILE_SIZE,
      tileX: focusCell.x,
      tileY: focusCell.y,
      color: discoverableFocus.color,
      phase: rng.range(0, Math.PI * 2),
      collected: false,
    });
  }

  const addPickup = (kind, amount, color) => {
    for (let index = 0; index < amount && cursor < pickupCells.length; index += 1) {
      const cell = pickupCells[cursor++];
      pickups.push({
        id: `pickup-${pickups.length}`,
        kind,
        x: (cell.x + 0.5) * TILE_SIZE,
        y: (cell.y + 0.5) * TILE_SIZE,
        tileX: cell.x,
        tileY: cell.y,
        color,
        phase: rng.range(0, Math.PI * 2),
        collected: false,
      });
    }
  };

  addPickup("regular-crystal", regularCount, ITEM_TYPES.regularCrystal.color);
  addPickup("crystal-chunk", chunkCount, ITEM_TYPES.crystalChunk.color);
  addPickup("half-heart", heartCount, ITEM_TYPES.halfHeart.color);

  const desiredEnemies = Math.max(
    5,
    Math.round((5 + levelId * 3.4) * difficulty.enemyDensityMultiplier),
  );
  const territories = rng.shuffle(world.enemyTerritoryCandidates);
  const fallbackCells = rng.shuffle(
    world.floorCells.filter((cell) => cellDistanceSquared(cell, world.spawn) > 12 * 12),
  );
  const enemyCells = [];

  for (let index = 0; index < desiredEnemies; index += 1) {
    const territory = territories[index % Math.max(1, territories.length)];
    let cell = territory ? { x: territory.x, y: territory.y } : fallbackCells[index];
    if ((!cell || occupied.has(`${cell.x},${cell.y}`) || index >= territories.length) && territory) {
      const nearby = fallbackCells.find(
        (candidate) =>
          !occupied.has(`${candidate.x},${candidate.y}`) &&
          cellDistanceSquared(candidate, territory) <= territory.radiusTiles ** 2 &&
          cellDistanceSquared(candidate, world.spawn) > 10 * 10,
      );
      if (nearby) cell = nearby;
    }
    if (!cell) continue;
    const key = `${cell.x},${cell.y}`;
    if (occupied.has(key)) continue;
    occupied.add(key);
    enemyCells.push(cell);
  }

  // A territory anchor can coincide with a pickup or another territory. Backfill
  // from safe distant floor cells so the requested pressure never silently drops.
  for (const cell of fallbackCells) {
    if (enemyCells.length >= desiredEnemies) break;
    const key = `${cell.x},${cell.y}`;
    if (occupied.has(key)) continue;
    occupied.add(key);
    enemyCells.push(cell);
  }

  const weights = enemyWeightsForLevel(levelId);
  const enemies = enemyCells.map((cell, index) => {
    const type = weightedChoice(weights, () => rng.next());
    return createEnemy(type, cell, `enemy-${index}`, rng);
  });

  // Guarantee one brute in deeper levels with a deterministic final correction.
  if (levelId > 1 && enemies.length && !enemies.some((enemy) => enemy.type === "brute")) {
    const last = enemies.at(-1);
    Object.assign(last, createEnemy("brute", last.home, last.id, rng));
  }

  return { pickups, enemies };
}

export default { createPlayer, createEnemy, populateWorld };
