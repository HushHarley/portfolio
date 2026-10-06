import { cellKey } from "./utils.js";

const CARDINALS = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

/**
 * Breadth-first pathfinding for the modest cave grids used by the game. The
 * returned path excludes the starting cell and includes the destination.
 */
export function findPath(start, goal, isWalkable, maxVisited = 9000) {
  const startX = Math.floor(start.x);
  const startY = Math.floor(start.y);
  const goalX = Math.floor(goal.x);
  const goalY = Math.floor(goal.y);
  if (startX === goalX && startY === goalY) return [];
  if (!isWalkable(goalX, goalY)) return [];

  const queue = [{ x: startX, y: startY }];
  const cameFrom = new Map([[cellKey(startX, startY), null]]);
  let cursor = 0;

  while (cursor < queue.length && cursor < maxVisited) {
    const current = queue[cursor++];
    for (const offset of CARDINALS) {
      const next = { x: current.x + offset.x, y: current.y + offset.y };
      const key = cellKey(next.x, next.y);
      if (cameFrom.has(key) || !isWalkable(next.x, next.y)) continue;
      cameFrom.set(key, current);
      if (next.x === goalX && next.y === goalY) {
        return reconstructPath(cameFrom, next, startX, startY);
      }
      queue.push(next);
    }
  }
  return [];
}

function reconstructPath(cameFrom, end, startX, startY) {
  const path = [];
  let current = end;
  while (current && (current.x !== startX || current.y !== startY)) {
    path.push(current);
    current = cameFrom.get(cellKey(current.x, current.y));
  }
  path.reverse();
  return path;
}

/**
 * Supercover grid raycast. Exact corner crossings inspect both orthogonal side
 * cells, preventing vision from leaking diagonally between two touching walls.
 */
export function hasLineOfSight(from, to, isWalkable) {
  let x0 = Math.floor(from.x);
  let y0 = Math.floor(from.y);
  const x1 = Math.floor(to.x);
  const y1 = Math.floor(to.y);
  if (!isWalkable(x0, y0) || !isWalkable(x1, y1)) return false;

  const deltaX = x1 - x0;
  const deltaY = y1 - y0;
  const stepX = Math.sign(deltaX);
  const stepY = Math.sign(deltaY);
  const tDeltaX = deltaX === 0 ? Infinity : 1 / Math.abs(deltaX);
  const tDeltaY = deltaY === 0 ? Infinity : 1 / Math.abs(deltaY);
  let tMaxX = deltaX === 0 ? Infinity : tDeltaX * 0.5;
  let tMaxY = deltaY === 0 ? Infinity : tDeltaY * 0.5;

  while (x0 !== x1 || y0 !== y1) {
    if (Math.abs(tMaxX - tMaxY) < 1e-10) {
      // The sight line crosses a grid corner. Both cells beside that corner
      // must be open or the corner acts as an opaque seam.
      if (!isWalkable(x0 + stepX, y0) || !isWalkable(x0, y0 + stepY)) return false;
      x0 += stepX;
      y0 += stepY;
      tMaxX += tDeltaX;
      tMaxY += tDeltaY;
    } else if (tMaxX < tMaxY) {
      x0 += stepX;
      tMaxX += tDeltaX;
    } else {
      y0 += stepY;
      tMaxY += tDeltaY;
    }
    if (!isWalkable(x0, y0)) return false;
  }
  return true;
}

export function floodDistances(start, isWalkable, maxVisited = 12000) {
  const queue = [{ x: Math.floor(start.x), y: Math.floor(start.y) }];
  const distances = new Map([[cellKey(queue[0].x, queue[0].y), 0]]);
  let cursor = 0;
  while (cursor < queue.length && cursor < maxVisited) {
    const current = queue[cursor++];
    const currentDistance = distances.get(cellKey(current.x, current.y));
    for (const offset of CARDINALS) {
      const nextX = current.x + offset.x;
      const nextY = current.y + offset.y;
      const key = cellKey(nextX, nextY);
      if (distances.has(key) || !isWalkable(nextX, nextY)) continue;
      distances.set(key, currentDistance + 1);
      queue.push({ x: nextX, y: nextY });
    }
  }
  return distances;
}
