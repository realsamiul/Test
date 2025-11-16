/**
 * Hardware Template - Production Master Animation System
 * Optimized for mobile-first, buttery smooth scrolling
 * All pages analyzed from hardware-technology-consulting-template.webflow.io
 * * --- Phase 2 Update ---
 * Added error boundary for CDN import failures.
 * ---
 */

window.addEventListener('error', (e) => {
  if (e.message.includes('Failed to fetch') || e.message.includes('CDN')) {
    console.warn('Animation library failed to load. Site will work but animations disabled.');
    document.body.classList.remove('loading');
  }
});

import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js';
import ScrollTrigger from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js';
import SplitText from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/SplitText.min.js';
import Flip from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/Flip.min.js';
import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/+esm';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip);

// ============================================================================
// CONFIGURATION - Mobile-optimized, premium feel
// ============================================================================

const CONFIG = {
  lenis: {
    duration: 1.0,        // Faster on mobile
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    smoothTouch: false,   // Native touch scroll on mobile (better performance)
    wheelMultiplier: 0.8, // Less aggressive desktop
    touchMultiplier: 1.5, // Smoother mobile
    infinite: false,
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

  // METRICS/COUNTERS - Number animation
  gsap.utils.toArray('.metric-text-large').forEach((metric) => {
    const text = metric.textContent.trim();
    const numberMatch = text.match(/([\+\-]?[\d,\.]+)/);
    
    if (numberMatch) {
      const rawNumber = numberMatch[0];
      const number = parseFloat(rawNumber.replace(/,/g, ''));
      const prefix = text.slice(0, text.indexOf(rawNumber));
      const suffix = text.slice(text.indexOf(rawNumber) + rawNumber.length);
      
      gsap.fromTo(
        metric,
        { textContent: 0 },
        {
          textContent: number,
          duration: 1.8,
          ease: 'power2.out',
          snap: { textContent: number > 100 ? 10 : 0.1 },
          scrollTrigger: {
            trigger: metric,
            start: 'top 90%',
            once: true,
          },
          onUpdate: function () {
            const val = Math.round(this.targets()[0].textContent * 10) / 10;
            metric.textContent = prefix + val + suffix;
          },
        }
      );
    }
  });

  // GRID ITEMS - Stagger fade in
  gsap.utils.toArray('.grid-thirds, .grid-halves-section, .text-grid-quarters').forEach((grid) => {
    const items = grid.children;
    
    gsap.fromTo(
      items,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: grid,
          start: 'top 80%',
          once: true,
        },
      }
    );
  });

  // FEATURE GRIDS with dots
  gsap.utils.toArray('.features-grid-item, .client-grid-item').forEach((item) => {
    gsap.fromTo(
      item,
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          once: true,
        },
      }
    );
  });

  // CUSTOMER ITEMS - Cards
  gsap.utils.toArray('.customer-item, .blog-item-link').forEach((item) => {
    gsap.fromTo(
      item,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 82%',
          once: true,
        },
      }
    );
  });

  // LINK BOXES - Hover-ready cards
  gsap.utils.toArray('.link-box, .link-box-large').forEach((box) => {
    gsap.fromTo(
      box,
      { opacity: 0, scale: 0.95 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: box,
          start: 'top 85%',
          once: true,
        },
      }
    );
  });

  // ACCORDION ITEMS
  gsap.utils.toArray('.accordion-item-title').forEach((item) => {
    gsap.fromTo(
      item,
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        scrollTrigger: {
          trigger: item,
          start: 'top 88%',
          once: true,
        },
      }
    );
  });

  // TIMELINE ITEMS
  gsap.utils.toArray('.text-grid-item').forEach((item, index) => {
    gsap.fromTo(
      item,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: index * 0.05,
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          once: true,
        },
      }
    );
  });

  // COMPARISON TABLE ROWS
  gsap.utils.toArray('.comparison-row').forEach((row, index) => {
    gsap.fromTo(
      row,
      { opacity: 0, x: -15 },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        delay: index * 0.03,
        scrollTrigger: {
          trigger: row,
          start: 'top 90%',
          once: true,
        },
      }
    );
  });

  ScrollTrigger.refresh();
}

// ============================================================================
// NAVBAR - Background blur on scroll
// ============================================================================

function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const navbarBg = document.querySelector('.navbar-bg');
  
  if (!navbar || !navbarBg) return;

  ScrollTrigger.create({
    start: 'top -50',
    end: 99999,
    onUpdate: (self) => {
      const progress = Math.min(self.progress * 2, 1);
      gsap.to(navbarBg, {
        opacity: progress,
        duration: 0.3,
        ease: 'none',
      });
    },
  });
}

// ============================================================================
// MOBILE MENU - Slick open/close (FIXED - No Dependencies)
// ============================================================================

