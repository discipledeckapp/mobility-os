<?php
/**
 * Template Name: Solutions
 *
 * @package Mobiris
 */

get_header(); ?>

<main id="primary" class="site-main">

	<!-- Page Header -->
	<section class="page-header page-header--dark" style="background-color: #0F172A;">
		<div class="container mx-auto px-4 py-20 md:py-32">
			<div class="max-w-3xl mx-auto text-center">
				<h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" style="font-family: 'DM Sans', sans-serif;">Built for how African transport operators actually work</h1>
				<p class="text-xl md:text-2xl text-gray-300" style="font-family: 'DM Sans', sans-serif;">Mobiris is designed around the daily realities of vehicle-for-hire operations — not adapted from a Western fleet management product.</p>
			</div>
		</div>
	</section>

	<!-- Who It's For -->
	<section class="who-section py-16 md:py-24" style="background-color: white;">
		<div class="container mx-auto px-4">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-12 text-center" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Who Mobiris is built for</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<!-- Fleet Managers -->
					<div class="audience-card p-8 rounded-xl" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<div class="mb-6">
							<div class="text-4xl mb-4">👤</div>
							<h3 class="text-2xl font-bold" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Fleet Managers & Operations Leads</h3>
						</div>

						<div class="mb-6">
							<p class="text-sm font-semibold text-gray-600 mb-2">Your pain point</p>
							<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Manual tracking across spreadsheets and WhatsApp. No visibility into what's actually happening with drivers and vehicles. Constant calls asking "where's the remittance?"</p>
						</div>

						<div class="mb-6">
							<p class="text-sm font-semibold text-gray-600 mb-2">What Mobiris does</p>
							<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Real-time remittance tracking, operational readiness dashboard, assignment management in one place. Finally see what's actually happening.</p>
						</div>

						<a href="<?php echo esc_url( home_url( '/features' ) ); ?>" class="inline-block px-6 py-2 rounded-lg font-semibold text-white" style="background-color: #2563EB; font-family: 'DM Sans', sans-serif; text-decoration: none;">Explore features</a>
					</div>

					<!-- Transport Owners -->
					<div class="audience-card p-8 rounded-xl" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<div class="mb-6">
							<div class="text-4xl mb-4">🏢</div>
							<h3 class="text-2xl font-bold" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Transport Owners & MDs</h3>
						</div>

						<div class="mb-6">
							<p class="text-sm font-semibold text-gray-600 mb-2">Your pain point</p>
							<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Cash is leaking somewhere. Drivers claim they remitted, but numbers don't add up. No way to verify. Fraud happens silently.</p>
						</div>

						<div class="mb-6">
							<p class="text-sm font-semibold text-gray-600 mb-2">What Mobiris does</p>
							<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Revenue tracking per driver, per vehicle, per day. Fraud intelligence across your fleet. Data to make decisions, not guesses.</p>
						</div>

						<a href="<?php echo esc_url( home_url( '/pricing' ) ); ?>" class="inline-block px-6 py-2 rounded-lg font-semibold text-white" style="background-color: #2563EB; font-family: 'DM Sans', sans-serif; text-decoration: none;">See ROI</a>
					</div>

					<!-- Compliance & HR -->
					<div class="audience-card p-8 rounded-xl" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<div class="mb-6">
							<div class="text-4xl mb-4">📋</div>
							<h3 class="text-2xl font-bold" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Compliance & HR Teams</h3>
						</div>

						<div class="mb-6">
							<p class="text-sm font-semibold text-gray-600 mb-2">Your pain point</p>
							<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Driver documents scattered across folders. Licence expiry dates? No clue. Audit requests are a nightmare. Guarantor contacts lost.</p>
						</div>

						<div class="mb-6">
							<p class="text-sm font-semibold text-gray-600 mb-2">What Mobiris does</p>
							<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Driver verification, document versioning, guarantor capture, automatic expiry alerts. Full audit trail for regulators.</p>
						</div>

						<a href="<?php echo esc_url( home_url( '/features#compliance' ) ); ?>" class="inline-block px-6 py-2 rounded-lg font-semibold text-white" style="background-color: #2563EB; font-family: 'DM Sans', sans-serif; text-decoration: none;">See features</a>
					</div>

					<!-- Enterprise Groups -->
					<div class="audience-card p-8 rounded-xl" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<div class="mb-6">
							<div class="text-4xl mb-4">🌐</div>
							<h3 class="text-2xl font-bold" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Enterprise Transport Groups</h3>
						</div>

						<div class="mb-6">
							<p class="text-sm font-semibold text-gray-600 mb-2">Your pain point</p>
							<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Multiple entities, no unified view. Compliance overhead across regions. Risk in one entity doesn't reach others. Can't track cross-entity fraud.</p>
						</div>

						<div class="mb-6">
							<p class="text-sm font-semibold text-gray-600 mb-2">What Mobiris does</p>
							<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Multi-entity architecture with unified reporting, role-based access, consolidated billing, and shared intelligence across your entire group.</p>
						</div>

						<a href="<?php echo esc_url( home_url( '/contact' ) ); ?>" class="inline-block px-6 py-2 rounded-lg font-semibold text-white" style="background-color: #2563EB; font-family: 'DM Sans', sans-serif; text-decoration: none;">Talk to sales</a>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Use Cases -->
	<section class="use-cases-section py-16 md:py-24" style="background-color: #F8FAFC;">
		<div class="container mx-auto px-4">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-12 text-center" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Real use cases, real operators</h2>

				<?php
				$args = array(
					'post_type'      => 'solution',
					'posts_per_page' => -1,
					'orderby'        => 'date',
					'order'          => 'DESC',
				);

				$use_cases = get_posts( $args );

				if ( ! empty( $use_cases ) ) {
					foreach ( $use_cases as $use_case ) {
						$industry = get_post_meta( $use_case->ID, '_mobiris_industry', true );
						echo '<div class="use-case-card p-8 rounded-xl mb-6" style="background-color: white; border: 1px solid #E2E8F0;">';
						echo '<div class="flex flex-col md:flex-row md:items-start gap-6">';
						echo '<div class="flex-1">';
						echo '<h3 class="text-2xl font-bold mb-3" style="color: #0F172A; font-family: \'DM Sans\', sans-serif;">' . esc_html( $use_case->post_title ) . '</h3>';
						if ( $industry ) {
							echo '<p class="text-sm font-semibold text-gray-600 mb-4" style="font-family: \'DM Sans\', sans-serif;">Industry: <strong>' . esc_html( $industry ) . '</strong></p>';
						}
						echo '<p class="text-gray-700 leading-relaxed" style="font-family: \'DM Sans\', sans-serif;">' . wp_kses_post( $use_case->post_content ) . '</p>';
						echo '</div>';
						echo '</div>';
						echo '</div>';
					}
				} else {
					// Fallback hardcoded use cases
					?>
					<div class="use-case-card p-8 rounded-xl mb-6" style="background-color: white; border: 1px solid #E2E8F0;">
						<h3 class="text-2xl font-bold mb-3" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Stopping remittance leakage in a 50-vehicle fleet</h3>
						<p class="text-sm font-semibold text-gray-600 mb-4" style="font-family: 'DM Sans', sans-serif;">Industry: <strong>Road Transport</strong></p>
						<p class="text-gray-700 leading-relaxed" style="font-family: 'DM Sans', sans-serif;">A Lagos-based minibus operator was losing approximately 12% of daily remittance due to manual tracking and driver honesty issues. Using Mobiris remittance tracking and daily target management, they identified which drivers were consistently underpaying, which routes had anomalous drops, and where process breakdowns were happening. Within two months, leakage dropped to 3%. The Mobiris subscription paid for itself in the first week.</p>
					</div>

					<div class="use-case-card p-8 rounded-xl mb-6" style="background-color: white; border: 1px solid #E2E8F0;">
						<h3 class="text-2xl font-bold mb-3" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Onboarding 200 drivers with biometric verification</h3>
						<p class="text-sm font-semibold text-gray-600 mb-4" style="font-family: 'DM Sans', sans-serif;">Industry: <strong>Enterprise Fleet</strong></p>
						<p class="text-gray-700 leading-relaxed" style="font-family: 'DM Sans', sans-serif;">A major transport group needed to onboard 200 new drivers across multiple operating units. Manual document collection was taking weeks. Using Mobiris biometric verification and driver capture, they reduced onboarding time to 48 hours per driver batch. Guarantor information is automatically collected and verified. No more lost files or duplicate hiring.</p>
					</div>

					<div class="use-case-card p-8 rounded-xl mb-6" style="background-color: white; border: 1px solid #E2E8F0;">
						<h3 class="text-2xl font-bold mb-3" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Cross-operator fraud detection in action</h3>
						<p class="text-sm font-semibold text-gray-600 mb-4" style="font-family: 'DM Sans', sans-serif;">Industry: <strong>Intelligence Plane</strong></p>
						<p class="text-gray-700 leading-relaxed" style="font-family: 'DM Sans', sans-serif;">A Mobiris operator noticed unusual remittance patterns and flag from the intelligence plane: the same driver's biometric had been seen in another operator's fleet three months prior, with similar fraud indicators. Investigation revealed a coordinated fraud ring targeting multiple operators. Intelligence plane sharing prevented further losses across the network. This is intelligence no single operator could have detected alone.</p>
					</div>
					<?php
				}
				?>
			</div>
		</div>
	</section>

	<!-- Industries -->
	<section class="industries-section py-16 md:py-24" style="background-color: white;">
		<div class="container mx-auto px-4">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-12 text-center" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Industries we serve</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div class="industry-card p-8 rounded-xl" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<div class="text-3xl mb-4">🚕</div>
						<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Road Transport</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Minibus operators, taxi fleets, BRT shuttle services, inter-city transport companies.</p>
					</div>

					<div class="industry-card p-8 rounded-xl" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<div class="text-3xl mb-4">📦</div>
						<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Logistics & Delivery</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Courier services, same-day delivery networks, warehouse-to-customer fleets.</p>
					</div>

					<div class="industry-card p-8 rounded-xl" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<div class="text-3xl mb-4">🚌</div>
						<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">School Transport</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Private school transport operators, bus operators for educational institutions, parent-managed shuttle services.</p>
					</div>

					<div class="industry-card p-8 rounded-xl" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<div class="text-3xl mb-4">🏢</div>
						<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Corporate Fleet</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Large enterprises with dedicated transport departments, manufacturing shuttle services, field operations fleets.</p>
					</div>

					<div class="industry-card p-8 rounded-xl" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<div class="text-3xl mb-4">🚗</div>
						<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Ride-hailing Partners</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Independent driver groups on Uber/Bolt managing their own vehicle pools and fleet operations.</p>
					</div>

					<div class="industry-card p-8 rounded-xl" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<div class="text-3xl mb-4">⚙️</div>
						<h3 class="text-lg font-bold mb-2" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">More coming</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">We're adding support for construction site transport, hospital shuttle services, agricultural transport, and more.</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="cta-section py-16 md:py-24" style="background-color: #0F172A;">
		<div class="container mx-auto px-4">
			<div class="max-w-3xl mx-auto text-center">
				<h2 class="text-3xl md:text-4xl font-bold mb-8 text-white" style="font-family: 'DM Sans', sans-serif;">Find your use case</h2>
				<p class="text-xl text-gray-300 mb-8" style="font-family: 'DM Sans', sans-serif;">Not sure where to start? We'll show you exactly how Mobiris works for operators like you.</p>
				<a href="<?php echo esc_url( home_url( '/demo' ) ); ?>" class="inline-block px-8 py-3 rounded-lg font-semibold text-white" style="background-color: #2563EB; font-family: 'DM Sans', sans-serif; text-decoration: none;">Book a demo</a>
			</div>
		</div>
	</section>

</main>

<?php get_footer();
