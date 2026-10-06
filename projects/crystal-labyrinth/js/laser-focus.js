/**
 * Data-driven crystal-laser loadouts.
 *
 * Gameplay code treats every focus through this shared shape. Adding a future
 * Rapid or Wide Focus should only require another definition and its artwork;
 * charge, projectile, selection, carry, and HUD systems remain unchanged.
 */

const defineFocus = (definition) => Object.freeze({
  alwaysAvailable: false,
  discoverable: true,
  description: "",
  icon: "◆",
  color: "#53e8ff",
  coreColor: "#e8ffff",
  ...definition,
});

export const DEFAULT_LASER_FOCUS_ID = "standard";

export const LASER_FOCUS_TYPES = Object.freeze({
  standard: defineFocus({
    id: "standard",
    name: "Standard Focus",
    shortName: "Standard",
    damage: 1,
    shardCost: 1,
    chargeTime: 0,
    fireCooldown: 0.24,
    range: 360,
    beamWidth: 4,
    projectileSpeed: 760,
    alwaysAvailable: true,
    discoverable: false,
    description: "Fast, reliable, and flexible. One shard deals one damage.",
    icon: "✦",
    color: "#43eaff",
    coreColor: "#e8ffff",
  }),
  heavy: defineFocus({
    id: "heavy",
    name: "Heavy Focus",
    shortName: "Heavy",
    damage: 2,
    shardCost: 1,
    chargeTime: 0.85,
    fireCooldown: 0.68,
    range: 390,
    beamWidth: 8,
    projectileSpeed: 640,
    description: "Hold Space to charge, then release one shard as a two-damage blast.",
    icon: "⬢",
    color: "#b95cff",
    coreColor: "#fff2ff",
  }),
});

export function getLaserFocus(focusId) {
  return LASER_FOCUS_TYPES[focusId] || LASER_FOCUS_TYPES[DEFAULT_LASER_FOCUS_ID];
}

export function isKnownLaserFocus(focusId) {
  return Boolean(LASER_FOCUS_TYPES[focusId]);
}

export function isSpecialLaserFocus(focusId) {
  const focus = LASER_FOCUS_TYPES[focusId];
  return Boolean(focus && !focus.alwaysAvailable);
}

export function getDiscoverableLaserFocuses() {
  return Object.values(LASER_FOCUS_TYPES).filter((focus) => focus.discoverable);
}

/**
 * Standard is always first (Tab+1). Discovered focuses retain discovery order,
 * so the first special is Tab+2, the next is Tab+3, and so on. Only one is
 * equipped even though the attuned library can contain up to six variations.
 */
export function normalizeLaserFocusIds(focusIds = []) {
  const normalized = [DEFAULT_LASER_FOCUS_ID];
  for (const focusId of focusIds) {
    if (normalized.length >= 6) break;
    if (isSpecialLaserFocus(focusId) && !normalized.includes(focusId)) normalized.push(focusId);
  }
  return normalized;
}

export function normalizeEquippedLaserFocus(focusId, focusIds) {
  const normalizedIds = normalizeLaserFocusIds(focusIds);
  return normalizedIds.includes(focusId) ? focusId : DEFAULT_LASER_FOCUS_ID;
}

export default LASER_FOCUS_TYPES;
