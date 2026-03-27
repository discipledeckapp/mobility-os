<?php
/**
 * Lead Capture Section
 *
 * Captures operator name, phone, email, and vehicle count.
 * Stores as 'mobiris_lead' custom post type via AJAX.
 * Bilingual: English + French.
 *
 * @package Mobiris
 * @since 1.0.0
 */
?>

<section class="lead-capture-section section" id="get-started" aria-label="Get started">
	<div class="container lead-capture-container">

		<div class="lead-capture-copy">
			<span class="eyebrow"
				data-lang-en="Get early access"
				data-lang-fr="Accès anticipé">
				Get early access
			</span>
			<h2 class="section-title"
				data-lang-en="Ready to stop the leakage? Let's talk."
				data-lang-fr="Prêt à arrêter la fuite? Parlons-en.">
				Ready to stop the leakage? Let's talk.
			</h2>
			<p class="lead-capture-copy__body"
				data-lang-en="Leave your details and we'll reach out within 24 hours — via WhatsApp or call. No sales pitch. Just a conversation about your fleet."
				data-lang-fr="Laissez vos coordonnées et nous vous contacterons dans les 24 heures — par WhatsApp ou appel. Pas de discours commercial. Juste une conversation sur votre flotte.">
				Leave your details and we'll reach out within 24 hours — via WhatsApp or call. No sales pitch. Just a conversation about your fleet.
			</p>
			<ul class="lead-capture-copy__benefits">
				<li data-lang-en="Free 14-day trial — no card needed" data-lang-fr="Essai gratuit 14 jours — aucune carte requise">Free 14-day trial — no card needed</li>
				<li data-lang-en="Onboarding support included" data-lang-fr="Support d'intégration inclus">Onboarding support included</li>
				<li data-lang-en="Your first 5 driver verifications are on us" data-lang-fr="Vos 5 premières vérifications de conducteurs sont offertes">Your first 5 driver verifications are on us</li>
			</ul>

			<div class="lead-capture-social-proof">
				<span class="social-proof-faces" aria-hidden="true">
					<span class="face face--1"></span>
					<span class="face face--2"></span>
					<span class="face face--3"></span>
				</span>
				<span class="social-proof-text"
					data-lang-en="Operators across Nigeria and Ghana are already using Mobiris."
					data-lang-fr="Des opérateurs au Nigeria et au Ghana utilisent déjà Mobiris.">
					Operators across Nigeria and Ghana are already using Mobiris.
				</span>
			</div>
		</div>

		<div class="lead-capture-form-wrap">
			<form
				id="lead-capture-form"
				class="lead-form"
				novalidate
				data-action="mobiris_save_lead"
			>
				<?php wp_nonce_field( 'mobiris_lead_nonce', 'lead_nonce' ); ?>

				<div class="lead-form__field">
					<label class="lead-form__label" for="lead-name"
						data-lang-en="Your name"
						data-lang-fr="Votre nom">
						Your name <span aria-hidden="true">*</span>
					</label>
					<input
						type="text"
						id="lead-name"
						name="lead_name"
						class="lead-form__input"
						placeholder="Emeka Okafor"
						required
						autocomplete="name"
					/>
				</div>

				<div class="lead-form__field">
					<label class="lead-form__label" for="lead-phone"
						data-lang-en="WhatsApp / phone number"
						data-lang-fr="WhatsApp / numéro de téléphone">
						WhatsApp / phone number <span aria-hidden="true">*</span>
					</label>
					<input
						type="tel"
						id="lead-phone"
						name="lead_phone"
						class="lead-form__input"
						placeholder="+234 800 000 0000"
						required
						autocomplete="tel"
						inputmode="tel"
					/>
				</div>

				<div class="lead-form__field">
					<label class="lead-form__label" for="lead-email"
						data-lang-en="Email address"
						data-lang-fr="Adresse e-mail">
						Email address
					</label>
					<input
						type="email"
						id="lead-email"
						name="lead_email"
						class="lead-form__input"
						placeholder="emeka@yourcompany.ng"
						autocomplete="email"
						inputmode="email"
					/>
				</div>

				<div class="lead-form__field">
					<label class="lead-form__label" for="lead-vehicles"
						data-lang-en="How many vehicles do you operate?"
						data-lang-fr="Combien de véhicules opérez-vous?">
						How many vehicles? <span aria-hidden="true">*</span>
					</label>
					<input
						type="number"
						id="lead-vehicles"
						name="lead_vehicles"
						class="lead-form__input"
						placeholder="e.g. 25"
						min="1"
						required
						inputmode="numeric"
					/>
				</div>

				<div class="lead-form__field">
					<label class="lead-form__label" for="lead-country"
						data-lang-en="Country"
						data-lang-fr="Pays">
						Country
					</label>
					<select id="lead-country" name="lead_country" class="lead-form__input lead-form__select">
						<option value="">Select country</option>
						<option value="NG">Nigeria</option>
						<option value="GH">Ghana</option>
						<option value="KE">Kenya</option>
						<option value="ZA">South Africa</option>
						<option value="other">Other</option>
					</select>
				</div>

				<div class="lead-form__submit-wrap">
					<button type="submit" class="btn btn-primary btn-lg btn-block lead-form__submit"
						data-lang-en="Get in touch — we'll call you"
						data-lang-fr="Contactez-nous — nous vous appellerons">
						Get in touch — we'll call you
					</button>
					<p class="lead-form__privacy"
						data-lang-en="Your details are never sold or shared. We'll only contact you about Mobiris."
						data-lang-fr="Vos coordonnées ne sont jamais vendues ni partagées. Nous vous contacterons uniquement concernant Mobiris.">
						Your details are never sold or shared. We'll only contact you about Mobiris.
					</p>
				</div>

				<!-- Status messages -->
				<div class="lead-form__status" role="alert" aria-live="polite" hidden>
					<div class="lead-form__success" hidden>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#16A34A"/><path d="M7 12l4 4 6-6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
						<p data-lang-en="Got it! We'll reach you on WhatsApp or phone within 24 hours." data-lang-fr="Reçu! Nous vous contacterons par WhatsApp ou téléphone dans les 24 heures.">
							Got it! We'll reach you on WhatsApp or phone within 24 hours.
						</p>
					</div>
					<div class="lead-form__error" hidden>
						<p data-lang-en="Something went wrong. Please try again or WhatsApp us directly." data-lang-fr="Quelque chose s'est mal passé. Veuillez réessayer ou nous envoyer un message WhatsApp directement.">
							Something went wrong. Please try again or WhatsApp us directly.
						</p>
					</div>
				</div>

			</form><!-- .lead-form -->
		</div>

	</div>
</section>
