'use strict';

/**
 * Navigation Module
 * Handles all navigation interactivity including mobile menu toggle,
 * dropdown menus, sticky header, skip-to-content, and active menu items.
 */

class MobirisNavigation {
  constructor() {
    this.mobileNav = document.querySelector('.mobile-nav');
    this.mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    this.siteHeader = document.querySelector('.site-header');
    this.mainContent = document.getElementById('main-content');
    this.skipLink = document.querySelector('a[href="#main-content"]');

    this.scrollTimeout = null;
    this.lastScrollY = 0;
    this.isScrolling = false;
    this.headerHeight = 0;

    // Store dropdown timeout IDs for cleanup
    this.dropdownTimeouts = new Map();

    this.init();
  }

  /**
   * Initialize all navigation features
   */
  init() {
    if (!this.mobileNav || !this.mobileNavToggle) {
      console.warn('Mobile navigation elements not found');
      return;
    }

    this.cacheHeaderHeight();
    this.bindMobileNavToggle();
    this.bindDropdownMenus();
    this.bindStickyHeader();
    this.bindSkipToContent();
    this.markActiveMenuItems();
    this.bindOutsideClickHandler();
    this.bindEscapeHandler();

    // Recalculate header height on resize
    window.addEventListener('resize', () => this.cacheHeaderHeight());
  }

  /**
   * Cache the header height for offset calculations
   */
  cacheHeaderHeight() {
    if (this.siteHeader) {
      this.headerHeight = this.siteHeader.offsetHeight;
    }
  }

