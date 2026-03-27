<?php
/**
 * Homepage: Product Introduction — 6 capability cards.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$capabilities = array(
	array(
		'icon'        => '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/><path d="M9 12l2 2 4-4"/></svg>',
		'title_en'    => 'Biometric Driver Verification',
		'title_fr'    => 'Vérification biométrique des chauffeurs',
		'desc_en'     => 'Face capture + NIN, BVN, or Ghana Card verification. Every driver in your fleet is who they say they are.',
		'desc_fr'     => 'Capture faciale + vérification NIN, BVN ou carte Ghana. Chaque chauffeur de votre flotte est bien celui qu\'il prétend être.',
		'means_en'    => 'No more unknown faces behind your wheel. Full identity accountability from day one.',
		'means_fr'    => 'Plus de visages inconnus derrière votre volant. Responsabilité d\'identité complète dès le premier jour.',
		'color_class' => 'mv2-cap-card--blue',
	),
	array(
		'icon'        => '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/><path d="M15 7a3 3 0 11-6 0 3 3 0 016 0"/></svg>',
		'title_en'    => 'Guarantor System',
		'title_fr'    => 'Système de garants',
		'desc_en'     => 'Capture and verify guarantor identity. Phone, address, NIN — all stored and verifiable if a driver disappears.',
		'desc_fr'     => 'Capturez et vérifiez l\'identité du garant. Téléphone, adresse, NIN — tout stocké et vérifiable si un chauffeur disparaît.',
		'means_en'    => 'When a driver leaves without notice, you have a real person to contact — not just a paper form.',
		'means_fr'    => 'Quand un chauffeur part sans prévenir, vous avez une vraie personne à contacter — pas seulement un formulaire papier.',
		'color_class' => 'mv2-cap-card--green',
	),
	array(
		'icon'        => '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
		'title_en'    => 'Remittance Tracking',
		'title_fr'    => 'Suivi des remises',
		'desc_en'     => 'Daily payment recording with full audit trail. Every collection timestamped, disputed, or confirmed with one tap.',
		'desc_fr'     => 'Enregistrement quotidien des paiements avec piste d\'audit complète. Chaque collecte est horodatée, contestée ou confirmée d\'un seul tap.',
		'means_en'    => 'End of month reconciliation in minutes instead of hours. Disputes resolved with evidence.',
		'means_fr'    => 'Rapprochement de fin de mois en minutes plutôt qu\'en heures. Litiges résolus avec preuves.',
		'color_class' => 'mv2-cap-card--blue',
	),
	array(
		'icon'        => '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
		'title_en'    => 'Assignment Control',
		'title_fr'    => 'Contrôle des affectations',
		'desc_en'     => 'Record every vehicle-to-driver assignment. Know who drove what, when, and whether remittance was collected.',
		'desc_fr'     => 'Enregistrez chaque affectation véhicule-chauffeur. Sachez qui a conduit quoi, quand, et si la remise a été collectée.',
		'means_en'    => 'Clear accountability for every vehicle every day. No more "I didn\'t take that car" disputes.',
		'means_fr'    => 'Responsabilité claire pour chaque véhicule chaque jour. Plus de litiges "je n\'ai pas pris cette voiture".',
		'color_class' => 'mv2-cap-card--amber',
	),
	array(
		'icon'        => '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>',
		'title_en'    => 'Document Compliance',
		'title_fr'    => 'Conformité documentaire',
		'desc_en'     => 'Store driver licences, vehicle papers, and insurance. Get 30-day advance alerts before anything expires.',
		'desc_fr'     => 'Stockez les permis de conduire, documents de véhicule et assurances. Recevez des alertes 30 jours avant toute expiration.',
		'means_en'    => 'No more FRSC surprises. Your fleet stays compliant without you having to remember every expiry date.',
		'means_fr'    => 'Plus de surprises FRSC. Votre flotte reste conforme sans que vous ayez à mémoriser chaque date d\'expiration.',
		'color_class' => 'mv2-cap-card--green',
	),
	array(
		'icon'        => '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>',
		'title_en'    => 'Intelligence Layer',
		'title_fr'    => 'Couche intelligence',
		'desc_en'     => 'Cross-operator fraud signals — anonymised and privacy-safe. Know if a driver has been flagged at another company before you hire them.',
		'desc_fr'     => 'Signaux de fraude entre opérateurs — anonymisés et respectueux de la vie privée. Sachez si un chauffeur a été signalé chez un autre opérateur avant de l\'embaucher.',
		'means_en'    => 'Industry-level protection. One operator\'s bad experience becomes everyone\'s early warning.',
		'means_fr'    => 'Protection au niveau de l\'industrie. L\'expérience négative d\'un opérateur devient l\'alerte précoce de tous.',
		'color_class' => 'mv2-cap-card--purple',
	),
);
?>
<section class="mv2-section mv2-section--light mv2-product-intro" id="mv2-product-intro">
	<div class="mv2-container">

		<div class="mv2-section-header mv2-section-header--center">
			<div class="mv2-badge mv2-badge--primary">
				<span data-lang-en="The Platform" data-lang-fr="La plateforme">The Platform</span>
			</div>
			<h2 class="mv2-section-title">
				<span data-lang-en="Mobiris brings the structure your business needs."
				      data-lang-fr="Mobiris apporte la structure dont votre entreprise a besoin.">Mobiris brings the structure your business needs.</span>
			</h2>
			<p class="mv2-section-subtitle">
				<span data-lang-en="Six capabilities, built specifically for Nigerian and West African transport operators — not adapted from logistics software, not borrowed from ride-hailing."
				      data-lang-fr="Six fonctionnalités, construites spécifiquement pour les opérateurs de transport nigérians et ouest-africains — pas adaptées de logiciels de logistique, pas empruntées au covoiturage.">
					Six capabilities, built specifically for Nigerian and West African transport operators — not adapted from logistics software, not borrowed from ride-hailing.
				</span>
			</p>
		</div>

		<div class="mv2-cap-grid">
			<?php foreach ( $capabilities as $cap ) : ?>
				<div class="mv2-cap-card <?php echo esc_attr( $cap['color_class'] ); ?>">
					<div class="mv2-cap-card__icon" aria-hidden="true">
						<?php echo $cap['icon']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					</div>
					<h3 class="mv2-cap-card__title">
						<span data-lang-en="<?php echo esc_attr( $cap['title_en'] ); ?>"
						      data-lang-fr="<?php echo esc_attr( $cap['title_fr'] ); ?>">
							<?php echo esc_html( $cap['title_en'] ); ?>
						</span>
					</h3>
					<p class="mv2-cap-card__desc">
						<span data-lang-en="<?php echo esc_attr( $cap['desc_en'] ); ?>"
						      data-lang-fr="<?php echo esc_attr( $cap['desc_fr'] ); ?>">
							<?php echo esc_html( $cap['desc_en'] ); ?>
						</span>
					</p>
					<div class="mv2-cap-card__means">
						<div class="mv2-cap-card__means-label">
							<span data-lang-en="What this means for you:" data-lang-fr="Ce que cela signifie pour vous :">What this means for you:</span>
						</div>
						<p class="mv2-cap-card__means-text">
							<span data-lang-en="<?php echo esc_attr( $cap['means_en'] ); ?>"
							      data-lang-fr="<?php echo esc_attr( $cap['means_fr'] ); ?>">
								<?php echo esc_html( $cap['means_en'] ); ?>
							</span>
						</p>
					</div>
				</div>
			<?php endforeach; ?>
		</div>

		<div class="mv2-section-cta mv2-section-cta--center">
			<a href="<?php echo esc_url( mv2_app_url() ); ?>" class="mv2-btn mv2-btn--primary mv2-btn--lg" target="_blank" rel="noopener noreferrer">
				<span data-lang-en="Start Your Free Trial" data-lang-fr="Commencez votre essai gratuit">Start Your Free Trial</span>
			</a>
			<a href="<?php echo esc_url( get_permalink( get_page_by_path( 'product' ) ) ); ?>" class="mv2-btn mv2-btn--outline mv2-btn--lg">
				<span data-lang-en="See full product details" data-lang-fr="Voir les détails complets du produit">See full product details</span>
			</a>
		</div>

	</div>
</section>
