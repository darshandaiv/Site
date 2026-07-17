"use strict";

/* ================================================================
   SECTION 1 — CUSTOM CURSOR
   Two layers:
   • cursorDot  → sticks exactly to the mouse (no lag)
   • cursorRing → lerps (smooth follows) behind using rAF
================================================================ */
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

let mx = 0, my = 0;       // Raw mouse position
let rx = 0, ry = 0;       // Ring's lerped position

document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
});

function tickCursor() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top  = ry + 'px';
    requestAnimationFrame(tickCursor);
}
tickCursor();

document.addEventListener('mousedown', () => {
    cursorDot.classList.add('clicked');
    cursorRing.classList.add('clicked');
});
document.addEventListener('mouseup', () => {
    cursorDot.classList.remove('clicked');
    cursorRing.classList.remove('clicked');
});

document.addEventListener('mouseleave', () => {
    cursorDot.style.opacity  = '0';
    cursorRing.style.opacity = '0';
});
document.addEventListener('mouseenter', () => {
    cursorDot.style.opacity  = '1';
    cursorRing.style.opacity = '1';
});

/* ================================================================
   SECTION 2 — INTERACTIVE GRID BACKGROUND (Canvas)

   Two modes, switched automatically at the 768px breakpoint
   (matches the cursor/magnetic/tilt cutoff used elsewhere):

   • DESKTOP (≥768px): Grid reacts to live mouse position — glow
     follows the cursor exactly as before.

   • MOBILE (<768px): No pointer tracking at all (no mouse to
     follow, and touch coordinates don't make sense for this
     effect). Instead, a single glow point drifts on its own in a
     slow, smooth looping path — same visual style, just
     self-animated instead of interactive.

   Automatically re-checks on window resize, so rotating a device
   or resizing a browser window switches modes live without
   needing a page refresh.
================================================================ */
const gridCanvas = document.getElementById('grid-canvas');
const gCtx       = gridCanvas.getContext('2d');
const CELL       = 100;

let gMouseX = -9999;
let gMouseY = -9999;

let isMobileGrid = window.innerWidth < 768;
let autoAngle = 0; // drives the self-animated drift path on mobile

function resizeGrid() {
    gridCanvas.width  = window.innerWidth;
    gridCanvas.height = window.innerHeight;
    isMobileGrid = window.innerWidth < 768;
}
resizeGrid();

/* Only track real pointer movement on desktop — on mobile this
   listener simply does nothing useful, so skip updating gMouseX/Y
   there to avoid any touch-driven flicker before drawGrid() takes
   over with the automated path. */
document.addEventListener('mousemove', e => {
    if (isMobileGrid) return;
    gMouseX = e.clientX;
    gMouseY = e.clientY;
});

function drawGrid() {
    gCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

    /* On mobile, ignore real pointer position entirely and drive
       the glow point along a slow circular/figure-8 drift instead.
       autoAngle increments a tiny amount per frame — the small
       increment is what makes the motion feel slow and ambient
       rather than fast/jittery. */
    if (isMobileGrid) {
        autoAngle += 0.006;
        const cx = gridCanvas.width  / 2;
        const cy = gridCanvas.height / 2;
        const radiusX = gridCanvas.width  * 0.35;
        const radiusY = gridCanvas.height * 0.25;
        gMouseX = cx + Math.cos(autoAngle) * radiusX;
        gMouseY = cy + Math.sin(autoAngle * 2) * radiusY; // *2 traces a figure-8 rather than a plain circle
    }

    const cols        = Math.ceil(gridCanvas.width  / CELL) + 1;
    const rows        = Math.ceil(gridCanvas.height / CELL) + 1;
    const GLOW_RADIUS = 800;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const x  = c * CELL;
            const y  = r * CELL;
            const dx = x - gMouseX;
            const dy = y - gMouseY;
            const d  = Math.sqrt(dx * dx + dy * dy);

            const bright = Math.max(0, 1 - d / GLOW_RADIUS);
            const alpha  = bright * 0.01;

            gCtx.strokeStyle = `rgba(255,255,255,${alpha})`;
            gCtx.lineWidth   = bright > 0 ? 0.7 : 0.35;
            gCtx.strokeRect(x, y, CELL, CELL);

            if (bright > 0.38) {
                gCtx.beginPath();
                gCtx.arc(x, y, bright * 1.5, 0, Math.PI * 2);
                gCtx.fillStyle = `rgba(86, 100, 255,${bright * 0.65})`;
                gCtx.fill();
            }
        }
    }
    requestAnimationFrame(drawGrid);
}
drawGrid();

