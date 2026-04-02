/**
 * Mobiris v4 — Main JS
 * Smooth scroll, sticky nav shadow, mobile menu toggle.
 */
(function () {
  'use strict';

  // ── Sticky nav shadow ─────────────────────────
  var nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.style.boxShadow = window.scrollY > 8
        ? '0 1px 12px rgba(15,23,42,0.08)'
        : '';
    }, { passive: true });
  }

  // ── Smooth scroll for anchor links ────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = this.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Mobile menu toggle ─────────────────────────
  var hamburger = document.querySelector('.nav__hamburger');
  var mobileMenu = document.querySelector('.nav__mobile');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      var isOpen = hamburger.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    });
    // Close on mobile link click
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('is-open');
        mobileMenu.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      });
    });
  }

  // ── Calendly inline embed trigger ─────────────
  var calendlyBtn = document.querySelector('[href*="calendly.com"]');
  var calendlyEmbed = document.querySelector('.contact-calendly-embed');
  if (calendlyBtn && calendlyEmbed) {
    calendlyBtn.addEventListener('click', function (e) {
      var url = calendlyEmbed.getAttribute('data-calendly-url');
      if (!url) return;
      e.preventDefault();
      if (calendlyEmbed.hasAttribute('hidden')) {
        calendlyEmbed.removeAttribute('hidden');
        var iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.width = '100%';
        iframe.height = '600';
        iframe.frameBorder = '0';
        iframe.title = 'Book a meeting with Mobiris';
        iframe.loading = 'lazy';
        calendlyEmbed.appendChild(iframe);
        calendlyEmbed.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

})();
