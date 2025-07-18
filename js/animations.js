// Advanced Animation Controller for Honda Passport Website

class AnimationController {
    constructor() {
        this.observers = new Map();
        this.animationQueue = [];
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.init();
    }

    init() {
        this.setupIntersectionObservers();
        this.initScrollAnimations();
        this.initHoverAnimations();
        this.initLoadingAnimations();
        this.initParallaxEffects();
    }

    // Setup Intersection Observers for different animation types
    setupIntersectionObservers() {
        // Fade in observer
        const fadeInObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateFadeIn(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -20px 0px'
        });

        // Slide in observer
        const slideInObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateSlideIn(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -30px 0px'
        });

        // Scale in observer
        const scaleInObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateScaleIn(entry.target);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -40px 0px'
        });

        this.observers.set('fadeIn', fadeInObserver);
        this.observers.set('slideIn', slideInObserver);
        this.observers.set('scaleIn', scaleInObserver);

        // Observe elements
        this.observeElements();
    }

    observeElements() {
        // Fade in elements
        document.querySelectorAll('.fade-in').forEach(el => {
            this.observers.get('fadeIn').observe(el);
        });

        // Slide in elements
        document.querySelectorAll('.slide-in').forEach(el => {
            this.observers.get('slideIn').observe(el);
        });

        // Scale in elements
        document.querySelectorAll('.scale-in').forEach(el => {
            this.observers.get('scaleIn').observe(el);
        });
    }

    // Animation methods
    animateFadeIn(element) {
        if (this.isReducedMotion) {
            element.classList.add('visible');
            return;
        }

        const delay = element.dataset.delay || 0;
        setTimeout(() => {
            element.classList.add('visible');
            element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        }, delay);
    }

    animateSlideIn(element) {
        if (this.isReducedMotion) {
            element.classList.add('visible');
            return;
        }

        const direction = element.dataset.direction || 'up';
        const delay = element.dataset.delay || 0;

        setTimeout(() => {
            element.classList.add('slide-in-active');
            element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        }, delay);
    }

    animateScaleIn(element) {
        if (this.isReducedMotion) {
            element.classList.add('visible');
            return;
        }

        const delay = element.dataset.delay || 0;
        setTimeout(() => {
            element.classList.add('scale-in-active');
            element.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        }, delay);
    }

    // Scroll-based animations
    initScrollAnimations() {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateScrollAnimations();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    updateScrollAnimations() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;

        // Parallax effect for hero section
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${rate}px)`;
        }

        // Animate section titles based on scroll position
        this.animateScrollBasedElements(scrolled);
    }

    animateScrollBasedElements(scrolled) {
        const elements = document.querySelectorAll('.scroll-animate');
        elements.forEach(element => {
            const elementTop = element.offsetTop;
            const elementHeight = element.offsetHeight;
            const windowHeight = window.innerHeight;

            if (scrolled + windowHeight > elementTop && scrolled < elementTop + elementHeight) {
                const progress = (scrolled + windowHeight - elementTop) / (windowHeight + elementHeight);
                this.updateElementAnimation(element, progress);
            }
        });
    }

    updateElementAnimation(element, progress) {
        const clampedProgress = Math.max(0, Math.min(1, progress));
        
        if (element.classList.contains('fade-on-scroll')) {
            element.style.opacity = clampedProgress;
        }
        
        if (element.classList.contains('slide-on-scroll')) {
            const translateY = (1 - clampedProgress) * 50;
            element.style.transform = `translateY(${translateY}px)`;
        }
    }

    // Hover animations
    initHoverAnimations() {
        this.initCardHoverEffects();
        this.initButtonHoverEffects();
        this.initLinkHoverEffects();
    }

    initCardHoverEffects() {
        const cards = document.querySelectorAll('.trim-card, .video-card, .financing-card, .incentives-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (!this.isReducedMotion) {
                    this.animateCardHover(card, true);
                }
            });

            card.addEventListener('mouseleave', () => {
                if (!this.isReducedMotion) {
                    this.animateCardHover(card, false);
                }
            });
        });
    }

    animateCardHover(card, isHovering) {
        if (isHovering) {
            card.style.transform = 'translateY(-8px) scale(1.02)';
            card.style.boxShadow = '0 20px 40px rgba(216, 191, 216, 0.3)';
        } else {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = '0 8px 32px rgba(216, 191, 216, 0.1)';
        }
    }

    initButtonHoverEffects() {
        const buttons = document.querySelectorAll('.cta-button, .back-to-top');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                if (!this.isReducedMotion) {
                    this.animateButtonHover(button, true);
                }
            });

            button.addEventListener('mouseleave', () => {
                if (!this.isReducedMotion) {
                    this.animateButtonHover(button, false);
                }
            });
        });
    }

    animateButtonHover(button, isHovering) {
        if (isHovering) {
            button.style.transform = 'translateY(-2px) scale(1.05)';
            button.style.boxShadow = '0 8px 24px rgba(216, 191, 216, 0.4)';
        } else {
            button.style.transform = 'translateY(0) scale(1)';
            button.style.boxShadow = '0 4px 16px rgba(216, 191, 216, 0.2)';
        }
    }

    initLinkHoverEffects() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                if (!this.isReducedMotion) {
                    this.animateLinkHover(link, true);
                }
            });

            link.addEventListener('mouseleave', () => {
                if (!this.isReducedMotion) {
                    this.animateLinkHover(link, false);
                }
            });
        });
    }

    animateLinkHover(link, isHovering) {
        const underline = link.querySelector('::after') || this.createUnderline(link);
        
        if (isHovering) {
            link.style.color = 'var(--dark-purple)';
        } else {
            link.style.color = 'var(--text-dark)';
        }
    }

    // Loading animations
    initLoadingAnimations() {
        this.animatePageLoad();
        this.initProgressiveImageLoading();
        this.initSkeletonLoading();
    }

    animatePageLoad() {
        document.body.classList.add('page-loaded');
        
        // Animate hero elements
        const heroElements = document.querySelectorAll('.hero .fade-in');
        heroElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('visible');
            }, index * 200 + 300);
        });
    }

    initProgressiveImageLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImage(img);
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        img.classList.add('loading');
        
        const tempImg = new Image();
        tempImg.onload = () => {
            img.src = src;
            img.classList.remove('loading');
            img.classList.add('loaded');
        };
        tempImg.src = src;
    }

    initSkeletonLoading() {
        const skeletonElements = document.querySelectorAll('.skeleton');
        
        setTimeout(() => {
            skeletonElements.forEach(element => {
                element.classList.remove('skeleton');
                element.classList.add('loaded');
            });
        }, 1000);
    }

    // Parallax effects
    initParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.parallax');
        
        if (this.isReducedMotion) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const rate = scrolled * (element.dataset.speed || 0.5);
                element.style.transform = `translateY(${rate}px)`;
            });
        }, { passive: true });
    }

    // Utility methods
    staggerAnimation(elements, animationClass, delay = 100) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add(animationClass);
            }, index * delay);
        });
    }

    createRippleEffect(element, event) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            background-color: rgba(255, 255, 255, 0.7);
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
        `;

        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Performance monitoring
    monitorPerformance() {
        const perfObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.name.includes('animation') && entry.duration > 16) {
                    console.warn('Long animation detected:', entry.name, entry.duration);
                }
            });
        });

        if ('PerformanceObserver' in window) {
            perfObserver.observe({ entryTypes: ['measure'] });
        }
    }

    // Cleanup method
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        this.animationQueue = [];
    }
}

