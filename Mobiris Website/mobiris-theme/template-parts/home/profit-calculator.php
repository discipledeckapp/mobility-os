<?php
/**
 * Profit Calculator Section
 *
 * Interactive JS calculator that estimates monthly remittance leakage for operators.
 * Inputs: vehicle count + vehicle type. Output: leakage estimate in Naira.
 * Bilingual: English + French.
 *
 * @package Mobiris
 * @since 1.0.0
 */
?>

<section id="profit-calculator" class="calculator-section section section--dark" aria-label="Profit calculator">
	<div class="container">

		<div class="calculator-header section-header section-header--light">
			<span class="eyebrow eyebrow--amber"
				data-lang-en="Find out how much you're losing"
				data-lang-fr="Découvrez combien vous perdez">
				Find out how much you're losing
			</span>
			<h2 class="section-title"
				data-lang-en="How much money dey miss from your fleet every month?"
				data-lang-fr="Combien d'argent disparaît de votre flotte chaque mois?">
				How much money dey miss from your fleet every month?
			</h2>
			<p class="section-intro"
				data-lang-en="Enter your fleet size and vehicle type. We'll calculate the estimated monthly leakage you're experiencing right now — before Mobiris."
				data-lang-fr="Entrez la taille de votre flotte et le type de véhicule. Nous calculerons la perte mensuelle estimée que vous subissez en ce moment — avant Mobiris.">
				Enter your fleet size and vehicle type. We'll calculate the estimated monthly leakage you're experiencing right now — before Mobiris.
			</p>
		</div>

		<div class="calculator-card">

			<form id="leakage-calculator" class="calculator-form" novalidate>

				<div class="calc-field-group">
					<label class="calc-label" for="calc-vehicles"
						data-lang-en="How many vehicles do you operate?"
						data-lang-fr="Combien de véhicules opérez-vous?">
						How many vehicles do you operate?
					</label>
					<div class="calc-input-wrap">
						<input
							type="number"
							id="calc-vehicles"
							name="vehicles"
							class="calc-input"
							min="1"
							max="5000"
							placeholder="e.g. 30"
							value="30"
							inputmode="numeric"
							aria-describedby="calc-vehicles-hint"
						/>
						<span class="calc-input-suffix"
							data-lang-en="vehicles"
							data-lang-fr="véhicules">
							vehicles
						</span>
					</div>
					<span class="calc-hint" id="calc-vehicles-hint"
						data-lang-en="Enter the number of vehicles currently in your fleet."
						data-lang-fr="Entrez le nombre de véhicules dans votre flotte.">
						Enter the number of vehicles currently in your fleet.
					</span>
				</div>

				<div class="calc-field-group">
					<label class="calc-label"
						data-lang-en="What type of vehicles?"
						data-lang-fr="Quel type de véhicules?">
						What type of vehicles?
					</label>
					<div class="calc-type-grid">
						<label class="calc-type-option">
							<input type="radio" name="vehicle_type" value="keke" checked/>
							<span class="calc-type-card">
								<span class="calc-type-icon">🛺</span>
								<span class="calc-type-name" data-lang-en="Keke (Tricycle)" data-lang-fr="Keke (Tricycle)">Keke (Tricycle)</span>
								<span class="calc-type-daily">₦3,000–6,000/day</span>
							</span>
						</label>
						<label class="calc-type-option">
							<input type="radio" name="vehicle_type" value="danfo"/>
							<span class="calc-type-card">
								<span class="calc-type-icon">🚌</span>
								<span class="calc-type-name" data-lang-en="Danfo / Minibus" data-lang-fr="Danfo / Minibus">Danfo / Minibus</span>
								<span class="calc-type-daily">₦7,500–15,000/day</span>
							</span>
						</label>
						<label class="calc-type-option">
							<input type="radio" name="vehicle_type" value="korope"/>
							<span class="calc-type-card">
								<span class="calc-type-icon">🚐</span>
								<span class="calc-type-name" data-lang-en="Korope / Shared Taxi" data-lang-fr="Korope / Taxi partagé">Korope / Shared Taxi</span>
								<span class="calc-type-daily">₦6,000–12,000/day</span>
							</span>
						</label>
						<label class="calc-type-option">
							<input type="radio" name="vehicle_type" value="matatu"/>
							<span class="calc-type-card">
								<span class="calc-type-icon">🚎</span>
								<span class="calc-type-name" data-lang-en="Matatu / Trotro" data-lang-fr="Matatu / Trotro">Matatu / Trotro</span>
								<span class="calc-type-daily">KES 800–2,500/day</span>
							</span>
						</label>
					</div>
				</div>

				<div class="calc-field-group">
					<label class="calc-label" for="calc-days"
						data-lang-en="How many days a month do your vehicles operate?"
						data-lang-fr="Combien de jours par mois vos véhicules opèrent-ils?">
						How many days a month do your vehicles operate?
					</label>
					<div class="calc-slider-wrap">
						<input
							type="range"
							id="calc-days"
							name="days"
							class="calc-slider"
							min="10"
							max="30"
							value="26"
							step="1"
							aria-valuemin="10"
							aria-valuemax="30"
							aria-valuenow="26"
						/>
						<div class="calc-slider-labels">
							<span>10</span>
							<span id="calc-days-display" class="calc-slider-current">26 <span data-lang-en="days" data-lang-fr="jours">days</span></span>
							<span>30</span>
						</div>
					</div>
				</div>

			</form><!-- .calculator-form -->

			<!-- Results -->
			<div class="calculator-results" id="calculator-results" aria-live="polite">

				<div class="calc-result-main">
					<div class="calc-result-block calc-result-block--loss">
						<span class="calc-result-label"
							data-lang-en="Estimated monthly leakage"
							data-lang-fr="Perte mensuelle estimée">
							Estimated monthly leakage
						</span>
						<span class="calc-result-value" id="result-leakage">₦0</span>
						<span class="calc-result-sub"
							data-lang-en="at 12% average unreported shortfall"
							data-lang-fr="à 12% de manque à gagner moyen non déclaré">
							at 12% average unreported shortfall
						</span>
					</div>
					<div class="calc-result-divider" aria-hidden="true">→</div>
					<div class="calc-result-block calc-result-block--save">
						<span class="calc-result-label"
							data-lang-en="What Mobiris costs you"
							data-lang-fr="Ce que Mobiris vous coûte">
							What Mobiris costs you
						</span>
						<span class="calc-result-value calc-result-value--small" id="result-plan-cost">₦35,000</span>
						<span class="calc-result-sub"
							data-lang-en="Growth plan /month (up to 20 vehicles)"
							data-lang-fr="Forfait Growth /mois (jusqu'à 20 véhicules)">
							Growth plan /month (up to 20 vehicles)
						</span>
					</div>
					<div class="calc-result-divider" aria-hidden="true">=</div>
					<div class="calc-result-block calc-result-block--net">
						<span class="calc-result-label"
							data-lang-en="Net money back in your pocket"
							data-lang-fr="Argent net récupéré">
							Net money back in your pocket
						</span>
						<span class="calc-result-value calc-result-value--green" id="result-net">₦0</span>
						<span class="calc-result-sub"
							data-lang-en="estimated first-month recovery"
							data-lang-fr="récupération estimée du premier mois">
							estimated first-month recovery
						</span>
					</div>
				</div>

				<div class="calc-result-bar">
					<div class="calc-bar-label"
						data-lang-en="Your ROI in month 1:"
						data-lang-fr="Votre retour sur investissement au mois 1:">
						Your ROI in month 1:
					</div>
					<div class="calc-bar-track">
						<div class="calc-bar-fill" id="result-roi-bar" style="width: 0%"></div>
					</div>
					<div class="calc-bar-value" id="result-roi-text">0×</div>
				</div>

				<div class="calc-result-cta">
					<p class="calc-result-cta-copy"
						data-lang-en="These numbers are conservative. Real operators recover more in month 1 than the platform costs in a year."
						data-lang-fr="Ces chiffres sont conservateurs. Les opérateurs réels récupèrent plus au 1er mois que ce que la plateforme coûte en un an.">
						These numbers are conservative. Real operators recover more in month 1 than the platform costs in a year.
					</p>
					<a href="<?php echo esc_url( get_theme_mod( 'mobiris_signup_url', 'https://app.mobiris.ng/signup' ) ); ?>"
					   class="btn btn-primary btn-lg"
					   data-lang-en="Start recovering money — free for 14 days"
					   data-lang-fr="Commencez à récupérer votre argent — gratuit 14 jours">
						Start recovering money — free for 14 days
					</a>
					<a href="<?php echo esc_url( 'https://wa.me/2348053108039?text=' . rawurlencode( 'Hello, I want to reduce loss in my transport business' ) ); ?>"
					   class="btn btn-whatsapp btn-lg"
					   target="_blank"
					   rel="noopener noreferrer"
					   data-lang-en="Talk to us on WhatsApp"
					   data-lang-fr="Parlez-nous sur WhatsApp">
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 0C4.48 0 0 4.48 0 10c0 1.77.46 3.42 1.27 4.85L0 20l5.29-1.24A9.94 9.94 0 0010 20c5.52 0 10-4.48 10-10S15.52 0 10 0zm5.16 14.09c-.22.61-1.07 1.12-1.75 1.26-.47.1-1.08.17-3.13-.67-2.63-1.07-4.33-3.74-4.46-3.91-.13-.17-1.09-1.45-1.09-2.76 0-1.31.69-1.95 1.06-2.08.37-.13.61-.1.87-.1.21 0 .44 0 .63.48.21.52.72 1.76.78 1.89.06.13.1.28.02.45-.08.17-.12.28-.24.43-.12.15-.25.34-.36.46-.12.13-.24.27-.1.52.14.25.6.99 1.29 1.6.89.79 1.64 1.04 1.87 1.15.24.11.37.09.51-.05.14-.14.59-.69.75-.92.16-.24.32-.2.54-.12.22.08 1.38.65 1.62.77.24.12.4.17.46.27.06.1.06.58-.16 1.19z" fill="currentColor"/></svg>
						Talk to us on WhatsApp
					</a>
				</div>

			</div><!-- .calculator-results -->

		</div><!-- .calculator-card -->

		<p class="calculator-disclaimer"
			data-lang-en="Estimates based on field research with transport operators in Nigeria, Ghana, and Kenya. Actual results vary. Mobiris does not guarantee specific financial outcomes."
			data-lang-fr="Estimations basées sur des recherches terrain auprès d'opérateurs de transport au Nigeria, au Ghana et au Kenya. Les résultats réels varient. Mobiris ne garantit pas de résultats financiers spécifiques.">
			Estimates based on field research with transport operators in Nigeria, Ghana, and Kenya. Actual results vary. Mobiris does not guarantee specific financial outcomes.
		</p>

	</div>
</section>
