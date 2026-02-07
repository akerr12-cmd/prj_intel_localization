// Combined scripts: scroll reveal, indicator, and arrow controls

// ---------- Scroll reveal (IntersectionObserver) ----------
// Reveal cards when they enter viewport
(function () {
  const cards = document.querySelectorAll('.cards-section');
  if (!cards || cards.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  cards.forEach(card => observer.observe(card));
})();

// ---------- Timeline controls and keyboard navigation ----------
// Horizontal scroll buttons and keyboard navigation
(function () {
  const timelineEl = document.querySelector('.timeline');
  if (!timelineEl) return;

  const leftBtn = document.querySelector('.left-btn');
  const rightBtn = document.querySelector('.right-btn');

  // Compute step (card width + gap). Falls back to CSS variable or constants if needed.
  function computeStep() {
    const firstCard = timelineEl.querySelector('.cards-section');
    if (!firstCard) return 0;

    const cardWidth = firstCard.getBoundingClientRect().width;

    // Try to read gap from computed style (modern browsers support gap on flex)
    const cs = getComputedStyle(timelineEl);
    let gap = 0;
    if (cs && cs.gap) {
      gap = parseFloat(cs.gap) || 0;
    } else {
      // fallback: try CSS variable --gap or default to 32
      const rootGap = getComputedStyle(document.documentElement).getPropertyValue('--gap');
      gap = parseFloat(rootGap) || 32;
    }

    return Math.round(cardWidth + gap);
  }

  let STEP = computeStep();

  // Safe scroll helper
  function scrollByStep(direction = 1) {
    if (!timelineEl) return;
    timelineEl.scrollBy({ left: direction * STEP, behavior: 'smooth' });
  }

  // Update button disabled state based on scroll position
  function updateButtons() {
    if (!leftBtn && !rightBtn) return;
    const maxScroll = Math.max(0, timelineEl.scrollWidth - timelineEl.clientWidth);
    const pos = timelineEl.scrollLeft;

    if (leftBtn) leftBtn.disabled = pos <= 2; // small tolerance
    if (rightBtn) rightBtn.disabled = pos >= (maxScroll - 2);
  }

  // Debounce helper
  function debounce(fn, wait = 120) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // Attach click handlers if buttons exist
  if (leftBtn) {
    leftBtn.addEventListener('click', () => scrollByStep(-1));
  }

  if (rightBtn) {
    rightBtn.addEventListener('click', () => scrollByStep(1));
  }

  // Update STEP and button states on resize (debounced)
  const onResize = debounce(() => {
    STEP = computeStep() || STEP;
    updateButtons();
  }, 120);

  window.addEventListener('resize', onResize);

  // Update buttons on scroll
  timelineEl.addEventListener('scroll', debounce(updateButtons, 40));

  // Initialize
  STEP = computeStep() || STEP || 352; // fallback if computeStep fails
  updateButtons();

  // Keyboard navigation (left/right)
  window.addEventListener('keydown', (e) => {
    // Ignore if focus is in an input/textarea or content editable
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollByStep(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollByStep(-1);
    }
  });
})();

// ---------- Flip card keyboard navigation ----------
document.querySelectorAll('.flip-card').forEach(card => {
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const flipInner = card.querySelector('.flip-inner');
      flipInner.classList.toggle('flipped');
    }
  });
});

