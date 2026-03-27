<?php
/**
 * Homepage: Interactive Leakage Calculator.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$starter_price = (int) mv2_option( 'price_starter', 15000 );
$growth_price  = (int) mv2_option( 'price_growth', 35000 );
?>
<section class="mv2-section mv2-section--dark mv2-calculator-section" id="mv2-calculator" aria-label="<?php esc_attr_e( 'Leakage Calculator', 'mobiris-v2' ); ?>">
	<div class="mv2-container">

		<div class="mv2-section-header mv2-section-header--center mv2-section-header--light">
			<div class="mv2-badge mv2-badge--amber">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>
				<span data-lang-en="Leakage Calculator" data-lang-fr="Calculateur de pertes">Leakage Calculator</span>
			</div>
			<h2 class="mv2-section-title mv2-section-title--light">
				<span data-lang-en="How much are you losing every month?"
				      data-lang-fr="Combien perdez-vous chaque mois ?">How much are you losing every month?</span>
			</h2>
			<p class="mv2-section-subtitle mv2-section-subtitle--light">
				<span data-lang-en="Enter your fleet details. See your leakage estimate and what Mobiris would recover for you."
				      data-lang-fr="Entrez les détails de votre flotte. Voyez votre estimation de pertes et ce que Mobiris récupérerait pour vous.">Enter your fleet details. See your leakage estimate and what Mobiris would recover for you.</span>
			</p>
		</div>

		<div class="mv2-calculator" id="mv2-calc-widget" role="form" aria-label="<?php esc_attr_e( 'Leakage Calculator Form', 'mobiris-v2' ); ?>">

			<!-- Calculator Inputs -->
			<div class="mv2-calc-inputs">

				<!-- Vehicle Count -->
				<div class="mv2-calc-field">
					<label for="calc-vehicles" class="mv2-calc-label">
						<span data-lang-en="Number of vehicles" data-lang-fr="Nombre de véhicules">Number of vehicles</span>
					</label>
					<div class="mv2-calc-number-input">
						<button class="mv2-calc-number-btn mv2-calc-number-btn--minus" data-target="calc-vehicles" aria-label="<?php esc_attr_e( 'Decrease vehicles', 'mobiris-v2' ); ?>">−</button>
						<input type="number" id="calc-vehicles" class="mv2-calc-input mv2-calc-input--number" value="10" min="1" max="500" aria-label="<?php esc_attr_e( 'Vehicle count', 'mobiris-v2' ); ?>">
						<button class="mv2-calc-number-btn mv2-calc-number-btn--plus" data-target="calc-vehicles" aria-label="<?php esc_attr_e( 'Increase vehicles', 'mobiris-v2' ); ?>">+</button>
					</div>
				</div>

				<!-- Vehicle Type -->
				<div class="mv2-calc-field">
					<label class="mv2-calc-label">
						<span data-lang-en="Vehicle type" data-lang-fr="Type de véhicule">Vehicle type</span>
					</label>
					<div class="mv2-calc-type-btns" role="radiogroup" aria-label="<?php esc_attr_e( 'Vehicle type selection', 'mobiris-v2' ); ?>">
						<button class="mv2-calc-type-btn" data-type="keke" role="radio" aria-checked="false">
							<span class="mv2-calc-type-btn__name" data-lang-en="Keke" data-lang-fr="Keke">Keke</span>
							<span class="mv2-calc-type-btn__rate">₦3K–6K</span>
						</button>
						<button class="mv2-calc-type-btn is-active" data-type="danfo" role="radio" aria-checked="true">
							<span class="mv2-calc-type-btn__name" data-lang-en="Danfo" data-lang-fr="Danfo">Danfo</span>
							<span class="mv2-calc-type-btn__rate">₦7.5K–15K</span>
						</button>
						<button class="mv2-calc-type-btn" data-type="korope" role="radio" aria-checked="false">
							<span class="mv2-calc-type-btn__name" data-lang-en="Korope" data-lang-fr="Korope">Korope</span>
							<span class="mv2-calc-type-btn__rate">₦6K–12K</span>
						</button>
						<button class="mv2-calc-type-btn" data-type="bus" role="radio" aria-checked="false">
							<span class="mv2-calc-type-btn__name" data-lang-en="Bus" data-lang-fr="Bus">Bus</span>
							<span class="mv2-calc-type-btn__rate">₦12K–25K</span>
						</button>
					</div>
				</div>

				<!-- Custom Daily Rate -->
				<div class="mv2-calc-field">
					<label for="calc-daily-rate" class="mv2-calc-label">
						<span data-lang-en="Daily remittance target (₦) — leave blank to use vehicle type average"
						      data-lang-fr="Cible de remise quotidienne (₦) — laissez vide pour utiliser la moyenne du type de véhicule">Daily remittance target (₦) — leave blank to use vehicle type average</span>
					</label>
					<input type="number" id="calc-daily-rate" class="mv2-calc-input" placeholder="e.g. 10000" min="0" max="100000" aria-label="<?php esc_attr_e( 'Daily remittance target in Naira', 'mobiris-v2' ); ?>">
					<div class="mv2-calc-presets">
						<button class="mv2-calc-preset" data-value="3000">₦3,000</button>
						<button class="mv2-calc-preset" data-value="6000">₦6,000</button>
						<button class="mv2-calc-preset" data-value="10000">₦10,000</button>
						<button class="mv2-calc-preset" data-value="12500">₦12,500</button>
						<button class="mv2-calc-preset" data-value="15000">₦15,000</button>
					</div>
				</div>

				<!-- Operating Days -->
				<div class="mv2-calc-field">
					<label for="calc-days" class="mv2-calc-label">
						<span class="mv2-calc-label__text" data-lang-en="Operating days per month" data-lang-fr="Jours d'exploitation par mois">Operating days per month</span>
						<span class="mv2-calc-label__value" id="calc-days-display">26 <span data-lang-en="days" data-lang-fr="jours">days</span></span>
					</label>
					<input type="range" id="calc-days" class="mv2-calc-slider" min="10" max="30" value="26" aria-label="<?php esc_attr_e( 'Operating days per month', 'mobiris-v2' ); ?>" aria-valuemin="10" aria-valuemax="30" aria-valuenow="26">
					<div class="mv2-calc-slider-labels">
						<span>10</span>
						<span>20</span>
						<span>26</span>
						<span>30</span>
					</div>
				</div>

				<!-- Leakage Percentage -->
				<div class="mv2-calc-field">
					<label for="calc-leakage" class="mv2-calc-label">
						<span class="mv2-calc-label__text" data-lang-en="Estimated leakage %" data-lang-fr="% de pertes estimé">Estimated leakage %</span>
						<span class="mv2-calc-label__value" id="calc-leakage-display">12%</span>
					</label>
					<input type="range" id="calc-leakage" class="mv2-calc-slider mv2-calc-slider--danger" min="5" max="25" value="12" aria-label="<?php esc_attr_e( 'Leakage percentage', 'mobiris-v2' ); ?>" aria-valuemin="5" aria-valuemax="25" aria-valuenow="12">
					<div class="mv2-calc-slider-labels">
						<span>5% <span data-lang-en="(low)" data-lang-fr="(faible)">(low)</span></span>
						<span>12% <span data-lang-en="(typical)" data-lang-fr="(typique)">(typical)</span></span>
						<span>25% <span data-lang-en="(high)" data-lang-fr="(élevé)">(high)</span></span>
					</div>
				</div>

			</div><!-- .mv2-calc-inputs -->

			<!-- Calculator Results -->
			<div class="mv2-calc-results" aria-live="polite" aria-label="<?php esc_attr_e( 'Calculator results', 'mobiris-v2' ); ?>">

				<div class="mv2-calc-results__header">
					<span data-lang-en="Your monthly estimate" data-lang-fr="Votre estimation mensuelle">Your monthly estimate</span>
				</div>

				<div class="mv2-calc-results__grid">
					<div class="mv2-calc-result-item">
						<div class="mv2-calc-result-item__label">
							<span data-lang-en="Monthly revenue" data-lang-fr="Revenus mensuels">Monthly revenue</span>
						</div>
						<div class="mv2-calc-result-item__value" id="result-revenue">₦2,925,000</div>
					</div>

					<div class="mv2-calc-result-item mv2-calc-result-item--danger">
						<div class="mv2-calc-result-item__label">
							<span data-lang-en="Estimated monthly leakage" data-lang-fr="Pertes mensuelles estimées">Estimated monthly leakage</span>
						</div>
						<div class="mv2-calc-result-item__value" id="result-leakage">₦351,000</div>
						<div class="mv2-calc-result-item__sub">
							<span data-lang-en="This is what's disappearing" data-lang-fr="C'est ce qui disparaît">This is what's disappearing</span>
						</div>
					</div>

					<div class="mv2-calc-result-item mv2-calc-result-item--success">
						<div class="mv2-calc-result-item__label">
							<span data-lang-en="Recoverable with Mobiris (est. 80%)" data-lang-fr="Récupérable avec Mobiris (est. 80%)">Recoverable with Mobiris (est. 80%)</span>
						</div>
						<div class="mv2-calc-result-item__value" id="result-recoverable">₦280,800</div>
					</div>

					<div class="mv2-calc-result-item mv2-calc-result-item--muted">
						<div class="mv2-calc-result-item__label">
							<span data-lang-en="Mobiris monthly cost" data-lang-fr="Coût mensuel Mobiris">Mobiris monthly cost</span>
						</div>
						<div class="mv2-calc-result-item__value" id="result-plan-cost">₦35,000</div>
						<div class="mv2-calc-result-item__sub" id="result-plan-name">Growth Plan</div>
					</div>
				</div>

				<!-- Net Gain — Big Number -->
				<div class="mv2-calc-net-gain">
					<div class="mv2-calc-net-gain__label">
						<span data-lang-en="Estimated monthly net gain" data-lang-fr="Gain net mensuel estimé">Estimated monthly net gain</span>
					</div>
					<div class="mv2-calc-net-gain__amount" id="result-net">₦245,800</div>
					<div class="mv2-calc-net-gain__payback">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
						<span data-lang-en="Mobiris pays for itself in" data-lang-fr="Mobiris s'autofinance en">Mobiris pays for itself in</span>
						<strong id="result-payback">4 days</strong>
					</div>
				</div>

				<!-- CTA -->
				<div class="mv2-calc-cta">
					<a href="<?php echo esc_url( mv2_app_url() ); ?>" class="mv2-btn mv2-btn--primary mv2-btn--lg mv2-btn--full" target="_blank" rel="noopener noreferrer">
						<span data-lang-en="Stop the leakage — start free today" data-lang-fr="Arrêtez les pertes — commencez gratuitement aujourd'hui">Stop the leakage — start free today</span>
					</a>
					<p class="mv2-calc-cta__disclaimer">
						<span data-lang-en="Estimates based on typical Nigerian transport operator data. Individual results vary based on fleet size, management practices, and market conditions."
						      data-lang-fr="Estimations basées sur les données typiques des opérateurs de transport nigérians. Les résultats individuels varient selon la taille de la flotte, les pratiques de gestion et les conditions du marché.">Estimates based on typical Nigerian transport operator data. Individual results vary based on fleet size, management practices, and market conditions.</span>
					</p>
				</div>

			</div><!-- .mv2-calc-results -->

		</div><!-- .mv2-calculator -->

	</div>
</section>
