"use strict";

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const wait = milliseconds => new Promise(resolve => window.setTimeout(resolve, milliseconds));

const BALANCE_KEY = "afterdark-play-balance";
const STARTING_BALANCE = 1000;

function loadBalance() {
  try {
    const storedValue = localStorage.getItem(BALANCE_KEY);
    if (storedValue === null) return STARTING_BALANCE;
    const saved = Number(storedValue);
    return Number.isFinite(saved) && saved >= 0 ? saved : STARTING_BALANCE;
  } catch {
    return STARTING_BALANCE;
  }
}

let balance = loadBalance();
let toastTimer = null;
let audioContext = null;

function formatCredits(value, decimals = false) {
  return Number(value).toLocaleString("en-CA", {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: 2
  });
}

function setBalance(value) {
  balance = Math.max(0, Math.round(value * 100) / 100);
  $("#balance").textContent = formatCredits(balance, balance % 1 !== 0);
  try {
    localStorage.setItem(BALANCE_KEY, String(balance));
  } catch {
    // The game still works when browser storage is unavailable.
  }
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2300);
}

function tone(frequency, duration = 0.06, type = "sine", volume = 0.025) {
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  } catch {
    // Sound is an enhancement; gameplay does not depend on it.
  }
}

// Shared game navigation
$$('.game-tab').forEach(tab => {
  tab.addEventListener("click", () => {
    $$('.game-tab').forEach(item => item.classList.toggle("active", item === tab));
    $$('.game-view').forEach(view => {
      const selected = view.id === tab.dataset.game;
      view.hidden = !selected;
      view.classList.toggle("active", selected);
    });
    if (tab.dataset.game === "crash") drawCrashScene(0);
  });
});

function anyRoundActive() {
  return blackjack.phase === "player" || blackjack.phase === "dealer" || poker.phase === "decision" || poker.phase === "revealing" || crash.running;
}

$("#resetBalance").addEventListener("click", () => {
  if (anyRoundActive()) {
    showToast("Finish the current round before resetting credits.");
    return;
  }
  setBalance(STARTING_BALANCE);
  showToast("Play balance reset to 1,000 credits.");
  tone(460);
});

// Card and deck helpers
const SUITS = [
  { symbol: "♠", name: "spades", red: false },
  { symbol: "♥", name: "hearts", red: true },
  { symbol: "♦", name: "diamonds", red: true },
  { symbol: "♣", name: "clubs", red: false }
];

const RANKS = [
  { label: "2", value: 2 }, { label: "3", value: 3 },
  { label: "4", value: 4 }, { label: "5", value: 5 },
  { label: "6", value: 6 }, { label: "7", value: 7 },
  { label: "8", value: 8 }, { label: "9", value: 9 },
  { label: "10", value: 10 }, { label: "J", value: 11 },
  { label: "Q", value: 12 }, { label: "K", value: 13 },
  { label: "A", value: 14 }
];

function createDeck() {
  const deck = [];
  SUITS.forEach(suit => RANKS.forEach(rank => deck.push({ suit, ...rank })));
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [deck[index], deck[randomIndex]] = [deck[randomIndex], deck[index]];
  }
  return deck;
}

function createCardElement(card, hidden = false) {
  const element = document.createElement("div");
  element.className = hidden ? "card back" : `card${card.suit.red ? " red" : ""}`;
  if (hidden) {
    element.setAttribute("aria-label", "Hidden card");
    return element;
  }

  element.setAttribute("aria-label", `${card.label} of ${card.suit.name}`);
  element.innerHTML = `
    <span class="card-corner">${card.label}<small>${card.suit.symbol}</small></span>
    <span class="card-suit" aria-hidden="true">${card.suit.symbol}</span>
  `;
  return element;
}

function renderCards(container, cards, hiddenIndexes = []) {
  container.replaceChildren();
  cards.forEach((card, index) => container.append(createCardElement(card, hiddenIndexes.includes(index))));
}

function renderCardBacks(container, count) {
  container.replaceChildren();
  for (let index = 0; index < count; index += 1) {
    container.append(createCardElement(null, true));
  }
}

function setMessage(element, text, outcome = "") {
  element.textContent = text;
  element.classList.remove("win", "lose");
  if (outcome) element.classList.add(outcome);
}

