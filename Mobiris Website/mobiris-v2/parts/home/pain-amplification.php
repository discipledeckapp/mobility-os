<section class="mv2-section mv2-section--offwhite mv2-pain" aria-label="Pain points">
  <div class="mv2-container">
    <div class="mv2-section-header">
      <h2 data-lang-en="Sound familiar?"
          data-lang-fr="Ça vous parle ?">Sound familiar?</h2>
    </div>
    <div class="mv2-pain__grid">
      <?php
      $pains = [
        [
          'en' => '"I have 12 vehicles but I honestly don\'t know how much I should be collecting every day."',
          'fr' => '"J\'ai 12 véhicules mais je ne sais honnêtement pas combien je devrais collecter chaque jour."',
        ],
        [
          'en' => '"One of my drivers has been giving me the same amount for 8 months. I have no way to check if it\'s right."',
          'fr' => '"Un de mes conducteurs me donne le même montant depuis 8 mois. Je n\'ai aucun moyen de vérifier si c\'est correct."',
        ],
        [
          'en' => '"I found out my vehicle was being driven by someone I\'ve never met. He was subletting it without my knowledge."',
          'fr' => '"J\'ai découvert que mon véhicule était conduit par quelqu\'un que je n\'ai jamais rencontré. Il le sous-louait à mon insu."',
        ],
        [
          'en' => '"I use a notebook and WhatsApp. I know it\'s not enough. I just don\'t know what to use instead."',
          'fr' => '"J\'utilise un carnet et WhatsApp. Je sais que ce n\'est pas suffisant. Je ne sais juste pas quoi utiliser à la place."',
        ],
        [
          'en' => '"My fleet manager tells me everything is fine. The numbers don\'t add up. Someone is lying."',
          'fr' => '"Mon gestionnaire de flotte me dit que tout va bien. Les chiffres ne s\'additionnent pas. Quelqu\'un ment."',
        ],
        [
          'en' => '"I want to expand but I can\'t manage what I already have properly. How do I scale something I can\'t control?"',
          'fr' => '"Je veux m\'agrandir mais je ne peux pas gérer correctement ce que j\'ai déjà. Comment développer quelque chose que je ne contrôle pas ?"',
        ],
      ];
      foreach ( $pains as $pain ) : ?>
        <div class="mv2-pain__card">
          <span class="mv2-pain__quote-mark">"</span>
          <blockquote class="mv2-pain__quote"
                      data-lang-en="<?php echo esc_attr( $pain['en'] ); ?>"
                      data-lang-fr="<?php echo esc_attr( $pain['fr'] ); ?>">
            <?php echo esc_html( $pain['en'] ); ?>
          </blockquote>
          <p class="mv2-pain__attr"
             data-lang-en="— Scenario: a real pattern we hear from transport operators"
             data-lang-fr="— Scénario : une vraie situation que nous entendons des opérateurs de transport">
            — Scenario: a real pattern we hear from transport operators
          </p>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>
