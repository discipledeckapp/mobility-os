<?php
/**
 * Pricing Section Template Part
 *
 * Displays subscription tiers and add-on pricing.
 * Uses hardcoded defaults with apply_filters() override hook for customization.
 *
 * @package Mobiris
 * @since 1.0.0
 */

// Default pricing plans
$plans = array(
	array(
		'name'       => esc_html__( 'Starter', 'mobiris' ),
		'tagline'    => esc_html__( 'For operators getting started with fleet digitisation', 'mobiris' ),
		'price'      => '₦15,000',
		'period'     => esc_html__( '/month', 'mobiris' ),
		'vehicles'   => esc_html__( 'Up to 10 vehicles', 'mobiris' ),
		'cta_label'  => esc_html__( 'Start Free Trial', 'mobiris' ),
		'cta_url'    => get_theme_mod( 'mobiris_signup_url', 'https://app.mobiris.ng/signup' ),
		'featured'   => false,
		'features'   => array(
			esc_html__( 'Vehicle and driver records', 'mobiris' ),
			esc_html__( 'Daily remittance tracking', 'mobiris' ),
			esc_html__( 'Assignment management', 'mobiris' ),
			esc_html__( 'Operational readiness dashboard', 'mobiris' ),
			esc_html__( 'WhatsApp-first driver communication', 'mobiris' ),
			esc_html__( 'Email support', 'mobiris' ),
		),
		'limitations' => array(
			esc_html__( 'No biometric verification', 'mobiris' ),
			esc_html__( 'No intelligence plane access', 'mobiris' ),
		),
	),
	array(
		'name'       => esc_html__( 'Growth', 'mobiris' ),
		'tagline'    => esc_html__( 'For operators who need verified drivers and full tracking', 'mobiris' ),
		'price'      => '₦35,000',
		'period'     => esc_html__( '/month + ₦1,500/vehicle above 20', 'mobiris' ),
		'vehicles'   => esc_html__( '20+ vehicles', 'mobiris' ),
		'cta_label'  => esc_html__( 'Get Started', 'mobiris' ),
		'cta_url'    => get_theme_mod( 'mobiris_signup_url', 'https://app.mobiris.ng/signup' ),
		'featured'   => true,
		'badge'      => esc_html__( 'Most Popular', 'mobiris' ),
		'features'   => array(
			esc_html__( 'Everything in Starter', 'mobiris' ),
			esc_html__( 'Biometric driver verification', 'mobiris' ),
			esc_html__( 'NIN, BVN & Ghana Card validation', 'mobiris' ),
			esc_html__( 'Guarantor capture & verification', 'mobiris' ),
			esc_html__( 'Mobile app (iOS + Android)', 'mobiris' ),
			esc_html__( 'Cross-operator risk signals (limited)', 'mobiris' ),
			esc_html__( 'Priority support', 'mobiris' ),
		),
	),
	array(
		'name'       => esc_html__( 'Enterprise', 'mobiris' ),
		'tagline'    => esc_html__( 'For transport groups running multiple entities', 'mobiris' ),
		'price'      => esc_html__( 'Custom', 'mobiris' ),
		'period'     => esc_html__( 'annual contract', 'mobiris' ),
		'vehicles'   => esc_html__( '200+ vehicles', 'mobiris' ),
		'cta_label'  => esc_html__( 'Talk to Sales', 'mobiris' ),
		'cta_url'    => get_page_link( get_page_by_path( 'contact' ) ) ? get_page_link( get_page_by_path( 'contact' ) ) : get_theme_mod( 'mobiris_demo_url', '#contact' ),
		'featured'   => false,
		'features'   => array(
			esc_html__( 'Everything in Growth', 'mobiris' ),
			esc_html__( 'Multi-entity & multi-fleet management', 'mobiris' ),
			esc_html__( 'Full intelligence plane access', 'mobiris' ),
			esc_html__( 'Custom remittance workflows', 'mobiris' ),
			esc_html__( 'Dedicated account manager', 'mobiris' ),
			esc_html__( 'SLA guarantee', 'mobiris' ),
			esc_html__( 'Custom data processing agreement', 'mobiris' ),
			esc_html__( 'NDPA/DPA compliance documentation', 'mobiris' ),
		),
	),
);

/**
 * Allow developers to override pricing plans
 *
 * @param array $plans Array of pricing plan objects
 * @return array Filtered plans
 */
$plans = apply_filters( 'mobiris_pricing_data', $plans );

// Add-on pricing
$addons = array(
	array(
		'label' => esc_html__( 'Driver verification (biometric + government ID)', 'mobiris' ),
		'price' => '₦1,000',
	),
	array(
		'label' => esc_html__( 'Guarantor verification', 'mobiris' ),
		'price' => '₦1,000',
	),
	array(
		'label' => esc_html__( 'Cross-operator risk lookup', 'mobiris' ),
		'price' => '₦400',
	),
);

/**
 * Allow developers to override add-on pricing
 *
 * @param array $addons Array of add-on objects
 * @return array Filtered add-ons
 */