/* ================================================================
   SECTION 3 — FULLSCREEN MENU
================================================================ */
const menuBtn = document.getElementById('menuBtn');
const fsMenu  = document.getElementById('fsMenu');
let menuIsOpen = false;

function openMenu() {
    menuIsOpen = true;
    menuBtn.classList.add('is-open');
    fsMenu.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    menuBtn.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
    menuIsOpen = false;
    menuBtn.classList.remove('is-open');
    fsMenu.classList.remove('is-open');
    document.body.style.overflow = '';
    menuBtn.setAttribute('aria-expanded', 'false');
}

menuBtn.addEventListener('click', () => menuIsOpen ? closeMenu() : openMenu());

document.querySelectorAll('.fs-close-trigger').forEach(link => {
    link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuIsOpen) closeMenu();
});

/* ================================================================
   SECTION 4 — SCROLL PROGRESS BAR + NAVBAR SCROLL STATE
================================================================ */
const scrollProgressEl = document.getElementById('scrollProgress');
const navbar           = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    const scrolled  = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const pct       = maxScroll > 0 ? (scrolled / maxScroll) * 100 : 0;
    scrollProgressEl.style.width = pct + '%';
    
}, { passive: true });

/* ================================================================
   SECTION 5 — CMS RENDER ENGINE
   Shared across index.html (Work section), projects.html, and
   Projects/case-*.html. Reads window.PROJECTS from projects-data.js.

   NOTE ON FOLDER CASING:
   Case study files live inside a folder named "Projects" (capital P,
   confirmed from project structure). All links below match that
   casing exactly. If you ever rename the folder, this is the only
   place that needs updating: the buildWorkCard() href below.
================================================================ */

/* Re-attach cursor hover states to newly injected elements
   (dynamically injected cards don't exist yet when the page first
   loads, so they need their own listeners attached after render) */
function attachCursorHover(root = document) {
    const interactiveEls = 'a, button, .work-card, .service-row, .mag-pill, .social-btn, .fs-nav-link';
    root.querySelectorAll(interactiveEls).forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorDot?.classList.add('hovered');
            cursorRing?.classList.add('hovered');
        });
        el.addEventListener('mouseleave', () => {
            cursorDot?.classList.remove('hovered');
            cursorRing?.classList.remove('hovered');
        });
    });
}

function attachMagnetic(root = document) {
    if (window.innerWidth < 768) return;

    root.querySelectorAll('.mag-target').forEach(el => {
        el.addEventListener('mousemove', e => {
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;
            
            // Read parameters directly from your existing element tags
            // If the attribute is missing, it automatically falls back to your original 0.38 / 0.15s settings
            const strength = parseFloat(el.getAttribute('data-mag-strength')) || 0.38;
            const speed = parseFloat(el.getAttribute('data-mag-speed')) || 0.15;
            
            el.style.transform  = `translate(${dx * strength}px, ${dy * strength}px)`;
            el.style.transition = `transform ${speed}s ease-out`;
        });
        
        el.addEventListener('mouseleave', () => {
            const resetSpeed = parseFloat(el.getAttribute('data-mag-reset-speed')) || 0.55;
            
            el.style.transform  = 'translate(0, 0)';
            el.style.transition = `transform ${resetSpeed}s cubic-bezier(0.175,0.885,0.32,1.275)`;
        });
    });
}

/* Re-attach 3D tilt to newly injected [data-tilt] cards */
/* Re-attach 3D tilt to newly injected [data-tilt] cards.
   Skipped on mobile/tablet — same reasoning as attachMagnetic(). */
