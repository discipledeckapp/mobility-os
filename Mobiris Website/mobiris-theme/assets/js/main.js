'use strict';

/**
 * Main Module
 * Handles page-level interactions including accordions, smooth scrolling,
 * lazy loading, copy to clipboard, animations, and form handling.
 */

class MobirisMain {
  constructor() {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.headerHeight = 0;
    this.observerInstances = [];
    this.animatingCounters = new Set();

    // Global object for WordPress integration (if available)
    this.ajaxUrl = window.mobirisSite?.ajaxUrl || '/wp-admin/admin-ajax.php';
    this.nonce = window.mobirisSite?.nonce || '';

    this.init();
  }

  /**
   * Initialize all main page features
   */
  init() {
    this.updateHeaderHeight();
    this.initAccordions();
    this.initSmoothScrollAnchors();
    this.initLazyLoading();
    this.initCopyToClipboard();
    this.initStatsCounter();
    this.initContactForm();
    this.initNewsletterForm();
    this.initAppCTADetection();
    this.initAnnouncementBarDismiss();
    this.initTableOfContents();

    // Update header height on resize
    window.addEventListener('resize', () => this.updateHeaderHeight());
  }

  /**
   * Update cached header height for scroll offset calculations
   */
  updateHeaderHeight() {
    const header = document.querySelector('.site-header');
    this.headerHeight = header ? header.offsetHeight : 0;
  }

