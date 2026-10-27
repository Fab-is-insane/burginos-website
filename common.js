// Shared by index.html and menu.html
document.documentElement.classList.add("js");

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ============ mobile nav ============
const navToggle = $("#navToggle");
const navLinks = $("#navLinks");
navToggle?.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", open);
});
$$("#navLinks a").forEach((a) => a.addEventListener("click", () => {
  navLinks.classList.remove("open");
  navToggle?.setAttribute("aria-expanded", "false");
}));

// ============ toast ============
const toastEl = $("#toast");
let toastTimer;
function toast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2400);
}

$$(".year").forEach((el) => (el.textContent = new Date().getFullYear()));

// ============ ribbons: marquee tapes that speed up and lean with scroll ============
{
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // repeat the phrase past the widest screen, then double it so wrapping at half the width is seamless
  function fill(t) {
    t.track.innerHTML = t.unit;
    while (t.track.scrollWidth < Math.max(screen.width, innerWidth) * 1.15) t.track.insertAdjacentHTML("beforeend", t.unit);
    t.track.innerHTML += t.track.innerHTML;
    t.half = t.track.scrollWidth / 2;
    t.x %= t.half;
  }
  const tapes = $$(".tape").map((tape) => {
    const track = tape.querySelector(".tape-track");
    return { tape, track, unit: track.innerHTML, dir: Number(tape.dataset.dir) || 1, x: 0, half: 1, on: false };
  });
  tapes.forEach(fill);
  // measured in the fallback font until Anton arrives; a stale width leaves a gap at the loop point, so refill
  document.fonts?.ready.then(() => tapes.forEach(fill));
  if (tapes.length && !reduceMotion) {
    const ribbonObs = new IntersectionObserver((entries) => {
      entries.forEach((en) => tapes.forEach((t) => { if (en.target.contains(t.tape)) t.on = en.isIntersecting; }));
    }, { rootMargin: "120px 0px" }); // the ribbon is a zero-height line; the tapes reach past it
    $$(".ribbon").forEach((r) => ribbonObs.observe(r));

    let lastY = scrollY;
    let boost = 0;
    let skew = 0;
    (function drift() {
      const dy = scrollY - lastY;
      lastY = scrollY;
      boost += (Math.min(Math.abs(dy), 120) * 0.12 - boost) * 0.12; // eases in and out
      skew += (Math.max(-10, Math.min(10, -dy * 0.25)) - skew) * 0.15;
      tapes.forEach((t) => {
        if (!t.on) return;
        t.x = (t.x + (0.6 + boost) * t.dir + t.half) % t.half; // stays in [0, half)
        t.track.style.transform = `translateX(${-t.x}px)`;
        t.tape.style.setProperty("--skew", `${skew * t.dir}deg`);
      });
      requestAnimationFrame(drift);
    })();
  }
  // only on real width changes (phones fire resize as the address bar slides while scrolling)
  let lastW = innerWidth;
  addEventListener("resize", () => {
    if (innerWidth === lastW) return;
    lastW = innerWidth;
    tapes.forEach(fill);
  });
}
