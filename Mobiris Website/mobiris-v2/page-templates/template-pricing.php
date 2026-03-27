<?php
/**
 * Template Name: Pricing
 * Template Post Type: page
 *
 * Full pricing page with FAQ.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$trial_days = (int) mv2_option( 'price_trial_days', 14 );
?>
<section class="mv2-section mv2-section--dark-navy mv2-page-hero mv2-page-hero--sm">
	<div class="mv2-container">
		<div class="mv2-page-hero__inner">
			<h1 class="mv2-page-hero__title">
				<span data-lang-en="Transparent pricing. No surprises." data-lang-fr="Tarification transparente. Pas de surprises.">Transparent pricing. No surprises.</span>
			</h1>
			<p class="mv2-page-hero__subtitle">
				<span data-lang-en="<?php echo esc_html( $trial_days ); ?>-day free trial on all plans. No card required. Cancel anytime."
				      data-lang-fr="Essai gratuit de <?php echo esc_html( $trial_days ); ?> jours sur tous les forfaits. Sans carte bancaire. Annulez à tout moment."><?php echo esc_html( $trial_days ); ?>-day free trial on all plans. No card required. Cancel anytime.</span>
			</p>
		</div>
	</div>
</section>

<?php get_template_part( 'parts/home/pricing' ); ?>

<!-- FAQ Section -->
<section class="mv2-section mv2-section--light">
	<div class="mv2-container mv2-container--narrow">
		<div class="mv2-section-header mv2-section-header--center">
			<h2 class="mv2-section-title">
				<span data-lang-en="Pricing FAQ" data-lang-fr="FAQ sur les tarifs">Pricing FAQ</span>
			</h2>
		</div>

		<div class="mv2-faq-list" role="list">

			<div class="mv2-faq-item" role="listitem">
				<button class="mv2-faq-item__question" aria-expanded="false">
					<span data-lang-en="What happens after the 14-day free trial?" data-lang-fr="Que se passe-t-il après l'essai gratuit de 14 jours ?">What happens after the 14-day free trial?</span>
					<svg class="mv2-faq-item__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
				</button>
				<div class="mv2-faq-item__answer">
					<p><span data-lang-en="You'll be asked to select a paid plan to continue. We'll notify you before your trial ends. If you don't upgrade, your account is paused — your data is retained for 30 days so you can reactivate without losing anything."
					         data-lang-fr="On vous demandera de sélectionner un forfait payant pour continuer. Nous vous avertirons avant la fin de votre essai. Si vous ne passez pas à un plan supérieur, votre compte est suspendu — vos données sont conservées pendant 30 jours.">You'll be asked to select a paid plan to continue. We'll notify you before your trial ends. If you don't upgrade, your account is paused — your data is retained for 30 days so you can reactivate without losing anything.</span></p>
				</div>
			</div>

			<div class="mv2-faq-item" role="listitem">
				<button class="mv2-faq-item__question" aria-expanded="false">
					<span data-lang-en="What are the identity verification fees for?" data-lang-fr="À quoi servent les frais de vérification d'identité ?">What are the identity verification fees for?</span>
					<svg class="mv2-faq-item__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
				</button>
				<div class="mv2-faq-item__answer">
					<p><span data-lang-en="The ₦1,000/check fee covers the cost of running a government ID verification — NIN (NIMC), BVN (CBN), or Ghana Card. This is a real-cost service provided by our verification partners. You only pay when you verify a new driver. The same driver verified once doesn't incur another charge unless their records need to be re-verified."
					         data-lang-fr="Les frais de ₦1 000/vérification couvrent le coût d'une vérification d'identité gouvernementale — NIN (NIMC), BVN (CBN) ou Carte Ghana. C'est un service à coût réel fourni par nos partenaires de vérification.">The ₦1,000/check fee covers the cost of running a government ID verification — NIN (NIMC), BVN (CBN), or Ghana Card. This is a real-cost service provided by our verification partners. You only pay when you verify a new driver. The same driver verified once doesn't incur another charge unless their records need to be re-verified.</span></p>
				</div>
			</div>

			<div class="mv2-faq-item" role="listitem">
				<button class="mv2-faq-item__question" aria-expanded="false">
					<span data-lang-en="Can I add more vehicles and change plans?" data-lang-fr="Puis-je ajouter des véhicules et changer de forfait ?">Can I add more vehicles and change plans?</span>
					<svg class="mv2-faq-item__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
				</button>
				<div class="mv2-faq-item__answer">
					<p><span data-lang-en="Yes. You can upgrade from Starter to Growth at any time. If you add more than 10 vehicles on the Starter plan, you'll be prompted to upgrade. Downgrading is also possible, subject to your vehicle count."
					         data-lang-fr="Oui. Vous pouvez passer de Débutant à Croissance à tout moment. Si vous ajoutez plus de 10 véhicules avec le forfait Débutant, vous serez invité à passer à un plan supérieur. Le rétrogradage est également possible, selon votre nombre de véhicules.">Yes. You can upgrade from Starter to Growth at any time. If you add more than 10 vehicles on the Starter plan, you'll be prompted to upgrade. Downgrading is also possible, subject to your vehicle count.</span></p>
				</div>
			</div>

			<div class="mv2-faq-item" role="listitem">
				<button class="mv2-faq-item__question" aria-expanded="false">
					<span data-lang-en="How do I pay? Is it secure?" data-lang-fr="Comment puis-je payer ? Est-ce sécurisé ?">How do I pay? Is it secure?</span>
					<svg class="mv2-faq-item__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
				</button>
				<div class="mv2-faq-item__answer">
					<p><span data-lang-en="Payment is processed via card or bank transfer in Naira. All payments are processed securely. We use PCI-compliant payment processors. No card details are stored on Mobiris servers."
					         data-lang-fr="Le paiement est traité par carte ou virement bancaire en Naira. Tous les paiements sont traités en toute sécurité. Nous utilisons des processeurs de paiement conformes PCI.">Payment is processed via card or bank transfer in Naira. All payments are processed securely. We use PCI-compliant payment processors. No card details are stored on Mobiris servers.</span></p>
				</div>
			</div>

			<div class="mv2-faq-item" role="listitem">
				<button class="mv2-faq-item__question" aria-expanded="false">
					<span data-lang-en="What if I want to cancel?" data-lang-fr="Que faire si je veux annuler ?">What if I want to cancel?</span>
					<svg class="mv2-faq-item__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
				</button>
				<div class="mv2-faq-item__answer">
					<p><span data-lang-en="Cancel anytime from your account settings or by messaging us on WhatsApp. Your account remains active until the end of the billing period. You can export all your data before cancelling."
					         data-lang-fr="Annulez à tout moment depuis les paramètres de votre compte ou en nous envoyant un message sur WhatsApp. Votre compte reste actif jusqu'à la fin de la période de facturation.">Cancel anytime from your account settings or by messaging us on WhatsApp. Your account remains active until the end of the billing period. You can export all your data before cancelling.</span></p>
				</div>
			</div>

			<div class="mv2-faq-item" role="listitem">
				<button class="mv2-faq-item__question" aria-expanded="false">
					<span data-lang-en="Is there a discount for annual payment?" data-lang-fr="Y a-t-il une remise pour un paiement annuel ?">Is there a discount for annual payment?</span>
					<svg class="mv2-faq-item__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
				</button>
				<div class="mv2-faq-item__answer">
					<p><span data-lang-en="Annual billing is available with a 15% discount. Contact us on WhatsApp to set this up after your trial."
					         data-lang-fr="La facturation annuelle est disponible avec une remise de 15 %. Contactez-nous sur WhatsApp pour configurer cela après votre essai.">Annual billing is available with a 15% discount. Contact us on WhatsApp to set this up after your trial.</span></p>
				</div>
			</div>

		</div>
	</div>
</section>

<?php get_template_part( 'parts/home/lead-capture' ); ?>
<?php get_template_part( 'parts/global/cta-band' ); ?>
<?php get_footer(); ?>