function configureBetChips(groupName, locked) {
  $$(`[data-bet-group="${groupName}"] .chip`).forEach(chip => {
    chip.disabled = locked;
  });
}

$$('.chip-row').forEach(group => {
  group.addEventListener("click", event => {
    const chip = event.target.closest(".chip");
    if (!chip || chip.disabled) return;
    group.querySelectorAll(".chip").forEach(item => item.classList.toggle("active", item === chip));
    const value = Number(chip.dataset.value);
    if (group.dataset.betGroup === "blackjack") {
      blackjack.bet = value;
      $("#blackjackBet").textContent = formatCredits(value);
    } else {
      poker.bet = value;
      $("#pokerBet").textContent = formatCredits(value);
    }
    tone(380, 0.035, "square", 0.015);
  });
});

// Blackjack
const blackjack = {
  deck: [],
  player: [],
  dealer: [],
  bet: 25,
  activeBet: 0,
  phase: "betting"
};

function blackjackValue(hand) {
  let value = hand.reduce((total, card) => total + (card.value === 14 ? 1 : Math.min(card.value, 10)), 0);
  let aces = hand.filter(card => card.value === 14).length;
  while (aces > 0 && value + 10 <= 21) {
    value += 10;
    aces -= 1;
  }
  return value;
}

function isBlackjack(hand) {
  return hand.length === 2 && blackjackValue(hand) === 21;
}

function updateBlackjackTable(hideDealer = blackjack.phase === "player") {
  renderCards($("#playerCards"), blackjack.player);
  renderCards($("#dealerCards"), blackjack.dealer, hideDealer ? [1] : []);
  $("#playerScore").textContent = blackjack.player.length ? blackjackValue(blackjack.player) : "—";
  $("#dealerScore").textContent = blackjack.dealer.length
    ? (hideDealer ? blackjackValue([blackjack.dealer[0]]) : blackjackValue(blackjack.dealer))
    : "—";
}

function setBlackjackControls(phase) {
  const playerTurn = phase === "player";
  $("#blackjackDeal").disabled = phase === "player" || phase === "dealer";
  $("#blackjackDeal").textContent = phase === "over" ? "Deal again" : "Deal cards";
  $("#blackjackHit").disabled = !playerTurn;
  $("#blackjackStand").disabled = !playerTurn;
  $("#blackjackDouble").disabled = !playerTurn || blackjack.player.length !== 2 || balance < blackjack.activeBet;
  configureBetChips("blackjack", playerTurn || phase === "dealer");
}

function startBlackjack() {
  if (blackjack.phase === "player" || blackjack.phase === "dealer") return;
  if (balance < blackjack.bet) {
    showToast("Not enough credits for that bet.");
    return;
  }

  setBalance(balance - blackjack.bet);
  blackjack.deck = createDeck();
  blackjack.player = [blackjack.deck.pop(), blackjack.deck.pop()];
  blackjack.dealer = [blackjack.deck.pop(), blackjack.deck.pop()];
  blackjack.activeBet = blackjack.bet;
  blackjack.phase = "player";
  setMessage($("#blackjackMessage"), "Your move — hit or stand");
  updateBlackjackTable(true);
  setBlackjackControls("player");
  tone(290, 0.045, "square", 0.018);

  const playerNatural = isBlackjack(blackjack.player);
  const dealerNatural = isBlackjack(blackjack.dealer);
  if (playerNatural || dealerNatural) {
    blackjack.phase = "dealer";
    setBlackjackControls("dealer");
    setMessage($("#blackjackMessage"), "Checking for blackjack…");
    window.setTimeout(() => settleBlackjackNatural(playerNatural, dealerNatural), 650);
  }
}

function settleBlackjackNatural(playerNatural, dealerNatural) {
  if (blackjack.phase !== "dealer") return;
  updateBlackjackTable(false);
  if (playerNatural && dealerNatural) {
    setBalance(balance + blackjack.activeBet);
    finishBlackjack("Both have blackjack — push");
  } else if (playerNatural) {
    const payout = blackjack.activeBet * 2.5;
    setBalance(balance + payout);
    finishBlackjack(`Blackjack! You win ${formatCredits(payout - blackjack.activeBet, true)} credits`, "win");
  } else {
    finishBlackjack("Dealer has blackjack", "lose");
  }
}

