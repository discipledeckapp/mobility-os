<?php
/**
 * Header — Mobiris V2
 * @package MobirisV2
 */
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="mv2-skip-link" href="#mv2-main"><?php esc_html_e('Skip to content','mobiris-v2'); ?></a>

<header class="mv2-header" role="banner" id="mv2-header">
  <div class="mv2-header__inner mv2-container">

    <!-- Logo -->
    <div class="mv2-header__logo">
      <?php if ( has_custom_logo() ) {
        echo get_custom_logo();
      } else { ?>
        <a href="<?php echo esc_url(home_url('/')); ?>" class="mv2-logo-text" rel="home">
          <?php echo esc_html( mv2_opt('mv2_company_name','Mobiris') ); ?>
        </a>
      <?php } ?>
    </div>

    <!-- Primary Nav -->
    <nav class="mv2-nav" role="navigation" aria-label="<?php esc_attr_e('Primary','mobiris-v2'); ?>">
      <?php if ( has_nav_menu('primary') ) {
        wp_nav_menu( array(
          'theme_location' => 'primary',
          'container'      => false,
          'menu_class'     => 'mv2-nav__list',
          'fallback_cb'    => false,
          'depth'          => 2,
        ) );
      } ?>
    </nav>

    <!-- Header Actions -->
    <div class="mv2-header__actions">
      <!-- Language toggle -->
      <div class="mv2-lang-toggle" role="group" aria-label="Language">
        <button class="mv2-lang-btn mv2-lang-btn--active" data-lang="en" aria-pressed="true">EN</button>
        <button class="mv2-lang-btn" data-lang="fr" aria-pressed="false">FR</button>
      </div>

      <a href="<?php echo esc_url( mv2_opt('mv2_login_url','https://app.mobiris.ng/login') ); ?>"
         class="mv2-btn mv2-btn--ghost mv2-btn--sm"
         target="_blank" rel="noopener">
        <span data-lang-en="Log In" data-lang-fr="Connexion">Log In</span>
      </a>

      <a href="<?php echo mv2_signup_url(); ?>"
         class="mv2-btn mv2-btn--primary mv2-btn--sm"
         target="_blank" rel="noopener">
        <span data-lang-en="Get Started" data-lang-fr="Commencer">Get Started</span>
      </a>

      <!-- Hamburger -->
      <button class="mv2-hamburger" aria-expanded="false" aria-controls="mv2-mobile-nav"
              aria-label="<?php esc_attr_e('Open menu','mobiris-v2'); ?>">
        <span></span><span></span><span></span>
      </button>
    </div>

  </div>
</header>

<!-- Mobile Nav Drawer -->
<div class="mv2-mobile-nav" id="mv2-mobile-nav" aria-hidden="true" role="dialog">
  <div class="mv2-mobile-nav__inner">
    <div class="mv2-mobile-nav__header">
      <span class="mv2-mobile-nav__brand"><?php echo esc_html( mv2_opt('mv2_company_name','Mobiris') ); ?></span>
      <button class="mv2-mobile-nav__close" aria-label="<?php esc_attr_e('Close menu','mobiris-v2'); ?>">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    <?php wp_nav_menu( array(
      'theme_location' => 'primary',
      'container'      => false,
      'menu_class'     => 'mv2-mobile-nav__list',
      'fallback_cb'    => false,
      'depth'          => 2,
    ) ); ?>
    <div class="mv2-mobile-nav__footer">
      <div class="mv2-mobile-nav__lang">
        <button class="mv2-lang-btn mv2-lang-btn--active" data-lang="en">EN</button>
        <button class="mv2-lang-btn" data-lang="fr">FR</button>
      </div>
      <a href="<?php echo mv2_signup_url(); ?>" class="mv2-btn mv2-btn--primary mv2-btn--block">
        <span data-lang-en="Start Free — 14 Days" data-lang-fr="Commencer — 14 Jours Gratuits">Start Free — 14 Days</span>
      </a>
      <a href="<?php echo esc_url( mv2_wa_url('mv2_wa_msg_operator') ); ?>"
         class="mv2-btn mv2-btn--whatsapp mv2-btn--block" target="_blank" rel="noopener">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 0C4.48 0 0 4.48 0 10c0 1.77.46 3.43 1.27 4.86L0 20l5.3-1.24A9.94 9.94 0 0010 20c5.52 0 10-4.48 10-10S15.52 0 10 0zm5.22 14.09c-.22.61-1.08 1.12-1.75 1.26-.47.1-1.09.17-3.14-.67C7.7 13.58 5.28 10.77 5.1 10.54c-.18-.23-1.52-2.03-1.52-3.87 0-1.84.97-2.73 1.49-2.92.52-.18.86-.13 1.22-.13.3 0 .62 0 .88.67.3.74 1.01 2.47 1.1 2.65.09.18.14.4.03.63-.11.24-.17.38-.34.59-.17.21-.35.47-.5.64-.17.17-.34.37-.15.72.2.35.85 1.4 1.81 2.26 1.24 1.1 2.29 1.44 2.62 1.6.33.16.52.14.71-.06.2-.2.83-.97 1.05-1.3.22-.33.44-.27.75-.17.3.11 1.93.91 2.26 1.07.33.17.56.25.64.38.08.14.08.82-.14 1.43z"/></svg>
        <span data-lang-en="Chat on WhatsApp" data-lang-fr="Discuter sur WhatsApp">Chat on WhatsApp</span>
      </a>
    </div>
  </div>
</div>
<div class="mv2-overlay" aria-hidden="true"></div>

<main id="mv2-main" role="main" tabindex="-1">
