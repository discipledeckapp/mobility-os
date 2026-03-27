<?php
/**
 * 404 Not Found Template
 *
 * Displayed when a page or post is not found.
 *
 * @package Mobiris
 * @since 1.0.0
 */

get_header();
?>

<main id="main" class="site-main not-found-main">
	<div class="container section">
		<div class="not-found-content">
			<div class="not-found-number" aria-hidden="true">
				<span>4</span><span>0</span><span>4</span>
			</div>

			<h1 class="not-found-title"><?php esc_html_e( 'Page not found', 'mobiris' ); ?></h1>

			<p class="not-found-description">
				<?php esc_html_e( 'The page you\'re looking for may have moved or no longer exists.', 'mobiris' ); ?>
			</p>

			<div class="not-found-search">
				<?php get_search_form(); ?>
			</div>

			<div class="quick-links-grid">
				<h2><?php esc_html_e( 'Quick links:', 'mobiris' ); ?></h2>
				<div class="quick-links">
					<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="quick-link">
						<span class="quick-link-icon" aria-hidden="true">🏠</span>
						<span class="quick-link-text"><?php esc_html_e( 'Home', 'mobiris' ); ?></span>
					</a>

					<a href="<?php echo esc_url( home_url( '/features/' ) ); ?>" class="quick-link">
						<span class="quick-link-icon" aria-hidden="true">✨</span>
						<span class="quick-link-text"><?php esc_html_e( 'Features', 'mobiris' ); ?></span>
					</a>

					<a href="<?php echo esc_url( home_url( '/pricing/' ) ); ?>" class="quick-link">
						<span class="quick-link-icon" aria-hidden="true">💰</span>
						<span class="quick-link-text"><?php esc_html_e( 'Pricing', 'mobiris' ); ?></span>
					</a>

					<a href="<?php echo esc_url( home_url( '/blog/' ) ); ?>" class="quick-link">
						<span class="quick-link-icon" aria-hidden="true">📝</span>
						<span class="quick-link-text"><?php esc_html_e( 'Blog', 'mobiris' ); ?></span>
					</a>

					<a href="<?php echo esc_url( home_url( '/guides/' ) ); ?>" class="quick-link">
						<span class="quick-link-icon" aria-hidden="true">📚</span>
						<span class="quick-link-text"><?php esc_html_e( 'Guides', 'mobiris' ); ?></span>
					</a>

					<a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>" class="quick-link">
						<span class="quick-link-icon" aria-hidden="true">💬</span>
						<span class="quick-link-text"><?php esc_html_e( 'Contact', 'mobiris' ); ?></span>
					</a>
				</div>
			</div>

			<div class="not-found-help">
				<h2><?php esc_html_e( 'Need help?', 'mobiris' ); ?></h2>
				<p>
					<?php esc_html_e( 'Our support team is here to help. Get in touch with us via WhatsApp.', 'mobiris' ); ?>
				</p>
				<a href="https://wa.me/234901234567" target="_blank" rel="noopener" class="btn btn-primary">
					<?php esc_html_e( 'Chat on WhatsApp', 'mobiris' ); ?>
				</a>
			</div>
		</div>
	</div>
</main>

<?php get_footer();