function hitBlackjack() {
  if (blackjack.phase !== "player") return;
  blackjack.player.push(blackjack.deck.pop());
  updateBlackjackTable(true);
  tone(330, 0.04, "square", 0.015);
  const value = blackjackValue(blackjack.player);
  $("#blackjackDouble").disabled = true;
  if (value > 21) {
    finishBlackjack(`Bust with ${value} — dealer wins`, "lose", false);
  } else if (value === 21) {
    standBlackjack();
  }
}

async function standBlackjack() {
  if (blackjack.phase !== "player") return;
  blackjack.phase = "dealer";
  setBlackjackControls("dealer");
  setMessage($("#blackjackMessage"), "Dealer is playing…");
  updateBlackjackTable(false);
  await wait(450);

  while (blackjackValue(blackjack.dealer) < 17) {
    blackjack.dealer.push(blackjack.deck.pop());
    updateBlackjackTable(false);
    tone(250, 0.035, "square", 0.012);
    await wait(430);
  }
  compareBlackjackHands();
}

function doubleBlackjack() {
  if (blackjack.phase !== "player" || blackjack.player.length !== 2) return;
  if (balance < blackjack.activeBet) {
    showToast("You need enough credits to match the original bet.");
    return;
  }
  setBalance(balance - blackjack.activeBet);
  blackjack.activeBet *= 2;
  blackjack.player.push(blackjack.deck.pop());
  updateBlackjackTable(true);
  tone(420, 0.05, "square", 0.02);
  if (blackjackValue(blackjack.player) > 21) {
    finishBlackjack(`Double-down bust with ${blackjackValue(blackjack.player)}`, "lose", false);
  } else {
    standBlackjack();
  }
}

function compareBlackjackHands() {
  const playerValue = blackjackValue(blackjack.player);
  const dealerValue = blackjackValue(blackjack.dealer);
  if (dealerValue > 21) {
    setBalance(balance + blackjack.activeBet * 2);
    finishBlackjack(`Dealer busts with ${dealerValue} — you win!`, "win");
  } else if (playerValue > dealerValue) {
    setBalance(balance + blackjack.activeBet * 2);
    finishBlackjack(`${playerValue} beats ${dealerValue} — you win!`, "win");
  } else if (playerValue === dealerValue) {
    setBalance(balance + blackjack.activeBet);
    finishBlackjack(`Push at ${playerValue} — bet returned`);
  } else {
    finishBlackjack(`Dealer wins, ${dealerValue} to ${playerValue}`, "lose");
  }
}

function finishBlackjack(message, outcome = "", revealDealer = true) {
  blackjack.phase = "over";
  if (revealDealer) updateBlackjackTable(false);
  setMessage($("#blackjackMessage"), message, outcome);
  setBlackjackControls("over");
  tone(outcome === "win" ? 580 : outcome === "lose" ? 150 : 310, 0.1, outcome === "lose" ? "sawtooth" : "sine", 0.025);
}

$("#blackjackDeal").addEventListener("click", startBlackjack);
$("#blackjackHit").addEventListener("click", hitBlackjack);
$("#blackjackStand").addEventListener("click", standBlackjack);
$("#blackjackDouble").addEventListener("click", doubleBlackjack);

// Three Card Poker
const poker = {
  deck: [],
  player: [],
  dealer: [],
  bet: 25,
  phase: "betting"
};

