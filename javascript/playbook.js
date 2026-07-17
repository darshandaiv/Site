(function () {
    const slides = Array.from(document.querySelectorAll('.playbook-slide'));
    const prevBtn = document.getElementById('deckPrev');
    const nextBtn = document.getElementById('deckNext');

    if (slides.length === 0 || !prevBtn || !nextBtn) return;

    let currentIndex = 0;
    let isTransitioning = false;

    // Direct active alignment on initial DOM paint
    slides.forEach((slide, i) => {
        if (i !== currentIndex) {
            if (window.innerWidth <= 768) {
                slide.style.display = 'none';
            }
        }
    });

    function changeSlide(nextIndex, direction) {
        if (isTransitioning || nextIndex === currentIndex) return;
        isTransitioning = true;

        const currentSlide = slides[currentIndex];
        const nextSlide = slides[nextIndex];

        // 1. Prepare Next Slide starting location off-screen
        if (window.innerWidth <= 768) {
            nextSlide.style.display = 'flex';
        }
        
        nextSlide.style.opacity = '0';
        nextSlide.style.transform = direction === 'next' ? 'translateX(50px)' : 'translateX(-50px)';

        // Repaint calculation block
        nextSlide.offsetHeight;

        // 2. Animate Current Slide out of view
        currentSlide.style.transform = direction === 'next' ? 'translateX(-50px)' : 'translateX(50px)';
        currentSlide.style.opacity = '0';

        // 3. Animate Next Slide into active view
        nextSlide.style.transform = 'translateX(0)';
        nextSlide.style.opacity = '1';

        setTimeout(() => {
            currentSlide.classList.remove('active');
            nextSlide.classList.add('active');

            if (window.innerWidth <= 768) {
                currentSlide.style.display = 'none';
            }

            currentIndex = nextIndex;
            isTransitioning = false;
        }, 600); // Perfect sync with CSS transition speed
    }

    nextBtn.addEventListener('click', () => {
        const nextIndex = (currentIndex + 1) % slides.length;
        changeSlide(nextIndex, 'next');
    });

    prevBtn.addEventListener('click', () => {
        const nextIndex = (currentIndex - 1 + slides.length) % slides.length;
        changeSlide(nextIndex, 'prev');
    });
})();