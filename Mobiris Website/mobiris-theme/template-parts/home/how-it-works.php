<?php
/**
 * How It Works Section Template Part
 *
 * Displays the 3-step implementation process.
 *
 * @package Mobiris
 * @since 1.0.0
 */

$steps = array(
	array(
		'number'      => '01',
		'title'       => esc_html__( 'Connect your fleet', 'mobiris' ),
		'description' => esc_html__( 'Add your vehicles, business entities, and operating units. Import existing vehicle data or start fresh.', 'mobiris' ),
		'icon'        => 'truck',
	),
	array(
		'number'      => '02',
		'title'       => esc_html__( 'Onboard your drivers', 'mobiris' ),
		'description' => esc_html__( 'Capture biometrics, verify government IDs, record guarantors. Mobiris handles the identity infrastructure — you get a verified driver on day one.', 'mobiris' ),
		'icon'        => 'person',
	),
	array(
		'number'      => '03',
		'title'       => esc_html__( 'Track every naira', 'mobiris' ),
		'description' => esc_html__( 'Set daily remittance targets. Drivers check in and report. Disputes get flagged. Your revenue picture becomes clear in real time.', 'mobiris' ),
		'icon'        => 'chart',
	),
);

/**
 * Allow developers to override the steps
 *
 * @param array $steps Array of step objects
 * @return array Filtered steps
 */
$steps = apply_filters( 'mobiris_how_it_works_steps', $steps );
?>

<section class="how-it-works-section section" aria-label="<?php esc_attr_e( 'How It Works', 'mobiris' ); ?>">
	<div class="container">
		<div class="section-header">
			<h2 class="section-title"><?php esc_html_e( 'Up and running in 48 hours', 'mobiris' ); ?></h2>
			<p class="section-intro"><?php esc_html_e( 'No lengthy onboarding, no professional services engagement. Connect your fleet and start tracking.', 'mobiris' ); ?></p>
		</div>

		<div class="steps-grid">
			<?php foreach ( $steps as $step ) : ?>
				<div class="step-card">
					<div class="step-number" aria-hidden="true">
						<?php echo esc_html( $step['number'] ); ?>
					</div>

					<div class="step-icon" aria-hidden="true">
						<?php
						switch ( $step['icon'] ) {
							case 'truck':
								?>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
									<rect x="1" y="3" width="15" height="13"></rect>
									<polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
									<circle cx="5.5" cy="18.5" r="2.5"></circle>
									<circle cx="18.5" cy="18.5" r="2.5"></circle>
								</svg>
								<?php
								break;

							case 'person':
								?>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
									<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
									<circle cx="12" cy="7" r="4"></circle>
								</svg>
								<?php
								break;

							case 'chart':
								?>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
									<line x1="12" y1="2" x2="12" y2="22"></line>
									<path d="M17 5H9.5a1.5 1.5 0 0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5H17"></path>
									<polyline points="3 12 7 8 11 12 15 8"></polyline>
								</svg>
								<?php
								break;

							default:
								?>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
									<circle cx="12" cy="12" r="10"></circle>
								</svg>
								<?php
								break;
						}
						?>
					</div>

					<h3 class="step-title"><?php echo esc_html( $step['title'] ); ?></h3>
					<p class="step-description"><?php echo esc_html( $step['description'] ); ?></p>
				</div>
			<?php endforeach; ?>
		</div>

		<div class="how-it-works-cta">
			<p><?php esc_html_e( 'Ready to get started? ', 'mobiris' ); ?></p>
			<a href="<?php echo esc_url( get_theme_mod( 'mobiris_hero_cta_primary_url', 'https://app.mobiris.ng/signup' ) ); ?>" class="btn btn-primary">
				<?php esc_html_e( 'Launch Your Fleet Dashboard', 'mobiris' ); ?>
			</a>
		</div>
	</div>
</section>
