<section class="mv2-section mv2-section--white mv2-ba" aria-label="Before and after Mobiris">
  <div class="mv2-container">
    <div class="mv2-section-header mv2-section-header--center">
      <h2 data-lang-en="Running a fleet without Mobiris vs. with Mobiris"
          data-lang-fr="Gérer une flotte sans Mobiris vs. avec Mobiris">
        Running a fleet without Mobiris vs. with Mobiris
      </h2>
    </div>
    <div class="mv2-ba__table-wrap">
      <table class="mv2-ba__table" role="table">
        <thead>
          <tr>
            <th data-lang-en="Situation" data-lang-fr="Situation">Situation</th>
            <th class="mv2-ba__col--before" data-lang-en="Without Mobiris" data-lang-fr="Sans Mobiris">Without Mobiris</th>
            <th class="mv2-ba__col--after"  data-lang-en="With Mobiris"    data-lang-fr="Avec Mobiris">With Mobiris</th>
          </tr>
        </thead>
        <tbody>
          <?php
          $rows = [
            ['s_en'=>'Tracking daily remittance',       's_fr'=>'Suivi des remises quotidiennes',       'b_en'=>'Notebook or WhatsApp group',                              'b_fr'=>'Carnet ou groupe WhatsApp',                                  'a_en'=>'Digital ledger with driver-by-driver breakdown',             'a_fr'=>'Grand livre numérique avec ventilation par conducteur'],
            ['s_en'=>'Knowing your daily target',       's_fr'=>'Connaître votre objectif quotidien',   'b_en'=>'Mental estimate, often wrong',                            'b_fr'=>'Estimation mentale, souvent erronée',                        'a_en'=>'Calculated automatically from fleet size and vehicle type',  'a_fr'=>'Calculé automatiquement selon la taille de flotte et le type'],
            ['s_en'=>'Driver identity verification',    's_fr'=>'Vérification d\'identité des conducteurs','b_en'=>'Word of mouth, maybe a photocopy',                   'b_fr'=>'Bouche-à-oreille, peut-être une photocopie',                  'a_en'=>'Photo, document, and biometric record on file',              'a_fr'=>'Dossier photo, document et biométrique'],
            ['s_en'=>'Detecting underremittance',       's_fr'=>'Détection des sous-remises',           'b_en'=>'Happens after weeks, if at all',                          'b_fr'=>'Découvert après des semaines, si jamais',                    'a_en'=>'Flagged the same day with a shortfall alert',                'a_fr'=>'Signalé le jour même avec une alerte de manque'],
            ['s_en'=>'Vehicle document compliance',     's_fr'=>'Conformité documentaire des véhicules','b_en'=>'Remembered or forgotten',                                 'b_fr'=>'Mémorisé ou oublié',                                        'a_en'=>'Tracked with automated expiry notifications',                'a_fr'=>'Suivi avec notifications automatiques d\'expiration'],
            ['s_en'=>'Fleet performance overview',      's_fr'=>'Vue d\'ensemble de la performance',    'b_en'=>'No visibility',                                           'b_fr'=>'Aucune visibilité',                                          'a_en'=>'Dashboard with trends by driver, vehicle, and route',        'a_fr'=>'Tableau de bord avec tendances par conducteur, véhicule et itinéraire'],
            ['s_en'=>'Scaling from 5 to 50 vehicles',  's_fr'=>'Passer de 5 à 50 véhicules',          'b_en'=>'Chaos — more vehicles means more unknowns',               'b_fr'=>'Chaos — plus de véhicules signifie plus d\'inconnues',       'a_en'=>'Same system, larger dataset — scales without friction',      'a_fr'=>'Même système, plus de données — évolue sans friction'],
          ];
          foreach ($rows as $r) : ?>
            <tr>
              <td data-lang-en="<?php echo esc_attr($r['s_en']); ?>"
                  data-lang-fr="<?php echo esc_attr($r['s_fr']); ?>">
                <?php echo esc_html($r['s_en']); ?>
              </td>
              <td class="mv2-ba__col--before"
                  data-lang-en="<?php echo esc_attr($r['b_en']); ?>"
                  data-lang-fr="<?php echo esc_attr($r['b_fr']); ?>">
                <span class="mv2-ba__x">✗</span> <?php echo esc_html($r['b_en']); ?>
              </td>
              <td class="mv2-ba__col--after"
                  data-lang-en="<?php echo esc_attr($r['a_en']); ?>"
                  data-lang-fr="<?php echo esc_attr($r['a_fr']); ?>">
                <span class="mv2-ba__check">✓</span> <?php echo esc_html($r['a_en']); ?>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</section>
