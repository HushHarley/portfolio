import { TILE_SIZE } from "./config.js";
import { distanceSquared, shortestAngle, TAU } from "./utils.js";

export const ENEMY_COORDINATION = Object.freeze({
  linkDistance: TILE_SIZE * 8,
  duoHoldDistanceTiles: 3,
  duoReserveSpeedMultiplier: 0.64,
  packFlankDistanceTiles: 2,
  packFlankSpeedMultiplier: 0.9,
});

function enemyId(enemy) {
  return String(enemy.id ?? "");
}

function compareEnemyIds(left, right) {
  return enemyId(left).localeCompare(enemyId(right));
}

function chooseClosestToPlayer(enemies, player) {
  return [...enemies].sort((left, right) =>
    distanceSquared(left, player) - distanceSquared(right, player) || compareEnemyIds(left, right)
  )[0];
}

function makeChaseGroups(enemies, linkDistance) {
  const candidates = enemies
    .filter((enemy) => !enemy.dead && enemy.state === "chase")
    .sort(compareEnemyIds);
  const remaining = new Set(candidates);
  const groups = [];
  const linkDistanceSquared = linkDistance ** 2;

  while (remaining.size > 0) {
    const first = remaining.values().next().value;
    remaining.delete(first);
    const group = [first];
    for (let cursor = 0; cursor < group.length; cursor += 1) {
      const member = group[cursor];
      for (const candidate of [...remaining]) {
        if (distanceSquared(member, candidate) > linkDistanceSquared) continue;
        remaining.delete(candidate);
        group.push(candidate);
      }
    }
    groups.push(group.sort(compareEnemyIds));
  }

  return groups;
}

function assignDuo(assignments, members, player, groupId) {
  const persistentStriker = members.find((enemy) =>
    enemy.coordinationGroupId === groupId && enemy.coordinationRole === "duo-striker"
  );
  const striker = persistentStriker || chooseClosestToPlayer(members, player);
  const reserve = members.find((enemy) => enemy !== striker);

  assignments.set(enemyId(striker), {
    mode: "duo",
    role: "duo-striker",
    groupId,
    groupSize: 2,
    partnerId: enemyId(reserve),
    slotAngle: null,
  });
  assignments.set(enemyId(reserve), {
    mode: "duo",
    role: "duo-reserve",
    groupId,
    groupSize: 2,
    partnerId: enemyId(striker),
    slotAngle: null,
  });
}

function assignPack(assignments, members, player, groupId) {
  const persistentPressure = members.find((enemy) =>
    enemy.coordinationGroupId === groupId && enemy.coordinationRole === "pack-pressure"
  );
  const pressure = persistentPressure || chooseClosestToPlayer(members, player);
  const pressureAngle = Math.atan2(pressure.y - player.y, pressure.x - player.x);
  const availableSlots = Array.from({ length: members.length - 1 }, (_, index) => ({
    index,
    angle: pressureAngle + TAU * (index + 1) / members.length,
  }));
  const flankers = members.filter((enemy) => enemy !== pressure);

  assignments.set(enemyId(pressure), {
    mode: "pack",
    role: "pack-pressure",
    groupId,
    groupSize: members.length,
    partnerId: null,
    slotAngle: pressureAngle,
  });

  while (flankers.length > 0) {
    let best = null;
    for (const enemy of flankers) {
      const currentAngle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
      for (const slot of availableSlots) {
        const score = Math.abs(shortestAngle(currentAngle, slot.angle));
        if (
          !best || score < best.score ||
          (score === best.score && compareEnemyIds(enemy, best.enemy) < 0) ||
          (score === best.score && enemy === best.enemy && slot.index < best.slot.index)
        ) {
          best = { enemy, slot, score };
        }
      }
    }

    assignments.set(enemyId(best.enemy), {
      mode: "pack",
      role: "pack-flanker",
      groupId,
      groupSize: members.length,
      partnerId: null,
      slotAngle: best.slot.angle,
    });
    flankers.splice(flankers.indexOf(best.enemy), 1);
    availableSlots.splice(availableSlots.indexOf(best.slot), 1);
  }
}

/** Assign persistent combat roles to nearby enemies that are already chasing. */
export function planEnemyCoordination(enemies, player, linkDistance = ENEMY_COORDINATION.linkDistance) {
  const assignments = new Map();
  for (const members of makeChaseGroups(enemies, linkDistance)) {
    if (members.length < 2) continue;
    const groupId = members.map(enemyId).join("|");
    if (members.length === 2) assignDuo(assignments, members, player, groupId);
    else assignPack(assignments, members, player, groupId);
  }
  return assignments;
}

export function canEnemyContactAttack(enemy) {
  return enemy.coordinationMode !== "duo" || enemy.coordinationRole === "duo-striker";
}

