/**
 * Shared, data-driven configuration for Crystal Labyrinth.
 *
 * Distances used by gameplay actors are expressed in logical canvas pixels unless
 * a property explicitly includes `Tiles` in its name. Durations are in seconds.
 */

/** Deep-freeze a configuration tree so runtime systems cannot mutate balancing data. */
function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;

  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

export const LOGICAL_WIDTH = 960;
export const LOGICAL_HEIGHT = 540;
export const TILE_SIZE = 32;

/** Fixed logical viewport. CSS may scale this while preserving the aspect ratio. */
export const VIEWPORT = deepFreeze({
  width: LOGICAL_WIDTH,
  height: LOGICAL_HEIGHT,
  tileSize: TILE_SIZE,
  visibleColumns: Math.ceil(LOGICAL_WIDTH / TILE_SIZE),
  visibleRows: Math.ceil(LOGICAL_HEIGHT / TILE_SIZE),
});

/** Integer tile values stored in generated map grids. */
export const TILE_TYPES = deepFreeze({
  WALL: 0,
  FLOOR: 1,
});

/** Lightweight localStorage key. Increment the suffix for breaking save changes. */
export const SAVE_KEY = "crystal-labyrinth-save-v1";

/** Core rules shared by all levels and difficulties. */
export const RULES = deepFreeze({
  shardGoal: 10,
  shardCapacity: 10,
  regularCrystalValue: 1,
  crystalChunkValue: 2,
  doorActivationSeconds: 2,
  resonanceCooldownSeconds: 4,
  crystalRespawn: {
    regularSeconds: 12,
    chunkSeconds: 20,
    jitterSeconds: 3,
    emergencySeconds: 3,
  },
  hotbarSlots: 6,
  halfHeartsPerLife: 2,
});

/**
 * Per-level profiles. Base map dimensions are scaled by the selected difficulty;
 * even the smallest result is substantially larger than the 30x17-tile viewport.
 */
export const LEVEL_CONFIG = deepFreeze({
  1: {
    id: 1,
    key: "upper-crystal-caverns",
    name: "Upper Crystal Caverns",
    subtitle: "The glittering entrance to the labyrinth",
    map: {
      width: 65,
      height: 45,
      roomCount: 18,
      roomMinSize: 5,
      roomMaxSize: 11,
      corridorRadius: 1,
      loopRatio: 0.38,
      edgeGrowthPasses: 2,
    },
    ambientLight: 0.44,
    playerLightBase: 172,
    playerLightPerShard: 7,
    decorationDensity: 0.055,
    palette: ["cyan", "blue", "violet", "pink"],
  },
  2: {
    id: 2,
    key: "deep-crystal-network",
    name: "Deep Crystal Network",
    subtitle: "Twisting veins beneath the caverns",
    map: {
      width: 77,
      height: 53,
      roomCount: 24,
      roomMinSize: 5,
      roomMaxSize: 13,
      corridorRadius: 1,
      loopRatio: 0.32,
      edgeGrowthPasses: 2,
    },
    ambientLight: 0.2,
    playerLightBase: 150,
    playerLightPerShard: 8,
    decorationDensity: 0.05,
    palette: ["blue", "violet", "pink", "cyan"],
  },
  3: {
    id: 3,
    key: "the-abyss",
    name: "The Abyss",
    subtitle: "Only crystal light survives here",
    map: {
      width: 89,
      height: 61,
      roomCount: 30,
      roomMinSize: 5,
      roomMaxSize: 13,
      corridorRadius: 1,
      loopRatio: 0.27,
      edgeGrowthPasses: 3,
    },
    ambientLight: 0.085,
    playerLightBase: 126,
    playerLightPerShard: 9,
    decorationDensity: 0.045,
    palette: ["violet", "pink", "blue", "cyan"],
  },
});

/**
 * Difficulty profiles. Enemy movement multipliers are exact design values;
 * enemy turning rates deliberately do not appear here and therefore never scale.
 */
