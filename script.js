// ============ data ============
// Prices marked "placeholder" in the README are guesses — confirm with the client.
const MENU = [
  { name: "The Baddie", cat: "burgers", veg: false, price: 199, emoji: "🍔",
    desc: "Smashed patty, melted cheese, pickles & our house bad-decisions sauce. The one on the poster.", tags: ["Signature"] },
  { name: "Pole Position", cat: "burgers", veg: false, price: 249, emoji: "🍔",
    desc: "Double smash, double cheese, caramelised onions. Starts at the front, stays at the front.", tags: ["Double"] },
  { name: "Pit Stop Paneer", cat: "burgers", veg: true, price: 179, emoji: "🧀",
    desc: "Crispy paneer slab, peri-peri mayo, pickled onions. 2.3 seconds to inhale, guaranteed.", tags: ["Veg hero"] },

  { name: "Iced Americano", cat: "coffee", veg: true, price: 69, emoji: "🧊",
    desc: "A shot of espresso, iced water and some extra punch. 100% Arabica, zero excuses.", tags: ["Fan fav", "₹69"] },
  { name: "Slipstream Cold Coffee", cat: "coffee", veg: true, price: 119, emoji: "🥤",
    desc: "Thick, creamy, dangerously smooth. Sit behind it and it'll pull you along.", tags: ["Iced"] },
  { name: "Hot Lap Cappuccino", cat: "coffee", veg: true, price: 99, emoji: "☕",
    desc: "Classic cappuccino, velvet foam. For the 5:45 AM run-club crowd.", tags: ["Hot"] },
  { name: "Red Flag Mocha", cat: "coffee", veg: true, price: 139, emoji: "🍫",
    desc: "Espresso × dark chocolate. Stops the session. Worth it.", tags: ["Iced or hot"] },
  { name: "Box Box Hazelnut", cat: "coffee", veg: true, price: 149, emoji: "🌰",
    desc: "Hazelnut latte, iced. Iced coffee in a hoodie is a love story, apparently.", tags: ["Iced"] },

  { name: "Full Send Fries", cat: "snacks", veg: true, price: 89, emoji: "🍟",
    desc: "Skin-on, salted, crispy. Commit to the corner.", tags: [] },
  { name: "Overcut Peri Fries", cat: "snacks", veg: true, price: 109, emoji: "🌶️",
    desc: "Fries dusted in peri-peri. Spicy enough to make you overtake.", tags: ["Spicy"] },
  { name: "Safety Car Nuggets", cat: "snacks", veg: false, price: 139, emoji: "🍗",
    desc: "6 crispy chicken nuggets + 2 dips. Comes out when things get chaotic.", tags: ["6 pcs"] },
  { name: "Endless Combo", cat: "snacks", veg: false, price: 279, emoji: "🎁",
    desc: "Any burger + fries + any iced coffee. Endless choice, zero limits.", tags: ["Combo", "Best value"] },
];

const CATEGORY = {
  burgers: { tyre: "t-soft", letter: "S", bg: "var(--red)" },
  coffee: { tyre: "t-medium", letter: "M", bg: "var(--yellow)" },
  snacks: { tyre: "t-hard", letter: "H", bg: "#F3E3C6" },
};

// date: YYYY-MM-DD (local), or null for TBA
const EVENTS = [
  { title: "Coffee Run Rave", date: "2026-09-27", time: "5:45 AM", venue: "PickleEdge, Kanpur", with: "w/ 5:11 Club",
    blurb: "2KM run, DJ set, open play and coffee on us. We brought the caffeine; you brought the cardio." },
  { title: "Grand Opening", date: "2026-10-18", time: null, venue: "Kanpur", with: null,
    blurb: "5 coffees, 3 burgers and snacks that force you to dance. Pit lane officially open." },
  { title: "Hip Hop Rave ’26", date: "2026-10-25", time: "5:30 PM onwards", venue: "Motijheel, Kanpur", with: null,
    blurb: "Local rappers. Live cyphers. Heavy beats. One night, raw energy, no rules." },
  { title: "Endless Fest", date: null, time: null, venue: "Kanpur", with: null,
    blurb: "Endless choice, endless combos. Freedom on a tray. Dates dropping on IG." },
];

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ============ toast ============
const toastEl = $("#toast");
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2400);
}