$addons = apply_filters( 'mobiris_pricing_addons', $addons );
?>

<section class="pricing-section section" aria-label="<?php esc_attr_e( 'Pricing Plans', 'mobiris' ); ?>">
	<div class="container">
		<div class="section-header">
			<h2 class="section-title"><?php esc_html_e( 'Plans designed for every fleet size', 'mobiris' ); ?></h2>
			<p class="section-intro"><?php esc_html_e( 'Start with Starter, scale to Growth, and access the full network with Enterprise. All plans include a 14-day free trial.', 'mobiris' ); ?></p>
		</div>

		<!-- Pricing Plans -->
		<div class="pricing-grid">
			<?php foreach ( $plans as $plan ) : ?>
				<div class="pricing-card <?php echo $plan['featured'] ? 'pricing-card-featured' : ''; ?>">
					<?php if ( isset( $plan['badge'] ) && $plan['badge'] ) : ?>
						<div class="pricing-badge"><?php echo esc_html( $plan['badge'] ); ?></div>
					<?php endif; ?>

					<h3 class="pricing-name"><?php echo esc_html( $plan['name'] ); ?></h3>
					<p class="pricing-tagline"><?php echo esc_html( $plan['tagline'] ); ?></p>

					<div class="pricing-price">
						<span class="pricing-amount"><?php echo esc_html( $plan['price'] ); ?></span>
						<?php if ( $plan['period'] ) : ?>
							<span class="pricing-period"><?php echo esc_html( $plan['period'] ); ?></span>
						<?php endif; ?>
					</div>

					<?php if ( $plan['vehicles'] ) : ?>
						<p class="pricing-vehicles"><?php echo esc_html( $plan['vehicles'] ); ?></p>
					<?php endif; ?>

					<?php if ( $plan['cta_url'] ) : ?>
						<a href="<?php echo esc_url( $plan['cta_url'] ); ?>" class="btn <?php echo $plan['featured'] ? 'btn-primary' : 'btn-secondary'; ?> btn-block">
							<?php echo esc_html( $plan['cta_label'] ); ?>
						</a>
					<?php endif; ?>

					<!-- Features List -->
					<?php if ( ! empty( $plan['features'] ) ) : ?>
						<div class="pricing-features">
							<h4 class="pricing-features-title"><?php esc_html_e( 'Includes:', 'mobiris' ); ?></h4>
							<ul>
								<?php foreach ( $plan['features'] as $feature ) : ?>
									<li>
										<span class="feature-check" aria-hidden="true">✓</span>
										<?php echo esc_html( $feature ); ?>
									</li>
								<?php endforeach; ?>
							</ul>
						</div>
					<?php endif; ?>

					<!-- Limitations (Starter tier only) -->
					<?php if ( ! empty( $plan['limitations'] ) ) : ?>
						<div class="pricing-limitations">
							<h4 class="pricing-limitations-title"><?php esc_html_e( 'Not included:', 'mobiris' ); ?></h4>
							<ul>
								<?php foreach ( $plan['limitations'] as $limitation ) : ?>
									<li>
										<span class="feature-x" aria-hidden="true">✕</span>
										<?php echo esc_html( $limitation ); ?>
									</li>
								<?php endforeach; ?>
							</ul>
						</div>
					<?php endif; ?>
				</div>
			<?php endforeach; ?>
		</div>

		<!-- Add-on Pricing -->
		<?php if ( ! empty( $addons ) ) : ?>
			<div class="pricing-addons">
				<h3 class="addons-title"><?php esc_html_e( 'Add-on pricing for additional services', 'mobiris' ); ?></h3>
				<div class="addons-grid">
					<?php foreach ( $addons as $addon ) : ?>
						<div class="addon-item">
							<span class="addon-label"><?php echo esc_html( $addon['label'] ); ?></span>
							<span class="addon-price"><?php echo esc_html( $addon['price'] ); ?></span>
						</div>
					<?php endforeach; ?>
				</div>
			</div>
		<?php endif; ?>

		<!-- ROI Calculator / Teaser -->
		<div class="pricing-roi">
			<h3><?php esc_html_e( 'Calculate your ROI', 'mobiris' ); ?></h3>
			<p>
				<?php
				/* Translators: %1$s = vehicles, %2$s = daily rate, %3$s = savings per month, %4$s = leakage percentage, %5$s = Starter plan cost */
				printf(
					esc_html__( 'An operator with %1$s vehicles at %2$s daily remittance can recover up to %3$s/month by eliminating %4$s leakage. Mobiris Growth costs just %5$s + per-vehicle extras.', 'mobiris' ),
					'<strong>50</strong>',
					'<strong>₦15,000</strong>',
					'<strong>₦1.125M</strong>',
					'<strong>15%</strong>',
					'<strong>₦35,000</strong>'
				);
				?>
			</p>
			<a href="#" class="btn btn-outline-primary"><?php esc_html_e( 'Get a Custom Quote', 'mobiris' ); ?></a>
		</div>
	</div>
</section>
