/**
 * =========================================================================
 * GEOMETRIC HOVER TRANSITION SYSTEM
 * =========================================================================
 * Custom parameters: Universal density scale + independent width/height pattern controllers.
 */

const TRANSITION_CONFIG = {
    speed: 0.12,             // SPEED: Easing rate (Higher = faster, e.g. 0.12 is snappy)
    density: 18,             // DENSITY: Overall scale of the pattern (how many units fit)
    
    // --- PATTERN SCALE CONTROLS ---
    barWidth: 1.0,           // WIDTH: Horizontal scale multiplier (e.g., 2.0 = stretched wide, 0.5 = squished narrow)
    barHeight: 3,          // HEIGHT: Vertical scale multiplier (e.g., 2.0 = tall vertical blocks, 0.5 = short flat blocks)
    
    delayRange: 0.60,        // SPREAD: Center-to-edges delay scale
    revealThreshold: 0.98,   // THRESHOLD: Point at which the real HTML layer snaps in
    overlapFactor: 1.05      // OVERLAP: Extra multiplier on line width to prevent gaps
};

class HoverTransition {
    constructor(container) {
        if (container.dataset.transitionInitialized) return;
        container.dataset.transitionInitialized = "true";

        this.container = container;
        
        // Find elements within the host block
        this.front = container.querySelector('.front-layer');
        this.back = container.querySelector('.back-layer');
        
        if (!this.front || !this.back) return;

        // Initialize state variables
        this.progress = 0;
        this.targetProgress = 0;
        this.animationFrameId = null;
        this.isHovered = false;

        // Create canvas overlay dynamically inside the host container
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '5'; // Placed directly between front and back images
        this.canvas.style.pointerEvents = 'none'; // Keep hover overlay links interactive
        
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // Track active container boundaries
        this.cachedWidth = 0;
        this.cachedHeight = 0;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Bind interactive triggers
        this.container.addEventListener('mouseenter', () => {
            this.isHovered = true;
            this.targetProgress = 1;
            this.startLoop();
        });

        this.container.addEventListener('mouseleave', () => {
            this.isHovered = false;
            this.targetProgress = 0;
            this.startLoop();
        });
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const dpr = window.devicePixelRatio || 1;

        // Set screen buffer sizes
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);

        this.cachedWidth = rect.width;
        this.cachedHeight = rect.height;
        this.draw();
    }

    startLoop() {
        if (!this.animationFrameId) {
            this.tick();
        }
    }

    tick() {
        const diff = this.targetProgress - this.progress;
        if (Math.abs(diff) < 0.001) {
            this.progress = this.targetProgress;
            this.draw();
            this.animationFrameId = null;
            return;
        }

        this.progress += diff * TRANSITION_CONFIG.speed;
        this.draw();
        this.animationFrameId = requestAnimationFrame(() => this.tick());
    }

    /**
     * Draws the image directly inside the clip path during animation frames.
     * This dynamically scales the image to match the container's exact, changing size.
     */
    drawRevealedImage(width, height) {
        if (this.back && this.back.complete && this.back.naturalWidth > 0) {
            const imgWidth = this.back.naturalWidth;
            const imgHeight = this.back.naturalHeight;
            const imgRatio = imgWidth / imgHeight;
            const containerRatio = width / height;

            let sourceX = 0, sourceY = 0, sourceWidth = imgWidth, sourceHeight = imgHeight;

            // Replicate 'object-fit: cover' mathematics dynamically
            if (containerRatio > imgRatio) {
                sourceHeight = imgWidth / containerRatio;
                sourceY = (imgHeight - sourceHeight) / 2;
            } else {
                sourceWidth = imgHeight * containerRatio;
                sourceX = (imgWidth - sourceWidth) / 2;
            }

            this.ctx.drawImage(this.back, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
        } else {
            // Dark gray fallback if image is missing
            this.ctx.fillStyle = '#1b1b1b';
            this.ctx.fillRect(0, 0, width, height);
        }
    }

    draw() {
        const rect = this.container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        // If layout sizes changed during this draw step, resize canvas buffer immediately
        if (rect.width !== this.cachedWidth || rect.height !== this.cachedHeight) {
            const dpr = window.devicePixelRatio || 1;
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.scale(dpr, dpr);
            this.cachedWidth = rect.width;
            this.cachedHeight = rect.height;
        }

        const width = this.cachedWidth;
        const height = this.cachedHeight;
        
        this.ctx.clearRect(0, 0, width, height);

        // Swap native visibility layers at 100% transition peak
        if (this.progress >= TRANSITION_CONFIG.revealThreshold) {
            this.container.classList.add('transition-revealed');
            return;
        } else {
            this.container.classList.remove('transition-revealed');
        }

        if (this.progress <= 0) return;

        // Base cell sizing based on height-density settings
        const baseSize = height / TRANSITION_CONFIG.density;
        
        // DECOUPLED CUSTOM SIZE: Scale dimensions independently using our custom width/height values
        const cellW = baseSize * TRANSITION_CONFIG.barWidth;
        const cellH = baseSize * TRANSITION_CONFIG.barHeight;

        // Determine column and row calculations dynamically
        const rows = Math.ceil(height / cellH);
        const cols = Math.ceil(width / cellW);
        
        const centerX = cols / 2;
        const centerY = rows / 2;
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

        // --- PHASE 1: Draw Customizable Mask Grid ---
        this.ctx.globalCompositeOperation = 'source-over';

        for (let r = 0; r < rows; r++) {
            const y = r * cellH;
            const rowOffset = (r % 2 === 0) ? (cellW * 0.25) : -(cellW * 0.25);

            for (let c = -1; c <= cols + 1; c++) {
                const x = c * cellW + rowOffset;
                
                // Radial center-out delay mapping
                const distToCenter = Math.sqrt(Math.pow(c - centerX, 2) + Math.pow(r - centerY, 2));
                const normalizedDist = distToCenter / maxDistance;
                
                const delayFactor = normalizedDist * TRANSITION_CONFIG.delayRange;
                const localProgress = Math.max(0, Math.min(1, (this.progress - delayFactor) / (1 - TRANSITION_CONFIG.delayRange)));

                if (localProgress > 0) {
                    const maxLineWidth = cellW * TRANSITION_CONFIG.overlapFactor;
                    const currentWidth = localProgress * maxLineWidth;

                    this.ctx.fillStyle = '#000000';
                    this.ctx.fillRect(
                        x + (cellW - currentWidth) / 2,
                        y,
                        currentWidth,
                        cellH + 0.6
                    );
                }
            }
        }

        // --- PHASE 2: Map Images Directly to Masks ---
        this.ctx.globalCompositeOperation = 'source-in';
        this.drawRevealedImage(width, height);
    }
}

/**
 * DYNAMIC MONITORING ENGINE
 */
function initExisting() {
    document.querySelectorAll('[data-hover-transition]').forEach(el => new HoverTransition(el));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initExisting();
        observeMutations();
    });
} else {
    initExisting();
    observeMutations();
}

function observeMutations() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // ELEMENT_NODE
                    if (node.hasAttribute('data-hover-transition')) {
                        new HoverTransition(node);
                    }
                    const nestedTargets = node.querySelectorAll('[data-hover-transition]');
                    nestedTargets.forEach(target => new HoverTransition(target));
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}