// ============ cart ============
let cartCount = 0;
const cartCountEl = $("#cartCount");
function addToCart(name) {
  cartCount++;
  cartCountEl.textContent = cartCount;
  cartCountEl.classList.remove("bump");
  void cartCountEl.offsetWidth; // restart animation
  cartCountEl.classList.add("bump");
  const lines = ["boxed it 📦", "copy that, it's in the bag", "undercut successful 🏁", "great strategy call"];
  toast(`${name}: ${lines[Math.floor(Math.random() * lines.length)]}`);
}
$("#cartBtn").addEventListener("click", () => {
  toast(cartCount
    ? `${cartCount} item${cartCount > 1 ? "s" : ""} in the bag. Online ordering is warming its tyres 🏁`
    : "Bag's empty. Bad decision, but not the tasty kind.");
});
$$("[data-soon]").forEach((a) => a.addEventListener("click", (e) => {
  e.preventDefault();
  toast(`${a.dataset.soon} link dropping soon. DM us on IG for now 🏁`);
}));

// ============ menu ============
const grid = $("#menuGrid");
function renderMenu(filter = "all") {
  const items = MENU.filter((i) => filter === "all" || (filter === "veg" ? i.veg : i.cat === filter));
  grid.innerHTML = items.map((item, idx) => {
    const c = CATEGORY[item.cat];
    const num = String(MENU.indexOf(item) + 1).padStart(2, "0");
    return `
    <article class="item" style="animation-delay:${idx * 45}ms">
      <div class="item-top" style="--bg:${c.bg}">
        <span class="item-num">#${num}</span>
        <span class="tyre ${c.tyre}" title="${item.cat}">${c.letter}</span>
        <span class="item-emoji" aria-hidden="true">${item.emoji}</span>
      </div>
      <div class="item-body">
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
        <div class="item-meta">
          <span class="tag ${item.veg ? "veg" : "nonveg"}">${item.veg ? "● Veg" : "● Non-veg"}</span>
          ${item.tags.map((t) => `<span class="tag">${t}</span>`).join("")}
        </div>
        <div class="item-foot">
          <span class="price">₹${item.price}</span>
          <button class="add-btn" data-name="${item.name}">Add +</button>
        </div>
      </div>
    </article>`;
  }).join("");
}
grid.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (btn) addToCart(btn.dataset.name);
});
$$(".filter").forEach((btn) => {
  btn.addEventListener("click", () => {
    $$(".filter").forEach((b) => {
      b.classList.toggle("is-active", b === btn);
      b.setAttribute("aria-selected", b === btn);
    });
    renderMenu(btn.dataset.filter);
  });
});
renderMenu();

// ============ events / race calendar ============
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

