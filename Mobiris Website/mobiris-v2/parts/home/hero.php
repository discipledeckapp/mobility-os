<?php
/**
 * Homepage Hero Section.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$headline_en = mv2_option( 'hero_headline_en', "Driver say 'today slow'... but your money no add up." );
$headline_fr = mv2_option( 'hero_headline_fr', "Le chauffeur dit 'aujourd'hui c'est calme'... mais votre argent ne correspond pas." );
$cta1_text   = mv2_option( 'hero_cta1_text', 'Start Free — 14 Days' );
$trial_days  = mv2_option( 'price_trial_days', '14' );
?>
<section class="mv2-hero" aria-label="<?php esc_attr_e( 'Hero', 'mobiris-v2' ); ?>">
	<div class="mv2-hero__bg" aria-hidden="true">
		<div class="mv2-hero__bg-grid"></div>
		<div class="mv2-hero__bg-glow mv2-hero__bg-glow--1"></div>
		<div class="mv2-hero__bg-glow mv2-hero__bg-glow--2"></div>
	</div>

	<div class="mv2-container mv2-hero__inner">

		<!-- Hero Copy -->
		<div class="mv2-hero__copy">
			<!-- Language Toggle (hero version) -->
			<div class="mv2-hero__lang-toggle" role="group" aria-label="<?php esc_attr_e( 'Language selection', 'mobiris-v2' ); ?>">
				<button class="mv2-lang-btn mv2-lang-btn--en is-active" data-lang="en" aria-pressed="true">EN — English</button>
				<button class="mv2-lang-btn mv2-lang-btn--fr" data-lang="fr" aria-pressed="false">FR — Français</button>
			</div>

			<!-- Eyebrow -->
			<div class="mv2-hero__eyebrow">
				<span class="mv2-badge mv2-badge--primary">
					<span data-lang-en="Mobility Risk Infrastructure" data-lang-fr="Infrastructure de risque de mobilité">Mobility Risk Infrastructure</span>
				</span>
			</div>

			<!-- Headline -->
			<h1 class="mv2-hero__headline">
				<span data-lang-en="<?php echo esc_attr( $headline_en ); ?>"
				      data-lang-fr="<?php echo esc_attr( $headline_fr ); ?>">
					<?php echo esc_html( $headline_en ); ?>
				</span>
			</h1>

			<!-- Subheadline -->
			<p class="mv2-hero__subhead">
				<span data-lang-en="Mobiris gives transport operators visibility, control, and accountability — from driver verification to daily remittance."
				      data-lang-fr="Mobiris donne aux opérateurs de transport la visibilité, le contrôle et la responsabilité — de la vérification des chauffeurs au suivi quotidien des remises.">
					Mobiris gives transport operators visibility, control, and accountability — from driver verification to daily remittance.
				</span>
			</p>

			<!-- CTA Buttons -->
			<div class="mv2-hero__ctas">
				<a href="<?php echo esc_url( mv2_app_url() ); ?>"
				   class="mv2-btn mv2-btn--primary mv2-btn--lg"
				   target="_blank"
				   rel="noopener noreferrer">
					<span data-lang-en="<?php echo esc_attr( $cta1_text ); ?>"
					      data-lang-fr="Commencer Gratuitement — <?php echo esc_attr( $trial_days ); ?> Jours">
						<?php echo esc_html( $cta1_text ); ?>
					</span>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
				</a>
				<a href="#mv2-calculator"
				   class="mv2-btn mv2-btn--ghost mv2-btn--lg">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>
					<span data-lang-en="Calculate My Leakage" data-lang-fr="Calculer mes pertes">Calculate My Leakage</span>
				</a>
			</div>

			<!-- Trust Bar -->
			<div class="mv2-hero__trust-bar" role="list">
				<div class="mv2-trust-item" role="listitem">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
					<span data-lang-en="No card required" data-lang-fr="Sans carte bancaire">No card required</span>
				</div>
				<div class="mv2-trust-item" role="listitem">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
					<span data-lang-en="NDPA 2023 compliant" data-lang-fr="Conforme NDPA 2023">NDPA 2023 compliant</span>
				</div>
				<div class="mv2-trust-item" role="listitem">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
					<span data-lang-en="Set up in &lt; 1 hour" data-lang-fr="Mis en place en &lt; 1 heure">Set up in &lt; 1 hour</span>
				</div>
			</div>
		</div>

		<!-- Hero Dashboard Mockup -->
		<div class="mv2-hero__visual" aria-hidden="true">
			<div class="mv2-dashboard-mockup">
				<!-- Mockup Chrome -->
				<div class="mv2-mockup-chrome">
					<div class="mv2-mockup-dots">
						<span></span><span></span><span></span>
					</div>
					<div class="mv2-mockup-url">app.mobiris.ng</div>
				</div>

				<!-- Dashboard Content -->
				<div class="mv2-mockup-body">
					<!-- Header Stats -->
					<div class="mv2-mockup-stats">
						<div class="mv2-mockup-stat">
							<div class="mv2-mockup-stat__label">Today's Collections</div>
							<div class="mv2-mockup-stat__value mv2-mockup-stat__value--green">₦187,500</div>
							<div class="mv2-mockup-stat__sub">of ₦225,000 target</div>
						</div>
						<div class="mv2-mockup-stat">
							<div class="mv2-mockup-stat__label">Active Vehicles</div>
							<div class="mv2-mockup-stat__value">18 / 20</div>
							<div class="mv2-mockup-stat__sub">2 not reporting</div>
						</div>
						<div class="mv2-mockup-stat">
							<div class="mv2-mockup-stat__label">Risk Flags</div>
							<div class="mv2-mockup-stat__value mv2-mockup-stat__value--amber">1</div>
							<div class="mv2-mockup-stat__sub">Review required</div>
						</div>
					</div>

					<!-- Driver List -->
					<div class="mv2-mockup-section-title">Driver Remittance — Today</div>
					<div class="mv2-mockup-driver-list">
						<div class="mv2-mockup-driver">
							<div class="mv2-mockup-driver__avatar mv2-mockup-driver__avatar--verified">AO</div>
							<div class="mv2-mockup-driver__info">
								<div class="mv2-mockup-driver__name">Adewale Okafor</div>
								<div class="mv2-mockup-driver__vehicle">LAS-321-KT · Danfo</div>
							</div>
							<div class="mv2-mockup-driver__right">
								<div class="mv2-mockup-driver__amount">₦12,500</div>
								<div class="mv2-mockup-badge mv2-mockup-badge--paid">Paid</div>
							</div>
						</div>
						<div class="mv2-mockup-driver">
							<div class="mv2-mockup-driver__avatar mv2-mockup-driver__avatar--verified">EM</div>
							<div class="mv2-mockup-driver__info">
								<div class="mv2-mockup-driver__name">Emmanuel Musa</div>
								<div class="mv2-mockup-driver__vehicle">LAS-447-TY · Danfo</div>
							</div>
							<div class="mv2-mockup-driver__right">
								<div class="mv2-mockup-driver__amount">₦11,000</div>
								<div class="mv2-mockup-badge mv2-mockup-badge--paid">Paid</div>
							</div>
						</div>
						<div class="mv2-mockup-driver">
							<div class="mv2-mockup-driver__avatar">BJ</div>
							<div class="mv2-mockup-driver__info">
								<div class="mv2-mockup-driver__name">Babatunde James</div>
								<div class="mv2-mockup-driver__vehicle">LAS-119-QP · Keke</div>
							</div>
							<div class="mv2-mockup-driver__right">
								<div class="mv2-mockup-driver__amount">₦4,500</div>
								<div class="mv2-mockup-badge mv2-mockup-badge--partial">Partial</div>
							</div>
						</div>
						<div class="mv2-mockup-driver">
							<div class="mv2-mockup-driver__avatar mv2-mockup-driver__avatar--verified">FK</div>
							<div class="mv2-mockup-driver__info">
								<div class="mv2-mockup-driver__name">Fatima Kalu</div>
								<div class="mv2-mockup-driver__vehicle">LAS-203-AA · Korope</div>
							</div>
							<div class="mv2-mockup-driver__right">
								<div class="mv2-mockup-driver__amount">₦9,200</div>
								<div class="mv2-mockup-badge mv2-mockup-badge--paid">Paid</div>
							</div>
						</div>
						<div class="mv2-mockup-driver">
							<div class="mv2-mockup-driver__avatar mv2-mockup-driver__avatar--risk">CO</div>
							<div class="mv2-mockup-driver__info">
								<div class="mv2-mockup-driver__name">Chukwuemeka O.</div>
								<div class="mv2-mockup-driver__vehicle">LAS-567-BN · Danfo</div>
							</div>
							<div class="mv2-mockup-driver__right">
								<div class="mv2-mockup-driver__amount">₦0</div>
								<div class="mv2-mockup-badge mv2-mockup-badge--alert">Not reported</div>
							</div>
						</div>
					</div>

					<!-- Compliance Bar -->
					<div class="mv2-mockup-compliance">
						<div class="mv2-mockup-compliance__label">Fleet Compliance</div>
						<div class="mv2-mockup-compliance__bar">
							<div class="mv2-mockup-compliance__fill" style="width:85%"></div>
						</div>
						<div class="mv2-mockup-compliance__pct">85%</div>
					</div>
				</div>
			</div>

			<!-- Floating Alert Card -->
			<div class="mv2-hero__float-card mv2-hero__float-card--alert">
				<div class="mv2-float-card__icon">⚠</div>
				<div class="mv2-float-card__content">
					<div class="mv2-float-card__title">Licence Expiry Alert</div>
					<div class="mv2-float-card__text">Driver ID #0047 — expires in 12 days</div>
				</div>
			</div>

			<!-- Floating Success Card -->
			<div class="mv2-hero__float-card mv2-hero__float-card--success">
				<div class="mv2-float-card__icon">✓</div>
				<div class="mv2-float-card__content">
					<div class="mv2-float-card__title">Remittance Confirmed</div>
					<div class="mv2-float-card__text">₦12,500 received · 2 mins ago</div>
				</div>
			</div>
		</div>

	</div>
</section>
