<?php
/**
 * Template Name: FAQ
 * Template Post Type: page
 * Description: FAQ page with accordion layout and structured data
 *
 * @package Mobiris
 * @since 1.0.0
 */

get_header(); ?>

<main id="primary" class="site-main">

	<!-- Page Header -->
	<section class="mobiris-page-header" style="background: linear-gradient(135deg, <?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> 0%, <?php echo esc_attr( get_theme_mod( 'mobiris_navy', '#0F172A' ) ); ?> 100%);">
		<div class="container mx-auto px-6 py-20 text-center text-white">
			<h1 class="text-5xl font-bold mb-4"><?php esc_html_e( 'Frequently Asked Questions', 'mobiris' ); ?></h1>
			<p class="text-xl opacity-90 max-w-2xl mx-auto">
				<?php esc_html_e( 'Everything you need to know about Mobiris. Can\'t find your answer? Message us on WhatsApp.', 'mobiris' ); ?>
			</p>
		</div>
	</section>

	<!-- FAQ Content -->
	<section class="py-20 bg-white">
		<div class="container mx-auto px-6 max-w-4xl">

			<?php
			// Get FAQ categories
			$categories = get_terms( array(
				'taxonomy' => 'faq_category',
				'hide_empty' => true,
			) );

			// Default categories if no taxonomy terms exist
			$default_categories = array(
				'general' => __( 'General', 'mobiris' ),
				'pricing' => __( 'Pricing', 'mobiris' ),
				'product' => __( 'Product', 'mobiris' ),
				'technical' => __( 'Technical', 'mobiris' ),
				'privacy' => __( 'Privacy & Data', 'mobiris' ),
			);

			// Use real categories if they exist, otherwise use defaults
			$use_categories = ( ! empty( $categories ) && ! is_wp_error( $categories ) ) ? $categories : array();

			// Category Navigation (if categories exist)
			if ( ! empty( $use_categories ) ) :
				?>
				<div class="mb-12">
					<h2 class="text-sm font-semibold text-gray-600 mb-4 uppercase">
						<?php esc_html_e( 'Jump to Category', 'mobiris' ); ?>
					</h2>
					<div class="flex flex-wrap gap-2">
						<?php
						foreach ( $use_categories as $category ) {
							$anchor = is_object( $category ) ? sanitize_title( $category->name ) : $category;
							?>
							<a href="#<?php echo esc_attr( $anchor ); ?>" class="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> hover:text-white transition-colors duration-200">
								<?php echo esc_html( is_object( $category ) ? $category->name : $category ); ?>
							</a>
						<?php } ?>
					</div>
				</div>
			<?php endif; ?>

			<!-- FAQ Accordion -->
			<?php
			// Determine which categories to display
			$display_categories = ! empty( $use_categories ) ? $use_categories : $default_categories;

			// Store all FAQs for schema output
			$all_faqs_for_schema = array();

			foreach ( $display_categories as $category_key => $category_label ) {
				// Get category name and slug based on whether it's a term object or string
				if ( is_object( $category_key ) ) {
					$cat_name = $category_key->name;
					$cat_slug = sanitize_title( $cat_name );
					$cat_term = $category_key;
				} else {
					$cat_name = is_object( $category_label ) ? $category_label->name : $category_label;
					$cat_slug = is_object( $category_label ) ? sanitize_title( $category_label->name ) : sanitize_title( $category_key );
					$cat_term = $category_label;
				}

				// Query FAQs for this category
				$faq_args = array(
					'post_type' => 'faq',
					'posts_per_page' => -1,
					'orderby' => 'menu_order',
					'order' => 'ASC',
				);

				// Only add tax_query if we have actual taxonomy terms (not default categories)
				if ( ! empty( $use_categories ) && is_object( $cat_term ) ) {
					$faq_args['tax_query'] = array(
						array(
							'taxonomy' => 'faq_category',
							'field' => 'term_id',
							'terms' => $cat_term->term_id,
						),
					);
				}

				$faq_query = new WP_Query( $faq_args );
				$faqs = $faq_query->get_posts();

				// Use default FAQs for this category if no posts found
				if ( empty( $faqs ) ) {
					$faqs = mobiris_get_default_faqs_for_category( is_object( $category_key ) ? $category_key : $category_key );
				}

				if ( ! empty( $faqs ) ) :
					?>

					<!-- Category Section -->
					<div id="<?php echo esc_attr( $cat_slug ); ?>" class="mb-12 scroll-mt-20">
						<h2 class="text-2xl font-bold text-gray-900 mb-6">
							<?php echo esc_html( $cat_name ); ?>
						</h2>

						<div class="space-y-4">
							<?php
							foreach ( $faqs as $faq ) {
								// Handle both WP_Post objects and array data (for defaults)
								if ( is_a( $faq, 'WP_Post' ) ) {
									$question = $faq->post_title;
									$answer = $faq->post_content;
									$faq_id = 'faq-' . $faq->ID;
								} else {
									$question = $faq['question'] ?? '';
									$answer = $faq['answer'] ?? '';
									$faq_id = 'faq-' . sanitize_title( $question );
								}

								// Collect for schema
								$all_faqs_for_schema[] = array(
									'question' => $question,
									'answer' => wp_strip_all_tags( $answer ),
								);
								?>

								<!-- FAQ Item (Accordion) -->
								<div class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow duration-200">
									<button type="button" class="faq-toggle w-full text-left px-6 py-4 font-semibold text-gray-900 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between" data-target="#<?php echo esc_attr( $faq_id ); ?>">
										<span><?php echo esc_html( $question ); ?></span>
										<svg class="faq-icon w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
										</svg>
									</button>

									<div id="<?php echo esc_attr( $faq_id ); ?>" class="faq-answer hidden">
										<div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
											<div class="text-gray-700 leading-relaxed prose prose-sm max-w-none">
												<?php
												if ( is_a( $faq, 'WP_Post' ) ) {
													echo wp_kses_post( wpautop( $faq->post_content ) );
												} else {
													echo wp_kses_post( wpautop( $answer ) );
												}
												?>
											</div>
										</div>
									</div>
								</div>

							<?php } ?>
						</div>
					</div>

					<?php
					wp_reset_postdata();
				endif;
			}
			?>

		</div>
	</section>

	<!-- Still Have Questions -->
	<section class="py-16 bg-gray-50 border-t border-gray-200">
		<div class="container mx-auto px-6 max-w-3xl text-center">
			<h2 class="text-3xl font-bold text-gray-900 mb-6">
				<?php esc_html_e( 'Still have questions?', 'mobiris' ); ?>
			</h2>

			<p class="text-lg text-gray-600 mb-8">
				<?php esc_html_e( 'We\'re here to help. Reach out to us via any of these channels.', 'mobiris' ); ?>
			</p>

			<div class="grid grid-cols-1 sm:grid-cols-3 gap-6">

				<!-- WhatsApp -->
				<div class="bg-white p-6 rounded-lg border border-gray-200">
					<div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
						<svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
							<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.781 1.149.139.139 0 00-.057.196l.861 1.401a.139.139 0 00.163.063 8.602 8.602 0 015.32-.97.14.14 0 00.117-.166l-.364-1.429a.139.139 0 00-.151-.115zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22.194c-5.537 0-10.194-4.657-10.194-10.194S6.463 1.806 12 1.806s10.194 4.657 10.194 10.194-4.657 10.194-10.194 10.194z"/>
						</svg>
					</div>
					<h3 class="font-semibold text-gray-900 mb-2">WhatsApp</h3>
					<p class="text-sm text-gray-600 mb-4">
						<?php esc_html_e( 'Quick chat during business hours', 'mobiris' ); ?>
					</p>
					<?php
					$whatsapp_url = mobiris_whatsapp_url( __( 'Hi, I have a question about Mobiris', 'mobiris' ) );
					if ( $whatsapp_url ) {
						echo wp_kses_post( '<a href="' . esc_url( $whatsapp_url ) . '" target="_blank" rel="noopener noreferrer" class="inline-block text-green-600 hover:underline font-semibold text-sm">' . esc_html__( 'Message us →', 'mobiris' ) . '</a>' );
					}
					?>
				</div>

				<!-- Email -->
				<div class="bg-white p-6 rounded-lg border border-gray-200">
					<div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
						<svg class="w-6 h-6 text-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?>" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
						</svg>
					</div>
					<h3 class="font-semibold text-gray-900 mb-2"><?php esc_html_e( 'Email', 'mobiris' ); ?></h3>
					<p class="text-sm text-gray-600 mb-4">
						<?php esc_html_e( 'Detailed enquiries', 'mobiris' ); ?>
					</p>
					<a href="mailto:support@mobiris.ng" class="inline-block text-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> hover:underline font-semibold text-sm">
						support@mobiris.ng
					</a>
				</div>

				<!-- Contact Page -->
				<div class="bg-white p-6 rounded-lg border border-gray-200">
					<div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
						<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2h-3l-4 4z"></path>
						</svg>
					</div>
					<h3 class="font-semibold text-gray-900 mb-2"><?php esc_html_e( 'Contact Form', 'mobiris' ); ?></h3>
					<p class="text-sm text-gray-600 mb-4">
						<?php esc_html_e( 'Full contact form', 'mobiris' ); ?>
					</p>
					<?php
					$contact_page = get_page_by_path( 'contact' );
					if ( $contact_page ) {
						echo wp_kses_post( '<a href="' . esc_url( get_permalink( $contact_page ) ) . '" class="inline-block text-purple-600 hover:underline font-semibold text-sm">' . esc_html__( 'Go to contact →', 'mobiris' ) . '</a>' );
					}
					?>
				</div>

			</div>
		</div>
	</section>

	<!-- FAQ Schema JSON-LD -->
	<?php
	if ( ! empty( $all_faqs_for_schema ) ) {
		mobiris_output_faq_schema( $all_faqs_for_schema );
	}
	?>

