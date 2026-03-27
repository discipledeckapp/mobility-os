<?php
/**
 * Template Name: About
 *
 * @package Mobiris
 */

get_header(); ?>

<main id="primary" class="site-main">

	<!-- Page Header -->
	<section class="page-header page-header--dark" style="background-color: #0F172A;">
		<div class="container mx-auto px-4 py-20 md:py-32">
			<div class="max-w-3xl mx-auto text-center">
				<h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" style="font-family: 'DM Sans', sans-serif;">Built for Africa's transport operators</h1>
				<p class="text-xl md:text-2xl text-gray-300" style="font-family: 'DM Sans', sans-serif;">Mobiris exists because the transport operators who keep Africa moving deserve purpose-built operational software — not spreadsheets, not WhatsApp groups, not enterprise tools built for a different world.</p>
			</div>
		</div>
	</section>

	<!-- Mission Section -->
	<section class="mission-section py-16 md:py-24" style="background-color: white;">
		<div class="container mx-auto px-4">
			<div class="max-w-3xl mx-auto">
				<div class="mb-8">
					<span class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Our Mission</span>
					<h2 class="text-3xl md:text-4xl font-bold mt-3" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Make fleet operations transparent, verifiable, and profitable</h2>
				</div>

				<div class="prose prose-lg max-w-none" style="font-family: 'DM Sans', sans-serif; color: #374151;">
					<p class="mb-6 text-lg leading-relaxed">Transport operators in Africa manage billions of naira in daily remittance with tools not designed for the job. Spreadsheets fail to scale. WhatsApp groups leave no audit trail. Generic enterprise software demands infrastructure that doesn't exist on African networks.</p>

					<p class="mb-6 text-lg leading-relaxed">Mobiris changes that. We've built a platform from first principles for how transport operations actually work in Africa — with offline-capable mobile apps, identity verification that works with local government IDs, payment rails designed for African mobile money, and fraud detection that gets smarter as more operators join the network.</p>

					<p class="text-lg leading-relaxed">Our goal is simple: eliminate the friction, opacity, and leakage that costs operators millions every month. Give fleet managers real-time visibility. Give transport owners verifiable data. Give the intelligence plane a shared foundation so no single operator is left guessing whether a driver is trustworthy.</p>
				</div>
			</div>
		</div>
	</section>

	<!-- The Problem We're Solving -->
	<section class="problem-section py-16 md:py-24" style="background-color: #F8FAFC;">
		<div class="container mx-auto px-4">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-12 text-center" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">The market we're serving</h2>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
					<div class="stat-card p-8 rounded-xl" style="background-color: white; border: 1px solid #E2E8F0;">
						<div class="text-4xl md:text-5xl font-bold mb-3" style="color: #2563EB; font-family: 'DM Sans', sans-serif;">5–7M</div>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">commercial vehicles in Nigeria alone</p>
					</div>

					<div class="stat-card p-8 rounded-xl" style="background-color: white; border: 1px solid #E2E8F0;">
						<div class="text-4xl md:text-5xl font-bold mb-3" style="color: #2563EB; font-family: 'DM Sans', sans-serif;">₦7.5K–₦25K</div>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">daily remittance per vehicle</p>
					</div>

					<div class="stat-card p-8 rounded-xl" style="background-color: white; border: 1px solid #E2E8F0;">
						<div class="text-4xl md:text-5xl font-bold mb-3" style="color: #2563EB; font-family: 'DM Sans', sans-serif;">10–15%</div>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">estimated leakage from manual tracking</p>
					</div>
				</div>

				<p class="text-lg text-gray-700 text-center" style="font-family: 'DM Sans', sans-serif;">This is a massive, underserved market. Africa's transport operators move people and goods every single day with operational tools that were never designed for the scale, complexity, or regulatory environment they face. Mobiris fills that gap.</p>
			</div>
		</div>
	</section>

	<!-- Our Platform -->
	<section class="platform-overview-section py-16 md:py-24" style="background-color: white;">
		<div class="container mx-auto px-4">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-8 text-center" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Three pillars. One integrated platform.</h2>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
					<div class="platform-card p-6 rounded-xl" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<h3 class="text-xl font-bold mb-3" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Tenant Plane</h3>
						<p class="text-gray-700 mb-4" style="font-family: 'DM Sans', sans-serif;">Your complete fleet operations hub — driver management, vehicle tracking, remittance visibility, compliance, and dispatch.</p>
						<a href="<?php echo esc_url( home_url( '/platform' ) ); ?>" class="text-blue-600 hover:text-blue-700 font-semibold" style="font-family: 'DM Sans', sans-serif;">Learn more →</a>
					</div>

					<div class="platform-card p-6 rounded-xl" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<h3 class="text-xl font-bold mb-3" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Intelligence Plane</h3>
						<p class="text-gray-700 mb-4" style="font-family: 'DM Sans', sans-serif;">Shared fraud detection that grows stronger as more operators join. Cross-operator risk signals, biometric uniqueness verification, and driver history flags.</p>
						<a href="<?php echo esc_url( home_url( '/platform' ) ); ?>" class="text-blue-600 hover:text-blue-700 font-semibold" style="font-family: 'DM Sans', sans-serif;">Learn more →</a>
					</div>

					<div class="platform-card p-6 rounded-xl" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
						<h3 class="text-xl font-bold mb-3" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Mobile-First</h3>
						<p class="text-gray-700 mb-4" style="font-family: 'DM Sans', sans-serif;">Built for real African networks. Offline-capable iOS and Android apps for operators and drivers. Works on any device, anywhere.</p>
						<a href="<?php echo esc_url( home_url( '/platform' ) ); ?>" class="text-blue-600 hover:text-blue-700 font-semibold" style="font-family: 'DM Sans', sans-serif;">Learn more →</a>
					</div>
				</div>

				<div class="text-center">
					<a href="<?php echo esc_url( home_url( '/platform' ) ); ?>" class="inline-block px-6 py-3 rounded-lg font-semibold text-white" style="background-color: #2563EB; font-family: 'DM Sans', sans-serif;">Explore the full platform</a>
				</div>
			</div>
		</div>
	</section>

	<!-- Values Section -->
	<section class="values-section py-16 md:py-24" style="background-color: #F8FAFC;">
		<div class="container mx-auto px-4">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-12 text-center" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">What we stand for</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div class="value-card p-8 rounded-xl" style="background-color: white; border: 1px solid #E2E8F0;">
						<h3 class="text-xl font-bold mb-4" style="color: #2563EB; font-family: 'DM Sans', sans-serif;">Operator-first</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">We build for fleet managers, not for investors or drivers. Every feature solves a problem that operators actually face. Our roadmap is shaped by operator feedback, not hype.</p>
					</div>

					<div class="value-card p-8 rounded-xl" style="background-color: white; border: 1px solid #E2E8F0;">
						<h3 class="text-xl font-bold mb-4" style="color: #2563EB; font-family: 'DM Sans', sans-serif;">Africa-native</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Built for African identity infrastructure, African networks, African money, and African regulatory requirements. Not adapted from a Western product. Built from first principles for Africa.</p>
					</div>

					<div class="value-card p-8 rounded-xl" style="background-color: white; border: 1px solid #E2E8F0;">
						<h3 class="text-xl font-bold mb-4" style="color: #2563EB; font-family: 'DM Sans', sans-serif;">Precision</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">We don't oversell. Every feature solves a real, documented problem. We say no to features that don't belong. We value clarity and usefulness over feature count.</p>
					</div>

					<div class="value-card p-8 rounded-xl" style="background-color: white; border: 1px solid #E2E8F0;">
						<h3 class="text-xl font-bold mb-4" style="color: #2563EB; font-family: 'DM Sans', sans-serif;">Shared trust</h3>
						<p class="text-gray-700" style="font-family: 'DM Sans', sans-serif;">Our intelligence layer gets better as more operators join. We're building network effects that benefit everyone. Your trust makes the whole system stronger.</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Team Section -->
	<section class="team-section py-16 md:py-24" style="background-color: white;">
		<div class="container mx-auto px-4">
			<div class="max-w-4xl mx-auto text-center mb-12">
				<h2 class="text-3xl md:text-4xl font-bold mb-6" style="color: #0F172A; font-family: 'DM Sans', sans-serif;">Built by a team that understands the problem</h2>
				<p class="text-lg text-gray-700" style="font-family: 'DM Sans', sans-serif;">Our founding team has spent years in African logistics, fintech, and identity verification. We know the pain points because we've lived them.</p>
			</div>

			<div class="team-content">
				<?php
				if ( shortcode_exists( 'mobiris_team' ) ) {
					echo do_shortcode( '[mobiris_team]' );
				} else {
					echo '<div style="text-align: center; padding: 40px 20px; background-color: #F8FAFC; border-radius: 12px; border: 1px dashed #E2E8F0;">';
					echo '<p style="font-family: \'DM Sans\', sans-serif; color: #6B7280; margin: 0;">Team members can be added and managed via the WordPress admin panel.</p>';
					echo '<p style="font-family: \'DM Sans\', sans-serif; color: #9CA3AF; margin: 10px 0 0 0; font-size: 14px;">Use the [mobiris_team] shortcode to display team members.</p>';
					echo '</div>';
				}
				?>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="cta-section py-16 md:py-24" style="background-color: #0F172A;">
		<div class="container mx-auto px-4">
			<div class="max-w-3xl mx-auto text-center">
				<h2 class="text-3xl md:text-4xl font-bold mb-8 text-white" style="font-family: 'DM Sans', sans-serif;">Ready to see Mobiris in action?</h2>
				<div class="flex flex-col sm:flex-row gap-4 justify-center">
					<a href="<?php echo esc_url( home_url( '/demo' ) ); ?>" class="inline-block px-8 py-3 rounded-lg font-semibold text-white" style="background-color: #2563EB; font-family: 'DM Sans', sans-serif; text-decoration: none;">Book a demo</a>
					<a href="<?php echo esc_url( home_url( '/get-started' ) ); ?>" class="inline-block px-8 py-3 rounded-lg font-semibold border-2" style="border-color: #2563EB; color: white; font-family: 'DM Sans', sans-serif; text-decoration: none;">Get started free</a>
				</div>
			</div>
		</div>
	</section>

</main>

<?php get_footer();
