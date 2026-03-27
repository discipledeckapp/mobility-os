<?php
/**
 * Template Name: For Fleet Owners
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
			<div class="mv2-badge mv2-badge--success">
				<span data-lang-en="For Fleet Owners" data-lang-fr="Pour les propriétaires de flotte">For Fleet Owners</span>
			</div>
			<h1 class="mv2-page-hero__title">
				<span data-lang-en="You manage drivers every day. Make sure the money follows."
				      data-lang-fr="Vous gérez des chauffeurs tous les jours. Assurez-vous que l'argent suit.">You manage drivers every day. Make sure the money follows.</span>
			</h1>
			<p class="mv2-page-hero__subtitle">
				<span data-lang-en="Mobiris gives you the daily tools to track remittance, resolve disputes, and maintain control — without being physically present at every vehicle."
				      data-lang-fr="Mobiris vous donne les outils quotidiens pour suivre les remises, résoudre les litiges et maintenir le contrôle — sans être physiquement présent à chaque véhicule.">Mobiris gives you the daily tools to track remittance, resolve disputes, and maintain control — without being physically present at every vehicle.</span>
			</p>
			<div class="mv2-page-hero__ctas">
				<a href="<?php echo esc_url( mv2_app_url() ); ?>" class="mv2-btn mv2-btn--primary mv2-btn--lg" target="_blank" rel="noopener noreferrer">
					<span data-lang-en="Start Free Trial" data-lang-fr="Commencer l'essai gratuit">Start Free Trial</span>
				</a>
				<a href="<?php echo esc_url( mv2_wa_url( 'I want to reduce leakage in my transport business' ) ); ?>" class="mv2-btn mv2-btn--wa mv2-btn--lg" target="_blank" rel="noopener noreferrer">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
					<span data-lang-en="Chat on WhatsApp" data-lang-fr="Discuter sur WhatsApp">Chat on WhatsApp</span>
				</a>
			</div>
		</div>
	</div>
</section>

<!-- Daily Routine Section -->
<section class="mv2-section mv2-section--light">
	<div class="mv2-container">
		<div class="mv2-section-header mv2-section-header--center">
			<h2 class="mv2-section-title">
				<span data-lang-en="Your new daily routine with Mobiris" data-lang-fr="Votre nouvelle routine quotidienne avec Mobiris">Your new daily routine with Mobiris</span>
			</h2>
		</div>
		<div class="mv2-routine-timeline">
			<div class="mv2-routine-item">
				<div class="mv2-routine-item__time">6:00 AM</div>
				<div class="mv2-routine-item__content">
					<h3><span data-lang-en="Morning check" data-lang-fr="Vérification matinale">Morning check</span></h3>
					<p><span data-lang-en="Open Mobiris dashboard. See which drivers are assigned and which vehicles are active. Check for any outstanding issues from yesterday."
					         data-lang-fr="Ouvrez le tableau de bord Mobiris. Voyez quels chauffeurs sont affectés et quels véhicules sont actifs. Vérifiez tout problème en suspens d'hier.">Open Mobiris dashboard. See which drivers are assigned and which vehicles are active. Check for any outstanding issues from yesterday.</span></p>
				</div>
			</div>
			<div class="mv2-routine-item">
				<div class="mv2-routine-item__time">During the day</div>
				<div class="mv2-routine-item__content">
					<h3><span data-lang-en="Drivers report" data-lang-fr="Les chauffeurs signalent">Drivers report</span></h3>
					<p><span data-lang-en="Drivers log their daily collections in the app. You get notified when they report. You can confirm, question, or flag unusual amounts from your phone."
					         data-lang-fr="Les chauffeurs enregistrent leurs collectes quotidiennes dans l'application. Vous êtes notifié quand ils signalent. Vous pouvez confirmer, questionner ou signaler des montants inhabituels depuis votre téléphone.">Drivers log their daily collections in the app. You get notified when they report. You can confirm, question, or flag unusual amounts from your phone.</span></p>
				</div>
			</div>
			<div class="mv2-routine-item">
				<div class="mv2-routine-item__time">Evening</div>
				<div class="mv2-routine-item__content">
					<h3><span data-lang-en="Reconciliation" data-lang-fr="Rapprochement">Reconciliation</span></h3>
					<p><span data-lang-en="Review the day's collections. See which vehicles met their target, which fell short, and whether any have outstanding disputes. All in under 5 minutes."
					         data-lang-fr="Examinez les collectes de la journée. Voyez quels véhicules ont atteint leur objectif, lesquels sont restés en deçà, et s'il y a des litiges en suspens. Le tout en moins de 5 minutes.">Review the day's collections. See which vehicles met their target, which fell short, and whether any have outstanding disputes. All in under 5 minutes.</span></p>
				</div>
			</div>
			<div class="mv2-routine-item">
				<div class="mv2-routine-item__time">End of month</div>
				<div class="mv2-routine-item__content">
					<h3><span data-lang-en="Full summary" data-lang-fr="Résumé complet">Full summary</span></h3>
					<p><span data-lang-en="Generate a full monthly report — total collected, per-vehicle performance, driver compliance record. Use it for financial planning, bank applications, or insurance."
					         data-lang-fr="Générez un rapport mensuel complet — total collecté, performance par véhicule, dossier de conformité des chauffeurs. Utilisez-le pour la planification financière, les demandes bancaires ou les assurances.">Generate a full monthly report — total collected, per-vehicle performance, driver compliance record. Use it for financial planning, bank applications, or insurance.</span></p>
				</div>
			</div>
		</div>
	</div>
</section>

<?php get_template_part( 'parts/home/product-intro' ); ?>
<?php get_template_part( 'parts/home/before-after' ); ?>
<?php get_template_part( 'parts/home/pricing' ); ?>
<?php get_template_part( 'parts/home/lead-capture' ); ?>
<?php get_template_part( 'parts/global/cta-band' ); ?>
<?php get_footer(); ?>
