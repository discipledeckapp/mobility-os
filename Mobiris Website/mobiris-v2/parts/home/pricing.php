<?php
/**
 * Homepage: Pricing Section — 3 tiers.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$starter_price    = (int) mv2_option( 'price_starter', 15000 );
$growth_price     = (int) mv2_option( 'price_growth', 35000 );
$starter_vehicles = (int) mv2_option( 'price_starter_vehicles', 10 );
$growth_vehicles  = (int) mv2_option( 'price_growth_vehicles', 20 );
$verify_price     = (int) mv2_option( 'price_verification', 1000 );
$trial_days       = (int) mv2_option( 'price_trial_days', 14 );
?>
<section class="mv2-section mv2-section--light mv2-pricing" id="mv2-pricing">
	<div class="mv2-container">

		<div class="mv2-section-header mv2-section-header--center">
			<div class="mv2-badge mv2-badge--primary">
				<span data-lang-en="Pricing" data-lang-fr="Tarifs">Pricing</span>
			</div>
			<h2 class="mv2-section-title">
				<span data-lang-en="Simple, transparent pricing." data-lang-fr="Tarification simple et transparente.">Simple, transparent pricing.</span>
			</h2>
			<p class="mv2-section-subtitle">
				<span data-lang-en="Start free for <?php echo esc_html( $trial_days ); ?> days. No card required."
				      data-lang-fr="Commencez gratuitement pendant <?php echo esc_html( $trial_days ); ?> jours. Sans carte bancaire.">
					Start free for <?php echo esc_html( $trial_days ); ?> days. No card required.
				</span>
			</p>
		</div>

		<div class="mv2-pricing-grid">

			<!-- Starter Plan -->
			<div class="mv2-pricing-card mv2-pricing-card--starter">
				<div class="mv2-pricing-card__header">
					<div class="mv2-pricing-card__plan">
						<span data-lang-en="Starter" data-lang-fr="Débutant">Starter</span>
					</div>
					<div class="mv2-pricing-card__price">
						<span class="mv2-pricing-card__amount"><?php echo mv2_naira( $starter_price ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
						<span class="mv2-pricing-card__period">
							/<span data-lang-en="month" data-lang-fr="mois">month</span>
						</span>
					</div>
					<div class="mv2-pricing-card__vehicles">
						<span data-lang-en="Up to <?php echo esc_html( $starter_vehicles ); ?> vehicles"
						      data-lang-fr="Jusqu'à <?php echo esc_html( $starter_vehicles ); ?> véhicules">
							Up to <?php echo esc_html( $starter_vehicles ); ?> vehicles
						</span>
					</div>
				</div>
				<ul class="mv2-pricing-card__features">
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="Biometric driver verification" data-lang-fr="Vérification biométrique des chauffeurs">Biometric driver verification</span>
					</li>
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="Remittance tracking with audit trail" data-lang-fr="Suivi des remises avec piste d'audit">Remittance tracking with audit trail</span>
					</li>
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="Vehicle-to-driver assignment records" data-lang-fr="Enregistrements d'affectation véhicule-chauffeur">Vehicle-to-driver assignment records</span>
					</li>
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="Document storage and expiry alerts" data-lang-fr="Stockage de documents et alertes d'expiration">Document storage and expiry alerts</span>
					</li>
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="Guarantor capture and verification" data-lang-fr="Capture et vérification des garants">Guarantor capture and verification</span>
					</li>
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="WhatsApp + email support" data-lang-fr="Support WhatsApp + email">WhatsApp + email support</span>
					</li>
					<li class="mv2-pricing-card__feature--addon">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
						<span data-lang-en="Identity checks: <?php echo mv2_naira( $verify_price ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>/check (add-on)"
						      data-lang-fr="Contrôles d'identité: <?php echo mv2_naira( $verify_price ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>/vérification (module complémentaire)">
							Identity checks: <?php echo mv2_naira( $verify_price ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>/check (add-on)
						</span>
					</li>
				</ul>
				<div class="mv2-pricing-card__cta">
					<a href="<?php echo esc_url( mv2_app_url() ); ?>" class="mv2-btn mv2-btn--outline mv2-btn--full" target="_blank" rel="noopener noreferrer">
						<span data-lang-en="Start free — <?php echo esc_html( $trial_days ); ?> days"
						      data-lang-fr="Commencer gratuitement — <?php echo esc_html( $trial_days ); ?> jours">
							Start free — <?php echo esc_html( $trial_days ); ?> days
						</span>
					</a>
				</div>
			</div>

			<!-- Growth Plan — FEATURED -->
			<div class="mv2-pricing-card mv2-pricing-card--growth mv2-pricing-card--featured">
				<div class="mv2-pricing-card__featured-badge">
					<span data-lang-en="Most Popular" data-lang-fr="Le plus populaire">Most Popular</span>
				</div>
				<div class="mv2-pricing-card__header">
					<div class="mv2-pricing-card__plan">
						<span data-lang-en="Growth" data-lang-fr="Croissance">Growth</span>
					</div>
					<div class="mv2-pricing-card__price">
						<span class="mv2-pricing-card__amount"><?php echo mv2_naira( $growth_price ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
						<span class="mv2-pricing-card__period">
							/<span data-lang-en="month" data-lang-fr="mois">month</span>
						</span>
					</div>
					<div class="mv2-pricing-card__vehicles">
						<span data-lang-en="<?php echo esc_html( $growth_vehicles ); ?>+ vehicles"
						      data-lang-fr="<?php echo esc_html( $growth_vehicles ); ?>+ véhicules">
							<?php echo esc_html( $growth_vehicles ); ?>+ vehicles
						</span>
					</div>
				</div>
				<ul class="mv2-pricing-card__features">
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="Everything in Starter" data-lang-fr="Tout ce qui est dans Débutant">Everything in Starter</span>
					</li>
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="Intelligence layer — cross-operator risk signals" data-lang-fr="Couche intelligence — signaux de risque entre opérateurs">Intelligence layer — cross-operator risk signals</span>
					</li>
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="Multi-depot support" data-lang-fr="Support multi-dépôt">Multi-depot support</span>
					</li>
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="Advanced analytics and reporting" data-lang-fr="Analyses et rapports avancés">Advanced analytics and reporting</span>
					</li>
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="Export records for banks and insurance" data-lang-fr="Exporter les dossiers pour les banques et assurances">Export records for banks and insurance</span>
					</li>
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="Priority WhatsApp support" data-lang-fr="Support WhatsApp prioritaire">Priority WhatsApp support</span>
					</li>
					<li class="mv2-pricing-card__feature--addon">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
						<span data-lang-en="Identity checks: <?php echo mv2_naira( $verify_price ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>/check (add-on)"
						      data-lang-fr="Contrôles d'identité: <?php echo mv2_naira( $verify_price ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>/vérification">
							Identity checks: <?php echo mv2_naira( $verify_price ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>/check (add-on)
						</span>
					</li>
				</ul>
				<div class="mv2-pricing-card__cta">
					<a href="<?php echo esc_url( mv2_app_url() ); ?>" class="mv2-btn mv2-btn--primary mv2-btn--full" target="_blank" rel="noopener noreferrer">
						<span data-lang-en="Start free — <?php echo esc_html( $trial_days ); ?> days"
						      data-lang-fr="Commencer gratuitement — <?php echo esc_html( $trial_days ); ?> jours">
							Start free — <?php echo esc_html( $trial_days ); ?> days
						</span>
					</a>
				</div>
			</div>

			<!-- Enterprise Plan -->
			<div class="mv2-pricing-card mv2-pricing-card--enterprise">
				<div class="mv2-pricing-card__header">
					<div class="mv2-pricing-card__plan">
						<span data-lang-en="Enterprise" data-lang-fr="Entreprise">Enterprise</span>
					</div>
					<div class="mv2-pricing-card__price mv2-pricing-card__price--custom">
						<span data-lang-en="Custom pricing" data-lang-fr="Tarification personnalisée">Custom pricing</span>
					</div>
					<div class="mv2-pricing-card__vehicles">
						<span data-lang-en="Multi-depot · API access · White-label"
						      data-lang-fr="Multi-dépôt · Accès API · Marque blanche">Multi-depot · API access · White-label</span>
					</div>
				</div>
				<ul class="mv2-pricing-card__features">
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="Everything in Growth" data-lang-fr="Tout ce qui est dans Croissance">Everything in Growth</span>
					</li>
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="API access for custom integrations" data-lang-fr="Accès API pour intégrations personnalisées">API access for custom integrations</span>
					</li>
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="Custom SLA and uptime commitments" data-lang-fr="SLA personnalisé et engagements de disponibilité">Custom SLA and uptime commitments</span>
					</li>
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="White-label option for fleet operators" data-lang-fr="Option marque blanche pour opérateurs de flotte">White-label option for fleet operators</span>
					</li>
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="Volume discounts on identity checks" data-lang-fr="Remises sur volume pour les contrôles d'identité">Volume discounts on identity checks</span>
					</li>
					<li>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span data-lang-en="Dedicated account management" data-lang-fr="Gestion de compte dédiée">Dedicated account management</span>
					</li>
				</ul>
				<div class="mv2-pricing-card__cta">
					<a href="<?php echo esc_url( mv2_wa_url( 'I want to discuss enterprise pricing for Mobiris' ) ); ?>"
					   class="mv2-btn mv2-btn--outline mv2-btn--full"
					   target="_blank"
					   rel="noopener noreferrer">
						<span data-lang-en="Talk to us" data-lang-fr="Parlez-nous">Talk to us</span>
					</a>
				</div>
			</div>

		</div>

		<!-- Verification Add-on Note -->
		<div class="mv2-pricing-addon-note">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
			<p>
				<strong>
					<span data-lang-en="Identity verification add-on:" data-lang-fr="Module complémentaire de vérification d'identité :">Identity verification add-on:</span>
				</strong>
				<span data-lang-en=" <?php echo mv2_naira( $verify_price ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> per biometric + government ID check. Only pay when you verify a new driver. Checks are cached per driver — you never pay twice for the same person."
				      data-lang-fr=" <?php echo mv2_naira( $verify_price ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> par vérification biométrique + pièce d'identité gouvernementale. Payez uniquement lors de la vérification d'un nouveau chauffeur.">
					<?php echo ' ' . mv2_naira( $verify_price ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> per biometric + government ID check. Only pay when you verify a new driver. Checks are cached per driver — you never pay twice for the same person.
				</span>
			</p>
		</div>

		<div class="mv2-section-cta mv2-section-cta--center">
			<a href="<?php echo esc_url( get_permalink( get_page_by_path( 'pricing' ) ) ); ?>" class="mv2-btn mv2-btn--text">
				<span data-lang-en="See full pricing details and FAQ" data-lang-fr="Voir les détails complets des tarifs et la FAQ">See full pricing details and FAQ</span>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
			</a>
		</div>

	</div>
</section>
