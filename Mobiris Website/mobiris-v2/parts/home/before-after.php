<?php
/**
 * Homepage: Before vs After Comparison.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$comparisons = array(
	array(
		'category_en'   => 'Driver Identity',
		'category_fr'   => 'Identité du chauffeur',
		'before_en'     => 'Trust and hope — you take their word for it',
		'before_fr'     => 'Confiance et espoir — vous les croyez sur parole',
		'after_en'      => 'Biometric face capture + verified government ID (NIN/BVN/Ghana Card)',
		'after_fr'      => 'Capture biométrique du visage + pièce d\'identité gouvernementale vérifiée (NIN/BVN/Carte Ghana)',
	),
	array(
		'category_en'   => 'Remittance Tracking',
		'category_fr'   => 'Suivi des remises',
		'before_en'     => 'WhatsApp messages + paper notebook + memory',
		'before_fr'     => 'Messages WhatsApp + cahier papier + mémoire',
		'after_en'      => 'Digital audit trail — every payment timestamped, confirmed, disputable',
		'after_fr'      => 'Piste d\'audit numérique — chaque paiement horodaté, confirmé, contestable',
	),
	array(
		'category_en'   => 'Dispute Resolution',
		'category_fr'   => 'Résolution des litiges',
		'before_en'     => 'Your word vs. theirs — no evidence, no resolution',
		'before_fr'     => 'Votre parole contre la leur — aucune preuve, aucune résolution',
		'after_en'      => 'Timestamped records — disputes resolved with documented evidence',
		'after_fr'      => 'Enregistrements horodatés — litiges résolus avec preuves documentées',
	),
	array(
		'category_en'   => 'Fraud Prevention',
		'category_fr'   => 'Prévention des fraudes',
		'before_en'     => 'You find out about the fraud after the damage is done',
		'before_fr'     => 'Vous découvrez la fraude après que les dégâts sont faits',
		'after_en'      => 'Cross-operator risk signal before you hire — anonymised intelligence layer',
		'after_fr'      => 'Signal de risque entre opérateurs avant d\'embaucher — couche d\'intelligence anonymisée',
	),
	array(
		'category_en'   => 'Guarantors',
		'category_fr'   => 'Garants',
		'before_en'     => 'Paper form filled at hire — phone number already outdated',
		'before_fr'     => 'Formulaire papier rempli à l\'embauche — numéro de téléphone déjà obsolète',
		'after_en'      => 'Verified and on file — real contact, real accountability',
		'after_fr'      => 'Vérifié et archivé — vrai contact, vraie responsabilité',
	),
	array(
		'category_en'   => 'Licence Expiry',
		'category_fr'   => 'Expiration du permis',
		'before_en'     => 'Discovered when FRSC stops the vehicle at a checkpoint',
		'before_fr'     => 'Découvert quand la FRSC arrête le véhicule à un poste de contrôle',
		'after_en'      => '30-day advance alert — fix it before it becomes a problem',
		'after_fr'      => 'Alerte 30 jours à l\'avance — résolvez-le avant que ça devienne un problème',
	),
	array(
		'category_en'   => 'Compliance Records',
		'category_fr'   => 'Dossiers de conformité',
		'before_en'     => 'Paper folder — incomplete, lost, or destroyed',
		'before_fr'     => 'Dossier papier — incomplet, perdu ou détruit',
		'after_en'      => 'Digital records — exportable for bank loans, insurance, or dispute resolution',
		'after_fr'      => 'Dossiers numériques — exportables pour prêts bancaires, assurance ou résolution de litiges',
	),
	array(
		'category_en'   => 'Monthly Leakage',
		'category_fr'   => 'Fuites mensuelles',
		'before_en'     => '₦300,000 – ₦1,500,000+ disappearing with no visibility',
		'before_fr'     => '₦300 000 – ₦1 500 000+ qui disparaissent sans visibilité',
		'after_en'      => 'Reduced by up to 80% — recoverable from first month of use',
		'after_fr'      => 'Réduit jusqu\'à 80 % — récupérable dès le premier mois d\'utilisation',
		'highlight'     => true,
	),
);
?>
<section class="mv2-section mv2-section--light mv2-before-after" id="mv2-before-after">
	<div class="mv2-container">

		<div class="mv2-section-header mv2-section-header--center">
			<div class="mv2-badge mv2-badge--primary">
				<span data-lang-en="The Difference" data-lang-fr="La différence">The Difference</span>
			</div>
			<h2 class="mv2-section-title">
				<span data-lang-en="Before Mobiris. After Mobiris."
				      data-lang-fr="Avant Mobiris. Après Mobiris.">Before Mobiris. After Mobiris.</span>
			</h2>
			<p class="mv2-section-subtitle">
				<span data-lang-en="Eight areas where operators feel the difference from the first week."
				      data-lang-fr="Huit domaines où les opérateurs ressentent la différence dès la première semaine.">Eight areas where operators feel the difference from the first week.</span>
			</p>
		</div>

		<!-- Column Headers -->
		<div class="mv2-comparison-table">
			<div class="mv2-comparison-header">
				<div class="mv2-comparison-header__category">
					<span data-lang-en="Area" data-lang-fr="Domaine">Area</span>
				</div>
				<div class="mv2-comparison-header__before">
					<div class="mv2-comparison-header__icon" aria-hidden="true">✗</div>
					<span data-lang-en="Without Mobiris" data-lang-fr="Sans Mobiris">Without Mobiris</span>
				</div>
				<div class="mv2-comparison-header__after">
					<div class="mv2-comparison-header__icon" aria-hidden="true">✓</div>
					<span data-lang-en="With Mobiris" data-lang-fr="Avec Mobiris">With Mobiris</span>
				</div>
			</div>

			<?php foreach ( $comparisons as $row ) : ?>
				<div class="mv2-comparison-row <?php echo ! empty( $row['highlight'] ) ? 'mv2-comparison-row--highlight' : ''; ?>">
					<div class="mv2-comparison-row__category">
						<span data-lang-en="<?php echo esc_attr( $row['category_en'] ); ?>"
						      data-lang-fr="<?php echo esc_attr( $row['category_fr'] ); ?>">
							<?php echo esc_html( $row['category_en'] ); ?>
						</span>
					</div>
					<div class="mv2-comparison-row__before">
						<div class="mv2-comparison-row__before-icon" aria-hidden="true">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.3 5.71a.996.996 0 00-1.41 0L12 10.59 7.11 5.7A.996.996 0 105.7 7.11L10.59 12 5.7 16.89a.996.996 0 101.41 1.41L12 13.41l4.89 4.89a.996.996 0 101.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/></svg>
						</div>
						<span data-lang-en="<?php echo esc_attr( $row['before_en'] ); ?>"
						      data-lang-fr="<?php echo esc_attr( $row['before_fr'] ); ?>">
							<?php echo esc_html( $row['before_en'] ); ?>
						</span>
					</div>
					<div class="mv2-comparison-row__after">
						<div class="mv2-comparison-row__after-icon" aria-hidden="true">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						</div>
						<span data-lang-en="<?php echo esc_attr( $row['after_en'] ); ?>"
						      data-lang-fr="<?php echo esc_attr( $row['after_fr'] ); ?>">
							<?php echo esc_html( $row['after_en'] ); ?>
						</span>
					</div>
				</div>
			<?php endforeach; ?>
		</div>

		<div class="mv2-section-cta mv2-section-cta--center">
			<a href="<?php echo esc_url( mv2_app_url() ); ?>" class="mv2-btn mv2-btn--primary mv2-btn--lg" target="_blank" rel="noopener noreferrer">
				<span data-lang-en="Switch to 'After Mobiris' — Start Free" data-lang-fr="Passez à 'Après Mobiris' — Commencez gratuitement">Switch to "After Mobiris" — Start Free</span>
			</a>
		</div>

	</div>
</section>