function attachTilt(root = document) {
    if (window.innerWidth < 768) return;

    root.querySelectorAll('[data-tilt]').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const nx = (e.clientX - rect.left) / rect.width  - 0.5;
            const ny = (e.clientY - rect.top)  / rect.height - 0.5;
            const MAX_DEG = 5;
            card.style.transform  = `perspective(900px) rotateX(${-ny * MAX_DEG}deg) rotateY(${nx * MAX_DEG}deg) translateY(-5px)`;
            card.style.transition = 'transform 0.1s ease-out';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform  = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)';
            card.style.transition = 'transform 0.55s cubic-bezier(0.4,0,0.2,1)';
        });
    });
}

/* Re-attach scroll reveal to newly injected .reveal elements */
function attachReveal(root = document) {
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

    root.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

/* Runs all interaction attachers on a freshly-rendered root */
function initInteractions(root = document) {
    attachCursorHover(root);
    attachMagnetic(root);
    attachTilt(root);
    attachReveal(root);
}

/* ----------------------------------------------------------------
   Builds a single work-card element from a CMS project object.
   Used by both renderWorkSection() (index.html) and
   renderProjectsGrid() (projects.html).

   Links to Projects/case-<slug>.html — e.g. slug: "oroma"
   → Projects/case-oroma.html

   BUG FIX: this function was referencing `tagsHTML` without ever
   declaring it — a leftover from when we removed tagsHTML from
   renderCaseStudy() during the tag-cleanup pass, but it was still
   needed HERE (work cards on index.html/projects.html still show
   full tag chips, only the case study meta row was changed to
   plain text). This threw a ReferenceError inside every .map()
   call, which silently emptied out both grids — that was the bug
   causing no cards to appear anywhere.
---------------------------------------------------------------- */
function buildWorkCard(project, delayClass = "") {
    const tagsHTML = project.tags.map(t => `<span class="chip">${t}</span>`).join("");
    return `
        <article class="work-card reveal ${delayClass}" data-tilt data-id="${project.id}">
            <!-- 
                1. Starts with '/' so it works from both home and projects subpage.
                2. Points to 'projects/' (lowercase).
                3. Drops '.html' to provide clean extensionless URLs natively supported by GitHub!
            -->
            <a href="/projects/${project.slug}" style="display:block;height:100%">
                <div class="work-thumb" data-hover-transition>
                    <img class="front-layer" src="${project.thumb}" alt="${project.title} thumbnail">
                    <img class="back-layer" src="${project.base || project.thumb}" alt="${project.title} secondary image">
                    <div class="work-overlay">
                        <div class="work-view-btn mag-target">View Project ↗</div>
                    </div>
                </div>
                <div class="work-info">
                    <div class="work-arrow">
                        <h3 class="work-title">${project.title}</h3>
                        <div class="work-tags">${tagsHTML}</div>
                    </div>
                    <svg width="35" height="35" viewBox="0 0 215 215" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M135.703 60.0437C135.703 61.1045 136.125 62.1219 136.875 62.872L151.579 77.5761C152.329 78.3263 153.347 78.7477 154.407 78.7477L172.792 78.7477C175.001 78.7477 176.792 80.5386 176.792 82.7477V154.747C176.792 156.957 175.001 158.747 172.792 158.747L155.792 158.747C153.583 158.747 151.792 156.957 151.792 154.747L151.792 89.8188C151.792 86.2552 147.484 84.4705 144.964 86.9903L70.9541 161C69.392 162.562 66.8593 162.562 65.2972 161L53.2764 148.979C51.7143 147.417 51.7143 144.884 53.2764 143.322L127.114 69.4847C129.634 66.9648 127.849 62.6562 124.286 62.6563L59.703 62.6568C57.4938 62.6569 55.703 60.866 55.703 58.6568L55.703 41.6568C55.703 39.4476 57.4938 37.6568 59.703 37.6568L131.703 37.6568C133.912 37.6568 135.703 39.4476 135.703 41.6567L135.703 60.0437Z" fill="var(--muted-white)"/>
                    </svg>
                </div>
            </a>
        </article>
    `;
}

/* ----------------------------------------------------------------
   Renders the homepage Work section (index.html)
   — shows only projects where featured: true
---------------------------------------------------------------- */
function renderWorkSection() {
    const grid = document.getElementById('workGrid');
    if (!grid || !window.PROJECTS) return;

    const delays = ['delay-1', 'delay-2', 'delay-1', 'delay-1', 'delay-2'];
    const featured = window.PROJECTS.filter(p => p.featured);

    grid.innerHTML = featured.map((p, i) => buildWorkCard(p, delays[i % delays.length])).join('');
    initInteractions(grid);
}

/* ----------------------------------------------------------------
   Renders the All Projects grid (projects.html)
   — supports optional tag/type filtering via .filter-pill[data-filter]
---------------------------------------------------------------- */
function renderProjectsGrid(filterTag = "All") {
    const grid = document.getElementById('allProjectsGrid');
    if (!grid || !window.PROJECTS) return;

    const list = filterTag === "All"
        ? window.PROJECTS
        : window.PROJECTS.filter(p => p.tags.includes(filterTag));

    grid.innerHTML = list.length
        ? list.map((p, i) => buildWorkCard(p, i % 2 === 0 ? 'delay-1' : 'delay-2')).join('')
        : `<div class="grid-empty-state">No projects match this filter yet.</div>`;

    initInteractions(grid);
}

function initProjectsFilters() {
    const pills = document.querySelectorAll('.filter-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            renderProjectsGrid(pill.dataset.filter);
        });
    });
}

