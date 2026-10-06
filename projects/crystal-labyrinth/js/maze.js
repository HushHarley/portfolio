import {
  DIFFICULTY_CONFIG,
  LEVEL_CONFIG,
  TILE_SIZE,
  TILE_TYPES,
  VIEWPORT,
} from "./config.js";

/**
 * @typedef {object} TilePoint
 * @property {number} x Integer tile column.
 * @property {number} y Integer tile row.
 */

/**
 * @typedef {TilePoint & {worldX: number, worldY: number}} WorldPoint
 * A tile coordinate accompanied by its center in logical world pixels.
 */

/**
 * @typedef {object} MazeDecoration
 * @property {number} x
 * @property {number} y
 * @property {string} type
 * @property {string} color
 * @property {number} variant
 * @property {number} scale
 * @property {number} glow
 */

/**
 * @typedef {object} EnemyTerritoryCandidate
 * @property {number} x Territory anchor column.
 * @property {number} y Territory anchor row.
 * @property {number} radiusTiles Suggested roaming radius.
 * @property {number} weight Relative suitability for enemy placement.
 * @property {number|null} roomId Source room, or null for a fallback candidate.
 * @property {string[]} preferredEnemyTypes Suggested population mix.
 */

/**
 * @typedef {object} MazeResult
 * @property {number[][]} tiles Row-major grid containing `TILE_TYPES` values.
 * @property {number} width Width in tiles.
 * @property {number} height Height in tiles.
 * @property {number} pixelWidth Width in logical world pixels.
 * @property {number} pixelHeight Height in logical world pixels.
 * @property {WorldPoint} spawn Player spawn position.
 * @property {WorldPoint & {facing: string}} door Exit-door position.
 * @property {TilePoint[]} floorCells Every traversable tile.
 * @property {MazeDecoration[]} decorations Non-colliding visual dressing data.
 * @property {TilePoint[]} pickupSpawnCandidates Spaced, safe pickup anchors.
 * @property {EnemyTerritoryCandidate[]} enemyTerritoryCandidates Enemy camp anchors.
 * @property {object[]} rooms Generated room metadata for debug/extension systems.
 * @property {string|number} seed Original generation seed.
 * @property {number} levelId
 * @property {string} difficultyId
 */

const CARDINAL_DIRECTIONS = Object.freeze([
  Object.freeze({ x: 1, y: 0 }),
  Object.freeze({ x: -1, y: 0 }),
  Object.freeze({ x: 0, y: 1 }),
  Object.freeze({ x: 0, y: -1 }),
]);

/** Convert a string or number seed into a well-distributed unsigned 32-bit value. */
function hashSeed(seed) {
  const text = String(seed ?? "crystal-labyrinth");
  let hash = 0x811c9dc5;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x7feb352d);
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x846ca68b);
  hash ^= hash >>> 16;
  return hash >>> 0;
}

/**
 * Small deterministic PRNG using a Mulberry32 step.
 * Supplying the same seed and making calls in the same order gives identical maps.
 */
export class SeededRNG {
  /** @param {string|number} [seed] */
  constructor(seed = "crystal-labyrinth") {
    this.seed = seed;
    this.state = hashSeed(seed);
  }

  /** @returns {number} A floating-point number in the half-open range [0, 1). */
  next() {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let value = this.state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }

  /** Alias useful in APIs that expect a `random()` method. */
  random() {
    return this.next();
  }

  /** @returns {boolean} Whether an event with the supplied probability occurs. */
  chance(probability) {
    return this.next() < Math.max(0, Math.min(1, probability));
  }

  /** @returns {number} A floating-point number in [minimum, maximum). */
  range(minimum, maximum) {
    return minimum + this.next() * (maximum - minimum);
  }

  /** @returns {number} An integer in the inclusive range [minimum, maximum]. */
  int(minimum, maximum) {
    const low = Math.ceil(Math.min(minimum, maximum));
    const high = Math.floor(Math.max(minimum, maximum));
    return low + Math.floor(this.next() * (high - low + 1));
  }

