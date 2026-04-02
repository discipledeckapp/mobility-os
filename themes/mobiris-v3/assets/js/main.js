/**
 * Mobiris v3 — Main JS
 * Minimal: smooth scroll, sticky nav shadow on scroll.
 */

(function () {
  'use strict';

  // ── Sticky nav: add shadow when scrolled ──────────────────
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 8) {
        nav.style.boxShadow = '0 1px 12px rgba(15,23,42,0.08)';
      } else {
        nav.style.boxShadow = '';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ── Smooth scroll for anchor links ────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
