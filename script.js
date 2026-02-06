 //-- Combined scripts: scroll reveal, indicator, and arrow controls
  <script>
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
        // Ignore if focus is in an input/textarea or contenteditable
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
  </script>

  <!-- ✨ ADDED: AUTO-DETECT LANGUAGE + APPLY RTL -->
  <script>
    (function () {
      const rtlLangs = ["ar", "he", "fa", "ur"];

      function applyDirection() {
        const html = document.documentElement;
        const lang = html.lang.toLowerCase();

        if (rtlLangs.includes(lang)) {
          html.setAttribute("dir", "rtl");
          document.body.classList.add("rtl-active");
        } else {
          html.setAttribute("dir", "ltr");
          document.body.classList.remove("rtl-active");
        }
      }

      // Watch for changes to <html lang="">
      const observer = new MutationObserver(applyDirection);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

      applyDirection();
    })();
  </script>

  <script>
    document.addEventListener('DOMContentLoaded', function () {
      const modalEl = document.getElementById('timelineCarouselModal');
      const carouselEl = document.getElementById('timelineCarousel');
      const carousel = new bootstrap.Carousel(carouselEl);

      modalEl.addEventListener('show.bs.modal', function (event) {
        const trigger = event.relatedTarget;
        const slideIndex = trigger.getAttribute('data-slide');
        carousel.to(slideIndex);
      });
    });
  </script>