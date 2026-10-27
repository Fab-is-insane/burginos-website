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
  - **Hero:** red nav over the full-screen party photo, with the campaign overlays from the client's poster: checkered flag (top left), "There is always a good place to hang out" (bottom left) and the red "Bad decisions taste better." sticker (bottom right; Impact outlines as inline SVG, since Impact can't be served as a web font).
  - **Our Story** (Roboto copy, photo on the right).
  - **Gallery:** "Bad decisions, documented." A single row of campaign posters that auto-slides (AlienKind-style) and pauses on hover.
  - **Events** (the "Events" link): full-screen `assets/events-bg.webp` with the overlays from the client's poster: the italic note and flag, "Meet us where the night gets interesting." and the sticker.
  - **Reels**, under Events: five rounded 9:16 cards that slide in a loop (paused on hover), each with a "Watch on Instagram" link. Each card autoplays `assets/reels/reel-1.mp4` … `reel-5.mp4` (muted, looping, only while on screen); a missing file falls back to that reel's Instagram embed, which needs a tap to play. Instagram embeds can't be autoplayed or looped by the site, so add the video files to get autoplay. Numbering follows `assets/links.txt`. To add a reel, copy a `.reel` block in `index.html` and change its number and reel ID.
  - **Why us**, with the looping campaign reel on the right.
  - **Moods:** three posters in a row with "Made for main characters, not people pleasers."
  - **Game:** "Think you're quick?" strip above the footer: the F1 lights-out reaction game and a narrow track with an F1 car that launches on green.
  - **Footer.**
- `menu.html`: the menu as a page-flip book ([pdf.js](https://mozilla.github.io/pdf.js/) and [page-flip](https://github.com/Nodlik/StPageFlip), both from jsdelivr): front cover, the menu PDF's spread split across the two inside pages, back cover. The covers are HTML in `menu.html`. The book sizes itself to the screen, with the arrows beside it on desktop and below it on phones.

## files

- `styles.css`: shared styles. Tokens are in `:root` (colors and fonts: Anton for headings, Roboto for body copy, Racing Sans One for the nav and PLAY GAME; the logo is `assets/Asset_14.png`). Header and hero sizes are fitted to the design mockup at 1536px wide.
- Hero photo: `assets/hero-party.webp` (216KB export of `assets/299c9f90-….png`, kept as the fallback). If you swap the photo, re-export the WebP too.
- `common.js`: shared by all pages (mobile nav, pop-up message, footer year, the marquee tapes).
- `events.js`: the reel slider in the Events section (clones the set for the loop, plays each card's video while on screen, falls back to the Instagram embed).
- `script.js`: landing page (game, cars, scroll effects, the hidden Labs panel).
- `menu.js`: menu book.
- `assets/Bad_decisions_2.png`: Our Story photo (high-res cut-out, 5.8MB). The page loads `assets/our-story.webp`, a 195KB export of it, and keeps the PNG as the fallback. If you swap the photo, re-export the WebP too.
- `assets/events-bg.webp`: Events hero photo, a 226KB export of `There_is_always_a_good_place_to_hang_out_5.png` (5.5MB, kept as the fallback). If you swap the photo, re-export the WebP too.
- `assets/menu/Burginos final menu.pdf`: the client's menu, a one-page landscape spread. `menu.js` renders it sharp for the screen and splits it down the middle into the book's two inside pages; it's also linked as "Open the full menu (PDF)". To update the menu, replace this file (same name, one landscape page).
- `assets/gallery/gallery-1…7.webp`: gallery posters, WebP exports of `image.png` and `2.png`–`7.png` (5.9MB → 322KB). To add a poster, export a WebP into `assets/gallery/` and add an `<img>` to `#galleryTrack` in `index.html`. The script clones the set for the loop and sets the speed automatically.
- `assets/STFU.png`, `STFU_1.png`, `STFU_3.png`: the three mood posters (STFU, LOW KEY, BAD DIES) in the section after the gallery. They are only 236×354, so they look soft on large and retina screens. Swap in higher-res exports with the same names when you have them.
- `assets/After_20261015_025536_0000.mp4`: the reel (32MB, 27s). It loads only when you scroll near Why us and pauses when off screen. The file is 1080×1920 with the footage in a roughly square band, so the 1:1 card crops off the black bars. Re-encoding it as a 720×720 file would cut it to a few MB.

## labs (experimental features)

The **Labs** panel is hidden for launch (`SHOW_LABS = false` in `script.js`), so these features run with their defaults:

| feature | default |
| --- | --- |
| Scroll-progress car (mini track at the bottom of the screen) | on |
| Race a rival (white car launches on green; yours goes when you tap) | off |
| Engine sounds (beeps + engine roar) | off |
| Share your time (share / copy button after a run) | on |
| Photo parallax on About (desktop) | on |

To change one, edit its default in the `LABS` list in `script.js`. Set `SHOW_LABS = true` to bring back the Labs button (bottom right) for previewing; its toggles are saved per browser.
