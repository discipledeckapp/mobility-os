<?php
/**
 * Features Grid Section Template Part
 *
 * Displays product features as cards. Queries mobiris_feature custom post type,
 * with fallback to hardcoded defaults if no posts exist.
 *
 * @package Mobiris
 * @since 1.0.0
 */

// Query for custom post type features
$feature_args = array(
	'post_type'      => 'mobiris_feature',
	'posts_per_page' => 6,
	'orderby'        => 'menu_order',
	'order'          => 'ASC',
);

$feature_query = new WP_Query( $feature_args );

// Fallback default features
$default_features = array(
	array(
		'title'       => esc_html__( 'Driver Verification', 'mobiris' ),
		'description' => esc_html__( 'Biometric identity checks, NIN/BVN/Ghana Card validation, and guarantor capture — all in one workflow.', 'mobiris' ),
		'badge'       => esc_html__( 'Core', 'mobiris' ),
		'icon'        => 'shield-check',
	),
	array(
		'title'       => esc_html__( 'Remittance Tracking', 'mobiris' ),
		'description' => esc_html__( 'Real-time daily cash flow tracking per vehicle, per driver, and across your entire fleet. Know exactly what came in and what didn\'t.', 'mobiris' ),
		'badge'       => esc_html__( 'Core', 'mobiris' ),
		'icon'        => 'chart-bars',
	),
	array(
		'title'       => esc_html__( 'Assignment & Dispatch', 'mobiris' ),
		'description' => esc_html__( 'Assign drivers to vehicles, routes, and shifts. Track operational readiness at a glance — who\'s ready, who\'s not, and why.', 'mobiris' ),
		'badge'       => esc_html__( 'Core', 'mobiris' ),
		'icon'        => 'map-pin',
	),
	array(
		'title'       => esc_html__( 'Compliance Management', 'mobiris' ),
		'description' => esc_html__( 'Automated licence expiry alerts, document versioning, and audit trails. Stay ahead of regulatory requirements.', 'mobiris' ),
		'badge'       => esc_html__( 'Operations', 'mobiris' ),
		'icon'        => 'document-check',
	),
	array(
		'title'       => esc_html__( 'Intelligence Plane', 'mobiris' ),
		'description' => esc_html__( 'Cross-operator fraud signals, anonymised risk indicators, and shared trust infrastructure. The layer no single operator can build alone.', 'mobiris' ),
		'badge'       => esc_html__( 'Enterprise', 'mobiris' ),
		'icon'        => 'network',
	),
	array(
		'title'       => esc_html__( 'Multi-Entity Support', 'mobiris' ),
		'description' => esc_html__( 'Manage multiple business entities, operating units, and fleets from a single platform with full per-tenant isolation.', 'mobiris' ),
		'badge'       => esc_html__( 'Enterprise', 'mobiris' ),
		'icon'        => 'building',
	),
);

// Use custom features if available, otherwise use defaults
$features = $feature_query->have_posts() ? $feature_query->posts : $default_features;
?>

<section class="features-section section" aria-label="<?php esc_attr_e( 'Product Features', 'mobiris' ); ?>">
	<div class="container">
		<div class="section-header">
			<h2 class="section-title"><?php esc_html_e( 'Powerful Features Built for Fleet Operations', 'mobiris' ); ?></h2>
			<p class="section-intro"><?php esc_html_e( 'From driver verification to cross-operator intelligence, everything operators need to run transparent, efficient fleets.', 'mobiris' ); ?></p>
		</div>

		<div class="features-grid">
			<?php
			if ( $feature_query->have_posts() ) {
				while ( $feature_query->have_posts() ) {
					$feature_query->the_post();
					$badge = get_post_meta( get_the_ID(), '_feature_badge', true );
					?>
					<div class="feature-card">
						<div class="feature-icon" aria-hidden="true">
							<?php
							// Check if feature has custom icon metadata
							$custom_icon = get_post_meta( get_the_ID(), '_feature_icon', true );
							if ( $custom_icon ) {
								echo wp_kses_post( $custom_icon );
							} else {
								// Show generic icon
								?>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<rect x="3" y="3" width="18" height="18" rx="2"></rect>
									<line x1="9" y1="9" x2="15" y2="9"></line>
									<line x1="9" y1="15" x2="15" y2="15"></line>
								</svg>
								<?php
							}
							?>
						</div>

						<?php if ( $badge ) : ?>
							<span class="feature-badge"><?php echo esc_html( $badge ); ?></span>
						<?php endif; ?>

						<h3 class="feature-title"><?php the_title(); ?></h3>
						<p class="feature-description"><?php the_excerpt(); ?></p>
					</div>
					<?php
				}
				wp_reset_postdata();
			} else {
				// Show default features
				foreach ( $default_features as $feature ) {
					?>
					<div class="feature-card">
						<div class="feature-icon" aria-hidden="true">
							<?php
							switch ( $feature['icon'] ) {
								case 'shield-check':
									?>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
										<polyline points="10 13 12 15 16 11"></polyline>
									</svg>
									<?php
									break;

								case 'chart-bars':
									?>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<line x1="12" y1="2" x2="12" y2="22"></line>
										<path d="M17 5H9.5a1.5 1.5 0 0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5H17"></path>
										<path d="M12 9v6"></path>
										<path d="M6 19H3"></path>
									</svg>
									<?php
									break;

								case 'map-pin':
									?>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
										<circle cx="12" cy="10" r="3"></circle>
									</svg>
									<?php
									break;

								case 'document-check':
									?>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
										<polyline points="14 2 14 8 20 8"></polyline>
										<polyline points="9 13 11 15 15 11"></polyline>
									</svg>
									<?php
									break;

								case 'network':
									?>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<circle cx="12" cy="5" r="3"></circle>
										<circle cx="6" cy="12" r="3"></circle>
										<circle cx="18" cy="12" r="3"></circle>
										<circle cx="12" cy="19" r="3"></circle>
										<line x1="12" y1="8" x2="6" y2="10.5"></line>
										<line x1="12" y1="8" x2="18" y2="10.5"></line>
										<line x1="6" y1="14" x2="12" y2="17"></line>
										<line x1="18" y1="14" x2="12" y2="17"></line>
									</svg>
									<?php
									break;

								case 'building':
									?>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<rect x="3" y="2" width="18" height="20" rx="2"></rect>
										<line x1="9" y1="2" x2="9" y2="22"></line>
										<line x1="15" y1="2" x2="15" y2="22"></line>
										<line x1="3" y1="6" x2="21" y2="6"></line>
										<line x1="3" y1="10" x2="21" y2="10"></line>
										<line x1="3" y1="14" x2="21" y2="14"></line>
										<line x1="3" y1="18" x2="21" y2="18"></line>
									</svg>
									<?php
									break;

								default:
									?>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<circle cx="12" cy="12" r="10"></circle>
									</svg>
									<?php
									break;
							}
							?>
						</div>

						<?php if ( isset( $feature['badge'] ) && $feature['badge'] ) : ?>
							<span class="feature-badge"><?php echo esc_html( $feature['badge'] ); ?></span>
						<?php endif; ?>

						<h3 class="feature-title"><?php echo esc_html( $feature['title'] ); ?></h3>
						<p class="feature-description"><?php echo esc_html( $feature['description'] ); ?></p>
					</div>
					<?php
				}
			}
			?>
		</div>
	</div>
</section>
