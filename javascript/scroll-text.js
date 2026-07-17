/**
 * =========================================================================
 * SCROLL-LINKED LINE-BY-LINE TEXT REVEAL ENGINE
 * =========================================================================
 * Groups words dynamically based on their physical wrap coordinates,
 * illuminating text smoothly line-by-line as it enters the scroll view.
 */

class ScrollLineReveal {
    constructor(element) {
        this.element = element;
        this.originalText = element.textContent.trim();
        this.init();
    }

    init() {
        this.splitTextIntoWords();
        this.groupWordsIntoLines();
        this.handleScroll();
        
        // Listen to scroll and layout resize updates
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
        window.addEventListener('resize', () => {
            // Re-group wraps on resize (essential for responsive mobile rotation)
            this.groupWordsIntoLines();
            this.handleScroll();
        }, { passive: true });
    }

    /**
     * Initial split: Wrap each word in a temporary tag so we can measure positions.
     */
    splitTextIntoWords() {
        const words = this.originalText.split(/\s+/);
        this.element.innerHTML = words.map(word => {
            return `<span class="temp-word">${word}</span>`;
        }).join(' ');
    }

    /**
     * Grouping algorithm: Measures the vertical coordinate of each word,
     * wrapping elements with matching 'top' values inside unified line wrappers.
     */
    groupWordsIntoLines() {
        const tempWords = this.element.querySelectorAll('.temp-word');
        if (tempWords.length === 0) return;

        const linesMap = {};

        // 1. Group word elements by their offsetTop values
        tempWords.forEach(word => {
            const top = word.offsetTop;
            if (!linesMap[top]) {
                linesMap[top] = [];
            }
            linesMap[top].push(word.textContent);
        });

        // 2. Build final line-wrapped HTML
        const sortedTops = Object.keys(linesMap).sort((a, b) => Number(a) - b);
        this.element.innerHTML = sortedTops.map(top => {
            const lineText = linesMap[top].join(' ');
            return `<div class="reveal-line-wrap"><span class="reveal-line">${lineText}</span></div>`;
        }).join('\n');

        this.lines = this.element.querySelectorAll('.reveal-line');
    }

    handleScroll() {
        if (!this.lines) return;
        
        const viewportHeight = window.innerHeight;
        
        this.lines.forEach(line => {
            const rect = line.getBoundingClientRect();
            
            // Define scroll illumination boundary range
            const triggerStart = viewportHeight * 0.82; // When lines enter from the bottom
            const triggerEnd = viewportHeight * 0.45;   // When lines reach upper viewport half

            // Linear interpolation mapping (0.0 to 1.0)
            let progress = (triggerStart - rect.top) / (triggerStart - triggerEnd);
            progress = Math.max(0, Math.min(1, progress));

            // Set progress to drive CSS gradient fill percentage
            line.style.setProperty('--line-reveal-progress', progress);
        });
    }
}

// Auto-run: Instantiates classes on load
document.addEventListener('DOMContentLoaded', () => {
    const targets = document.querySelectorAll('.scroll-reveal-text');
    targets.forEach(target => new ScrollLineReveal(target));
});