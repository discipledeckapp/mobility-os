<?php
/**
 * Template Name: Pricing
 *
 * @package Mobiris
 */

get_header(); ?>

<main id="primary" class="site-main">

	<!-- Page Header -->
	<section class="page-header page-header--dark" style="background-color: #0F172A;">
		<div class="container mx-auto px-4 py-20 md:py-32">
			<div class="max-w-3xl mx-auto text-center">
				<h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" style="font-family: 'DM Sans', sans-serif;">Simple pricing for African fleet operators</h1>
				<p class="text-xl md:text-2xl text-gray-300 mb-6" style="font-family: 'DM Sans', sans-serif;">Start free. Scale as your fleet grows. No hidden fees, no professional services, no lengthy onboarding.</p>
				<p class="text-gray-400" style="font-family: 'DM Sans', sans-serif;">Pricing shown in NGN. GHS, KES, ZAR pricing available — <a href="<?php echo esc_url( home_url( '/contact' ) ); ?>" style="color: #2563EB; text-decoration: underline;">contact us</a>.</p>
			</div>
		</div>
	</section>

	<!-- Pricing Toggle -->
	<section class="pricing-toggle-section py-8" style="background-color: white; border-bottom: 1px solid #E2E8F0;">
		<div class="container mx-auto px-4">
			<div class="flex justify-center items-center gap-4">
				<label style="font-family: 'DM Sans', sans-serif;">
					<input type="radio" name="billing_period" value="monthly" checked> Monthly
				</label>
				<label style="font-family: 'DM Sans', sans-serif;">
					<input type="radio" name="billing_period" value="annual"> Annual
					<span style="color: #16A34A; font-weight: bold; margin-left: 4px;">(Save 20%)</span>
				</label>
			</div>
		</div>
	</section>

	<!-- Pricing Cards -->
	<section class="pricing-cards-section py-16 md:py-24" style="background-color: #F8FAFC;">
		<div class="container mx-auto px-4">
			<div class="max-w-5xl mx-auto">

				<!-- Starter Plan -->
				<div class="pricing-card p-8 rounded-xl mb-6" style="background-color: white; border: 2px solid #E2E8F0;">
					<div class="grid grid-cols-1 md:grid-cols-4 gap-8">
						<div class="md:col-span-1">
							<h3 class="text-2xl font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Starter</h3>
							<p class="text-gray-600 text-sm mb-6" style="font-family: 'DM Sans', sans-serif;">Perfect for small operators getting started</p>

							<div class="price-display mb-6">
								<span class="text-4xl font-bold" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">₦15K</span>
								<span class="text-gray-600" style="font-family: 'DM Sans', sans-serif;">/month</span>
							</div>

							<p class="text-gray-700 text-sm mb-6" style="font-family: 'DM Sans', sans-serif;">Up to 10 vehicles. Includes all core features.</p>

							<a href="<?php echo esc_url( home_url( '/get-started' ) ); ?>" class="block text-center px-6 py-3 rounded-lg font-semibold text-white mb-6" style="background-color: #2563EB; font-family: 'DM Sans', sans-serif; text-decoration: none;">Get started free</a>
						</div>

						<div class="md:col-span-3">
							<h4 class="font-bold mb-4" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">What's included:</h4>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
								<ul class="space-y-3">
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">Up to 10 vehicles</span>
									</li>
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">Driver management & records</span>
									</li>
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">Vehicle management</span>
									</li>
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">Daily remittance tracking</span>
									</li>
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">Assignment & dispatch</span>
									</li>
								</ul>
								<ul class="space-y-3">
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">Compliance tracking</span>
									</li>
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">Web console</span>
									</li>
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">iOS & Android apps</span>
									</li>
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">Email support</span>
									</li>
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">14-day free trial</span>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>

				<!-- Growth Plan -->
				<div class="pricing-card p-8 rounded-xl mb-6" style="background-color: white; border: 3px solid #2563EB;">
					<div class="grid grid-cols-1 md:grid-cols-4 gap-8">
						<div class="md:col-span-1">
							<div style="display: inline-block; background-color: #2563EB; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 16px; font-family: 'DM Sans', sans-serif;">POPULAR</div>
							<h3 class="text-2xl font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Growth</h3>
							<p class="text-gray-600 text-sm mb-6" style="font-family: 'DM Sans', sans-serif;">For growing fleets and intelligence access</p>

							<div class="price-display mb-6">
								<span class="text-4xl font-bold" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">₦35K</span>
								<span class="text-gray-600" style="font-family: 'DM Sans', sans-serif;">/month base</span>
								<div class="text-sm text-gray-600 mt-2" style="font-family: 'DM Sans', sans-serif;">+ ₦1.5K per vehicle above 20</div>
							</div>

							<p class="text-gray-700 text-sm mb-6" style="font-family: 'DM Sans', sans-serif;">For fleets 20–200+ vehicles.</p>

							<a href="<?php echo esc_url( home_url( '/get-started' ) ); ?>" class="block text-center px-6 py-3 rounded-lg font-semibold text-white mb-6" style="background-color: #2563EB; font-family: 'DM Sans', sans-serif; text-decoration: none;">Get started free</a>
						</div>

						<div class="md:col-span-3">
							<h4 class="font-bold mb-4" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Everything in Starter, plus:</h4>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
								<ul class="space-y-3">
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">20+ vehicles supported</span>
									</li>
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">Cross-operator risk signals</span>
									</li>
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">Biometric uniqueness checking</span>
									</li>
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">Driver history lookups</span>
									</li>
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">Advanced reporting</span>
									</li>
								</ul>
								<ul class="space-y-3">
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">Priority support</span>
									</li>
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">WhatsApp integration</span>
									</li>
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">Custom branding (coming)</span>
									</li>
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">Webhooks & API access</span>
									</li>
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">14-day free trial</span>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>

				<!-- Enterprise Plan -->
				<div class="pricing-card p-8 rounded-xl" style="background-color: white; border: 2px solid #E2E8F0;">
					<div class="grid grid-cols-1 md:grid-cols-4 gap-8">
						<div class="md:col-span-1">
							<h3 class="text-2xl font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Enterprise</h3>
							<p class="text-gray-600 text-sm mb-6" style="font-family: 'DM Sans', sans-serif;">Custom for large operators and groups</p>

							<div class="price-display mb-6">
								<span class="text-2xl font-bold" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Custom ARR</span>
								<div class="text-sm text-gray-600 mt-2" style="font-family: 'DM Sans', sans-serif;">Based on your fleet size and needs</div>
							</div>

							<a href="<?php echo esc_url( home_url( '/contact' ) ); ?>" class="block text-center px-6 py-3 rounded-lg font-semibold border-2" style="border-color: #2563EB; color: #2563EB; font-family: 'DM Sans', sans-serif; text-decoration: none;">Contact sales</a>
						</div>

						<div class="md:col-span-3">
							<h4 class="font-bold mb-4" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Everything in Growth, plus:</h4>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
								<ul class="space-y-3">
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">Multi-entity architecture</span>
									</li>
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">Unified cross-entity reporting</span>
									</li>
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">Full intelligence plane access</span>
									</li>
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">SSO & SAML 2.0</span>
									</li>
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">Role-based access control</span>
									</li>
								</ul>
								<ul class="space-y-3">
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">Consolidated billing</span>
									</li>
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">Custom data residency</span>
									</li>
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">Dedicated account manager</span>
									</li>
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">Phone & chat support</span>
									</li>
									<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
										<span class="text-blue-600 font-bold mr-3">✓</span>
										<span class="text-gray-700">Custom SLA & contracts</span>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>

			</div>
		</div>
	</section>

	<!-- Add-ons -->
	<section class="addons-section py-16 md:py-24" style="background-color: white;">
		<div class="container mx-auto px-4">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-12 text-center" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Pay only for what you use</h2>
				<p class="text-center text-gray-700 mb-12" style="font-family: 'DM Sans', sans-serif;">Add-on usage is billed monthly alongside your subscription. No minimum commitments, no lock-in.</p>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div class="addon-card p-8 rounded-xl" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<h3 class="text-lg font-bold mb-3" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Driver verification</h3>
						<div class="text-3xl font-bold mb-3" style="color: #2563EB; font-family: 'DM Sans', sans-serif;">₦1,000</div>
						<p class="text-gray-700 text-sm" style="font-family: 'DM Sans', sans-serif;">per driver per verification</p>
						<p class="text-gray-600 text-xs mt-4" style="font-family: 'DM Sans', sans-serif;">Includes biometric check, ID validation, and uniqueness screening across the network.</p>
					</div>

					<div class="addon-card p-8 rounded-xl" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<h3 class="text-lg font-bold mb-3" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Guarantor verification</h3>
						<div class="text-3xl font-bold mb-3" style="color: #2563EB; font-family: 'DM Sans', sans-serif;">₦1,000</div>
						<p class="text-gray-700 text-sm" style="font-family: 'DM Sans', sans-serif;">per guarantor per verification</p>
						<p class="text-gray-600 text-xs mt-4" style="font-family: 'DM Sans', sans-serif;">Verify guarantor identity and linkage to driver. Build trust networks.</p>
					</div>

					<div class="addon-card p-8 rounded-xl" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<h3 class="text-lg font-bold mb-3" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Cross-operator risk lookup</h3>
						<div class="text-3xl font-bold mb-3" style="color: #2563EB; font-family: 'DM Sans', sans-serif;">₦400</div>
						<p class="text-gray-700 text-sm" style="font-family: 'DM Sans', sans-serif;">per query</p>
						<p class="text-gray-600 text-xs mt-4" style="font-family: 'DM Sans', sans-serif;">Check if a driver has been flagged by other operators. Intelligence plane query.</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ROI Calculator -->
	<section class="roi-calculator-section py-16 md:py-24" style="background-color: #F8FAFC;">
		<div class="container mx-auto px-4">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-12 text-center" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Calculate your return</h2>

				<div class="calculator-card p-8 rounded-xl" style="background-color: white; border: 1px solid #E2E8F0;">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div>
							<div class="mb-6">
								<label style="display: block; font-weight: bold; color: #0F172A; margin-bottom: 8px; font-family: 'DM Sans', sans-serif;">Number of vehicles</label>
								<input type="number" id="calc_vehicles" value="50" min="1" max="1000" style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; font-family: 'DM Sans', sans-serif;">
								<input type="range" id="calc_vehicles_slider" value="50" min="1" max="1000" style="width: 100%; margin-top: 8px;">
							</div>

							<div class="mb-6">
								<label style="display: block; font-weight: bold; color: #0F172A; margin-bottom: 8px; font-family: 'DM Sans', sans-serif;">Daily remittance per vehicle (₦)</label>
								<input type="number" id="calc_remittance" value="15000" min="1000" max="100000" step="1000" style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; font-family: 'DM Sans', sans-serif;">
								<input type="range" id="calc_remittance_slider" value="15000" min="1000" max="100000" step="1000" style="width: 100%; margin-top: 8px;">
							</div>

							<div class="mb-6">
								<label style="display: block; font-weight: bold; color: #0F172A; margin-bottom: 8px; font-family: 'DM Sans', sans-serif;">Estimated leakage %</label>
								<input type="number" id="calc_leakage" value="15" min="1" max="50" step="1" style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 6px; font-family: 'DM Sans', sans-serif;">
								<input type="range" id="calc_leakage_slider" value="15" min="1" max="50" style="width: 100%; margin-top: 8px;">
							</div>
						</div>

						<div>
							<div class="p-6 rounded-lg" style="background-color: #F8FAFC; border: 2px solid #E2E8F0;">
								<div class="mb-6">
									<p class="text-gray-600 text-sm" style="font-family: 'DM Sans', sans-serif;">Monthly leakage recovered</p>
									<p class="text-4xl font-bold" id="result_leakage" style="color: #16A34A; font-family: 'DM Sans', sans-serif;">₦0</p>
								</div>

								<div class="mb-6">
									<p class="text-gray-600 text-sm" style="font-family: 'DM Sans', sans-serif;">Mobiris cost (Growth plan)</p>
									<p class="text-2xl font-bold" id="result_cost" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">₦0</p>
								</div>

								<div class="p-4 rounded-lg" style="background-color: white; border: 2px solid #16A34A;">
									<p class="text-gray-600 text-sm" style="font-family: 'DM Sans', sans-serif;">Net monthly gain</p>
									<p class="text-3xl font-bold" id="result_net" style="color: #16A34A; font-family: 'DM Sans', sans-serif;">₦0</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- FAQ -->
	<section class="faq-section py-16 md:py-24" style="background-color: white;">
		<div class="container mx-auto px-4">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-12 text-center" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Frequently asked questions</h2>

				<?php
				$faq_args = array(
					'post_type'      => 'faq',
					'posts_per_page' => -1,
					'tax_query'      => array(
						array(
							'taxonomy' => 'faq_category',
							'field'    => 'slug',
							'terms'    => 'pricing',
						),
					),
				);

				$faqs = get_posts( $faq_args );

				if ( ! empty( $faqs ) ) {
					foreach ( $faqs as $faq ) {
						echo '<div class="faq-item mb-6 pb-6 border-b border-gray-200">';
						echo '<h3 class="text-lg font-bold mb-3" style="color: #0F172A; font-family: \'DM Sans\', sans-serif;">' . esc_html( $faq->post_title ) . '</h3>';
						echo '<p class="text-gray-700" style="font-family: \'DM Sans\', sans-serif;">' . wp_kses_post( $faq->post_content ) . '</p>';
						echo '</div>';
					}
				} else {
					// Fallback hardcoded FAQs
					?>
					<div class="faq-item mb-6 pb-6 border-b border-gray-200">
						<h3 class="text-lg font-bold mb-3" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Is there a free trial?</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Yes. All plans include a 14-day free trial. No credit card required. You get full access to all features so you can evaluate whether Mobiris is right for your fleet before paying anything.</p>
					</div>

					<div class="faq-item mb-6 pb-6 border-b border-gray-200">
						<h3 class="text-lg font-bold mb-3" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">How is billing calculated for the Growth plan?</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Growth plan costs ₦35,000 per month for the first 20 vehicles. Each additional vehicle above 20 costs ₦1,500 per month. For example, a 50-vehicle fleet would be: ₦35K + (30 × ₦1.5K) = ₦80K/month.</p>
					</div>

					<div class="faq-item mb-6 pb-6 border-b border-gray-200">
						<h3 class="text-lg font-bold mb-3" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Can I change plans anytime?</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Yes. Upgrade or downgrade at any time. Changes take effect at your next billing cycle. No penalties, no lock-in. You're in control.</p>
					</div>

					<div class="faq-item mb-6 pb-6 border-b border-gray-200">
						<h3 class="text-lg font-bold mb-3" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">What payment methods do you accept?</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">We accept card payments (Visa, Mastercard) via Paystack and Flutterwave. Bank transfer is available for Enterprise plan customers. All payments are secure and encrypted.</p>
					</div>

					<div class="faq-item mb-6 pb-6 border-b border-gray-200">
						<h3 class="text-lg font-bold mb-3" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Is my data safe?</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Yes. All data is encrypted at rest and in transit. Each operator's data is stored in an isolated PostgreSQL schema — no cross-tenant data access. We comply with NDPA (Nigeria), Kenya DPA, Ghana DPA, and POPIA (South Africa) data protection standards. All changes are logged for audit purposes.</p>
					</div>
					<?php
				}
				?>
			</div>
		</div>
	</section>

	<!-- Enterprise CTA -->
	<section class="enterprise-cta-section py-16 md:py-24" style="background-color: #F8FAFC;">
		<div class="container mx-auto px-4">
			<div class="max-w-3xl mx-auto text-center">
				<h2 class="text-2xl md:text-3xl font-bold mb-6" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Running 200+ vehicles or multiple entities?</h2>
				<p class="text-lg text-gray-700 mb-8" style="font-family: 'DM Sans', sans-serif;">Enterprise pricing is customised. We'll build a commercial model around your fleet size, verification volume, and intelligence plane requirements.</p>
				<a href="<?php echo esc_url( home_url( '/contact' ) ); ?>" class="inline-block px-8 py-3 rounded-lg font-semibold text-white" style="background-color: #2563EB; font-family: 'DM Sans', sans-serif; text-decoration: none;">Talk to our team</a>
			</div>
		</div>
	</section>

	<!-- Final CTA -->
	<section class="final-cta-section py-16 md:py-24" style="background-color: #0F172A;">
		<div class="container mx-auto px-4">
			<div class="max-w-3xl mx-auto text-center">
				<h2 class="text-3xl md:text-4xl font-bold mb-8 text-white" style="font-family: 'DM Sans', sans-serif;">Start today. No credit card. No surprises.</h2>
				<a href="<?php echo esc_url( home_url( '/get-started' ) ); ?>" class="inline-block px-8 py-3 rounded-lg font-semibold text-white" style="background-color: #2563EB; font-family: 'DM Sans', sans-serif; text-decoration: none;">Get started free</a>
			</div>
		</div>
	</section>