function eventStatus(ev) {
  if (!ev.date) return { key: "tba", label: "Dates TBA" };
  if (ev.date === today) return { key: "live", label: "● Live today" };
  if (ev.date > today) return { key: "upcoming", label: "Upcoming" };
  return { key: "done", label: "Chequered 🏁" };
}
function fmtDate(iso) {
  if (!iso) return "TBA";
  const [, m, d] = iso.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]}`;
}

$("#eventsList").innerHTML = EVENTS.map((ev, i) => {
  const s = eventStatus(ev);
  const info = [ev.venue, ev.time, ev.with].filter(Boolean).map((x) => `<span>${x}</span>`).join("");
  return `
  <article class="event ${s.key === "done" ? "is-done" : ""}">
    <div>
      <p class="event-round">Round ${String(i + 1).padStart(2, "0")}</p>
      <p class="event-date">${fmtDate(ev.date)}</p>
    </div>
    <div>
      <h3>${ev.title}</h3>
      <p class="event-info">${info}</p>
      <p class="event-blurb">${ev.blurb}</p>
    </div>
    <span class="status ${s.key}">${s.label}</span>
  </article>`;
}).join("");

// race control bar: today's event, else the next one
const live = EVENTS.find((ev) => ev.date === today);
const next = EVENTS.find((ev) => ev.date && ev.date > today) || EVENTS.find((ev) => !ev.date);
const rcMsg = $("#rcMsg");
if (live) {
  rcMsg.textContent = `🔴 Live today: ${live.title} · ${[live.venue, live.time].filter(Boolean).join(" · ")} →`;
} else if (next) {
  rcMsg.textContent = `Next round: ${next.title} · ${next.date ? fmtDate(next.date) : "dates dropping soon"} →`;
} else {
  rcMsg.textContent = "Bad decisions taste better. Follow @burginos.india for the next round →";
}

// ============ lights out challenge ============
const pods = $$("#gantry .pod");
const pad = $("#reactPad");
const padMain = $("#reactMain");
const padSub = $("#reactSub");
const lastEl = $("#lastTime");
const bestEl = $("#bestTime");
const BEST_KEY = "burginos-best-reaction";

let state = "idle"; // idle | lighting | go | result
let timers = [];
let t0 = 0;
let best = null;
try { best = Number(localStorage.getItem(BEST_KEY)) || null; } catch (_) {}
if (best) bestEl.textContent = fmtTime(best);

function fmtTime(ms) { return `${(ms / 1000).toFixed(3)}s`; }
function setPad(cls, main, sub) {
  pad.className = `react-pad ${cls}`;
  padMain.textContent = main;
  padSub.textContent = sub;
}
function clearTimers() { timers.forEach(clearTimeout); timers = []; }
function lightsOff() { pods.forEach((p) => p.classList.remove("on")); }

function startSequence() {
  clearTimers();
  lightsOff();
  state = "lighting";
  setPad("waiting", "Wait for it…", "hit it when the lights go out");
  pods.forEach((p, i) => timers.push(setTimeout(() => p.classList.add("on"), 800 * (i + 1))));
  const hold = 200 + Math.random() * 2800; // random hold, like the real thing
  timers.push(setTimeout(() => {
    lightsOff();
    state = "go";
    t0 = performance.now();
    setPad("go", "GO GO GO!", "tap now");
  }, 800 * pods.length + hold));
}

function verdict(ms) {
  if (ms < 180) return "Suspiciously fast. Are you a bot? 🤖";
  if (ms < 250) return "Pole position energy 🏆";
  if (ms < 320) return "Podium finish. Fries are on you.";
  if (ms < 450) return "Midfield mood. Respectable.";
  return "Bro was ordering fries 🍟";
}

function press() {
  if (state === "idle" || state === "result") return startSequence();
  if (state === "lighting") {
    clearTimers();
    lightsOff();
    state = "result";
    lastEl.textContent = "Jump start";
    return setPad("jump", "Jump start! 🚩", "5 sec penalty. tap to retry");
  }
  if (state === "go") {
    const ms = performance.now() - t0;
    state = "result";
    lastEl.textContent = fmtTime(ms);
    if (!best || ms < best) {
      best = ms;
      bestEl.textContent = fmtTime(ms);
      try { localStorage.setItem(BEST_KEY, String(Math.round(ms))); } catch (_) {}
    }
    setPad("", fmtTime(ms), `${verdict(ms)} · tap to go again`);
  }
}

pad.addEventListener("pointerdown", (e) => { e.preventDefault(); press(); });
let challengeInView = false;
new IntersectionObserver(([entry]) => { challengeInView = entry.isIntersecting; }, { threshold: 0.4 })
  .observe($("#challenge"));
document.addEventListener("keydown", (e) => {
  if (e.code !== "Space" && !(e.code === "Enter" && document.activeElement === pad)) return;
  if (!challengeInView || e.repeat || e.target.matches("input, textarea")) return;
  e.preventDefault();
  press();
});

// ============ mobile nav ============
const navToggle = $("#navToggle");
const navLinks = $("#navLinks");
navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", open);
});
$$("#navLinks a").forEach((a) => a.addEventListener("click", () => {
  navLinks.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
}));

// ============ newsletter ============
$("#joinForm").addEventListener("submit", (e) => {
  e.preventDefault();
  e.target.reset();
  toast("You're on the grid 🏁 welcome to the cult");
});

$("#year").textContent = new Date().getFullYear();
