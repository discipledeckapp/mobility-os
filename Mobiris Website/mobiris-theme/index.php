<?php
/**
 * Index Template
 *
 * Fallback template for WordPress.
 * All other templates take priority. This rarely runs.
 *
 * @package Mobiris
 * @since 1.0.0
 */

get_header();
?>

<main id="main" class="site-main">
	<div class="container section">
		<div class="content-wrapper">
			<h1><?php esc_html_e( 'Welcome to Mobiris', 'mobiris' ); ?></h1>
			<p><?php esc_html_e( 'Fleet operations software for transport companies across Africa.', 'mobiris' ); ?></p>
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="btn btn-primary">
				<?php esc_html_e( 'Go to homepage', 'mobiris' ); ?>
			</a>
		</div>
	</div>
</main>

<?php get_footer();
