<?php
/**
 * Intelligence Plane Section Template Part
 *
 * Displays the key differentiator: cross-operator intelligence layer.
 * This is a bold, visually prominent section.
 *
 * @package Mobiris
 * @since 1.0.0
 */

$show_intelligence = get_theme_mod( 'mobiris_show_intelligence', '1' );

if ( ! $show_intelligence ) {
	return;
}

$title = get_theme_mod( 'mobiris_intelligence_title', esc_html__( 'The fraud detection layer no single operator can build alone', 'mobiris' ) );
$body = get_theme_mod( 'mobiris_intelligence_body', esc_html__( 'Mobiris creates a shared intelligence infrastructure that strengthens every connected operator. Your fraud signals become everyone\'s risk indicators. The more operators on the network, the stronger the layer becomes.', 'mobiris' ) );
$cta_label = get_theme_mod( 'mobiris_intelligence_cta_label', esc_html__( 'Learn how it works', 'mobiris' ) );
$cta_url = get_theme_mod( 'mobiris_intelligence_cta_url', '' );
?>

<section class="intelligence-section section" aria-label="<?php esc_attr_e( 'Intelligence Plane', 'mobiris' ); ?>">
	<div class="container">
		<div class="intelligence-inner">
			<div class="intelligence-text">
				<span class="intelligence-badge" aria-hidden="true">
					<?php esc_html_e( 'Intelligence Plane', 'mobiris' ); ?>
				</span>

				<?php if ( $title ) : ?>
					<h2 class="intelligence-title"><?php echo esc_html( $title ); ?></h2>
				<?php endif; ?>

				<?php if ( $body ) : ?>
					<p class="intelligence-body"><?php echo esc_html( $body ); ?></p>
				<?php endif; ?>

				<ul class="intelligence-features">
					<li>
						<span class="intelligence-feature-icon" aria-hidden="true">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
								<polyline points="20 6 9 17 4 12"></polyline>
							</svg>
						</span>
						<div>
							<strong><?php esc_html_e( 'Cross-operator risk signals', 'mobiris' ); ?></strong>
							<p><?php esc_html_e( 'When a driver is flagged at one operator, that signal is available — anonymised — across the network.', 'mobiris' ); ?></p>
						</div>
					</li>

					<li>
						<span class="intelligence-feature-icon" aria-hidden="true">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
								<polyline points="20 6 9 17 4 12"></polyline>
							</svg>
						</span>
						<div>
							<strong><?php esc_html_e( 'Biometric uniqueness verification', 'mobiris' ); ?></strong>
							<p><?php esc_html_e( 'Face embeddings ensure a driver can\'t register multiple identities across different companies.', 'mobiris' ); ?></p>
						</div>
					</li>

					<li>
						<span class="intelligence-feature-icon" aria-hidden="true">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
								<polyline points="20 6 9 17 4 12"></polyline>
							</svg>
						</span>
						<div>
							<strong><?php esc_html_e( 'Network effect', 'mobiris' ); ?></strong>
							<p><?php esc_html_e( 'The more operators on Mobiris, the stronger the intelligence layer becomes for everyone.', 'mobiris' ); ?></p>
						</div>
					</li>
				</ul>

				<?php if ( $cta_label && $cta_url ) : ?>
					<a href="<?php echo esc_url( $cta_url ); ?>" class="btn btn-white">
						<?php echo esc_html( $cta_label ); ?> <span aria-hidden="true">→</span>
					</a>
				<?php endif; ?>
			</div>

			<div class="intelligence-visual" aria-hidden="true">
				<!-- Network Graph Visualization -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 420 360"
					width="420"
					height="360"
					class="network-graph"
				>
					<!-- Define gradients -->
					<defs>
						<radialGradient id="central-glow" cx="50%" cy="50%" r="50%">
							<stop offset="0%" style="stop-color:#2563EB;stop-opacity:0.3" />
							<stop offset="100%" style="stop-color:#2563EB;stop-opacity:0" />
						</radialGradient>

						<filter id="node-shadow" x="-50%" y="-50%" width="200%" height="200%">
							<feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1"/>
						</filter>

						<linearGradient id="warning-line" x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" style="stop-color:#FBBF24"/>
							<stop offset="100%" style="stop-color:#EF4444"/>
						</linearGradient>
					</defs>

					<!-- Central glow effect -->
					<circle cx="210" cy="180" r="80" fill="url(#central-glow)"/>

					<!-- Connection lines from hub to operators -->
					<line x1="210" y1="180" x2="100" y2="80" stroke="#DBEAFE" stroke-width="1.5" stroke-dasharray="5,5" opacity="0.6"/>
					<line x1="210" y1="180" x2="320" y2="80" stroke="#DBEAFE" stroke-width="1.5" stroke-dasharray="5,5" opacity="0.6"/>
					<line x1="210" y1="180" x2="60" y2="180" stroke="#DBEAFE" stroke-width="1.5" stroke-dasharray="5,5" opacity="0.6"/>
					<line x1="210" y1="180" x2="360" y2="180" stroke="url(#warning-line)" stroke-width="2" stroke-dasharray="5,5" opacity="0.8"/>
					<line x1="210" y1="180" x2="100" y2="280" stroke="#DBEAFE" stroke-width="1.5" stroke-dasharray="5,5" opacity="0.6"/>
					<line x1="210" y1="180" x2="320" y2="280" stroke="#DBEAFE" stroke-width="1.5" stroke-dasharray="5,5" opacity="0.6"/>

					<!-- Central Hub Node (Mobiris) -->
					<g>
						<circle cx="210" cy="180" r="28" fill="#2563EB" filter="url(#node-shadow)"/>
						<circle cx="210" cy="180" r="28" fill="none" stroke="#1E40AF" stroke-width="2" opacity="0.5"/>
						<text x="210" y="180" text-anchor="middle" dominant-baseline="middle" font-size="10" font-weight="bold" fill="white">
							Mobiris
						</text>
						<text x="210" y="192" text-anchor="middle" dominant-baseline="middle" font-size="7" fill="#DBEAFE" opacity="0.8">
							Hub
						</text>
					</g>

					<!-- Operator Node 1 (Top Left) -->
					<g>
						<circle cx="100" cy="80" r="20" fill="#DBEAFE" filter="url(#node-shadow)"/>
						<circle cx="100" cy="80" r="20" fill="none" stroke="#2563EB" stroke-width="1.5"/>
						<text x="100" y="82" text-anchor="middle" dominant-baseline="middle" font-size="8" font-weight="600" fill="#0F172A">
							Op. A
						</text>
					</g>

					<!-- Operator Node 2 (Top Right) -->
					<g>
						<circle cx="320" cy="80" r="20" fill="#DBEAFE" filter="url(#node-shadow)"/>
						<circle cx="320" cy="80" r="20" fill="none" stroke="#2563EB" stroke-width="1.5"/>
						<text x="320" y="82" text-anchor="middle" dominant-baseline="middle" font-size="8" font-weight="600" fill="#0F172A">
							Op. B
						</text>
					</g>

					<!-- Operator Node 3 (Left) -->
					<g>
						<circle cx="60" cy="180" r="20" fill="#DBEAFE" filter="url(#node-shadow)"/>
						<circle cx="60" cy="180" r="20" fill="none" stroke="#2563EB" stroke-width="1.5"/>
						<text x="60" y="182" text-anchor="middle" dominant-baseline="middle" font-size="8" font-weight="600" fill="#0F172A">
							Op. C
						</text>
					</g>

					<!-- Operator Node 4 (Right) - With warning highlight -->
					<g>
						<circle cx="360" cy="180" r="20" fill="#FEE2E2" filter="url(#node-shadow)"/>
						<circle cx="360" cy="180" r="20" fill="none" stroke="#EF4444" stroke-width="2"/>
						<text x="360" y="182" text-anchor="middle" dominant-baseline="middle" font-size="8" font-weight="600" fill="#7F1D1D">
							Op. D
						</text>
					</g>

					<!-- Operator Node 5 (Bottom Left) -->
					<g>
						<circle cx="100" cy="280" r="20" fill="#DBEAFE" filter="url(#node-shadow)"/>
						<circle cx="100" cy="280" r="20" fill="none" stroke="#2563EB" stroke-width="1.5"/>
						<text x="100" y="282" text-anchor="middle" dominant-baseline="middle" font-size="8" font-weight="600" fill="#0F172A">
							Op. E
						</text>
					</g>

					<!-- Operator Node 6 (Bottom Right) -->
					<g>
						<circle cx="320" cy="280" r="20" fill="#DBEAFE" filter="url(#node-shadow)"/>
						<circle cx="320" cy="280" r="20" fill="none" stroke="#2563EB" stroke-width="1.5"/>
						<text x="320" y="282" text-anchor="middle" dominant-baseline="middle" font-size="8" font-weight="600" fill="#0F172A">
							Op. F
						</text>
					</g>

					<!-- Risk signal indicator badge on the warning connection -->
					<g>
						<rect x="340" y="165" width="30" height="16" rx="4" fill="#FBBF24" opacity="0.9"/>
						<text x="355" y="175" text-anchor="middle" dominant-baseline="middle" font-size="7" font-weight="bold" fill="#7C2D12">
							Alert
						</text>
					</g>

					<!-- Legend text -->
					<text x="20" y="330" font-size="9" fill="#64748B" opacity="0.8">
						● Connected Operator
					</text>
					<circle cx="13" cy="329" r="3" fill="#DBEAFE" stroke="#2563EB" stroke-width="1"/>

					<text x="200" y="330" font-size="9" fill="#64748B" opacity="0.8">
						⚠ Risk Signal
					</text>
					<circle cx="193" cy="329" r="3" fill="#FEE2E2" stroke="#EF4444" stroke-width="1.5"/>
				</svg>
			</div>
		</div>
	</div>
</section>