// ---------- Form submission handlers ----------
  document.querySelector('#contactModal form').addEventListener('submit', function (e) {
    e.preventDefault(); // prevent real submission

    // Close the contact modal
    const contactModal = bootstrap.Modal.getInstance(document.getElementById('contactModal'));
    contactModal.hide();

    // Show the success modal
    const successModal = new bootstrap.Modal(document.getElementById('messageSentModal'));
    successModal.show();

    // Reset the form
    this.reset();
  });

  // Handle subscription form submission
  document.querySelector('#intelModal form').addEventListener('submit', function (e) {
    e.preventDefault(); // prevent real submission

    // Close the subscription modal
    const subscriptionModal = bootstrap.Modal.getInstance(document.getElementById('intelModal'));
    subscriptionModal.hide();

    // Show the thank you modal
    const thankYouModal = new bootstrap.Modal(document.getElementById('subscriptionSuccessModal'));
    thankYouModal.show();

    // Reset the form
    this.reset();
  });

  (function () {
  const timeline = document.querySelector('.timeline');
  const cards = document.querySelectorAll('.cards-section');
  const indicatorContainer = document.querySelector('.timeline-indicators');

  if (!timeline || cards.length === 0 || !indicatorContainer) return;

  // Create indicator buttons
  cards.forEach((card, index) => {
    const btn = document.createElement('button');
    btn.setAttribute('aria-label', `Go to card ${index + 1}`);

    btn.addEventListener('click', () => {
      const left = card.offsetLeft;
      timeline.scrollTo({ left, behavior: 'smooth' });
    });

    indicatorContainer.appendChild(btn);
  });

  const indicatorButtons = indicatorContainer.querySelectorAll('button');

  // Highlight active indicator
  function updateActiveIndicator() {
    let closestIndex = 0;
    let closestDistance = Infinity;

    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - timeline.scrollLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    indicatorButtons.forEach((btn, i) => {
      btn.classList.toggle('active', i === closestIndex);
    });
  }

  timeline.addEventListener('scroll', () => {
    requestAnimationFrame(updateActiveIndicator);
  });

  updateActiveIndicator();
})();

// ---------- AUTO-DETECT LANGUAGE + APPLY RTL ----------
// Detects RTL languages and watches for changes (including Google Translate)
(function () {
  // Languages that require RTL layout
  const rtlLangs = ["ar", "he", "fa", "ur"];

  function applyDirection() {
    const html = document.documentElement;
    const lang = (html.lang || "").toLowerCase().trim();

    // Determine direction
    const isRTL = rtlLangs.includes(lang);

    // Apply direction to <html>
    html.setAttribute("dir", isRTL ? "rtl" : "ltr");

    // Add/remove your custom RTL class for styling
    document.body.classList.toggle("rtl-active", isRTL);

    // write to console log for debugging
    console.log(`Language set to: ${lang}, direction: ${isRTL ? "RTL" : "LTR"}`);
  }


  // Run once on load
  applyDirection();

  // Watch for <html lang=""> changes (Google Translate modifies this)
  const langObserver = new MutationObserver(applyDirection);

  langObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"]
  });

  // Google Translate sometimes rewrites the DOM without updating <html lang="">
  // This catches those cases by polling for direction drift.
  let lastLang = document.documentElement.lang;

  setInterval(() => {
    const currentLang = document.documentElement.lang;
    if (currentLang !== lastLang) {
      lastLang = currentLang;
      applyDirection();
    }
  }, 800);
})();


// ---------- Animated Statistics ----------
(function () {
  const statNumbers = document.querySelectorAll('.stat-number');

  if (statNumbers.length === 0) return;

  // Animation function
  function animateValue(element, start, end, duration, suffix = '') {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(easeOut * (end - start) + start);

      element.textContent = currentValue + suffix;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.classList.remove('animating');
      }
    };

    element.classList.add('animating');
    window.requestAnimationFrame(step);
  }

  // Intersection Observer to trigger animation on scroll
  const observerOptions = {
    threshold: 0.3,
    rootMargin: '0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        const target = parseInt(entry.target.dataset.target);
        const suffix = entry.target.dataset.suffix || '';
        const startValue = 0;

        // Mark as animated so it only runs once
        entry.target.dataset.animated = 'true';

        // Start animation with 2 second duration
        animateValue(entry.target, startValue, target, 2000, suffix);
      }
    });
  }, observerOptions);

  // Observe all stat numbers
  statNumbers.forEach(stat => observer.observe(stat));
})();


// ---------- Language Selector Toggle ----------
(function () {
  const langSelector = document.querySelector('.language-selector');
  const langToggle = document.querySelector('.lang-toggle');

  if (!langSelector || !langToggle) return;

  langToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    langSelector.classList.toggle('active');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!langSelector.contains(e.target)) {
      langSelector.classList.remove('active');
    }
  });

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && langSelector.classList.contains('active')) {
      langSelector.classList.remove('active');
      langToggle.focus();
    }
  });
})();