</main>

<script>
document.addEventListener('DOMContentLoaded', function() {
	const vehiclesInput = document.getElementById('calc_vehicles');
	const vehiclesSlider = document.getElementById('calc_vehicles_slider');
	const remittanceInput = document.getElementById('calc_remittance');
	const remittanceSlider = document.getElementById('calc_remittance_slider');
	const leakageInput = document.getElementById('calc_leakage');
	const leakageSlider = document.getElementById('calc_leakage_slider');

	const resultLeakage = document.getElementById('result_leakage');
	const resultCost = document.getElementById('result_cost');
	const resultNet = document.getElementById('result_net');

	function formatCurrency(value) {
		return new Intl.NumberFormat('en-NG', {
			style: 'currency',
			currency: 'NGN',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(value);
	}

	function updateCalculator() {
		const vehicles = parseInt(vehiclesInput.value) || 50;
		const dailyRemittance = parseInt(remittanceInput.value) || 15000;
		const leakagePercent = parseInt(leakageInput.value) || 15;

		// Calculate monthly leakage recovered
		const monthlyExpected = vehicles * dailyRemittance * 30;
		const monthlyLeakage = Math.round(monthlyExpected * (leakagePercent / 100));

		// Calculate Mobiris cost based on vehicle count
		let monthlyCost;
		if (vehicles <= 10) {
			monthlyCost = 15000;
		} else if (vehicles <= 20) {
			monthlyCost = 35000;
		} else {
			monthlyCost = 35000 + ((vehicles - 20) * 1500);
		}

		// Calculate net gain
		const netGain = monthlyLeakage - monthlyCost;

		// Update display
		resultLeakage.textContent = formatCurrency(monthlyLeakage);
		resultCost.textContent = formatCurrency(monthlyCost);
		resultNet.textContent = formatCurrency(Math.max(0, netGain));

		if (netGain < 0) {
			resultNet.parentElement.style.borderColor = '#EF4444';
			resultNet.style.color = '#EF4444';
		} else {
			resultNet.parentElement.style.borderColor = '#16A34A';
			resultNet.style.color = '#16A34A';
		}
	}

	// Link inputs to sliders
	vehiclesInput.addEventListener('input', function() {
		vehiclesSlider.value = this.value;
		updateCalculator();
	});

	vehiclesSlider.addEventListener('input', function() {
		vehiclesInput.value = this.value;
		updateCalculator();
	});

	remittanceInput.addEventListener('input', function() {
		remittanceSlider.value = this.value;
		updateCalculator();
	});

	remittanceSlider.addEventListener('input', function() {
		remittanceInput.value = this.value;
		updateCalculator();
	});

	leakageInput.addEventListener('input', function() {
		leakageSlider.value = this.value;
		updateCalculator();
	});

	leakageSlider.addEventListener('input', function() {
		leakageInput.value = this.value;
		updateCalculator();
	});

	// Initial calculation
	updateCalculator();
});
</script>

<?php get_footer();
