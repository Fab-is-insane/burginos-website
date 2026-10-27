// Menu page: renders the one-page menu PDF (a two-page spread) into the inside pages of a page-flip book.
// Needs pdf.js, page-flip and common.js loaded first.

const PDF_URL = "assets/menu/Burginos%20final%20menu.pdf";
const BASE_W = 420; // page width the book layout is calculated from

const statusEl = $("#bookStatus");
const bookEl = $("#book");
const wrapEl = $(".book-wrap");
const stageEl = $(".book-stage");
const prevBtn = $("#prevBtn");
const nextBtn = $("#nextBtn");
const pageLabel = $("#bookPage");

function fail() {
  statusEl.innerHTML = `Couldn't load the menu book. <a href="${PDF_URL}" target="_blank" rel="noopener">Open the PDF</a>`;
}

async function renderBook() {
  if (!window.pdfjsLib || !window.St) return fail();
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

  const pdf = await pdfjsLib.getDocument(PDF_URL).promise;
  const spread = await pdf.getPage(1);
  const unscaled = spread.getViewport({ scale: 1 });
  const ratio = unscaled.height / (unscaled.width / 2); // one page = half the spread

  // as big as fits: the book's height within the screen below its top edge (40px leaves room for the
  // hint line), and its width between the arrows. Phones (arrows below) show one page at a time.
  const portrait = stageEl.clientWidth < 640;
  const arrows = portrait ? 0 : 2 * (prevBtn.offsetWidth + 24);
  const bookTop = bookEl.getBoundingClientRect().top + scrollY;
  const byHeight = (innerHeight - bookTop - 40) / ratio;
  const byWidth = (stageEl.clientWidth - arrows) / (portrait ? 1 : 2);
  const maxW = Math.max(240, Math.min(640, byHeight, byWidth));
  wrapEl.style.width = `${Math.floor(portrait ? Math.min(maxW, byWidth) : maxW * 2)}px`;

  // render the spread sharp enough for the screen's pixel density, then cut it into the two inside pages
  const halfPx = Math.min(1800, Math.ceil(maxW * (window.devicePixelRatio || 1) * 1.25));
  const viewport = spread.getViewport({ scale: (halfPx * 2) / unscaled.width });
  const full = document.createElement("canvas");
  full.width = Math.floor(viewport.width);
  full.height = Math.floor(viewport.height);
  await spread.render({ canvasContext: full.getContext("2d"), viewport }).promise;
  const half = Math.floor(full.width / 2);
  [["#pageLeft", 0], ["#pageRight", half]].forEach(([sel, x]) => {
    const canvas = document.createElement("canvas");
    canvas.width = half;
    canvas.height = full.height;
    canvas.getContext("2d").drawImage(full, x, 0, half, full.height, 0, 0, half, full.height);
    $(sel).appendChild(canvas);
  });

  const flip = new St.PageFlip(bookEl, {
    width: BASE_W,
    height: Math.round(BASE_W * ratio),
    size: "stretch",
    minWidth: 220,
    maxWidth: maxW,
    minHeight: Math.round(220 * ratio),
    maxHeight: Math.round(maxW * ratio),
    showCover: true,
    usePortrait: true,
    maxShadowOpacity: 0.45,
    flippingTime: 850,
    mobileScrollSupport: false,
  });
  flip.loadFromHTML($$(".page", bookEl));

  const total = flip.getPageCount();
  const update = () => {
    const i = flip.getCurrentPageIndex();
    pageLabel.textContent = `${i + 1} / ${total}`;
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i >= total - 1;
  };
  flip.on("flip", update);
  flip.on("changeOrientation", update);
  update();

  prevBtn.addEventListener("click", () => flip.flipPrev());
  nextBtn.addEventListener("click", () => flip.flipNext());
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") flip.flipPrev();
    if (e.key === "ArrowRight") flip.flipNext();
  });

  statusEl.remove();
  bookEl.classList.add("ready");
  prevBtn.hidden = nextBtn.hidden = false;
}

renderBook().catch((err) => { console.error(err); fail(); });
