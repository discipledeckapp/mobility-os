<?php
/**
 * Template Name: Product
 * Template Post Type: page
 *
 * Full product overview page.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>
<!-- Product Hero -->
<section class="mv2-section mv2-section--dark-navy mv2-page-hero">
	<div class="mv2-container">
		<div class="mv2-page-hero__inner">
			<div class="mv2-badge mv2-badge--primary">
				<span data-lang-en="The Platform" data-lang-fr="La plateforme">The Platform</span>
			</div>
			<h1 class="mv2-page-hero__title">
				<span data-lang-en="Mobiris: Mobility Risk Infrastructure" data-lang-fr="Mobiris : Infrastructure de risque de mobilité">Mobiris: Mobility Risk Infrastructure</span>
			</h1>
			<p class="mv2-page-hero__subtitle">
				<span data-lang-en="Purpose-built for Nigerian and West African transport operators. Not adapted from generic SaaS. Not borrowed from ride-hailing. Built from the ground up for this specific problem."
				      data-lang-fr="Conçu spécifiquement pour les opérateurs de transport nigérians et ouest-africains. Pas adapté d'un SaaS générique. Construit de zéro pour ce problème spécifique.">Purpose-built for Nigerian and West African transport operators. Not adapted from generic SaaS. Not borrowed from ride-hailing. Built from the ground up for this specific problem.</span>
			</p>
			<div class="mv2-page-hero__ctas">
				<a href="<?php echo esc_url( mv2_app_url() ); ?>" class="mv2-btn mv2-btn--primary mv2-btn--lg" target="_blank" rel="noopener noreferrer">
					<span data-lang-en="Start Free Trial" data-lang-fr="Commencer l'essai gratuit">Start Free Trial</span>
				</a>
				<a href="<?php echo esc_url( mv2_wa_url( 'I want to see a demo of Mobiris' ) ); ?>" class="mv2-btn mv2-btn--ghost mv2-btn--lg" target="_blank" rel="noopener noreferrer">
					<span data-lang-en="Request a Demo" data-lang-fr="Demander une démo">Request a Demo</span>
				</a>
			</div>
		</div>
	</div>
</section>

<!-- What Mobiris Is NOT -->
<section class="mv2-section mv2-section--light">
	<div class="mv2-container">
		<div class="mv2-section-header mv2-section-header--center">
			<h2 class="mv2-section-title">
				<span data-lang-en="What Mobiris is — and isn't." data-lang-fr="Ce qu'est Mobiris — et ce qu'il n'est pas.">What Mobiris is — and isn't.</span>
			</h2>
		</div>
		<div class="mv2-product-compare-grid">
			<div class="mv2-product-not">
				<h3><span data-lang-en="Mobiris is NOT:" data-lang-fr="Mobiris n'est PAS :">Mobiris is NOT:</span></h3>
				<ul>
					<li><span data-lang-en="Fleet management software (no GPS tracking)" data-lang-fr="Logiciel de gestion de flotte (pas de suivi GPS)">Fleet management software (no GPS tracking)</span></li>
					<li><span data-lang-en="Logistics software (no dispatch, no routing)" data-lang-fr="Logiciel de logistique (pas d'envoi, pas de routage)">Logistics software (no dispatch, no routing)</span></li>
					<li><span data-lang-en="Ride-hailing platform (not for passengers)" data-lang-fr="Plateforme de covoiturage (pas pour les passagers)">Ride-hailing platform (not for passengers)</span></li>
					<li><span data-lang-en="Accounting software (not a full ERP)" data-lang-fr="Logiciel de comptabilité (pas un ERP complet)">Accounting software (not a full ERP)</span></li>
					<li><span data-lang-en="Adapted from Western transport tools" data-lang-fr="Adapté d'outils de transport occidentaux">Adapted from Western transport tools</span></li>
				</ul>
			</div>
			<div class="mv2-product-is">
				<h3><span data-lang-en="Mobiris IS:" data-lang-fr="Mobiris EST :">Mobiris IS:</span></h3>
				<ul>
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="A driver identity and risk management platform" data-lang-fr="Une plateforme de gestion de l'identité et des risques des chauffeurs">A driver identity and risk management platform</span>
					</li>
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="A remittance tracking and accountability system" data-lang-fr="Un système de suivi et de responsabilité des remises">A remittance tracking and accountability system</span>
					</li>
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="A compliance and document management tool" data-lang-fr="Un outil de gestion de la conformité et des documents">A compliance and document management tool</span>
					</li>
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="A cross-operator fraud intelligence network" data-lang-fr="Un réseau d'intelligence anti-fraude entre opérateurs">A cross-operator fraud intelligence network</span>
					</li>
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="Built for Nigerian commercial transport — keke, danfo, korope, buses" data-lang-fr="Conçu pour le transport commercial nigérian — keke, danfo, korope, bus">Built for Nigerian commercial transport — keke, danfo, korope, buses</span>
					</li>
				</ul>
			</div>
		</div>
	</div>
</section>

<!-- All 6 Capabilities — Full Detail -->
<?php get_template_part( 'parts/home/product-intro' ); ?>

<!-- How It Works -->
<?php get_template_part( 'parts/home/how-it-works' ); ?>

<!-- Pricing -->
<?php get_template_part( 'parts/home/pricing' ); ?>

<!-- Lead Capture -->
<?php get_template_part( 'parts/home/lead-capture' ); ?>

<?php get_template_part( 'parts/global/cta-band' ); ?>
<?php get_footer(); ?>
