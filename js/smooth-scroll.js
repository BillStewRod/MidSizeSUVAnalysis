// Enhanced Smooth Scrolling Controller

class SmoothScrollController {
    constructor() {
        this.isScrolling = false;
        this.scrollTargets = new Map();
        this.easingFunctions = {
            easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
            easeOutQuart: t => 1 - (--t) * t * t * t,
            easeInOutQuint: t => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t
        };
        this.init();
    }

    init() {
        this.setupSmoothScrolling();
        this.initScrollIndicators();
        this.initScrollToSection();
        this.initKeyboardNavigation();
        this.initTouchGestures();
    }

    setupSmoothScrolling() {
        // Polyfill check for smooth scrolling
        if (!this.supportsSmoothScrolling()) {
            this.enableCustomSmoothScrolling();
        }

        // Handle all anchor links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link && this.shouldHandleLink(link)) {
                e.preventDefault();
                this.scrollToTarget(link.getAttribute('href'));
            }
        });
    }

    supportsSmoothScrolling() {
        return 'scrollBehavior' in document.documentElement.style;
    }

    shouldHandleLink(link) {
        const href = link.getAttribute('href');
        return href !== '#' && href !== '' && !link.classList.contains('no-smooth-scroll');
    }

    scrollToTarget(targetSelector, options = {}) {
        if (this.isScrolling) return;

        const target = document.querySelector(targetSelector);
        if (!target) return;

        const defaultOptions = {
            duration: 800,
            easing: 'easeInOutCubic',
            offset: 80, // Account for fixed navbar
            callback: null
        };

        const config = { ...defaultOptions, ...options };
        
        this.animateScrollTo(target, config);
    }

    animateScrollTo(target, config) {
        const startPosition = window.pageYOffset;
        const targetPosition = target.offsetTop - config.offset;
        const distance = targetPosition - startPosition;
        const startTime = performance.now();

        this.isScrolling = true;

        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / config.duration, 1);
            
            const easedProgress = this.easingFunctions[config.easing](progress);
            const currentPosition = startPosition + (distance * easedProgress);

            window.scrollTo(0, currentPosition);

            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            } else {
                this.isScrolling = false;
                if (config.callback) config.callback();
                this.updateScrollIndicators();
            }
        };

        requestAnimationFrame(animateScroll);
    }

    enableCustomSmoothScrolling() {
        // For browsers that don't support native smooth scrolling
        const style = document.createElement('style');
        style.textContent = `
            html { scroll-behavior: auto !important; }
        `;
        document.head.appendChild(style);
    }

    // Scroll indicators and progress
    initScrollIndicators() {
        this.createScrollProgress();
        this.createSectionIndicators();
        
        window.addEventListener('scroll', this.throttle(() => {
            this.updateScrollIndicators();
        }, 16));
    }

    createScrollProgress() {
        const progressBar = document.getElementById('scroll-progress');
        if (progressBar) {
            this.scrollTargets.set('progress', progressBar);
        }
    }

    createSectionIndicators() {
        const sections = document.querySelectorAll('section[id]');
        if (sections.length === 0) return;

        const indicatorsContainer = document.createElement('div');
        indicatorsContainer.className = 'section-indicators';
        indicatorsContainer.innerHTML = `
            <div class="indicators-wrapper">
                ${Array.from(sections).map(section => `
                    <div class="indicator" data-target="#${section.id}" title="${this.getSectionTitle(section)}">
                        <span class="indicator-dot"></span>
                    </div>
                `).join('')}
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .section-indicators {
                position: fixed;
                right: 2rem;
                top: 50%;
                transform: translateY(-50%);
                z-index: 999;
                display: none;
            }

            @media (min-width: 1024px) {
                .section-indicators {
                    display: block;
                }
            }

            .indicators-wrapper {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .indicator {
                cursor: pointer;
                padding: 0.5rem;
                position: relative;
            }

            .indicator-dot {
                display: block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: rgba(216, 191, 216, 0.4);
                transition: all 0.3s ease;
            }

            .indicator:hover .indicator-dot,
            .indicator.active .indicator-dot {
                background: var(--medium-purple);
                transform: scale(1.5);
            }

            .indicator::before {
                content: attr(title);
                position: absolute;
                right: 100%;
                top: 50%;
                transform: translateY(-50%);
                background: var(--text-dark);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                white-space: nowrap;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                margin-right: 1rem;
                font-size: 0.9rem;
            }

            .indicator:hover::before {
                opacity: 1;
                visibility: visible;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(indicatorsContainer);

        // Add click handlers
        indicatorsContainer.addEventListener('click', (e) => {
            const indicator = e.target.closest('.indicator');
            if (indicator) {
                const target = indicator.dataset.target;
                this.scrollToTarget(target);
            }
        });

        this.scrollTargets.set('indicators', indicatorsContainer);
    }

    getSectionTitle(section) {
        const title = section.querySelector('h1, h2, h3');
        return title ? title.textContent.trim() : section.id;
    }

    updateScrollIndicators() {
        this.updateScrollProgress();
        this.updateSectionIndicators();
        this.updateNavigationHighlight();
    }

    updateScrollProgress() {
        const progressBar = this.scrollTargets.get('progress');
        if (!progressBar) return;

        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;

        progressBar.style.width = scrolled + '%';
    }

    updateSectionIndicators() {
        const indicators = this.scrollTargets.get('indicators');
        if (!indicators) return;

        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 150; // Offset for better detection

        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.id;
            }
        });

        // Update indicator states
        indicators.querySelectorAll('.indicator').forEach(indicator => {
            const target = indicator.dataset.target.replace('#', '');
            indicator.classList.toggle('active', target === currentSection);
        });
    }

    updateNavigationHighlight() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100;

        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.id;
            }
        });

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${currentSection}`);
        });
    }

    // Section-based scrolling
    initScrollToSection() {
        this.currentSectionIndex = 0;
        this.sections = Array.from(document.querySelectorAll('section[id]'));
    }

    scrollToNextSection() {
        if (this.currentSectionIndex < this.sections.length - 1) {
            this.currentSectionIndex++;
            this.scrollToTarget(`#${this.sections[this.currentSectionIndex].id}`);
        }
    }

    scrollToPreviousSection() {
        if (this.currentSectionIndex > 0) {
            this.currentSectionIndex--;
            this.scrollToTarget(`#${this.sections[this.currentSectionIndex].id}`);
        }
    }

    // Keyboard navigation
    initKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Skip if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.key) {
                case 'Home':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.scrollToTarget('#hero');
                    }
                    break;
                case 'End':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                    }
                    break;
                case 'PageDown':
                    e.preventDefault();
                    this.scrollToNextSection();
                    break;
                case 'PageUp':
                    e.preventDefault();
                    this.scrollToPreviousSection();
                    break;
                case 'ArrowDown':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.scrollToNextSection();
                    }
                    break;
                case 'ArrowUp':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.scrollToPreviousSection();
                    }
                    break;
            }
        });
    }

    // Touch gestures for mobile
    initTouchGestures() {
        let touchStartY = 0;
        let touchEndY = 0;
        let isSwipeGesture = false;

        document.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
            isSwipeGesture = false;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            const touchMoveY = e.changedTouches[0].screenY;
            const deltaY = Math.abs(touchMoveY - touchStartY);
            
            if (deltaY > 50) {
                isSwipeGesture = true;
            }
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (!isSwipeGesture) return;

            touchEndY = e.changedTouches[0].screenY;
            const deltaY = touchStartY - touchEndY;
            const threshold = 100;

            if (Math.abs(deltaY) > threshold) {
                if (deltaY > 0) {
                    // Swipe up - go to next section
                    this.scrollToNextSection();
                } else {
                    // Swipe down - go to previous section
                    this.scrollToPreviousSection();
                }
            }
        }, { passive: true });
    }

    // Utility functions
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Public API methods
    scrollTo(target, options) {
        this.scrollToTarget(target, options);
    }

    getCurrentSection() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 150;

        for (let section of sections) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                return section.id;
            }
        }

        return null;
    }

    destroy() {
        // Clean up event listeners and DOM elements
        const indicators = this.scrollTargets.get('indicators');
        if (indicators) {
            indicators.remove();
        }
        this.scrollTargets.clear();
    }
}

// Initialize smooth scroll controller
document.addEventListener('DOMContentLoaded', function() {
    window.smoothScrollController = new SmoothScrollController();
});

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmoothScrollController;
}