  /** @template T @param {T[]} values @returns {T|undefined} */
  pick(values) {
    return values.length ? values[this.int(0, values.length - 1)] : undefined;
  }

  /** @template T @param {T[]} values @returns {T[]} A shuffled copy of `values`. */
  shuffle(values) {
    const result = Array.from(values);
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = this.int(0, index);
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  /** @returns {SeededRNG} A deterministic independent stream derived from this seed. */
  fork(label) {
    return new SeededRNG(`${String(this.seed)}:${String(label)}`);
  }
}

/** @param {string|number} seed @returns {SeededRNG} */
export function createSeededRNG(seed) {
  return new SeededRNG(seed);
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function squaredDistance(first, second) {
  const dx = first.x - second.x;
  const dy = first.y - second.y;
  return dx * dx + dy * dy;
}

function manhattanDistance(first, second) {
  return Math.abs(first.x - second.x) + Math.abs(first.y - second.y);
}

function makeOdd(value) {
  const integer = Math.max(3, Math.round(value));
  return integer % 2 === 0 ? integer + 1 : integer;
}

function makeGrid(width, height, fillValue = TILE_TYPES.WALL) {
  return Array.from({ length: height }, () => Array(width).fill(fillValue));
}

function roomCenter(room) {
  return {
    x: Math.floor(room.x + room.width / 2),
    y: Math.floor(room.y + room.height / 2),
  };
}

function roomsOverlap(first, second, padding) {
  return !(
    first.x + first.width + padding <= second.x ||
    second.x + second.width + padding <= first.x ||
    first.y + first.height + padding <= second.y ||
    second.y + second.height + padding <= first.y
  );
}

function carveCell(tiles, x, y) {
  if (y > 0 && y < tiles.length - 1 && x > 0 && x < tiles[0].length - 1) {
    tiles[y][x] = TILE_TYPES.FLOOR;
  }
}

function carveBrush(tiles, x, y, radius) {
  for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
    for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
      if (offsetX * offsetX + offsetY * offsetY <= radius * radius + 0.25) {
        carveCell(tiles, x + offsetX, y + offsetY);
      }
    }
  }
}

function carveRoom(tiles, room, rng) {
  const center = roomCenter(room);
  const halfWidth = Math.max(1, (room.width - 1) / 2);
  const halfHeight = Math.max(1, (room.height - 1) / 2);

  for (let y = room.y; y < room.y + room.height; y += 1) {
    for (let x = room.x; x < room.x + room.width; x += 1) {
      const normalizedX = Math.abs(x - center.x) / halfWidth;
      const normalizedY = Math.abs(y - center.y) / halfHeight;
      const roundedDistance = normalizedX ** 4 + normalizedY ** 4;
      const edgeJitter = rng.range(-0.09, 0.12);
      if (roundedDistance <= 1.13 + edgeJitter) carveCell(tiles, x, y);
    }
  }

  carveCell(tiles, center.x, center.y);
}

function carveLine(tiles, from, to, radius) {
  let x = from.x;
  let y = from.y;
  carveBrush(tiles, x, y, radius);

  while (x !== to.x) {
    x += Math.sign(to.x - x);
    carveBrush(tiles, x, y, radius);
  }
  while (y !== to.y) {
    y += Math.sign(to.y - y);
    carveBrush(tiles, x, y, radius);
  }
}

function carveCorridor(tiles, from, to, rng, radius) {
  if (rng.chance(0.5)) {
    const bend = { x: to.x, y: from.y };
    carveLine(tiles, from, bend, radius);
    carveLine(tiles, bend, to, radius);
  } else {
    const bend = { x: from.x, y: to.y };
    carveLine(tiles, from, bend, radius);
    carveLine(tiles, bend, to, radius);
  }
}

