<?php
/**
 * Template Name: Profit Calculator
 * Template Post Type: page
 *
 * Full-page calculator with detailed breakdown.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>
<section class="mv2-section mv2-section--dark-navy mv2-page-hero mv2-page-hero--sm">
	<div class="mv2-container">
		<div class="mv2-page-hero__inner">
			<div class="mv2-badge mv2-badge--amber">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>
				<span data-lang-en="Leakage Calculator" data-lang-fr="Calculateur de pertes">Leakage Calculator</span>
			</div>
			<h1 class="mv2-page-hero__title">
				<span data-lang-en="Calculate your fleet's leakage — and what you could recover."
				      data-lang-fr="Calculez les pertes de votre flotte — et ce que vous pourriez récupérer.">Calculate your fleet's leakage — and what you could recover.</span>
			</h1>
			<p class="mv2-page-hero__subtitle">
				<span data-lang-en="Enter your fleet details below. The calculator estimates your monthly leakage, what Mobiris would help you recover, and whether the investment pays for itself."
				      data-lang-fr="Entrez les détails de votre flotte ci-dessous. Le calculateur estime vos pertes mensuelles, ce que Mobiris vous aiderait à récupérer, et si l'investissement s'autofinance.">Enter your fleet details below. The calculator estimates your monthly leakage, what Mobiris would help you recover, and whether the investment pays for itself.</span>
			</p>
		</div>
	</div>
</section>

<?php get_template_part( 'parts/home/calculator' ); ?>

<!-- Methodology Note -->
<section class="mv2-section mv2-section--light">
	<div class="mv2-container mv2-container--narrow">
		<h2 class="mv2-section-title">
			<span data-lang-en="How these estimates are calculated" data-lang-fr="Comment ces estimations sont calculées">How these estimates are calculated</span>
		</h2>
		<div class="mv2-prose">
			<p><span data-lang-en="The calculator uses average daily remittance ranges for each vehicle type based on typical Nigerian commercial transport market data. These figures represent what operators report receiving under normal operating conditions."
			         data-lang-fr="Le calculateur utilise des plages de remise quotidienne moyennes pour chaque type de véhicule basées sur les données typiques du marché du transport commercial nigérian.">The calculator uses average daily remittance ranges for each vehicle type based on typical Nigerian commercial transport market data. These figures represent what operators report receiving under normal operating conditions.</span></p>
			<p><span data-lang-en="Leakage percentage is the estimated proportion of total expected revenue that doesn't reach the operator, based on patterns of short payments, disputes, and untracked collections. Industry research and operator accounts suggest this typically ranges from 5% to 25%, with 10–15% being most common."
			         data-lang-fr="Le pourcentage de fuite est la proportion estimée du total des revenus attendus qui n'atteint pas l'opérateur, basée sur les schémas de paiements insuffisants, de litiges et de collectes non suivies. La recherche sectorielle et les témoignages d'opérateurs suggèrent que cela se situe généralement entre 5 % et 25 %.">Leakage percentage is the estimated proportion of total expected revenue that doesn't reach the operator, based on patterns of short payments, disputes, and untracked collections. Industry research and operator accounts suggest this typically ranges from 5% to 25%, with 10–15% being most common.</span></p>
			<p><span data-lang-en="The 80% recovery estimate reflects what structured accountability (remittance tracking, audit trails, verified identities) is expected to improve based on the specific leakage mechanisms it addresses. Not all leakage is recoverable — some is due to genuine route and market factors."
			         data-lang-fr="L'estimation de récupération à 80 % reflète ce que la responsabilité structurée (suivi des remises, pistes d'audit, identités vérifiées) est censée améliorer. Toutes les fuites ne sont pas récupérables — certaines sont dues à des facteurs genuins de marché et d'itinéraire.">The 80% recovery estimate reflects what structured accountability (remittance tracking, audit trails, verified identities) is expected to improve based on the specific leakage mechanisms it addresses. Not all leakage is recoverable — some is due to genuine route and market factors.</span></p>
			<p><em><span data-lang-en="These are estimates only. Actual results depend on your specific fleet, drivers, routes, and how consistently the system is used. Mobiris makes no guarantees about specific financial outcomes."
			             data-lang-fr="Ce ne sont que des estimations. Les résultats réels dépendent de votre flotte spécifique, de vos chauffeurs, de vos itinéraires et de la cohérence avec laquelle le système est utilisé.">These are estimates only. Actual results depend on your specific fleet, drivers, routes, and how consistently the system is used. Mobiris makes no guarantees about specific financial outcomes.</span></em></p>
		</div>
	</div>
</section>

<?php get_template_part( 'parts/home/lead-capture' ); ?>
<?php get_template_part( 'parts/global/cta-band' ); ?>
<?php get_footer(); ?>