/* ----------------------------------------------------------------
   Renders a single Case Study page (Projects/case-*.html)
   — reads data-project-slug from <body> and matches against
     window.PROJECTS

   PATH NOTE: This function only ever runs inside a file located at
   Projects/case-*.html — one folder level below root. That's why
   every asset path below (images, videos, back-link) is prefixed
   with "../" to correctly resolve back up to root-level folders
   like Assets/ and back to projects.html.
---------------------------------------------------------------- */
function renderCaseStudy() {
    const slug = document.body.dataset.projectSlug;
    const project = window.PROJECTS?.find(p => p.slug === slug);
    const root = document.getElementById('caseRoot');
    if (!root) return;

    if (!project) {
        root.innerHTML = `
            <div class="container" style="padding-top:180px;text-align:center">
                <h1 class="section-title">Project Not Found</h1>
                <p class="hero-desc" style="margin:20px auto">
                    No project with slug "<strong>${slug}</strong>" exists in projects-data.js.
                </p>
                <a href="../projects/" class="btn btn-solid mag-target" style="margin-top:24px;display:inline-flex">Back to Projects</a>
            </div>
        `;
        initInteractions(root);
        return;
    }

    document.title = `${project.title} — Darshan Daiv`;

/* Handles 3 frame types now: "image", "video", "split".
   "split" renders two images side by side using the new
   .case-frame-split CSS layout, which collapses to a full-width
   stack on mobile automatically via the existing 768px breakpoint. */
const framesHTML = project.frames.map(frame => {
    if (frame.type === "video") {
        return `
            <div class="case-frame reveal">
                <video class="case-frame-media" src="../${frame.src}" autoplay loop muted playsinline></video>
                ${frame.caption ? `<p class="case-frame-caption">${frame.caption}</p>` : ""}
            </div>`;
    }

    if (frame.type === "split") {
        const splitItemsHTML = frame.images.map(img => `
            <div class="case-frame-split-item">
                <img class="case-frame-media" src="../${img.src}" alt="${img.caption || project.title}">
                ${img.caption ? `<p class="case-frame-caption">${img.caption}</p>` : ""}
            </div>
        `).join("");

        return `
            <div class="case-frame case-frame-split reveal">
                ${splitItemsHTML}
            </div>`;
    }

    /* Default: "image" */
        return `
            <div class="case-frame reveal">
                <img class="case-frame-media" src="../${frame.src}" alt="${frame.caption || project.title}">
                ${frame.caption ? `<p class="case-frame-caption">${frame.caption}</p>` : ""}
            </div>`;
    }).join("");

    root.innerHTML = `
        <section class="case-hero">
            <div class="container">
                <div class="case-hero-top reveal">
                    <div>
                        <p class="section-eyebrow">${project.projectType} · ${project.year}</p>
                        <h1 class="case-title">${project.title}</h1>
                    </div>
                    <a href="${project.behanceUrl}" target="_blank" class="btn btn-solid mag-target">View on Behance ↗</a>
                </div>

                <div class="case-meta-row reveal delay-1">
                    <div class="case-meta-item">
                        <p class="ci-label">Client</p>
                        <p class="ci-value">${project.client}</p>
                    </div>
                    <div class="case-meta-item">
                        <p class="ci-label">Type</p>
                        <p class="ci-value">${project.projectType}</p>
                    </div>
                    <div class="case-meta-item">
                        <p class="ci-label">Category</p>
                        <p class="ci-value">${project.tags[0]}</p>
                    </div>
                    <div class="case-meta-item">
                        <p class="ci-label">Year</p>
                        <p class="ci-value">${project.year}</p>
                    </div>
                </div>
            </div>

            <div class="case-hero-image reveal delay-2">
                <img src="../${project.heroImage}" alt="${project.title} hero image">
            </div>
        </section>

        <section class="case-body">
            <div class="container">
                <p class="bold-text scroll-reveal-text" style="max-width:100%; font-weight: 400;">${project.description}</p>
            </div>
        </section>

        <section class="case-frames">
            <div class="container">
                ${framesHTML}
            </div>
        </section>

        ${project.summary ? `
        <section class="case-summary">
            <div class="container">
                <p class="section-eyebrow">Summary</p>
                <p class="bold-text scroll-reveal-text" style="max-width:100%; font-weight: 400;">${project.summary}</p>
            </div>
        </section>
        ` : ""}

        <section class="case-next">
            <div class="container reveal" style="text-align:center;padding:60px 0">
                <a href="../projects/" class="btn btn-ghost mag-target">← Back to All Projects</a>
            </div>
        </section>
    `;

    initInteractions(root);
}