function createRooms(width, height, mapConfig, roomTarget, rng) {
  const rooms = [];
  const startWidth = makeOdd(rng.int(mapConfig.roomMinSize + 2, mapConfig.roomMaxSize));
  const startHeight = makeOdd(rng.int(mapConfig.roomMinSize + 2, mapConfig.roomMaxSize));
  rooms.push({
    id: 0,
    x: Math.floor((width - startWidth) / 2),
    y: Math.floor((height - startHeight) / 2),
    width: startWidth,
    height: startHeight,
  });

  const maximumAttempts = roomTarget * 140;
  for (let attempt = 0; attempt < maximumAttempts && rooms.length < roomTarget; attempt += 1) {
    const relaxed = attempt > maximumAttempts * 0.72;
    const maximumSize = relaxed
      ? Math.max(mapConfig.roomMinSize, mapConfig.roomMaxSize - 2)
      : mapConfig.roomMaxSize;
    const roomWidth = makeOdd(rng.int(mapConfig.roomMinSize, maximumSize));
    const roomHeight = makeOdd(rng.int(mapConfig.roomMinSize, maximumSize));
    const candidate = {
      id: rooms.length,
      x: rng.int(2, Math.max(2, width - roomWidth - 3)),
      y: rng.int(2, Math.max(2, height - roomHeight - 3)),
      width: roomWidth,
      height: roomHeight,
    };
    const padding = relaxed ? 1 : 2;

    if (!rooms.some((room) => roomsOverlap(candidate, room, padding))) {
      rooms.push(candidate);
    }
  }

  return rooms;
}

function edgeKey(firstIndex, secondIndex) {
  return firstIndex < secondIndex
    ? `${firstIndex}:${secondIndex}`
    : `${secondIndex}:${firstIndex}`;
}

function connectRooms(tiles, rooms, mapConfig, rng) {
  const connectedEdges = new Set();

  // Each room joins an earlier room, so this pass is a spanning tree by construction.
  for (let roomIndex = 1; roomIndex < rooms.length; roomIndex += 1) {
    const currentCenter = roomCenter(rooms[roomIndex]);
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (let candidateIndex = 0; candidateIndex < roomIndex; candidateIndex += 1) {
      const distance = squaredDistance(currentCenter, roomCenter(rooms[candidateIndex]));
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = candidateIndex;
      }
    }

    carveCorridor(
      tiles,
      currentCenter,
      roomCenter(rooms[nearestIndex]),
      rng,
      mapConfig.corridorRadius,
    );
    connectedEdges.add(edgeKey(roomIndex, nearestIndex));
  }

  // Add nearby non-tree links to form navigable loops and alternate routes.
  const loopCandidates = [];
  for (let firstIndex = 0; firstIndex < rooms.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < rooms.length; secondIndex += 1) {
      if (connectedEdges.has(edgeKey(firstIndex, secondIndex))) continue;
      const distance = squaredDistance(roomCenter(rooms[firstIndex]), roomCenter(rooms[secondIndex]));
      loopCandidates.push({
        firstIndex,
        secondIndex,
        score: distance * rng.range(0.72, 1.28),
      });
    }
  }
  loopCandidates.sort((first, second) => first.score - second.score);

  const loopCount = Math.min(
    loopCandidates.length,
    Math.max(1, Math.round(rooms.length * mapConfig.loopRatio)),
  );
  for (let index = 0; index < loopCount; index += 1) {
    const link = loopCandidates[index];
    carveCorridor(
      tiles,
      roomCenter(rooms[link.firstIndex]),
      roomCenter(rooms[link.secondIndex]),
      rng,
      mapConfig.corridorRadius,
    );
  }
}

function growCaveEdges(tiles, passes, rng) {
  for (let pass = 0; pass < passes; pass += 1) {
    const additions = [];
    for (let y = 2; y < tiles.length - 2; y += 1) {
      for (let x = 2; x < tiles[0].length - 2; x += 1) {
        if (tiles[y][x] !== TILE_TYPES.FLOOR || !rng.chance(0.055)) continue;
        const direction = rng.pick(CARDINAL_DIRECTIONS);
        const nextX = x + direction.x;
        const nextY = y + direction.y;
        if (tiles[nextY][nextX] === TILE_TYPES.WALL) additions.push({ x: nextX, y: nextY });
      }
    }
    for (const cell of additions) carveCell(tiles, cell.x, cell.y);
  }
}

