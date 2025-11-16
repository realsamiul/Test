/**
 * - Hardware Template - Production Master Animation System
 * - Optimized for mobile-first, buttery smooth scrolling
 * - All pages analyzed from hardware-technology-consulting-template.webflow.io
 * - — Phase 2 Update —
 * - Added error boundary for CDN import failures.
 * -----
 */

window.addEventListener('error', (e) => {
  if (e.message.includes('Failed to fetch') || e.message.includes('CDN')) {
    console.warn('Animation library failed to load. Site will work but animations disabled.');
    document.body.classList.remove('loading');
  }
});

// Import from local '/lib/' folder
import { gsap } from './lib/gsap-core.js';
import { ScrollTrigger } from './lib/ScrollTrigger.js';
import { SplitText } from './lib/SplitText.js';
import { Flip } from './lib/Flip.js';
import Lenis from './lib/lenis.esm.js';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip);

// ============================================================================
// CONFIGURATION - Mobile-optimized, premium feel
// ============================================================================

const CONFIG = {
  lenis: {
    duration: 1.2,        // Slightly slower on mobile for smoother feel
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    smoothTouch: true,    // Enable smooth touch scrolling on mobile
    wheelMultiplier: 0.7, // Slower wheel scroll (more inertia)
    touchMultiplier: 1.8, // More inertia on mobile touch scroll
    infinite: false,
    lerp: 0.15,           // Increased inertia (slower scroll) for a buttery feel
  },
  pageTransition: {
    duration: 0.5,        // Fast transitions
    ease: 'expo.inOut',   // Premium easing
  },
  heroEntrance: {
    duration: 1.0,
    stagger: 0.025,
    ease: 'power4.out',
  },
  isMobile: window.innerWidth < 768,
};

// ============================================================================
// LENIS SMOOTH SCROLL - Never interrupts, pure glide
// ============================================================================

let lenis;

function initLenis() {
  lenis = new Lenis(CONFIG.lenis);

  // Sync with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // Prevent scroll interference
  ScrollTrigger.defaults({
    markers: false,
    scroller: document.body,
  });

  // Prevent any scroll blocking
  ScrollTrigger.config({
    autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
    limitCallbacks: true,
  });
}

// ============================================================================
// HERO ENTRANCE - All hero variations (hero-1 through hero-5)
// ============================================================================

function animateHeroEntrance() {
  const tl = gsap.timeline({
    defaults: { ease: CONFIG.heroEntrance.ease },
    onComplete: () => ScrollTrigger.refresh(),
  });

  // 1. Hero background image
  const heroBg = document.querySelector('.hero-bg, .hero-section img.hero-bg, .hero-bg-wrap img');
  if (heroBg) {
    tl.to(heroBg, {
      opacity: 1,
      scale: 1,
      duration: 1.6,
      ease: 'power2.out',
    }, 0);
  }

  // 2. Hero content containers (all variants)
  const heroContent = document.querySelector(
    '.hero-1-content, .hero-2-content, .hero-3-content, .hero-4-content, .hero-5-content'
  );

  if (heroContent) {
    tl.fromTo(
      heroContent,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' },
      0.2
    );
  }

  // 3. Badge/dot titles first
  const dotTitles = document.querySelectorAll('.hero-section .dot-title, .hero-section .badge-text');
  if (dotTitles.length) {
    tl.fromTo(
      dotTitles,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
      0.4
    );
  }

  // 4. Main hero headings - letter by letter
  const heroHeadings = document.querySelectorAll(
    '.hero-section h1, .hero-section h2, .hero-section .heading—h1, .hero-section .heading—h2, .hero-section .heading—h3'
  );

  heroHeadings.forEach((heading, index) => {
    if (heading.closest('.snippet-link') || heading.querySelector('.char')) return;

    const split = new SplitText(heading, { 
      type: 'words,chars',
      wordsClass: 'word',
      charsClass: 'char',
    });

    tl.fromTo(
      split.chars,
      {
        opacity: 0,
        yPercent: 100,
        rotationX: -90,
      },
      {
        opacity: 1,
        yPercent: 0,
        rotationX: 0,
        stagger: CONFIG.heroEntrance.stagger,
        duration: 0.8,
        ease: 'back.out(2)',
      },
      0.6 + index * 0.15
    );
  });

  // 5. Hero paragraphs/lead text
  const heroText = document.querySelectorAll('.hero-section .heading—h5, .hero-section .text—lead');
  if (heroText.length) {
    tl.fromTo(
      heroText,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 },
      '-=0.3'
    );
  }

  // 6. Buttons
  const heroButtons = document.querySelectorAll('.hero-section .button, .hero-section .buttons .button');
  if (heroButtons.length) {
    tl.fromTo(
      heroButtons,
      { opacity: 0, y: 20, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(1.7)' },
      '-=0.2'
    );
  }

  // 7. Hero customer box / snippets (on hero-4)
  const heroSnippet = document.querySelector('.hero-customer-box, .snippet-link');
  if (heroSnippet) {
    tl.fromTo(
      heroSnippet,
      { opacity: 0, x: 30 },
      { opacity: 1, x: 0, duration: 0.8 },
      '-=0.4'
    );
  }

  return tl;
}

