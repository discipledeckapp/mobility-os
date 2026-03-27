<?php
/**
 * Testimonials Section Template Part
 *
 * Displays operator testimonials from the testimonial custom post type.
 * Falls back to placeholder content if no testimonials exist.
 *
 * @package Mobiris
 * @since 1.0.0
 */

$show_testimonials = get_theme_mod( 'mobiris_show_testimonials_home', '1' );

if ( ! $show_testimonials ) {
	return;
}

// Query testimonials
$testimonial_args = array(
	'post_type'      => 'testimonial',
	'posts_per_page' => 3,
	'orderby'        => 'menu_order date',
	'order'          => 'ASC DESC',
);

$testimonial_query = new WP_Query( $testimonial_args );
$has_testimonials = $testimonial_query->have_posts();
?>

<section class="testimonials-section section" aria-label="<?php esc_attr_e( 'Customer Testimonials', 'mobiris' ); ?>">
	<div class="container">
		<div class="section-header">
			<h2 class="section-title"><?php esc_html_e( 'What operators say', 'mobiris' ); ?></h2>
		</div>

		<?php if ( $has_testimonials ) : ?>
			<div class="testimonials-grid">
				<?php
				while ( $testimonial_query->have_posts() ) {
					$testimonial_query->the_post();
					$name = get_the_title();
					$role = get_post_meta( get_the_ID(), '_testimonial_role', true );
					$company = get_post_meta( get_the_ID(), '_testimonial_company', true );
					$image_id = get_post_thumbnail_id();
					?>
					<div class="testimonial-card">
						<div class="testimonial-quote">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" class="quote-mark">
								<path d="M3 21c3 0 7-1 7-8V5c0-1.25-4.45-5-7-5m0 0c-4.12 0-7 4-7 9v9c0 1 0 3 7 3s7.04-2 7-4c0-.4-.56-.6-.9-.7-.26-.1-1.07-.3-1.2-.58-.1-.22 0-.4.123-.58 1.77-1.63 4.065-3.8 5.744-6.842.19-.365.42-.87.6-1.248A1 1 0 0 0 15 10s-1.5-2-3-2c-1.863 0-3 .922-3 2.05V19c0 1-3 4-7 4z"></path>
							</svg>
							<p><?php the_excerpt(); ?></p>
						</div>

						<div class="testimonial-attr">
							<div class="testimonial-avatar">
								<?php
								if ( $image_id ) {
									echo wp_kses_post( wp_get_attachment_image( $image_id, 'thumbnail', false, array( 'class' => 'testimonial-image' ) ) );
								} else {
									// Show initials avatar
									$initials = '';
									$name_parts = explode( ' ', $name );
									if ( ! empty( $name_parts[0] ) ) {
										$initials = strtoupper( substr( $name_parts[0], 0, 1 ) );
									}
									if ( ! empty( $name_parts[1] ) ) {
										$initials .= strtoupper( substr( $name_parts[1], 0, 1 ) );
									}
									?>
									<div class="testimonial-initials">
										<?php echo esc_html( $initials ); ?>
									</div>
									<?php
								}
								?>
							</div>

							<div class="testimonial-info">
								<strong class="testimonial-name"><?php echo esc_html( $name ); ?></strong>
								<?php if ( $role || $company ) : ?>
									<span class="testimonial-role">
										<?php
										if ( $role ) {
											echo esc_html( $role );
										}
										if ( $role && $company ) {
											echo ' ' . esc_html__( 'at', 'mobiris' ) . ' ';
										}
										if ( $company ) {
											echo esc_html( $company );
										}
										?>
									</span>
								<?php endif; ?>
							</div>
						</div>
					</div>
					<?php
				}
				wp_reset_postdata();
				?>
			</div>
		<?php else : ?>
			<div class="testimonials-placeholder">
				<div class="placeholder-card">
					<div class="placeholder-quote">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" class="quote-mark" opacity="0.3">
							<path d="M3 21c3 0 7-1 7-8V5c0-1.25-4.45-5-7-5m0 0c-4.12 0-7 4-7 9v9c0 1 0 3 7 3s7.04-2 7-4c0-.4-.56-.6-.9-.7-.26-.1-1.07-.3-1.2-.58-.1-.22 0-.4.123-.58 1.77-1.63 4.065-3.8 5.744-6.842.19-.365.42-.87.6-1.248A1 1 0 0 0 15 10s-1.5-2-3-2c-1.863 0-3 .922-3 2.05V19c0 1-3 4-7 4z"></path>
						</svg>
						<p style="color: #94A3B8; opacity: 0.6;">
							<?php esc_html_e( 'Testimonial pending — add via WordPress admin', 'mobiris' ); ?>
						</p>
					</div>
				</div>

				<div class="placeholder-card">
					<div class="placeholder-quote">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" class="quote-mark" opacity="0.3">
							<path d="M3 21c3 0 7-1 7-8V5c0-1.25-4.45-5-7-5m0 0c-4.12 0-7 4-7 9v9c0 1 0 3 7 3s7.04-2 7-4c0-.4-.56-.6-.9-.7-.26-.1-1.07-.3-1.2-.58-.1-.22 0-.4.123-.58 1.77-1.63 4.065-3.8 5.744-6.842.19-.365.42-.87.6-1.248A1 1 0 0 0 15 10s-1.5-2-3-2c-1.863 0-3 .922-3 2.05V19c0 1-3 4-7 4z"></path>
						</svg>
						<p style="color: #94A3B8; opacity: 0.6;">
							<?php esc_html_e( 'Testimonial pending — add via WordPress admin', 'mobiris' ); ?>
						</p>
					</div>
				</div>

				<div class="placeholder-card">
					<div class="placeholder-quote">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" class="quote-mark" opacity="0.3">
							<path d="M3 21c3 0 7-1 7-8V5c0-1.25-4.45-5-7-5m0 0c-4.12 0-7 4-7 9v9c0 1 0 3 7 3s7.04-2 7-4c0-.4-.56-.6-.9-.7-.26-.1-1.07-.3-1.2-.58-.1-.22 0-.4.123-.58 1.77-1.63 4.065-3.8 5.744-6.842.19-.365.42-.87.6-1.248A1 1 0 0 0 15 10s-1.5-2-3-2c-1.863 0-3 .922-3 2.05V19c0 1-3 4-7 4z"></path>
						</svg>
						<p style="color: #94A3B8; opacity: 0.6;">
							<?php esc_html_e( 'Testimonial pending — add via WordPress admin', 'mobiris' ); ?>
						</p>
					</div>
				</div>
			</div>
		<?php endif; ?>
	</div>
</section>