function evaluatePokerHand(hand) {
  const values = hand.map(card => card.value).sort((a, b) => b - a);
  const unique = [...new Set(values)];
  const flush = hand.every(card => card.suit.name === hand[0].suit.name);
  const wheel = values.join(",") === "14,3,2";
  const straight = unique.length === 3 && (values[0] - values[2] === 2 || wheel);
  const straightHigh = wheel ? 3 : values[0];
  const counts = values.reduce((map, value) => map.set(value, (map.get(value) || 0) + 1), new Map());
  const miniRoyal = flush && values.join(",") === "14,13,12";

  if (miniRoyal) return { category: 6, name: "Mini Royal", tie: [14], bonus: 5 };
  if (straight && flush) return { category: 5, name: "Straight Flush", tie: [straightHigh], bonus: 5 };

  const trips = [...counts.entries()].find(([, count]) => count === 3);
  if (trips) return { category: 4, name: "Three of a Kind", tie: [trips[0]], bonus: 4 };
  if (straight) return { category: 3, name: "Straight", tie: [straightHigh], bonus: 1 };
  if (flush) return { category: 2, name: "Flush", tie: values, bonus: 0 };

  const pair = [...counts.entries()].find(([, count]) => count === 2);
  if (pair) {
    const kicker = values.find(value => value !== pair[0]);
    return { category: 1, name: "Pair", tie: [pair[0], kicker], bonus: 0 };
  }
  return { category: 0, name: `${RANKS.find(rank => rank.value === values[0]).label}-High`, tie: values, bonus: 0 };
}

function comparePokerHands(playerRank, dealerRank) {
  if (playerRank.category !== dealerRank.category) return Math.sign(playerRank.category - dealerRank.category);
  const length = Math.max(playerRank.tie.length, dealerRank.tie.length);
  for (let index = 0; index < length; index += 1) {
    const difference = (playerRank.tie[index] || 0) - (dealerRank.tie[index] || 0);
    if (difference !== 0) return Math.sign(difference);
  }
  return 0;
}

function dealerQualifies(rank) {
  return rank.category > 0 || rank.tie[0] >= 12;
}

function setPokerControls(phase) {
  const decision = phase === "decision";
  const locked = decision || phase === "revealing";
  $("#pokerDeal").disabled = locked;
  $("#pokerDeal").textContent = phase === "over" ? "Deal again" : "Deal hand";
  $("#pokerPlay").disabled = !decision || balance < poker.bet;
  $("#pokerFold").disabled = !decision;
  configureBetChips("poker", locked);
}

function startPoker() {
  if (poker.phase === "decision") return;
  if (balance < poker.bet) {
    showToast("Not enough credits for that ante.");
    return;
  }
  setBalance(balance - poker.bet);
  poker.deck = createDeck();
  poker.player = [poker.deck.pop(), poker.deck.pop(), poker.deck.pop()];
  poker.dealer = [poker.deck.pop(), poker.deck.pop(), poker.deck.pop()];
  poker.phase = "decision";
  renderCards($("#pokerPlayerCards"), poker.player);
  renderCards($("#pokerDealerCards"), poker.dealer, [0, 1, 2]);
  const rank = evaluatePokerHand(poker.player);
  $("#pokerPlayerRank").textContent = rank.name;
  $("#pokerDealerRank").textContent = "Hidden";
  setMessage($("#pokerMessage"), "Play for one more ante, or fold");
  setPokerControls("decision");
  tone(310, 0.05, "square", 0.018);
}

async function playPoker() {
  if (poker.phase !== "decision") return;
  if (balance < poker.bet) {
    showToast("You need one more ante to play this hand.");
    return;
  }
  setBalance(balance - poker.bet);
  poker.phase = "revealing";
  setPokerControls("revealing");
  setMessage($("#pokerMessage"), "Dealer reveals…");
  await wait(280);
  renderCards($("#pokerDealerCards"), poker.dealer);

  const playerRank = evaluatePokerHand(poker.player);
  const dealerRank = evaluatePokerHand(poker.dealer);
  $("#pokerDealerRank").textContent = dealerRank.name;
  const comparison = comparePokerHands(playerRank, dealerRank);
  const qualifies = dealerQualifies(dealerRank);
  const bonusProfit = poker.bet * playerRank.bonus;
  let payout = bonusProfit;
  let message;
  let outcome = "";

  if (!qualifies) {
    payout += poker.bet * 3;
    message = `Dealer doesn't qualify — ante wins${bonusProfit ? ` + ${formatCredits(bonusProfit)} bonus` : ""}`;
    outcome = "win";
  } else if (comparison > 0) {
    payout += poker.bet * 4;
    message = `${playerRank.name} beats ${dealerRank.name} — you win!`;
    outcome = "win";
  } else if (comparison === 0) {
    payout += poker.bet * 2;
    message = "Exact tie — both bets returned";
  } else {
    message = `${dealerRank.name} beats ${playerRank.name}`;
    outcome = "lose";
  }

  if (payout > 0) setBalance(balance + payout);
  finishPoker(message, outcome);
}

