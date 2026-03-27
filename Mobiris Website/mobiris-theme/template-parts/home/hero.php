<?php
/**
 * Hero Section Template Part
 *
 * Emotional, operator-first hero targeting keke/danfo/korope fleet owners in West Africa.
 * Bilingual: English + French via data-lang attributes and JS toggle.
 *
 * @package Mobiris
 * @since 1.0.0
 */
?>

<section class="hero-section hero-operator" aria-label="Hero">
	<div class="container hero-container">
		<div class="hero-content">

			<div class="hero-lang-toggle" aria-label="Language toggle">
				<button class="lang-btn lang-btn--active" data-lang="en" aria-pressed="true">EN</button>
				<button class="lang-btn" data-lang="fr" aria-pressed="false">FR</button>
			</div>

			<div class="hero-eyebrow-wrap">
				<span class="eyebrow" data-lang-en="Mobility Risk Infrastructure" data-lang-fr="Infrastructure de risque de mobilité">
					Mobility Risk Infrastructure
				</span>
			</div>

			<h1 class="hero-title">
				<span class="hero-title__line" data-lang-en="Every day your drivers" data-lang-fr="Chaque jour que vos conducteurs">
					Every day your drivers
				</span>
				<span class="hero-title__line hero-title__emphasis" data-lang-en="hit the road, money disappears." data-lang-fr="prennent la route, l'argent disparaît.">
					hit the road, money disappears.
				</span>
				<span class="hero-title__line hero-title__solve" data-lang-en="Mobiris stops the leak." data-lang-fr="Mobiris arrête la fuite.">
					Mobiris stops the leak.
				</span>
			</h1>

			<p class="hero-subtitle" data-lang-en="Verify every driver with biometrics and government ID. Track every remittance payment. Catch fraud across your fleet — and across every fleet in the network." data-lang-fr="Vérifiez chaque conducteur avec la biométrie et une pièce d'identité officielle. Suivez chaque paiement de remise. Détectez la fraude dans votre flotte — et dans toutes les flottes du réseau.">
				Verify every driver with biometrics and government ID. Track every remittance payment. Catch fraud across your fleet — and across every fleet in the network.
			</p>

			<div class="hero-operator-callout">
				<span class="hero-operator-callout__text" data-lang-en="Built for keke, danfo, korope, minibus taxi, and matatu operators." data-lang-fr="Conçu pour les opérateurs de keke, danfo, korope, minibus taxi et matatu.">
					Built for keke, danfo, korope, minibus taxi, and matatu operators.
				</span>
			</div>

			<div class="hero-actions">
				<a href="<?php echo esc_url( get_theme_mod( 'mobiris_signup_url', 'https://app.mobiris.ng/signup' ) ); ?>"
				   class="btn btn-primary btn-lg"
				   data-lang-en="Start Free — 14 Days"
				   data-lang-fr="Commencer Gratuitement — 14 Jours">
					Start Free — 14 Days
				</a>
				<a href="#profit-calculator"
				   class="btn btn-outline btn-lg"
				   data-lang-en="Calculate Your Leakage"
				   data-lang-fr="Calculer Votre Perte">
					Calculate Your Leakage
				</a>
			</div>

			<div class="hero-trust-row">
				<span class="hero-trust-item">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="#16A34A"/><path d="M4 8l3 3 5-5" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
					<span data-lang-en="No card required for trial" data-lang-fr="Aucune carte requise pour l'essai">No card required for trial</span>
				</span>
				<span class="hero-trust-item">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="#16A34A"/><path d="M4 8l3 3 5-5" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
					<span data-lang-en="NDPA 2023 compliant" data-lang-fr="Conforme NDPA 2023">NDPA 2023 compliant</span>
				</span>
				<span class="hero-trust-item">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="#16A34A"/><path d="M4 8l3 3 5-5" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
					<span data-lang-en="Set up in under 1 hour" data-lang-fr="Installation en moins d'1 heure">Set up in under 1 hour</span>
				</span>
			</div>

		</div><!-- .hero-content -->

		<div class="hero-media" aria-hidden="true">
			<?php
			$hero_image = get_theme_mod( 'mobiris_hero_image', '' );
			if ( $hero_image ) :
				?>
				<img
					src="<?php echo esc_url( $hero_image ); ?>"
					alt="Mobiris operations console showing driver verification and remittance tracking"
					loading="eager"
					decoding="async"
					class="hero-screenshot"
				/>
			<?php else : ?>
				<!-- Dashboard mockup SVG -->
				<div class="hero-dashboard-mock">
					<div class="mock-header">
						<span class="mock-dot mock-dot--red"></span>
						<span class="mock-dot mock-dot--yellow"></span>
						<span class="mock-dot mock-dot--green"></span>
						<span class="mock-url">app.mobiris.ng</span>
					</div>
					<div class="mock-body">
						<div class="mock-stat-row">
							<div class="mock-stat mock-stat--green">
								<span class="mock-stat__number">₦4.2M</span>
								<span class="mock-stat__label">Remittance this month</span>
							</div>
							<div class="mock-stat mock-stat--blue">
								<span class="mock-stat__number">47</span>
								<span class="mock-stat__label">Active drivers</span>
							</div>
							<div class="mock-stat mock-stat--amber">
								<span class="mock-stat__number">3</span>
								<span class="mock-stat__label">Disputes open</span>
							</div>
						</div>
						<div class="mock-table-header">
							<span>Driver</span><span>Today</span><span>Status</span>
						</div>
						<div class="mock-row"><span class="mock-avatar"></span><span>Emeka A.</span><span>₦12,500</span><span class="mock-badge mock-badge--green">Confirmed</span></div>
						<div class="mock-row"><span class="mock-avatar"></span><span>Chidi O.</span><span>₦9,000</span><span class="mock-badge mock-badge--red">Disputed</span></div>
						<div class="mock-row"><span class="mock-avatar"></span><span>Bola K.</span><span>₦15,000</span><span class="mock-badge mock-badge--green">Confirmed</span></div>
						<div class="mock-row"><span class="mock-avatar"></span><span>Yaw A.</span><span>₦11,000</span><span class="mock-badge mock-badge--blue">Pending</span></div>
						<div class="mock-risk-alert">
							<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 12H1L7 1Z" stroke="#D97706" stroke-width="1.5"/><line x1="7" y1="5" x2="7" y2="8" stroke="#D97706" stroke-width="1.5"/><circle cx="7" cy="10" r="0.5" fill="#D97706" stroke="#D97706"/></svg>
							Risk signal detected — 1 driver requires review
						</div>
					</div>
				</div>
			<?php endif; ?>
		</div><!-- .hero-media -->

	</div><!-- .hero-container -->

	<!-- Decorative -->
	<div class="hero-bg-pattern" aria-hidden="true"></div>
</section>
