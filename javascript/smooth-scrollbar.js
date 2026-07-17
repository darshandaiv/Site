// ─── SMOOTH SCROLL (Lenis) ─────────────────────────────────
const lenis = new Lenis({
  duration: 1.2,          // scroll smoothing duration
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1.5,
  infinite: false,
});

// RAF loop to keep Lenis updated every frame
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Optional: expose globally so script.js can sync with it
window.lenis = lenis;

// ─── Sync Lenis scroll with your existing scroll-progress bar ──
lenis.on('scroll', ({ scroll, limit }) => {
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    const percent = (scroll / limit) * 100;
    progressBar.style.width = percent + '%';
  }
});

// ─── If you use GSAP ScrollTrigger anywhere (e.g. for the
// expedition pinned/sticky timeline section), keep it in sync: ──
if (window.gsap && window.ScrollTrigger) {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

// ─── Smooth-scroll for anchor links (nav, fs-menu, footer, etc.) ──
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId.length > 1) {
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: 0, duration: 1.5 });
      }
    }
  });
});