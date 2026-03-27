<?php
/**
 * Problem Statement Section Template Part
 *
 * Presents the core market problem that Mobiris solves.
 * This section contains core positioning content.
 *
 * @package Mobiris
 * @since 1.0.0
 */

// Problem section content - core positioning
$problem_content = array(
	'eyebrow'   => esc_html__( 'The Problem', 'mobiris' ),
	'title'     => esc_html__( 'Transport operators in Africa run their fleets on guesswork', 'mobiris' ),
	'intro'     => esc_html__( 'Daily remittance in Nigeria alone moves billions of naira through vehicles every day. Most of it is tracked on paper, in WhatsApp groups, and in Excel files that don\'t talk to each other.', 'mobiris' ),
	'problems'  => array(
		array(
			'title'       => esc_html__( 'Remittance Leakage', 'mobiris' ),
			'description' => esc_html__( 'Without real-time tracking, drivers underreport earnings and operators lose 10–15% of daily revenue without knowing where it went.', 'mobiris' ),
			'icon'        => 'warning',
		),
		array(
			'title'       => esc_html__( 'Unverified Drivers', 'mobiris' ),
			'description' => esc_html__( 'Hiring a driver you can\'t verify — background, history, guarantors — is a risk that can cost far more than it saves in recruitment speed.', 'mobiris' ),
			'icon'        => 'person-question',
		),
		array(
			'title'       => esc_html__( 'No Cross-Operator Visibility', 'mobiris' ),
			'description' => esc_html__( 'A driver blacklisted at one company can onboard at the next company tomorrow. No single operator can solve this alone.', 'mobiris' ),
			'icon'        => 'network',
		),
	),
	'transition' => esc_html__( 'Mobiris was built to solve exactly this.', 'mobiris' ),
);

/**
 * Allow developers to override problem section content
 *
 * @param array $problem_content Array containing problem section data
 * @return array Filtered problem content
 */
$problem_content = apply_filters( 'mobiris_problem_section', $problem_content );
?>

<section class="problem-section section" aria-label="<?php esc_attr_e( 'The Problem', 'mobiris' ); ?>">
	<div class="container">
		<div class="problem-header">
			<?php if ( isset( $problem_content['eyebrow'] ) && $problem_content['eyebrow'] ) : ?>
				<span class="eyebrow"><?php echo esc_html( $problem_content['eyebrow'] ); ?></span>
			<?php endif; ?>

			<?php if ( isset( $problem_content['title'] ) && $problem_content['title'] ) : ?>
				<h2 class="section-title"><?php echo esc_html( $problem_content['title'] ); ?></h2>
			<?php endif; ?>

			<?php if ( isset( $problem_content['intro'] ) && $problem_content['intro'] ) : ?>
				<p class="section-intro"><?php echo esc_html( $problem_content['intro'] ); ?></p>
			<?php endif; ?>
		</div>

		<?php if ( isset( $problem_content['problems'] ) && ! empty( $problem_content['problems'] ) ) : ?>
			<div class="problem-cards">
				<?php foreach ( $problem_content['problems'] as $problem ) : ?>
					<div class="problem-card">
						<div class="problem-icon" aria-hidden="true">
							<?php
							switch ( $problem['icon'] ) {
								case 'warning':
									?>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
										<line x1="12" y1="9" x2="12" y2="13"></line>
										<line x1="12" y1="17" x2="12.01" y2="17"></line>
									</svg>
									<?php
									break;

								case 'person-question':
									?>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
										<circle cx="12" cy="7" r="4"></circle>
										<text x="12" y="12" text-anchor="middle" font-size="8" fill="currentColor" dominant-baseline="middle">?</text>
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

						<h3 class="problem-title"><?php echo esc_html( $problem['title'] ); ?></h3>
						<p class="problem-description"><?php echo esc_html( $problem['description'] ); ?></p>
					</div>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>

		<?php if ( isset( $problem_content['transition'] ) && $problem_content['transition'] ) : ?>
			<div class="problem-transition">
				<p><?php echo esc_html( $problem_content['transition'] ); ?></p>
			</div>
		<?php endif; ?>
	</div>
</section>
