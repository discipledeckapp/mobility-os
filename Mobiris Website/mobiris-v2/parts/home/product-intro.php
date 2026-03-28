<?php $signup_url = mv2_signup_url(); ?>
<section class="mv2-section mv2-section--white mv2-product-intro" aria-label="What is Mobiris">
  <div class="mv2-container">
    <div class="mv2-product-intro__layout">
      <div class="mv2-product-intro__copy">
        <div class="mv2-badge mv2-badge--blue"
             data-lang-en="The platform"
             data-lang-fr="La plateforme">The platform</div>
        <h2 data-lang-en="Mobiris is how serious transport operators run their business"
            data-lang-fr="Mobiris est la façon dont les opérateurs de transport sérieux gèrent leur activité">
          Mobiris is how serious transport operators run their business
        </h2>
        <p data-lang-en="One platform for remittance tracking, driver management, vehicle compliance, and fleet analytics. Built for operators with 5 to 500 vehicles who want to stop guessing and start knowing."
           data-lang-fr="Une plateforme pour le suivi des remises, la gestion des conducteurs, la conformité des véhicules et l'analyse de flotte. Conçue pour les opérateurs de 5 à 500 véhicules qui veulent arrêter de deviner et commencer à savoir.">
          One platform for remittance tracking, driver management, vehicle compliance, and fleet analytics. Built for operators with 5 to 500 vehicles who want to stop guessing and start knowing.
        </p>
        <ul class="mv2-product-intro__list">
          <li data-lang-en="Log remittance against each driver and vehicle daily"
              data-lang-fr="Enregistrez les remises par conducteur et véhicule chaque jour">Log remittance against each driver and vehicle daily</li>
          <li data-lang-en="Verify driver identity with photo and document records"
              data-lang-fr="Vérifiez l'identité des conducteurs avec photos et documents">Verify driver identity with photo and document records</li>
          <li data-lang-en="Track compliance status for every vehicle in your fleet"
              data-lang-fr="Suivez le statut de conformité de chaque véhicule de votre flotte">Track compliance status for every vehicle in your fleet</li>
          <li data-lang-en="See performance trends by driver, route, and vehicle type"
              data-lang-fr="Visualisez les tendances de performance par conducteur, itinéraire et type de véhicule">See performance trends by driver, route, and vehicle type</li>
          <li data-lang-en="Flag risk patterns before they become losses"
              data-lang-fr="Identifiez les schémas à risque avant qu'ils ne deviennent des pertes">Flag risk patterns before they become losses</li>
        </ul>
        <a href="<?php echo esc_url($signup_url); ?>" class="mv2-btn mv2-btn--primary">
          <span data-lang-en="See how it works" data-lang-fr="Voir comment ça marche">See how it works</span>
        </a>
      </div>
      <div class="mv2-product-intro__features">
        <?php
        $features = [
          ['icon' => '📋', 'en_title' => 'Remittance Ledger',     'fr_title' => 'Grand livre de remises',     'en_body' => 'Daily target vs actual per driver. Shortfalls flagged automatically.',                                      'fr_body' => 'Objectif quotidien vs réel par conducteur. Les manques sont signalés automatiquement.'],
          ['icon' => '🪪', 'en_title' => 'Driver Verification',   'fr_title' => 'Vérification des conducteurs', 'en_body' => 'Photo capture, document upload, biometric check. Every driver on record.',                             'fr_body' => 'Capture photo, téléchargement de documents, vérification biométrique. Chaque conducteur enregistré.'],
          ['icon' => '🚐', 'en_title' => 'Vehicle Compliance',    'fr_title' => 'Conformité des véhicules',   'en_body' => 'Roadworthiness, insurance, hackney permits — all tracked with expiry alerts.',                           'fr_body' => 'Aptitude à la circulation, assurance, permis — tout suivi avec alertes d\'expiration.'],
          ['icon' => '📈', 'en_title' => 'Fleet Analytics',       'fr_title' => 'Analytique de flotte',       'en_body' => 'Which drivers are consistent. Which routes underperform. Which vehicles need attention.',               'fr_body' => 'Quels conducteurs sont réguliers. Quels itinéraires sous-performent. Quels véhicules nécessitent attention.'],
        ];
        foreach ($features as $f) : ?>
          <div class="mv2-feature-tile">
            <div class="mv2-feature-tile__icon"><?php echo $f['icon']; ?></div>
            <div class="mv2-feature-tile__body">
              <h3 data-lang-en="<?php echo esc_attr($f['en_title']); ?>"
                  data-lang-fr="<?php echo esc_attr($f['fr_title']); ?>">
                <?php echo esc_html($f['en_title']); ?>
              </h3>
              <p data-lang-en="<?php echo esc_attr($f['en_body']); ?>"
                 data-lang-fr="<?php echo esc_attr($f['fr_body']); ?>">
                <?php echo esc_html($f['en_body']); ?>
              </p>
            </div>
          </div>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
</section>
