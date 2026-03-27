<?php
/**
 * Hero Section Template Part
 *
 * Displays the main hero section with headline, CTA buttons, and optional media.
 * Supports both split (text left, image right) and centered layouts.
 *
 * @package Mobiris
 * @since 1.0.0
 */

// Get theme customizer values
$eyebrow = get_theme_mod( 'mobiris_hero_eyebrow', esc_html__( 'Fleet Operations Platform', 'mobiris' ) );
$title = get_theme_mod( 'mobiris_hero_title', esc_html__( 'Run your fleet with confidence', 'mobiris' ) );
$subtitle = get_theme_mod( 'mobiris_hero_subtitle', esc_html__( 'Verify drivers, track remittance, and detect fraud across your fleet with our cross-operator intelligence layer.', 'mobiris' ) );
$cta_primary_label = get_theme_mod( 'mobiris_hero_cta_primary_label', esc_html__( 'Get Started Free', 'mobiris' ) );
$cta_primary_url = get_theme_mod( 'mobiris_hero_cta_primary_url', 'https://app.mobiris.ng/signup' );
$cta_secondary_label = get_theme_mod( 'mobiris_hero_cta_secondary_label', esc_html__( 'Book a Demo', 'mobiris' ) );
$cta_secondary_url = get_theme_mod( 'mobiris_hero_cta_secondary_url', '' );
$hero_image = get_theme_mod( 'mobiris_hero_image', '' );
$hero_style = get_theme_mod( 'mobiris_hero_style', 'split' );
$show_social_proof = get_theme_mod( 'mobiris_hero_show_social_proof', '1' );
$social_proof_text = get_theme_mod( 'mobiris_hero_social_proof_text', esc_html__( 'Trusted by transport operators across Nigeria, Ghana, and Kenya', 'mobiris' ) );
?>

