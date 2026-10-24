// Landing page: lights-out game, track cars, scroll effects and the Labs panel.
// Needs common.js loaded first.

// ============ F1 car artwork (injected so the wheels can spin) ============
const CAR_SVG = `
<g class="body">
  <path d="M6 14 h26 v6 h-20 v20 h-6 z" fill="#0E0E0E"/>
  <path d="M22 46 L22 32 L58 24 L92 24 L104 30 L150 34 L198 41 L206 47 Z" fill="var(--car-body, #C2080E)" stroke="#0E0E0E" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M58 33 L140 37 L140 43 L58 43 Z" fill="#0E0E0E" opacity=".85"/>
  <text x="74" y="42" font-family="Anton, sans-serif" font-size="11" fill="#fff">B1</text>
  <circle cx="106" cy="25" r="7" fill="#fff" stroke="#0E0E0E" stroke-width="2"/>
  <path d="M102 23 h9" stroke="#0E0E0E" stroke-width="3" stroke-linecap="round"/>
  <path d="M92 26 Q106 10 124 28" fill="none" stroke="#0E0E0E" stroke-width="4" stroke-linecap="round"/>
  <rect x="24" y="46" width="172" height="4" fill="#0E0E0E"/>
  <path d="M178 46 h38 v5 h-38 z M210 38 h6 v13 h-6 z" fill="#0E0E0E"/>
  <g class="wheel"><circle cx="48" cy="46" r="15" fill="#0E0E0E"/><circle cx="48" cy="46" r="6" fill="#555"/><path d="M48 33 V59 M35 46 H61" stroke="#333" stroke-width="2"/></g>
  <g class="wheel"><circle cx="170" cy="48" r="13" fill="#0E0E0E"/><circle cx="170" cy="48" r="5" fill="#555"/><path d="M170 37 V59 M159 48 H181" stroke="#333" stroke-width="2"/></g>
</g>`;
$$(".car-art").forEach((svg) => (svg.innerHTML = CAR_SVG));

// ============ labs (experimental features for client review) ============
const SHOW_LABS = true; // false hides the panel; features then use their defaults
const LABS = [
  { id: "scrollCar", name: "Scroll-progress car", desc: "A mini F1 car at the bottom of the screen drives as you scroll.", on: true },
  { id: "rival", name: "Race a rival", desc: "A white rival car launches on green. Your car only goes when you tap.", on: false },
  { id: "sound", name: "Engine sounds", desc: "Beeps for each light and an engine roar on launch.", on: false },
  { id: "share", name: "Share your time", desc: "Adds a share button after each run.", on: true },
  { id: "parallax", name: "Photo parallax", desc: "The About photo drifts slightly as you scroll (desktop).", on: true },
];
const LABS_KEY = "burginos-labs";
const labState = Object.fromEntries(LABS.map((l) => [l.id, l.on]));
if (SHOW_LABS) {
  try { Object.assign(labState, JSON.parse(localStorage.getItem(LABS_KEY)) || {}); } catch (_) {}
}
const lab = (id) => !!labState[id];

function applyLabs() {
  LABS.forEach((l) => document.body.classList.toggle(`lab-${l.id}`, lab(l.id)));
}
applyLabs();

const labsEl = $("#labs");
if (!SHOW_LABS) {
  labsEl.remove();
} else {
  const labsBtn = $("#labsBtn");
  const labsPanel = $("#labsPanel");
  $("#labsList").innerHTML = LABS.map((l) => `
    <label class="lab-row">
      <input type="checkbox" data-lab="${l.id}" ${lab(l.id) ? "checked" : ""} />
      <span><b>${l.name}</b><small>${l.desc}</small></span>
    </label>`).join("");
  labsBtn.addEventListener("click", () => {
    labsPanel.hidden = !labsPanel.hidden;
    labsBtn.setAttribute("aria-expanded", !labsPanel.hidden);
  });
  $("#labsList").addEventListener("change", (e) => {
    const id = e.target.dataset.lab;
    if (!id) return;
    labState[id] = e.target.checked;
    try { localStorage.setItem(LABS_KEY, JSON.stringify(labState)); } catch (_) {}
    applyLabs();
    if (id === "rival" && (state === "idle" || state === "result")) cars().forEach(placeAtGrid);
    if (id === "share" && !lab("share")) shareBtn.hidden = true;
    onScroll();
  });
}

