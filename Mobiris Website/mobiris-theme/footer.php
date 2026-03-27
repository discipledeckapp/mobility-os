<?php
/**
 * The template for displaying the footer
 *
 * Contains the closing of the "main" and all content after.
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package Mobiris
 */

?>
	</main><!-- #main-content -->

	<footer class="site-footer" role="contentinfo">
		<div class="footer-top container">
			<!-- Footer Brand Column -->
			<div class="footer-brand">
				<?php
				$logo_url = get_theme_mod( 'mobiris_logo_light', '' );
				if ( ! empty( $logo_url ) ) {
					?>
					<div class="footer-brand-logo">
						<img src="<?php echo esc_url( $logo_url ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>">
					</div>
					<?php
				} else {
					?>
					<div class="footer-brand-logo-text">
						<?php echo esc_html( get_theme_mod( 'mobiris_company_name', 'Mobiris' ) ); ?>
					</div>
					<?php
				}
				?>

				<p class="footer-brand-tagline">
					<?php echo esc_html( get_theme_mod( 'mobiris_footer_tagline', "Built for Africa's transport operators." ) ); ?>
				</p>

				<?php
				// Social Icons
				$show_social = get_theme_mod( 'mobiris_footer_show_social', '1' );
				if ( ! empty( $show_social ) ) {
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
						<div class="footer-social-links">
							<?php
							foreach ( $social_links as $key => $social ) {
								if ( ! empty( $social['url'] ) ) {
									?>
									<a href="<?php echo esc_url( $social['url'] ); ?>" target="_blank" rel="noopener noreferrer" aria-label="<?php echo esc_attr( $social['label'] ); ?>" class="footer-social-link">
										<?php echo $social['icon']; ?>
									</a>
									<?php
								}
							}
							?>
						</div>
						<?php
					}
				}
				?>

				<?php
				// App Download Buttons
				$show_app_links = get_theme_mod( 'mobiris_footer_show_app_links', '1' );
				if ( ! empty( $show_app_links ) ) {
					$ios_url     = get_theme_mod( 'mobiris_ios_app_url', '' );
					$android_url = get_theme_mod( 'mobiris_android_app_url', '' );
					$web_url     = get_theme_mod( 'mobiris_web_app_url', 'https://app.mobiris.ng' );

					if ( ! empty( $ios_url ) || ! empty( $android_url ) || ! empty( $web_url ) ) {
						?>
						<div class="footer-app-links">
							<?php
							if ( ! empty( $ios_url ) ) {
								?>
								<a href="<?php echo esc_url( $ios_url ); ?>" target="_blank" rel="noopener noreferrer" class="app-link app-link--ios">
									<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
										<path d="M11.5 0H4.5C2.6 0 1 1.6 1 3.5V12.5C1 14.4 2.6 16 4.5 16H11.5C13.4 16 15 14.4 15 12.5V3.5C15 1.6 13.4 0 11.5 0ZM12.5 11C12.5 11.3 12.2 11.5 11.9 11.5H11.5C11.2 11.5 11 11.3 11 11V5C11 4.7 11.2 4.5 11.5 4.5H11.9C12.2 4.5 12.5 4.7 12.5 5V11Z" fill="currentColor"/>
									</svg>
									<div>
										<div class="app-link-small">Download on</div>
										<div class="app-link-bold">App Store</div>
									</div>
								</a>
								<?php
							} else {
								?>
								<div class="app-link app-link--disabled">
									<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
										<path d="M11.5 0H4.5C2.6 0 1 1.6 1 3.5V12.5C1 14.4 2.6 16 4.5 16H11.5C13.4 16 15 14.4 15 12.5V3.5C15 1.6 13.4 0 11.5 0ZM12.5 11C12.5 11.3 12.2 11.5 11.9 11.5H11.5C11.2 11.5 11 11.3 11 11V5C11 4.7 11.2 4.5 11.5 4.5H11.9C12.2 4.5 12.5 4.7 12.5 5V11Z" fill="currentColor"/>
									</svg>
									<div>
										<div class="app-link-small"><?php esc_html_e( 'Coming to', 'mobiris' ); ?></div>
										<div class="app-link-bold"><?php esc_html_e( 'App Store', 'mobiris' ); ?></div>
									</div>
								</div>
								<?php
							}
							?>

							<?php
							if ( ! empty( $android_url ) ) {
								?>
								<a href="<?php echo esc_url( $android_url ); ?>" target="_blank" rel="noopener noreferrer" class="app-link app-link--android">
									<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
										<path d="M11 6H5V14H11V6ZM10 13H6V7H10V13ZM8 0C8.6 0 9 0.4 9 1V2.5H7V1C7 0.4 7.4 0 8 0ZM3 3H1V9H3V3ZM13 3V9H15V3H13ZM9.5 4C9.8 4 10 4.2 10 4.5C10 4.8 9.8 5 9.5 5C9.2 5 9 4.8 9 4.5C9 4.2 9.2 4 9.5 4ZM6.5 4C6.8 4 7 4.2 7 4.5C7 4.8 6.8 5 6.5 5C6.2 5 6 4.8 6 4.5C6 4.2 6.2 4 6.5 4Z" fill="currentColor"/>
									</svg>
									<div>
										<div class="app-link-small"><?php esc_html_e( 'Get on', 'mobiris' ); ?></div>
										<div class="app-link-bold"><?php esc_html_e( 'Google Play', 'mobiris' ); ?></div>
									</div>
								</a>
								<?php
							} else {
								?>
								<div class="app-link app-link--disabled">
									<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
										<path d="M11 6H5V14H11V6ZM10 13H6V7H10V13ZM8 0C8.6 0 9 0.4 9 1V2.5H7V1C7 0.4 7.4 0 8 0ZM3 3H1V9H3V3ZM13 3V9H15V3H13ZM9.5 4C9.8 4 10 4.2 10 4.5C10 4.8 9.8 5 9.5 5C9.2 5 9 4.8 9 4.5C9 4.2 9.2 4 9.5 4ZM6.5 4C6.8 4 7 4.2 7 4.5C7 4.8 6.8 5 6.5 5C6.2 5 6 4.8 6 4.5C6 4.2 6.2 4 6.5 4Z" fill="currentColor"/>
									</svg>
									<div>
										<div class="app-link-small"><?php esc_html_e( 'Coming to', 'mobiris' ); ?></div>
										<div class="app-link-bold"><?php esc_html_e( 'Google Play', 'mobiris' ); ?></div>
									</div>
								</div>
								<?php
							}
							?>

							<?php
							if ( ! empty( $web_url ) ) {
								?>
								<a href="<?php echo esc_url( $web_url ); ?>" target="_blank" rel="noopener noreferrer" class="app-link app-link--web">
									<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
										<path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM13.5 7.5H11C10.8 5.8 10.2 4.3 9.3 3.1C11.3 4.1 13 5.9 13.5 7.5ZM8 1C9 2.3 9.7 3.8 10 5.5H6C6.3 3.8 7 2.3 8 1ZM1.5 8.5C1.2 7.9 1 7.4 1 8C1 7.4 1.2 7.9 1.5 8.5ZM8 15C7 13.7 6.3 12.2 6 10.5H10C9.7 12.2 9 13.7 8 15ZM6.7 9H9.3C9.3 10.7 8.8 12.1 8 13C7.2 12.1 6.7 10.7 6.7 9ZM6.7 7H9.3C9.3 8.3 8.8 9.7 8 10.5C7.2 9.7 6.7 8.3 6.7 7ZM14.5 8C14.5 7.4 14.3 7.9 14 8.5C14.3 7.9 14.5 7.4 14.5 8ZM8 3C6.8 4.4 6 6.1 6 8C6 9.9 6.8 11.6 8 13C9.2 11.6 10 9.9 10 8C10 6.1 9.2 4.4 8 3ZM2.5 7.5C3 5.9 4.7 4.1 6.7 3.1C5.8 4.3 5.2 5.8 5 7.5H2.5ZM9.3 3.1C8.2 4.3 7.8 5.8 7.5 7.5H13.5C13 5.9 11.3 4.1 9.3 3.1Z" fill="currentColor"/>
									</svg>
									<div class="app-link-web-text">
										<?php esc_html_e( 'Open Web App', 'mobiris' ); ?>
										<span aria-hidden="true">→</span>
									</div>
								</a>
								<?php
							}
							?>
						</div>
						<?php
					}
				}
				?>
			</div>

			<!-- Footer Navigation Columns -->
			<div class="footer-nav-cols">
				<?php
				// Product Column
				if ( has_nav_menu( 'footer-1' ) ) {
					?>
					<div class="footer-col">
						<?php
						wp_nav_menu(
							array(
								'theme_location' => 'footer-1',
								'container'      => false,
								'fallback_cb'    => false,
								'depth'          => 1,
							)
						);
						?>
					</div>
					<?php
				}
				?>

				<?php
				// Company Column
				if ( has_nav_menu( 'footer-2' ) ) {
					?>
					<div class="footer-col">
						<?php
						wp_nav_menu(
							array(
								'theme_location' => 'footer-2',
								'container'      => false,
								'fallback_cb'    => false,
								'depth'          => 1,
							)
						);
						?>
					</div>
					<?php
				}
				?>

				<?php
				// Legal Column
				if ( has_nav_menu( 'footer-3' ) ) {
					?>
					<div class="footer-col">
						<?php
						wp_nav_menu(
							array(
								'theme_location' => 'footer-3',
								'container'      => false,
								'fallback_cb'    => false,
								'depth'          => 1,
							)
						);
						?>
					</div>
					<?php
				}
				?>
			</div>

			<?php
			// Newsletter Signup
			$show_newsletter = get_theme_mod( 'mobiris_footer_show_newsletter', '' );
			if ( ! empty( $show_newsletter ) ) {
				$newsletter_label    = get_theme_mod( 'mobiris_footer_newsletter_label', 'Stay in the loop' );
				$newsletter_subtitle = get_theme_mod( 'mobiris_footer_newsletter_subtitle', "Fleet management insights for Africa's transport operators." );
				?>
				<div class="footer-newsletter">
					<p class="footer-newsletter-label">
						<?php echo esc_html( $newsletter_label ); ?>
					</p>
					<p class="footer-newsletter-subtitle">
						<?php echo esc_html( $newsletter_subtitle ); ?>
					</p>
					<form class="newsletter-form" method="post" data-action="mobiris_newsletter">
						<input
							type="email"
							name="email"
							placeholder="<?php esc_attr_e( 'your@email.com', 'mobiris' ); ?>"
							required
							aria-label="<?php esc_attr_e( 'Email address', 'mobiris' ); ?>"
						>
						<button type="submit" class="btn btn-primary btn-sm">
							<?php esc_html_e( 'Subscribe', 'mobiris' ); ?>
						</button>
						<?php wp_nonce_field( 'mobiris_ajax', 'mobiris_nonce' ); ?>
						<input type="hidden" name="action" value="mobiris_newsletter">
					</form>
				</div>
				<?php
			}
			?>
		</div>

		<!-- Footer Bottom -->
		<div class="footer-bottom container">
			<div class="footer-copyright">
				<?php
				$copyright_text = get_theme_mod( 'mobiris_footer_copyright', '© 2025 Mobiris. All rights reserved.' );
				$copyright_text = str_replace( '{year}', date_i18n( 'Y' ), $copyright_text );
				echo wp_kses_post( $copyright_text );
				?>
			</div>

			<div class="footer-bottom-links">
				<?php
				// Privacy Policy
				$privacy_page = get_page_by_title( 'Privacy Policy', OBJECT, 'page' );
				if ( $privacy_page ) {
					?>
					<a href="<?php echo esc_url( get_permalink( $privacy_page->ID ) ); ?>" class="footer-link">
						<?php esc_html_e( 'Privacy Policy', 'mobiris' ); ?>
					</a>
					<?php
				}
				?>

				<?php
				// Terms of Service
				$terms_page = get_page_by_title( 'Terms of Service', OBJECT, 'page' );
				if ( $terms_page ) {
					?>
					<a href="<?php echo esc_url( get_permalink( $terms_page->ID ) ); ?>" class="footer-link">
						<?php esc_html_e( 'Terms of Service', 'mobiris' ); ?>
					</a>
					<?php
				}
				?>
			</div>
		</div>
	</footer><!-- #site-footer -->

	<?php wp_footer(); ?>

</body>
</html>
