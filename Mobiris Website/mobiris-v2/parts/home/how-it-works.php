<?php
/**
 * Homepage: How It Works — 3 steps.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$steps = array(
	array(
		'number'      => '01',
		'icon'        => '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/><path d="M9 12l2 2 4-4"/></svg>',
		'title_en'    => 'Onboard your driver',
		'title_fr'    => 'Embarquez votre chauffeur',
		'detail_en'   => 'Send the driver a self-service verification link via SMS or WhatsApp. They complete biometric capture and government ID verification on their phone. You see a verified profile with identity status within minutes.',
		'detail_fr'   => 'Envoyez au chauffeur un lien de vérification en libre-service par SMS ou WhatsApp. Il complète la capture biométrique et la vérification d\'identité sur son téléphone. Vous voyez un profil vérifié avec le statut d\'identité en quelques minutes.',
		'sub_steps_en'=> array( 'Send verification link', 'Driver completes identity check', 'Profile appears in your dashboard', 'Guarantor details captured' ),
		'sub_steps_fr'=> array( 'Envoyer le lien de vérification', 'Le chauffeur complète le contrôle d\'identité', 'Le profil apparaît dans votre tableau de bord', 'Détails du garant capturés' ),
	),
	array(
		'number'      => '02',
		'icon'        => '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/><path d="M9 10v-3h6v3"/></svg>',
		'title_en'    => 'Assign and track',
		'title_fr'    => 'Affecter et suivre',
		'detail_en'   => 'Assign a vehicle to the verified driver. Set a daily remittance target. The driver logs payment in the app daily. You confirm, dispute, or flag discrepancies — all with a timestamped record.',
		'detail_fr'   => 'Affectez un véhicule au chauffeur vérifié. Définissez une cible de remise quotidienne. Le chauffeur enregistre le paiement dans l\'application chaque jour. Vous confirmez, contestez ou signalez les écarts — tout avec un enregistrement horodaté.',
		'sub_steps_en'=> array( 'Assign vehicle to driver', 'Set daily remittance target', 'Driver reports collection daily', 'You confirm or dispute with evidence' ),
		'sub_steps_fr'=> array( 'Affecter le véhicule au chauffeur', 'Définir l\'objectif de remise quotidien', 'Le chauffeur signale la collecte quotidiennement', 'Vous confirmez ou contestez avec preuves' ),
	),
	array(
		'number'      => '03',
		'icon'        => '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/><path d="M15 6h.01M18 6h.01"/></svg>',
		'title_en'    => 'See everything',
		'title_fr'    => 'Voyez tout',
		'detail_en'   => 'Your dashboard shows real-time fleet readiness, full remittance history, compliance status for every driver and vehicle, and risk flags from the intelligence layer — all in one view.',
		'detail_fr'   => 'Votre tableau de bord affiche l\'état en temps réel de la flotte, l\'historique complet des remises, le statut de conformité pour chaque chauffeur et véhicule, et les signaux de risque de la couche intelligence — le tout en une vue.',
		'sub_steps_en'=> array( 'Fleet readiness at a glance', 'Full remittance history & trends', 'Document expiry alerts (30 days notice)', 'Cross-operator risk signals' ),
		'sub_steps_fr'=> array( 'État de la flotte en un coup d\'œil', 'Historique complet des remises', 'Alertes d\'expiration de documents (30 jours)', 'Signaux de risque entre opérateurs' ),
	),
);
?>
<section class="mv2-section mv2-section--dark mv2-how-it-works" id="mv2-how-it-works">
	<div class="mv2-container">

		<div class="mv2-section-header mv2-section-header--center mv2-section-header--light">
			<div class="mv2-badge mv2-badge--primary">
				<span data-lang-en="How It Works" data-lang-fr="Comment ça marche">How It Works</span>
			</div>
			<h2 class="mv2-section-title mv2-section-title--light">
				<span data-lang-en="From signup to full fleet visibility in under an hour."
				      data-lang-fr="De l'inscription à la visibilité complète de la flotte en moins d'une heure.">From signup to full fleet visibility in under an hour.</span>
			</h2>
			<p class="mv2-section-subtitle mv2-section-subtitle--light">
				<span data-lang-en="Three steps. No IT team required. No lengthy onboarding. Works on any smartphone."
				      data-lang-fr="Trois étapes. Pas d'équipe informatique nécessaire. Pas d'intégration longue. Fonctionne sur n'importe quel smartphone.">Three steps. No IT team required. No lengthy onboarding. Works on any smartphone.</span>
			</p>
		</div>

		<div class="mv2-steps">
			<?php foreach ( $steps as $index => $step ) : ?>
				<div class="mv2-step" data-step="<?php echo esc_attr( $step['number'] ); ?>">
					<div class="mv2-step__connector" aria-hidden="true">
						<?php if ( $index < count( $steps ) - 1 ) : ?>
							<div class="mv2-step__line"></div>
						<?php endif; ?>
					</div>
					<div class="mv2-step__card">
						<div class="mv2-step__header">
							<div class="mv2-step__number"><?php echo esc_html( $step['number'] ); ?></div>
							<div class="mv2-step__icon" aria-hidden="true">
								<?php echo $step['icon']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							</div>
							<h3 class="mv2-step__title">
								<span data-lang-en="<?php echo esc_attr( $step['title_en'] ); ?>"
								      data-lang-fr="<?php echo esc_attr( $step['title_fr'] ); ?>">
									<?php echo esc_html( $step['title_en'] ); ?>
								</span>
							</h3>
						</div>
						<p class="mv2-step__detail">
							<span data-lang-en="<?php echo esc_attr( $step['detail_en'] ); ?>"
							      data-lang-fr="<?php echo esc_attr( $step['detail_fr'] ); ?>">
								<?php echo esc_html( $step['detail_en'] ); ?>
							</span>
						</p>
						<ul class="mv2-step__sub-steps">
							<?php foreach ( $step['sub_steps_en'] as $si => $sub ) : ?>
								<li>
									<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
									<span data-lang-en="<?php echo esc_attr( $sub ); ?>"
									      data-lang-fr="<?php echo esc_attr( $step['sub_steps_fr'][ $si ] ); ?>">
										<?php echo esc_html( $sub ); ?>
									</span>
								</li>
							<?php endforeach; ?>
						</ul>
					</div>
				</div>
			<?php endforeach; ?>
		</div>

		<div class="mv2-section-cta mv2-section-cta--center">
			<a href="<?php echo esc_url( get_permalink( get_page_by_path( 'how-it-works' ) ) ); ?>" class="mv2-btn mv2-btn--outline mv2-btn--light">
				<span data-lang-en="See the full 5-step setup guide" data-lang-fr="Voir le guide de configuration complet en 5 étapes">See the full 5-step setup guide</span>
			</a>
			<a href="<?php echo esc_url( mv2_app_url() ); ?>" class="mv2-btn mv2-btn--primary" target="_blank" rel="noopener noreferrer">
				<span data-lang-en="Start now — it's free" data-lang-fr="Commencez maintenant — c'est gratuit">Start now — it's free</span>
			</a>
		</div>

	</div>
</section>