function initMenu() {
  const menuButton = document.querySelector('.menu-button');
  const navbarMenu = document.querySelector('.navbar-menu');

  if (!menuButton || !navbarMenu) {
    console.error('Menu elements not found!');
    return;
  }

  let isOpen = false;

  const clickHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();

    isOpen = !isOpen;

    if (isOpen) {
      // Open menu
      navbarMenu.style.display = 'block';
      menuButton.classList.add('w--open');
      document.body.style.overflow = 'hidden';
    } else {
      // Close menu
      navbarMenu.style.display = 'none';
      menuButton.classList.remove('w--open');
      document.body.style.overflow = '';
    }
  };

  // Add both touch and click events
  menuButton.addEventListener('click', clickHandler);
  menuButton.addEventListener('touchstart', clickHandler, { passive: false });

  // Close on link click
  navbarMenu.querySelectorAll('a:not(.dropdown-toggle)').forEach((link) => {
    link.addEventListener('click', (e) => {
      if (isOpen) {
        // Just close the menu. The link will navigate normally.
        clickHandler(e);
      }
    });
  });

  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      clickHandler(e);
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (isOpen && !navbarMenu.contains(e.target) && !menuButton.contains(e.target)) {
      clickHandler(e);
    }
  });
}

// ============================================================================
// BUTTON HOVER EFFECTS - Premium interactions
// ============================================================================

function initButtonHovers() {
  document.querySelectorAll('.button').forEach((button) => {
    const hoverElement = button.querySelector('.button-hover-element');
    if (!hoverElement) return;

    button.addEventListener('mouseenter', () => {
      gsap.to(hoverElement, {
        scale: 2.5,
        opacity: 0.15,
        duration: 0.6,
        ease: 'power2.out',
      });
    });

    button.addEventListener('mouseleave', () => {
      gsap.to(hoverElement, {
        scale: 1,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
      });
    });
  });

  // Arrow link hovers
  document.querySelectorAll('.box-arrow-link, .arrow-link').forEach((link) => {
    const bg = link.querySelector('.arrow-link-bg');
    if (!bg) return;

    link.addEventListener('mouseenter', () => {
      gsap.to(bg, {
        width: '100%',
        duration: 0.4,
        ease: 'power2.out',
      });
    });

    link.addEventListener('mouseleave', () => {
      gsap.to(bg, {
        width: '0%',
        duration: 0.3,
        ease: 'power2.in',
      });
    });
  });
}

// ============================================================================
// PAGE TRANSITIONS - Fast and stunning
// ============================================================================

let isTransitioning = false;

function transitionOut() {
  if (isTransitioning) return Promise.resolve();
  isTransitioning = true;

  return new Promise((resolve) => {
    const tl = gsap.timeline({ onComplete: resolve });

    tl.to('main, .hero-section', {
      opacity: 0,
      y: -20,
      scale: 0.98,
      duration: CONFIG.pageTransition.duration * 0.7,
      ease: CONFIG.pageTransition.ease,
    });

    lenis?.stop();
  });
}

function transitionIn() {
  return new Promise((resolve) => {
    window.scrollTo(0, 0);
    if (lenis) lenis.scrollTo(0, { immediate: true });

    const tl = gsap.timeline({
      onComplete: () => {
        isTransitioning = false;
        resolve();
      },
    });

    tl.fromTo(
      'main, .hero-section',
      { opacity: 0, y: 20, scale: 1.02 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: CONFIG.pageTransition.duration,
        ease: CONFIG.pageTransition.ease,
      }
    );

    lenis?.start();
  });
}

function setupPageTransitions() {
  document.addEventListener('click', async (e) => {
    const link = e.target.closest('a');

    if (
      !link ||
      link.target === '_blank' ||
      link.href.includes('#') ||
      !link.href.startsWith(window.location.origin) ||
      link.classList.contains('w-lightbox') ||
      link.closest('.w-dropdown') ||
      isTransitioning
    ) {
      return;
    }

    e.preventDefault();

    try {
      await transitionOut();

      const response = await fetch(link.href);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const html = await response.text();
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(html, 'text/html');

      document.body.replaceWith(newDoc.body);
      document.title = newDoc.title;
      window.history.pushState(null, '', link.href);

      await initPage();
    } catch (error) {
      console.error('Page transition failed:', error);
      window.location.href = link.href;
    }
  });

  window.addEventListener('popstate', async () => {
    if (isTransitioning) return;

    try {
      await transitionOut();

      const response = await fetch(window.location.href);
      const html = await response.text();
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(html, 'text/html');

      document.body.replaceWith(newDoc.body);
      document.title = newDoc.title;

      await initPage();
    } catch (error) {
      console.error('Popstate failed:', error);
      window.location.reload();
    }
  });
}

// ============================================================================
// PAGE INITIALIZATION
// ============================================================================

async function initPage() {
  // Clean slate
  gsap.killTweensOf('*');
  ScrollTrigger.getAll().forEach((t) => t.kill());

  // Initialize Lenis once
  if (!lenis) initLenis();
  
  // Transition in
  await transitionIn();
  
  // Orchestrate animations
  const heroTl = animateHeroEntrance();
  
  // After hero completes, trigger rest
  heroTl.eventCallback('onComplete', () => {
    animatePageHeadings();
    initScrollAnimations();
    initNavbar();
    // initMenu(); // <-- MOVED
    initButtonHovers();
  });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initMenu(); // <-- MOVED HERE: Runs immediately
  setupPageTransitions();
  initPage();
});

// Pause Lenis when page hidden
document.addEventListener('visibilitychange', () => {
  if (_document.hidden) {
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