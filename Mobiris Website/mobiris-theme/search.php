<?php
/**
 * Search Results Template
 *
 * Template for displaying search results for posts and guides.
 *
 * @package Mobiris
 * @since 1.0.0
 */

get_header();

$search_query = get_search_query();
$result_count = $GLOBALS['wp_query']->found_posts;
?>

<main id="main" class="site-main search-results-main">
	<header class="page-header search-header">
		<div class="container">
			<?php
			// Breadcrumbs
			mobiris_breadcrumbs();
			?>

			<div class="search-header-content">
				<h1 class="page-title">
					<?php
					printf(
						esc_html__( 'Search results for: %s', 'mobiris' ),
						'<span class="search-term">' . esc_html( $search_query ) . '</span>'
					);
					?>
				</h1>

				<?php
				if ( $result_count > 0 ) {
					printf(
						esc_html( _n( '%s result found', '%s results found', $result_count, 'mobiris' ) ),
						number_format_i18n( $result_count )
					);
				} else {
					esc_html_e( 'No results found', 'mobiris' );
				}
				?>
			</div>
		</div>
	</header>

	<div class="container">
		<?php
		// Search form
		?>
		<div class="search-form-wrapper">
			<?php get_search_form(); ?>
		</div>

		<?php
		if ( have_posts() ) {
			?>
			<div class="archive-grid search-results-grid">
				<?php
				while ( have_posts() ) {
					the_post();

					// Check post type and render appropriate template part
					$post_type = get_post_type();

					if ( 'guide' === $post_type ) {
						get_template_part( 'template-parts/content/guide' );
					} else {
						get_template_part( 'template-parts/content/post' );
					}
				}
				?>
			</div>

			<?php
			// Pagination
			the_posts_pagination(
				array(
					'mid_size'           => 2,
					'prev_text'          => esc_html__( '← Previous', 'mobiris' ),
					'next_text'          => esc_html__( 'Next →', 'mobiris' ),
					'screen_reader_text' => esc_html__( 'Search results pagination', 'mobiris' ),
				)
			);
		} else {
			?>
			<div class="no-search-results">
				<div class="empty-state">
					<h2><?php esc_html_e( 'No results found', 'mobiris' ); ?></h2>
					<p>
						<?php
						printf(
							esc_html__( 'We couldn\'t find anything for "%s". Try searching for:', 'mobiris' ),
							esc_html( $search_query )
						);
						?>
					</p>

					<div class="search-suggestions">
						<h3><?php esc_html_e( 'Popular searches:', 'mobiris' ); ?></h3>
						<ul>
							<li><a href="<?php echo esc_url( home_url( '/?s=remittance' ) ); ?>"><?php esc_html_e( 'Remittance', 'mobiris' ); ?></a></li>
							<li><a href="<?php echo esc_url( home_url( '/?s=driver+verification' ) ); ?>"><?php esc_html_e( 'Driver verification', 'mobiris' ); ?></a></li>
							<li><a href="<?php echo esc_url( home_url( '/?s=compliance' ) ); ?>"><?php esc_html_e( 'Compliance', 'mobiris' ); ?></a></li>
							<li><a href="<?php echo esc_url( home_url( '/?s=fleet+management' ) ); ?>"><?php esc_html_e( 'Fleet management', 'mobiris' ); ?></a></li>
						</ul>
					</div>

					<div class="quick-links">
						<h3><?php esc_html_e( 'Quick links:', 'mobiris' ); ?></h3>
						<ul>
							<li><a href="<?php echo esc_url( home_url( '/features/' ) ); ?>"><?php esc_html_e( 'Features', 'mobiris' ); ?></a></li>
							<li><a href="<?php echo esc_url( home_url( '/pricing/' ) ); ?>"><?php esc_html_e( 'Pricing', 'mobiris' ); ?></a></li>
							<li><a href="<?php echo esc_url( home_url( '/blog/' ) ); ?>"><?php esc_html_e( 'Blog', 'mobiris' ); ?></a></li>
							<li><a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>"><?php esc_html_e( 'Contact', 'mobiris' ); ?></a></li>
						</ul>
					</div>

					<div class="search-help">
						<p>
							<?php esc_html_e( 'Still can\'t find what you\'re looking for?', 'mobiris' ); ?>
						</p>
						<a href="https://wa.me/234901234567" target="_blank" rel="noopener" class="btn btn-primary">
							<?php esc_html_e( 'Chat on WhatsApp', 'mobiris' ); ?>
						</a>
					</div>
				</div>
			</div>
			<?php
		}
		?>
	</div>
</main>

<?php get_footer();