// ============ track & cars ============
const asphalt = $(".asphalt");
const yourCar = $("#yourCar");
const rivalCar = $("#rivalCar");
const cars = () => (lab("rival") ? [yourCar, rivalCar] : [yourCar]);

const gridX = () => asphalt.clientWidth * 0.05;
const offRight = () => asphalt.clientWidth + 40;
const offLeft = (car) => -car.getBoundingClientRect().width - 40;

function placeAtGrid(car) {
  car.getAnimations().forEach((a) => a.cancel());
  car.style.transform = `translateX(${gridX()}px)`;
  car.dataset.at = "grid";
}

async function rollToGrid(car) {
  if (car.dataset.at === "grid") return;
  car.getAnimations().forEach((a) => a.cancel());
  const ROLL_MS = 750;
  car.animate(
    [{ transform: `translateX(${offLeft(car)}px)` }, { transform: `translateX(${gridX()}px)` }],
    { duration: ROLL_MS, easing: "cubic-bezier(.2,.8,.3,1)", fill: "forwards" }
  );
  car.classList.add("speeding");
  // a timer, not anim.finished: animation frames pause in background windows, timers don't
  await new Promise((r) => setTimeout(r, ROLL_MS));
  car.classList.remove("speeding");
  placeAtGrid(car);
}

function launch(car) {
  if (car.dataset.at !== "grid") return;
  car.dataset.at = "gone";
  car.classList.remove("revving");
  car.classList.add("speeding");
  car.getAnimations().forEach((a) => a.cancel());
  const anim = car.animate(
    [{ transform: `translateX(${gridX()}px)` }, { transform: `translateX(${offRight()}px)` }],
    { duration: 1300, easing: "cubic-bezier(.5,0,1,.55)", fill: "forwards" }
  );
  anim.finished.then(() => car.classList.remove("speeding")).catch(() => {});
}

placeAtGrid(yourCar);
placeAtGrid(rivalCar);
window.addEventListener("resize", () => {
  [yourCar, rivalCar].forEach((c) => c.dataset.at === "grid" && placeAtGrid(c));
});