  /**
   * Initialize FAQ accordions
   */
  initAccordions() {
    const accordionContainers = document.querySelectorAll('[class*="accordion"]');

    accordionContainers.forEach((container) => {
      const isSingleOpen = container.getAttribute('data-accordion-single') === 'true';
      const faqItems = container.querySelectorAll('.faq-item');

      faqItems.forEach((item) => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (!question || !answer) return;

        // Ensure question is focusable
        if (!question.hasAttribute('role')) {
          question.setAttribute('role', 'button');
        }
        if (!question.hasAttribute('tabindex')) {
          question.setAttribute('tabindex', '0');
        }

        question.addEventListener('click', () => {
          this.handleAccordionToggle(item, container, isSingleOpen);
        });

        question.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleAccordionToggle(item, container, isSingleOpen);
          }
        });
      });
    });
  }

  /**
   * Handle accordion item toggle
   */
  handleAccordionToggle(item, container, isSingleOpen) {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const isOpen = item.classList.contains('is-open');

    if (isOpen) {
      this.closeAccordionItem(item);
    } else {
      if (isSingleOpen) {
        // Close all other items in the container
        container.querySelectorAll('.faq-item.is-open').forEach((openItem) => {
          if (openItem !== item) {
            this.closeAccordionItem(openItem);
          }
        });
      }
      this.openAccordionItem(item);
    }
  }

  /**
   * Open accordion item with animation
   */
  openAccordionItem(item) {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    item.classList.add('is-open');
    question.setAttribute('aria-expanded', 'true');

    // Animate using max-height trick
    answer.style.maxHeight = answer.scrollHeight + 'px';
    answer.style.opacity = '1';
  }

  /**
   * Close accordion item with animation
   */
  closeAccordionItem(item) {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    item.classList.remove('is-open');
    question.setAttribute('aria-expanded', 'false');

    // Animate using max-height trick
    answer.style.maxHeight = '0px';
    answer.style.opacity = '0';
  }

  /**
   * Initialize smooth scroll for anchor links
   */
  initSmoothScrollAnchors() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      this.smoothScrollToElement(target);
    });
  }

  /**
   * Smooth scroll to element with header offset
   */
  smoothScrollToElement(element) {
    // Respect prefers-reduced-motion
    const behavior = this.prefersReducedMotion ? 'auto' : 'smooth';

    const offsetTop = element.getBoundingClientRect().top + window.scrollY - this.headerHeight - 20; // 20px extra padding

    window.scrollTo({
      top: offsetTop,
      behavior: behavior,
    });

    // Focus element for accessibility
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '-1');
    }
    element.focus();
  }

  /**
   * Initialize lazy loading for images with data-src
   */
  initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    if (lazyImages.length === 0) return;

    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute('data-src');

            if (src) {
              img.addEventListener('load', () => {
                img.classList.add('is-loaded');
              });

              img.addEventListener('error', () => {
                img.classList.add('is-error');
                console.warn('Failed to load image:', src);
              });

              img.src = src;
              img.removeAttribute('data-src');
            }

            imageObserver.unobserve(img);
          }
        });
      });

      lazyImages.forEach((img) => {
        imageObserver.observe(img);
      });

      this.observerInstances.push(imageObserver);
    } else {
      // Fallback for browsers without IntersectionObserver
      lazyImages.forEach((img) => {
        const src = img.getAttribute('data-src');
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
        }
      });
    }
  }

  /**
   * Initialize copy to clipboard functionality
   */
  initCopyToClipboard() {
    const copyElements = document.querySelectorAll('[data-copy-text]');

    copyElements.forEach((element) => {
      element.style.cursor = 'pointer';
      element.setAttribute('role', 'button');
      element.setAttribute('tabindex', '0');

      const handleCopy = (e) => {
        e.preventDefault();
        const textToCopy = element.getAttribute('data-copy-text');

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            this.showCopyConfirmation(element);
          }).catch((err) => {
            console.error('Failed to copy:', err);
            this.fallbackCopyToClipboard(textToCopy, element);
          });
        } else {
          this.fallbackCopyToClipboard(textToCopy, element);
        }
      };

      element.addEventListener('click', handleCopy);
      element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCopy(e);
        }
      });
    });
  }

  /**
   * Show copy confirmation tooltip
   */
  showCopyConfirmation(element) {
    const originalText = element.textContent;
    element.textContent = 'Copied!';
    element.classList.add('copied');

    setTimeout(() => {
      element.textContent = originalText;
      element.classList.remove('copied');
    }, 2000);
  }

  /**
   * Fallback copy to clipboard for older browsers
   */
  fallbackCopyToClipboard(text, element) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      this.showCopyConfirmation(element);
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }

    document.body.removeChild(textarea);
  }

  /**
   * Initialize stats counter animation
   */
  initStatsCounter() {
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length === 0) return;

    if ('IntersectionObserver' in window) {
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const statValue = entry.target;

            // Skip if already animated
            if (this.animatingCounters.has(statValue)) {
              return;
            }

            this.animatingCounters.add(statValue);
            this.animateCounter(statValue);
            counterObserver.unobserve(statValue);
          }
        });
      }, { threshold: 0.5 });

      statValues.forEach((value) => {
        counterObserver.observe(value);
      });

      this.observerInstances.push(counterObserver);
    } else {
      // Fallback: animate immediately
      statValues.forEach((value) => {
        this.animateCounter(value);
      });
    }
  }

  /**
   * Animate counter value counting up
   */
  animateCounter(element) {
    const finalValue = parseFloat(element.textContent.replace(/[^0-9.]/g, ''));
    if (isNaN(finalValue)) return;

    const duration = this.prefersReducedMotion ? 0 : 1000; // 1 second animation
    const startValue = 0;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = Math.floor(startValue + (finalValue - startValue) * progress);

      element.textContent = currentValue.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = finalValue.toLocaleString();
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Initialize contact form handler
   */
  initContactForm() {
    const contactForm = document.querySelector('.mobiris-contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleContactFormSubmit(contactForm);
    });
  }

  /**
   * Handle contact form submission
   */
  handleContactFormSubmit(form) {
    // Clear previous errors
    form.querySelectorAll('.error-message').forEach((msg) => {
      msg.remove();
    });
    form.querySelectorAll('.is-error').forEach((field) => {
      field.classList.remove('is-error');
    });

    // Validate form
    const errors = this.validateContactForm(form);
    if (errors.length > 0) {
      this.displayFormErrors(form, errors);
      return;
    }

    // Set loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    // Prepare form data
    const formData = new FormData(form);
    if (this.nonce) {
      formData.append('nonce', this.nonce);
    }
    formData.append('action', 'mobiris_contact_form');

    // AJAX submission
    fetch(this.ajaxUrl, {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          this.displayFormSuccess(form);
          form.reset();
        } else {
          throw new Error(data.message || 'Submission failed');
        }
      })
      .catch((error) => {
        console.error('Contact form error:', error);
        this.displayFormError(form, error.message);
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
  }

  /**
   * Validate contact form fields
   */
  validateContactForm(form) {
    const errors = [];
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach((field) => {
      const value = field.value.trim();
      const fieldName = field.getAttribute('name') || field.getAttribute('id') || 'Field';

      if (!value) {
        errors.push({
          field: field,
          message: `${this.formatFieldName(fieldName)} is required`,
        });
      } else if (field.type === 'email' && !this.isValidEmail(value)) {
        errors.push({
          field: field,
          message: `${this.formatFieldName(fieldName)} must be a valid email address`,
        });
      } else if (field.type === 'tel' && !this.isValidPhone(value)) {
        errors.push({
          field: field,
          message: `${this.formatFieldName(fieldName)} must be a valid phone number`,
        });
      }
    });

    return errors;
  }

  /**
   * Check if email is valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if phone is valid (basic validation)
   */
  isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Format field name for error messages
   */
  formatFieldName(name) {
    return name
      .replace(/_/g, ' ')
      .replace(/[-]/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Display form validation errors
   */
  displayFormErrors(form, errors) {
    errors.forEach(({ field, message }) => {
      field.classList.add('is-error');

      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = message;
      field.parentElement.insertBefore(errorDiv, field.nextSibling);
    });
  }

  /**
   * Display form success message
   */
  displayFormSuccess(form) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.setAttribute('role', 'alert');
    successDiv.textContent = 'Thank you! Your message has been sent successfully.';
    form.insertBefore(successDiv, form.firstChild);

    setTimeout(() => {
      successDiv.remove();
    }, 5000);
  }

  /**
   * Display form error message
   */
  displayFormError(form, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.textContent = message || 'An error occurred. Please try again.';
    form.insertBefore(errorDiv, form.firstChild);

    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  /**
   * Initialize newsletter form handler
   */
  initNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (!newsletterForm) return;

    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleNewsletterSubmit(newsletterForm);
    });
  }

  /**
   * Handle newsletter form submission
   */
  handleNewsletterSubmit(form) {
    const emailInput = form.querySelector('input[type="email"]');
    if (!emailInput) return;

    const email = emailInput.value.trim();

    // Clear previous errors
    const prevError = form.querySelector('.error-message');
    if (prevError) prevError.remove();

    // Validate email
    if (!email || !this.isValidEmail(email)) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = 'Please enter a valid email address';
      form.insertBefore(errorDiv, form.firstChild);
      return;
    }

    // Set loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Subscribing...';

    // Prepare form data
    const formData = new FormData(form);
    if (this.nonce) {
      formData.append('nonce', this.nonce);
    }
    formData.append('action', 'mobiris_newsletter_signup');

    // AJAX submission
    fetch(this.ajaxUrl, {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          const successDiv = document.createElement('div');
          successDiv.className = 'success-message';
          successDiv.setAttribute('role', 'alert');
          successDiv.textContent = 'Thank you for subscribing!';
          form.insertBefore(successDiv, form.firstChild);

          emailInput.value = '';

          setTimeout(() => {
            successDiv.remove();
          }, 5000);
        } else {
          throw new Error(data.message || 'Subscription failed');
        }
      })
      .catch((error) => {
        console.error('Newsletter error:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = error.message || 'An error occurred. Please try again.';
        form.insertBefore(errorDiv, form.firstChild);
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
  }

  /**
   * Initialize app CTA platform detection
   */
  initAppCTADetection() {
    const appCta = document.querySelector('[data-app-cta]');
    if (!appCta) return;

    const platform = this.detectPlatform();

    if (platform === 'iOS') {
      appCta.classList.add('detected-ios');
    } else if (platform === 'Android') {
      appCta.classList.add('detected-android');
    }
  }

  /**
   * Detect user's platform (iOS or Android)
   */
  detectPlatform() {
    const ua = navigator.userAgent.toLowerCase();

    if (/iphone|ipad|ipod/.test(ua)) {
      return 'iOS';
    } else if (/android/.test(ua)) {
      return 'Android';
    }

    return null;
  }

  /**
   * Initialize announcement bar dismiss functionality
   */
  initAnnouncementBarDismiss() {
    const announcementBar = document.querySelector('.announcement-bar');
    if (!announcementBar) return;

    const closeBtn = announcementBar.querySelector('[data-dismiss]');
    if (!closeBtn) return;

    // Check if already dismissed in this session
    const isDismissed = sessionStorage.getItem('announcement-dismissed');
    if (isDismissed) {
      announcementBar.style.display = 'none';
      return;
    }

    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      announcementBar.style.display = 'none';
      sessionStorage.setItem('announcement-dismissed', 'true');
    });
  }

  /**
   * Initialize table of contents for guide pages
   */
  initTableOfContents() {
    const toc = document.querySelector('.guide-toc');
    const content = document.querySelector('.guide-content');

    if (!toc || !content) return;

    const headings = content.querySelectorAll('h2, h3');
    if (headings.length === 0) return;

    if ('IntersectionObserver' in window) {
      const tocObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.id || entry.target.textContent.toLowerCase().replace(/\s+/g, '-');

              // Update active state in TOC
              const tocLinks = toc.querySelectorAll('a');
              tocLinks.forEach((link) => {
                link.classList.remove('is-active');
              });

              const activeLink = toc.querySelector(`a[href="#${id}"]`);
              if (activeLink) {
                activeLink.classList.add('is-active');
              }
            }
          });
        },
        { threshold: 0.5 },
      );

      headings.forEach((heading) => {
        // Ensure heading has an ID
        if (!heading.id) {
          heading.id = heading.textContent.toLowerCase().replace(/\s+/g, '-');
        }
        tocObserver.observe(heading);
      });

      this.observerInstances.push(tocObserver);
    }
  }

  /**
   * Cleanup method for when page unloads
   */
  destroy() {
    // Disconnect all observers
    this.observerInstances.forEach((observer) => {
      observer.disconnect();
    });
    this.observerInstances = [];
    this.animatingCounters.clear();
  }
}

