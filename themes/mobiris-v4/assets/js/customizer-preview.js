/**
 * Mobiris v4 — Customizer Live Preview
 */
/* global wp */
(function ($) {
  'use strict';

  function liveText(id, sel) {
    wp.customize(id, function (v) { v.bind(function (n) { $(sel).text(n); }); });
  }
  function liveCss(id, prop) {
    wp.customize(id, function (v) { v.bind(function (n) { document.documentElement.style.setProperty(prop, n); }); });
  }
  function liveHref(id, sel) {
    wp.customize(id, function (v) { v.bind(function (n) { $(sel).attr('href', n); }); });
  }

  liveCss('mobiris_brand_color',      '--brand');
  liveCss('mobiris_brand_color_dark', '--brand-dark');

  liveText('mobiris_nav_logo_text',   '.nav__logo');
  liveText('mobiris_nav_cta_label',   '.nav__actions .btn--primary');
  liveText('mobiris_nav_signin_label', '.nav__signin');
  liveText('mobiris_nav_link1_label',  '.nav__links a:nth-child(1)');
  liveText('mobiris_nav_link2_label',  '.nav__links a:nth-child(2)');
  liveText('mobiris_nav_link3_label',  '.nav__links a:nth-child(3)');
  liveText('mobiris_nav_link4_label',  '.nav__links a:nth-child(4)');

  liveText('mobiris_hero_label',       '.hero__label .pill');
  liveText('mobiris_hero_headline',    '.hero__headline');
  liveText('mobiris_hero_subtext',     '.hero__subtext');
  liveText('mobiris_hero_cta1_label',  '.hero__ctas .btn--primary');
  liveText('mobiris_hero_cta2_label',  '.hero__ctas .btn--outline');
  liveText('mobiris_hero_social_proof','.hero__social-proof');
  liveHref('mobiris_hero_cta1_url',    '.hero__ctas .btn--primary');

  liveText('mobiris_problem_label',    '.problem__label');
  liveText('mobiris_problem_headline', '.problem__headline');
  liveText('mobiris_problem_bridge1',  '.problem__bridge-soft');
  liveText('mobiris_problem_bridge2',  '.problem__bridge-bold');

  liveText('mobiris_solution_label',    '.solution__label');
  liveText('mobiris_solution_headline', '.solution__headline');
  liveText('mobiris_solution_subtext',  '.solution__subtext');

  liveText('mobiris_hiw_label',   '.hiw__label');
  liveText('mobiris_hiw_subtext', '.hiw__subtext');

  liveText('mobiris_trust_label',    '.trust__label');
  liveText('mobiris_trust_headline', '.trust__headline');
  liveText('mobiris_trust_body',     '.trust__body');
  liveText('mobiris_trust_cta_label', '.trust__link');

  liveText('mobiris_app_headline',   '.app-section__headline');
  liveText('mobiris_app_subtext',    '.app-section__subtext');
  liveText('mobiris_app_rating_text','.app-section__rating');

  liveText('mobiris_gated_headline',    '.gated__headline');
  liveText('mobiris_gated_description', '.gated__description');
  liveText('mobiris_gated_cta_label',   '.gated__submit');

  liveText('mobiris_cta_headline',    '.cta-section__headline');
  liveText('mobiris_cta_subtext',     '.cta-section__subtext');
  liveText('mobiris_cta_btn1_label',  '.cta-section__btns .btn--white');
  liveText('mobiris_cta_btn2_label',  '.cta-section__btns .btn--ghost-white');
  liveText('mobiris_cta_fine_print',  '.cta-section__fine-print');
  liveHref('mobiris_cta_btn1_url',    '.cta-section__btns .btn--white');

  liveText('mobiris_footer_tagline', '.footer__tagline');
  liveText('mobiris_footer_domain',  '.footer__bottom p:last-child');

})(jQuery);
