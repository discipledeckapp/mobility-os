<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="profile" href="https://gmpg.org/xfn/11">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<a class="skip-link screen-reader-text" href="#main-content">
	<?php esc_html_e( 'Skip to content', 'mobiris-v2' ); ?>
</a>

<header class="mv2-header" id="mv2-header" role="banner">
	<div class="mv2-header__inner mv2-container">

		<!-- Logo -->
		<div class="mv2-header__logo">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home" aria-label="<?php echo esc_attr( mv2_option( 'company_name', 'Mobiris' ) ); ?> — <?php esc_attr_e( 'Homepage', 'mobiris-v2' ); ?>">
				<?php if ( has_custom_logo() ) : ?>
					<?php the_custom_logo(); ?>
				<?php else : ?>
					<span class="mv2-logo-text">
						<span class="mv2-logo-text__primary"><?php echo esc_html( mv2_option( 'company_name', 'Mobiris' ) ); ?></span>
					</span>
				<?php endif; ?>
			</a>
		</div>

		<!-- Primary Navigation -->
		<nav class="mv2-header__nav" id="mv2-primary-nav" aria-label="<?php esc_attr_e( 'Primary Navigation', 'mobiris-v2' ); ?>">
			<?php
			wp_nav_menu(
				array(
					'theme_location'  => 'primary',
					'menu_class'      => 'mv2-nav-list',
					'container'       => false,
					'fallback_cb'     => 'mv2_fallback_menu',
					'items_wrap'      => '<ul class="%2$s" id="%1$s" role="menubar">%3$s</ul>',
					'link_before'     => '',
					'link_after'      => '',
				)
			);
			?>
		</nav>

		<!-- Header Actions -->
		<div class="mv2-header__actions">
			<!-- Language Toggle -->
			<div class="mv2-lang-toggle" role="group" aria-label="<?php esc_attr_e( 'Language selection', 'mobiris-v2' ); ?>">
				<button class="mv2-lang-btn mv2-lang-btn--en is-active" data-lang="en" aria-pressed="true" aria-label="<?php esc_attr_e( 'Switch to English', 'mobiris-v2' ); ?>">EN</button>
				<button class="mv2-lang-btn mv2-lang-btn--fr" data-lang="fr" aria-pressed="false" aria-label="<?php esc_attr_e( 'Passer au français', 'mobiris-v2' ); ?>">FR</button>
			</div>

			<!-- CTA Buttons -->
			<a href="<?php echo esc_url( mv2_wa_url( mv2_option( 'wa_msg_operators', 'I want to reduce leakage in my transport business' ) ) ); ?>"
			   class="mv2-btn mv2-btn--wa mv2-btn--sm"
			   target="_blank"
			   rel="noopener noreferrer"
			   aria-label="<?php esc_attr_e( 'Chat on WhatsApp', 'mobiris-v2' ); ?>">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
				<span data-lang-en="Chat" data-lang-fr="Discuter">Chat</span>
			</a>

			<a href="<?php echo esc_url( mv2_app_url() ); ?>"
			   class="mv2-btn mv2-btn--primary mv2-btn--sm"
			   target="_blank"
			   rel="noopener noreferrer">
				<span data-lang-en="Start Free" data-lang-fr="Commencer">Start Free</span>
			</a>

			<!-- Mobile Menu Toggle -->
			<button class="mv2-header__burger" id="mv2-menu-toggle" aria-expanded="false" aria-controls="mv2-primary-nav" aria-label="<?php esc_attr_e( 'Toggle navigation menu', 'mobiris-v2' ); ?>">
				<span class="mv2-burger__line"></span>
				<span class="mv2-burger__line"></span>
				<span class="mv2-burger__line"></span>
			</button>
		</div>
	</div>

	<!-- Mobile Nav Overlay -->
	<div class="mv2-mobile-nav" id="mv2-mobile-nav" aria-hidden="true">
		<div class="mv2-mobile-nav__inner">
			<?php
			wp_nav_menu(
				array(
					'theme_location' => 'primary',
					'menu_class'     => 'mv2-mobile-nav-list',
					'container'      => false,
					'fallback_cb'    => 'mv2_fallback_menu',
				)
			);
			?>
			<div class="mv2-mobile-nav__ctas">
				<div class="mv2-lang-toggle mv2-lang-toggle--mobile" role="group">
					<button class="mv2-lang-btn mv2-lang-btn--en is-active" data-lang="en">EN</button>
					<button class="mv2-lang-btn mv2-lang-btn--fr" data-lang="fr">FR</button>
				</div>
				<a href="<?php echo esc_url( mv2_wa_url( mv2_option( 'wa_msg_operators', 'I want to reduce leakage in my transport business' ) ) ); ?>"
				   class="mv2-btn mv2-btn--wa mv2-btn--full"
				   target="_blank" rel="noopener noreferrer">
					<span data-lang-en="Chat on WhatsApp" data-lang-fr="Discuter sur WhatsApp">Chat on WhatsApp</span>
				</a>
				<a href="<?php echo esc_url( mv2_app_url() ); ?>"
				   class="mv2-btn mv2-btn--primary mv2-btn--full"
				   target="_blank" rel="noopener noreferrer">
					<span data-lang-en="Start Free Trial" data-lang-fr="Essai Gratuit">Start Free Trial</span>
				</a>
			</div>
		</div>
	</div>
	<div class="mv2-mobile-nav-backdrop" id="mv2-nav-backdrop" aria-hidden="true"></div>
</header>

<main id="main-content" class="mv2-main" role="main">
<?php

/**
 * Fallback nav menu.
 *
 * @param array $args Nav args.
 */
function mv2_fallback_menu( $args ) {
	$pages = get_pages( array( 'sort_column' => 'menu_order', 'number' => 8 ) );
	if ( ! $pages ) {
		return;
	}
	echo '<ul class="' . esc_attr( $args['menu_class'] ) . '">';
	foreach ( $pages as $page ) {
		echo '<li><a href="' . esc_url( get_permalink( $page->ID ) ) . '">' . esc_html( $page->post_title ) . '</a></li>';
	}
	echo '</ul>';
}