/**
 * Initialize main module when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.mobirisMain = new MobirisMain();
  });
} else {
  window.mobirisMain = new MobirisMain();
}

/**
 * Cleanup on page unload
 */
window.addEventListener('beforeunload', () => {
  if (window.mobirisMain) {
    window.mobirisMain.destroy();
  }
});

/* ============================================================================
   BILINGUAL LANGUAGE TOGGLE
   Switches all [data-lang-en] / [data-lang-fr] elements on the page.
   State is stored in localStorage so it persists across pages.
   ============================================================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'mobiris_lang';
  let currentLang = localStorage.getItem(STORAGE_KEY) || 'en';

  /**
   * Apply the current language to all bilingual elements.
   * @param {string} lang - 'en' or 'fr'
   */
  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    // Update text content for all labelled elements
    document.querySelectorAll('[data-lang-en]').forEach(function (el) {
      const text = el.getAttribute('data-lang-' + lang);
      if (!text) return;

      // For inputs/buttons with value, update value; otherwise textContent
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = text;
      } else {
        el.textContent = text;
      }
    });

    // Update toggle button states
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      const isActive = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('lang-btn--active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });

    // Update <html> lang attribute
    document.documentElement.setAttribute('lang', lang === 'fr' ? 'fr' : 'en');
  }

  // Attach click handlers to all language toggle buttons
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.lang-btn');
    if (!btn) return;
    const lang = btn.getAttribute('data-lang');
    if (lang && lang !== currentLang) {
      applyLang(lang);
    }
  });

  // Apply persisted language on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { applyLang(currentLang); });
  } else {
    applyLang(currentLang);
  }
})();

