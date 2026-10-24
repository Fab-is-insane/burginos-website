# Burginos 🏁

Website for **Burginos** (Kanpur): *Bad decisions taste better.*
Minimal, F1-themed. Plain HTML/CSS/JS, no build step.

## run locally

Serve the folder (the menu book loads a PDF, so it needs `http://`, not `file://`):

```sh
python -m http.server 5173
```

Then open http://localhost:5173/.

## pages

- `index.html`: the landing page.
  - **Hero:** headline, the F1 lights-out reaction game, and a track with an F1 car that launches when the lights go green.
  - **Our Story** (Roboto copy, photo on the right).
  - **Gallery:** "Bad decisions, documented." A single row of campaign posters that auto-slides (AlienKind-style) and pauses on hover.
  - **Why us**, with the looping campaign reel on the right.
  - **Footer.**
- `menu.html`: the menu as a page-flip book, rendered from `assets/menu.pdf` with [pdf.js](https://mozilla.github.io/pdf.js/) and [page-flip](https://github.com/Nodlik/StPageFlip). Both load from jsdelivr.

## files

- `styles.css`: shared styles. Tokens are in `:root` (colors and fonts: Anton for headings, Roboto for body copy, Damion for the logo, Open Sans for the nav and PLAY GAME). Header and hero sizes are fitted to the design mockup at 1536px wide.
- Hero headline: "Bad decisions / taste better." is drawn as Impact letter outlines (inline SVG in `index.html`), because Impact can't be loaded as a web font and most phones don't have it. The real text stays in the page for screen readers and search. To change the wording, regenerate the outlines from the Impact font.
- `common.js`: shared by both pages (mobile nav, pop-up message, footer year).
- `script.js`: landing page (game, cars, scroll effects, Labs panel).
- `menu.js`: menu book.
- `assets/Bad_decisions_2.png`: Our Story photo (high-res cut-out, 5.8MB). The page loads `assets/our-story.webp`, a 195KB export of it, and keeps the PNG as the fallback. If you swap the photo, re-export the WebP too.
- `assets/menu.pdf`: **sample menu**. Item names and prices are placeholders (only the ₹69 Iced Americano comes from the client's posts). Replace it with the client's real PDF. Any page count or size works.
- `assets/gallery/gallery-1…7.webp`: gallery posters, WebP exports of `image.png` and `2.png`–`7.png` (5.9MB → 322KB). To add a poster, export a WebP into `assets/gallery/` and add an `<img>` to `#galleryTrack` in `index.html`. The script clones the set for the loop and sets the speed automatically.
- `assets/emmanorts_….mp4`: the reel (13MB). It loads only when you scroll near Why us and pauses when off screen. The file is 9:16 with the footage in a 4:3 band, so the 4:3 card crops off the black bars. Re-encoding it as a 720×540 file would cut it to a few MB.
- `menu-src/menu.html`: source of the sample PDF. The regenerate command is in the comment at the top of that file.

## labs (experimental features)

A **Labs** button (bottom-right of the landing page) toggles preview features so the client can decide what stays:

| feature | default |
| --- | --- |
| Scroll-progress car (mini track at the bottom of the screen) | on |
| Race a rival (white car launches on green; yours goes when you tap) | off |
| Engine sounds (beeps + engine roar) | off |
| Share your time (share / copy button after a run) | on |
| Photo parallax on About (desktop) | on |

Toggles are saved per browser. To ship, set the defaults you want in the `LABS` list in `script.js`, and set `SHOW_LABS = false` to hide the panel.
