/**
 * - Hardware Template - Production Master Animation System (corrected)
 * - Fixes applied:
 *   1) Made the global error handler remove the loading class for any runtime error so the page doesn't stay stuck.
 *   2) Guarded DOM initialization calls (initMenu, setupPageTransitions, initPage) so missing helpers don't throw.
 *   3) Fixed selector typos: replaced em-dash class names (— / \u2014) with the actual three-hyphen names used in the HTML (---).
 *   4) Ensures core animation inits (Lenis, ScrollTrigger animations, SplitText headings, hero entrance) run defensively.
 * - Added: initMenu function to handle navigation interactions previously managed by Webflow JS.
 */

window.addEventListener('error', (e) => {
  // Unblock the page if any runtime error occurs (so content is visible even if animations fail).
  // Log the error for debugging.
  try {
    console.warn('Animation system error:', e && (e.message || e.error || e));
  } catch (err) {
    // ignore
  } finally {
    document.body.classList.remove('loading');
  }
});

// Import from local '/lib/' folder (these files are included in the repo)
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
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    smoothTouch: true,
    wheelMultiplier: 0.7,
    touchMultiplier: 1.8,
    infinite: false,
    lerp: 0.15,
  },
  pageTransition: {
    duration: 0.5,
    ease: 'expo.inOut',
  },
  heroEntrance: {
    duration: 1.0,
    stagger: 0.025,
    ease: 'power4.out',
  },
  isMobile: window.innerWidth < 768,
};

// ============================================================================
// NAVIGATION INITIALIZATION - Custom function to replace Webflow JS
// ============================================================================

function initMenu() {
  const nav = document.querySelector('.w-nav');
  const menuButton = document.querySelector('.w-nav-button');
  const menu = document.querySelector('.w-nav-menu');
  const navOverlay = document.querySelector('.w-nav-overlay'); // Check for overlay style
  const collapsePoint = getComputedStyle(nav).getPropertyValue('--_navbar-navbar-collapse-point') || '991.98px'; // Use CSS var or default
  let isMobileView = window.innerWidth <= parseFloat(collapsePoint); // Initial state check

  if (!nav || !menuButton || !menu) {
    console.warn('Navigation elements (.w-nav, .w-nav-button, .w-nav-menu) not found for initMenu');
    return;
  }

  // Function to handle state changes
  function updateMenuState(isOpen) {
    menuButton.classList.toggle('w--open', isOpen);
    // The menu itself might be controlled by CSS based on the button state or an overlay attribute
    // Option 1: Toggle class on menu (common Webflow pattern)
    menu.classList.toggle('w--nav-menu-open', isOpen); // Add a custom class for styling if needed, or use .w--open

    // Option 2: Toggle attribute on a parent, often the body or the nav itself, for overlay style
    if (navOverlay) {
       nav.setAttribute('data-nav-menu-open', isOpen ? 'true' : null); // Use attribute for overlay style
    }
    // Option 3: Toggle attribute directly on menu if CSS uses [data-nav-menu-open] on the menu element
    // menu.setAttribute('data-nav-menu-open', isOpen ? 'true' : null);

    // Ensure Lenis scrolling is disabled/enabled based on menu state (important for overlay menus)
    if (lenis) {
      if (isOpen) {
        lenis.stop(); // Stop Lenis when menu is open (especially overlay)
      } else {
        lenis.start(); // Resume Lenis when menu closes
      }
    }
  }

  // Click handler for the menu button
  menuButton.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default button behavior if needed
    const isOpen = menuButton.classList.contains('w--open');
    updateMenuState(!isOpen);
  });

  // Close menu when clicking a link inside it (common UX)
  menu.querySelectorAll('a.w-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (isMobileView) { // Only close on mobile/tablet views where it's likely a dropdown/overlay
        updateMenuState(false);
      }
    });
  });

  // Close menu when clicking outside the navigation area (overlay style or dropdown)
  document.addEventListener('click', (e) => {
    if (
      isMobileView && // Only relevant on mobile view
      !nav.contains(e.target) && // Click was outside the nav container
      menuButton.classList.contains('w--open') // Menu is currently open
    ) {
      updateMenuState(false);
    }
  });

  // Optional: Close menu on resize if switching from mobile to desktop view
  window.addEventListener('resize', () => {
    const newIsMobileView = window.innerWidth <= parseFloat(collapsePoint);
    if (isMobileView && !newIsMobileView && menuButton.classList.contains('w--open')) {
      // Went from mobile to desktop, close the menu if it was open
      updateMenuState(false);
    }
    isMobileView = newIsMobileView; // Update state variable
  });

  console.log("initMenu: Navigation initialized.");
}