// ============================================================================
// PAGE HEADINGS - Split text for non-hero headings
// ============================================================================

function animatePageHeadings() {
  const headings = document.querySelectorAll(
    'h1:not(.hero-section h1), h2:not(.hero-section h2), h3:not(.hero-section h3), ' +
    '.heading—h1:not(.hero-section .heading—h1), ' +
    '.heading—h2:not(.hero-section .heading—h2), ' +
    '.heading—h3:not(.hero-section .heading—h3)'
  );

  headings.forEach((heading) => {
    if (heading.querySelector('.char') || heading.closest('.snippet-link')) return;

    const split = new SplitText(heading, { 
      type: 'words,chars',
      wordsClass: 'word',
      charsClass: 'char',
    });

    gsap.fromTo(
      split.chars,
      {
        opacity: 0,
        y: 12,
        rotationX: -90,
      },
      {
        opacity: 1,
        y: 0,
        rotationX: 0,
        stagger: 0.015,
        duration: 0.5,
        ease: 'back.out(1.5)',
        scrollTrigger: {
          trigger: heading,
          start: 'top 88%',
          once: true,
        },
      }
    );
  });
}

// ============================================================================
// SCROLL ANIMATIONS - All patterns from site analysis
// ============================================================================

function initScrollAnimations() {
  ScrollTrigger.getAll().forEach((t) => t.kill());

  // SECTIONS - Subtle fade in
  gsap.utils.toArray('.section').forEach((section) => {
    gsap.fromTo(
      section,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          once: true,
        },
      }
    );
  });

  // IMAGES - Scale + fade reveal
  gsap.utils.toArray('.image-wrapper, .captioned-image-wrapper, .image-pair').forEach((wrapper) => {
    const images = wrapper.querySelectorAll('.image-fill, img');

    images.forEach((image, index) => {
      gsap.fromTo(
        image,
        { scale: 1.15, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: wrapper,
            start: 'top 80%',
            once: true,
          },
        }
      );
    });
  });

  // PARALLAX - Smooth vertical movement
  gsap.utils.toArray('.parallax-image-wrapper').forEach((wrapper) => {
    const image = wrapper.querySelector('.parallax-image, img');
    if (!image) return;

    gsap.to(image, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: wrapper,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      },
    });
  });

  // GRADIENT LINES - Signature animation
  gsap.utils.toArray('.gradient-line-horizontal').forEach((line) => {
    const parent = line.closest('[gsap-target], .line, .bordered-metric, .process-item-small');

    gsap.fromTo(
      line,
      { xPercent: -110 },
      {
        xPercent: 110,
        duration: 1.2,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: parent || line.parentElement,
          start: 'top 85%',
          once: true,
        },
      }
    );
  });

  gsap.utils.toArray('.gradient-line-vertical').forEach((line) => {
    const parent = line.closest('[gsap-target], .line-feature, .coil-logo');

    gsap.fromTo(
      line,
      { yPercent: -110 },
      {
        yPercent: 110,
        duration: 1.2,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: parent || line.parentElement,
          start: 'top 85%',
          once: true,
        },
      }
    );
  });
}

// Initialize page transitions, navbar, menu, etc.
// (Add other functions here, such as initNavbar, initMenu, initButtonHovers, etc.)

document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    initMenu();
    setupPageTransitions();
    initPage();
  });
});

// Pause Lenis when page hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    lenis?.stop();
  } else {
    lenis?.start();
  }
});

// Handle resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    CONFIG.isMobile = window.innerWidth < 768;
    ScrollTrigger.refresh();
  }, 250);
});
