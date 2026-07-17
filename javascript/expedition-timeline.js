(function () {
  const outer = document.getElementById('expedition');
  const sticky = document.getElementById('expeditionSticky');
  const track = document.getElementById('timelineTrackH');
  const progressBar = document.getElementById('timelineProgress');

  if (!outer || !sticky || !track) return; 

  const milestones = Array.from(track.querySelectorAll('.milestone-h'));
  if (milestones.length === 0) return;

  let scrollDistance = 0; 
  let maxTranslate = 0;

  // Measure dynamic dimensions
  function measure() {
    const trackWidth = track.scrollWidth;
    const viewportWidth = sticky.clientWidth;
    const halfViewport = viewportWidth / 2;

    const lastMilestone = milestones[milestones.length - 1];
    const lastMilestoneCenter = lastMilestone.offsetLeft + (lastMilestone.offsetWidth / 2);

    // Stops translating exactly when the last card reaches viewport center
    maxTranslate = Math.max(lastMilestoneCenter - halfViewport, 0);
    scrollDistance = maxTranslate;
    outer.style.setProperty('--scroll-distance', scrollDistance + 'px');
  }

  // Handle precise horizontal updates relative to the top of the screen
  function updateOnScroll() {
    const scrollTop = window.scrollY;
    const outerTop = outer.offsetTop;

    // Calculate progress relative to the screen's top edge
    const scrolledPastTop = scrollTop - outerTop;
    let progress = scrolledPastTop / scrollDistance;
    
    // Clamp the progress strictly between 0 and 1
    progress = Math.max(0, Math.min(1, progress));
    
    // Smoothly shift the horizontal container
    const translateX = -progress * maxTranslate;
    track.style.transform = `translateX(${translateX}px)`;

    // Dynamic progress line caps exactly at the final milestone's dot
    if (progressBar) {
      const lastMilestone = milestones[milestones.length - 1];
      const lastMilestoneDotPos = lastMilestone.offsetLeft;

      // Current pointer position relative to center of screen
      const currentScrollTip = -translateX + (window.innerWidth / 2);

      // Prevent progress line from surpassing the last milestone dot
      const dynamicProgressWidth = Math.max(0, Math.min(lastMilestoneDotPos, currentScrollTip));
      progressBar.style.width = `${dynamicProgressWidth}px`;
    }

    // --- VISUAL-FIRST HIGHLIGHT SELECTOR ---
    let activeIdx = 0;

    // Get the physical bounding box of the first card's text block
    const firstCard = milestones[0].querySelector('.milestone-text-block');
    const firstRect = firstCard ? firstCard.getBoundingClientRect() : null;

    if (firstRect && firstRect.left > window.innerWidth) {
      // 1. If the first milestone has completely gone off the screen to the right,
      // the user is scrolled far above the timeline. Safe to remove all highlights.
      milestones.forEach(m => m.classList.remove('active'));
      return;
    }

    if (progress <= 0) {
      // 2. We are scrolled above the pin zone, but the first milestone is still on-screen:
      // Force it to stay active.
      activeIdx = 0;
    } else if (progress >= 1) {
      // 3. We are scrolled completely below the timeline: Force the last milestone active.
      activeIdx = milestones.length - 1;
    } else {
      // 4. We are actively scrolling through the timeline: Find the closest element to viewport center
      const currentCenterOffset = -translateX + (window.innerWidth / 2);
      let minimumDifference = Infinity;

      milestones.forEach((m, idx) => {
        const mOffset = m.offsetLeft;
        const diff = Math.abs(mOffset - currentCenterOffset);

        if (diff < minimumDifference) {
          minimumDifference = diff;
          activeIdx = idx;
        }
      });
    }

// Apply active classes and inject SVG path fill colors
    milestones.forEach((m, idx) => {
      const path = m.querySelector('.milestone-svg-path');
      
      if (idx === activeIdx) {
        m.classList.add('active');
        if (path) {
          path.setAttribute('fill', '#563CFF'); // Active pink color
        }
      } else {
        m.classList.remove('active');
        if (path) {
          path.setAttribute('fill', 'rgba(255, 255, 255, 0.35)'); // Muted grey color
        }
      }
    });
  }

  // Listeners
  window.addEventListener('resize', function () {
    measure();
    updateOnScroll();
  });

  window.addEventListener('scroll', updateOnScroll, { passive: true });

  window.addEventListener('load', function () {
    measure();
    updateOnScroll();
  });

  // Execute calculations immediately
  measure();
  updateOnScroll();
})();