/* ================================================================
   SECTION 6 — PLAYGROUND CANVAS (Particle Physics)
   Guarded: #playBox / #play-canvas only exist on index.html's
   Milestones section. Without this check, accessing
   playCanvas.getContext('2d') on projects.html or any case study
   page would throw (playCanvas is null there), silently halting
   everything below this point in the script's execution.
================================================================ */
const playBox    = document.getElementById('playBox');
const playCanvas = document.getElementById('play-canvas');

if (playBox && playCanvas) {
    const pCtx    = playCanvas.getContext('2d');
    const PALETTE = ['#FFFFFF'];

    let pMouseX, pMouseY;

    var resizePlayCanvas = function () {
        playCanvas.width  = playBox.clientWidth;
        playCanvas.height = playBox.clientHeight;
        pMouseX = playCanvas.width  / 2;
        pMouseY = playCanvas.height / 2;
    };
    resizePlayCanvas();

    playBox.addEventListener('mousemove', e => {
        const r = playCanvas.getBoundingClientRect();
        pMouseX = e.clientX - r.left;
        pMouseY = e.clientY - r.top;
    });

    class Particle {
        constructor(x, y) {
            this.spawn(x, y);
        }

        spawn(x, y) {
            this.x     = x  ?? Math.random() * playCanvas.width;
            this.y     = y  ?? Math.random() * playCanvas.height;
            this.vx    = (Math.random() - 0.5) * 1.2;
            this.vy    = (Math.random() - 0.5) * 1.2;
            this.r     = Math.random() * 3 + 0.8;
            this.color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
            this.alpha = Math.random() * .9 + 0.25;
            this.life  = 0.4;
            this.decay = Math.random() * 0.018 + 0.008;
        }

        update() {
            const dx    = pMouseX - this.x;
            const dy    = pMouseY - this.y;
            const dist  = Math.hypot(dx, dy);
            const REPEL = 100;
            const PULL  = 300;

            if (dist < REPEL && dist > 0) {
                const f = (REPEL - dist) / REPEL;
                this.vx -= (dx / dist) * f * 0.8;
                this.vy -= (dy / dist) * f * 0.8;
            } else if (dist < PULL) {
                this.vx += dx * 0.00006;
                this.vy += dy * 0.00006;
            }

            this.vx *= 0.968;
            this.vy *= 0.968;

            this.x += this.vx;
            this.y += this.vy;

            this.life -= this.decay;

            if (this.x < 0) this.x = playCanvas.width;
            if (this.x > playCanvas.width) this.x = 0;
            if (this.y < 0) this.y = playCanvas.height;
            if (this.y > playCanvas.height) this.y = 0;
        }

        draw() {
            pCtx.save();
            pCtx.globalAlpha  = this.alpha * this.life;
            pCtx.fillStyle    = this.color;
            pCtx.shadowColor  = this.color;
            pCtx.beginPath();
            pCtx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            pCtx.fill();
            pCtx.restore();
        }
    }

    var particles = [];
    var spawnInitial = function () {
        particles = [];
        const COUNT = Math.min(90, Math.floor(playCanvas.width / 9));
        for (let i = 0; i < COUNT; i++) particles.push(new Particle());
    };
    spawnInitial();

    playBox.addEventListener('click', e => {
        const r  = playCanvas.getBoundingClientRect();
        const cx = e.clientX - r.left;
        const cy = e.clientY - r.top;

        for (let i = 0; i < 12; i++) {
            const p     = new Particle(cx, cy);
            const angle = (Math.PI * 2 * i) / 12;
            p.vx = Math.cos(angle) * (Math.random() * 3.5 + 1);
            p.vy = Math.sin(angle) * (Math.random() * 3.5 + 1);
            p.r  = Math.random() * 5 + 2;
            particles.push(p);
            if (particles.length > 160) particles.shift();
        }
    });

    function drawLinks() {
        const D = 250;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
                if (dist < D) {
                    pCtx.save();
                    pCtx.globalAlpha = (1 - dist / D) * 0.18;
                    pCtx.strokeStyle = '#FFFFFF';
                    pCtx.lineWidth   = 0.5;
                    pCtx.beginPath();
                    pCtx.moveTo(particles[i].x, particles[i].y);
                    pCtx.lineTo(particles[j].x, particles[j].y);
                    pCtx.stroke();
                    pCtx.restore();
                }
            }
        }
    }

    function tickPlayground() {
        pCtx.clearRect(0, 0, playCanvas.width, playCanvas.height);
        particles.forEach(p => {
            if (p.life <= 0) p.spawn();
            p.update();
            p.draw();
        });
        drawLinks();
        requestAnimationFrame(tickPlayground);
    }
    tickPlayground();
}

