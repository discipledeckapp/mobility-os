<?php
/**
 * The header for our theme
 *
 * Displays all of the <head> section and everything up until </main>.
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package Mobiris
 */

?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="profile" href="https://gmpg.org/xfn/11">
	<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
	<?php wp_body_open(); ?>

	<a class="skip-link screen-reader-text" href="#main-content"><?php esc_html_e( 'Skip to content', 'mobiris' ); ?></a>

	<?php
	// Announcement Bar
	$announcement_text = get_theme_mod( 'mobiris_header_announcement', '' );
	if ( ! empty( $announcement_text ) ) {
		$announcement_url = get_theme_mod( 'mobiris_header_announcement_url', '#' );
		?>
		<div class="announcement-bar" role="banner">
			<div class="container">
				<a href="<?php echo esc_url( $announcement_url ); ?>" class="announcement-bar-link">
					<?php echo esc_html( $announcement_text ); ?>
					<span aria-hidden="true">→</span>
				</a>
				<button class="announcement-bar__close" aria-label="<?php esc_attr_e( 'Dismiss announcement', 'mobiris' ); ?>">
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
						<path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
			</div>
		</div>
		<?php
	}
	?>

	<?php
	$header_style = get_theme_mod( 'mobiris_header_style', 'light' );
	?>
	<header class="site-header header-<?php echo esc_attr( $header_style ); ?>" role="banner">
		<div class="site-header-inner container">
			<div class="site-logo">
				<?php
				// Check for WordPress custom logo first
				if ( has_custom_logo() ) {
					echo get_custom_logo();
				} else {
					// Check for theme mod logo
					$logo_key = 'dark' === $header_style ? 'mobiris_logo_dark' : 'mobiris_logo_light';
					$logo_url = get_theme_mod( $logo_key, '' );

					if ( ! empty( $logo_url ) ) {
						?>
						<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="custom-logo-link" rel="home">
							<img src="<?php echo esc_url( $logo_url ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>" class="custom-logo">
						</a>
						<?php
					} else {
						// Fallback to text logo
						?>
						<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="site-logo-text" rel="home">
							<span><?php echo esc_html( get_theme_mod( 'mobiris_company_name', 'Mobiris' ) ); ?></span>
						</a>
						<?php
					}
				}
				?>
			</div>

			<?php
			if ( has_nav_menu( 'primary' ) ) {
				?>
				<nav class="site-nav" role="navigation" aria-label="<?php esc_attr_e( 'Primary navigation', 'mobiris' ); ?>">
					<?php
					wp_nav_menu(
						array(
							'theme_location' => 'primary',
							'container'      => false,
							'fallback_cb'    => false,
							'walker'         => class_exists( 'Mobiris_Walker_Nav_Menu' ) ? new Mobiris_Walker_Nav_Menu() : null,
							'depth'          => 3,
						)
					);
					?>
				</nav>
				<?php
			}
			?>

			<div class="site-header-actions">
				<?php
				$login_label = get_theme_mod( 'mobiris_header_login_label', 'Log In' );
				$login_url   = get_theme_mod( 'mobiris_header_login_url', 'https://app.mobiris.ng/login' );
				?>
				<a href="<?php echo esc_url( $login_url ); ?>" class="btn btn-secondary btn-sm" target="_blank" rel="noopener noreferrer">
					<?php echo esc_html( $login_label ); ?>
				</a>

				<?php
				$cta_label = get_theme_mod( 'mobiris_header_cta_label', 'Get Started' );
				$cta_url   = get_theme_mod( 'mobiris_header_cta_url', 'https://app.mobiris.ng/signup' );
				?>
				<a href="<?php echo esc_url( $cta_url ); ?>" class="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer">
					<?php echo esc_html( $cta_label ); ?>
				</a>

				<button class="site-header-toggle" aria-expanded="false" aria-controls="mobile-nav" aria-label="<?php esc_attr_e( 'Open navigation menu', 'mobiris' ); ?>">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
						<path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
			</div>
		</div>
	</header>

	<!-- Mobile Navigation -->
	<div class="mobile-nav" id="mobile-nav" aria-hidden="true" role="dialog" aria-label="<?php esc_attr_e( 'Mobile navigation', 'mobiris' ); ?>">
		<div class="mobile-nav-inner">
			<div class="mobile-nav-header">
				<div class="mobile-nav-logo">
					<?php
					$logo_key = 'dark' === $header_style ? 'mobiris_logo_dark' : 'mobiris_logo_light';
					$logo_url = get_theme_mod( $logo_key, '' );

					if ( ! empty( $logo_url ) ) {
						?>
						<img src="<?php echo esc_url( $logo_url ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>">
						<?php
					} else {
						echo esc_html( get_theme_mod( 'mobiris_company_name', 'Mobiris' ) );
					}
					?>
				</div>
				<button class="mobile-nav-close" aria-label="<?php esc_attr_e( 'Close navigation menu', 'mobiris' ); ?>">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
						<path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
			</div>

			<?php
			if ( has_nav_menu( 'mobile' ) ) {
				wp_nav_menu(
					array(
						'theme_location' => 'mobile',
						'container'      => false,
						'fallback_cb'    => false,
						'depth'          => 3,
					)
				);
			} elseif ( has_nav_menu( 'primary' ) ) {
				// Fallback to primary menu if mobile menu not set
				wp_nav_menu(
					array(
						'theme_location' => 'primary',
						'container'      => false,
						'fallback_cb'    => false,
						'depth'          => 3,
					)
				);
			}
			?>

			<div class="mobile-nav-footer">
				<?php
				$login_label = get_theme_mod( 'mobiris_header_login_label', 'Log In' );
				$login_url   = get_theme_mod( 'mobiris_header_login_url', 'https://app.mobiris.ng/login' );
				?>
				<a href="<?php echo esc_url( $login_url ); ?>" class="btn btn-secondary btn-block" target="_blank" rel="noopener noreferrer">
					<?php echo esc_html( $login_label ); ?>
				</a>

				<?php
				$cta_label = get_theme_mod( 'mobiris_header_cta_label', 'Get Started' );
				$cta_url   = get_theme_mod( 'mobiris_header_cta_url', 'https://app.mobiris.ng/signup' );
				?>
				<a href="<?php echo esc_url( $cta_url ); ?>" class="btn btn-primary btn-block" target="_blank" rel="noopener noreferrer">
					<?php echo esc_html( $cta_label ); ?>
				</a>

				<?php
				// Social links in mobile nav
				$social_links = array(
					'twitter'   => array(
						'url'  => get_theme_mod( 'mobiris_twitter_url', '' ),
						'icon' => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.6 0H15L9.1 8.7L16 20H11.1L7.3 13.1L2.9 20H0.5L6.9 10.8L0 0H5.1L8.5 6.3L12.6 0ZM13.6 18H14.6L5.5 1.1H4.4L13.6 18Z" fill="currentColor"/></svg>',
						'label' => 'Twitter',
					),
					'linkedin'  => array(
						'url'  => get_theme_mod( 'mobiris_linkedin_url', '' ),
						'icon' => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 0C1.1 0 0 1.1 0 2.5V17.5C0 18.9 1.1 20 2.5 20H17.5C18.9 20 20 18.9 20 17.5V2.5C20 1.1 18.9 0 17.5 0H2.5ZM2.5 2H17.5C17.8 2 18 2.2 18 2.5V17.5C18 17.8 17.8 18 17.5 18H2.5C2.2 18 2 17.8 2 17.5V2.5C2 2.2 2.2 2 2.5 2ZM4 4C2.9 4 2 4.9 2 6C2 7.1 2.9 8 4 8C5.1 8 6 7.1 6 6C6 4.9 5.1 4 4 4ZM2 9H6V16H2V9ZM8 9H12V10.2C12.3 9.5 13.2 8.8 14.5 8.8C17 8.8 17.5 10.4 17.5 12.5V16H14V12.8C14 11.4 13.7 10.6 12.7 10.6C11.4 10.6 11 11.6 11 12.8V16H8V9Z" fill="currentColor"/></svg>',
						'label' => 'LinkedIn',
					),
					'facebook'  => array(
						'url'  => get_theme_mod( 'mobiris_facebook_url', '' ),
						'icon' => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 10C20 4.5 15.5 0 10 0C4.5 0 0 4.5 0 10C0 14.9 3.6 19 8.4 19.8V12.9H5.9V10H8.4V7.8C8.4 5.3 9.9 3.9 12.2 3.9C13.3 3.9 14.5 4.1 14.5 4.1V6.5H13.2C11.9 6.5 11.5 7.3 11.5 8.1V10H14.3L13.9 12.9H11.5V19.9C16.5 19.3 20 15.1 20 10Z" fill="currentColor"/></svg>',
						'label' => 'Facebook',
					),
					'instagram' => array(
						'url'  => get_theme_mod( 'mobiris_instagram_url', '' ),
						'icon' => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 0C7.3 0 7 0 5.9 0.1C4.4 0.1 3.3 0.4 2.4 1.1C1.5 1.8 0.8 2.9 0.7 4.4C0.6 5.5 0.5 5.8 0.5 8.5C0.5 11.2 0.5 11.5 0.6 12.6C0.7 14.1 1 15.2 1.9 16.1C2.8 17 3.9 17.6 5.4 17.7C6.5 17.8 6.8 17.9 9.5 17.9C12.2 17.9 12.5 17.9 13.6 17.8C15.1 17.7 16.2 17.4 17.1 16.5C18 15.6 18.6 14.5 18.7 13C18.8 11.9 18.9 11.6 18.9 8.9C18.9 6.2 18.9 5.9 18.8 4.8C18.7 3.3 18.4 2.2 17.5 1.3C16.6 0.4 15.5 -0.2 14 -0.3C12.9 -0.4 12.6 -0.5 9.9 -0.5C7.2 -0.5 6.9 -0.5 5.8 -0.4L10 0ZM10 1.8C12.6 1.8 12.9 1.8 13.9 1.9C15 2 15.6 2.2 16 2.6C16.4 3 16.6 3.6 16.7 4.7C16.8 5.7 16.8 6 16.8 8.6C16.8 11.2 16.8 11.5 16.7 12.5C16.6 13.6 16.4 14.2 16 14.6C15.6 15 15 15.2 13.9 15.3C12.9 15.4 12.6 15.4 10 15.4C7.4 15.4 7.1 15.4 6.1 15.3C5 15.2 4.4 15 4 14.6C3.6 14.2 3.4 13.6 3.3 12.5C3.2 11.5 3.2 11.2 3.2 8.6C3.2 6 3.2 5.7 3.3 4.7C3.4 3.6 3.6 3 4 2.6C4.4 2.2 5 2 6.1 1.9C7.1 1.8 7.4 1.8 10 1.8ZM10 4.5C7.2 4.5 5 6.7 5 9.5C5 12.3 7.2 14.5 10 14.5C12.8 14.5 15 12.3 15 9.5C15 6.7 12.8 4.5 10 4.5ZM10 12.7C8.2 12.7 6.8 11.3 6.8 9.5C6.8 7.7 8.2 6.3 10 6.3C11.8 6.3 13.2 7.7 13.2 9.5C13.2 11.3 11.8 12.7 10 12.7ZM15.1 3.1C15.1 3.8 15.6 4.3 16.3 4.3C17 4.3 17.5 3.8 17.5 3.1C17.5 2.4 17 1.9 16.3 1.9C15.6 1.9 15.1 2.4 15.1 3.1Z" fill="currentColor"/></svg>',
						'label' => 'Instagram',
					),
					'youtube'   => array(
						'url'  => get_theme_mod( 'mobiris_youtube_url', '' ),
						'icon' => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.5 3.5C19.2 2.5 18.4 1.7 17.4 1.5C15.9 1.1 10 1.1 10 1.1C10 1.1 4.1 1.1 2.6 1.5C1.6 1.8 0.8 2.5 0.5 3.5C0.1 5 0.1 8.3 0.1 8.3C0.1 8.3 0.1 11.6 0.5 13.1C0.8 14.1 1.6 14.9 2.6 15.1C4.1 15.5 10 15.5 10 15.5C10 15.5 15.9 15.5 17.4 15.1C18.4 14.8 19.2 14.1 19.5 13.1C19.9 11.6 19.9 8.3 19.9 8.3C19.9 8.3 19.9 5 19.5 3.5ZM8 11.5V5L13.2 8.3L8 11.5Z" fill="currentColor"/></svg>',
						'label' => 'YouTube',
					),
				);

				if ( ! empty( array_filter( array_column( $social_links, 'url' ) ) ) ) {
					?>
					<div class="mobile-nav-social">
						<?php
						foreach ( $social_links as $key => $social ) {
							if ( ! empty( $social['url'] ) ) {
								?>
								<a href="<?php echo esc_url( $social['url'] ); ?>" target="_blank" rel="noopener noreferrer" aria-label="<?php echo esc_attr( $social['label'] ); ?>">
									<?php echo $social['icon']; ?>
								</a>
								<?php
							}
						}
						?>
					</div>
					<?php
				}
				?>
			</div>
		</div>
	</div>

	<div class="mobile-nav-overlay" aria-hidden="true"></div>

	<main id="main-content" class="site-main" role="main" tabindex="-1">
