// موعد انتهاء مشروع جامع أمهات المؤمنين: 15 يناير 2028 بتوقيت السعودية.
const PROJECT_END_DATE = new Date("2028-01-15T00:00:00+03:00");

function updateCountdown() {
  const remaining = Math.max(0, PROJECT_END_DATE.getTime() - Date.now());
  const values = {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor((remaining / 3600000) % 24),
    minutes: Math.floor((remaining / 60000) % 60),
    seconds: Math.floor((remaining / 1000) % 60),
  };

  Object.entries(values).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value).padStart(2, "0");
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);

// --------------------
// 2. نسبة الإنجاز
// --------------------
function setProgress(percent) {
  const fill = document.getElementById("gauge-fill");
  const text = document.getElementById("gauge-text");

  // تأكد أن القيمة بين 0 و 100
  percent = Math.max(0, Math.min(percent, 100));

  // استخدم طول المسار الفعلي لتجنب اختلاف الشكل عند تغيّر العرض
  // getTotalLength() يعطي طول المسار بالوحدات المستخدمة في الـ SVG
  if (!fill || !text) return;
  const circumference = fill.getTotalLength();
  const offset = circumference - (circumference * percent / 100);

  // تحديث القوس والنص
  fill.style.strokeDasharray = `${circumference}`;
  fill.style.strokeDashoffset = offset;
  text.textContent = `${percent.toFixed(2)} %`;
}

// استدعاء لتحديث القوس بنسبة معينة (عدّل الرقم حسب الحاجة)
setProgress(1); // نسبة الإنجاز الحالية: 1%

