<?php
$starter_price  = mv2_opt('price_starter',  '15,000');
$growth_price   = mv2_opt('price_growth',   '35,000');
$growth_per_v   = mv2_opt('price_growth_per_vehicle', '1,500');
$verify_price   = mv2_opt('price_verify',   '1,000');
$signup_url     = mv2_signup_url();
?>
<section class="mv2-section mv2-section--white mv2-pricing" id="mv2-pricing" aria-label="Pricing">
  <div class="mv2-container">
    <div class="mv2-section-header mv2-section-header--center">
      <h2 data-lang-en="Simple, transparent pricing"
          data-lang-fr="Tarification simple et transparente">Simple, transparent pricing</h2>
      <p data-lang-en="No hidden fees. Pay for what you use. Cancel anytime."
         data-lang-fr="Pas de frais cachés. Payez ce que vous utilisez. Annulez à tout moment.">
        No hidden fees. Pay for what you use. Cancel anytime.
      </p>
    </div>
    <div class="mv2-pricing__grid">
      <div class="mv2-pricing__card">
        <div class="mv2-pricing__plan-name"
             data-lang-en="Starter" data-lang-fr="Starter">Starter</div>
        <div class="mv2-pricing__amount">₦<?php echo esc_html($starter_price); ?><span>/mo</span></div>
        <p class="mv2-pricing__desc"
           data-lang-en="For operators just getting organised. Up to 10 vehicles."
           data-lang-fr="Pour les opérateurs qui commencent à s'organiser. Jusqu'à 10 véhicules.">
          For operators just getting organised. Up to 10 vehicles.
        </p>
        <ul class="mv2-pricing__features">
          <li data-lang-en="Up to 10 vehicles" data-lang-fr="Jusqu'à 10 véhicules">Up to 10 vehicles</li>
          <li data-lang-en="Unlimited drivers" data-lang-fr="Conducteurs illimités">Unlimited drivers</li>
          <li data-lang-en="Daily remittance ledger" data-lang-fr="Grand livre de remises quotidien">Daily remittance ledger</li>
          <li data-lang-en="Driver verification records" data-lang-fr="Dossiers de vérification des conducteurs">Driver verification records</li>
          <li data-lang-en="Vehicle compliance tracking" data-lang-fr="Suivi de la conformité des véhicules">Vehicle compliance tracking</li>
          <li data-lang-en="Mobile + web access" data-lang-fr="Accès mobile + web">Mobile + web access</li>
        </ul>
        <a href="<?php echo esc_url($signup_url); ?>" class="mv2-btn mv2-btn--outline mv2-btn--full">
          <span data-lang-en="Start free — 14 days" data-lang-fr="Commencer — 14 jours gratuits">Start free — 14 days</span>
        </a>
      </div>

      <div class="mv2-pricing__card mv2-pricing__card--featured">
        <div class="mv2-pricing__badge"
             data-lang-en="Most popular" data-lang-fr="Plus populaire">Most popular</div>
        <div class="mv2-pricing__plan-name"
             data-lang-en="Growth" data-lang-fr="Croissance">Growth</div>
        <div class="mv2-pricing__amount">
          ₦<?php echo esc_html($growth_price); ?><span>/mo</span>
        </div>
        <div class="mv2-pricing__subprice"
             data-lang-en="+ ₦<?php echo esc_html($growth_per_v); ?>/vehicle above 10"
             data-lang-fr="+ ₦<?php echo esc_html($growth_per_v); ?>/véhicule au-delà de 10">
          + ₦<?php echo esc_html($growth_per_v); ?>/vehicle above 10
        </div>
        <p class="mv2-pricing__desc"
           data-lang-en="For serious fleet operators building a real business."
           data-lang-fr="Pour les opérateurs de flotte sérieux qui construisent une vraie entreprise.">
          For serious fleet operators building a real business.
        </p>
        <ul class="mv2-pricing__features">
          <li data-lang-en="Unlimited vehicles" data-lang-fr="Véhicules illimités">Unlimited vehicles</li>
          <li data-lang-en="Unlimited drivers" data-lang-fr="Conducteurs illimités">Unlimited drivers</li>
          <li data-lang-en="Everything in Starter" data-lang-fr="Tout ce qui est dans Starter">Everything in Starter</li>
          <li data-lang-en="Fleet performance analytics" data-lang-fr="Analytique de performance de flotte">Fleet performance analytics</li>
          <li data-lang-en="Multi-user access (operator + manager)" data-lang-fr="Accès multi-utilisateurs (opérateur + gestionnaire)">Multi-user access (operator + manager)</li>
          <li data-lang-en="Driver risk intelligence" data-lang-fr="Intelligence sur le risque des conducteurs">Driver risk intelligence</li>
          <li data-lang-en="Priority WhatsApp support" data-lang-fr="Support WhatsApp prioritaire">Priority WhatsApp support</li>
        </ul>
        <a href="<?php echo esc_url($signup_url); ?>" class="mv2-btn mv2-btn--primary mv2-btn--full">
          <span data-lang-en="Start free — 14 days" data-lang-fr="Commencer — 14 jours gratuits">Start free — 14 days</span>
        </a>
      </div>

      <div class="mv2-pricing__card mv2-pricing__card--addon">
        <div class="mv2-pricing__plan-name"
             data-lang-en="Verification add-on" data-lang-fr="Module de vérification">Verification add-on</div>
        <div class="mv2-pricing__amount">₦<?php echo esc_html($verify_price); ?><span>/check</span></div>
        <p class="mv2-pricing__desc"
           data-lang-en="For operators who need identity verification against national databases."
           data-lang-fr="Pour les opérateurs qui ont besoin de vérification d'identité contre les bases de données nationales.">
          For operators who need identity verification against national databases.
        </p>
        <ul class="mv2-pricing__features">
          <li data-lang-en="NIN / BVN verification" data-lang-fr="Vérification NIN / BVN">NIN / BVN verification</li>
          <li data-lang-en="Driver's licence validation" data-lang-fr="Validation du permis de conduire">Driver's licence validation</li>
          <li data-lang-en="Pay only for what you use" data-lang-fr="Ne payez que ce que vous utilisez">Pay only for what you use</li>
        </ul>
        <a href="<?php echo esc_url(mv2_wa_url('whatsapp_msg_general')); ?>"
           class="mv2-btn mv2-btn--outline mv2-btn--full" target="_blank" rel="noopener noreferrer">
          <span data-lang-en="Ask us about verification" data-lang-fr="Renseignez-vous sur la vérification">Ask us about verification</span>
        </a>
      </div>
    </div>
    <p class="mv2-pricing__note"
       data-lang-en="All plans include a 14-day free trial. No card required to start."
       data-lang-fr="Tous les forfaits incluent un essai gratuit de 14 jours. Aucune carte requise pour commencer.">
      All plans include a 14-day free trial. No card required to start.
    </p>
  </div>
</section>