function getDistances(tiles, origin) {
  const height = tiles.length;
  const width = tiles[0].length;
  const distances = Array.from({ length: height }, () => new Int32Array(width).fill(-1));
  const queueX = new Int32Array(width * height);
  const queueY = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  if (tiles[origin.y]?.[origin.x] !== TILE_TYPES.FLOOR) return distances;
  distances[origin.y][origin.x] = 0;
  queueX[tail] = origin.x;
  queueY[tail] = origin.y;
  tail += 1;

  while (head < tail) {
    const x = queueX[head];
    const y = queueY[head];
    head += 1;

    for (const direction of CARDINAL_DIRECTIONS) {
      const nextX = x + direction.x;
      const nextY = y + direction.y;
      if (
        nextY < 0 ||
        nextY >= height ||
        nextX < 0 ||
        nextX >= width ||
        tiles[nextY][nextX] !== TILE_TYPES.FLOOR ||
        distances[nextY][nextX] >= 0
      ) {
        continue;
      }

      distances[nextY][nextX] = distances[y][x] + 1;
      queueX[tail] = nextX;
      queueY[tail] = nextY;
      tail += 1;
    }
  }

  return distances;
}

function listFloorCells(tiles) {
  const cells = [];
  for (let y = 0; y < tiles.length; y += 1) {
    for (let x = 0; x < tiles[0].length; x += 1) {
      if (tiles[y][x] === TILE_TYPES.FLOOR) cells.push({ x, y });
    }
  }
  return cells;
}

function repairConnectivity(tiles, spawn, rng, corridorRadius) {
  // Connectivity is already guaranteed by room linking; this defensive pass keeps
  // future room-carving changes from silently introducing isolated floor islands.
  for (let repair = 0; repair < 12; repair += 1) {
    const distances = getDistances(tiles, spawn);
    const isolated = listFloorCells(tiles).find((cell) => distances[cell.y][cell.x] < 0);
    if (!isolated) return;
    carveCorridor(tiles, isolated, spawn, rng, corridorRadius);
  }

  throw new Error("Unable to connect every generated cave region.");
}

function findRoomContaining(rooms, cell) {
  return rooms.findIndex(
    (room) =>
      cell.x >= room.x &&
      cell.x < room.x + room.width &&
      cell.y >= room.y &&
      cell.y < room.y + room.height,
  );
}

function chooseDoor(tiles, rooms, spawn) {
  const distances = getDistances(tiles, spawn);
  let bestCell = null;
  let bestDistance = -1;

  // Prefer a distant room center so activation occurs in a readable open space.
  for (let roomIndex = 1; roomIndex < rooms.length; roomIndex += 1) {
    const center = roomCenter(rooms[roomIndex]);
    const distance = distances[center.y]?.[center.x] ?? -1;
    if (distance > bestDistance) {
      bestCell = center;
      bestDistance = distance;
    }
  }

  if (!bestCell) {
    for (const cell of listFloorCells(tiles)) {
      const distance = distances[cell.y][cell.x];
      if (distance > bestDistance) {
        bestCell = cell;
        bestDistance = distance;
      }
    }
  }

  if (!bestCell) throw new Error("Generated cave contains no valid exit tile.");
  return bestCell;
}

function countAdjacentWalls(tiles, cell, radius = 1) {
  let walls = 0;
  for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
    for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
      if (offsetX === 0 && offsetY === 0) continue;
      if (tiles[cell.y + offsetY]?.[cell.x + offsetX] !== TILE_TYPES.FLOOR) walls += 1;
    }
  }
  return walls;
}