function foldPoker() {
  if (poker.phase !== "decision") return;
  renderCards($("#pokerDealerCards"), poker.dealer);
  $("#pokerDealerRank").textContent = evaluatePokerHand(poker.dealer).name;
  finishPoker("Hand folded — ante forfeited", "lose");
}

function finishPoker(message, outcome = "") {
  poker.phase = "over";
  setMessage($("#pokerMessage"), message, outcome);
  setPokerControls("over");
  tone(outcome === "win" ? 610 : outcome === "lose" ? 155 : 330, 0.1, outcome === "lose" ? "sawtooth" : "sine", 0.025);
}

$("#pokerDeal").addEventListener("click", startPoker);
$("#pokerPlay").addEventListener("click", playPoker);
$("#pokerFold").addEventListener("click", foldPoker);

// Crash / Rocket Run
const crashCanvas = $("#crashCanvas");
const crashContext = crashCanvas.getContext("2d");
const crashStage = $(".crash-stage");
const rocketElement = $("#rocket");
const crash = {
  running: false,
  cashedOut: false,
  startTime: 0,
  crashPoint: 1,
  multiplier: 1,
  bet: 25,
  cashoutAt: 0,
  animationFrame: null,
  progress: 0
};

const stars = Array.from({ length: 65 }, (_, index) => ({
  x: (index * 137.7) % crashCanvas.width,
  y: (index * 83.3) % crashCanvas.height,
  radius: 0.4 + (index % 4) * 0.28,
  alpha: 0.12 + (index % 5) * 0.055
}));

function generateCrashPoint() {
  if (Math.random() < 0.035) return 1;
  const point = 0.97 / (1 - Math.random());
  return Math.min(20, Math.max(1.01, Math.floor(point * 100) / 100));
}

function crashClass(value) {
  if (value < 2) return "low";
  if (value < 5) return "mid";
  return "high";
}

function addCrashHistory(value) {
  const item = document.createElement("span");
  item.className = crashClass(value);
  item.textContent = `${value.toFixed(2)}×`;
  const history = $("#crashHistory");
  history.prepend(item);
  while (history.children.length > 8) history.lastElementChild.remove();
}

function flightPosition(progress) {
  const x = 78 + progress * 650;
  const y = 425 - Math.pow(progress, 1.45) * 330;
  return { x, y };
}

function drawCrashScene(progress = crash.progress) {
  const context = crashContext;
  const width = crashCanvas.width;
  const height = crashCanvas.height;
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#090e16";
  context.fillRect(0, 0, width, height);

  const glow = context.createRadialGradient(width * 0.25, height * 0.8, 0, width * 0.25, height * 0.8, width * 0.65);
  glow.addColorStop(0, "rgba(49, 70, 91, 0.22)");
  glow.addColorStop(1, "rgba(9, 14, 22, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  stars.forEach(star => {
    context.beginPath();
    context.fillStyle = `rgba(183, 202, 218, ${star.alpha})`;
    context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    context.fill();
  });

  context.strokeStyle = "rgba(113, 137, 162, 0.08)";
  context.lineWidth = 1;
  for (let x = 75; x < width; x += 110) {
    context.beginPath();
    context.moveTo(x, 45);
    context.lineTo(x, height - 58);
    context.stroke();
  }
  for (let y = 57; y < height - 40; y += 82) {
    context.beginPath();
    context.moveTo(58, y);
    context.lineTo(width - 40, y);
    context.stroke();
  }

  context.fillStyle = "rgba(144, 161, 178, 0.28)";
  context.font = "10px Consolas";
  context.fillText("1.00×", 18, height - 52);
  context.fillText("FLIGHT PATH", width - 112, height - 22);

  if (progress > 0) {
    const end = flightPosition(progress);
    context.beginPath();
    for (let step = 0; step <= 80; step += 1) {
      const pointProgress = progress * (step / 80);
      const point = flightPosition(pointProgress);
      if (step === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    }
    context.strokeStyle = crash.cashedOut ? "rgba(72, 213, 151, 0.7)" : "rgba(231, 195, 106, 0.72)";
    context.lineWidth = 3;
    context.shadowColor = crash.cashedOut ? "#48d597" : "#e7c36a";
    context.shadowBlur = 12;
    context.stroke();
    context.shadowBlur = 0;

    const leftPercent = end.x / width * 100;
    const topPercent = end.y / height * 100;
    rocketElement.style.left = `${leftPercent}%`;
    rocketElement.style.top = `${topPercent}%`;
    rocketElement.style.bottom = "auto";
  }
}

