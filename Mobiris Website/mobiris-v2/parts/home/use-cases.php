<section class="mv2-section mv2-section--offwhite mv2-usecases" aria-label="Use cases">
  <div class="mv2-container">
    <div class="mv2-section-header mv2-section-header--center">
      <h2 data-lang-en="How operators use Mobiris"
          data-lang-fr="Comment les opérateurs utilisent Mobiris">How operators use Mobiris</h2>
      <p data-lang-en="These are common patterns we've designed the platform to handle."
         data-lang-fr="Ce sont des schémas courants pour lesquels nous avons conçu la plateforme.">
        These are common patterns we've designed the platform to handle.
      </p>
    </div>
    <?php
    $cases = [
      [
        'tag_en' => 'Use case — Fleet owner',
        'tag_fr' => 'Cas d\'usage — Propriétaire de flotte',
        'h_en'   => 'The owner who manages drivers remotely',
        'h_fr'   => 'Le propriétaire qui gère ses conducteurs à distance',
        'b_en'   => 'A fleet owner with 18 danfo buses uses Mobiris to receive daily remittance logs from his fleet manager without being physically present. He reviews performance on his phone each evening, flags any driver below target, and reviews weekly trends every Friday.',
        'b_fr'   => 'Un propriétaire de flotte avec 18 bus danfo utilise Mobiris pour recevoir les journaux de remises quotidiens de son gestionnaire sans être présent physiquement. Il examine les performances sur son téléphone chaque soir, signale tout conducteur en dessous de l\'objectif et examine les tendances hebdomadaires chaque vendredi.',
      ],
      [
        'tag_en' => 'Use case — Growing operator',
        'tag_fr' => 'Cas d\'usage — Opérateur en croissance',
        'h_en'   => 'Scaling from 5 to 20 keke without losing control',
        'h_fr'   => 'Passer de 5 à 20 keke sans perdre le contrôle',
        'b_en'   => 'As a keke operator expands beyond 5 vehicles, managing everything mentally becomes impossible. Mobiris is designed so the system scales with the fleet — adding a new vehicle takes under 3 minutes, and the daily workflow stays the same whether you have 5 or 50.',
        'b_fr'   => 'Quand un opérateur de keke dépasse 5 véhicules, tout gérer mentalement devient impossible. Mobiris est conçu pour que le système évolue avec la flotte — ajouter un nouveau véhicule prend moins de 3 minutes, et le flux de travail quotidien reste le même que vous en ayez 5 ou 50.',
      ],
      [
        'tag_en' => 'Use case — Compliance-focused operator',
        'tag_fr' => 'Cas d\'usage — Opérateur axé sur la conformité',
        'h_en'   => 'Staying ahead of regulatory requirements',
        'h_fr'   => 'Anticiper les exigences réglementaires',
        'b_en'   => 'An operator with a mixed korope and danfo fleet uses Mobiris to track vehicle document expiry — insurance, road tax, hackney permits. The platform alerts them 30 days before any document expires, so no vehicle operates out of compliance.',
        'b_fr'   => 'Un opérateur avec une flotte mixte korope et danfo utilise Mobiris pour suivre l\'expiration des documents des véhicules — assurance, taxe routière, permis. La plateforme les alerte 30 jours avant l\'expiration de tout document, afin qu\'aucun véhicule n\'opère hors conformité.',
      ],
      [
        'tag_en' => 'Use case — Investor or absentee owner',
        'tag_fr' => 'Cas d\'usage — Investisseur ou propriétaire absent',
        'h_en'   => 'Owning a transport business without being on the road',
        'h_fr'   => 'Posséder une entreprise de transport sans être sur la route',
        'b_en'   => 'Some vehicle owners treat their fleet as an investment managed by a trusted operator. Mobiris gives them a read-only view of daily collections, so they can verify returns without needing to trust word of mouth.',
        'b_fr'   => 'Certains propriétaires de véhicules traitent leur flotte comme un investissement géré par un opérateur de confiance. Mobiris leur donne une vue en lecture seule des collectes quotidiennes, afin qu\'ils puissent vérifier les rendements sans avoir besoin de faire confiance à la rumeur.',
      ],
    ];
    foreach ($cases as $c) : ?>
      <div class="mv2-usecase">
        <div class="mv2-usecase__tag"
             data-lang-en="<?php echo esc_attr($c['tag_en']); ?>"
             data-lang-fr="<?php echo esc_attr($c['tag_fr']); ?>">
          <?php echo esc_html($c['tag_en']); ?>
        </div>
        <h3 data-lang-en="<?php echo esc_attr($c['h_en']); ?>"
            data-lang-fr="<?php echo esc_attr($c['h_fr']); ?>">
          <?php echo esc_html($c['h_en']); ?>
        </h3>
        <p data-lang-en="<?php echo esc_attr($c['b_en']); ?>"
           data-lang-fr="<?php echo esc_attr($c['b_fr']); ?>">
          <?php echo esc_html($c['b_en']); ?>
        </p>
      </div>
    <?php endforeach; ?>
  </div>
</section>
