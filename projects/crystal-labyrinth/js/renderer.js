import {
  COLORS,
  DIFFICULTY_CONFIG,
  LEVEL_CONFIG,
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
  RULES,
  TILE_SIZE,
  TILE_TYPES,
} from "./config.js";
import { getLaserFocus } from "./laser-focus.js";
import { clamp, hash2D, shortestAngle, TAU } from "./utils.js";

const FLOOR_VARIANTS = ["#10142f", "#121733", "#141936", "#0f132b"];
const CRYSTAL_COLORS = [COLORS.cyan, COLORS.blue, COLORS.violet, COLORS.pink];
const NAMED_CRYSTAL_COLORS = {
  cyan: COLORS.cyan,
  blue: COLORS.blue,
  violet: COLORS.violet,
  pink: COLORS.pink,
};

const GAMEPLAY_ATLAS_URL = "assets/gameplay-atlas-v3.png";
const PICKUP_ATLAS_URL = "assets/pickup-atlas-v1.png";
const GATE_ATLAS_URL = "assets/gameplay-atlas-v4-empty-gates.png";
const PLAYER_WALK_ATLAS_URL = "assets/player-walk-atlas-v1.png";
const DOOR_CHARGE_STEPS = 10;
const DOOR_BEACON_INSET = 26;
const DOOR_BEACON_VISIBILITY_PADDING = 80;
const PLAYER_WALK_FPS = 8;
const PLAYER_WALK_SEQUENCE = Object.freeze([0, 1, 2, 1]);
const ATLAS_SPRITES = Object.freeze({
  floor: { x: 54, y: 62, width: 235, height: 227 },
  wallFront: { x: 365, y: 48, width: 230, height: 247 },
  wallSide: { x: 703, y: 54, width: 180, height: 242 },
  voidRocks: { x: 970, y: 62, width: 230, height: 235 },
  crystalCyan: { x: 54, y: 354, width: 216, height: 232 },
  crystalMagenta: { x: 362, y: 368, width: 210, height: 219 },
  crystalAmber: { x: 675, y: 360, width: 211, height: 227 },
  flora: { x: 990, y: 390, width: 202, height: 187 },
  player: { x: 92, y: 658, width: 144, height: 194 },
  stalker: { x: 378, y: 678, width: 192, height: 178 },
  crawler: { x: 654, y: 714, width: 202, height: 146 },
  brute: { x: 938, y: 624, width: 264, height: 240 },
  gateSealed: { x: 28, y: 904, width: 270, height: 286 },
  gateAwake: { x: 340, y: 904, width: 270, height: 286 },
  halfHeart: { x: 692, y: 994, width: 156, height: 148 },
  runePillar: { x: 964, y: 904, width: 196, height: 286 },
});

const PICKUP_SPRITES = Object.freeze({
  minedCyan: { x: 194, y: 82, width: 247, height: 478 },
  minedMagenta: { x: 808, y: 76, width: 250, height: 484 },
  minedAmber: { x: 128, y: 688, width: 352, height: 495 },
  minedBlueChunk: { x: 767, y: 759, width: 276, height: 364 },
});

const PLAYER_WALK_FRAMES = Object.freeze({
  down: Object.freeze([
    { x: 141, y: 41, width: 203, height: 271 },
    { x: 531, y: 42, width: 200, height: 272 },
    { x: 922, y: 42, width: 202, height: 271 },
  ]),
  left: Object.freeze([
    { x: 138, y: 360, width: 164, height: 254 },
    { x: 526, y: 361, width: 164, height: 254 },
    { x: 922, y: 360, width: 168, height: 255 },
  ]),
  right: Object.freeze([
    { x: 147, y: 666, width: 171, height: 253 },
    { x: 544, y: 669, width: 167, height: 251 },
    { x: 937, y: 668, width: 167, height: 252 },
  ]),
  up: Object.freeze([
    { x: 113, y: 976, width: 192, height: 263 },
    { x: 508, y: 982, width: 189, height: 261 },
    { x: 898, y: 979, width: 191, height: 253 },
  ]),
});

const PLAYER_WALK_ROWS = Object.freeze({ down: 0, left: 1, right: 2, up: 3 });

// The atlas corner opens down and right; each subsequent entry rotates it clockwise.
const WALL_CORNER_PATTERNS = Object.freeze([
  { vertical: "below", horizontal: "right", quarterTurns: 0 },
  { vertical: "below", horizontal: "left", quarterTurns: 1 },
  { vertical: "above", horizontal: "left", quarterTurns: 2 },
  { vertical: "above", horizontal: "right", quarterTurns: 3 },
]);

// The atlas straight faces downward before rotation.
const WALL_STRAIGHT_TURNS = Object.freeze({
  below: 0,
  left: 1,
  above: 2,
  right: 3,
});

function worldTileAt(world, x, y) {
  if (x < 0 || y < 0 || x >= world.width || y >= world.height) return TILE_TYPES.WALL;
  return world.tiles[y][x];
}

/** Map surrounding floor tiles to the correctly oriented wall atlas artwork. */
export function getWallTileStyle(world, tileX, tileY) {
  const floor = {
    below: worldTileAt(world, tileX, tileY + 1) === TILE_TYPES.FLOOR,
    left: worldTileAt(world, tileX - 1, tileY) === TILE_TYPES.FLOOR,
    above: worldTileAt(world, tileX, tileY - 1) === TILE_TYPES.FLOOR,
    right: worldTileAt(world, tileX + 1, tileY) === TILE_TYPES.FLOOR,
  };
  const cardinalCount = Object.values(floor).filter(Boolean).length;

  if (cardinalCount > 0) {
    const corner = WALL_CORNER_PATTERNS.find(({ vertical, horizontal }) => floor[vertical] && floor[horizontal]);
    if (corner) {
      return {
        edge: true,
        kind: "corner",
        spriteId: "wallSide",
        quarterTurns: corner.quarterTurns,
        floor,
      };
    }

    const opening = Object.keys(WALL_STRAIGHT_TURNS).find((direction) => floor[direction]);
    return {
      edge: true,
      kind: "straight",
      spriteId: "wallFront",
      quarterTurns: WALL_STRAIGHT_TURNS[opening],
      floor,
    };
  }

  const diagonalCorners = [
    { x: 1, y: 1, quarterTurns: 0 },
    { x: -1, y: 1, quarterTurns: 1 },
    { x: -1, y: -1, quarterTurns: 2 },
    { x: 1, y: -1, quarterTurns: 3 },
  ];
  const diagonal = diagonalCorners.find(({ x, y }) =>
    worldTileAt(world, tileX + x, tileY + y) === TILE_TYPES.FLOOR
  );

  if (diagonal) {
    return {
      edge: true,
      kind: "inner-corner",
      spriteId: "wallSide",
      quarterTurns: diagonal.quarterTurns,
      floor,
    };
  }

  return { edge: false, kind: "void", spriteId: null, quarterTurns: 0, floor };
}

/** Flip wall lighting toward the floor without changing the mapped edge topology. */
export function getWallAtlasTransform(wallStyle) {
  if (!wallStyle?.edge) return { quarterTurns: 0, flipX: false };
  const turnOffset = wallStyle.kind === "straight" ? 2 : 3;
  return {
    quarterTurns: (wallStyle.quarterTurns + turnOffset) % 4,
    flipX: true,
  };
}

