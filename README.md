# Burginos 🏁

Landing page for **Burginos** (Kanpur): *Bad decisions taste better.*
Street food × culture × F1, with a Gen Z party feel.

Plain HTML/CSS/JS, no build step.

## run locally

Open `index.html` in a browser, or serve the folder:

```sh
npx serve .
```

## design references

- Layout and poster style: [Chompo on Dribbble](https://dribbble.com/shots/26920639-Restaurant-and-Food-Delivery-Website-Design-for-Fast-Food-Brand). Red/cream/black, huge condensed type, zigzag edges, crossing ribbons, giant footer wordmark.
- Brand voice and F1 theme: [@burginos.india](https://www.instagram.com/burginos.india/). Racing "B" logo, checkered flags, red-lit party visuals, taglines.

## structure

- `index.html`: race-control bar, nav, hero (F1 start lights), ribbons, manifesto/telemetry, menu, "Hungry looks good on you" pit board, lights-out reaction game, race calendar (events), pit lane / newsletter, footer
- `styles.css`: design tokens at the top in `:root` (colors, fonts, zigzag size)
- `script.js`: `MENU` and `EVENTS` data, menu filters (tyre compounds: S = burgers, M = coffee, H = snacks, I = veg), cart counter, event status, reaction game, mobile nav
- `favicon.svg`: approximation of the Burginos "B" mark

## editing content

- **Menu / prices:** the `MENU` array in `script.js`. Only the ₹69 Iced Americano comes from the client's posts. Every other item name and price is a placeholder to confirm.
- **Events:** the `EVENTS` array in `script.js` (`date: "YYYY-MM-DD"`, or `null` for TBA). The status chip (live today / upcoming / chequered) and the top race-control message update automatically from today's date.
- **Logo:** the nav mark and favicon are hand-drawn SVG approximations. Swap in the real logo file when you get it.
- **Address / timings:** the `#find` section in `index.html` says "Kanpur" only. Add the exact address once known.

## still to wire up

- Zomato / Swiggy buttons (`data-soon` links) only show a pop-up message for now.
- Cart and newsletter are front-end only.
