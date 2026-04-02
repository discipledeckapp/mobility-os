/**
 * Mobiris v3 — Customizer Live Preview
 *
 * Binds WordPress Customizer postMessage transport to DOM elements
 * so changes appear instantly without a full page refresh.
 */

/* global wp */
(function ($) {
  'use strict';

  // ── Helper: simple text binding ───────────────────────────
  function liveText(settingId, selector) {
    wp.customize(settingId, function (value) {
      value.bind(function (newVal) {
        $(selector).text(newVal);
      });
    });
  }

  // ── Helper: update :root CSS variable ─────────────────────
  function liveCssVar(settingId, varName) {
    wp.customize(settingId, function (value) {
      value.bind(function (newVal) {
        document.documentElement.style.setProperty(varName, newVal);
      });
    });
  }

  // ── Colors ────────────────────────────────────────────────
  liveCssVar('mobiris_brand_color',      '--brand');
  liveCssVar('mobiris_brand_color_dark', '--brand-dark');

  // ── Nav ───────────────────────────────────────────────────
  liveText('mobiris_nav_logo_text',   '.nav__logo');
  liveText('mobiris_nav_cta_label',   '.nav__actions .btn--primary');
  liveText('mobiris_nav_signin_label', '.nav__signin');
  liveText('mobiris_nav_link1_label',  '.nav__links a:nth-child(1)');
  liveText('mobiris_nav_link2_label',  '.nav__links a:nth-child(2)');
  liveText('mobiris_nav_link3_label',  '.nav__links a:nth-child(3)');

  // ── Hero ──────────────────────────────────────────────────
  liveText('mobiris_hero_label',        '.hero__label .pill');
  liveText('mobiris_hero_headline',     '.hero__headline');
  liveText('mobiris_hero_subtext',      '.hero__subtext');
  liveText('mobiris_hero_cta1_label',   '.hero__ctas .btn--primary');
  liveText('mobiris_hero_cta2_label',   '.hero__ctas .btn--outline');
  liveText('mobiris_hero_social_proof', '.hero__social-proof');

  wp.customize('mobiris_hero_cta1_url', function (value) {
    value.bind(function (newVal) {
      $('.hero__ctas .btn--primary').attr('href', newVal);
    });
  });

  // ── Problem ───────────────────────────────────────────────
  liveText('mobiris_problem_label',   '.problem__label');
  liveText('mobiris_problem_headline', '.problem__headline');
  liveText('mobiris_problem_bridge1', '.problem__bridge-soft');
  liveText('mobiris_problem_bridge2', '.problem__bridge-bold');

  for (var i = 1; i <= 6; i++) {
    (function (idx) {
      wp.customize('mobiris_problem_pain_' + idx, function (value) {
        value.bind(function (newVal) {
          $('.problem__card:nth-child(' + idx + ') .problem__text').text(newVal);
        });
      });
    })(i);
  }

  // ── Solution ──────────────────────────────────────────────
  liveText('mobiris_solution_label',   '.solution__label');
  liveText('mobiris_solution_headline', '.solution__headline');
  liveText('mobiris_solution_subtext',  '.solution__subtext');

  for (var j = 1; j <= 4; j++) {
    (function (idx) {
      wp.customize('mobiris_solution_feature_' + idx + '_title', function (value) {
        value.bind(function (newVal) {
          $('.solution__card:nth-child(' + idx + ') .solution__title').text(newVal);
        });
      });
      wp.customize('mobiris_solution_feature_' + idx + '_body', function (value) {
        value.bind(function (newVal) {
          $('.solution__card:nth-child(' + idx + ') .solution__body').text(newVal);
        });
      });
    })(j);
  }

  // ── How It Works ──────────────────────────────────────────
  liveText('mobiris_hiw_label',   '.hiw__label');
  liveText('mobiris_hiw_subtext', '.hiw__subtext');

  for (var k = 1; k <= 4; k++) {
    (function (idx) {
      wp.customize('mobiris_hiw_step_' + idx + '_title', function (value) {
        value.bind(function (newVal) {
          $('.hiw__step:nth-child(' + idx + ') .hiw__step-title').text(newVal);
        });
      });
      wp.customize('mobiris_hiw_step_' + idx + '_body', function (value) {
        value.bind(function (newVal) {
          $('.hiw__step:nth-child(' + idx + ') .hiw__step-body').text(newVal);
        });
      });
    })(k);
  }

  // ── Trust ─────────────────────────────────────────────────
  liveText('mobiris_trust_label',    '.trust__label');
  liveText('mobiris_trust_headline', '.trust__headline');
  liveText('mobiris_trust_body',     '.trust__body');
  liveText('mobiris_trust_cta_label', '.trust__link');

  for (var t = 1; t <= 4; t++) {
    (function (idx) {
      wp.customize('mobiris_trust_item_' + idx + '_title', function (value) {
        value.bind(function (newVal) {
          $('.trust__card:nth-child(' + idx + ') .trust__card-title').text(newVal);
        });
      });
      wp.customize('mobiris_trust_item_' + idx + '_body', function (value) {
        value.bind(function (newVal) {
          $('.trust__card:nth-child(' + idx + ') .trust__card-body').text(newVal);
        });
      });
    })(t);
  }

  // ── CTA ───────────────────────────────────────────────────
  liveText('mobiris_cta_headline',   '.cta-section__headline');
  liveText('mobiris_cta_subtext',    '.cta-section__subtext');
  liveText('mobiris_cta_btn1_label', '.cta-section__btns .btn--white');
  liveText('mobiris_cta_btn2_label', '.cta-section__btns .btn--ghost-white');
  liveText('mobiris_cta_fine_print', '.cta-section__fine-print');

  wp.customize('mobiris_cta_btn1_url', function (value) {
    value.bind(function (newVal) {
      $('.cta-section__btns .btn--white').attr('href', newVal);
    });
  });

  // ── Footer ────────────────────────────────────────────────
  liveText('mobiris_footer_tagline', '.footer__tagline');
  liveText('mobiris_footer_domain',  '.footer__bottom p:last-child');

})(jQuery);