/** Place an off-screen target beacon where its ray from the player meets the viewport edge. */
export function getEdgeBeaconPosition(
  source,
  target,
  { width = LOGICAL_WIDTH, height = LOGICAL_HEIGHT, inset = DOOR_BEACON_INSET } = {},
) {
  const horizontalInset = clamp(inset, 0, width / 2);
  const verticalInset = clamp(inset, 0, height / 2);
  const minX = horizontalInset;
  const maxX = width - horizontalInset;
  const minY = verticalInset;
  const maxY = height - verticalInset;
  const originX = clamp(source.x, minX, maxX);
  const originY = clamp(source.y, minY, maxY);
  const deltaX = target.x - originX;
  const deltaY = target.y - originY;

  if (Math.hypot(deltaX, deltaY) < 0.001) return null;

  const horizontalTime = deltaX > 0
    ? (maxX - originX) / deltaX
    : deltaX < 0
      ? (minX - originX) / deltaX
      : Infinity;
  const verticalTime = deltaY > 0
    ? (maxY - originY) / deltaY
    : deltaY < 0
      ? (minY - originY) / deltaY
      : Infinity;
  const edgeTime = Math.min(horizontalTime, verticalTime);

  return {
    x: clamp(originX + deltaX * edgeTime, minX, maxX),
    y: clamp(originY + deltaY * edgeTime, minY, maxY),
    angle: Math.atan2(deltaY, deltaX),
  };
}

const ENEMY_ATLAS_PROFILES = Object.freeze({
  basic: Object.freeze({
    spriteId: "stalker",
    targetWidth: 42,
    eyes: Object.freeze([
      { x: 24, y: 84, width: 16, height: 21 },
      { x: 60, y: 84, width: 21, height: 21 },
    ]),
  }),
  crawler: Object.freeze({
    spriteId: "crawler",
    targetWidth: 38,
    eyes: Object.freeze([
      { x: 42, y: 79, width: 18, height: 21 },
      { x: 76, y: 79, width: 22, height: 22 },
    ]),
  }),
  brute: Object.freeze({
    spriteId: "brute",
    targetWidth: 58,
    eyes: Object.freeze([
      { x: 38, y: 108, width: 18, height: 18 },
      { x: 72, y: 108, width: 22, height: 18 },
    ]),
  }),
});

