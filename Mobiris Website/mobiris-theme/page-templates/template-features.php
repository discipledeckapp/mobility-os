<?php
/**
 * Template Name: Features
 *
 * @package Mobiris
 */

get_header(); ?>

<main id="primary" class="site-main">

	<!-- Page Header -->
	<section class="page-header page-header--dark" style="background-color: #0F172A;">
		<div class="container mx-auto px-4 py-20 md:py-32">
			<div class="max-w-3xl mx-auto text-center">
				<h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" style="font-family: 'DM Sans', sans-serif;">Everything you need to run a tighter fleet</h1>
				<p class="text-xl md:text-2xl text-gray-300" style="font-family: 'DM Sans', sans-serif;">Purpose-built features for vehicle-for-hire operators in Africa. No bloat, no generic enterprise software assumptions.</p>
			</div>
		</div>
	</section>

	<!-- Feature Navigation -->
	<section class="feature-nav-section sticky top-0 z-40 py-4" style="background-color: white; border-bottom: 1px solid #E2E8F0;">
		<div class="container mx-auto px-4">
			<div class="flex overflow-x-auto gap-4 justify-center md:justify-center">
				<a href="#driver-management" class="px-4 py-2 text-sm font-semibold rounded-lg" style="color: #2563EB; background-color: #F8FAFC; font-family: 'DM Sans', sans-serif; text-decoration: none;">Driver Management</a>
				<a href="#remittance" class="px-4 py-2 text-sm font-semibold rounded-lg" style="color: #0F172A; font-family: 'DM Sans', sans-serif; text-decoration: none;">Remittance</a>
				<a href="#assignments" class="px-4 py-2 text-sm font-semibold rounded-lg" style="color: #0F172A; font-family: 'DM Sans', sans-serif; text-decoration: none;">Assignments</a>
				<a href="#compliance" class="px-4 py-2 text-sm font-semibold rounded-lg" style="color: #0F172A; font-family: 'DM Sans', sans-serif; text-decoration: none;">Compliance</a>
				<a href="#intelligence" class="px-4 py-2 text-sm font-semibold rounded-lg" style="color: #0F172A; font-family: 'DM Sans', sans-serif; text-decoration: none;">Intelligence</a>
				<a href="#enterprise" class="px-4 py-2 text-sm font-semibold rounded-lg" style="color: #0F172A; font-family: 'DM Sans', sans-serif; text-decoration: none;">Enterprise</a>
			</div>
		</div>
	</section>

	<!-- Driver Management -->
	<section id="driver-management" class="feature-section py-16 md:py-24" style="background-color: white;">
		<div class="container mx-auto px-4">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-12" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Verify every driver, capture every guarantor</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
					<div>
						<div class="space-y-6">
							<div class="feature-item">
								<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">🔍 Biometric identity verification</h3>
								<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Face capture and liveness detection powered by AWS Rekognition and Azure Face API. Ensure you know who's actually driving.</p>
							</div>

							<div class="feature-item">
								<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">📋 Government ID validation</h3>
								<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Instant verification of NIN (Nigeria), BVN (Nigeria), and Ghana Card. Growing support for additional ID types across Africa.</p>
							</div>

							<div class="feature-item">
								<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">👥 Guarantor capture</h3>
								<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Record guarantor details, ID, contact information, and photo. Build a trust network around each driver.</p>
							</div>

							<div class="feature-item">
								<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">📑 Driver document versioning</h3>
								<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Track licence uploads, expiry dates, and renewal history. Automatic alerts before documents expire.</p>
							</div>

							<div class="feature-item">
								<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">📊 Driver profile</h3>
								<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Complete driver history, fleet assignments, remittance record, and compliance status in one place.</p>
							</div>
						</div>
					</div>

					<div class="bg-gray-100 rounded-xl p-12 text-center" style="border: 1px solid #E2E8F0; aspect-ratio: 9/12;">
						<p class="text-gray-500" style="font-family: 'DM Sans', sans-serif;">Screenshot placeholder: Driver verification interface</p>
					</div>
				</div>

				<div class="p-6 rounded-lg" style="background-color: #F8FAFC; border-left: 4px solid #2563EB;">
					<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;"><strong>Biometric uniqueness verification:</strong> The intelligence plane flags if the same face appears in multiple operators' fleets — a key fraud signal.</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Remittance Tracking -->
	<section id="remittance" class="feature-section py-16 md:py-24" style="background-color: #F8FAFC;">
		<div class="container mx-auto px-4">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-12" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Know exactly what came in, and what didn't</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
					<div class="bg-gray-50 rounded-xl p-12 text-center" style="border: 1px solid #E2E8F0; aspect-ratio: 9/12;">
						<p class="text-gray-500" style="font-family: 'DM Sans', sans-serif;">Screenshot placeholder: Remittance dashboard</p>
					</div>

					<div>
						<div class="space-y-6">
							<div class="feature-item">
								<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">📈 Daily remittance targets</h3>
								<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Set per-vehicle or per-driver targets. Track actual vs. expected in real time.</p>
							</div>

							<div class="feature-item">
								<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">💰 Real-time cash flow tracking</h3>
								<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">See money coming in throughout the day. No lag, no guessing.</p>
							</div>

							<div class="feature-item">
								<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">⚠️ Remittance disputes & exceptions</h3>
								<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Flag low remittance, missing payments, or anomalies instantly. Know when to follow up.</p>
							</div>

							<div class="feature-item">
								<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">📊 Trends & reporting</h3>
								<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Historical remittance trends by fleet, vehicle, or driver. Spot patterns and anomalies.</p>
							</div>

							<div class="feature-item">
								<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">🔍 Breakdown by operator, vehicle, driver</h3>
								<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Drill into details at any level. Total fleet, down to individual driver performance.</p>
							</div>
						</div>
					</div>
				</div>

				<div class="p-6 rounded-lg" style="background-color: white; border-left: 4px solid #2563EB;">
					<h3 class="text-lg font-bold mb-3" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Real example: The remittance recovery calculation</h3>
					<p class="text-gray-700 mb-3" style="font-family: 'DM Sans', sans-serif;">An operator with 50 vehicles at ₦15,000 daily remittance target:</p>
					<ul class="space-y-2" style="font-family: 'DM Sans', sans-serif;">
						<li class="text-gray-700">📊 Daily expected: 50 × ₦15,000 = ₦750,000</li>
						<li class="text-gray-700">📊 Monthly expected: ₦750,000 × 30 = ₦22.5M</li>
						<li class="text-gray-700">⚠️ If 15% leakage: ₦3.375M lost per month</li>
						<li style="color: #2563EB; font-weight: bold;">✓ Mobiris cost: ₦35K/month (Growth plan)</li>
						<li style="color: #16A34A; font-weight: bold;">✓ Net monthly gain: ₦3.34M</li>
					</ul>
				</div>
			</div>
		</div>
	</section>

	<!-- Assignment & Dispatch -->
	<section id="assignments" class="feature-section py-16 md:py-24" style="background-color: white;">
		<div class="container mx-auto px-4">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-12" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Who's driving what, and where</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div>
						<div class="space-y-6">
							<div class="feature-item">
								<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">🚗 Driver-to-vehicle assignment</h3>
								<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Assign drivers to vehicles with one tap. Track who's assigned what, and enforce single-driver rules.</p>
							</div>

							<div class="feature-item">
								<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">⏰ Shift management</h3>
								<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Define shifts, track duty hours, and ensure compliance with driver rest requirements.</p>
							</div>

							<div class="feature-item">
								<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">🗺️ Route tracking</h3>
								<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">See active routes, vehicle locations, and ETA. Dispatch optimization is coming.</p>
							</div>

							<div class="feature-item">
								<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">📊 Operational readiness</h3>
								<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Dashboard shows fleet health at a glance. Vehicles available, drivers on-duty, assignments active.</p>
							</div>

							<div class="feature-item">
								<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">🟢 Real-time status</h3>
								<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Available, on-duty, in-transit, off-duty. Status updates in real time as drivers work.</p>
							</div>
						</div>
					</div>

					<div class="bg-gray-100 rounded-xl p-12 text-center" style="border: 1px solid #E2E8F0; aspect-ratio: 9/12;">
						<p class="text-gray-500" style="font-family: 'DM Sans', sans-serif;">Screenshot placeholder: Assignment & dispatch interface</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Compliance & Licensing -->
	<section id="compliance" class="feature-section py-16 md:py-24" style="background-color: #F8FAFC;">
		<div class="container mx-auto px-4">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-12" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Stay ahead of regulatory requirements</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div class="bg-gray-50 rounded-xl p-12 text-center" style="border: 1px solid #E2E8F0; aspect-ratio: 9/12;">
						<p class="text-gray-500" style="font-family: 'DM Sans', sans-serif;">Screenshot placeholder: Compliance dashboard</p>
					</div>

					<div>
						<div class="space-y-6">
							<div class="feature-item">
								<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">⏰ Licence expiry alerts</h3>
								<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Configurable lead time alerts. Know months before a driver's or vehicle's licence expires.</p>
							</div>

							<div class="feature-item">
								<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">📂 Document upload & versioning</h3>
								<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Upload driver licences, vehicle registration, insurance, tax clearance. Keep multiple versions with timestamps.</p>
							</div>

							<div class="feature-item">
								<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">📜 Full audit trail</h3>
								<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Every upload, update, and change is logged with user, timestamp, and reason. Regulatory audits become simple.</p>
							</div>

							<div class="feature-item">
								<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">🗂️ Multi-document support</h3>
								<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Driver licence, vehicle registration, insurance, medical clearance, training certifications. Extensible for your needs.</p>
							</div>

							<div class="feature-item">
								<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">🔒 Data protection ready</h3>
								<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">NDPA (Nigeria), Kenya DPA, Ghana DPA, POPIA (South Africa) compliance built in. Encryption, retention policies, audit logs.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Intelligence Plane -->
	<section id="intelligence" class="feature-section py-16 md:py-24" style="background-color: white;">
		<div class="container mx-auto px-4">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-6" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">The shared fraud detection layer</h2>
				<p class="text-lg text-gray-700 mb-12" style="font-family: 'DM Sans', sans-serif;">No single fleet operator can build a cross-operator fraud detection network alone. But together, they can. The intelligence plane aggregates anonymised signals across all Mobiris operators, surfacing risk that no operator can see by themselves.</p>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
					<div class="feature-item p-6 rounded-lg" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">🎯 Cross-operator risk signals</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Learn from other operators' fraud incidents without seeing their data. Anonymised patterns protect privacy while sharing intelligence.</p>
					</div>

					<div class="feature-item p-6 rounded-lg" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">🔍 Biometric uniqueness</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Same face appears in multiple fleets? Intelligence plane flags it instantly. Catch multi-fleet fraud in real time.</p>
					</div>

					<div class="feature-item p-6 rounded-lg" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">📊 Driver history flags</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Did this driver cause incidents at other operators? Anonymised history helps you make smarter hiring decisions.</p>
					</div>

					<div class="feature-item p-6 rounded-lg" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">⚠️ Fraud pattern detection</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Machine learning spots patterns across all operators' data. Catches sophisticated fraud schemes.</p>
					</div>

					<div class="feature-item p-6 rounded-lg" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">📈 Network effect</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">The more operators on Mobiris, the smarter the intelligence plane becomes. You get stronger security as the network grows.</p>
					</div>

					<div class="feature-item p-6 rounded-lg" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">🔒 Privacy by design</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Your operator data stays yours. Intelligence plane surfaces risk signals only — never raw records from other operators.</p>
					</div>
				</div>

				<div class="p-6 rounded-lg" style="background-color: #F8FAFC; border-left: 4px solid #2563EB;">
					<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;"><strong>Availability:</strong> Intelligence plane features are available on Growth (limited) and Enterprise (full) plans. Contact us to discuss your fleet's needs.</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Enterprise -->
	<section id="enterprise" class="feature-section py-16 md:py-24" style="background-color: #F8FAFC;">
		<div class="container mx-auto px-4">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-6" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Multi-entity fleet management</h2>
				<p class="text-lg text-gray-700 mb-12" style="font-family: 'DM Sans', sans-serif;">Large transport groups manage multiple entities, each with separate operations. Mobiris supports the full hierarchy out of the box.</p>

				<div class="mb-12 p-8 rounded-lg" style="background-color: white; border: 1px solid #E2E8F0;">
					<h3 class="text-xl font-bold mb-6" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">The hierarchy: Tenant → Business Entity → Operating Unit → Fleet</h3>
					<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div class="text-center">
							<div class="bg-blue-50 p-4 rounded-lg mb-2" style="border: 1px solid #E2E8F0;">
								<p class="font-bold" style="color: #2563EB; font-family: 'DM Sans', sans-serif;">Tenant</p>
								<p class="text-sm text-gray-600" style="font-family: 'DM Sans', sans-serif;">Your company</p>
							</div>
						</div>
						<div class="text-center">
							<div class="bg-blue-50 p-4 rounded-lg mb-2" style="border: 1px solid #E2E8F0;">
								<p class="font-bold" style="color: #2563EB; font-family: 'DM Sans', sans-serif;">Business Entity</p>
								<p class="text-sm text-gray-600" style="font-family: 'DM Sans', sans-serif;">Subsidiary or division</p>
							</div>
						</div>
						<div class="text-center">
							<div class="bg-blue-50 p-4 rounded-lg mb-2" style="border: 1px solid #E2E8F0;">
								<p class="font-bold" style="color: #2563EB; font-family: 'DM Sans', sans-serif;">Operating Unit</p>
								<p class="text-sm text-gray-600" style="font-family: 'DM Sans', sans-serif;">Region or depot</p>
							</div>
						</div>
						<div class="text-center">
							<div class="bg-blue-50 p-4 rounded-lg mb-2" style="border: 1px solid #E2E8F0;">
								<p class="font-bold" style="color: #2563EB; font-family: 'DM Sans', sans-serif;">Fleet</p>
								<p class="text-sm text-gray-600" style="font-family: 'DM Sans', sans-serif;">Vehicles & drivers</p>
							</div>
						</div>
					</div>
				</div>

				<div class="space-y-6">
					<div class="feature-item p-6 rounded-lg" style="background-color: white; border: 1px solid #E2E8F0;">
						<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">📊 Unified cross-entity reporting</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">See total fleet performance across all entities. Drill down to individual operating units and fleets.</p>
					</div>

					<div class="feature-item p-6 rounded-lg" style="background-color: white; border: 1px solid #E2E8F0;">
						<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">🔐 Role-based access control</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Entity managers see only their entity. Group-level admins see everything. Granular permissions for compliance.</p>
					</div>

					<div class="feature-item p-6 rounded-lg" style="background-color: white; border: 1px solid #E2E8F0;">
						<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">💳 Consolidated billing</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">One invoice for all entities. Usage tracked and allocated per entity. Chargeback to business units if needed.</p>
					</div>

					<div class="feature-item p-6 rounded-lg" style="background-color: white; border: 1px solid #E2E8F0;">
						<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">🤝 Shared intelligence across entities</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Driver hired at Entity A causes issues at Entity B? Intelligence plane connects the dots. Protect your entire group.</p>
					</div>

					<div class="feature-item p-6 rounded-lg" style="background-color: white; border: 1px solid #E2E8F0;">
						<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">⚙️ Custom SLAs & compliance</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Large enterprises need custom contracts, data residency, audit trails. We work with your legal and compliance teams.</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="cta-section py-16 md:py-24" style="background-color: #0F172A;">
		<div class="container mx-auto px-4">
			<div class="max-w-3xl mx-auto text-center">
				<h2 class="text-3xl md:text-4xl font-bold mb-8 text-white" style="font-family: 'DM Sans', sans-serif;">See all these features in action</h2>
				<div class="flex flex-col sm:flex-row gap-4 justify-center">
					<a href="<?php echo esc_url( home_url( '/pricing' ) ); ?>" class="inline-block px-8 py-3 rounded-lg font-semibold text-white" style="background-color: #2563EB; font-family: 'DM Sans', sans-serif; text-decoration: none;">View pricing</a>
					<a href="<?php echo esc_url( home_url( '/get-started' ) ); ?>" class="inline-block px-8 py-3 rounded-lg font-semibold border-2" style="border-color: #2563EB; color: white; font-family: 'DM Sans', sans-serif; text-decoration: none;">Get started free</a>
				</div>
			</div>
		</div>
	</section>

</main>

<?php get_footer();
