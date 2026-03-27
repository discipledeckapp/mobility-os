<?php
/**
 * Template Name: For Investors
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
			<div class="mv2-badge mv2-badge--amber">
				<span data-lang-en="For Investors" data-lang-fr="Pour les investisseurs">For Investors</span>
			</div>
			<h1 class="mv2-page-hero__title">
				<span data-lang-en="You bought the vehicles. Make sure you receive the money."
				      data-lang-fr="Vous avez acheté les véhicules. Assurez-vous de recevoir l'argent.">You bought the vehicles. Make sure you receive the money.</span>
			</h1>
			<p class="mv2-page-hero__subtitle">
				<span data-lang-en="Passive transport investment only works when you can see what's happening with your fleet every day — without being there. Mobiris is the remote visibility layer your investment needs."
				      data-lang-fr="L'investissement passif dans le transport ne fonctionne que lorsque vous pouvez voir ce qui se passe avec votre flotte chaque jour — sans y être. Mobiris est la couche de visibilité à distance dont votre investissement a besoin.">Passive transport investment only works when you can see what's happening with your fleet every day — without being there. Mobiris is the remote visibility layer your investment needs.</span>
			</p>
			<div class="mv2-page-hero__ctas">
				<a href="<?php echo esc_url( mv2_app_url() ); ?>" class="mv2-btn mv2-btn--primary mv2-btn--lg" target="_blank" rel="noopener noreferrer">
					<span data-lang-en="Start Free Trial" data-lang-fr="Commencer l'essai gratuit">Start Free Trial</span>
				</a>
				<a href="<?php echo esc_url( mv2_wa_url( 'I want to see how Mobiris works for investors' ) ); ?>" class="mv2-btn mv2-btn--wa mv2-btn--lg" target="_blank" rel="noopener noreferrer">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
					<span data-lang-en="Talk to us" data-lang-fr="Parlez-nous">Talk to us</span>
				</a>
			</div>
		</div>
	</div>
</section>

<!-- The Passive Income Problem -->
<section class="mv2-section mv2-section--light">
	<div class="mv2-container">
		<div class="mv2-section-header">
			<h2 class="mv2-section-title">
				<span data-lang-en="The challenge with passive transport investment" data-lang-fr="Le défi de l'investissement passif dans le transport">The challenge with passive transport investment</span>
			</h2>
		</div>
		<div class="mv2-investor-challenges">
			<div class="mv2-investor-challenge">
				<div class="mv2-investor-challenge__icon">
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
				</div>
				<h3><span data-lang-en="You can't be there every day" data-lang-fr="Vous ne pouvez pas être là tous les jours">You can't be there every day</span></h3>
				<p><span data-lang-en="You have a job, other businesses, or other responsibilities. You can't physically check every vehicle and every driver daily. Without visibility, you're relying on honesty from people who have no accountability mechanism."
				         data-lang-fr="Vous avez un emploi, d'autres activités ou d'autres responsabilités. Vous ne pouvez pas vérifier physiquement chaque véhicule et chaque chauffeur quotidiennement. Sans visibilité, vous comptez sur l'honnêteté de personnes qui n'ont aucun mécanisme de responsabilité.">You have a job, other businesses, or other responsibilities. You can't physically check every vehicle and every driver daily. Without visibility, you're relying on honesty from people who have no accountability mechanism.</span></p>
			</div>
			<div class="mv2-investor-challenge">
				<div class="mv2-investor-challenge__icon">
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
				</div>
				<h3><span data-lang-en="Remittance is inconsistent" data-lang-fr="Les remises sont irrégulières">Remittance is inconsistent</span></h3>
				<p><span data-lang-en="Some months the money is good. Other months drivers say the route was bad, the vehicle had issues, or passengers weren't paying. Without a record, you can't tell what's real and what's an excuse."
				         data-lang-fr="Certains mois, l'argent est bon. D'autres mois, les chauffeurs disent que le trajet était mauvais, que le véhicule avait des problèmes ou que les passagers ne payaient pas. Sans enregistrement, vous ne pouvez pas distinguer ce qui est réel d'une excuse.">Some months the money is good. Other months drivers say the route was bad, the vehicle had issues, or passengers weren't paying. Without a record, you can't tell what's real and what's an excuse.</span></p>
			</div>
			<div class="mv2-investor-challenge">
				<div class="mv2-investor-challenge__icon">
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
				</div>
				<h3><span data-lang-en="Driver risk is hard to assess" data-lang-fr="Le risque du chauffeur est difficile à évaluer">Driver risk is hard to assess</span></h3>
				<p><span data-lang-en="You trust a manager to hire drivers. But without biometric verification and background checks, you have no idea who is actually behind the wheel of a vehicle you paid millions for."
				         data-lang-fr="Vous faites confiance à un manager pour embaucher des chauffeurs. Mais sans vérification biométrique et vérification des antécédents, vous n'avez aucune idée de qui est réellement derrière le volant d'un véhicule pour lequel vous avez payé des millions.">You trust a manager to hire drivers. But without biometric verification and background checks, you have no idea who is actually behind the wheel of a vehicle you paid millions for.</span></p>
			</div>
		</div>
	</div>
</section>

<!-- What Mobiris gives investors -->
<section class="mv2-section mv2-section--dark">
	<div class="mv2-container">
		<div class="mv2-section-header mv2-section-header--center mv2-section-header--light">
			<h2 class="mv2-section-title mv2-section-title--light">
				<span data-lang-en="What Mobiris gives you as an investor" data-lang-fr="Ce que Mobiris vous donne en tant qu'investisseur">What Mobiris gives you as an investor</span>
			</h2>
		</div>
		<div class="mv2-investor-benefits">
			<div class="mv2-investor-benefit">
				<div class="mv2-investor-benefit__icon">
					<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
				</div>
				<h3><span data-lang-en="Daily remittance dashboard" data-lang-fr="Tableau de bord quotidien des remises">Daily remittance dashboard</span></h3>
				<p><span data-lang-en="See every vehicle's collection status each day from your phone. No calls required. No chasing drivers. Just open the app."
				         data-lang-fr="Voyez le statut de collecte de chaque véhicule chaque jour depuis votre téléphone. Aucun appel requis. Pas besoin de courir après les chauffeurs. Ouvrez simplement l'application.">See every vehicle's collection status each day from your phone. No calls required. No chasing drivers. Just open the app.</span></p>
			</div>
			<div class="mv2-investor-benefit">
				<div class="mv2-investor-benefit__icon">
					<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
				</div>
				<h3><span data-lang-en="Instant alerts when collections miss" data-lang-fr="Alertes instantanées quand les collectes manquent">Instant alerts when collections miss</span></h3>
				<p><span data-lang-en="Get notified immediately when a driver doesn't report or reports a zero amount. Intervene early before patterns develop."
				         data-lang-fr="Soyez notifié immédiatement quand un chauffeur ne signale pas ou signale un montant nul. Intervenez tôt avant que les habitudes ne se développent.">Get notified immediately when a driver doesn't report or reports a zero amount. Intervene early before patterns develop.</span></p>
			</div>
			<div class="mv2-investor-benefit">
				<div class="mv2-investor-benefit__icon">
					<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
				</div>
				<h3><span data-lang-en="Verified driver records" data-lang-fr="Dossiers de chauffeurs vérifiés">Verified driver records</span></h3>
				<p><span data-lang-en="Know exactly who is driving your vehicles — biometric identity, government ID, guarantor details — all verified, all on record."
				         data-lang-fr="Sachez exactement qui conduit vos véhicules — identité biométrique, pièce d'identité gouvernementale, détails du garant — tout vérifié, tout enregistré.">Know exactly who is driving your vehicles — biometric identity, government ID, guarantor details — all verified, all on record.</span></p>
			</div>
			<div class="mv2-investor-benefit">
				<div class="mv2-investor-benefit__icon">
					<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
				</div>
				<h3><span data-lang-en="Monthly performance reports" data-lang-fr="Rapports de performance mensuels">Monthly performance reports</span></h3>
				<p><span data-lang-en="Export comprehensive records of your fleet's performance for bank loan applications, insurance, or personal financial planning. Your investment is documented."
				         data-lang-fr="Exportez des dossiers complets sur les performances de votre flotte pour les demandes de prêt bancaire, les assurances ou la planification financière personnelle. Votre investissement est documenté.">Export comprehensive records of your fleet's performance for bank loan applications, insurance, or personal financial planning. Your investment is documented.</span></p>
			</div>
		</div>
	</div>
</section>

<!-- Investor Scenario -->
<section class="mv2-section mv2-section--light">
	<div class="mv2-container">
		<div class="mv2-section-header mv2-section-header--center">
			<h2 class="mv2-section-title">
				<span data-lang-en="How this works in practice" data-lang-fr="Comment cela fonctionne en pratique">How this works in practice</span>
			</h2>
		</div>
		<div class="mv2-scenario-card">
			<h3 class="mv2-scenario-card__title">
				<span data-lang-en="An investor with 5 vehicles in Port Harcourt" data-lang-fr="Un investisseur avec 5 véhicules à Port Harcourt">An investor with 5 vehicles in Port Harcourt</span>
			</h3>
			<p><span data-lang-en="She works as a civil servant. She used savings and a personal loan to buy 5 tricycles (keke) which she placed with a manager in Rumuola. Her expected monthly return is ₦390,000–₦780,000 — but she was consistently receiving ₦300,000."
			         data-lang-fr="Elle travaille comme fonctionnaire. Elle a utilisé ses économies et un prêt personnel pour acheter 5 tricycles (keke) qu'elle a placés avec un manager à Rumuola. Son rendement mensuel attendu est de ₦390 000–₦780 000 — mais elle recevait systématiquement ₦300 000.">She works as a civil servant. She used savings and a personal loan to buy 5 tricycles (keke) which she placed with a manager in Rumuola. Her expected monthly return is ₦390,000–₦780,000 — but she was consistently receiving ₦300,000.</span></p>
			<p><span data-lang-en="After setting up Mobiris, driver daily remittance is now recorded in the app. She can see each vehicle's collections from her office. When one driver started reporting ₦2,500 instead of ₦4,500 every day, she could see the pattern immediately and address it — instead of finding out at month's end."
			         data-lang-fr="Après avoir configuré Mobiris, la remise quotidienne des chauffeurs est maintenant enregistrée dans l'application. Elle peut voir les collectes de chaque véhicule depuis son bureau. Quand un chauffeur a commencé à signaler ₦2 500 au lieu de ₦4 500 chaque jour, elle a pu voir le schéma immédiatement et y remédier — au lieu de le découvrir en fin de mois.">After setting up Mobiris, driver daily remittance is now recorded in the app. She can see each vehicle's collections from her office. When one driver started reporting ₦2,500 instead of ₦4,500 every day, she could see the pattern immediately and address it — instead of finding out at month's end.</span></p>
			<div class="mv2-scenario-card__key">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
				<span data-lang-en="This is what Mobiris makes possible for investors." data-lang-fr="C'est ce que Mobiris rend possible pour les investisseurs.">This is what Mobiris makes possible for investors.</span>
			</div>
		</div>
	</div>
</section>

<?php get_template_part( 'parts/home/calculator' ); ?>
<?php get_template_part( 'parts/home/pricing' ); ?>
<?php get_template_part( 'parts/home/lead-capture' ); ?>
<?php get_template_part( 'parts/global/cta-band' ); ?>
<?php get_footer(); ?>
