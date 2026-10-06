/**
 * Frame-oriented keyboard and mouse-wheel input for Crystal Labyrinth.
 *
 * Call `endFrame()` after the game has read one frame's pressed/released
 * actions. Held actions remain active until their keys are released.
 */

export const INPUT_ACTIONS = Object.freeze({
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
  ACTION: "action",
  USE_ITEM: "useItem",
  FOCUS_MODIFIER: "focusModifier",
  PAUSE: "pause",
  SLOT_1: "slot1",
  SLOT_2: "slot2",
  SLOT_3: "slot3",
  SLOT_4: "slot4",
  SLOT_5: "slot5",
  SLOT_6: "slot6",
});

export const DEFAULT_INPUT_BINDINGS = Object.freeze({
  [INPUT_ACTIONS.UP]: Object.freeze(["KeyW", "ArrowUp"]),
  [INPUT_ACTIONS.DOWN]: Object.freeze(["KeyS", "ArrowDown"]),
  [INPUT_ACTIONS.LEFT]: Object.freeze(["KeyA", "ArrowLeft"]),
  [INPUT_ACTIONS.RIGHT]: Object.freeze(["KeyD", "ArrowRight"]),
  [INPUT_ACTIONS.ACTION]: Object.freeze(["Space"]),
  [INPUT_ACTIONS.USE_ITEM]: Object.freeze(["KeyF"]),
  [INPUT_ACTIONS.FOCUS_MODIFIER]: Object.freeze(["Tab"]),
  [INPUT_ACTIONS.PAUSE]: Object.freeze(["Escape"]),
  [INPUT_ACTIONS.SLOT_1]: Object.freeze(["Digit1", "Numpad1"]),
  [INPUT_ACTIONS.SLOT_2]: Object.freeze(["Digit2", "Numpad2"]),
  [INPUT_ACTIONS.SLOT_3]: Object.freeze(["Digit3", "Numpad3"]),
  [INPUT_ACTIONS.SLOT_4]: Object.freeze(["Digit4", "Numpad4"]),
  [INPUT_ACTIONS.SLOT_5]: Object.freeze(["Digit5", "Numpad5"]),
  [INPUT_ACTIONS.SLOT_6]: Object.freeze(["Digit6", "Numpad6"]),
});

const ACTION_ALIASES = Object.freeze({
  moveUp: INPUT_ACTIONS.UP,
  moveDown: INPUT_ACTIONS.DOWN,
  moveLeft: INPUT_ACTIONS.LEFT,
  moveRight: INPUT_ACTIONS.RIGHT,
  context: INPUT_ACTIONS.ACTION,
  interact: INPUT_ACTIONS.ACTION,
  fire: INPUT_ACTIONS.ACTION,
  item: INPUT_ACTIONS.USE_ITEM,
  use: INPUT_ACTIONS.USE_ITEM,
  focus: INPUT_ACTIONS.FOCUS_MODIFIER,
  escape: INPUT_ACTIONS.PAUSE,
});

const LEGACY_KEY_CODES = Object.freeze({
  w: "KeyW",
  W: "KeyW",
  a: "KeyA",
  A: "KeyA",
  s: "KeyS",
  S: "KeyS",
  d: "KeyD",
  D: "KeyD",
  f: "KeyF",
  F: "KeyF",
  Tab: "Tab",
  " ": "Space",
  Spacebar: "Space",
  ArrowUp: "ArrowUp",
  ArrowDown: "ArrowDown",
  ArrowLeft: "ArrowLeft",
  ArrowRight: "ArrowRight",
  Escape: "Escape",
  Esc: "Escape",
  "1": "Digit1",
  "2": "Digit2",
  "3": "Digit3",
  "4": "Digit4",
  "5": "Digit5",
  "6": "Digit6",
});

function isEditableTarget(target) {
  if (!target || typeof target !== "object") return false;
  if (target.isContentEditable) return true;

  const tagName = target.tagName?.toLowerCase();
  return tagName === "input" || tagName === "textarea" || tagName === "select";
}

function canonicalAction(action) {
  return ACTION_ALIASES[action] ?? action;
}

function eventCode(event) {
  return event.code || LEGACY_KEY_CODES[event.key] || event.key;
}

/**
 * Clean, dependency-free input state manager.
 *
 * Typical use:
 *   const input = new InputManager({ element: canvas });
 *   if (input.wasPressed("action")) interactOrFire();
 *   move(input.getMovement());
 *   input.endFrame();
 */
