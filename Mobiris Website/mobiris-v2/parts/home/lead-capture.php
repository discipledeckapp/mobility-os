<?php
/**
 * Homepage: Lead Capture Form.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<section class="mv2-section mv2-section--dark-navy mv2-lead-capture" id="mv2-lead-capture">
	<div class="mv2-container">
		<div class="mv2-lead-inner">

			<!-- Lead Copy -->
			<div class="mv2-lead-copy">
				<div class="mv2-badge mv2-badge--primary">
					<span data-lang-en="Get in touch" data-lang-fr="Contactez-nous">Get in touch</span>
				</div>
				<h2 class="mv2-lead-copy__title">
					<span data-lang-en="Let's talk about your fleet."
					      data-lang-fr="Parlons de votre flotte.">Let's talk about your fleet.</span>
				</h2>
				<p class="mv2-lead-copy__subtitle">
					<span data-lang-en="Leave your details. We'll reach out within 24 hours — via WhatsApp or phone. No sales pitch, just a real conversation about what your fleet needs."
					      data-lang-fr="Laissez vos coordonnées. Nous vous contacterons dans les 24 heures — via WhatsApp ou par téléphone. Pas de discours commercial, juste une vraie conversation sur ce dont votre flotte a besoin.">
						Leave your details. We'll reach out within 24 hours — via WhatsApp or phone. No sales pitch, just a real conversation about what your fleet needs.
					</span>
				</p>

				<!-- Trust Points -->
				<ul class="mv2-lead-trust-list">
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="We call or WhatsApp within 24 hours" data-lang-fr="Nous appelons ou WhatsApp dans les 24 heures">We call or WhatsApp within 24 hours</span>
					</li>
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="14-day free trial — no card required" data-lang-fr="14 jours d'essai gratuit — sans carte bancaire">14-day free trial — no card required</span>
					</li>
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="Your data is protected under NDPA 2023" data-lang-fr="Vos données sont protégées par la NDPA 2023">Your data is protected under NDPA 2023</span>
					</li>
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="Set up your entire fleet in under 1 hour" data-lang-fr="Configurez toute votre flotte en moins d'1 heure">Set up your entire fleet in under 1 hour</span>
					</li>
				</ul>
			</div>

			<!-- Lead Form -->
			<div class="mv2-lead-form-wrap">
				<form class="mv2-lead-form" id="mv2-lead-form" novalidate>
					<?php wp_nonce_field( 'mv2_lead_nonce', 'mv2_lead_nonce_field' ); ?>

					<div class="mv2-form-row mv2-form-row--2col">
						<!-- Name -->
						<div class="mv2-form-field">
							<label for="lead-name" class="mv2-form-label">
								<span data-lang-en="Your name" data-lang-fr="Votre nom">Your name</span>
								<span class="mv2-form-required" aria-label="<?php esc_attr_e( 'required', 'mobiris-v2' ); ?>">*</span>
							</label>
							<input type="text"
							       id="lead-name"
							       name="lead_name"
							       class="mv2-form-input"
							       autocomplete="name"
							       required
							       aria-required="true"
							       placeholder="<?php esc_attr_e( 'Adewale Okafor', 'mobiris-v2' ); ?>">
							<div class="mv2-form-error" role="alert"></div>
						</div>

						<!-- Phone -->
						<div class="mv2-form-field">
							<label for="lead-phone" class="mv2-form-label">
								<span data-lang-en="Phone / WhatsApp" data-lang-fr="Téléphone / WhatsApp">Phone / WhatsApp</span>
								<span class="mv2-form-required" aria-label="<?php esc_attr_e( 'required', 'mobiris-v2' ); ?>">*</span>
							</label>
							<input type="tel"
							       id="lead-phone"
							       name="lead_phone"
							       class="mv2-form-input"
							       autocomplete="tel"
							       required
							       aria-required="true"
							       placeholder="08012345678">
							<div class="mv2-form-error" role="alert"></div>
						</div>
					</div>

					<div class="mv2-form-row mv2-form-row--2col">
						<!-- Email -->
						<div class="mv2-form-field">
							<label for="lead-email" class="mv2-form-label">
								<span data-lang-en="Email (optional)" data-lang-fr="Email (facultatif)">Email (optional)</span>
							</label>
							<input type="email"
							       id="lead-email"
							       name="lead_email"
							       class="mv2-form-input"
							       autocomplete="email"
							       placeholder="you@example.com">
						</div>

						<!-- Vehicles -->
						<div class="mv2-form-field">
							<label for="lead-vehicles" class="mv2-form-label">
								<span data-lang-en="How many vehicles?" data-lang-fr="Combien de véhicules ?">How many vehicles?</span>
							</label>
							<input type="number"
							       id="lead-vehicles"
							       name="lead_vehicles"
							       class="mv2-form-input"
							       min="1"
							       max="10000"
							       placeholder="10">
						</div>
					</div>

					<!-- Business Stage -->
					<div class="mv2-form-field">
						<fieldset>
							<legend class="mv2-form-label">
								<span data-lang-en="Where are you in your business?" data-lang-fr="Où en êtes-vous dans votre activité ?">Where are you in your business?</span>
							</legend>
							<div class="mv2-stage-btns" role="group">
								<label class="mv2-stage-btn">
									<input type="radio" name="lead_stage" value="running" class="mv2-stage-btn__input">
									<span class="mv2-stage-btn__label">
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
										<span data-lang-en="My fleet is running" data-lang-fr="Ma flotte est en activité">My fleet is running</span>
									</span>
								</label>
								<label class="mv2-stage-btn">
									<input type="radio" name="lead_stage" value="starting" class="mv2-stage-btn__input">
									<span class="mv2-stage-btn__label">
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
										<span data-lang-en="I'm starting a transport business" data-lang-fr="Je démarre une activité de transport">I'm starting a transport business</span>
									</span>
								</label>
								<label class="mv2-stage-btn">
									<input type="radio" name="lead_stage" value="investing" class="mv2-stage-btn__input">
									<span class="mv2-stage-btn__label">
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
										<span data-lang-en="I'm investing in transport vehicles" data-lang-fr="J'investis dans des véhicules de transport">I'm investing in transport vehicles</span>
									</span>
								</label>
							</div>
						</fieldset>
					</div>

					<!-- Honeypot -->
					<div class="mv2-form-field mv2-form-field--hidden" aria-hidden="true">
						<input type="text" name="mv2_website" tabindex="-1" autocomplete="off">
					</div>

					<!-- Language hidden -->
					<input type="hidden" name="lead_lang" id="lead-lang" value="en">
					<input type="hidden" name="lead_source" value="homepage-lead-form">
					<input type="hidden" name="action" value="mv2_save_lead">
					<input type="hidden" name="nonce" id="mv2-lead-nonce" value="<?php echo esc_attr( wp_create_nonce( 'mv2_ajax' ) ); ?>">

					<!-- Submit -->
					<div class="mv2-form-submit">
						<button type="submit" class="mv2-btn mv2-btn--primary mv2-btn--lg mv2-btn--full" id="mv2-lead-submit">
							<span class="mv2-btn__text" data-lang-en="Get in touch" data-lang-fr="Prendre contact">Get in touch</span>
							<span class="mv2-btn__loading" aria-hidden="true">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mv2-spin"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
							</span>
						</button>
					</div>

					<!-- Form Messages -->
					<div class="mv2-form-message mv2-form-message--success" id="mv2-lead-success" role="status" aria-live="polite" hidden>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<div>
							<strong data-lang-en="Thank you! We'll be in touch within 24 hours." data-lang-fr="Merci ! Nous vous contacterons dans les 24 heures.">Thank you! We'll be in touch within 24 hours.</strong>
							<p>
								<span data-lang-en="Prefer to chat now?" data-lang-fr="Vous préférez discuter maintenant ?">Prefer to chat now?</span>
								<a href="#" id="mv2-wa-after-submit" class="mv2-wa-link" target="_blank" rel="noopener noreferrer">
									<span data-lang-en="Open WhatsApp →" data-lang-fr="Ouvrir WhatsApp →">Open WhatsApp →</span>
								</a>
							</p>
						</div>
					</div>

					<div class="mv2-form-message mv2-form-message--error" id="mv2-lead-error" role="alert" aria-live="assertive" hidden>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
						<span id="mv2-lead-error-text" data-lang-en="Something went wrong. Please try again or chat on WhatsApp." data-lang-fr="Une erreur s'est produite. Veuillez réessayer ou discuter sur WhatsApp.">Something went wrong. Please try again or chat on WhatsApp.</span>
					</div>

				</form>
			</div>

		</div>
	</div>
</section>
