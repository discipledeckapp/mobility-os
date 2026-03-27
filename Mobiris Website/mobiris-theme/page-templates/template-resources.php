<?php
/**
 * Template Name: Guides & Resources
 * Template Post Type: page
 * Description: Archive page for guide CPT with filtering and search
 *
 * @package Mobiris
 * @since 1.0.0
 */

get_header(); ?>

<main id="primary" class="site-main">

	<!-- Page Header -->
	<section class="mobiris-page-header" style="background: linear-gradient(135deg, <?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> 0%, <?php echo esc_attr( get_theme_mod( 'mobiris_navy', '#0F172A' ) ); ?> 100%);">
		<div class="container mx-auto px-6 py-20">
			<div class="max-w-3xl mx-auto text-white">
				<h1 class="text-5xl font-bold mb-4"><?php esc_html_e( 'Guides & Resources', 'mobiris' ); ?></h1>
				<p class="text-xl opacity-90 mb-8">
					<?php esc_html_e( 'Practical guides for fleet operators in Africa. From remittance tracking to driver verification — everything you need to run a tighter fleet.', 'mobiris' ); ?>
				</p>

				<!-- Search Bar -->
				<form method="get" class="flex gap-3">
					<input
						type="text"
						name="guide_search"
						placeholder="<?php esc_attr_e( 'Search guides...', 'mobiris' ); ?>"
						value="<?php echo esc_attr( isset( $_GET['guide_search'] ) ? sanitize_text_field( $_GET['guide_search'] ) : '' ); ?>"
						class="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
					>
					<button type="submit" class="bg-white text-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
						<?php esc_html_e( 'Search', 'mobiris' ); ?>
					</button>
				</form>
			</div>
		</div>
	</section>

	<!-- Content Section -->
	<section class="py-16 bg-white">
		<div class="container mx-auto px-6">

			<?php
			// Get current search query if any
			$search_query = isset( $_GET['guide_search'] ) ? sanitize_text_field( $_GET['guide_search'] ) : '';
			$current_category = isset( $_GET['guide_category'] ) ? sanitize_text_field( $_GET['guide_category'] ) : '';

			// Get categories for filter tabs
			$categories = get_terms( array(
				'taxonomy' => 'guide_category',
				'hide_empty' => true,
			) );

			// Filter bar
			if ( ! empty( $categories ) && ! is_wp_error( $categories ) ) :
				?>
				<div class="mb-12">
					<h2 class="text-sm font-semibold text-gray-600 mb-4 uppercase">
						<?php esc_html_e( 'Filter by Category', 'mobiris' ); ?>
					</h2>
					<div class="flex flex-wrap gap-3">
						<a href="<?php echo esc_url( remove_query_arg( 'guide_category' ) ); ?>" class="inline-block px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 <?php echo empty( $current_category ) ? 'bg-' . esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ) . ' text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'; ?>">
							<?php esc_html_e( 'All Guides', 'mobiris' ); ?>
						</a>
						<?php
						foreach ( $categories as $category ) :
							$active = $current_category === $category->slug;
							$cat_link = add_query_arg( 'guide_category', $category->slug );
							?>
							<a href="<?php echo esc_url( $cat_link ); ?>" class="inline-block px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 <?php echo $active ? 'bg-' . esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ) . ' text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'; ?>">
								<?php echo esc_html( $category->name ); ?>
							</a>
						<?php endforeach; ?>
					</div>
				</div>
			<?php endif; ?>

			<!-- Search Results Header -->
			<?php if ( $search_query ) : ?>
				<div class="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
					<p class="text-sm text-gray-700">
						<?php
						echo sprintf(
							esc_html__( 'Showing results for: %s', 'mobiris' ),
							'<strong>' . esc_html( $search_query ) . '</strong>'
						);
						?>
					</p>
				</div>
			<?php endif; ?>

			<!-- Guides Query -->
			<?php
			$args = array(
				'post_type' => 'guide',
				'posts_per_page' => 12,
				'paged' => get_query_var( 'paged', 1 ),
				'orderby' => 'date',
				'order' => 'DESC',
			);

			// Apply search filter if set
			if ( $search_query ) {
				$args['s'] = $search_query;
			}

			// Apply category filter if set
			if ( $current_category ) {
				$args['tax_query'] = array(
					array(
						'taxonomy' => 'guide_category',
						'field' => 'slug',
						'terms' => $current_category,
					),
				);
			}

			$guides_query = new WP_Query( $args );

			if ( $guides_query->have_posts() ) :
				?>

				<!-- Guides Grid -->
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
					<?php
					while ( $guides_query->have_posts() ) :
						$guides_query->the_post();
						$category = get_the_terms( get_the_ID(), 'guide_category' );
						$category_name = ! empty( $category ) ? $category[0]->name : __( 'Uncategorized', 'mobiris' );
						$category_slug = ! empty( $category ) ? $category[0]->slug : '';
						$reading_time = mobiris_reading_time( get_the_content() );
						?>

						<article class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">

							<!-- Featured Image -->
							<?php if ( has_post_thumbnail() ) : ?>
								<div class="aspect-video overflow-hidden bg-gray-100">
									<?php the_post_thumbnail( 'medium', array( 'class' => 'w-full h-full object-cover' ) ); ?>
								</div>
							<?php else : ?>
								<div class="aspect-video bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
									<svg class="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.596 6.253 2 10.849 2 16.5S6.596 26.747 12 26.747s10-4.596 10-10.247S17.404 6.253 12 6.253z"></path>
									</svg>
								</div>
							<?php endif; ?>

							<!-- Content -->
							<div class="p-6">

								<!-- Category Badge -->
								<?php if ( ! empty( $category_slug ) ) : ?>
									<a href="<?php echo esc_url( add_query_arg( 'guide_category', $category_slug ) ); ?>" class="inline-block mb-3 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> hover:bg-blue-200 transition-colors duration-200">
										<?php echo esc_html( $category_name ); ?>
									</a>
								<?php endif; ?>

								<!-- Title -->
								<h3 class="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
									<a href="<?php the_permalink(); ?>" class="hover:text-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> transition-colors duration-200">
										<?php the_title(); ?>
									</a>
								</h3>

								<!-- Excerpt -->
								<p class="text-gray-600 text-sm mb-4 line-clamp-3">
									<?php
									$excerpt = wp_trim_words( get_the_excerpt(), 20, '...' );
									echo esc_html( $excerpt );
									?>
								</p>

								<!-- Reading Time & CTA -->
								<div class="flex items-center justify-between pt-4 border-t border-gray-200">
									<?php if ( $reading_time ) : ?>
										<span class="text-xs text-gray-500">
											<?php
											echo sprintf(
												esc_html__( '%d min read', 'mobiris' ),
												intval( $reading_time )
											);
											?>
										</span>
									<?php endif; ?>
									<a href="<?php the_permalink(); ?>" class="text-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> hover:underline font-semibold text-sm">
										<?php esc_html_e( 'Read guide →', 'mobiris' ); ?>
									</a>
								</div>

							</div>

						</article>

					<?php endwhile; ?>
				</div>

				<!-- Pagination -->
				<?php
				$pagination = paginate_links( array(
					'total' => $guides_query->max_num_pages,
					'current' => get_query_var( 'paged', 1 ),
					'echo' => false,
					'type' => 'array',
					'prev_text' => esc_html__( 'Previous', 'mobiris' ),
					'next_text' => esc_html__( 'Next', 'mobiris' ),
				) );

				if ( $pagination ) :
					?>
					<div class="flex justify-center gap-2 mb-12">
						<?php
						foreach ( $pagination as $page_link ) {
							echo wp_kses_post( str_replace(
								array( '<a ', '</a>' ),
								array( '<a class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors duration-200" ', '</a>' ),
								$page_link
							) );
						}
						?>
					</div>
				<?php endif; ?>

			<?php else : ?>

				<!-- Empty State -->
				<div class="text-center py-16">
					<svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.596 6.253 2 10.849 2 16.5S6.596 26.747 12 26.747s10-4.596 10-10.247S17.404 6.253 12 6.253z"></path>
					</svg>
					<h3 class="text-xl font-bold text-gray-900 mb-2">
						<?php esc_html_e( 'No guides found', 'mobiris' ); ?>
					</h3>
					<p class="text-gray-600 mb-6">
						<?php
						if ( $search_query ) {
							echo sprintf(
								esc_html__( 'No results found for "%s". Try adjusting your search.', 'mobiris' ),
								esc_html( $search_query )
							);
						} elseif ( $current_category ) {
							esc_html_e( 'No guides in this category yet. Check back soon!', 'mobiris' );
						} else {
							esc_html_e( 'No guides available yet. Check back soon or explore the blog.', 'mobiris' );
						}
						?>
					</p>
					<?php
					if ( $search_query || $current_category ) {
						echo wp_kses_post( '<a href="' . esc_url( remove_query_arg( array( 'guide_search', 'guide_category' ) ) ) . '" class="inline-block text-' . esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ) . ' hover:underline font-semibold">' . esc_html__( 'Clear filters →', 'mobiris' ) . '</a>' );
					}
					?>
				</div>

			<?php endif; ?>

			<?php wp_reset_postdata(); ?>

		</div>
	</section>

	<!-- CTA Band -->
	<section class="py-16 bg-gradient-to-r from-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> to-<?php echo esc_attr( get_theme_mod( 'mobiris_navy', '#0F172A' ) ); ?>">
		<div class="container mx-auto px-6 text-center text-white">
			<h2 class="text-2xl font-bold mb-4">
				<?php esc_html_e( 'Got a question not covered here?', 'mobiris' ); ?>
			</h2>
			<p class="text-lg opacity-90 mb-8">
				<?php esc_html_e( 'Ask us on WhatsApp and get a quick response.', 'mobiris' ); ?>
			</p>

			<?php
			$whatsapp_url = mobiris_whatsapp_url( __( 'Hi, I have a question about Mobiris', 'mobiris' ) );
			if ( $whatsapp_url ) {
				echo wp_kses_post( '<a href="' . esc_url( $whatsapp_url ) . '" target="_blank" rel="noopener noreferrer" class="inline-block bg-white text-' . esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ) . ' font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">' . esc_html__( 'Message us on WhatsApp', 'mobiris' ) . '</a>' );
			}
			?>
		</div>
	</section>

</main>

<?php get_footer(); ?>