/* ============================================================================
   PROFIT / LEAKAGE CALCULATOR
   Reads vehicle count, vehicle type, and days/month.
   Outputs: monthly remittance total, estimated leakage, Mobiris plan cost, net ROI.
   ============================================================================ */

(function () {
  'use strict';

  // Daily remittance midpoints per vehicle type (NGN equivalent)
  const DAILY_RATES = {
    keke:   4500,   // ₦3,000–6,000
    danfo:  11250,  // ₦7,500–15,000
    korope: 9000,   // ₦6,000–12,000
    matatu: 10000,  // KES 800–2,500 → ~₦10,000 equivalent
  };

  // Leakage rate (conservative 12%)
  const LEAKAGE_RATE = 0.12;

  // Plan cost logic
  function getPlanCost(vehicles) {
    if (vehicles <= 10) return 15000;       // Starter
    if (vehicles <= 20) return 35000;       // Growth base
    return 35000 + Math.max(0, vehicles - 20) * 1500; // Growth + uplift
  }

  function formatNaira(amount) {
    if (amount >= 1000000) {
      return '₦' + (amount / 1000000).toFixed(1) + 'M';
    }
    if (amount >= 1000) {
      return '₦' + Math.round(amount / 1000) + 'K';
    }
    return '₦' + Math.round(amount).toLocaleString();
  }

  function getSelectedVehicleType() {
    const checked = document.querySelector('input[name="vehicle_type"]:checked');
    return checked ? checked.value : 'danfo';
  }

  function calculate() {
    const vehiclesInput = document.getElementById('calc-vehicles');
    const daysInput = document.getElementById('calc-days');
    if (!vehiclesInput || !daysInput) return;

    const vehicles = Math.max(1, parseInt(vehiclesInput.value, 10) || 30);
    const days     = Math.max(10, Math.min(30, parseInt(daysInput.value, 10) || 26));
    const type     = getSelectedVehicleType();
    const daily    = DAILY_RATES[type] || DAILY_RATES.danfo;

    const monthlyTotal   = vehicles * daily * days;
    const monthlyLeakage = monthlyTotal * LEAKAGE_RATE;
    const planCost       = getPlanCost(vehicles);
    const net            = monthlyLeakage - planCost;
    const roi            = planCost > 0 ? (monthlyLeakage / planCost) : 0;

    // Update DOM
    const leakageEl = document.getElementById('result-leakage');
    const costEl    = document.getElementById('result-plan-cost');
    const netEl     = document.getElementById('result-net');
    const roiBar    = document.getElementById('result-roi-bar');
    const roiText   = document.getElementById('result-roi-text');

    if (leakageEl) leakageEl.textContent = formatNaira(monthlyLeakage);
    if (costEl) {
      const label = vehicles <= 10 ? 'Starter plan /month (up to 10 vehicles)' :
                    vehicles <= 20 ? 'Growth plan /month (up to 20 vehicles)' :
                    'Growth plan /month (' + vehicles + ' vehicles, ₦1,500/vehicle above 20)';
      costEl.textContent = formatNaira(planCost);
      const sub = costEl.parentElement && costEl.parentElement.querySelector('.calc-result-sub');
      if (sub) sub.textContent = label;
    }
    if (netEl) {
      netEl.textContent = net > 0 ? formatNaira(net) : '₦0';
      netEl.style.color = net > 0 ? '' : 'var(--color-ink-muted)';
    }

    const roiCapped = Math.min(roi, 20); // cap at 20× for bar display
    if (roiBar) roiBar.style.width = Math.round((roiCapped / 20) * 100) + '%';
    if (roiText) roiText.textContent = roi.toFixed(1) + '×';

    // Update days display
    const daysDisplay = document.getElementById('calc-days-display');
    if (daysDisplay) {
      const dayWord = document.documentElement.lang === 'fr' ? 'jours' : 'days';
      daysDisplay.textContent = days + ' ' + dayWord;
    }

    if (daysInput) daysInput.setAttribute('aria-valuenow', String(days));
  }

  function initCalculator() {
    const form = document.getElementById('leakage-calculator');
    if (!form) return;

    // Live recalculation on any input change
    form.addEventListener('input', calculate);
    form.addEventListener('change', calculate);

    // Initial calculation
    calculate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalculator);
  } else {
    initCalculator();
  }
})();