// Enhanced CSS Animation Styles (injected dynamically)
const animationStyles = `
    .slide-in {
        opacity: 0;
        transform: translateY(50px);
    }

    .slide-in-active {
        opacity: 1;
        transform: translateY(0);
    }

    .scale-in {
        opacity: 0;
        transform: scale(0.8);
    }

    .scale-in-active {
        opacity: 1;
        transform: scale(1);
    }

    .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200px 100%;
        animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
        0% { background-position: -200px 0; }
        100% { background-position: calc(200px + 100%) 0; }
    }

    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }

    .page-loaded .hero-title {
        animation: slideInFromBottom 1s ease-out;
    }

    .page-loaded .hero-subtitle {
        animation: slideInFromBottom 1s ease-out 0.2s both;
    }

    .page-loaded .executive-summary {
        animation: scaleIn 1s ease-out 0.4s both;
    }

    @media (prefers-reduced-motion: reduce) {
        .slide-in,
        .scale-in,
        .fade-in {
            opacity: 1 !important;
            transform: none !important;
        }
        
        * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }
`;

// Inject animation styles
function injectAnimationStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = animationStyles;
    document.head.appendChild(styleSheet);
}

// Initialize animation controller when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    injectAnimationStyles();
    
    // Small delay to ensure all elements are rendered
    setTimeout(() => {
        window.animationController = new AnimationController();
    }, 100);
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationController;
}
