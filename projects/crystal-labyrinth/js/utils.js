export const TAU = Math.PI * 2;

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const lerp = (from, to, amount) => from + (to - from) * amount;
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const distanceSquared = (a, b) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
};

export function normalize(x, y) {
  const length = Math.hypot(x, y);
  return length > 0.0001 ? { x: x / length, y: y / length, length } : { x: 0, y: 0, length: 0 };
}

export function shortestAngle(from, to) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

export function rotateTowards(from, to, maxStep) {
  const delta = shortestAngle(from, to);
  return from + clamp(delta, -maxStep, maxStep);
}

const STRING_SEED_CACHE = new Map();

function numericSeed(seed) {
  if (typeof seed === "number" && Number.isFinite(seed)) return seed | 0;
  const textSeed = String(seed);
  if (STRING_SEED_CACHE.has(textSeed)) return STRING_SEED_CACHE.get(textSeed);
  let hash = 0x811c9dc5;
  for (let index = 0; index < textSeed.length; index += 1) {
    hash ^= textSeed.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  const result = hash >>> 0;
  STRING_SEED_CACHE.set(textSeed, result);
  return result;
}

export function hash2D(x, y, seed = 0) {
  let value = Math.imul(x + 0x7ed55d16, 0x85ebca6b) ^ Math.imul(y + 0x165667b1, 0xc2b2ae35) ^ numericSeed(seed);
  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d);
  value ^= value >>> 15;
  return (value >>> 0) / 4294967296;
}

export const cellKey = (x, y) => `${x},${y}`;

export function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  return `${minutes}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

export function shuffledCopy(values, random = Math.random) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

export function weightedChoice(entries, random = Math.random) {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = random() * total;
  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) return entry.value;
  }
  return entries.at(-1)?.value;
}