/* ================================================================
   SECTION 8 — COUNTER ANIMATION
   NOTE: No elements with [data-count] currently exist in markup.
   Add e.g. <div class="stat-num" data-count="120">0+</div>
   inside a .stat-card to activate this feature.
================================================================ */
document.querySelectorAll('[data-count]').forEach(el => {
    new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;

        const target   = parseInt(el.dataset.count, 10);
        const duration = 1600;
        const startTs  = performance.now();

        function step(now) {
            const elapsed  = now - startTs;
            const progress = Math.min(elapsed / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target) + '+';
            if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }, { threshold: 0.6 }).observe(el);
});

/* ================================================================
   SECTION 11 — WINDOW RESIZE — debounced
   Guarded: resizePlayCanvas/spawnInitial only get defined inside
   the "if (playBox && playCanvas)" block in Section 6, so on pages
   without the playground (projects.html, case studies), they don't
   exist — check before calling to avoid a ReferenceError on resize.
================================================================ */
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        resizeGrid();
        if (typeof resizePlayCanvas === 'function') resizePlayCanvas();
        if (typeof spawnInitial === 'function') spawnInitial();
    }, 200);
});

/* ================================================================
   SECTION 12 — INITIAL PAGE-LOAD INTERACTION BINDING
   Attaches cursor/magnetic/tilt/reveal to elements that exist
   statically on page load (navbar, menu, milestones section, etc).
   Dynamically injected content (work cards, case study body) calls
   initInteractions() separately after its own render.
================================================================ */
initInteractions(document);
