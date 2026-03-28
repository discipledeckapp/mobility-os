<?php $signup_url = mv2_signup_url(); ?>
<section class="mv2-section mv2-section--offwhite mv2-lead" id="mv2-get-started" aria-label="Get started">
  <div class="mv2-container">
    <div class="mv2-lead__layout">
      <div class="mv2-lead__copy">
        <h2 data-lang-en="Get early access + a free fleet assessment"
            data-lang-fr="Obtenez un accès anticipé + une évaluation gratuite de flotte">
          Get early access + a free fleet assessment
        </h2>
        <p data-lang-en="Tell us about your fleet and we'll reach out within 24 hours. We'll walk you through the platform, answer your questions, and help you figure out if Mobiris is right for you."
           data-lang-fr="Parlez-nous de votre flotte et nous vous contacterons dans les 24 heures. Nous vous présenterons la plateforme, répondrons à vos questions et vous aiderons à déterminer si Mobiris vous convient.">
          Tell us about your fleet and we'll reach out within 24 hours. We'll walk you through the platform, answer your questions, and help you figure out if Mobiris is right for you.
        </p>
        <ul class="mv2-lead__perks">
          <li data-lang-en="14-day free trial — no card needed"
              data-lang-fr="Essai gratuit de 14 jours — aucune carte requise">14-day free trial — no card needed</li>
          <li data-lang-en="Personal onboarding via WhatsApp"
              data-lang-fr="Intégration personnelle via WhatsApp">Personal onboarding via WhatsApp</li>
          <li data-lang-en="Free fleet leakage assessment"
              data-lang-fr="Évaluation gratuite des pertes de flotte">Free fleet leakage assessment</li>
        </ul>
      </div>
      <div class="mv2-lead__form-wrap">
        <form class="mv2-lead__form" id="mv2-lead-form" novalidate>
          <?php wp_nonce_field('mv2_lead_nonce', 'mv2_lead_nonce_field'); ?>
          <input type="hidden" name="action" value="mv2_save_lead">

          <div class="mv2-lead__row mv2-lead__row--2">
            <div class="mv2-field">
              <label class="mv2-field__label" for="mv2-lead-name"
                     data-lang-en="Your name *" data-lang-fr="Votre nom *">Your name *</label>
              <input class="mv2-field__input" type="text" id="mv2-lead-name"
                     name="name" autocomplete="name" required>
            </div>
            <div class="mv2-field">
              <label class="mv2-field__label" for="mv2-lead-phone"
                     data-lang-en="WhatsApp / phone *" data-lang-fr="WhatsApp / téléphone *">WhatsApp / phone *</label>
              <input class="mv2-field__input" type="tel" id="mv2-lead-phone"
                     name="phone" autocomplete="tel" required>
            </div>
          </div>

          <div class="mv2-field">
            <label class="mv2-field__label" for="mv2-lead-email"
                   data-lang-en="Email address" data-lang-fr="Adresse email">Email address</label>
            <input class="mv2-field__input" type="email" id="mv2-lead-email"
                   name="email" autocomplete="email">
          </div>

          <div class="mv2-lead__row mv2-lead__row--2">
            <div class="mv2-field">
              <label class="mv2-field__label" for="mv2-lead-vehicles"
                     data-lang-en="Number of vehicles *" data-lang-fr="Nombre de véhicules *">Number of vehicles *</label>
              <select class="mv2-field__input mv2-field__select" id="mv2-lead-vehicles" name="vehicles" required>
                <option value="">Select…</option>
                <option value="1-5">1 – 5</option>
                <option value="6-15">6 – 15</option>
                <option value="16-50">16 – 50</option>
                <option value="51+">51+</option>
              </select>
            </div>
            <div class="mv2-field">
              <label class="mv2-field__label" for="mv2-lead-stage"
                     data-lang-en="Where are you now?" data-lang-fr="Où en êtes-vous ?">Where are you now?</label>
              <select class="mv2-field__input mv2-field__select" id="mv2-lead-stage" name="stage">
                <option value="">Select…</option>
                <option value="exploring"
                        data-lang-en="Just exploring"
                        data-lang-fr="Je découvre">Just exploring</option>
                <option value="evaluating"
                        data-lang-en="Comparing options"
                        data-lang-fr="Je compare des options">Comparing options</option>
                <option value="ready"
                        data-lang-en="Ready to start"
                        data-lang-fr="Prêt à commencer">Ready to start</option>
              </select>
            </div>
          </div>

          <input type="hidden" name="lang" id="mv2-lead-lang" value="en">

          <button type="submit" class="mv2-btn mv2-btn--primary mv2-btn--full" id="mv2-lead-submit">
            <span class="mv2-lead__submit-text"
                  data-lang-en="Send my details — I want early access"
                  data-lang-fr="Envoyer mes coordonnées — Je veux un accès anticipé">
              Send my details — I want early access
            </span>
            <span class="mv2-lead__submit-spinner" aria-hidden="true" hidden>…</span>
          </button>
          <p class="mv2-lead__privacy"
             data-lang-en="We'll only use your details to contact you about Mobiris. No spam."
             data-lang-fr="Nous n'utiliserons vos coordonnées que pour vous contacter au sujet de Mobiris. Pas de spam.">
            We'll only use your details to contact you about Mobiris. No spam.
          </p>
        </form>
        <div class="mv2-lead__success" id="mv2-lead-success" hidden>
          <div class="mv2-lead__success-icon">✓</div>
          <h3 data-lang-en="We've got your details!"
              data-lang-fr="Nous avons vos coordonnées !">We've got your details!</h3>
          <p data-lang-en="We'll reach out within 24 hours. In the meantime, feel free to WhatsApp us directly."
             data-lang-fr="Nous vous contacterons dans les 24 heures. En attendant, n'hésitez pas à nous contacter directement sur WhatsApp.">
            We'll reach out within 24 hours. In the meantime, feel free to WhatsApp us directly.
          </p>
          <a href="<?php echo esc_url(mv2_wa_url('whatsapp_msg_general')); ?>"
             class="mv2-btn mv2-btn--wa" target="_blank" rel="noopener noreferrer">
            <span data-lang-en="Continue on WhatsApp"
                  data-lang-fr="Continuer sur WhatsApp">Continue on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
