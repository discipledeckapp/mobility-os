<?php
/**
 * Template Name: How It Works
 * Template Post Type: page
 *
 * Full 5-step setup guide.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$steps = array(
	array(
		'num'      => '01',
		'title_en' => 'Create your account and set up your fleet',
		'title_fr' => 'Créez votre compte et configurez votre flotte',
		'desc_en'  => 'Sign up at app.mobiris.ng. Enter your business details, select your country, and create your fleet profile. This takes less than 10 minutes. You\'ll be asked for your business name, number of vehicles, and primary vehicle type.',
		'desc_fr'  => 'Inscrivez-vous sur app.mobiris.ng. Entrez les détails de votre entreprise, sélectionnez votre pays et créez votre profil de flotte. Cela prend moins de 10 minutes.',
		'details_en' => array( 'Business name and contact details', 'Fleet size and vehicle types', 'Primary operating city or region', 'Preferred currency (NGN, GHS, XOF)' ),
		'details_fr' => array( 'Nom de l\'entreprise et coordonnées', 'Taille de la flotte et types de véhicules', 'Ville ou région d\'exploitation principale', 'Devise préférée (NGN, GHS, XOF)' ),
	),
	array(
		'num'      => '02',
		'title_en' => 'Add your vehicles',
		'title_fr' => 'Ajoutez vos véhicules',
		'desc_en'  => 'Register each vehicle with its details — plate number, vehicle type, daily remittance target, and any relevant documents (registration, insurance). Vehicles are the central unit that drivers and remittance records are attached to.',
		'desc_fr'  => 'Enregistrez chaque véhicule avec ses détails — numéro de plaque, type de véhicule, objectif de remise quotidien, et tout document pertinent (immatriculation, assurance).',
		'details_en' => array( 'Plate number and vehicle type', 'Daily remittance target', 'Registration and insurance documents', 'Document expiry dates (auto-alerts)' ),
		'details_fr' => array( 'Numéro de plaque et type de véhicule', 'Objectif de remise quotidien', 'Documents d\'immatriculation et d\'assurance', 'Dates d\'expiration des documents (alertes automatiques)' ),
	),
	array(
		'num'      => '03',
		'title_en' => 'Onboard each driver (send a link — they verify themselves)',
		'title_fr' => 'Intégrez chaque chauffeur (envoyez un lien — il se vérifie lui-même)',
		'desc_en'  => 'Send the driver a self-service verification link by SMS or WhatsApp. The driver opens the link on their phone, takes a face photo, and submits their NIN, BVN, or Ghana Card. Mobiris verifies the identity in minutes. You see a verified profile. You also capture guarantor details during this step.',
		'desc_fr'  => 'Envoyez au chauffeur un lien de vérification en libre-service par SMS ou WhatsApp. Le chauffeur ouvre le lien sur son téléphone, prend une photo de son visage et soumet son NIN, BVN ou Carte Ghana. Mobiris vérifie l\'identité en quelques minutes.',
		'details_en' => array( 'Biometric face capture on driver\'s phone', 'Government ID verification (NIN/BVN/Ghana Card)', 'Guarantor name, phone, address, ID', 'Driver licence capture and expiry tracking' ),
		'details_fr' => array( 'Capture faciale biométrique sur le téléphone du chauffeur', 'Vérification de l\'identité gouvernementale (NIN/BVN/Carte Ghana)', 'Nom du garant, téléphone, adresse, identité', 'Capture du permis de conduire et suivi d\'expiration' ),
	),
	array(
		'num'      => '04',
		'title_en' => 'Assign vehicle and set daily remittance target',
		'title_fr' => 'Affecter le véhicule et définir l\'objectif de remise quotidien',
		'desc_en'  => 'Assign a verified driver to a specific vehicle for a specific period. Set or confirm the daily remittance target for that assignment. The driver is now accountable — their name, identity, and daily target are all on record.',
		'desc_fr'  => 'Affectez un chauffeur vérifié à un véhicule spécifique pour une période spécifique. Définissez ou confirmez l\'objectif de remise quotidien pour cette affectation.',
		'details_en' => array( 'Vehicle-to-driver assignment with dates', 'Daily remittance target confirmed', 'Both operator and driver notified', 'Assignment history maintained' ),
		'details_fr' => array( 'Affectation véhicule-chauffeur avec dates', 'Objectif de remise quotidien confirmé', 'Opérateur et chauffeur notifiés', 'Historique des affectations maintenu' ),
	),
	array(
		'num'      => '05',
		'title_en' => 'Track daily and review weekly',
		'title_fr' => 'Suivre quotidiennement et réviser chaque semaine',
		'desc_en'  => 'The driver logs their daily remittance in the Mobiris app. You receive a notification, review the amount, and confirm or dispute. Your dashboard shows real-time fleet status — who has paid, who hasn\'t, and who has compliance issues. Weekly summaries and monthly reports are generated automatically.',
		'desc_fr'  => 'Le chauffeur enregistre sa remise quotidienne dans l\'application Mobiris. Vous recevez une notification, examinez le montant et confirmez ou contestez. Votre tableau de bord affiche l\'état en temps réel de la flotte.',
		'details_en' => array( 'Daily collection log with timestamps', 'One-tap confirm or dispute', 'Compliance status per driver and vehicle', 'Weekly summary and monthly report', 'Export records at any time' ),
		'details_fr' => array( 'Journal de collecte quotidien avec horodatages', 'Confirmer ou contester en un seul tap', 'Statut de conformité par chauffeur et véhicule', 'Résumé hebdomadaire et rapport mensuel', 'Exporter les dossiers à tout moment' ),
	),
);
?>
<section class="mv2-section mv2-section--dark-navy mv2-page-hero">
	<div class="mv2-container">
		<div class="mv2-page-hero__inner">
			<div class="mv2-badge mv2-badge--primary">
				<span data-lang-en="How It Works" data-lang-fr="Comment ça marche">How It Works</span>
			</div>
			<h1 class="mv2-page-hero__title">
				<span data-lang-en="From signup to full fleet visibility — in under an hour."
				      data-lang-fr="De l'inscription à la visibilité complète de la flotte — en moins d'une heure.">From signup to full fleet visibility — in under an hour.</span>
			</h1>
			<p class="mv2-page-hero__subtitle">
				<span data-lang-en="Five simple steps. No IT team. No long implementation. Works on any Android or iOS smartphone."
				      data-lang-fr="Cinq étapes simples. Pas d'équipe informatique. Pas de longue implémentation. Fonctionne sur tout smartphone Android ou iOS.">Five simple steps. No IT team. No long implementation. Works on any Android or iOS smartphone.</span>
			</p>
		</div>
	</div>
</section>

<section class="mv2-section mv2-section--light">
	<div class="mv2-container">
		<div class="mv2-how-detail-steps">
			<?php foreach ( $steps as $step ) : ?>
				<div class="mv2-how-detail-step">
					<div class="mv2-how-detail-step__number"><?php echo esc_html( $step['num'] ); ?></div>
					<div class="mv2-how-detail-step__content">
						<h2 class="mv2-how-detail-step__title">
							<span data-lang-en="<?php echo esc_attr( $step['title_en'] ); ?>"
							      data-lang-fr="<?php echo esc_attr( $step['title_fr'] ); ?>">
								<?php echo esc_html( $step['title_en'] ); ?>
							</span>
						</h2>
						<p class="mv2-how-detail-step__desc">
							<span data-lang-en="<?php echo esc_attr( $step['desc_en'] ); ?>"
							      data-lang-fr="<?php echo esc_attr( $step['desc_fr'] ); ?>">
								<?php echo esc_html( $step['desc_en'] ); ?>
							</span>
						</p>
						<ul class="mv2-how-detail-step__list">
							<?php foreach ( $step['details_en'] as $di => $detail ) : ?>
								<li>
									<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
									<span data-lang-en="<?php echo esc_attr( $detail ); ?>"
									      data-lang-fr="<?php echo esc_attr( $step['details_fr'][ $di ] ); ?>">
										<?php echo esc_html( $detail ); ?>
									</span>
								</li>
							<?php endforeach; ?>
						</ul>
					</div>
				</div>
			<?php endforeach; ?>
		</div>

		<div class="mv2-section-cta mv2-section-cta--center">
			<a href="<?php echo esc_url( mv2_app_url() ); ?>" class="mv2-btn mv2-btn--primary mv2-btn--lg" target="_blank" rel="noopener noreferrer">
				<span data-lang-en="Start your free trial now" data-lang-fr="Commencez votre essai gratuit maintenant">Start your free trial now</span>
			</a>
		</div>
	</div>
</section>

<?php get_template_part( 'parts/home/lead-capture' ); ?>
<?php get_template_part( 'parts/global/cta-band' ); ?>
<?php get_footer(); ?>
