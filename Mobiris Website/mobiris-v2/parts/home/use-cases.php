<?php
/**
 * Homepage: Use-Case Scenarios (NOT testimonials).
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$use_cases = array(
	array(
		'icon'        => '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
		'scenario_en' => '30-vehicle danfo operator in Lagos',
		'scenario_fr' => 'Opérateur de 30 danfo à Lagos',
		'operator_en' => 'A Lagos-based operator runs 30 danfo across 3 routes in Oshodi, Ikorodu, and Agege. Before, he tracked remittance in Excel and WhatsApp. Disputes happened every week. End-of-month reconciliation took days.',
		'operator_fr' => 'Un opérateur basé à Lagos gère 30 danfo sur 3 routes à Oshodi, Ikorodu et Agege. Avant, il suivait les remises dans Excel et WhatsApp. Des litiges survenaient chaque semaine. Le rapprochement de fin de mois prenait des jours.',
		'benefit_en'  => 'Disputes are now resolved the same day with timestamped records. Compliance documents are digital and accessible. The operator used his Mobiris records to support a bank loan application for vehicle expansion.',
		'benefit_fr'  => 'Les litiges sont maintenant résolus le même jour avec des enregistrements horodatés. Les documents de conformité sont numériques et accessibles. L\'opérateur a utilisé ses enregistrements Mobiris pour appuyer une demande de prêt bancaire pour l\'expansion de sa flotte.',
		'key_en'      => 'Same-day dispute resolution. Bank-ready compliance records.',
		'key_fr'      => 'Résolution des litiges le même jour. Dossiers de conformité bancables.',
		'color_class' => 'mv2-usecase-card--blue',
	),
	array(
		'icon'        => '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v5"/><circle cx="14" cy="17" r="2"/><circle cx="6" cy="17" r="2"/></svg>',
		'scenario_en' => 'Keke operator expanding to a second depot',
		'scenario_fr' => 'Opérateur de keke s\'étendant à un deuxième dépôt',
		'operator_en' => 'An Abuja-based operator has 8 keke running out of his first depot in Wuse. He\'s adding 6 more from a second location in Lugbe. Managing both locations means he can\'t be physically present at either.',
		'operator_fr' => 'Un opérateur basé à Abuja exploite 8 keke depuis son premier dépôt à Wuse. Il en ajoute 6 de plus depuis un deuxième emplacement à Lugbe. Gérer les deux emplacements signifie qu\'il ne peut pas être physiquement présent à l\'un ou l\'autre.',
		'benefit_en'  => 'Guarantor verification and remittance tracking maintain control across both depots without requiring his physical presence. He reviews collections each evening from his phone and only drives to a depot when there\'s a flagged issue.',
		'benefit_fr'  => 'La vérification des garants et le suivi des remises maintiennent le contrôle dans les deux dépôts sans nécessiter sa présence physique. Il examine les collectes chaque soir depuis son téléphone et ne se rend au dépôt que lorsqu\'il y a un problème signalé.',
		'key_en'      => 'Remote control across multiple locations. Physical presence only when needed.',
		'key_fr'      => 'Contrôle à distance sur plusieurs sites. Présence physique uniquement si nécessaire.',
		'color_class' => 'mv2-usecase-card--green',
	),
	array(
		'icon'        => '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
		'scenario_en' => 'Investor managing a driver-run fleet',
		'scenario_fr' => 'Investisseur gérant une flotte conduite par des chauffeurs',
		'operator_en' => 'A civil servant in Port Harcourt bought 5 vehicles using savings and a loan. She doesn\'t drive. She doesn\'t manage drivers directly. Her income depends entirely on daily remittance from 5 strangers.',
		'operator_fr' => 'Une fonctionnaire à Port Harcourt a acheté 5 véhicules grâce à ses économies et à un prêt. Elle ne conduit pas. Elle ne gère pas directement les chauffeurs. Son revenu dépend entièrement de la remise quotidienne de 5 étrangers.',
		'benefit_en'  => 'Mobiris gives her daily remittance visibility, driver identity verification, and instant alerts when a collection is missed. She reviews her fleet dashboard on her lunch break. When a driver didn\'t report for three days, she had all the records to resolve it properly.',
		'benefit_fr'  => 'Mobiris lui donne une visibilité quotidienne des remises, la vérification de l\'identité des chauffeurs et des alertes instantanées lorsqu\'une collecte est manquée. Elle consulte le tableau de bord de sa flotte pendant sa pause déjeuner.',
		'key_en'      => 'Passive investment with active visibility. No daily management required.',
		'key_fr'      => 'Investissement passif avec visibilité active. Aucune gestion quotidienne nécessaire.',
		'color_class' => 'mv2-usecase-card--purple',
	),
);

// Also fetch any published mv2_use_case CPT entries.
$cpt_cases = get_posts(
	array(
		'post_type'      => 'mv2_use_case',
		'posts_per_page' => 3,
		'orderby'        => 'date',
		'order'          => 'DESC',
		'post_status'    => 'publish',
	)
);
?>
<section class="mv2-section mv2-section--light mv2-use-cases" id="mv2-use-cases">
	<div class="mv2-container">

		<div class="mv2-section-header mv2-section-header--center">
			<div class="mv2-badge mv2-badge--primary">
				<span data-lang-en="Scenarios" data-lang-fr="Scénarios">Scenarios</span>
			</div>
			<h2 class="mv2-section-title">
				<span data-lang-en="How operators use Mobiris"
				      data-lang-fr="Comment les opérateurs utilisent Mobiris">How operators use Mobiris</span>
			</h2>
			<p class="mv2-section-subtitle">
				<span data-lang-en="These are realistic scenarios — not testimonials. They reflect how Mobiris functions in real transport contexts."
				      data-lang-fr="Ce sont des scénarios réalistes — pas des témoignages. Ils reflètent comment Mobiris fonctionne dans des contextes de transport réels.">These are realistic scenarios — not testimonials. They reflect how Mobiris functions in real transport contexts.</span>
			</p>
		</div>

		<!-- Hardcoded Scenarios -->
		<div class="mv2-usecase-grid">
			<?php foreach ( $use_cases as $case ) : ?>
				<div class="mv2-usecase-card <?php echo esc_attr( $case['color_class'] ); ?>">
					<div class="mv2-usecase-card__icon" aria-hidden="true">
						<?php echo $case['icon']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					</div>
					<div class="mv2-usecase-card__scenario">
						<span data-lang-en="<?php echo esc_attr( $case['scenario_en'] ); ?>"
						      data-lang-fr="<?php echo esc_attr( $case['scenario_fr'] ); ?>">
							<?php echo esc_html( $case['scenario_en'] ); ?>
						</span>
					</div>
					<p class="mv2-usecase-card__operator">
						<span data-lang-en="<?php echo esc_attr( $case['operator_en'] ); ?>"
						      data-lang-fr="<?php echo esc_attr( $case['operator_fr'] ); ?>">
							<?php echo esc_html( $case['operator_en'] ); ?>
						</span>
					</p>
					<div class="mv2-usecase-card__benefit">
						<p>
							<span data-lang-en="<?php echo esc_attr( $case['benefit_en'] ); ?>"
							      data-lang-fr="<?php echo esc_attr( $case['benefit_fr'] ); ?>">
								<?php echo esc_html( $case['benefit_en'] ); ?>
							</span>
						</p>
					</div>
					<div class="mv2-usecase-card__key">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="<?php echo esc_attr( $case['key_en'] ); ?>"
						      data-lang-fr="<?php echo esc_attr( $case['key_fr'] ); ?>">
							<?php echo esc_html( $case['key_en'] ); ?>
						</span>
					</div>
					<div class="mv2-usecase-card__footer">
						<span data-lang-en="This is what Mobiris makes possible." data-lang-fr="C'est ce que Mobiris rend possible.">This is what Mobiris makes possible.</span>
					</div>
				</div>
			<?php endforeach; ?>
		</div>

		<?php if ( $cpt_cases ) : ?>
			<!-- CPT-based Use Cases -->
			<div class="mv2-usecase-cpt-grid">
				<?php foreach ( $cpt_cases as $post ) : setup_postdata( $post ); ?>
					<article class="mv2-usecase-cpt-card mv2-card">
						<?php if ( has_post_thumbnail( $post ) ) : ?>
							<div class="mv2-usecase-cpt-card__thumb">
								<?php echo get_the_post_thumbnail( $post, 'mv2-thumb', array( 'alt' => esc_attr( get_the_title( $post ) ) ) ); ?>
							</div>
						<?php endif; ?>
						<div class="mv2-usecase-cpt-card__body">
							<h3 class="mv2-usecase-cpt-card__title">
								<a href="<?php echo esc_url( get_permalink( $post ) ); ?>"><?php echo esc_html( get_the_title( $post ) ); ?></a>
							</h3>
							<p class="mv2-usecase-cpt-card__excerpt"><?php echo esc_html( get_the_excerpt( $post ) ); ?></p>
							<a href="<?php echo esc_url( get_permalink( $post ) ); ?>" class="mv2-btn mv2-btn--text">
								<?php esc_html_e( 'Read scenario', 'mobiris-v2' ); ?> &rarr;
							</a>
						</div>
					</article>
				<?php endforeach; wp_reset_postdata(); ?>
			</div>
		<?php endif; ?>

	</div>
</section>