/* ============================================================================
   LEAD CAPTURE FORM
   AJAX submission to wp_ajax_mobiris_save_lead.
   ============================================================================ */

(function () {
  'use strict';

  function initLeadForm() {
    const form = document.getElementById('lead-capture-form');
    if (!form) return;

    const statusWrap  = form.querySelector('.lead-form__status');
    const successMsg  = form.querySelector('.lead-form__success');
    const errorMsg    = form.querySelector('.lead-form__error');
    const submitBtn   = form.querySelector('.lead-form__submit');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Basic validation
      const name     = form.querySelector('#lead-name');
      const phone    = form.querySelector('#lead-phone');
      const vehicles = form.querySelector('#lead-vehicles');

      if (!name || !name.value.trim()) { name && name.focus(); return; }
      if (!phone || !phone.value.trim()) { phone && phone.focus(); return; }
      if (!vehicles || parseInt(vehicles.value, 10) < 1) { vehicles && vehicles.focus(); return; }

      // Loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '...';
      }

      const formData = new FormData(form);
      formData.set('action', 'mobiris_save_lead');

      const ajaxUrl = (window.mobirisSite && window.mobirisSite.ajaxUrl)
        ? window.mobirisSite.ajaxUrl
        : '/wp-admin/admin-ajax.php';

      fetch(ajaxUrl, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (statusWrap) { statusWrap.hidden = false; }
          if (data.success) {
            if (successMsg) { successMsg.hidden = false; }
            if (errorMsg) { errorMsg.hidden = true; }
            form.reset();
          } else {
            if (errorMsg) { errorMsg.hidden = false; }
            if (successMsg) { successMsg.hidden = true; }
          }
        })
        .catch(function () {
          if (statusWrap) { statusWrap.hidden = false; }
          if (errorMsg) { errorMsg.hidden = false; }
          if (successMsg) { successMsg.hidden = true; }
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            const lang = localStorage.getItem('mobiris_lang') || 'en';
            submitBtn.textContent = lang === 'fr'
              ? 'Contactez-nous — nous vous appellerons'
              : "Get in touch — we'll call you";
          }
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLeadForm);
  } else {
    initLeadForm();
  }
})();
