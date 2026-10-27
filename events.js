// Events section (home page): the reel slider. Each card plays its own video (assets/reels/) muted on loop
// while it's on screen; until that file exists it falls back to the Instagram embed. Needs common.js loaded first.
// Block-scoped: script.js on the same page has its own top-level reduceMotion.

{
  const reelsTrack = $("#reelsTrack");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reelsTrack) {
    // clone the set once so the CSS slide (-50%) loops seamlessly; the copies are decorative
    if (!reduceMotion) {
      [...reelsTrack.children].forEach((reel) => {
        const copy = reel.cloneNode(true);
        copy.setAttribute("aria-hidden", "true");
        copy.querySelector("a").tabIndex = -1;
        reelsTrack.appendChild(copy);
      });
    }

    // play only the cards on screen (saves battery and data with ten videos in the track)
    const playObs = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) en.target.play().catch(() => {});
      else en.target.pause();
    }), { threshold: 0.1 });

    function useEmbed(card) {
      const iframe = document.createElement("iframe");
      iframe.src = card.dataset.embed;
      iframe.title = `${card.dataset.title} on Instagram`;
      iframe.loading = "lazy";
      iframe.scrolling = "no";
      iframe.allow = "autoplay; encrypted-media; picture-in-picture";
      if (card.closest("[aria-hidden]")) iframe.tabIndex = -1;
      card.replaceChildren(iframe);
      card.classList.add("is-embed");
    }

    $$(".reel-card", reelsTrack).forEach((card) => {
      const video = document.createElement("video");
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.setAttribute("aria-label", card.dataset.title);
      video.addEventListener("error", () => { playObs.unobserve(video); useEmbed(card); }, { once: true });
      video.src = card.dataset.video;
      card.appendChild(video);
      if (!reduceMotion) playObs.observe(video);
      else video.controls = true; // no autoplay; let people press play themselves
    });

    if (!reduceMotion) {
      // a steady ~40px/s whatever the screen size
      reelsTrack.style.setProperty("--dur", `${reelsTrack.scrollWidth / 2 / 40}s`);

      // tapping an embed moves focus into its iframe (the window blurs): hold the slide until they come back
      addEventListener("blur", () => {
        if (document.activeElement?.tagName === "IFRAME") reelsTrack.classList.add("held");
      });
      addEventListener("focus", () => reelsTrack.classList.remove("held"));
    }
  }
}