</main>

<!-- Accordion Script -->
<script>
(function() {
	const toggles = document.querySelectorAll('.faq-toggle');

	toggles.forEach(toggle => {
		toggle.addEventListener('click', function() {
			const target = document.querySelector(this.dataset.target);
			const icon = this.querySelector('.faq-icon');
			const isHidden = target.classList.contains('hidden');

			// Close all other answers
			document.querySelectorAll('.faq-answer').forEach(answer => {
				answer.classList.add('hidden');
			});
			document.querySelectorAll('.faq-icon').forEach(ic => {
				ic.style.transform = 'rotate(0deg)';
			});

			// Toggle current answer
			if (isHidden) {
				target.classList.remove('hidden');
				icon.style.transform = 'rotate(180deg)';
			}
		});
	});
})();
</script>

<style>
.prose {
	--tw-prose-body: #374151;
	--tw-prose-headings: #111827;
	--tw-prose-lead: #4B5563;
	--tw-prose-links: #2563EB;
	--tw-prose-bold: #111827;
	--tw-prose-counters: #6B7280;
	--tw-prose-bullets: #D1D5DB;
	--tw-prose-hr: #E5E7EB;
	--tw-prose-quotes: #111827;
	--tw-prose-quote-borders: #E5E7EB;
	--tw-prose-captions: #6B7280;
	--tw-prose-code: #111827;
	--tw-prose-pre-code: #E5E7EB;
	--tw-prose-pre-bg: #1F2937;
	--tw-prose-th-borders: #D1D5DB;
	--tw-prose-td-borders: #E5E7EB;
}

.prose a {
	color: var(--tw-prose-links);
	text-decoration: underline;
	font-weight: 500;
}

.prose strong {
	color: var(--tw-prose-bold);
	font-weight: 600;
}

.prose li {
	margin-top: 0.5em;
	margin-bottom: 0.5em;
}

.faq-icon {
	will-change: transform;
}
</style>

<?php get_footer(); ?>