// ============================================================================
// PAGE INITIALIZATION - Placeholder for page-specific logic (if needed later)
// ============================================================================

function initPage() {
  // Add any specific page initialization logic here if required later.
  console.log("initPage: Page-specific initialization placeholder.");
}

// ============================================================================
// PAGE TRANSITIONS - Placeholder for page transition logic (if needed later)
// ============================================================================

function setupPageTransitions() {
  // Add any page transition logic here if required later.
  console.log("setupPageTransitions: Page transition setup placeholder.");
}

// ============================================================================
// LENIS SMOOTH SCROLL - Never interrupts, pure glide
// ============================================================================

let lenis;

function initLenis() {
  try {
    lenis = new Lenis(CONFIG.lenis);

    // Sync with GSAP ScrollTrigger
    if (lenis && typeof lenis.on === 'function') {
      lenis.on('scroll', ScrollTrigger.update);
    }

    gsap.ticker.add((time) => {
      lenis && typeof lenis.raf === 'function' && lenis.raf(time * 1000);
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
  } catch (err) {
    console.warn('Lenis init failed:', err);
  }
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
    tl.to(
      heroBg,
      {
        opacity: 1,
        scale: 1,
        duration: 1.6,
        ease: 'power2.out',
      },
      0
    );
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
  // NOTE: fixed selectors to match HTML classnames (three hyphens '---')
  const heroHeadings = document.querySelectorAll(
    '.hero-section h1, .hero-section h2, .hero-section .heading---h1, .hero-section .heading---h2, .hero-section .heading---h3'
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
  const heroText = document.querySelectorAll('.hero-section .heading---h5, .hero-section .text---lead');
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
  // Fixed selectors to match HTML classes (three hyphens)
  const headings = document.querySelectorAll(
    'h1:not(.hero-section h1), h2:not(.hero-section h2), h3:not(.hero-section h3), ' +
      '.heading---h1:not(.hero-section .heading---h1), ' +
      '.heading---h2:not(.hero-section .heading---h2), ' +
      '.heading---h3:not(.hero-section .heading---h3)'
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
  try {
    ScrollTrigger.getAll().forEach((t) => t.kill());
  } catch (err) {
    // ignore if ScrollTrigger not ready
  }

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

    images.forEach((image) => {
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

// ============================================================================
// Initialization - guarded and defensive
// ============================================================================

function safeRun(fn) {
  try {
    typeof fn === 'function' && fn();
  } catch (err) {
    console.warn('Safe-run caught error:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    try {
      // Initialize Lenis first (if present)
      safeRun(initLenis);

      // Initialize Scroll/GSAP animations
      safeRun(() => {
        // Run important anim initializers defensively
        safeRun(animateHeroEntrance);
        safeRun(animatePageHeadings);
        safeRun(initScrollAnimations);
      });

      // Call page-specific helpers (now defined within this file)
      safeRun(initMenu); // Call the newly defined initMenu
      safeRun(setupPageTransitions); // Call the placeholder
      safeRun(initPage); // Call the placeholder

      // Ensure page isn't stuck in loading state even if some part failed
      document.body.classList.remove('loading');
      console.log("Master JS initialization complete.");
    } catch (err) {
      console.warn('Initialization error:', err);
      document.body.classList.remove('loading');
    }
  });
});

// Pause Lenis when page hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    lenis?.stop && lenis.stop();
  } else {
    lenis?.start && lenis.start();
  }
});

// Handle resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    CONFIG.isMobile = window.innerWidth < 768;
    try {
      ScrollTrigger.refresh();
    } catch (err) {
      // ignore
    }
  }, 250);
});
