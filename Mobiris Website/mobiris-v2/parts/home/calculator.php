<section class="mv2-section mv2-section--dark mv2-calc" id="mv2-calculator" aria-label="Leakage calculator">
  <div class="mv2-container">
    <div class="mv2-section-header mv2-section-header--center mv2-section-header--light">
      <h2 data-lang-en="Calculate how much your fleet could be leaking"
          data-lang-fr="Calculez ce que votre flotte pourrait perdre">
        Calculate how much your fleet could be leaking
      </h2>
      <p data-lang-en="Adjust the inputs below to match your fleet. See what the numbers say."
         data-lang-fr="Ajustez les valeurs ci-dessous pour correspondre à votre flotte. Voyez ce que les chiffres disent.">
        Adjust the inputs below to match your fleet. See what the numbers say.
      </p>
    </div>
    <div class="mv2-calc__card">
      <div class="mv2-calc__inputs">
        <div class="mv2-calc__field">
          <label class="mv2-calc__label"
                 data-lang-en="Vehicle type"
                 data-lang-fr="Type de véhicule">Vehicle type</label>
          <div class="mv2-calc__type-grid" role="group" aria-label="Vehicle type">
            <?php
            $types = [
              ['val'=>'keke',   'label'=>'Keke',   'rate'=>'₦4,500/day'],
              ['val'=>'danfo',  'label'=>'Danfo',  'rate'=>'₦11,250/day'],
              ['val'=>'korope', 'label'=>'Korope', 'rate'=>'₦9,000/day'],
              ['val'=>'matatu', 'label'=>'Matatu', 'rate'=>'₦10,000/day'],
            ];
            foreach ($types as $t) : ?>
              <button class="mv2-calc__type-btn <?php echo $t['val'] === 'danfo' ? 'mv2-calc__type-btn--active' : ''; ?>"
                      data-type="<?php echo esc_attr($t['val']); ?>"
                      type="button">
                <strong><?php echo esc_html($t['label']); ?></strong>
                <small><?php echo esc_html($t['rate']); ?></small>
              </button>
            <?php endforeach; ?>
          </div>
        </div>

        <div class="mv2-calc__field">
          <label class="mv2-calc__label" for="mv2-vehicles"
                 data-lang-en="Number of vehicles"
                 data-lang-fr="Nombre de véhicules">Number of vehicles</label>
          <div class="mv2-calc__range-row">
            <input type="range" id="mv2-vehicles" class="mv2-calc__range"
                   min="1" max="100" value="10" step="1">
            <output class="mv2-calc__range-val" id="mv2-vehicles-val">10</output>
          </div>
        </div>

        <div class="mv2-calc__field">
          <label class="mv2-calc__label" for="mv2-days"
                 data-lang-en="Operating days per month"
                 data-lang-fr="Jours d'exploitation par mois">Operating days per month</label>
          <div class="mv2-calc__range-row">
            <input type="range" id="mv2-days" class="mv2-calc__range"
                   min="20" max="31" value="26" step="1">
            <output class="mv2-calc__range-val" id="mv2-days-val">26</output>
          </div>
        </div>

        <div class="mv2-calc__field">
          <label class="mv2-calc__label" for="mv2-leakage"
                 data-lang-en="Estimated leakage rate (%)"
                 data-lang-fr="Taux de perte estimé (%)">Estimated leakage rate (%)</label>
          <div class="mv2-calc__range-row">
            <input type="range" id="mv2-leakage" class="mv2-calc__range"
                   min="5" max="30" value="12" step="1">
            <output class="mv2-calc__range-val" id="mv2-leakage-val">12%</output>
          </div>
        </div>
      </div>

      <div class="mv2-calc__results" id="mv2-calc-results" aria-live="polite">
        <div class="mv2-calc__result-row">
          <span class="mv2-calc__result-label"
                data-lang-en="Expected monthly revenue"
                data-lang-fr="Revenu mensuel attendu">Expected monthly revenue</span>
          <span class="mv2-calc__result-val" id="mv2-res-revenue">₦0</span>
        </div>
        <div class="mv2-calc__result-row mv2-calc__result-row--highlight">
          <span class="mv2-calc__result-label"
                data-lang-en="Estimated monthly leakage"
                data-lang-fr="Perte mensuelle estimée">Estimated monthly leakage</span>
          <span class="mv2-calc__result-val mv2-calc__result-val--red" id="mv2-res-leakage">₦0</span>
        </div>
        <div class="mv2-calc__result-row">
          <span class="mv2-calc__result-label"
                data-lang-en="Mobiris plan cost"
                data-lang-fr="Coût du forfait Mobiris">Mobiris plan cost</span>
          <span class="mv2-calc__result-val mv2-calc__result-val--muted" id="mv2-res-plan">₦0</span>
        </div>
        <div class="mv2-calc__result-row mv2-calc__result-row--total">
          <span class="mv2-calc__result-label"
                data-lang-en="Recoverable value (net of plan cost)"
                data-lang-fr="Valeur récupérable (net du forfait)">Recoverable value (net of plan cost)</span>
          <span class="mv2-calc__result-val mv2-calc__result-val--green" id="mv2-res-net">₦0</span>
        </div>
        <div class="mv2-calc__roi-bar-wrap">
          <div class="mv2-calc__roi-label"
               data-lang-en="Return on plan cost"
               data-lang-fr="Retour sur le coût du forfait">Return on plan cost</div>
          <div class="mv2-calc__roi-track">
            <div class="mv2-calc__roi-fill" id="mv2-roi-fill" style="width:0%"></div>
          </div>
          <div class="mv2-calc__roi-pct" id="mv2-roi-pct">0×</div>
        </div>
        <div class="mv2-calc__cta">
          <p class="mv2-calc__cta-text"
             data-lang-en="This is an estimate based on industry leakage patterns. Actual results depend on your operations."
             data-lang-fr="Il s'agit d'une estimation basée sur les tendances de perte du secteur. Les résultats réels dépendent de vos opérations.">
            This is an estimate based on industry leakage patterns. Actual results depend on your operations.
          </p>
          <a href="<?php echo esc_url(mv2_wa_url('whatsapp_msg_calculator')); ?>"
             class="mv2-btn mv2-btn--wa" target="_blank" rel="noopener noreferrer"
             id="mv2-calc-wa-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            <span data-lang-en="Send me these numbers on WhatsApp"
                  data-lang-fr="Envoyez-moi ces chiffres sur WhatsApp">Send me these numbers on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