// ============ sound (lab) ============
let audioCtx = null;
let engine = null;
function audio() {
  if (!lab("sound")) return null;
  try {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
  } catch (_) { return null; }
  return audioCtx;
}
function beep(freq, dur = 0.12, vol = 0.05) {
  const a = audio();
  if (!a) return;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = "square";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, a.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
  osc.connect(gain).connect(a.destination);
  osc.start();
  osc.stop(a.currentTime + dur);
}
function engineIdle() {
  const a = audio();
  if (!a || engine) return;
  const osc = a.createOscillator();
  const filter = a.createBiquadFilter();
  const gain = a.createGain();
  osc.type = "sawtooth";
  osc.frequency.value = 62;
  filter.type = "lowpass";
  filter.frequency.value = 900;
  gain.gain.setValueAtTime(0.0001, a.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.035, a.currentTime + 0.3);
  osc.connect(filter).connect(gain).connect(a.destination);
  osc.start();
  engine = { osc, gain };
}
function engineRoar() {
  if (!engine || !audioCtx) return;
  const t = audioCtx.currentTime;
  const { osc, gain } = engine;
  osc.frequency.cancelScheduledValues(t);
  osc.frequency.setValueAtTime(osc.frequency.value, t);
  osc.frequency.exponentialRampToValueAtTime(540, t + 1.1);
  gain.gain.cancelScheduledValues(t);
  gain.gain.setValueAtTime(0.06, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
  osc.stop(t + 1.5);
  engine = null;
}
function engineStop() {
  if (!engine || !audioCtx) return;
  const t = audioCtx.currentTime;
  engine.gain.gain.cancelScheduledValues(t);
  engine.gain.gain.setValueAtTime(engine.gain.gain.value, t);
  engine.gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
  engine.osc.stop(t + 0.3);
  engine = null;
}

// ============ lights-out game ============
const hero = $(".hero");
const pods = $$("#playBtn .btn-lights i");
const btnLabel = $("#btnLabel");
const playBtn = $("#playBtn");
const gameMsg = $("#gameMsg");
const shareBtn = $("#shareBtn");
const BEST_KEY = "burginos-best-reaction";
const LIGHT_GAP = 700; // ms between each red light

let state = "idle"; // idle | staging | lighting | go | result
let timers = [];
let t0 = 0;
let rivalDelay = 0;
let lastTime = null;
let best = null;
try { best = Number(localStorage.getItem(BEST_KEY)) || null; } catch (_) {}

const fmt = (ms) => `${(ms / 1000).toFixed(3)}s`;
const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
const lightsOff = () => pods.forEach((p) => p.classList.remove("on", "green"));
// "running" swaps the label for the lights; the label stays as the accessible name
function setBtn(text, cls = "") {
  btnLabel.textContent = text;
  playBtn.className = `play-btn ${cls}`.trim();
}
function verdict(ms) {
  if (ms < 180) return "Suspiciously fast. Bot? 🤖";
  if (ms < 250) return "Pole position energy 🏆";
  if (ms < 320) return "Podium finish.";
  if (ms < 450) return "Midfield mood.";
  return "Bro was ordering fries 🍟";
}

async function startRace() {
  if (state !== "idle" && state !== "result") return;
  state = "staging";
  clearTimers();
  lightsOff();
  shareBtn.hidden = true;
  setBtn("Staging", "running");
  gameMsg.textContent = "Cars rolling to the grid.";
  await Promise.all(cars().map(rollToGrid));
  if (state !== "staging") return;

  state = "lighting";
  setBtn("Wait for green", "running");
  gameMsg.textContent = "Tap the moment the lights turn green.";
  cars().forEach((c) => c.classList.add("revving"));
  engineIdle();
  pods.forEach((p, i) => timers.push(setTimeout(() => { p.classList.add("on"); beep(420); }, LIGHT_GAP * (i + 1))));
  const hold = 300 + Math.random() * 2200; // random hold, like the real thing
  timers.push(setTimeout(goGreen, LIGHT_GAP * pods.length + hold));
}

function goGreen() {
  state = "go";
  pods.forEach((p) => { p.classList.remove("on"); p.classList.add("green"); });
  t0 = performance.now();
  setBtn("Tap now", "running");
  beep(880, 0.25, 0.06);
  engineRoar();
  if (lab("rival")) {
    rivalDelay = 190 + Math.random() * 90;
    timers.push(setTimeout(() => launch(rivalCar), rivalDelay));
  } else {
    launch(yourCar);
  }
  timers.push(setTimeout(() => {
    if (state !== "go") return;
    state = "result";
    lightsOff();
    setBtn("Play again");
    gameMsg.innerHTML = "<strong>DNF 🐌</strong> The lights went green ages ago.";
  }, 5000));
}

function press() {
  if (state === "lighting") {
    clearTimers();
    lightsOff();
    cars().forEach((c) => c.classList.remove("revving"));
    engineStop();
    state = "result";
    setBtn("Play again", "is-jump");
    gameMsg.innerHTML = "<strong>Jump start! 🚩</strong> Wait for green.";
    return;
  }
  if (state !== "go") return;

  const ms = performance.now() - t0;
  state = "result";
  lastTime = ms;
  if (lab("rival")) launch(yourCar);
  if (!best || ms < best) {
    best = ms;
    try { localStorage.setItem(BEST_KEY, String(Math.round(ms))); } catch (_) {}
  }
  let line = `<strong>${fmt(ms)}</strong> · ${verdict(ms)}`;
  if (lab("rival")) line += ms < rivalDelay ? " · You beat the rival 🏆" : " · Rival got the jump.";
  line += ` · Best ${fmt(best)}`;
  gameMsg.innerHTML = line;
  shareBtn.hidden = !lab("share");
  // hold the green lights for a beat, then bring the label back
  timers.push(setTimeout(() => { lightsOff(); setBtn("Play again"); }, 900));
}

function act() {
  if (state === "lighting" || state === "go") press();
  else startRace();
}

// pointerdown (not click) so reaction times aren't padded by click latency
hero.addEventListener("pointerdown", (e) => {
  if (e.target.closest(".nav, .labs, .share-btn")) return;
  if (state === "lighting" || state === "go") { e.preventDefault(); press(); return; }
  if (e.target.closest("#playBtn")) { e.preventDefault(); startRace(); }
});
// keyboard / assistive tech activation of the button
playBtn.addEventListener("click", (e) => { if (e.detail === 0) act(); });

let heroInView = true;
new IntersectionObserver(([entry]) => { heroInView = entry.isIntersecting; }, { threshold: 0.35 }).observe(hero);
document.addEventListener("keydown", (e) => {
  if (e.code !== "Space" || e.repeat || !heroInView) return;
  if (document.activeElement === playBtn || e.target.matches("input, textarea")) return;
  e.preventDefault();
  act();
});

shareBtn.addEventListener("click", async () => {
  if (lastTime == null) return;
  const text = `I hit ${fmt(lastTime)} on the Burginos lights-out challenge 🏁 Bad decisions taste better.`;
  const url = location.href.split("#")[0];
  if (navigator.share) {
    navigator.share({ title: "Burginos", text, url }).catch(() => {});
  } else {
    try { await navigator.clipboard.writeText(`${text} ${url}`); toast("Copied. Paste it anywhere 🏁"); }
    catch (_) { toast(text); }
  }
});

// ============ scroll effects ============
const scrollTrack = $("#scrollTrack");
const scrollCar = $("#scrollCar");
const aboutSection = $("#story");
const aboutImg = $("#aboutImg");
const wide = matchMedia("(min-width: 901px)");
let ticking = false;

function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? Math.min(1, scrollY / max) : 0;

  scrollTrack.classList.toggle("show", scrollY > hero.offsetHeight * 0.6);
  scrollCar.style.setProperty("--x", `${p * (scrollTrack.clientWidth - 110)}px`);

  if (lab("parallax") && wide.matches) {
    const r = aboutSection.getBoundingClientRect();
    const prog = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
    aboutImg.style.transform = `translateY(${-prog * 12}%)`;
  } else {
    aboutImg.style.transform = "";
  }
  ticking = false;
}
window.addEventListener("scroll", () => {
  if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
}, { passive: true });
window.addEventListener("resize", onScroll);
onScroll();

