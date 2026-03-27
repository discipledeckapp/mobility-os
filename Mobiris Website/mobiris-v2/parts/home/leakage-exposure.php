<?php
/**
 * Homepage: Leakage Exposure Section.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$leaks = array(
	array(
		'icon'       => '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
		'title_en'   => '"Driver pays short, says customer no pay"',
		'title_fr'   => '"Le chauffeur paie moins, dit que le client n\'a pas payé"',
		'problem_en' => 'No digital record. No proof. You absorb the loss.',
		'problem_fr' => 'Aucun enregistrement. Aucune preuve. Vous absorbez la perte.',
		'impact_en'  => '₦2,000–₦5,000/day per driver',
		'impact_fr'  => '₦2 000–₦5 000/jour par chauffeur',
		'class'      => 'mv2-leak-card--1',
	),
	array(
		'icon'       => '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 12h8m-4-4v8m-7 4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
		'title_en'   => '"Dispute raised — you don\'t know who\'s right"',
		'title_fr'   => '"Conflit soulevé — vous ne savez pas qui a raison"',
		'problem_en' => 'No audit trail. Conflict stays unresolved. Driver keeps working.',
		'problem_fr' => 'Aucune piste d\'audit. Le conflit reste non résolu. Le chauffeur continue.',
		'impact_en'  => 'Unquantified but recurring monthly',
		'impact_fr'  => 'Non quantifié mais récurrent chaque mois',
		'class'      => 'mv2-leak-card--2',
	),
	array(
		'icon'       => '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>',
		'title_en'   => '"Driver is at another company under a different name"',
		'title_fr'   => '"Le chauffeur travaille ailleurs sous un autre nom"',
		'problem_en' => 'No cross-operator signal. You hired someone already flagged by another operator.',
		'problem_fr' => 'Aucun signal entre opérateurs. Vous avez embauché quelqu\'un déjà signalé.',
		'impact_en'  => 'Risk of fraud from day 1 of hire',
		'impact_fr'  => 'Risque de fraude dès le premier jour',
		'class'      => 'mv2-leak-card--3',
	),
	array(
		'icon'       => '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
		'title_en'   => '"Licence expired 6 months ago — FRSC stopped them today"',
		'title_fr'   => '"Permis expiré il y a 6 mois — la FRSC les a arrêtés aujourd\'hui"',
		'problem_en' => 'Vehicle impounded. Driver arrested. Revenue lost for days.',
		'problem_fr' => 'Véhicule saisi. Chauffeur arrêté. Perte de revenus pendant plusieurs jours.',
		'impact_en'  => '₦50,000–₦200,000 per FRSC incident',
		'impact_fr'  => '₦50 000–₦200 000 par incident FRSC',
		'class'      => 'mv2-leak-card--4',
	),
	array(
		'icon'       => '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/></svg>',
		'title_en'   => '"Guarantor on paper — phone number no longer valid"',
		'title_fr'   => '"Garant sur papier — numéro de téléphone invalide"',
		'problem_en' => 'Driver disappears. You can\'t trace them. No verified guarantor to contact.',
		'problem_fr' => 'Le chauffeur disparaît. Vous ne pouvez pas le retrouver. Aucun garant vérifié.',
		'impact_en'  => 'Full vehicle value at risk',
		'impact_fr'  => 'Valeur totale du véhicule en jeu',
		'class'      => 'mv2-leak-card--5',
	),
);
?>
<section class="mv2-section mv2-section--dark mv2-leakage-exposure" id="mv2-leakage-exposure">
	<div class="mv2-container">

		<div class="mv2-section-header mv2-section-header--center mv2-section-header--light">
			<div class="mv2-badge mv2-badge--danger">
				<span data-lang-en="The Problem" data-lang-fr="Le problème">The Problem</span>
			</div>
			<h2 class="mv2-section-title mv2-section-title--light">
				<span data-lang-en="But 10–20% of that money disappears every month."
				      data-lang-fr="Mais 10 à 20 % de cet argent disparaît chaque mois.">But 10–20% of that money disappears every month.</span>
			</h2>
			<p class="mv2-section-subtitle mv2-section-subtitle--light">
				<span data-lang-en="These are the five most common leakage points — and every operator faces at least three of them."
				      data-lang-fr="Ce sont les cinq points de fuite les plus courants — et chaque opérateur en rencontre au moins trois.">These are the five most common leakage points — and every operator faces at least three of them.</span>
			</p>
		</div>

		<!-- Leak Cards -->
		<div class="mv2-leak-grid">
			<?php foreach ( $leaks as $index => $leak ) : ?>
				<div class="mv2-leak-card <?php echo esc_attr( $leak['class'] ); ?>" role="article">
					<div class="mv2-leak-card__number"><?php echo ( $index + 1 ); ?></div>
					<div class="mv2-leak-card__icon" aria-hidden="true">
						<?php echo $leak['icon']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					</div>
					<h3 class="mv2-leak-card__title">
						<span data-lang-en="<?php echo esc_attr( $leak['title_en'] ); ?>"
						      data-lang-fr="<?php echo esc_attr( $leak['title_fr'] ); ?>">
							<?php echo esc_html( $leak['title_en'] ); ?>
						</span>
					</h3>
					<p class="mv2-leak-card__problem">
						<span data-lang-en="<?php echo esc_attr( $leak['problem_en'] ); ?>"
						      data-lang-fr="<?php echo esc_attr( $leak['problem_fr'] ); ?>">
							<?php echo esc_html( $leak['problem_en'] ); ?>
						</span>
					</p>
					<div class="mv2-leak-card__impact">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
						<span data-lang-en="<?php echo esc_attr( $leak['impact_en'] ); ?>"
						      data-lang-fr="<?php echo esc_attr( $leak['impact_fr'] ); ?>">
							<?php echo esc_html( $leak['impact_en'] ); ?>
						</span>
					</div>
				</div>
			<?php endforeach; ?>
		</div>

		<!-- Bottom Callout -->
		<div class="mv2-leakage-callout">
			<div class="mv2-leakage-callout__stat">
				<div class="mv2-leakage-callout__number">₦300K – ₦600K</div>
				<div class="mv2-leakage-callout__label">
					<span data-lang-en="lost monthly for a 20-vehicle operator" data-lang-fr="perdus mensuellement pour un opérateur de 20 véhicules">lost monthly for a 20-vehicle operator</span>
				</div>
			</div>
			<div class="mv2-leakage-callout__divider" aria-hidden="true"></div>
			<div class="mv2-leakage-callout__stat">
				<div class="mv2-leakage-callout__number">₦3.6M – ₦7.2M</div>
				<div class="mv2-leakage-callout__label">
					<span data-lang-en="per year — that's a new vehicle every few months" data-lang-fr="par an — c'est un nouveau véhicule tous les quelques mois">per year — that's a new vehicle every few months</span>
				</div>
			</div>
			<div class="mv2-leakage-callout__divider" aria-hidden="true"></div>
			<div class="mv2-leakage-callout__cta">
				<a href="#mv2-calculator" class="mv2-btn mv2-btn--primary">
					<span data-lang-en="Calculate your leakage" data-lang-fr="Calculez vos pertes">Calculate your leakage</span>
				</a>
			</div>
		</div>

	</div>
</section>