function isReserved(cell, spawn, door, minimumDistance) {
  const minimumSquared = minimumDistance * minimumDistance;
  return squaredDistance(cell, spawn) < minimumSquared || squaredDistance(cell, door) < minimumSquared;
}

function makeDecorations(tiles, floorCells, spawn, door, levelConfig, rng) {
  const candidates = rng.shuffle(
    floorCells.filter((cell) => !isReserved(cell, spawn, door, 4)),
  );
  const target = Math.min(520, Math.round(floorCells.length * levelConfig.decorationDensity));
  const result = [];

  for (const cell of candidates) {
    if (result.length >= target) break;
    const adjacentWalls = countAdjacentWalls(tiles, cell);
    const nearWall = adjacentWalls >= 2;
    if (!nearWall && !rng.chance(0.28)) continue;

    let type;
    if (nearWall) {
      type = rng.chance(0.58) ? "crystal-cluster" : rng.chance(0.55) ? "glow-moss" : "stalagmite";
    } else {
      type = rng.chance(0.62) ? "floor-crystals" : "rubble";
    }

    result.push({
      x: cell.x,
      y: cell.y,
      type,
      color: rng.pick(levelConfig.palette),
      variant: rng.int(0, 3),
      scale: Number(rng.range(0.72, 1.28).toFixed(3)),
      glow: type.includes("crystal") || type === "glow-moss"
        ? Number(rng.range(0.35, 0.9).toFixed(3))
        : 0,
    });
  }

  return result;
}

function makePickupCandidates(tiles, floorCells, spawn, door, rng) {
  const pool = rng.shuffle(
    floorCells.filter(
      (cell) =>
        !isReserved(cell, spawn, door, 5) &&
        countAdjacentWalls(tiles, cell) <= 6,
    ),
  );
  const target = clamp(Math.round(floorCells.length / 18), 36, 240);
  const accepted = [];
  const minimumSeparationSquared = 9;

  for (const cell of pool) {
    if (accepted.length >= target) break;
    if (accepted.every((other) => squaredDistance(cell, other) >= minimumSeparationSquared)) {
      accepted.push({ x: cell.x, y: cell.y });
    }
  }

  return accepted;
}

function chooseCellInsideRoom(tiles, room, rng) {
  const center = roomCenter(room);
  const candidates = [];
  for (let y = room.y; y < room.y + room.height; y += 1) {
    for (let x = room.x; x < room.x + room.width; x += 1) {
      if (tiles[y]?.[x] === TILE_TYPES.FLOOR) candidates.push({ x, y });
    }
  }

  if (!candidates.length) return center;
  const outerCandidates = candidates.filter(
    (cell) => manhattanDistance(cell, center) >= Math.max(2, Math.floor(Math.min(room.width, room.height) / 4)),
  );
  return rng.pick(outerCandidates.length ? outerCandidates : candidates);
}

function makeEnemyTerritories(tiles, rooms, spawn, door, difficultyConfig, rng) {
  const doorRoomIndex = findRoomContaining(rooms, door);
  const eligibleRooms = rng.shuffle(
    rooms.filter((room) => {
      const center = roomCenter(room);
      return room.id !== 0 && room.id !== doorRoomIndex && !isReserved(center, spawn, door, 9);
    }),
  );
  const target = clamp(
    Math.round(rooms.length * 0.62 * difficultyConfig.enemyDensityMultiplier),
    5,
    Math.max(5, rooms.length - 2),
  );
  const result = [];

  for (const room of eligibleRooms) {
    if (result.length >= target) break;
    const anchor = chooseCellInsideRoom(tiles, room, rng);
    const area = room.width * room.height;
    const depthWeight = clamp(Math.sqrt(squaredDistance(anchor, spawn)) / 30, 0.6, 1.7);
    result.push({
      x: anchor.x,
      y: anchor.y,
      radiusTiles: clamp(Math.round(Math.sqrt(area) * 0.9), 5, 11),
      weight: Number((depthWeight * rng.range(0.8, 1.2)).toFixed(3)),
      roomId: room.id,
      preferredEnemyTypes: area >= 85
        ? ["basic", "brute", "crawler"]
        : ["basic", "crawler"],
    });
  }

  // Extremely constrained custom maps can have too few rooms; distant floor cells
  // still provide safe territory anchors without weakening the normal room logic.
  if (result.length < Math.min(5, target)) {
    const fallbackCells = rng.shuffle(listFloorCells(tiles)).filter(
      (cell) => !isReserved(cell, spawn, door, 11),
    );
    for (const cell of fallbackCells) {
      if (result.length >= Math.min(5, target)) break;
      if (result.every((territory) => squaredDistance(cell, territory) >= 100)) {
        result.push({
          x: cell.x,
          y: cell.y,
          radiusTiles: 6,
          weight: 0.7,
          roomId: null,
          preferredEnemyTypes: ["basic", "crawler"],
        });
      }
    }
  }

  return result;
}