// ============ gallery: clone the set once so the CSS slide can loop seamlessly ============
const galleryTrack = $("#galleryTrack");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (galleryTrack && !reduceMotion) {
  const originals = [...galleryTrack.children];
  originals.forEach((img) => {
    const clone = img.cloneNode(true);
    clone.alt = "";
    clone.setAttribute("aria-hidden", "true");
    galleryTrack.appendChild(clone);
  });
  galleryTrack.style.setProperty("--dur", `${originals.length * 6.5}s`); // ~6.5s per poster
}

// ============ looping reel: load when near, play only while visible ============
const reel = $("#reel");
const reelSound = $("#reelSound");
if (reel) {
  new IntersectionObserver(([entry], obs) => {
    if (!entry.isIntersecting) return;
    reel.src = reel.dataset.src;
    obs.disconnect();
  }, { rootMargin: "600px 0px" }).observe(reel);

  if (reduceMotion) {
    reel.controls = true; // no autoplay; let people press play themselves
  } else {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) reel.play().catch(() => {});
      else reel.pause();
    }, { threshold: 0.25 }).observe(reel);
  }

  reelSound.addEventListener("click", () => {
    reel.muted = !reel.muted;
    reelSound.textContent = reel.muted ? "🔇" : "🔊";
    reelSound.setAttribute("aria-pressed", String(!reel.muted));
    reelSound.setAttribute("aria-label", reel.muted ? "Turn sound on" : "Turn sound off");
    if (!reel.muted) reel.play().catch(() => {});
  });
}

// ============ reveal on scroll ============
const revealer = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); revealer.unobserve(en.target); }
  });
}, { threshold: 0.2 });
$$(".reveal").forEach((el) => revealer.observe(el));
