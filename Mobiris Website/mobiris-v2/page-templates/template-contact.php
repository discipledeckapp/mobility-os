<?php
/**
 * Template Name: Contact
 * Template Post Type: page
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
			<h1 class="mv2-page-hero__title">
				<span data-lang-en="Get in touch" data-lang-fr="Contactez-nous">Get in touch</span>
			</h1>
			<p class="mv2-page-hero__subtitle">
				<span data-lang-en="We respond to all enquiries within 24 hours — usually much faster on WhatsApp."
				      data-lang-fr="Nous répondons à toutes les demandes dans les 24 heures — généralement beaucoup plus vite sur WhatsApp.">We respond to all enquiries within 24 hours — usually much faster on WhatsApp.</span>
			</p>
		</div>
	</div>
</section>

<section class="mv2-section mv2-section--light">
	<div class="mv2-container">
		<div class="mv2-contact-layout">

			<!-- Contact Options -->
			<div class="mv2-contact-options">
				<h2><span data-lang-en="How to reach us" data-lang-fr="Comment nous contacter">How to reach us</span></h2>

				<div class="mv2-contact-option mv2-contact-option--wa">
					<div class="mv2-contact-option__icon">
						<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
					</div>
					<div class="mv2-contact-option__content">
						<div class="mv2-contact-option__title">
							<span data-lang-en="WhatsApp (fastest)" data-lang-fr="WhatsApp (le plus rapide)">WhatsApp (fastest)</span>
						</div>
						<p><span data-lang-en="Typical response time: under 2 hours during business hours."
						         data-lang-fr="Temps de réponse typique : moins de 2 heures pendant les heures ouvrables.">Typical response time: under 2 hours during business hours.</span></p>
						<div class="mv2-contact-option__wa-btns">
							<a href="<?php echo esc_url( mv2_wa_url( mv2_option( 'wa_msg_operators', 'I want to reduce leakage in my transport business' ) ) ); ?>" class="mv2-btn mv2-btn--wa" target="_blank" rel="noopener noreferrer">
								<span data-lang-en="I'm a fleet operator" data-lang-fr="Je suis opérateur de flotte">I'm a fleet operator</span>
							</a>
							<a href="<?php echo esc_url( mv2_wa_url( mv2_option( 'wa_msg_investors', 'I want to see how Mobiris works for investors' ) ) ); ?>" class="mv2-btn mv2-btn--wa" target="_blank" rel="noopener noreferrer">
								<span data-lang-en="I'm an investor" data-lang-fr="Je suis un investisseur">I'm an investor</span>
							</a>
							<a href="<?php echo esc_url( mv2_wa_url( 'I have a question about Mobiris' ) ); ?>" class="mv2-btn mv2-btn--wa" target="_blank" rel="noopener noreferrer">
								<span data-lang-en="General enquiry" data-lang-fr="Demande générale">General enquiry</span>
							</a>
						</div>
					</div>
				</div>

				<div class="mv2-contact-option">
					<div class="mv2-contact-option__icon">
						<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
					</div>
					<div class="mv2-contact-option__content">
						<div class="mv2-contact-option__title">Email</div>
						<p><a href="mailto:hello@mobiris.ng">hello@mobiris.ng</a></p>
						<p><span data-lang-en="We aim to respond within 24 hours." data-lang-fr="Nous visons à répondre dans les 24 heures.">We aim to respond within 24 hours.</span></p>
					</div>
				</div>

				<div class="mv2-contact-option">
					<div class="mv2-contact-option__icon">
						<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
					</div>
					<div class="mv2-contact-option__content">
						<div class="mv2-contact-option__title">
							<span data-lang-en="Address" data-lang-fr="Adresse">Address</span>
						</div>
						<p>Growth Figures Limited<br>
						6 Addo-Badore Road, Ajah,<br>
						Lagos, Nigeria</p>
						<p class="mv2-contact-option__note">
							<span data-lang-en="RC1957484 — registered in Nigeria" data-lang-fr="RC1957484 — enregistré au Nigeria">RC1957484 — registered in Nigeria</span>
						</p>
					</div>
				</div>
			</div>

			<!-- Contact Form -->
			<div class="mv2-contact-form-wrap">
				<h2><span data-lang-en="Send us a message" data-lang-fr="Envoyez-nous un message">Send us a message</span></h2>
				<?php get_template_part( 'parts/home/lead-capture' ); ?>
			</div>

		</div>
	</div>
</section>

<?php get_template_part( 'parts/global/cta-band' ); ?>
<?php get_footer(); ?>