function toWorldPoint(cell, extra = {}) {
  return {
    x: cell.x,
    y: cell.y,
    worldX: (cell.x + 0.5) * TILE_SIZE,
    worldY: (cell.y + 0.5) * TILE_SIZE,
    ...extra,
  };
}

function doorFacing(door, spawn) {
  const horizontal = Math.abs(door.x - spawn.x) > Math.abs(door.y - spawn.y);
  if (horizontal) return door.x > spawn.x ? "left" : "right";
  return door.y > spawn.y ? "up" : "down";
}

function resolveLevel(level) {
  if (LEVEL_CONFIG[level]) return LEVEL_CONFIG[level];
  const normalized = String(level).trim().toLowerCase();
  const profile = Object.values(LEVEL_CONFIG).find(
    (candidate) => candidate.key === normalized || candidate.name.toLowerCase() === normalized,
  );
  if (!profile) throw new RangeError(`Unknown level profile: ${String(level)}`);
  return profile;
}

function resolveDifficulty(difficulty) {
  const normalized = String(difficulty).trim().toLowerCase();
  const profile = DIFFICULTY_CONFIG[normalized];
  if (!profile) throw new RangeError(`Unknown difficulty profile: ${String(difficulty)}`);
  return profile;
}

/**
 * Verify the two invariants relied upon by gameplay: a solid outer border and a
 * single connected floor component containing both spawn and door.
 *
 * @param {Pick<MazeResult, "tiles"|"width"|"height"|"spawn"|"door"|"floorCells">} maze
 * @returns {{valid: boolean, connectedFloorCount: number, errors: string[]}}
 */
export function validateMaze(maze) {
  const errors = [];
  const { tiles, width, height, spawn, door, floorCells } = maze;
  if (!Array.isArray(tiles) || tiles.length !== height) errors.push("Tile-grid height mismatch.");
  if (Array.isArray(tiles) && tiles.some((row) => !Array.isArray(row) || row.length !== width)) {
    errors.push("Tile-grid width mismatch.");
  }
  if (errors.length) return { valid: false, connectedFloorCount: 0, errors };

  for (let x = 0; x < width; x += 1) {
    if (tiles[0][x] !== TILE_TYPES.WALL || tiles[height - 1][x] !== TILE_TYPES.WALL) {
      errors.push("Map border must remain solid.");
      break;
    }
  }
  for (let y = 0; y < height; y += 1) {
    if (tiles[y][0] !== TILE_TYPES.WALL || tiles[y][width - 1] !== TILE_TYPES.WALL) {
      errors.push("Map border must remain solid.");
      break;
    }
  }

  if (tiles[spawn.y]?.[spawn.x] !== TILE_TYPES.FLOOR) errors.push("Spawn is not on a floor tile.");
  if (tiles[door.y]?.[door.x] !== TILE_TYPES.FLOOR) errors.push("Door is not on a floor tile.");
  const distances = getDistances(tiles, spawn);
  const connectedFloorCount = floorCells.reduce(
    (count, cell) => count + (distances[cell.y]?.[cell.x] >= 0 ? 1 : 0),
    0,
  );
  if (connectedFloorCount !== floorCells.length) errors.push("Floor tiles are not fully connected.");
  if (distances[door.y]?.[door.x] < 0) errors.push("Door cannot be reached from spawn.");

  return { valid: errors.length === 0, connectedFloorCount, errors };
}