export const DIFFICULTY_CONFIG = deepFreeze({
  easy: {
    id: "easy",
    label: "Easy",
    enemySpeedMultiplier: 0.8,
    mapSizeMultiplier: 0.92,
    enemyDensityMultiplier: 0.72,
    crystalSpawnMultiplier: 1.24,
    crystalRespawnMultiplier: 0.75,
    halfHeartSpawnMultiplier: 1.35,
    detectionMultiplier: 0.82,
    darknessMultiplier: 0.88,
    nightmareRunReset: false,
  },
  normal: {
    id: "normal",
    label: "Normal",
    enemySpeedMultiplier: 0.9,
    mapSizeMultiplier: 1,
    enemyDensityMultiplier: 1,
    crystalSpawnMultiplier: 1,
    crystalRespawnMultiplier: 1,
    halfHeartSpawnMultiplier: 1,
    detectionMultiplier: 1,
    darknessMultiplier: 1,
    nightmareRunReset: false,
  },
  hard: {
    id: "hard",
    label: "Hard",
    enemySpeedMultiplier: 1,
    mapSizeMultiplier: 1.12,
    enemyDensityMultiplier: 1.28,
    crystalSpawnMultiplier: 0.86,
    crystalRespawnMultiplier: 1.25,
    halfHeartSpawnMultiplier: 0.72,
    detectionMultiplier: 1.16,
    darknessMultiplier: 1.1,
    nightmareRunReset: false,
  },
  nightmare: {
    id: "nightmare",
    label: "Nightmare",
    enemySpeedMultiplier: 1.2,
    mapSizeMultiplier: 1.24,
    enemyDensityMultiplier: 1.58,
    crystalSpawnMultiplier: 0.82,
    crystalRespawnMultiplier: 1.45,
    halfHeartSpawnMultiplier: 0.5,
    detectionMultiplier: 1.3,
    darknessMultiplier: 1.2,
    nightmareRunReset: true,
  },
});

/** Default player state and movement/combat tuning. */
export const PLAYER_DEFAULTS = deepFreeze({
  radius: 10,
  moveSpeed: 145,
  lives: 3,
  maxLives: 3,
  shards: 0,
  maxShards: RULES.shardCapacity,
  facing: "down",
  invulnerabilitySeconds: 1,
  knockbackTiles: 1,
});

/**
 * Enemy archetypes. `turnRate` is intrinsic to each type and must not be
 * multiplied by difficulty.
 */
export const ENEMY_TYPES = deepFreeze({
  basic: {
    id: "basic",
    label: "Crystal Stalker",
    maxHealth: 1,
    radius: 11,
    moveSpeed: 86,
    turnRate: 2.6,
    detectionRange: 250,
    fieldOfViewRadians: 1.42,
    searchSeconds: 3.2,
    territoryRadiusTiles: 8,
    color: "#9c5cff",
  },
  crawler: {
    id: "crawler",
    label: "Shard Crawler",
    maxHealth: 1,
    radius: 8,
    moveSpeed: 122,
    turnRate: 3.1,
    detectionRange: 205,
    fieldOfViewRadians: 1.28,
    searchSeconds: 2.4,
    territoryRadiusTiles: 7,
    color: "#e050d8",
  },
  brute: {
    id: "brute",
    label: "Abyss Brute",
    maxHealth: 2,
    radius: 16,
    moveSpeed: 66,
    turnRate: 1.85,
    detectionRange: 285,
    fieldOfViewRadians: 1.34,
    searchSeconds: 4.4,
    territoryRadiusTiles: 10,
    color: "#b971ff",
  },
});

/** Pickup and hotbar item definitions. Items never stack in v1. */
export const ITEM_TYPES = deepFreeze({
  halfHeart: {
    id: "half-heart",
    label: "Half Heart",
    kind: "consumable",
    stackable: false,
    maxStack: 1,
    healUnits: 1,
    healUnitsRequired: RULES.halfHeartsPerLife,
    color: "#ff4f9a",
  },
  regularCrystal: {
    id: "regular-crystal",
    label: "Crystal Shard",
    kind: "shard",
    shardValue: RULES.regularCrystalValue,
    color: "#43eaff",
  },
  crystalChunk: {
    id: "crystal-chunk",
    label: "Crystal Chunk",
    kind: "shard",
    shardValue: RULES.crystalChunkValue,
    color: "#f05dff",
  },
});

/** Central visual palette used by canvas renderers and DOM UI. */
export const COLORS = deepFreeze({
  black: "#03040c",
  caveVoid: "#050616",
  wallDark: "#100d27",
  wallMid: "#21184a",
  wallHighlight: "#49337c",
  floorDark: "#0d1027",
  floorMid: "#171b3b",
  floorHighlight: "#25305a",
  cyan: "#38e8ff",
  blue: "#4385ff",
  violet: "#a84dff",
  purple: "#6f36d8",
  pink: "#f05ae6",
  amber: "#ffc84a",
  danger: "#ff4f72",
  heart: "#ff4f9a",
  text: "#f3efff",
  textMuted: "#aaa2c5",
  panel: "rgba(5, 5, 15, 0.9)",
  panelBorder: "#59466f",
});

/** Convenience aggregate for systems that prefer one imported object. */
export const GAME_CONFIG = deepFreeze({
  viewport: VIEWPORT,
  rules: RULES,
  levels: LEVEL_CONFIG,
  difficulties: DIFFICULTY_CONFIG,
  player: PLAYER_DEFAULTS,
  enemies: ENEMY_TYPES,
  items: ITEM_TYPES,
  colors: COLORS,
  saveKey: SAVE_KEY,
});

export default GAME_CONFIG;
