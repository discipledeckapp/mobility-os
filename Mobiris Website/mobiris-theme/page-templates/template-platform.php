<?php
/**
 * Template Name: Platform Overview
 *
 * @package Mobiris
 */

get_header(); ?>

<main id="primary" class="site-main">

	<!-- Page Header -->
	<section class="page-header page-header--dark" style="background-color: #0F172A;">
		<div class="container mx-auto px-4 py-20 md:py-32">
			<div class="max-w-3xl mx-auto text-center">
				<span class="text-sm font-semibold text-gray-400 uppercase tracking-wide" style="font-family: 'DM Sans', sans-serif;">The Platform</span>
				<h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 mt-4" style="font-family: 'DM Sans', sans-serif;">One platform. Three planes. Zero guesswork.</h1>
				<p class="text-xl md:text-2xl text-gray-300" style="font-family: 'DM Sans', sans-serif;">Mobiris is architected as three connected planes — each solving a distinct problem for transport operators and the Mobiris network.</p>
			</div>
		</div>
	</section>

	<!-- The Three Planes -->
	<section class="three-planes-section py-16 md:py-24" style="background-color: white;">
		<div class="container mx-auto px-4">

			<!-- Tenant Plane -->
			<div class="plane-card mb-16 pb-16 border-b border-gray-200">
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					<div>
						<div class="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white mb-4" style="background-color: #2563EB; font-family: 'DM Sans', sans-serif;">Operator-facing</div>
						<h2 class="text-3xl md:text-4xl font-bold mb-6" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Your fleet operations hub</h2>
						<p class="text-lg text-gray-700 mb-6" style="font-family: 'DM Sans', sans-serif;">Everything your team needs to manage drivers, vehicles, remittance, and compliance from a single dashboard. Designed for fleet managers, operations leads, and transport owners.</p>

						<ul class="space-y-3 mb-8">
							<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
								<span class="text-blue-600 font-bold mr-3">✓</span>
								<span class="text-gray-700">Driver records & verification</span>
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
							<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
								<span class="text-blue-600 font-bold mr-3">✓</span>
								<span class="text-gray-700">Compliance & licensing</span>
							</li>
							<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
								<span class="text-blue-600 font-bold mr-3">✓</span>
								<span class="text-gray-700">Operational readiness dashboard</span>
							</li>
						</ul>

						<a href="<?php echo esc_url( home_url( '/features' ) ); ?>" class="inline-block px-6 py-3 rounded-lg font-semibold text-white" style="background-color: #2563EB; font-family: 'DM Sans', sans-serif; text-decoration: none;">Explore features</a>
					</div>

					<div class="bg-gray-100 rounded-xl p-12 text-center" style="border: 1px solid #E2E8F0; aspect-ratio: 16/9;">
						<p class="text-gray-500" style="font-family: 'DM Sans', sans-serif;">Screenshot placeholder: Tenant dashboard mockup</p>
					</div>
				</div>
			</div>

			<!-- Intelligence Plane -->
			<div class="plane-card mb-16 pb-16 border-b border-gray-200">
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					<div class="order-2 lg:order-1 bg-gray-100 rounded-xl p-12 text-center" style="border: 1px solid #E2E8F0; aspect-ratio: 16/9;">
						<p class="text-gray-500" style="font-family: 'DM Sans', sans-serif;">Screenshot placeholder: Intelligence dashboard mockup</p>
					</div>

					<div class="order-1 lg:order-2">
						<div class="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white mb-4" style="background-color: #2563EB; font-family: 'DM Sans', sans-serif;">Network-powered</div>
						<h2 class="text-3xl md:text-4xl font-bold mb-6" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Shared trust infrastructure</h2>
						<p class="text-lg text-gray-700 mb-6" style="font-family: 'DM Sans', sans-serif;">The layer no single operator can build alone. Mobiris aggregates anonymised signals across all operators on the platform, giving everyone access to fraud intelligence that only a network can create.</p>

						<ul class="space-y-3 mb-8">
							<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
								<span class="text-blue-600 font-bold mr-3">✓</span>
								<span class="text-gray-700">Cross-operator risk signals</span>
							</li>
							<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
								<span class="text-blue-600 font-bold mr-3">✓</span>
								<span class="text-gray-700">Biometric uniqueness verification</span>
							</li>
							<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
								<span class="text-blue-600 font-bold mr-3">✓</span>
								<span class="text-gray-700">Driver history flags (anonymised)</span>
							</li>
							<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
								<span class="text-blue-600 font-bold mr-3">✓</span>
								<span class="text-gray-700">Fraud pattern detection</span>
							</li>
							<li class="flex items-start" style="font-family: 'DM Sans', sans-serif;">
								<span class="text-blue-600 font-bold mr-3">✓</span>
								<span class="text-gray-700">Network effect — grows stronger with every operator</span>
							</li>
						</ul>

						<a href="<?php echo esc_url( home_url( '/pricing' ) ); ?>" class="inline-block px-6 py-3 rounded-lg font-semibold text-white" style="background-color: #2563EB; font-family: 'DM Sans', sans-serif; text-decoration: none;">See pricing</a>
					</div>
				</div>
			</div>

			<!-- Control Plane -->
			<div class="plane-card">
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					<div>
						<div class="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white mb-4" style="background-color: #2563EB; font-family: 'DM Sans', sans-serif;">Platform governance</div>
						<h2 class="text-3xl md:text-4xl font-bold mb-6" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Built for scale</h2>
						<p class="text-lg text-gray-700 mb-6" style="font-family: 'DM Sans', sans-serif;">Mobiris is multi-tenant by design. Every operator's data is fully isolated in its own schema. Platform-level billing, feature flags, and lifecycle management are handled transparently in the background.</p>

						<div class="p-4 rounded-lg" style="background-color: #F8FAFC; border-left: 4px solid #2563EB;">
							<p class="text-gray-700 text-sm" style="font-family: 'DM Sans', sans-serif;"><strong>Note:</strong> The control plane is operated by Mobiris staff — not exposed to operators. This ensures platform stability, security, and regulatory compliance.</p>
						</div>
					</div>

					<div class="bg-gray-100 rounded-xl p-12 text-center" style="border: 1px solid #E2E8F0; aspect-ratio: 16/9;">
						<p class="text-gray-500" style="font-family: 'DM Sans', sans-serif;">Architecture diagram placeholder</p>
					</div>
				</div>
			</div>

		</div>
	</section>

	<!-- Integration & Connectivity -->
	<section class="integrations-section py-16 md:py-24" style="background-color: #F8FAFC;">
		<div class="container mx-auto px-4">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-12 text-center" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Built on trusted integrations</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
					<div class="integration-card p-8 rounded-xl" style="background-color: white; border: 1px solid #E2E8F0;">
						<h3 class="text-xl font-bold mb-4" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Identity Verification</h3>
						<p class="text-gray-700 mb-4" style="font-family: 'DM Sans', sans-serif;">We partner with industry-leading identity providers:</p>
						<ul class="space-y-2" style="font-family: 'DM Sans', sans-serif;">
							<li class="text-gray-700">✓ YouVerify</li>
							<li class="text-gray-700">✓ Smile Identity</li>
							<li class="text-gray-700">✓ AWS Rekognition (biometric)</li>
							<li class="text-gray-700">✓ Azure Face API</li>
						</ul>
					</div>

					<div class="integration-card p-8 rounded-xl" style="background-color: white; border: 1px solid #E2E8F0;">
						<h3 class="text-xl font-bold mb-4" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Payments</h3>
						<p class="text-gray-700 mb-4" style="font-family: 'DM Sans', sans-serif;">Seamless payment processing for subscriptions:</p>
						<ul class="space-y-2" style="font-family: 'DM Sans', sans-serif;">
							<li class="text-gray-700">✓ Flutterwave</li>
							<li class="text-gray-700">✓ Paystack</li>
							<li class="text-gray-700">✓ Bank transfer (Enterprise)</li>
						</ul>
					</div>

					<div class="integration-card p-8 rounded-xl" style="background-color: white; border: 1px solid #E2E8F0;">
						<h3 class="text-xl font-bold mb-4" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Mobile</h3>
						<p class="text-gray-700 mb-4" style="font-family: 'DM Sans', sans-serif;">Native apps for all devices:</p>
						<ul class="space-y-2" style="font-family: 'DM Sans', sans-serif;">
							<li class="text-gray-700">✓ iOS (via App Store)</li>
							<li class="text-gray-700">✓ Android (via Google Play)</li>
							<li class="text-gray-700">✓ Built with React Native/Expo</li>
						</ul>
					</div>

					<div class="integration-card p-8 rounded-xl" style="background-color: white; border: 1px solid #E2E8F0;">
						<h3 class="text-xl font-bold mb-4" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Enterprise</h3>
						<p class="text-gray-700 mb-4" style="font-family: 'DM Sans', sans-serif;">For large-scale deployments:</p>
						<ul class="space-y-2" style="font-family: 'DM Sans', sans-serif;">
							<li class="text-gray-700">✓ Single Sign-On (SSO)</li>
							<li class="text-gray-700">✓ SAML 2.0</li>
							<li class="text-gray-700">✓ Custom webhooks</li>
						</ul>
					</div>
				</div>

				<div class="p-6 rounded-lg" style="background-color: white; border: 1px solid #E2E8F0;">
					<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;"><strong>All integrations are managed by Mobiris.</strong> Operators don't need to procure separate identity verification or payment services. We handle vendor management, API credentials, and service reliability. You just use Mobiris.</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Platform Architecture Principles -->
	<section class="architecture-section py-16 md:py-24" style="background-color: white;">
		<div class="container mx-auto px-4">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-12 text-center" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Built on solid architectural principles</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div class="principle-card p-6 rounded-lg" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<h3 class="text-lg font-bold mb-3" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Multi-tenant isolation</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Every operator's data lives in its own isolated PostgreSQL schema. No data leaks. No cross-tenant queries. Complete isolation by design.</p>
					</div>

					<div class="principle-card p-6 rounded-lg" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<h3 class="text-lg font-bold mb-3" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Country-agnostic core</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Platform code supports Nigeria, Ghana, Kenya, and South Africa configurations. No hardcoded country logic. All regional variance is handled via config profiles.</p>
					</div>

					<div class="principle-card p-6 rounded-lg" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<h3 class="text-lg font-bold mb-3" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Mobile-first design</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">The mobile app is not a side project. It's a first-class citizen. Operators and drivers use mobile more than web. Design follows that reality.</p>
					</div>

					<div class="principle-card p-6 rounded-lg" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<h3 class="text-lg font-bold mb-3" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Offline capability</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Network unreliability is a feature requirement, not a bug. Mobile app works offline, syncs when connection returns. No lost data.</p>
					</div>

					<div class="principle-card p-6 rounded-lg" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<h3 class="text-lg font-bold mb-3" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">WhatsApp integration</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Driver notifications and operational alerts flow through WhatsApp. Operators already use WhatsApp. Mobiris meets them there.</p>
					</div>

					<div class="principle-card p-6 rounded-lg" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<h3 class="text-lg font-bold mb-3" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Compliance-ready</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Built for NDPA (Nigeria), Kenya DPA, Ghana DPA, and POPIA (South Africa). Encryption, access logs, data retention policies baked in.</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Access Paths -->
	<section class="access-paths-section py-16 md:py-24" style="background-color: #F8FAFC;">
		<div class="container mx-auto px-4">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-12 text-center" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Access Mobiris anywhere</h2>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
					<div class="access-card p-8 rounded-xl text-center" style="background-color: white; border: 1px solid #E2E8F0;">
						<div class="text-4xl mb-4">🌐</div>
						<h3 class="text-xl font-bold mb-3" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Web Console</h3>
						<p class="text-gray-700 mb-4" style="font-family: 'DM Sans', sans-serif;">Full-featured dashboard for fleet managers and operations leads</p>
						<p class="text-sm text-gray-600" style="font-family: 'DM Sans', sans-serif;">
							<?php
							$login_url = apply_filters( 'mobiris_login_url', 'https://app.mobiris.ng/login' );
							echo esc_html( $login_url );
							?>
						</p>
					</div>

					<div class="access-card p-8 rounded-xl text-center" style="background-color: white; border: 1px solid #E2E8F0;">
						<div class="text-4xl mb-4">📱</div>
						<h3 class="text-xl font-bold mb-3" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">iOS App</h3>
						<p class="text-gray-700 mb-4" style="font-family: 'DM Sans', sans-serif;">Native app for iPhone and iPad. Offline-capable, push notifications enabled.</p>
						<p class="text-sm text-blue-600" style="font-family: 'DM Sans', sans-serif;">Available on App Store</p>
					</div>

					<div class="access-card p-8 rounded-xl text-center" style="background-color: white; border: 1px solid #E2E8F0;">
						<div class="text-4xl mb-4">🤖</div>
						<h3 class="text-xl font-bold mb-3" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Android App</h3>
						<p class="text-gray-700 mb-4" style="font-family: 'DM Sans', sans-serif;">Native app for all Android devices. Works reliably on 4G, 3G, and lower.</p>
						<p class="text-sm text-blue-600" style="font-family: 'DM Sans', sans-serif;">Available on Google Play</p>
					</div>
				</div>

				<div class="p-6 rounded-lg" style="background-color: white; border: 1px solid #E2E8F0;">
					<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;"><strong>One account, multiple devices.</strong> Sign in on web, iOS, and Android with the same credentials. All your data syncs in real time. Offline changes sync when you reconnect.</p>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="cta-section py-16 md:py-24" style="background-color: #0F172A;">
		<div class="container mx-auto px-4">
			<div class="max-w-3xl mx-auto text-center">
				<h2 class="text-3xl md:text-4xl font-bold mb-8 text-white" style="font-family: 'DM Sans', sans-serif;">See the platform in action</h2>
				<div class="flex flex-col sm:flex-row gap-4 justify-center">
					<a href="<?php echo esc_url( home_url( '/demo' ) ); ?>" class="inline-block px-8 py-3 rounded-lg font-semibold text-white" style="background-color: #2563EB; font-family: 'DM Sans', sans-serif; text-decoration: none;">Book a demo</a>
					<a href="<?php echo esc_url( home_url( '/get-started' ) ); ?>" class="inline-block px-8 py-3 rounded-lg font-semibold border-2" style="border-color: #2563EB; color: white; font-family: 'DM Sans', sans-serif; text-decoration: none;">Get started free</a>
				</div>
			</div>
		</div>
	</section>

</main>

<?php get_footer();
