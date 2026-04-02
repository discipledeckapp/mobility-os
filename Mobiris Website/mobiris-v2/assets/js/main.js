/* ============================================================
   Mobiris V2 — Main JavaScript
   Modules: bilingual, calculator, lead form, mobile nav
   All in vanilla JS, no dependencies.
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. BILINGUAL TOGGLE ────────────────────────────────── */
  var MV2Lang = (function () {
    var STORAGE_KEY = 'mv2_lang';
    var current = localStorage.getItem(STORAGE_KEY) || 'en';

    function apply(lang) {
      current = lang;
      localStorage.setItem(STORAGE_KEY, lang);

      // Update all data-lang-* elements
      document.querySelectorAll('[data-lang-en], [data-lang-fr]').forEach(function (el) {
        var val = el.getAttribute('data-lang-' + lang);
        if (val === null) return;
        // For inputs/selects change placeholder; for others change textContent
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = val;
        } else if (el.tagName === 'OPTION') {
          el.textContent = val;
        } else {
          el.textContent = val;
        }
      });

      // Mark active lang buttons
      document.querySelectorAll('[data-lang]').forEach(function (btn) {
        btn.classList.toggle('is-active', btn.getAttribute('data-lang') === lang);
      });

      // Keep hidden input in lead form in sync
      var langInput = document.getElementById('mv2-lead-lang');
      if (langInput) langInput.value = lang;

      // Update <html lang>
      document.documentElement.lang = lang;
    }

    function init() {
      // Bind all lang toggle buttons
      document.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-lang]');
        if (!btn) return;
        apply(btn.getAttribute('data-lang'));
      });
      apply(current);
    }

    return { init: init, get: function () { return current; } };
  })();

  /* ── 2. PROFIT / LEAKAGE CALCULATOR ────────────────────── */
  var MV2Calc = (function () {
    var DAILY_RATES = { keke: 4500, danfo: 11250, korope: 9000, matatu: 10000 };
    var selectedType = 'danfo';

    function getPlanCost(vehicles) {
      if (vehicles <= 10) return 15000;
      return 35000 + (vehicles - 10) * 1500;
    }

    function formatNaira(n) {
      return '₦' + Math.round(n).toLocaleString('en-NG');
    }

    function recalc() {
      var vehiclesEl = document.getElementById('mv2-vehicles');
      var daysEl     = document.getElementById('mv2-days');
      var leakageEl  = document.getElementById('mv2-leakage');
      if (!vehiclesEl) return;

      var vehicles    = parseInt(vehiclesEl.value, 10);
      var days        = parseInt(daysEl.value, 10);
      var leakagePct  = parseInt(leakageEl.value, 10) / 100;
      var dailyRate   = DAILY_RATES[selectedType] || 11250;

      var monthlyRevenue = vehicles * dailyRate * days;
      var leakage        = monthlyRevenue * leakagePct;
      var planCost       = getPlanCost(vehicles);
      var netGain        = leakage - planCost;
      var roi            = planCost > 0 ? (leakage / planCost) : 0;
      var roiPct         = Math.min(roi / 20, 1) * 100; // cap bar at 20×

      document.getElementById('mv2-res-revenue').textContent = formatNaira(monthlyRevenue);
      document.getElementById('mv2-res-leakage').textContent = formatNaira(leakage);
      document.getElementById('mv2-res-plan').textContent    = formatNaira(planCost);
      document.getElementById('mv2-res-net').textContent     = netGain > 0 ? formatNaira(netGain) : '—';
      document.getElementById('mv2-roi-fill').style.width    = roiPct.toFixed(1) + '%';
      document.getElementById('mv2-roi-pct').textContent     = roi.toFixed(1) + '×';

      // Update output labels for sliders
      document.getElementById('mv2-vehicles-val').textContent = vehicles;
      document.getElementById('mv2-days-val').textContent     = days;
      document.getElementById('mv2-leakage-val').textContent  = leakageEl.value + '%';

      // Update WhatsApp CTA link with computed numbers
      updateCalcWaLink(vehicles, selectedType, monthlyRevenue, leakage, planCost, netGain);
    }

    function updateCalcWaLink(vehicles, type, rev, leak, plan, net) {
      var btn = document.getElementById('mv2-calc-wa-btn');
      if (!btn || typeof mv2Site === 'undefined') return;
      var msg = 'Hi Mobiris, I used your calculator:\n'
              + '- Fleet: ' + vehicles + ' ' + type + '\n'
              + '- Expected monthly revenue: ' + formatNaira(rev) + '\n'
              + '- Estimated leakage: ' + formatNaira(leak) + '\n'
              + '- Net recoverable value: ' + (net > 0 ? formatNaira(net) : 'less than plan cost') + '\n'
              + "I'd like to learn more about Mobiris.";
      btn.href = 'https://wa.me/' + mv2Site.whatsapp + '?text=' + encodeURIComponent(msg);
    }

    function init() {
      var section = document.getElementById('mv2-calculator');
      if (!section) return;

      // Type buttons
      section.addEventListener('click', function (e) {
        var btn = e.target.closest('.mv2-calc__type-btn');
        if (!btn) return;
        section.querySelectorAll('.mv2-calc__type-btn').forEach(function (b) {
          b.classList.remove('mv2-calc__type-btn--active');
        });
        btn.classList.add('mv2-calc__type-btn--active');
        selectedType = btn.getAttribute('data-type');
        recalc();
      });

      // Range sliders
      ['mv2-vehicles', 'mv2-days', 'mv2-leakage'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('input', recalc);
      });

      recalc();
    }

    return { init: init };
  })();

  /* ── 3. LEAD FORM AJAX ──────────────────────────────────── */
  var MV2Lead = (function () {
    function init() {
      var form = document.getElementById('mv2-lead-form');
      if (!form) return;

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var submitBtn = document.getElementById('mv2-lead-submit');
        var submitText = form.querySelector('.mv2-lead__submit-text');
        var spinner    = form.querySelector('.mv2-lead__submit-spinner');

        // Basic client-side validation
        var name  = form.querySelector('[name="name"]').value.trim();
        var phone = form.querySelector('[name="phone"]').value.trim();
        var vehicles = form.querySelector('[name="vehicles"]').value;
        if (!name || !phone || !vehicles) {
          alert(MV2Lang.get() === 'fr'
            ? 'Veuillez remplir les champs obligatoires (nom, téléphone, nombre de véhicules).'
            : 'Please fill in the required fields: name, phone, and number of vehicles.');
          return;
        }

        // Disable button
        submitBtn.disabled = true;
        if (submitText) submitText.hidden = true;
        if (spinner)    spinner.hidden    = false;

        var data = new FormData(form);
        if (typeof mv2Site !== 'undefined') {
          data.set('security', mv2Site.nonce);
        }

        fetch(mv2Site.ajaxUrl, {
          method: 'POST',
          body: data,
          credentials: 'same-origin',
        })
          .then(function (r) { return r.json(); })
          .then(function (res) {
            if (res.success) {
              form.hidden = true;
              var success = document.getElementById('mv2-lead-success');
              if (success) success.hidden = false;
            } else {
              var msg = res.data && res.data.message
                ? res.data.message
                : (MV2Lang.get() === 'fr' ? 'Une erreur s\'est produite. Veuillez réessayer.' : 'Something went wrong. Please try again.');
              alert(msg);
              submitBtn.disabled = false;
              if (submitText) submitText.hidden = false;
              if (spinner)    spinner.hidden    = true;
            }
          })
          .catch(function () {
            alert(MV2Lang.get() === 'fr'
              ? 'Impossible d\'envoyer votre demande. Vérifiez votre connexion.'
              : 'Could not send your request. Check your connection.');
            submitBtn.disabled = false;
            if (submitText) submitText.hidden = false;
            if (spinner)    spinner.hidden    = true;
          });
      });
    }

    return { init: init };
  })();

  /* ── 4. MOBILE NAV ──────────────────────────────────────── */
  var MV2Nav = (function () {
    function init() {
      var burger  = document.getElementById('mv2-burger');
      var mobileNav = document.getElementById('mv2-mobile-nav');
      var closeBtn  = document.getElementById('mv2-mobile-close');
      if (!burger || !mobileNav) return;

      function open() {
        mobileNav.classList.add('is-open');
        burger.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        burger.setAttribute('aria-expanded', 'true');
      }
      function close() {
        mobileNav.classList.remove('is-open');
        burger.classList.remove('is-open');
        document.body.style.overflow = '';
        burger.setAttribute('aria-expanded', 'false');
      }

      burger.addEventListener('click', function () {
        mobileNav.classList.contains('is-open') ? close() : open();
      });
      if (closeBtn) closeBtn.addEventListener('click', close);

      // Close on backdrop click (nav link)
      mobileNav.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') close();
      });

      // Close on Escape
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
      });
    }

    return { init: init };
  })();

  /* ── 5. STICKY HEADER SHADOW ────────────────────────────── */
  function initHeaderScroll() {
    var header = document.querySelector('.mv2-header');
    if (!header) return;
    window.addEventListener('scroll', function () {
      header.classList.toggle('mv2-header--scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  /* ── BOOT ───────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    MV2Lang.init();
    MV2Calc.init();
    MV2Lead.init();
    MV2Nav.init();
    initHeaderScroll();
  });

})();