<section class="hero-section hero-<?php echo esc_attr( $hero_style ); ?>" aria-label="<?php esc_attr_e( 'Hero', 'mobiris' ); ?>">
	<div class="container hero-container">
		<div class="hero-content">
			<?php if ( $eyebrow ) : ?>
				<span class="eyebrow"><?php echo esc_html( $eyebrow ); ?></span>
			<?php endif; ?>

			<h1 class="hero-title"><?php echo esc_html( $title ); ?></h1>

			<?php if ( $subtitle ) : ?>
				<p class="hero-subtitle"><?php echo esc_html( $subtitle ); ?></p>
			<?php endif; ?>

			<div class="hero-actions">
				<?php if ( $cta_primary_label && $cta_primary_url ) : ?>
					<a href="<?php echo esc_url( $cta_primary_url ); ?>" class="btn btn-primary btn-lg">
						<?php echo esc_html( $cta_primary_label ); ?>
					</a>
				<?php endif; ?>

				<?php if ( $cta_secondary_label && $cta_secondary_url ) : ?>
					<a href="<?php echo esc_url( $cta_secondary_url ); ?>" class="btn btn-secondary btn-lg">
						<?php echo esc_html( $cta_secondary_label ); ?>
					</a>
				<?php endif; ?>
			</div>

			<?php if ( $show_social_proof && $social_proof_text ) : ?>
				<p class="hero-social-proof">
					<span class="hero-social-proof-dot" aria-hidden="true"></span>
					<?php echo esc_html( $social_proof_text ); ?>
				</p>
			<?php endif; ?>
		</div>

		<?php if ( 'split' === $hero_style ) : ?>
			<div class="hero-media">
				<?php if ( $hero_image ) : ?>
					<img
						src="<?php echo esc_url( $hero_image ); ?>"
						alt="<?php esc_attr_e( 'Mobiris fleet operations dashboard', 'mobiris' ); ?>"
						loading="eager"
						decoding="async"
					/>
				<?php else : ?>
					<!-- SVG Dashboard Placeholder -->
					<div class="hero-placeholder-graphic" aria-hidden="true">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 480 320"
							width="480"
							height="320"
							class="dashboard-svg"
						>
							<!-- Background -->
							<rect width="480" height="320" fill="#F8FAFC"/>

							<!-- Header Bar (Navy) -->
							<rect x="0" y="0" width="480" height="48" fill="#0F172A"/>

							<!-- Header icons/text -->
							<circle cx="24" cy="24" r="4" fill="#DBEAFE"/>
							<rect x="40" y="20" width="60" height="8" rx="2" fill="#DBEAFE"/>
							<circle cx="456" cy="24" r="4" fill="#94A3B8"/>

							<!-- Sidebar -->
							<rect x="0" y="48" width="64" height="272" fill="#1E293B"/>

							<!-- Sidebar nav items -->
							<rect x="8" y="60" width="48" height="6" rx="3" fill="#DBEAFE" opacity="0.8"/>
							<rect x="8" y="80" width="48" height="6" rx="3" fill="#64748B"/>
							<rect x="8" y="100" width="48" height="6" rx="3" fill="#64748B"/>
							<rect x="8" y="120" width="48" height="6" rx="3" fill="#64748B"/>

							<!-- Main content area background -->
							<rect x="64" y="48" width="416" height="272" fill="#FFFFFF"/>

							<!-- Stats Cards Row 1 -->
							<g id="stat-card-1">
								<rect x="80" y="64" width="112" height="72" rx="8" fill="#DBEAFE" stroke="#2563EB" stroke-width="1.5"/>
								<rect x="88" y="72" width="40" height="12" rx="2" fill="#2563EB"/>
								<rect x="88" y="88" width="80" height="6" rx="2" fill="#0F172A" opacity="0.7"/>
								<rect x="88" y="98" width="60" height="4" rx="2" fill="#0F172A" opacity="0.4"/>
							</g>

							<!-- Stats Cards Row 1 -->
							<g id="stat-card-2">
								<rect x="204" y="64" width="112" height="72" rx="8" fill="#DBEAFE" stroke="#2563EB" stroke-width="1.5"/>
								<rect x="212" y="72" width="40" height="12" rx="2" fill="#2563EB"/>
								<rect x="212" y="88" width="80" height="6" rx="2" fill="#0F172A" opacity="0.7"/>
								<rect x="212" y="98" width="60" height="4" rx="2" fill="#0F172A" opacity="0.4"/>
							</g>

							<!-- Stats Cards Row 1 -->
							<g id="stat-card-3">
								<rect x="328" y="64" width="112" height="72" rx="8" fill="#DBEAFE" stroke="#2563EB" stroke-width="1.5"/>
								<rect x="336" y="72" width="40" height="12" rx="2" fill="#2563EB"/>
								<rect x="336" y="88" width="80" height="6" rx="2" fill="#0F172A" opacity="0.7"/>
								<rect x="336" y="98" width="60" height="4" rx="2" fill="#0F172A" opacity="0.4"/>
							</g>

							<!-- Data Table Header -->
							<rect x="80" y="152" width="360" height="24" fill="#F1F5F9"/>
							<line x1="80" y1="176" x2="440" y2="176" stroke="#E2E8F0" stroke-width="1"/>

							<!-- Table header text -->
							<rect x="88" y="158" width="50" height="6" rx="2" fill="#0F172A" opacity="0.6"/>
							<rect x="160" y="158" width="50" height="6" rx="2" fill="#0F172A" opacity="0.6"/>
							<rect x="240" y="158" width="50" height="6" rx="2" fill="#0F172A" opacity="0.6"/>
							<rect x="320" y="158" width="50" height="6" rx="2" fill="#0F172A" opacity="0.6"/>

							<!-- Table rows -->
							<g id="table-rows">
								<!-- Row 1 -->
								<line x1="80" y1="192" x2="440" y2="192" stroke="#E2E8F0" stroke-width="1"/>
								<rect x="88" y="178" width="40" height="5" rx="2" fill="#0F172A" opacity="0.5"/>
								<rect x="160" y="178" width="50" height="5" rx="2" fill="#2563EB" opacity="0.3"/>
								<rect x="240" y="178" width="60" height="5" rx="2" fill="#0F172A" opacity="0.4"/>
								<rect x="320" y="178" width="100" height="5" rx="2" fill="#10B981" opacity="0.2"/>

								<!-- Row 2 -->
								<line x1="80" y1="208" x2="440" y2="208" stroke="#E2E8F0" stroke-width="1"/>
								<rect x="88" y="194" width="40" height="5" rx="2" fill="#0F172A" opacity="0.5"/>
								<rect x="160" y="194" width="50" height="5" rx="2" fill="#2563EB" opacity="0.3"/>
								<rect x="240" y="194" width="60" height="5" rx="2" fill="#0F172A" opacity="0.4"/>
								<rect x="320" y="194" width="100" height="5" rx="2" fill="#10B981" opacity="0.2"/>

								<!-- Row 3 -->
								<line x1="80" y1="224" x2="440" y2="224" stroke="#E2E8F0" stroke-width="1"/>
								<rect x="88" y="210" width="40" height="5" rx="2" fill="#0F172A" opacity="0.5"/>
								<rect x="160" y="210" width="50" height="5" rx="2" fill="#EF4444" opacity="0.3"/>
								<rect x="240" y="210" width="60" height="5" rx="2" fill="#0F172A" opacity="0.4"/>
								<rect x="320" y="210" width="100" height="5" rx="2" fill="#EF4444" opacity="0.2"/>

								<!-- Row 4 -->
								<line x1="80" y1="240" x2="440" y2="240" stroke="#E2E8F0" stroke-width="1"/>
								<rect x="88" y="226" width="40" height="5" rx="2" fill="#0F172A" opacity="0.5"/>
								<rect x="160" y="226" width="50" height="5" rx="2" fill="#2563EB" opacity="0.3"/>
								<rect x="240" y="226" width="60" height="5" rx="2" fill="#0F172A" opacity="0.4"/>
								<rect x="320" y="226" width="100" height="5" rx="2" fill="#10B981" opacity="0.2"/>
							</g>

							<!-- Status badges -->
							<g id="status-badges">
								<rect x="400" y="175" width="36" height="16" rx="4" fill="#D1FAE5"/>
								<rect x="400" y="191" width="36" height="16" rx="4" fill="#D1FAE5"/>
								<rect x="400" y="207" width="36" height="16" rx="4" fill="#FEE2E2"/>
								<rect x="400" y="223" width="36" height="16" rx="4" fill="#D1FAE5"/>
							</g>

							<!-- Decorative accent line -->
							<line x1="80" y1="256" x2="180" y2="256" stroke="#2563EB" stroke-width="2" stroke-linecap="round"/>
						</svg>
					</div>
				<?php endif; ?>
			</div>
		<?php endif; ?>
	</div>
</section>