export class InputManager {
  constructor({
    element = null,
    keyboardTarget = typeof window !== "undefined" ? window : null,
    wheelTarget = null,
    blurTarget = typeof window !== "undefined" ? window : null,
    visibilityTarget = typeof document !== "undefined" ? document : null,
    bindings = DEFAULT_INPUT_BINDINGS,
    preventDefault = true,
    autoAttach = true,
  } = {}) {
    this.element = element;
    this.keyboardTarget = keyboardTarget;
    this.wheelTarget = wheelTarget ?? element ?? keyboardTarget;
    this.blurTarget = blurTarget ?? keyboardTarget;
    this.visibilityTarget = visibilityTarget;
    this.preventDefault = Boolean(preventDefault);

    this.enabled = true;
    this.attached = false;

    this._downCodes = new Set();
    this._held = new Set();
    this._pressed = new Set();
    this._released = new Set();
    this._slotSelections = [];
    this._focusSelections = [];
    this._wheelSteps = 0;
    this._codeToAction = new Map();
    this._actionToCodes = new Map();

    this._configureBindings(bindings);

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onWheel = this._onWheel.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._onVisibilityChange = this._onVisibilityChange.bind(this);
    this._wheelOptions = { passive: false };

    if (autoAttach) this.attach();
  }

  _configureBindings(bindings) {
    this._codeToAction.clear();
    this._actionToCodes.clear();

    for (const [rawAction, rawCodes] of Object.entries(bindings)) {
      const action = canonicalAction(rawAction);
      const codes = Array.isArray(rawCodes) ? rawCodes : [rawCodes];
      const validCodes = new Set(codes.filter(Boolean));
      this._actionToCodes.set(action, validCodes);

      for (const code of validCodes) {
        this._codeToAction.set(code, action);
      }
    }
  }

  attach() {
    if (this.attached) return this;

    this.keyboardTarget?.addEventListener?.("keydown", this._onKeyDown);
    this.keyboardTarget?.addEventListener?.("keyup", this._onKeyUp);
    this.wheelTarget?.addEventListener?.("wheel", this._onWheel, this._wheelOptions);
    this.blurTarget?.addEventListener?.("blur", this._onBlur);
    this.visibilityTarget?.addEventListener?.(
      "visibilitychange",
      this._onVisibilityChange,
    );

    this.attached = true;
    return this;
  }

  detach() {
    if (!this.attached) return this;

    this.keyboardTarget?.removeEventListener?.("keydown", this._onKeyDown);
    this.keyboardTarget?.removeEventListener?.("keyup", this._onKeyUp);
    this.wheelTarget?.removeEventListener?.("wheel", this._onWheel, this._wheelOptions);
    this.blurTarget?.removeEventListener?.("blur", this._onBlur);
    this.visibilityTarget?.removeEventListener?.(
      "visibilitychange",
      this._onVisibilityChange,
    );

    this.attached = false;
    this.reset();
    return this;
  }

  destroy() {
    this.detach();
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (!this.enabled) this.reset();
    return this;
  }

  isHeld(action) {
    return this._held.has(canonicalAction(action));
  }

  wasPressed(action) {
    return this._pressed.has(canonicalAction(action));
  }

  wasReleased(action) {
    return this._released.has(canonicalAction(action));
  }

  consumePressed(action) {
    return this._pressed.delete(canonicalAction(action));
  }

  consumeReleased(action) {
    return this._released.delete(canonicalAction(action));
  }

  /** Returns a normalized movement vector, preventing faster diagonals. */
  getMovement(normalize = true) {
    let x = Number(this.isHeld(INPUT_ACTIONS.RIGHT)) - Number(this.isHeld(INPUT_ACTIONS.LEFT));
    let y = Number(this.isHeld(INPUT_ACTIONS.DOWN)) - Number(this.isHeld(INPUT_ACTIONS.UP));

    if (normalize && x !== 0 && y !== 0) {
      x *= Math.SQRT1_2;
      y *= Math.SQRT1_2;
    }

    return { x, y };
  }

  /** Returns the next direct hotbar selection as a zero-based index. */
  consumeSlotSelection() {
    return this._slotSelections.length > 0 ? this._slotSelections.shift() : null;
  }

  peekSlotSelection() {
    return this._slotSelections[0] ?? null;
  }

