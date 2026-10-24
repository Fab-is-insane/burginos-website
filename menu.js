// Menu page: renders assets/menu.pdf into a page-flip book.
// Needs pdf.js, page-flip and common.js loaded first.

const PDF_URL = "assets/menu.pdf";
const BASE_W = 420; // page width the book layout is calculated from

const statusEl = $("#bookStatus");
const bookEl = $("#book");
const controls = $("#bookControls");
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
  const first = await pdf.getPage(1);
  const unscaled = first.getViewport({ scale: 1 });
  const ratio = unscaled.height / unscaled.width;
  const baseH = Math.round(BASE_W * ratio);
  // render sharp enough for retina screens without huge canvases
  const scale = (BASE_W * Math.min(2.5, (window.devicePixelRatio || 1) * 1.5)) / unscaled.width;

  for (let n = 1; n <= pdf.numPages; n++) {
    const page = n === 1 ? first : await pdf.getPage(n);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;

    const wrap = document.createElement("div");
    wrap.className = "page";
    if (n === 1 || n === pdf.numPages) wrap.dataset.density = "hard"; // stiff covers
    wrap.appendChild(canvas);
    bookEl.appendChild(wrap);
  }

  // keep the whole book + controls inside the viewport (120px leaves room for the arrows)
  const bookTop = bookEl.getBoundingClientRect().top + scrollY;
  const maxW = Math.max(240, Math.min(520, (innerHeight - bookTop - 120) / ratio));
  const flip = new St.PageFlip(bookEl, {
    width: BASE_W,
    height: baseH,
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
  controls.hidden = false;
}

renderBook().catch((err) => { console.error(err); fail(); });