/**
 * Generate a deterministic, fully connected room/corridor cave network.
 *
 * Connectivity is guaranteed by connecting every room into a spanning tree before
 * adding loop corridors. Edge growth only adds floor adjacent to existing floor.
 * Level and difficulty profiles jointly determine dimensions and room count.
 *
 * @param {object} [options]
 * @param {number|string} [options.level=1] Numeric id, key, or display name.
 * @param {string} [options.difficulty="normal"] Difficulty id.
 * @param {string|number} [options.seed=Date.now()] Deterministic generation seed.
 * @returns {MazeResult}
 */
export function generateMaze({
  level = 1,
  difficulty = "normal",
  seed = Date.now(),
} = {}) {
  const levelConfig = resolveLevel(level);
  const difficultyConfig = resolveDifficulty(difficulty);
  const rng = new SeededRNG(seed);
  const minimumWidth = VIEWPORT.visibleColumns * 2 + 1;
  const minimumHeight = VIEWPORT.visibleRows * 2 + 5;
  const width = makeOdd(Math.max(minimumWidth, levelConfig.map.width * difficultyConfig.mapSizeMultiplier));
  const height = makeOdd(Math.max(minimumHeight, levelConfig.map.height * difficultyConfig.mapSizeMultiplier));
  const areaScale = (width * height) / (levelConfig.map.width * levelConfig.map.height);
  const roomTarget = Math.max(12, Math.round(levelConfig.map.roomCount * areaScale));
  const tiles = makeGrid(width, height);
  const rooms = createRooms(width, height, levelConfig.map, roomTarget, rng);

  for (const room of rooms) carveRoom(tiles, room, rng);
  connectRooms(tiles, rooms, levelConfig.map, rng);
  growCaveEdges(tiles, levelConfig.map.edgeGrowthPasses, rng);

  const spawnCell = roomCenter(rooms[0]);
  repairConnectivity(tiles, spawnCell, rng, levelConfig.map.corridorRadius);
  const doorCell = chooseDoor(tiles, rooms, spawnCell);
  const floorCells = listFloorCells(tiles);
  const spawn = toWorldPoint(spawnCell);
  const door = toWorldPoint(doorCell, { facing: doorFacing(doorCell, spawnCell) });
  const decorations = makeDecorations(
    tiles,
    floorCells,
    spawnCell,
    doorCell,
    levelConfig,
    rng.fork("decorations"),
  );
  const pickupSpawnCandidates = makePickupCandidates(
    tiles,
    floorCells,
    spawnCell,
    doorCell,
    rng.fork("pickups"),
  );
  const enemyTerritoryCandidates = makeEnemyTerritories(
    tiles,
    rooms,
    spawnCell,
    doorCell,
    difficultyConfig,
    rng.fork("territories"),
  );

  const result = {
    tiles,
    width,
    height,
    pixelWidth: width * TILE_SIZE,
    pixelHeight: height * TILE_SIZE,
    spawn,
    door,
    floorCells,
    decorations,
    pickupSpawnCandidates,
    enemyTerritoryCandidates,
    rooms: rooms.map((room) => ({ ...room, center: roomCenter(room) })),
    seed,
    levelId: levelConfig.id,
    difficultyId: difficultyConfig.id,
  };

  const validation = validateMaze(result);
  if (!validation.valid) {
    throw new Error(`Invalid generated cave: ${validation.errors.join(" ")}`);
  }

  return result;
}

/** Descriptive alias for callers that do not use maze terminology. */
export const generateCaveNetwork = generateMaze;

export default generateMaze;