  /**
   * Bind mobile navigation toggle functionality
   */
  bindMobileNavToggle() {
    if (!this.mobileNavToggle) return;

    this.mobileNavToggle.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleMobileNav();
    });
  }

  /**
   * Toggle mobile navigation visibility
   */
  toggleMobileNav() {
    const isOpen = this.mobileNav.classList.contains('is-open');

    if (isOpen) {
      this.closeMobileNav();
    } else {
      this.openMobileNav();
    }
  }

  /**
   * Open mobile navigation
   */
  openMobileNav() {
    this.mobileNav.classList.add('is-open');
    this.mobileNavToggle.classList.add('is-active');
    this.mobileNavToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  }

  /**
   * Close mobile navigation
   */
  closeMobileNav() {
    this.mobileNav.classList.remove('is-open');
    this.mobileNavToggle.classList.remove('is-active');
    this.mobileNavToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
  }

  /**
   * Bind dropdown menu functionality
   */
  bindDropdownMenus() {
    const dropdownTriggers = document.querySelectorAll('.has-dropdown > a, .has-dropdown > button');

    dropdownTriggers.forEach((trigger) => {
      // Click handler
      trigger.addEventListener('click', (e) => {
        // Only prevent default if it's a button or the link has no href
        if (trigger.tagName === 'BUTTON' || trigger.getAttribute('href') === '#') {
          e.preventDefault();
        }
        this.toggleDropdown(trigger);
      });

      // Keyboard handlers
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleDropdown(trigger);
        } else if (e.key === 'Escape') {
          this.closeDropdown(trigger);
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          this.navigateDropdownItems(trigger, e.key === 'ArrowDown');
        }
      });

      // Desktop hover handlers
      if (!this.isMobileDevice()) {
        const hasDropdown = trigger.closest('.has-dropdown');
        if (hasDropdown) {
          hasDropdown.addEventListener('mouseenter', () => {
            this.openDropdown(trigger);
            // Clear any pending close timeout
            const timeoutId = this.dropdownTimeouts.get(hasDropdown);
            if (timeoutId) {
              clearTimeout(timeoutId);
              this.dropdownTimeouts.delete(hasDropdown);
            }
          });

          hasDropdown.addEventListener('mouseleave', () => {
            // Delay close to allow movement between trigger and dropdown
            const timeoutId = setTimeout(() => {
              this.closeDropdown(trigger);
              this.dropdownTimeouts.delete(hasDropdown);
            }, 150);
            this.dropdownTimeouts.set(hasDropdown, timeoutId);
          });
        }
      }
    });
  }

  /**
   * Check if device is mobile
   */
  isMobileDevice() {
    return window.innerWidth <= 768;
  }

  /**
   * Toggle dropdown visibility
   */
  toggleDropdown(trigger) {
    const isOpen = trigger.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      this.closeDropdown(trigger);
    } else {
      this.openDropdown(trigger);
    }
  }

  /**
   * Open dropdown menu
   */
  openDropdown(trigger) {
    const hasDropdown = trigger.closest('.has-dropdown');
    if (!hasDropdown) return;

    const dropdownWrapper = hasDropdown.querySelector('.dropdown-wrapper');
    if (!dropdownWrapper) return;

    // Close sibling dropdowns
    const parent = hasDropdown.parentElement;
    if (parent) {
      parent.querySelectorAll('.has-dropdown').forEach((sibling) => {
        if (sibling !== hasDropdown) {
          const siblingTrigger = sibling.querySelector('a, button');
          if (siblingTrigger) {
            this.closeDropdown(siblingTrigger);
          }
        }
      });
    }

    trigger.setAttribute('aria-expanded', 'true');
    dropdownWrapper.classList.add('is-open');
  }

  /**
   * Close dropdown menu
   */
  closeDropdown(trigger) {
    const hasDropdown = trigger.closest('.has-dropdown');
    if (!hasDropdown) return;

    const dropdownWrapper = hasDropdown.querySelector('.dropdown-wrapper');
    if (!dropdownWrapper) return;

    trigger.setAttribute('aria-expanded', 'false');
    dropdownWrapper.classList.remove('is-open');
  }

  /**
   * Navigate between dropdown menu items with arrow keys
   */
  navigateDropdownItems(trigger, isDown) {
    const hasDropdown = trigger.closest('.has-dropdown');
    if (!hasDropdown) return;

    const dropdownWrapper = hasDropdown.querySelector('.dropdown-wrapper');
    if (!dropdownWrapper) return;

    // First, open the dropdown if it's not open
    if (trigger.getAttribute('aria-expanded') !== 'true') {
      this.openDropdown(trigger);
    }

    const items = dropdownWrapper.querySelectorAll('a, button');
    if (items.length === 0) return;

    const currentIndex = Array.from(items).indexOf(document.activeElement);
    let nextIndex;

    if (isDown) {
      nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
    } else {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
    }

    items[nextIndex].focus();
  }

  /**
   * Bind sticky header functionality
   */
  bindStickyHeader() {
    if (!this.siteHeader) return;

    let rafId = null;

    window.addEventListener('scroll', () => {
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          this.updateStickyHeader();
          rafId = null;
        });
      }
    }, { passive: true });
  }

  /**
   * Update sticky header state based on scroll position
   */
  updateStickyHeader() {
    const scrollY = window.scrollY || window.pageYOffset;

    if (scrollY > 60) {
      this.siteHeader.classList.add('scrolled');
    } else {
      this.siteHeader.classList.remove('scrolled');
    }

    this.lastScrollY = scrollY;
  }

  /**
   * Bind skip-to-content link functionality
   */
  bindSkipToContent() {
    if (!this.skipLink || !this.mainContent) return;

    this.skipLink.addEventListener('click', (e) => {
      e.preventDefault();

      this.mainContent.setAttribute('tabindex', '-1');
      this.mainContent.focus();

      // Smooth scroll to content
      this.mainContent.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      // Remove tabindex after focus to restore normal flow
      this.mainContent.addEventListener('blur', () => {
        this.mainContent.removeAttribute('tabindex');
      }, { once: true });
    });
  }

  /**
   * Mark current page's menu items as active based on URL
   */
  markActiveMenuItems() {
    const currentUrl = window.location.pathname;
    const menuLinks = document.querySelectorAll('.site-nav a[href]');

    menuLinks.forEach((link) => {
      const href = link.getAttribute('href');

      // Match exact path or handle trailing slash variations
      const isActive =
        href === currentUrl ||
        href === currentUrl.replace(/\/$/, '') ||
        currentUrl === href.replace(/\/$/, '');

      if (isActive) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');

        // Also mark parent menu items as active
        let parent = link.closest('.has-dropdown');
        if (parent) {
          const parentLink = parent.querySelector('a, button');
          if (parentLink) {
            parentLink.classList.add('is-active');
          }
        }
      } else {
        link.classList.remove('is-active');
        link.removeAttribute('aria-current');
      }
    });
  }

  /**
   * Close mobile nav and dropdowns when clicking outside
   */
  bindOutsideClickHandler() {
    document.addEventListener('click', (e) => {
      // Close mobile nav when clicking outside
      if (
        this.mobileNav &&
        !this.mobileNav.contains(e.target) &&
        !this.mobileNavToggle.contains(e.target)
      ) {
        if (this.mobileNav.classList.contains('is-open')) {
          this.closeMobileNav();
        }
      }

      // Close dropdowns when clicking outside
      const dropdowns = document.querySelectorAll('.has-dropdown');
      dropdowns.forEach((dropdown) => {
        const trigger = dropdown.querySelector('a, button');
        if (trigger && !dropdown.contains(e.target)) {
          this.closeDropdown(trigger);
        }
      });
    });
  }

  /**
   * Close navigation elements when Escape key is pressed
   */
  bindEscapeHandler() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Close mobile nav
        if (this.mobileNav && this.mobileNav.classList.contains('is-open')) {
          this.closeMobileNav();
        }

        // Close all dropdowns
        const dropdowns = document.querySelectorAll('.has-dropdown');
        dropdowns.forEach((dropdown) => {
          const trigger = dropdown.querySelector('a, button');
          if (trigger) {
            this.closeDropdown(trigger);
          }
        });
      }
    });
  }

  /**
   * Cleanup method for when page unloads
   */
  destroy() {
    // Clear any pending timeouts
    this.dropdownTimeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.dropdownTimeouts.clear();

    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }
}

/**
 * Initialize navigation when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.mobirisNav = new MobirisNavigation();
  });
} else {
  window.mobirisNav = new MobirisNavigation();
}

/**
 * Cleanup on page unload
 */
window.addEventListener('beforeunload', () => {
  if (window.mobirisNav) {
    window.mobirisNav.destroy();
  }
});
