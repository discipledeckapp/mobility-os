<?php
/**
 * Template Name: Access & Login
 * Template Post Type: page
 * Description: Portal page directing users to appropriate login/access point
 *
 * @package Mobiris
 * @since 1.0.0
 */

get_header(); ?>

<main id="primary" class="site-main">

	<!-- Page Header -->
	<section class="mobiris-page-header" style="background: linear-gradient(135deg, <?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> 0%, <?php echo esc_attr( get_theme_mod( 'mobiris_navy', '#0F172A' ) ); ?> 100%);">
		<div class="container mx-auto px-6 py-20 text-center text-white">
			<h1 class="text-5xl font-bold mb-4"><?php esc_html_e( 'Access Mobiris', 'mobiris' ); ?></h1>
			<p class="text-xl opacity-90 max-w-2xl mx-auto">
				<?php esc_html_e( 'Choose your access point below based on your role.', 'mobiris' ); ?>
			</p>
		</div>
	</section>

	<!-- Access Options Grid -->
	<section class="py-20 bg-white">
		<div class="container mx-auto px-6">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">

				<!-- Operator Console -->
				<div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
					<div class="p-8">
						<div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
							<svg class="w-8 h-8 text-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?>" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
							</svg>
						</div>

						<h3 class="text-2xl font-bold text-gray-900 mb-2">
							<?php esc_html_e( 'Operator Console', 'mobiris' ); ?>
						</h3>

						<div class="inline-block mb-4">
							<span class="inline-block bg-blue-100 text-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> text-xs font-semibold px-3 py-1 rounded-full">
								<?php esc_html_e( 'Web + Mobile', 'mobiris' ); ?>
							</span>
						</div>

						<p class="text-gray-600 mb-8 leading-relaxed">
							<?php esc_html_e( 'For fleet managers, operations leads, transport owners, and business administrators.', 'mobiris' ); ?>
						</p>

						<?php $login_url = get_theme_mod( 'mobiris_operator_login_url', 'https://app.mobiris.ng/login' ); ?>
						<div class="space-y-3">
							<a href="<?php echo esc_url( $login_url ); ?>" target="_blank" rel="noopener noreferrer" class="block text-center bg-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity duration-200">
								<?php esc_html_e( 'Log In to Operator Console', 'mobiris' ); ?>
							</a>
							<?php $signup_url = get_theme_mod( 'mobiris_signup_url', 'https://app.mobiris.ng/signup' ); ?>
							<a href="<?php echo esc_url( $signup_url ); ?>" target="_blank" rel="noopener noreferrer" class="block text-center text-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> hover:underline font-semibold text-sm">
								<?php esc_html_e( 'New to Mobiris? Get started', 'mobiris' ); ?> →
							</a>
						</div>
					</div>
				</div>

				<!-- Mobile App -->
				<div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
					<div class="p-8">
						<div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
							<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
							</svg>
						</div>

						<h3 class="text-2xl font-bold text-gray-900 mb-2">
							<?php esc_html_e( 'Mobile App', 'mobiris' ); ?>
						</h3>

						<div class="inline-block mb-4">
							<span class="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
								<?php esc_html_e( 'iOS + Android', 'mobiris' ); ?>
							</span>
						</div>

						<p class="text-gray-600 mb-8 leading-relaxed">
							<?php esc_html_e( 'Operators and drivers can log in directly from the Mobiris mobile app. Download from your app store.', 'mobiris' ); ?>
						</p>

						<?php
						$ios_app_url = get_theme_mod( 'mobiris_ios_app_url', '' );
						$android_app_url = get_theme_mod( 'mobiris_android_app_url', '' );
						?>

						<div class="space-y-3 mb-4">
							<?php if ( $ios_app_url ) : ?>
								<a href="<?php echo esc_url( $ios_app_url ); ?>" target="_blank" rel="noopener noreferrer" class="block text-center bg-gray-900 text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200">
									<?php esc_html_e( 'Download on App Store', 'mobiris' ); ?>
								</a>
							<?php else : ?>
								<div class="block text-center bg-gray-200 text-gray-500 font-semibold py-3 rounded-lg cursor-not-allowed">
									<?php esc_html_e( 'App Store (Coming Soon)', 'mobiris' ); ?>
								</div>
							<?php endif; ?>

							<?php if ( $android_app_url ) : ?>
								<a href="<?php echo esc_url( $android_app_url ); ?>" target="_blank" rel="noopener noreferrer" class="block text-center bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors duration-200">
									<?php esc_html_e( 'Download on Google Play', 'mobiris' ); ?>
								</a>
							<?php else : ?>
								<div class="block text-center bg-gray-200 text-gray-500 font-semibold py-3 rounded-lg cursor-not-allowed">
									<?php esc_html_e( 'Google Play (Coming Soon)', 'mobiris' ); ?>
								</div>
							<?php endif; ?>
						</div>

						<p class="text-xs text-gray-500 text-center border-t border-gray-200 pt-4">
							<?php esc_html_e( 'Use your existing Mobiris credentials — same login across web and mobile.', 'mobiris' ); ?>
						</p>
					</div>
				</div>

				<!-- Driver Self-Service -->
				<div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
					<div class="p-8">
						<div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-6">
							<svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
						</div>

						<h3 class="text-2xl font-bold text-gray-900 mb-2">
							<?php esc_html_e( 'Driver Self-Service', 'mobiris' ); ?>
						</h3>

						<div class="inline-block mb-4">
							<span class="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
								<?php esc_html_e( 'Invitation Only', 'mobiris' ); ?>
							</span>
						</div>

						<p class="text-gray-600 mb-8 leading-relaxed">
							<?php esc_html_e( 'If you\'ve been sent a driver self-service link by your fleet operator, use that link directly.', 'mobiris' ); ?>
						</p>

						<div class="p-4 bg-purple-50 border border-purple-200 rounded-lg mb-4">
							<p class="text-sm text-purple-900">
								<?php esc_html_e( 'This access is available only via a direct link sent by your operator. Contact your fleet manager if you need access.', 'mobiris' ); ?>
							</p>
						</div>

						<button disabled class="block w-full text-center bg-gray-200 text-gray-500 font-semibold py-3 rounded-lg cursor-not-allowed">
							<?php esc_html_e( 'No public access', 'mobiris' ); ?>
						</button>
					</div>
				</div>

			</div>
		</div>
	</section>

	<!-- New Customer Section -->
	<section class="py-16 bg-gray-50 border-t border-gray-200">
		<div class="container mx-auto px-6 max-w-3xl text-center">
			<h2 class="text-3xl font-bold mb-4 text-gray-900">
				<?php esc_html_e( 'Not yet a Mobiris customer?', 'mobiris' ); ?>
			</h2>
			<p class="text-lg text-gray-600 mb-8">
				<?php esc_html_e( 'Set up your account and start your free trial. No credit card required.', 'mobiris' ); ?>
			</p>

			<?php $signup_url = get_theme_mod( 'mobiris_signup_url', 'https://app.mobiris.ng/signup' ); ?>
			<a href="<?php echo esc_url( $signup_url ); ?>" target="_blank" rel="noopener noreferrer" class="inline-block bg-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> text-white font-semibold px-8 py-4 rounded-lg hover:opacity-90 transition-opacity duration-200">
				<?php esc_html_e( 'Start Free Trial', 'mobiris' ); ?>
			</a>
		</div>
	</section>

	<!-- Support & Help Section -->
	<section class="py-16 bg-white border-t border-gray-200">
		<div class="container mx-auto px-6">
			<h2 class="text-2xl font-bold text-center mb-12 text-gray-900">
				<?php esc_html_e( 'Need Help?', 'mobiris' ); ?>
			</h2>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">

				<!-- Lost Access -->
				<div class="text-center">
					<div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
						<svg class="w-6 h-6 text-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?>" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
					</div>
					<h3 class="font-semibold text-gray-900 mb-2">
						<?php esc_html_e( 'Lost Access?', 'mobiris' ); ?>
					</h3>
					<p class="text-gray-600 text-sm mb-4">
						<?php esc_html_e( 'Contact our support team for account recovery.', 'mobiris' ); ?>
					</p>
					<a href="mailto:support@mobiris.ng" class="inline-block text-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> hover:underline font-semibold text-sm">
						support@mobiris.ng
					</a>
				</div>

				<!-- WhatsApp -->
				<div class="text-center">
					<div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
						<svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
							<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.781 1.149.139.139 0 00-.057.196l.861 1.401a.139.139 0 00.163.063 8.602 8.602 0 015.32-.97.14.14 0 00.117-.166l-.364-1.429a.139.139 0 00-.151-.115zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22.194c-5.537 0-10.194-4.657-10.194-10.194S6.463 1.806 12 1.806s10.194 4.657 10.194 10.194-4.657 10.194-10.194 10.194z"/>
						</svg>
					</div>
					<h3 class="font-semibold text-gray-900 mb-2">
						<?php esc_html_e( 'WhatsApp Support', 'mobiris' ); ?>
					</h3>
					<p class="text-gray-600 text-sm mb-4">
						<?php esc_html_e( 'Quick answers on WhatsApp during business hours.', 'mobiris' ); ?>
					</p>
					<?php
					$whatsapp_url = mobiris_whatsapp_url( __( 'Hi, I need help with my Mobiris account', 'mobiris' ) );
					if ( $whatsapp_url ) {
						echo wp_kses_post( '<a href="' . esc_url( $whatsapp_url ) . '" target="_blank" rel="noopener noreferrer" class="inline-block text-green-600 hover:underline font-semibold text-sm">' . esc_html__( 'Start chat on WhatsApp', 'mobiris' ) . '</a>' );
					}
					?>
				</div>

				<!-- Documentation -->
				<div class="text-center">
					<div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
						<svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.596 6.253 2 10.849 2 16.5S6.596 26.747 12 26.747s10-4.596 10-10.247S17.404 6.253 12 6.253z"></path>
						</svg>
					</div>
					<h3 class="font-semibold text-gray-900 mb-2">
						<?php esc_html_e( 'Resources', 'mobiris' ); ?>
					</h3>
					<p class="text-gray-600 text-sm mb-4">
						<?php esc_html_e( 'Browse guides and FAQs for self-service answers.', 'mobiris' ); ?>
					</p>
					<?php
					$resources_page = get_page_by_path( 'resources' );
					if ( $resources_page ) {
						echo wp_kses_post( '<a href="' . esc_url( get_permalink( $resources_page ) ) . '" class="inline-block text-amber-600 hover:underline font-semibold text-sm">' . esc_html__( 'Visit Resources', 'mobiris' ) . '</a>' );
					}
					?>
				</div>

			</div>
		</div>
	</section>

	<!-- Security Note -->
	<section class="py-16 bg-blue-50 border-t border-blue-200">
		<div class="container mx-auto px-6 max-w-3xl">
			<div class="bg-white p-8 rounded-lg border border-blue-200">
				<h3 class="text-lg font-bold text-gray-900 mb-4">
					<?php esc_html_e( 'Security Reminder', 'mobiris' ); ?>
				</h3>
				<ul class="space-y-3 text-gray-700 text-sm">
					<li class="flex gap-3">
						<svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M18 5.5H2a1.5 1.5 0 00-1.5 1.5v6a1.5 1.5 0 001.5 1.5h16a1.5 1.5 0 001.5-1.5V7a1.5 1.5 0 00-1.5-1.5zM2 4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2H2z" clip-rule="evenodd"/>
						</svg>
						<span><?php esc_html_e( 'Mobiris uses secure JWT-based authentication. All data in transit is encrypted.', 'mobiris' ); ?></span>
					</li>
					<li class="flex gap-3">
						<svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M18 5.5H2a1.5 1.5 0 00-1.5 1.5v6a1.5 1.5 0 001.5 1.5h16a1.5 1.5 0 001.5-1.5V7a1.5 1.5 0 00-1.5-1.5zM2 4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2H2z" clip-rule="evenodd"/>
						</svg>
						<span><?php esc_html_e( 'Never share your login credentials with anyone, including Mobiris staff.', 'mobiris' ); ?></span>
					</li>
					<li class="flex gap-3">
						<svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M18 5.5H2a1.5 1.5 0 00-1.5 1.5v6a1.5 1.5 0 001.5 1.5h16a1.5 1.5 0 001.5-1.5V7a1.5 1.5 0 00-1.5-1.5zM2 4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2H2z" clip-rule="evenodd"/>
						</svg>
						<span><?php esc_html_e( 'If you suspect unauthorized access, contact support@mobiris.ng immediately.', 'mobiris' ); ?></span>
					</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Disclaimer -->
	<section class="py-16 bg-gray-50 border-t border-gray-200">
		<div class="container mx-auto px-6 max-w-3xl">
			<div class="p-6 bg-white border-l-4 border-amber-500 rounded">
				<h4 class="font-semibold text-gray-900 mb-2">
					<?php esc_html_e( 'Note for Launch', 'mobiris' ); ?>
				</h4>
				<p class="text-sm text-gray-700">
					<?php esc_html_e( 'Login URLs marked as [ASSUMED] are based on the platform architecture and should be verified with the development team before launch. Ensure all links point to the correct staging or production URLs.', 'mobiris' ); ?>
				</p>
			</div>
		</div>
	</section>

</main>

<?php get_footer(); ?>