function validateCrashBet() {
  const input = $("#crashBet");
  let value = Math.floor(Number(input.value));
  if (!Number.isFinite(value)) value = 1;
  value = Math.max(1, Math.min(value, Math.max(1, Math.floor(balance))));
  input.value = String(value);
  crash.bet = value;
  if (!crash.running) {
    $("#possibleWin").textContent = formatCredits(value, true);
    $("#cashoutValue").textContent = `◈ ${formatCredits(value, true)}`;
  }
  return value;
}

function setCrashInputsDisabled(disabled) {
  $("#crashBet").disabled = disabled;
  $$('[data-crash-bet]').forEach(button => { button.disabled = disabled; });
}

function launchCrash() {
  if (crash.running) return;
  const bet = validateCrashBet();
  if (balance < bet) {
    showToast("Not enough credits for that flight stake.");
    return;
  }

  setBalance(balance - bet);
  crash.running = true;
  crash.cashedOut = false;
  crash.startTime = performance.now();
  crash.crashPoint = generateCrashPoint();
  crash.multiplier = 1;
  crash.cashoutAt = 0;
  crash.progress = 0.001;
  crashStage.classList.remove("crashed", "cashed");
  $("#crashFlash").classList.remove("show");
  rocketElement.classList.add("flying");
  $("#launchButton").disabled = true;
  $("#cashoutButton").disabled = false;
  setCrashInputsDisabled(true);
  $("#crashStatusText").textContent = "ROCKET IN FLIGHT";
  $("#crashSubtext").textContent = "Cash out before it flies away";
  tone(210, 0.12, "sawtooth", 0.02);
  crash.animationFrame = requestAnimationFrame(updateCrash);
}

function updateCrash(timestamp) {
  if (!crash.running) return;
  const elapsed = timestamp - crash.startTime;
  crash.multiplier = Math.exp(elapsed / 5500);

  if (crash.multiplier >= crash.crashPoint) {
    crash.multiplier = crash.crashPoint;
    finishCrash();
    return;
  }

  crash.progress = Math.min(0.98, elapsed / 17000);
  $("#multiplier").innerHTML = `${crash.multiplier.toFixed(2)}<span>×</span>`;
  const liveReturn = crash.bet * crash.multiplier;
  if (!crash.cashedOut) {
    $("#possibleWin").textContent = formatCredits(liveReturn, true);
    $("#cashoutValue").textContent = `◈ ${formatCredits(liveReturn, true)}`;
  }
  drawCrashScene(crash.progress);
  crash.animationFrame = requestAnimationFrame(updateCrash);
}

function cashOutCrash() {
  if (!crash.running || crash.cashedOut) return;
  crash.cashedOut = true;
  crash.cashoutAt = Math.floor(crash.multiplier * 100) / 100;
  const payout = Math.round(crash.bet * crash.cashoutAt * 100) / 100;
  setBalance(balance + payout);
  $("#cashoutButton").disabled = true;
  crashStage.classList.add("cashed");
  $("#crashStatusText").textContent = `CASHED OUT — +${formatCredits(payout - crash.bet, true)}`;
  $("#crashSubtext").textContent = `Safe at ${crash.cashoutAt.toFixed(2)}× — watching the flight finish`;
  $("#possibleWin").textContent = formatCredits(payout, true);
  tone(720, 0.11, "sine", 0.035);
  window.setTimeout(() => tone(920, 0.11, "sine", 0.025), 80);
}