  /** Returns the next Tab-modified Laser Focus selection as a zero-based index. */
  consumeFocusSelection() {
    return this._focusSelections.length > 0 ? this._focusSelections.shift() : null;
  }

  /**
   * Returns all accumulated wheel movement and clears it.
   * Negative means previous slot; positive means next slot.
   */
  consumeWheelDelta() {
    const delta = this._wheelSteps;
    this._wheelSteps = 0;
    return delta;
  }

  /** Returns a single -1/+1 wheel step, retaining any extra queued steps. */
  consumeWheelStep() {
    if (this._wheelSteps === 0) return 0;
    const step = Math.sign(this._wheelSteps);
    this._wheelSteps -= step;
    return step;
  }

  /** Convenience helper for direct-select and cycle commands. */
  consumeHotbarCommand() {
    const index = this.consumeSlotSelection();
    if (index !== null) return { type: "select", index };

    const direction = this.consumeWheelStep();
    return direction === 0 ? null : { type: "cycle", direction };
  }

  /** Clears one-frame transitions. Call once after the simulation frame. */
  endFrame() {
    this._pressed.clear();
    this._released.clear();
    this._slotSelections.length = 0;
    this._focusSelections.length = 0;
    this._wheelSteps = 0;
  }

  /** Clears every state, preventing stuck movement after blur or pause. */
  reset({ emitReleases = false } = {}) {
    if (emitReleases) {
      for (const action of this._held) this._released.add(action);
    } else {
      this._released.clear();
    }

    this._downCodes.clear();
    this._held.clear();
    this._pressed.clear();
    this._slotSelections.length = 0;
    this._focusSelections.length = 0;
    this._wheelSteps = 0;
  }

  get heldActions() {
    return new Set(this._held);
  }

  get pressedActions() {
    return new Set(this._pressed);
  }

  get releasedActions() {
    return new Set(this._released);
  }

  _shouldIgnoreKeyboardEvent(event) {
    return (
      !this.enabled ||
      event.isComposing ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      isEditableTarget(event.target)
    );
  }

  _preventControlDefault(event) {
    if (this.preventDefault && event.cancelable) event.preventDefault();
  }

  _onKeyDown(event) {
    if (this._shouldIgnoreKeyboardEvent(event)) return;

    const code = eventCode(event);
    const action = this._codeToAction.get(code);
    if (!action) return;

    // Only known game controls are cancelled; browser shortcuts and typing pass through.
    this._preventControlDefault(event);
    // State changes intentionally reset input. Ignore the browser's synthetic
    // key-repeat events until the physical key is released so a held Escape
    // cannot pause and immediately resume on the next repeat tick.
    if (event.repeat) return;
    if (this._downCodes.has(code)) return;

    const actionWasHeld = this._held.has(action);
    this._downCodes.add(code);
    this._held.add(action);

    if (!actionWasHeld) {
      this._pressed.add(action);

      if (/^slot[1-6]$/.test(action)) {
        const slotIndex = Number(action.slice(-1)) - 1;
        if (this.isHeld(INPUT_ACTIONS.FOCUS_MODIFIER)) this._focusSelections.push(slotIndex);
        else this._slotSelections.push(slotIndex);
      }
    }
  }

  _onKeyUp(event) {
    const code = eventCode(event);
    const action = this._codeToAction.get(code);
    if (!action || !this._downCodes.has(code)) return;

    if (!isEditableTarget(event.target) && !event.ctrlKey && !event.metaKey && !event.altKey) {
      this._preventControlDefault(event);
    }

    this._downCodes.delete(code);
    const boundCodes = this._actionToCodes.get(action) ?? [];
    const anotherBindingIsDown = [...boundCodes].some((boundCode) =>
      this._downCodes.has(boundCode),
    );

    if (!anotherBindingIsDown) {
      this._held.delete(action);
      this._released.add(action);
    }
  }

  _onWheel(event) {
    if (
      !this.enabled ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      isEditableTarget(event.target)
    ) {
      return;
    }

    const rawDelta = event.deltaY !== 0 ? event.deltaY : event.deltaX;
    if (rawDelta === 0) return;

    this._preventControlDefault(event);
    this._wheelSteps = Math.max(-6, Math.min(6, this._wheelSteps + Math.sign(rawDelta)));
  }

  _onBlur() {
    this.reset();
  }

  _onVisibilityChange() {
    if (this.visibilityTarget?.hidden) this.reset();
  }
}

export default InputManager;
