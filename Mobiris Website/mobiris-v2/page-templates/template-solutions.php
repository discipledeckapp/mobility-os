<?php
/**
 * Template Name: Solutions
 * Template Post Type: page
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>
<section class="mv2-section mv2-section--dark-navy mv2-page-hero">
	<div class="mv2-container">
		<div class="mv2-page-hero__inner">
			<div class="mv2-badge mv2-badge--primary">
				<span data-lang-en="Solutions" data-lang-fr="Solutions">Solutions</span>
			</div>
			<h1 class="mv2-page-hero__title">
				<span data-lang-en="Mobiris for every type of transport operator" data-lang-fr="Mobiris pour chaque type d'opérateur de transport">Mobiris for every type of transport operator</span>
			</h1>
			<p class="mv2-page-hero__subtitle">
				<span data-lang-en="Whether you're running 5 keke or 500 vehicles, managing from the depot or from your phone — Mobiris adapts to your situation."
				      data-lang-fr="Que vous gériez 5 keke ou 500 véhicules, depuis le dépôt ou depuis votre téléphone — Mobiris s'adapte à votre situation.">Whether you're running 5 keke or 500 vehicles, managing from the depot or from your phone — Mobiris adapts to your situation.</span>
			</p>
		</div>
	</div>
</section>

<!-- Solutions Grid -->
<section class="mv2-section mv2-section--light">
	<div class="mv2-container">
		<div class="mv2-solutions-grid">

			<div class="mv2-solution-card">
				<div class="mv2-solution-card__icon">
					<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
				</div>
				<h2 class="mv2-solution-card__title">
					<span data-lang-en="Commercial operators" data-lang-fr="Opérateurs commerciaux">Commercial operators</span>
				</h2>
				<p class="mv2-solution-card__desc">
					<span data-lang-en="You run keke, danfo, korope, or bus fleets. You collect daily remittance. You deal with driver disputes, document issues, and unpredictable income. Mobiris gives you the structure and accountability your business needs to run consistently."
					      data-lang-fr="Vous gérez des flottes de keke, danfo, korope ou bus. Vous collectez des remises quotidiennes. Vous gérez les litiges avec les chauffeurs, les problèmes de documents et des revenus imprévisibles. Mobiris vous donne la structure et la responsabilité dont votre entreprise a besoin.">You run keke, danfo, korope, or bus fleets. You collect daily remittance. You deal with driver disputes, document issues, and unpredictable income. Mobiris gives you the structure and accountability your business needs to run consistently.</span>
				</p>
				<a href="<?php echo esc_url( get_permalink( get_page_by_path( 'for-fleet-owners' ) ) ); ?>" class="mv2-btn mv2-btn--outline">
					<span data-lang-en="See how Mobiris works for fleet owners" data-lang-fr="Voir comment Mobiris fonctionne pour les propriétaires de flotte">See how Mobiris works for fleet owners</span>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
				</a>
			</div>

			<div class="mv2-solution-card mv2-solution-card--featured">
				<div class="mv2-solution-card__icon">
					<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
				</div>
				<h2 class="mv2-solution-card__title">
					<span data-lang-en="Vehicle investors" data-lang-fr="Investisseurs en véhicules">Vehicle investors</span>
				</h2>
				<p class="mv2-solution-card__desc">
					<span data-lang-en="You bought vehicles as an investment. You don't drive or manage operations directly. Your income depends on remittance from drivers you don't see every day. Mobiris gives you real-time visibility and daily alerts without requiring your physical presence."
					      data-lang-fr="Vous avez acheté des véhicules comme investissement. Vous ne conduisez pas et ne gérez pas directement les opérations. Votre revenu dépend des remises de chauffeurs que vous ne voyez pas tous les jours. Mobiris vous donne une visibilité en temps réel et des alertes quotidiennes sans nécessiter votre présence physique.">You bought vehicles as an investment. You don't drive or manage operations directly. Your income depends on remittance from drivers you don't see every day. Mobiris gives you real-time visibility and daily alerts without requiring your physical presence.</span>
				</p>
				<a href="<?php echo esc_url( get_permalink( get_page_by_path( 'for-investors' ) ) ); ?>" class="mv2-btn mv2-btn--primary">
					<span data-lang-en="See how Mobiris works for investors" data-lang-fr="Voir comment Mobiris fonctionne pour les investisseurs">See how Mobiris works for investors</span>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
				</a>
			</div>

			<div class="mv2-solution-card">
				<div class="mv2-solution-card__icon">
					<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
				</div>
				<h2 class="mv2-solution-card__title">
					<span data-lang-en="New operators" data-lang-fr="Nouveaux opérateurs">New operators</span>
				</h2>
				<p class="mv2-solution-card__desc">
					<span data-lang-en="You're starting a transport business. You want to do it properly from day one — with the right systems, verified drivers, and a remittance process that protects your investment. Mobiris gives you professional infrastructure without needing a large team."
					      data-lang-fr="Vous démarrez une activité de transport. Vous voulez le faire correctement dès le premier jour — avec les bons systèmes, des chauffeurs vérifiés et un processus de remise qui protège votre investissement. Mobiris vous donne une infrastructure professionnelle sans nécessiter une grande équipe.">You're starting a transport business. You want to do it properly from day one — with the right systems, verified drivers, and a remittance process that protects your investment. Mobiris gives you professional infrastructure without needing a large team.</span>
				</p>
				<a href="<?php echo esc_url( get_permalink( get_page_by_path( 'start-transport-business' ) ) ); ?>" class="mv2-btn mv2-btn--outline">
					<span data-lang-en="How to start a transport business" data-lang-fr="Comment démarrer une activité de transport">How to start a transport business</span>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
				</a>
			</div>

		</div>
	</div>
</section>

<?php get_template_part( 'parts/home/before-after' ); ?>
<?php get_template_part( 'parts/home/lead-capture' ); ?>
<?php get_template_part( 'parts/global/cta-band' ); ?>
<?php get_footer(); ?>