function finishCrash() {
  crash.running = false;
  cancelAnimationFrame(crash.animationFrame);
  addCrashHistory(crash.crashPoint);
  rocketElement.classList.remove("flying");
  $("#cashoutButton").disabled = true;
  setCrashInputsDisabled(false);
  $("#multiplier").innerHTML = `${crash.crashPoint.toFixed(2)}<span>×</span>`;

  if (crash.cashedOut) {
    crashStage.classList.add("cashed");
    $("#crashStatusText").textContent = `SAFE AT ${crash.cashoutAt.toFixed(2)}×`;
    $("#crashSubtext").textContent = `The rocket flew away at ${crash.crashPoint.toFixed(2)}×`;
  } else {
    crashStage.classList.add("crashed");
    $("#crashStatusText").textContent = "ROCKET FLEW AWAY";
    $("#crashSubtext").textContent = "You waited too long — try another flight";
    $("#crashFlash").classList.remove("show");
    void $("#crashFlash").offsetWidth;
    $("#crashFlash").classList.add("show");
    tone(105, 0.25, "sawtooth", 0.035);
  }

  window.setTimeout(() => {
    $("#launchButton").disabled = false;
    validateCrashBet();
  }, 720);
}

$("#launchButton").addEventListener("click", launchCrash);
$("#cashoutButton").addEventListener("click", cashOutCrash);
$("#crashBet").addEventListener("input", () => {
  const raw = Number($("#crashBet").value);
  if (Number.isFinite(raw) && raw > 0) {
    $("#possibleWin").textContent = formatCredits(raw, true);
  }
});
$("#crashBet").addEventListener("blur", validateCrashBet);
$$('[data-crash-bet]').forEach(button => {
  button.addEventListener("click", () => {
    $("#crashBet").value = button.dataset.crashBet === "max"
      ? String(Math.max(1, Math.floor(balance)))
      : button.dataset.crashBet;
    validateCrashBet();
    tone(380, 0.035, "square", 0.015);
  });
});

// Rules dialog
const RULES = {
  blackjack: {
    title: "Blackjack",
    content: `
      <ol>
        <li>Choose a bet and deal two cards. The goal is to get closer to <strong>21</strong> than the dealer without going over.</li>
        <li><strong>Hit</strong> takes another card. <strong>Stand</strong> ends your turn. <strong>Double</strong> matches your bet, deals one final card, and stands.</li>
        <li>The dealer draws to 16 and stands on 17. A regular win pays 1:1; a natural two-card blackjack pays <strong>3:2</strong>.</li>
      </ol>`
  },
  poker: {
    title: "Three Card Poker",
    content: `
      <ol>
        <li>Place an ante to receive three cards. Choose <strong>Play</strong> to match your ante or <strong>Fold</strong> to surrender it.</li>
        <li>The dealer needs queen-high or better to qualify. If they do not qualify, your ante wins and the play bet is returned.</li>
        <li>Hands rank: mini royal, straight flush, three of a kind, straight, flush, pair, then high card. Straights or better also receive an <strong>ante bonus</strong>.</li>
      </ol>`
  },
  crash: {
    title: "Rocket Run",
    content: `
      <ol>
        <li>Choose a flight stake and launch. The return rises with the live multiplier.</li>
        <li>Press <strong>Cash out</strong> at any time to lock in your stake multiplied by the number shown.</li>
        <li>If the rocket flies away before you cash out, the flight stake is lost. Every round has a hidden, randomly generated fly-away point.</li>
      </ol>`
  }
};

const rulesDialog = $("#rulesDialog");
$$('[data-rules]').forEach(button => {
  button.addEventListener("click", () => {
    const rules = RULES[button.dataset.rules];
    $("#rulesTitle").textContent = rules.title;
    $("#rulesContent").innerHTML = rules.content;
    rulesDialog.showModal();
  });
});

function closeRules() {
  rulesDialog.close();
}

$("#closeRules").addEventListener("click", closeRules);
$("#gotItButton").addEventListener("click", closeRules);
rulesDialog.addEventListener("click", event => {
  if (event.target === rulesDialog) closeRules();
});

// Initial presentation
setBalance(balance);
renderCardBacks($("#dealerCards"), 2);
renderCardBacks($("#playerCards"), 2);
renderCardBacks($("#pokerDealerCards"), 3);
renderCardBacks($("#pokerPlayerCards"), 3);
setBlackjackControls("betting");
setPokerControls("betting");
drawCrashScene(0);