const DOOR_SOCKET_OFFSETS = Object.freeze([
  { x: 0, y: -53, color: COLORS.violet },
  { x: -12, y: -46, color: COLORS.pink },
  { x: 12, y: -46, color: COLORS.pink },
  { x: -23, y: -38, color: COLORS.violet },
  { x: 23, y: -38, color: COLORS.violet },
  { x: -31, y: -27, color: COLORS.pink },
  { x: 31, y: -27, color: COLORS.pink },
  { x: -33, y: -12, color: COLORS.cyan },
  { x: 33, y: -12, color: COLORS.cyan },
]);

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.canvas.width = LOGICAL_WIDTH;
    this.canvas.height = LOGICAL_HEIGHT;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.ctx.imageSmoothingEnabled = false;

    this.lightCanvas = document.createElement("canvas");
    this.lightCanvas.width = LOGICAL_WIDTH;
    this.lightCanvas.height = LOGICAL_HEIGHT;
    this.lightCtx = this.lightCanvas.getContext("2d");
    this.lightCtx.imageSmoothingEnabled = false;

    this.glowCanvas = document.createElement("canvas");
    this.glowCanvas.width = LOGICAL_WIDTH;
    this.glowCanvas.height = LOGICAL_HEIGHT;
    this.glowCtx = this.glowCanvas.getContext("2d");
    this.glowCtx.imageSmoothingEnabled = false;

    this.gameplayAtlas = new Image();
    this.atlasReady = false;
    this.gameplayAtlas.addEventListener("load", () => {
      this.atlasReady = true;
    }, { once: true });
    this.gameplayAtlas.src = GAMEPLAY_ATLAS_URL;

    this.pickupAtlas = new Image();
    this.pickupAtlasReady = false;
    this.pickupAtlas.addEventListener("load", () => {
      this.pickupAtlasReady = true;
    }, { once: true });
    this.pickupAtlas.src = PICKUP_ATLAS_URL;

    this.gateAtlas = new Image();
    this.gateAtlasReady = false;
    this.gateAtlas.addEventListener("load", () => {
      this.gateAtlasReady = true;
    }, { once: true });
    this.gateAtlas.src = GATE_ATLAS_URL;

    this.playerWalkAtlas = new Image();
    this.playerWalkAtlasReady = false;
    this.playerWalkAtlas.addEventListener("load", () => {
      this.playerWalkAtlasReady = true;
    }, { once: true });
    this.playerWalkAtlas.src = PLAYER_WALK_ATLAS_URL;
  }

  render(game) {
    const { ctx } = this;
    const world = game.world;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = COLORS.caveVoid;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    if (!world || !game.player) {
      ctx.restore();
      return;
    }

    this.drawVoid(game);
    this.drawTiles(game);
    this.drawDoor(game);
    this.drawPickups(game);

    const actors = [
      ...game.enemies.filter((enemy) => !enemy.dead).map((enemy) => ({ kind: "enemy", entity: enemy })),
      { kind: "player", entity: game.player },
    ].sort((a, b) => a.entity.y - b.entity.y);

    for (const actor of actors) {
      if (actor.kind === "player") this.drawPlayer(game, actor.entity);
      else this.drawEnemy(game, actor.entity);
    }

    this.drawPlayerFocusCharge(game);
    this.drawProjectiles(game);
    this.drawParticles(game, false);
    this.drawLighting(game);
    this.drawGlows(game);
    this.drawEnemyEyes(game);
    this.drawParticles(game, true);
    this.drawDamageFlash(game);
    this.drawVignette(game);
    this.drawDoorBeacon(game);
    ctx.restore();
  }

  toScreen(game, x, y) {
    return {
      x: Math.round(x - game.camera.x),
      y: Math.round(y - game.camera.y),
    };
  }

  onScreen(game, x, y, padding = 64) {
    const screen = this.toScreen(game, x, y);
    return screen.x > -padding && screen.y > -padding && screen.x < LOGICAL_WIDTH + padding && screen.y < LOGICAL_HEIGHT + padding;
  }

  drawAtlasSprite(ctx, spriteId, centerX, bottomY, targetWidth, { alpha = 1, flipX = false } = {}) {
    if (!this.atlasReady) return false;
    const sprite = ATLAS_SPRITES[spriteId];
    if (!sprite) return false;
    const targetHeight = targetWidth * (sprite.height / sprite.width);
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(Math.round(centerX), Math.round(bottomY));
    if (flipX) ctx.scale(-1, 1);
    ctx.drawImage(
      this.gameplayAtlas,
      sprite.x,
      sprite.y,
      sprite.width,
      sprite.height,
      -targetWidth / 2,
      -targetHeight,
      targetWidth,
      targetHeight,
    );
    ctx.restore();
    return true;
  }

  getPlayerWalkFrame(player, time = 0, reducedMotion = false) {
    const facing = PLAYER_WALK_FRAMES[player?.facing] ? player.facing : "down";
    const column = player?.moving && !reducedMotion
      ? PLAYER_WALK_SEQUENCE[Math.floor(Math.max(0, time) * PLAYER_WALK_FPS) % PLAYER_WALK_SEQUENCE.length]
      : 1;
    return {
      ...PLAYER_WALK_FRAMES[facing][column],
      facing,
      row: PLAYER_WALK_ROWS[facing],
      column,
    };
  }

  drawPlayerWalkSprite(ctx, player, time, centerX, bottomY, targetHeight, reducedMotion = false) {
    if (!this.playerWalkAtlasReady) return false;
    const frame = this.getPlayerWalkFrame(player, time, reducedMotion);
    const targetWidth = targetHeight * (frame.width / frame.height);
    ctx.drawImage(
      this.playerWalkAtlas,
      frame.x,
      frame.y,
      frame.width,
      frame.height,
      Math.round(centerX - targetWidth / 2),
      Math.round(bottomY - targetHeight),
      Math.round(targetWidth),
      Math.round(targetHeight),
    );
    return true;
  }

  getEnemyAtlasLayout(game, enemy) {
    const profile = ENEMY_ATLAS_PROFILES[enemy.type] || ENEMY_ATLAS_PROFILES.basic;
    const sprite = ATLAS_SPRITES[profile.spriteId];
    const screen = this.toScreen(game, enemy.x, enemy.y);
    const width = profile.targetWidth;
    const height = width * (sprite.height / sprite.width);
    const bottom = screen.y + enemy.radius + 8;
    const left = screen.x - width / 2;
    const top = bottom - height;
    // Enemy atlas art faces left by default, so rightward movement must mirror it.
    const flipX = Math.cos(enemy.facingAngle || 0) > 0;
    const scaleX = width / sprite.width;
    const scaleY = height / sprite.height;
    const eyes = profile.eyes.map((source) => {
      const sourceOffsetX = flipX ? sprite.width - source.x - source.width : source.x;
      return {
        sourceX: sprite.x + source.x,
        sourceY: sprite.y + source.y,
        sourceWidth: source.width,
        sourceHeight: source.height,
        x: left + sourceOffsetX * scaleX,
        y: top + source.y * scaleY,
        width: source.width * scaleX,
        height: source.height * scaleY,
      };
    });
    return { ...profile, sprite, screen, width, height, bottom, left, top, flipX, eyes };
  }

  drawPickupSprite(ctx, spriteId, centerX, centerY, targetHeight, { alpha = 1, rotation = 0 } = {}) {
    if (!this.pickupAtlasReady) return false;
    const sprite = PICKUP_SPRITES[spriteId];
    if (!sprite) return false;
    const targetWidth = targetHeight * (sprite.width / sprite.height);
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(Math.round(centerX), Math.round(centerY));
    ctx.rotate(rotation);
    ctx.drawImage(
      this.pickupAtlas,
      sprite.x,
      sprite.y,
      sprite.width,
      sprite.height,
      -targetWidth / 2,
      -targetHeight / 2,
      targetWidth,
      targetHeight,
    );
    ctx.restore();
    return true;
  }

  drawGateSprite(ctx, spriteId, centerX, bottomY, targetWidth) {
    if (!this.gateAtlasReady) return false;
    const sprite = ATLAS_SPRITES[spriteId];
    if (!sprite) return false;
    const targetHeight = targetWidth * (sprite.height / sprite.width);
    ctx.drawImage(
      this.gateAtlas,
      sprite.x,
      sprite.y,
      sprite.width,
      sprite.height,
      centerX - targetWidth / 2,
      bottomY - targetHeight,
      targetWidth,
      targetHeight,
    );
    return true;
  }

  drawAtlasTileOverlay(ctx, spriteId, x, y, variant, alpha = 0.7, size = 38, options = {}) {
    if (!this.atlasReady) return;
    const sprite = ATLAS_SPRITES[spriteId];
    if (!sprite) return;
    const quarterTurns = options.quarterTurns ?? Math.floor(variant * 4);
    const flipX = options.flipX ?? variant > 0.5;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(Math.round(x + TILE_SIZE / 2), Math.round(y + TILE_SIZE / 2));
    ctx.rotate(quarterTurns * (Math.PI / 2));
    if (flipX) ctx.scale(-1, 1);
    ctx.drawImage(
      this.gameplayAtlas,
      sprite.x,
      sprite.y,
      sprite.width,
      sprite.height,
      -size / 2,
      -size / 2,
      size,
      size,
    );
    ctx.restore();
  }

  drawVoid(game) {
    const { ctx } = this;
    const driftX = Math.round(game.camera.x * 0.1);
    const driftY = Math.round(game.camera.y * 0.1);
    ctx.fillStyle = "#050617";
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    for (let y = -32; y < LOGICAL_HEIGHT + 32; y += 64) {
      for (let x = -32; x < LOGICAL_WIDTH + 32; x += 64) {
        const worldX = x + driftX;
        const worldY = y + driftY;
        const sparkle = hash2D(Math.floor(worldX / 64), Math.floor(worldY / 64), game.world.seed || 1);
        if (sparkle < 0.74) continue;
        ctx.globalAlpha = 0.2 + sparkle * 0.25;
        ctx.fillStyle = sparkle > 0.9 ? COLORS.cyan : COLORS.violet;
        const px = ((x - driftX) % (LOGICAL_WIDTH + 64)) + 12;
        const py = ((y - driftY) % (LOGICAL_HEIGHT + 64)) + 9;
        ctx.fillRect(Math.round(px), Math.round(py), 2, 2);
      }
    }
    ctx.globalAlpha = 1;
  }

  drawTiles(game) {
    const { ctx } = this;
    const { world, camera } = game;
    const firstX = Math.max(0, Math.floor(camera.x / TILE_SIZE) - 1);
    const firstY = Math.max(0, Math.floor(camera.y / TILE_SIZE) - 1);
    const lastX = Math.min(world.width - 1, Math.ceil((camera.x + LOGICAL_WIDTH) / TILE_SIZE) + 1);
    const lastY = Math.min(world.height - 1, Math.ceil((camera.y + LOGICAL_HEIGHT) / TILE_SIZE) + 1);

    for (let tileY = firstY; tileY <= lastY; tileY += 1) {
      for (let tileX = firstX; tileX <= lastX; tileX += 1) {
        const screenX = Math.round(tileX * TILE_SIZE - camera.x);
        const screenY = Math.round(tileY * TILE_SIZE - camera.y);
        if (world.tiles[tileY][tileX] === TILE_TYPES.FLOOR) {
          this.drawFloorTile(ctx, screenX, screenY, tileX, tileY, world.seed || 0, game.time);
        } else {
          this.drawWallTile(ctx, world, screenX, screenY, tileX, tileY, world.seed || 0);
        }
      }
    }

    this.drawWorldDecorations(game);
  }

  drawFloorTile(ctx, x, y, tileX, tileY, seed, time) {
    const variant = hash2D(tileX, tileY, seed);
    ctx.fillStyle = FLOOR_VARIANTS[Math.floor(variant * FLOOR_VARIANTS.length) % FLOOR_VARIANTS.length];
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    ctx.fillStyle = variant > 0.52 ? "#1b2146" : "#181d3e";
    ctx.fillRect(x + 1, y + 1, 14, 1);
    ctx.fillRect(x + 17, y + 17, 13, 1);
    ctx.fillStyle = "#090c21";
    ctx.fillRect(x + 2, y + 15, 12, 2);
    ctx.fillRect(x + 18, y + 30, 11, 1);
    ctx.fillRect(x + 15, y + 3, 2, 12);

    if (variant > 0.74) {
      ctx.fillStyle = variant > 0.9 ? "#2e3b67" : "#232b53";
      ctx.fillRect(x + 8, y + 7, 5, 2);
      ctx.fillRect(x + 12, y + 9, 2, 5);
      ctx.fillRect(x + 19, y + 23, 6, 2);
    }
    if (variant > 0.94) {
      const color = CRYSTAL_COLORS[Math.floor(hash2D(tileY, tileX, seed + 13) * CRYSTAL_COLORS.length)];
      const pulse = Math.sin(time * 2 + tileX * 0.7 + tileY) > 0.92;
      ctx.fillStyle = color;
      ctx.globalAlpha = pulse ? 0.9 : 0.55;
      ctx.fillRect(x + 25, y + 8, 2, 4);
      ctx.fillRect(x + 24, y + 10, 4, 2);
      ctx.globalAlpha = 1;
    }
    this.drawAtlasTileOverlay(ctx, "floor", x, y, variant, 0.64, 38);
  }

  drawWallTile(ctx, world, x, y, tileX, tileY, seed) {
    const wallStyle = getWallTileStyle(world, tileX, tileY);
    const { below: floorBelow, above: floorAbove, left: floorLeft, right: floorRight } = wallStyle.floor;
    const { edge } = wallStyle;
    const variant = hash2D(tileX, tileY, seed + 91);

    ctx.fillStyle = edge ? "#171039" : "#08081c";
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    if (!edge) {
      if (variant > 0.91) {
        ctx.fillStyle = "#16102f";
        ctx.fillRect(x + 4, y + 7, 11, 8);
        ctx.fillRect(x + 17, y + 18, 12, 9);
      }
      if (variant > 0.9) this.drawAtlasTileOverlay(ctx, "voidRocks", x, y, variant, 0.26, 38);
      return;
    }

    ctx.fillStyle = "#291b55";
    ctx.fillRect(x + 2, y + 3, 28, 25);
    ctx.fillStyle = "#382468";
    ctx.fillRect(x + 3, y + 4, 12, 9);
    ctx.fillRect(x + 17, y + 15, 12, 11);
    ctx.fillStyle = "#130e31";
    ctx.fillRect(x + 15, y + 3, 2, 12);
    ctx.fillRect(x + 2, y + 14, 15, 2);
    ctx.fillRect(x + 17, y + 27, 13, 2);

    if (floorBelow) {
      ctx.fillStyle = "#7651aa";
      ctx.fillRect(x, y + 24, 32, 4);
      ctx.fillStyle = COLORS.purple;
      ctx.globalAlpha = 0.72;
      ctx.fillRect(x + 3, y + 25, 26, 2);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#241642";
      ctx.fillRect(x, y + 28, 32, 2);
      ctx.fillStyle = "#09071d";
      ctx.fillRect(x, y + 30, 32, 2);
    }
    if (floorAbove) {
      ctx.fillStyle = "#392567";
      ctx.fillRect(x, y, 32, 3);
    }
    if (floorLeft) {
      ctx.fillStyle = "#34215e";
      ctx.fillRect(x, y + 3, 3, 25);
    }
    if (floorRight) {
      ctx.fillStyle = "#160e34";
      ctx.fillRect(x + 29, y + 3, 3, 26);
    }

    if (variant > 0.84) {
      ctx.fillStyle = variant > 0.94 ? COLORS.violet : "#613290";
      ctx.globalAlpha = 0.5;
      ctx.fillRect(x + 7, y + 7, 2, 5);
      ctx.fillRect(x + 6, y + 9, 4, 2);
      ctx.globalAlpha = 1;
    }
    const isCorner = wallStyle.kind !== "straight";
    const wallTransform = getWallAtlasTransform(wallStyle);
    this.drawAtlasTileOverlay(
      ctx,
      wallStyle.spriteId,
      x,
      y,
      variant,
      isCorner ? 0.74 : 0.82,
      wallStyle.kind === "inner-corner" ? 38 : 42,
      wallTransform,
    );
  }

  tileAt(world, x, y) {
    return worldTileAt(world, x, y);
  }

  drawWorldDecorations(game) {
    const { ctx } = this;
    for (const decoration of game.world.decorations || []) {
      const worldX = decoration.worldX ?? decoration.x * TILE_SIZE + TILE_SIZE / 2;
      const worldY = decoration.worldY ?? decoration.y * TILE_SIZE + TILE_SIZE / 2;
      if (!this.onScreen(game, worldX, worldY, 48)) continue;
      const { x, y } = this.toScreen(game, worldX, worldY);
      const color = NAMED_CRYSTAL_COLORS[decoration.color] || decoration.color || CRYSTAL_COLORS[(decoration.variant || 0) % CRYSTAL_COLORS.length];
      const scale = decoration.scale || 1;
      const size = decoration.size || (decoration.type === "crystal-cluster" ? 15 * scale : 7 * scale);
      if (this.atlasReady) {
        if (decoration.type?.includes("crystal") || decoration.type === "cluster") {
          const spriteId = decoration.color === "cyan" || decoration.color === "blue"
            ? "crystalCyan"
            : "crystalMagenta";
          this.drawAtlasSprite(ctx, spriteId, x, y + 14, Math.max(28, size * 2.55), { alpha: 0.94 });
        } else if (decoration.type === "stalagmite" && (decoration.variant || 0) % 13 === 0) {
          this.drawAtlasSprite(ctx, "runePillar", x, y + 14, 22 * scale, { alpha: 0.74 });
        } else {
          this.drawAtlasSprite(ctx, "flora", x, y + 13, 24 * scale, { alpha: 0.84 });
        }
        continue;
      }
      if (decoration.type?.includes("crystal") || decoration.type === "cluster") {
        this.drawCrystalCluster(ctx, x, y + 10, size, color, true);
      } else if (decoration.type === "mushroom") {
        ctx.fillStyle = "#7b46b9";
        ctx.fillRect(x - 3, y + 4, 6, 3);
        ctx.fillStyle = "#c266eb";
        ctx.fillRect(x - 2, y + 2, 4, 2);
        ctx.fillStyle = "#9bb2ca";
        ctx.fillRect(x, y + 7, 1, 4);
      } else {
        ctx.fillStyle = "#214c61";
        ctx.globalAlpha = 0.72;
        ctx.fillRect(x - 4, y + 6, 2, 5);
        ctx.fillRect(x, y + 4, 2, 7);
        ctx.fillRect(x + 4, y + 7, 2, 4);
        ctx.globalAlpha = 1;
      }
    }
  }

  drawCrystalCluster(ctx, x, y, size, color, bright = true) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.fillStyle = "rgba(0,0,0,.45)";
    ctx.fillRect(-size, 3, size * 2, 4);
    this.drawCrystal(ctx, -size * 0.5, 0, size * 0.7, color, bright);
    this.drawCrystal(ctx, 0, -size * 0.45, size, color, bright);
    this.drawCrystal(ctx, size * 0.55, 1, size * 0.58, color, bright);
    ctx.restore();
  }

  drawCrystal(ctx, x, y, size, color, bright) {
    const width = Math.max(3, Math.round(size * 0.58));
    const height = Math.max(6, Math.round(size * 1.35));
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - height);
    ctx.lineTo(x + width, y - height * 0.55);
    ctx.lineTo(x + width * 0.75, y);
    ctx.lineTo(x - width * 0.7, y);
    ctx.lineTo(x - width, y - height * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.62)";
    ctx.beginPath();
    ctx.moveTo(x, y - height + 2);
    ctx.lineTo(x, y - 2);
    ctx.lineTo(x - width * 0.55, y - height * 0.53);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(5,8,35,.3)";
    ctx.beginPath();
    ctx.moveTo(x, y - height + 2);
    ctx.lineTo(x + width * 0.8, y - height * 0.52);
    ctx.lineTo(x, y - 2);
    ctx.closePath();
    ctx.fill();
    if (bright) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(Math.round(x - 1), Math.round(y - height + 3), 2, 2);
    }
  }

  drawDoor(game) {
    const { ctx } = this;
    const door = game.door;
    if (!door || !this.onScreen(game, door.x, door.y, 80)) return;
    const { x, y } = this.toScreen(game, door.x, door.y);
    const activationRatio = clamp(door.progress / door.activationSeconds, 0, 1);
    const lit = activationRatio >= 1;
    if (this.gateAtlasReady) {
      ctx.fillStyle = "rgba(0,0,0,.58)";
      ctx.fillRect(Math.round(x - 43), Math.round(y + 30), 86, 8);
      this.drawGateSprite(ctx, lit ? "gateAwake" : "gateSealed", x, y + 36, 92);
      this.drawDoorSocketActivation(ctx, x, y, activationRatio, game.time);
      return;
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1.2, 1.2);
    ctx.fillStyle = "rgba(0,0,0,.55)";
    ctx.fillRect(-27, 21, 54, 8);
    ctx.fillStyle = "#17142f";
    ctx.fillRect(-27, -26, 54, 50);
    ctx.fillStyle = "#413367";
    ctx.fillRect(-30, -23, 6, 49);
    ctx.fillRect(24, -23, 6, 49);
    ctx.fillRect(-24, -29, 48, 6);
    ctx.fillStyle = "#241943";
    ctx.fillRect(-20, -18, 40, 41);
    ctx.fillStyle = lit ? "#27134a" : "#161226";
    ctx.fillRect(-15, -14, 30, 37);
    ctx.fillStyle = "#6c52a1";
    ctx.fillRect(-13, -12, 2, 32);
    ctx.fillRect(11, -12, 2, 32);
    ctx.fillStyle = lit ? COLORS.violet : "#39244f";
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(7, -3);
    ctx.lineTo(5, 10);
    ctx.lineTo(0, 15);
    ctx.lineTo(-5, 10);
    ctx.lineTo(-7, -3);
    ctx.closePath();
    ctx.fill();
    if (lit) {
      ctx.fillStyle = "#f2d8ff";
      ctx.fillRect(-1, -6, 2, 14);
    }
    for (const side of [-1, 1]) {
      ctx.fillStyle = lit ? COLORS.cyan : "#27445a";
      ctx.fillRect(side * 33 - 2, -10, 4, 18);
      ctx.fillStyle = lit ? "#c9fbff" : "#456477";
      ctx.fillRect(side * 33 - 1, -8, 2, 8);
    }
    ctx.restore();
    this.drawDoorSocketActivation(ctx, x, y, activationRatio, game.time, 0.78);
  }

  drawDoorSocketActivation(ctx, x, y, activationRatio, time, scale = 1) {
    const rawChargeProgress = activationRatio * DOOR_CHARGE_STEPS;
    ctx.save();

    DOOR_SOCKET_OFFSETS.forEach((socket, index) => {
      const socketX = Math.round(x + socket.x * scale);
      const socketY = Math.round(y + socket.y * scale);
      const reveal = clamp(rawChargeProgress - index, 0, 1);
      if (reveal <= 0) return;
      ctx.save();
      ctx.translate(socketX, socketY);
      ctx.scale(scale, scale);
      const pop = Math.sin(reveal * Math.PI / 2);
      ctx.scale(pop, pop);
      ctx.globalCompositeOperation = "lighter";
      this.paintGlow(ctx, 0, 0, 8 + reveal * 7, socket.color, 0.16 + reveal * 0.2);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = socket.color;
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(3, -2);
      ctx.lineTo(2, 5);
      ctx.lineTo(0, 7);
      ctx.lineTo(-2, 5);
      ctx.lineTo(-3, -2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(245,249,255,.88)";
      ctx.beginPath();
      ctx.moveTo(-1, -4);
      ctx.lineTo(0, 4);
      ctx.lineTo(-2, 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    const pulse = 1 + Math.sin(time * 7) * activationRatio * 0.08;
    const centerY = y - 11 * scale;
    ctx.globalCompositeOperation = "lighter";
    this.paintGlow(
      ctx,
      x,
      centerY,
      (10 + activationRatio * 35) * pulse * scale,
      COLORS.violet,
      0.04 + activationRatio * 0.34,
    );
    ctx.globalCompositeOperation = "source-over";
    ctx.translate(Math.round(x), Math.round(centerY));
    ctx.scale(pulse * scale, pulse * scale);
    const centerSize = 4 + activationRatio * 4;
    ctx.fillStyle = activationRatio > 0 ? COLORS.violet : "#39244f";
    ctx.beginPath();
    ctx.moveTo(0, -centerSize);
    ctx.lineTo(centerSize * 0.7, 0);
    ctx.lineTo(0, centerSize);
    ctx.lineTo(-centerSize * 0.7, 0);
    ctx.closePath();
    ctx.fill();
    if (activationRatio > 0) {
      ctx.fillStyle = `rgba(255,255,255,${0.25 + activationRatio * 0.7})`;
      ctx.fillRect(-1, Math.round(-centerSize * 0.65), 2, Math.max(2, Math.round(centerSize * 0.9)));
    }
    ctx.restore();
  }

  drawPickups(game) {
    const { ctx } = this;
    for (const pickup of game.pickups) {
      if (pickup.collected || !this.onScreen(game, pickup.x, pickup.y, 48)) continue;
      const screen = this.toScreen(game, pickup.x, pickup.y);
      const bob = Math.round(Math.sin(game.time * 2.8 + pickup.phase) * 3);
      if (pickup.kind === "laser-focus") {
        this.drawLaserFocusPickup(ctx, pickup, screen.x, screen.y + bob, game.time);
      } else if (pickup.kind === "half-heart") {
        this.drawHalfHeart(ctx, screen.x, screen.y + bob, 1);
      } else {
        const isChunk = pickup.kind === "crystal-chunk";
        if (this.pickupAtlasReady) {
          const pickupNumber = Number.parseInt(pickup.id?.match(/\d+$/)?.[0] || "0", 10);
          const spriteId = isChunk
            ? "minedAmber"
            : pickupNumber % 2 === 0 ? "minedCyan" : "minedMagenta";
          this.drawPickupSprite(
            ctx,
            spriteId,
            screen.x,
            screen.y + bob,
            isChunk ? 34 : 29,
            { rotation: Math.sin(pickup.phase) * 0.08 },
          );
        } else {
          this.drawCrystalCluster(
            ctx,
            screen.x,
            screen.y + 7 + bob,
            isChunk ? 15 : 9,
            isChunk ? COLORS.amber : pickup.color || COLORS.cyan,
            true,
          );
        }
      }
    }
  }

  drawHalfHeart(ctx, x, y, scale = 1) {
    if (this.atlasReady) {
      this.drawAtlasSprite(ctx, "halfHeart", x, y + 12 * scale, 28 * scale);
      return;
    }
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.scale(scale, scale);
    ctx.fillStyle = "rgba(0,0,0,.5)";
    ctx.fillRect(-8, 8, 16, 3);
    ctx.fillStyle = "#9f2359";
    ctx.fillRect(-7, -5, 6, 4);
    ctx.fillRect(1, -5, 6, 4);
    ctx.fillRect(-9, -1, 18, 6);
    ctx.fillRect(-6, 5, 12, 4);
    ctx.fillRect(-3, 9, 6, 3);
    ctx.fillStyle = COLORS.heart;
    ctx.fillRect(-6, -4, 5, 4);
    ctx.fillRect(1, -4, 5, 4);
    ctx.fillRect(-7, 0, 14, 4);
    ctx.fillRect(-4, 4, 8, 4);
    ctx.fillRect(-2, 8, 4, 2);
    ctx.fillStyle = "#ffb4d2";
    ctx.fillRect(-4, -3, 3, 2);
    ctx.restore();
  }

  drawLaserFocusPickup(ctx, pickup, x, y, time) {
    const focus = getLaserFocus(pickup.focusId);
    const pulse = 1 + Math.sin(time * 4 + pickup.phase) * 0.07;
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    // A compact ancient altar makes the single Focus Chamber read differently
    // from ordinary loose crystal veins without adding collision geometry.
    ctx.fillStyle = "rgba(0,0,0,.62)";
    ctx.fillRect(-19, 12, 38, 7);
    ctx.fillStyle = "#191226";
    ctx.fillRect(-17, 7, 34, 8);
    ctx.fillStyle = "#4a3562";
    ctx.fillRect(-13, 3, 26, 6);
    ctx.fillStyle = focus.color;
    ctx.fillRect(-9, 5, 18, 2);

    ctx.globalCompositeOperation = "lighter";
    ctx.scale(pulse, pulse);
    ctx.fillStyle = focus.color;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(10, -9);
    ctx.lineTo(7, 4);
    ctx.lineTo(0, 9);
    ctx.lineTo(-7, 4);
    ctx.lineTo(-10, -9);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = focus.coreColor;
    ctx.fillRect(-2, -13, 3, 13);
    ctx.restore();
  }

  drawPlayer(game, player) {
    if (!this.onScreen(game, player.x, player.y, 40)) return;
    const { ctx } = this;
    const { x, y } = this.toScreen(game, player.x, player.y);
    const blink = player.invulnerability > 0 && Math.floor(game.time * 14) % 2 === 0;
    if (this.playerWalkAtlasReady) {
      ctx.save();
      if (blink) ctx.globalAlpha = 0.35;
      ctx.fillStyle = "rgba(0,0,0,.58)";
      ctx.fillRect(Math.round(x - 12), Math.round(y + 9), 24, 6);
      this.drawPlayerWalkSprite(ctx, player, game.time, x, y + 16, 42, game.reducedMotion);
      ctx.restore();
      return;
    }
    if (this.atlasReady) {
      const walking = player.moving ? Math.round(Math.sin(game.time * 12)) : 0;
      ctx.save();
      if (blink) ctx.globalAlpha = 0.35;
      ctx.fillStyle = "rgba(0,0,0,.58)";
      ctx.fillRect(Math.round(x - 12), Math.round(y + 9), 24, 6);
      this.drawAtlasSprite(ctx, "player", x, y + 16 + walking, 30, {
        flipX: player.facing === "left",
      });
      ctx.restore();
      return;
    }
    if (blink) ctx.globalAlpha = 0.35;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1.2, 1.2);
    const walking = player.moving ? Math.sin(game.time * 12) * 1.5 : 0;
    ctx.fillStyle = "rgba(0,0,0,.55)";
    ctx.fillRect(-10, 9, 20, 5);
    ctx.fillStyle = "#241b43";
    ctx.fillRect(-8, -4, 16, 14);
    ctx.fillStyle = "#594084";
    ctx.fillRect(-7, -8, 14, 9);
    ctx.fillStyle = "#151126";
    ctx.fillRect(-5, -5, 10, 7);
    ctx.fillStyle = "#bd8b72";
    ctx.fillRect(-3, -3, 6, 5);
    ctx.fillStyle = "#f6d3b0";
    ctx.fillRect(-2, -2, 4, 2);
    ctx.fillStyle = "#332750";
    ctx.fillRect(-7, 9 + Math.round(walking), 5, 4);
    ctx.fillRect(2, 9 - Math.round(walking), 5, 4);

    const direction = player.facingVector || { x: 0, y: 1 };
    const handX = Math.round(direction.x * 10);
    const handY = Math.round(direction.y * 10);
    ctx.fillStyle = "#8e5cff";
    ctx.fillRect(handX - 3, handY - 5, 6, 9);
    ctx.fillStyle = COLORS.cyan;
    ctx.fillRect(handX - 2, handY - 8, 4, 6);
    ctx.fillStyle = "#e5feff";
    ctx.fillRect(handX - 1, handY - 7, 2, 2);
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  drawPlayerFocusCharge(game) {
    const player = game.player;
    if (!player?.focusCharging || !this.onScreen(game, player.x, player.y, 54)) return;
    const { ctx } = this;
    const focus = getLaserFocus(player.chargingFocusId);
    const ratio = focus.chargeTime > 0 ? clamp(player.focusCharge / focus.chargeTime, 0, 1) : 0;
    const screen = this.toScreen(game, player.x, player.y);
    const direction = player.facingVector || { x: 0, y: 1 };
    const crystalX = screen.x + direction.x * 16;
    const crystalY = screen.y + direction.y * 16;
    const pulse = 1 + Math.sin(game.time * (8 + ratio * 8)) * (0.08 + ratio * 0.1);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = focus.color;
    ctx.lineWidth = player.focusChargeReady ? 3 : 1 + ratio * 1.5;
    ctx.globalAlpha = 0.42 + ratio * 0.52;
    ctx.beginPath();
    ctx.arc(crystalX, crystalY, (8 + ratio * 13) * pulse, -Math.PI / 2, -Math.PI / 2 + TAU * ratio);
    ctx.stroke();
    ctx.fillStyle = focus.coreColor;
    const coreSize = Math.max(2, Math.round(2 + ratio * 5 + (player.focusChargeReady ? pulse * 2 : 0)));
    ctx.fillRect(Math.round(crystalX - coreSize / 2), Math.round(crystalY - coreSize / 2), coreSize, coreSize);
    ctx.restore();
  }

  drawEnemy(game, enemy) {
    if (!this.onScreen(game, enemy.x, enemy.y, 50)) return;
    const { ctx } = this;
    const { x, y } = this.toScreen(game, enemy.x, enemy.y);
    if (this.atlasReady) {
      const layout = this.getEnemyAtlasLayout(game, enemy);
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,.62)";
      ctx.fillRect(
        Math.round(x - layout.width * 0.42),
        Math.round(y + enemy.radius * 0.48),
        Math.round(layout.width * 0.84),
        6,
      );
      this.drawAtlasSprite(ctx, layout.spriteId, x, layout.bottom, layout.width, {
        flipX: layout.flipX,
      });
      ctx.translate(x, y);
      this.drawEnemyAwareness(ctx, enemy);
      ctx.restore();
      return;
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(enemy.type === "brute" ? 1.12 : 1.18, enemy.type === "brute" ? 1.12 : 1.18);
    ctx.fillStyle = "rgba(0,0,0,.58)";
    ctx.fillRect(-enemy.radius, enemy.radius * 0.45, enemy.radius * 2, 5);

    if (enemy.type === "brute") {
      ctx.fillStyle = "#211c37";
      ctx.fillRect(-14, -13, 28, 25);
      ctx.fillStyle = "#3d315c";
      ctx.fillRect(-16, -9, 7, 17);
      ctx.fillRect(9, -9, 7, 17);
      ctx.fillStyle = "#7754a1";
      for (let spike = -10; spike <= 10; spike += 7) {
        ctx.beginPath();
        ctx.moveTo(spike, -12);
        ctx.lineTo(spike + 3, -23 - Math.abs(spike) * 0.15);
        ctx.lineTo(spike + 6, -11);
        ctx.fill();
      }
      ctx.fillStyle = "#171323";
      ctx.fillRect(-11, 8, 8, 8);
      ctx.fillRect(3, 8, 8, 8);
      if (enemy.health === 1) {
        ctx.fillStyle = COLORS.pink;
        ctx.fillRect(-2, -11, 3, 13);
      }
    } else if (enemy.type === "crawler") {
      ctx.fillStyle = "#2b1b48";
      ctx.fillRect(-10, -5, 20, 12);
      ctx.fillStyle = "#70429a";
      ctx.fillRect(-7, -9, 12, 7);
      ctx.fillStyle = "#a54dd5";
      for (const side of [-1, 1]) {
        ctx.fillRect(side * 7 - 1, 6, 2, 6);
        ctx.fillRect(side * 11 - 1, 4, 2, 5);
      }
    } else {
      ctx.fillStyle = "#251b3e";
      ctx.fillRect(-10, -10, 20, 20);
      ctx.fillStyle = "#563674";
      ctx.fillRect(-8, -13, 6, 7);
      ctx.fillRect(2, -13, 6, 7);
      ctx.fillStyle = "#3e285c";
      ctx.fillRect(-12, 4, 5, 8);
      ctx.fillRect(7, 4, 5, 8);
    }

    this.drawEnemyAwareness(ctx, enemy);
    ctx.restore();
  }

  drawEnemyAwareness(ctx, enemy) {
    if (enemy.state === "alert" || enemy.state === "chase") {
      ctx.fillStyle = enemy.state === "alert" ? COLORS.amber : COLORS.danger;
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "center";
      ctx.fillText(enemy.state === "alert" ? "!" : "!!", 0, -enemy.radius - 12);
    } else if (enemy.state === "scan") {
      ctx.fillStyle = COLORS.text;
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.fillText("?", 0, -enemy.radius - 10);
    }
  }

  drawProjectiles(game) {
    const { ctx } = this;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const projectile of game.projectiles) {
      if (!this.onScreen(game, projectile.x, projectile.y, 32)) continue;
      const screen = this.toScreen(game, projectile.x, projectile.y);
      const beamWidth = projectile.beamWidth || 4;
      ctx.strokeStyle = projectile.color || "rgba(40,229,255,.32)";
      ctx.globalAlpha = 0.34;
      ctx.lineWidth = beamWidth * 2.4;
      ctx.beginPath();
      ctx.moveTo(screen.x - projectile.vx * 0.018, screen.y - projectile.vy * 0.018);
      ctx.lineTo(screen.x, screen.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = projectile.coreColor || "#d8ffff";
      ctx.lineWidth = Math.max(2, beamWidth * 0.48);
      ctx.beginPath();
      ctx.moveTo(screen.x - projectile.vx * 0.02, screen.y - projectile.vy * 0.02);
      ctx.lineTo(screen.x, screen.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawParticles(game, glowingOnly) {
    const { ctx } = this;
    for (const particle of game.particles) {
      if (Boolean(particle.glow) !== glowingOnly || !this.onScreen(game, particle.x, particle.y, 20)) continue;
      const screen = this.toScreen(game, particle.x, particle.y);
      ctx.save();
      if (particle.glow) ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
      ctx.fillStyle = particle.color;
      const size = Math.max(1, Math.round(particle.size * (particle.life / particle.maxLife)));
      ctx.fillRect(Math.round(screen.x - size / 2), Math.round(screen.y - size / 2), size, size);
      ctx.restore();
    }
  }

  drawLighting(game) {
    const level = LEVEL_CONFIG[game.levelId];
    const difficulty = DIFFICULTY_CONFIG[game.difficultyId];
    const darkness = clamp((1 - level.ambientLight) * difficulty.darknessMultiplier, 0.5, 0.965);
    const { lightCtx } = this;
    lightCtx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    lightCtx.fillStyle = `rgba(1, 2, 12, ${darkness})`;
    lightCtx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    lightCtx.globalCompositeOperation = "destination-out";

    const playerScreen = this.toScreen(game, game.player.x, game.player.y);
    const playerRadius = level.playerLightBase + game.player.shards * level.playerLightPerShard;
    this.punchLight(lightCtx, playerScreen.x, playerScreen.y, playerRadius, 0.98);

    if (game.levelId === 3) {
      const facing = game.player.facingVector || { x: 0, y: 1 };
      this.punchLight(
        lightCtx,
        playerScreen.x + facing.x * playerRadius * 0.48,
        playerScreen.y + facing.y * playerRadius * 0.48,
        playerRadius * 0.68,
        0.55,
      );
    }

    for (const pickup of game.pickups) {
      if (pickup.collected || pickup.kind === "half-heart" || !this.onScreen(game, pickup.x, pickup.y, 90)) continue;
      const screen = this.toScreen(game, pickup.x, pickup.y);
      const focusPickup = pickup.kind === "laser-focus";
      this.punchLight(
        lightCtx,
        screen.x,
        screen.y,
        focusPickup ? 86 : pickup.kind === "crystal-chunk" ? 66 : 48,
        focusPickup ? 0.52 : 0.28,
      );
    }

    for (const decoration of game.world.decorations || []) {
      if (!decoration.glow) continue;
      const worldX = decoration.worldX ?? decoration.x * TILE_SIZE + TILE_SIZE / 2;
      const worldY = decoration.worldY ?? decoration.y * TILE_SIZE + TILE_SIZE / 2;
      if (!this.onScreen(game, worldX, worldY, 80)) continue;
      const screen = this.toScreen(game, worldX, worldY);
      const scale = decoration.scale || 1;
      const radius = decoration.type === "crystal-cluster" ? 48 * scale : 30 * scale;
      this.punchLight(lightCtx, screen.x, screen.y, radius, 0.1 + decoration.glow * 0.12);
    }

    if (game.door && this.onScreen(game, game.door.x, game.door.y, 100)) {
      const screen = this.toScreen(game, game.door.x, game.door.y);
      const activationRatio = clamp(game.door.progress / game.door.activationSeconds, 0, 1);
      this.punchLight(
        lightCtx,
        screen.x,
        screen.y,
        54 + activationRatio * 52,
        0.16 + activationRatio * 0.38,
      );
    }

    for (const projectile of game.projectiles) {
      const screen = this.toScreen(game, projectile.x, projectile.y);
      this.punchLight(lightCtx, screen.x, screen.y, 48 + (projectile.beamWidth || 4) * 3, 0.55);
    }

    lightCtx.globalCompositeOperation = "source-over";
    this.ctx.drawImage(this.lightCanvas, 0, 0);
  }

  punchLight(ctx, x, y, radius, strength) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(0,0,0,${strength})`);
    gradient.addColorStop(0.52, `rgba(0,0,0,${strength * 0.82})`);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  drawGlows(game) {
    const ctx = this.glowCtx;
    ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    ctx.globalCompositeOperation = "lighter";

    const player = this.toScreen(game, game.player.x, game.player.y);
    this.paintGlow(ctx, player.x, player.y, 70 + game.player.shards * 2.5, COLORS.violet, 0.095);
    if (game.player.focusCharging) {
      const focus = getLaserFocus(game.player.chargingFocusId);
      const ratio = focus.chargeTime > 0 ? clamp(game.player.focusCharge / focus.chargeTime, 0, 1) : 0;
      const direction = game.player.facingVector || { x: 0, y: 1 };
      this.paintGlow(
        ctx,
        player.x + direction.x * 16,
        player.y + direction.y * 16,
        28 + ratio * 54,
        focus.color,
        0.12 + ratio * 0.34,
      );
    }

    for (const pickup of game.pickups) {
      if (pickup.collected || !this.onScreen(game, pickup.x, pickup.y, 100)) continue;
      const screen = this.toScreen(game, pickup.x, pickup.y);
      const color = pickup.kind === "half-heart" ? COLORS.heart : pickup.kind === "crystal-chunk" ? COLORS.amber : pickup.color || COLORS.cyan;
      const focusPickup = pickup.kind === "laser-focus";
      this.paintGlow(ctx, screen.x, screen.y, focusPickup ? 92 : pickup.kind === "crystal-chunk" ? 72 : 52, color, focusPickup ? 0.48 : 0.3);
    }

    for (const decoration of game.world.decorations || []) {
      if (!decoration.glow) continue;
      const worldX = decoration.worldX ?? decoration.x * TILE_SIZE + TILE_SIZE / 2;
      const worldY = decoration.worldY ?? decoration.y * TILE_SIZE + TILE_SIZE / 2;
      if (!this.onScreen(game, worldX, worldY, 80)) continue;
      const screen = this.toScreen(game, worldX, worldY);
      const color = NAMED_CRYSTAL_COLORS[decoration.color] || COLORS.violet;
      const scale = decoration.scale || 1;
      const radius = decoration.type === "crystal-cluster" ? 55 * scale : 34 * scale;
      this.paintGlow(ctx, screen.x, screen.y, radius, color, 0.08 + decoration.glow * 0.12);
    }

    if (game.door && this.onScreen(game, game.door.x, game.door.y, 120)) {
      const screen = this.toScreen(game, game.door.x, game.door.y);
      const activationRatio = clamp(game.door.progress / game.door.activationSeconds, 0, 1);
      this.paintGlow(
        ctx,
        screen.x,
        screen.y - 10,
        28 + activationRatio * 88,
        COLORS.violet,
        0.035 + activationRatio * 0.3,
      );
    }

    for (const projectile of game.projectiles) {
      const screen = this.toScreen(game, projectile.x, projectile.y);
      this.paintGlow(ctx, screen.x, screen.y, 42 + (projectile.beamWidth || 4) * 3, projectile.color || COLORS.cyan, 0.4);
    }

    ctx.globalCompositeOperation = "source-over";
    this.ctx.save();
    this.ctx.globalCompositeOperation = "lighter";
    this.ctx.drawImage(this.glowCanvas, 0, 0);
    this.ctx.restore();
  }

  paintGlow(ctx, x, y, radius, color, alpha) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, this.hexToRgba(color, alpha));
    gradient.addColorStop(0.35, this.hexToRgba(color, alpha * 0.45));
    gradient.addColorStop(1, this.hexToRgba(color, 0));
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  hexToRgba(hex, alpha) {
    const clean = hex.replace("#", "");
    const value = Number.parseInt(clean.length === 3 ? clean.split("").map((part) => part + part).join("") : clean, 16);
    return `rgba(${(value >> 16) & 255},${(value >> 8) & 255},${value & 255},${alpha})`;
  }

  drawEnemyEyes(game) {
    const { ctx } = this;
    const darkness = 1 - LEVEL_CONFIG[game.levelId].ambientLight;
    for (const enemy of game.enemies) {
      if (enemy.dead || !this.onScreen(game, enemy.x, enemy.y, 30)) continue;
      const screen = this.toScreen(game, enemy.x, enemy.y);
      const alpha = clamp(0.45 + darkness * 0.5, 0.55, 0.96);
      const color = enemy.state === "chase" ? COLORS.danger : COLORS.pink;
      if (this.atlasReady) {
        const layout = this.getEnemyAtlasLayout(game, enemy);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        for (const eye of layout.eyes) {
          const centerX = eye.x + eye.width / 2;
          const centerY = eye.y + eye.height / 2;
          ctx.globalAlpha = 1;
          this.paintGlow(ctx, centerX, centerY, enemy.type === "brute" ? 7 : 5, color, alpha * 0.34);
          ctx.globalAlpha = alpha;
          ctx.drawImage(
            this.gameplayAtlas,
            eye.sourceX,
            eye.sourceY,
            eye.sourceWidth,
            eye.sourceHeight,
            Math.round(eye.x),
            Math.round(eye.y),
            Math.max(1, Math.round(eye.width)),
            Math.max(1, Math.round(eye.height)),
          );
        }
        ctx.restore();
        continue;
      }
      const offsetX = Math.cos(enemy.facingAngle || 0) * 2;
      const offsetY = Math.sin(enemy.facingAngle || 0) * 2 - enemy.radius * 0.28;
      const eyeSpacing = enemy.type === "brute" ? 6 : 4;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(screen.x + offsetX - eyeSpacing), Math.round(screen.y + offsetY), enemy.type === "brute" ? 3 : 2, 2);
      ctx.fillRect(Math.round(screen.x + offsetX + eyeSpacing - 1), Math.round(screen.y + offsetY), enemy.type === "brute" ? 3 : 2, 2);
      ctx.restore();
    }
  }

  drawDamageFlash(game) {
    if (game.damageFlash <= 0) return;
    this.ctx.fillStyle = `rgba(255,35,94,${game.damageFlash * 0.22})`;
    this.ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  }

  getDoorBeaconState(game) {
    if (
      !game.door
      || !game.player
      || game.player.shards < RULES.shardGoal
      || this.onScreen(game, game.door.x, game.door.y, DOOR_BEACON_VISIBILITY_PADDING)
    ) {
      return null;
    }

    return getEdgeBeaconPosition(
      this.toScreen(game, game.player.x, game.player.y),
      this.toScreen(game, game.door.x, game.door.y),
    );
  }

  drawDoorBeacon(game) {
    const beacon = this.getDoorBeaconState(game);
    if (!beacon) return;

    const { ctx } = this;
    const pulse = game.reducedMotion ? 0 : Math.sin(game.time * 4.2);
    ctx.save();
    ctx.translate(beacon.x, beacon.y);
    ctx.globalCompositeOperation = "lighter";
    this.paintGlow(ctx, 0, 0, 27 + pulse * 2.5, COLORS.violet, 0.16 + pulse * 0.025);
    this.paintGlow(ctx, 0, 0, 11 + pulse, "#d983ff", 0.1 + pulse * 0.015);
    ctx.restore();
  }

  drawVignette(game) {
    const { ctx } = this;
    const level = LEVEL_CONFIG[game.levelId];
    const gradient = ctx.createRadialGradient(
      LOGICAL_WIDTH / 2,
      LOGICAL_HEIGHT / 2,
      LOGICAL_HEIGHT * 0.28,
      LOGICAL_WIDTH / 2,
      LOGICAL_HEIGHT / 2,
      LOGICAL_WIDTH * 0.67,
    );
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    const outerAlpha = game.levelId === 1 ? 0.34 : game.levelId === 2 ? 0.5 : 0.68;
    gradient.addColorStop(0.68, `rgba(1,1,8,${0.05 + (1 - level.ambientLight) * 0.05})`);
    gradient.addColorStop(1, `rgba(0,0,4,${outerAlpha})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  }
}

export default Renderer;
