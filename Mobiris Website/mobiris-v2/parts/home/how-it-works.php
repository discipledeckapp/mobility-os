<section class="mv2-section mv2-section--offwhite mv2-hiw" aria-label="How Mobiris works">
  <div class="mv2-container">
    <div class="mv2-section-header mv2-section-header--center">
      <h2 data-lang-en="Up and running in one day"
          data-lang-fr="Opérationnel en un jour">Up and running in one day</h2>
      <p data-lang-en="No IT team required. No lengthy setup. You log in, enter your fleet, add your drivers, and start tracking."
         data-lang-fr="Aucune équipe informatique requise. Pas de longue configuration. Vous vous connectez, entrez votre flotte, ajoutez vos conducteurs et commencez à suivre.">
        No IT team required. No lengthy setup. You log in, enter your fleet, add your drivers, and start tracking.
      </p>
    </div>
    <div class="mv2-hiw__steps">
      <?php
      $steps = [
        ['n'=>'01','en_h'=>'Create your account',           'fr_h'=>'Créez votre compte',             'en_b'=>'Sign up with your email. Choose your plan. Your workspace is ready in under 2 minutes.',                                                 'fr_b'=>'Inscrivez-vous avec votre email. Choisissez votre forfait. Votre espace de travail est prêt en moins de 2 minutes.'],
        ['n'=>'02','en_h'=>'Add your fleet',                'fr_h'=>'Ajoutez votre flotte',           'en_b'=>'Enter each vehicle: plate, type, capacity, documents. Import via CSV if you have a large fleet.',                                        'fr_b'=>'Saisissez chaque véhicule : plaque, type, capacité, documents. Importez via CSV si vous avez une grande flotte.'],
        ['n'=>'03','en_h'=>'Onboard your drivers',          'fr_h'=>'Enregistrez vos conducteurs',    'en_b'=>'Capture driver photo, upload licence and guarantor info. Each driver gets a verified profile linked to their assigned vehicle.',           'fr_b'=>'Capturez la photo du conducteur, téléchargez le permis et les informations du garant. Chaque conducteur obtient un profil vérifié lié à son véhicule assigné.'],
        ['n'=>'04','en_h'=>'Log daily remittance',          'fr_h'=>'Enregistrez les remises quotidiennes', 'en_b'=>'Record what each driver pays in. Compare against their daily target. Flag gaps immediately.',                                        'fr_b'=>'Enregistrez ce que chaque conducteur verse. Comparez avec son objectif quotidien. Signalez immédiatement les écarts.'],
        ['n'=>'05','en_h'=>'Review your fleet performance', 'fr_h'=>'Analysez la performance de votre flotte', 'en_b'=>'Open the dashboard to see trends: which drivers are consistent, which vehicles are underperforming, where you\'re losing money.','fr_b'=>'Ouvrez le tableau de bord pour voir les tendances : quels conducteurs sont réguliers, quels véhicules sous-performent, où vous perdez de l\'argent.'],
      ];
      foreach ($steps as $s) : ?>
        <div class="mv2-hiw__step">
          <div class="mv2-hiw__step-num"><?php echo esc_html($s['n']); ?></div>
          <div class="mv2-hiw__step-body">
            <h3 data-lang-en="<?php echo esc_attr($s['en_h']); ?>"
                data-lang-fr="<?php echo esc_attr($s['fr_h']); ?>">
              <?php echo esc_html($s['en_h']); ?>
            </h3>
            <p data-lang-en="<?php echo esc_attr($s['en_b']); ?>"
               data-lang-fr="<?php echo esc_attr($s['fr_b']); ?>">
              <?php echo esc_html($s['en_b']); ?>
            </p>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>