// --------------------
// 3. Images carousel
// --------------------
(function initCarousel() {
  const section = document.querySelector('.images-carousel');
  if (!section) return;

  const carousel = section.querySelector('.carousel');
  const track = section.querySelector('.carousel-track');
  const viewport = section.querySelector('.carousel-viewport');
  const prevBtn = section.querySelector('.carousel-btn.prev');
  const nextBtn = section.querySelector('.carousel-btn.next');
  const dotsContainer = section.querySelector('.carousel-dots');

  if (!track || !viewport) return;

  // Build slides from images/dihahphoto.
  const imageSources = [
    "images/dihahphoto/%D9%84%D9%82%D8%B7%D8%A9%20%D8%B4%D8%A7%D8%B4%D8%A9%202026-01-12%20105405.png",
    "images/dihahphoto/%D9%84%D9%82%D8%B7%D8%A9%20%D8%B4%D8%A7%D8%B4%D8%A9%202026-01-12%20105422.png",
    "images/dihahphoto/%D9%84%D9%82%D8%B7%D8%A9%20%D8%B4%D8%A7%D8%B4%D8%A9%202026-01-12%20105434.png",
    "images/dihahphoto/%D9%84%D9%82%D8%B7%D8%A9%20%D8%B4%D8%A7%D8%B4%D8%A9%202026-01-12%20105451.png",
    "images/dihahphoto/%D9%84%D9%82%D8%B7%D8%A9%20%D8%B4%D8%A7%D8%B4%D8%A9%202026-01-12%20105508.png",
    "images/dihahphoto/%D9%84%D9%82%D8%B7%D8%A9%20%D8%B4%D8%A7%D8%B4%D8%A9%202026-01-12%20105521.png",
    "images/dihahphoto/%D9%84%D9%82%D8%B7%D8%A9%20%D8%B4%D8%A7%D8%B4%D8%A9%202026-01-12%20105535.png",
    "images/dihahphoto/%D9%84%D9%82%D8%B7%D8%A9%20%D8%B4%D8%A7%D8%B4%D8%A9%202026-01-12%20105618.png",
    "images/dihahphoto/%D9%84%D9%82%D8%B7%D8%A9%20%D8%B4%D8%A7%D8%B4%D8%A9%202026-01-12%20105632.png",
    "images/dihahphoto/%D9%84%D9%82%D8%B7%D8%A9%20%D8%B4%D8%A7%D8%B4%D8%A9%202026-01-12%20105647.png",
    "images/dihahphoto/%D9%84%D9%82%D8%B7%D8%A9%20%D8%B4%D8%A7%D8%B4%D8%A9%202026-01-12%20105700.png"
  ];

  if (imageSources.length) {
    track.innerHTML = '';
    imageSources.forEach((src, idx) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';

      const img = document.createElement('img');
      img.src = src;
      img.alt = `Project image ${idx + 1}`;
      img.loading = 'lazy';
      img.decoding = 'async';

      slide.appendChild(img);
      track.appendChild(slide);
    });
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let originalSlides = Array.from(track.children);
  if (originalSlides.length <= 1) return;

  let perView = getPerView();
  let cloneCount = 0;
  let index = 0;
  let isAnimating = false;
  let autoTimer = null;

  function getPerView() {
    return window.matchMedia('(max-width: 768px)').matches ? 1 : 2;
  }

  function getSlideWidth() {
    return viewport.clientWidth / perView;
  }

  function setSlideWidths() {
    const width = getSlideWidth();
    track.querySelectorAll('.carousel-slide').forEach((slide) => {
      slide.style.width = `${width}px`;
    });
  }

  function cloneSlide(slide) {
    const clone = slide.cloneNode(true);
    clone.dataset.clone = 'true';
    clone.setAttribute('aria-hidden', 'true');
    return clone;
  }

  function clearClones() {
    track.querySelectorAll('[data-clone="true"]').forEach((clone) => clone.remove());
  }

  function rebuildClones(activeIndex) {
    clearClones();
    isAnimating = false;
    originalSlides = Array.from(track.children).filter(
      (slide) => !slide.hasAttribute('data-clone')
    );
    cloneCount = Math.min(perView, originalSlides.length);

    const headClones = originalSlides.slice(0, cloneCount).map(cloneSlide);
    const tailClones = originalSlides.slice(-cloneCount).map(cloneSlide);
    const firstOriginal = originalSlides[0];

    tailClones.forEach((clone) => track.insertBefore(clone, firstOriginal));
    headClones.forEach((clone) => track.appendChild(clone));

    setSlideWidths();
    index = cloneCount + (activeIndex || 0);
    jumpTo(index);
    updateDots();
  }

  function translateTo(idx, animate) {
    track.style.transition = animate ? 'transform 0.6s ease' : 'none';
    track.style.transform = `translateX(${-idx * getSlideWidth()}px)`;
  }

  function jumpTo(idx) {
    translateTo(idx, false);
  }

  function goToIndex(idx) {
    if (isAnimating) return;
    index = idx;
    isAnimating = true;
    translateTo(index, !prefersReducedMotion.matches);
    updateDots();

    if (prefersReducedMotion.matches) {
      isAnimating = false;
      handleLoop();
    }
  }

  function goToOriginal(idx) {
    goToIndex(cloneCount + idx);
  }

  function moveBy(step) {
    goToIndex(index + step);
  }

  function getActiveOriginalIndex() {
    const total = originalSlides.length;
    return ((index - cloneCount) % total + total) % total;
  }

  function handleLoop() {
    const total = originalSlides.length;
    if (index >= total + cloneCount) {
      index = cloneCount;
      jumpTo(index);
    } else if (index < cloneCount) {
      index = total + cloneCount - 1;
      jumpTo(index);
    }
    updateDots();
  }

  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    originalSlides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goToOriginal(i));
      dotsContainer.appendChild(dot);
    });
  }

  function updateDots() {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    const activeIndex = getActiveOriginalIndex();
    dots.forEach((dot, i) => {
      const isActive = i === activeIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  function startAuto() {
    if (prefersReducedMotion.matches) return;
    stopAuto();
    autoTimer = setInterval(() => moveBy(1), 2300);
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  track.addEventListener('transitionend', (event) => {
    if (event.propertyName !== 'transform') return;
    isAnimating = false;
    handleLoop();
  });

  if (prevBtn) prevBtn.addEventListener('click', () => moveBy(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => moveBy(1));

  if (carousel) {
    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);
    carousel.addEventListener('focusin', stopAuto);
    carousel.addEventListener('focusout', startAuto);
    carousel.addEventListener('touchstart', stopAuto, { passive: true });
    carousel.addEventListener('touchend', startAuto, { passive: true });
  }

  window.addEventListener('resize', () => {
    const activeIndex = getActiveOriginalIndex();
    perView = getPerView();
    rebuildClones(activeIndex);
  });

  if (prefersReducedMotion.addEventListener) {
    prefersReducedMotion.addEventListener('change', () => {
      if (prefersReducedMotion.matches) {
        stopAuto();
      } else {
        startAuto();
      }
    });
  }

  buildDots();
  rebuildClones(0);
  startAuto();
})();

// --------------------
// 4. Timeline current label
// --------------------
(function initTimelineCurrentLabel() {
  const strips = document.querySelectorAll('.timeline-strip, .timeline-strip1');
  if (!strips.length) return;

  function updateStrip(strip) {
    const current = strip.querySelector('.timeline-item.current');
    let label = strip.querySelector('.timeline-current-label');

    if (!current) {
      if (label) label.remove();
      return;
    }

    if (!label) {
      label = document.createElement('div');
      label.className = 'timeline-current-label';
      label.textContent = 'يحدث الآن';
      strip.appendChild(label);
    }

    const stripRect = strip.getBoundingClientRect();
    const currentRect = current.getBoundingClientRect();
    const center = currentRect.left - stripRect.left + (currentRect.width / 2);
    label.style.left = `${center}px`;
  }

  function updateAll() {
    strips.forEach(updateStrip);
  }

  window.addEventListener('resize', updateAll);
  window.addEventListener('load', updateAll);
  updateAll();
})();