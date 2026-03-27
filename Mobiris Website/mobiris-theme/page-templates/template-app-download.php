<?php
/**
 * Template Name: Get the App
 * Template Post Type: page
 * Description: App download and platform access page
 *
 * @package Mobiris
 * @since 1.0.0
 */

get_header(); ?>

<main id="primary" class="site-main">

	<!-- Page Header -->
	<section class="mobiris-page-header" style="background: linear-gradient(135deg, <?php echo esc_attr( get_theme_mod( 'mobiris_navy', '#0F172A' ) ); ?> 0%, <?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> 100%);">
		<div class="container mx-auto px-6 py-20 text-center text-white">
			<h1 class="text-5xl font-bold mb-4"><?php esc_html_e( 'Mobiris, wherever you work', 'mobiris' ); ?></h1>
			<p class="text-xl opacity-90 max-w-2xl mx-auto">
				<?php esc_html_e( 'Manage your fleet from your desktop, your phone, or anywhere in between. Mobiris works across web, iOS, and Android.', 'mobiris' ); ?>
			</p>
		</div>
	</section>

	<!-- Platform Comparison Grid -->
	<section class="py-20 bg-white">
		<div class="container mx-auto px-6">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">

				<!-- Web Console -->
				<div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
					<div class="p-8">
						<div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
							<svg class="w-8 h-8 text-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?>" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20m0 0l-.75 3M9 20l6-2m-8-4h12a2 2 0 012 2v6a2 2 0 01-2 2H3a2 2 0 01-2-2v-6a2 2 0 012-2zm0 0V7a2 2 0 012-2h6a2 2 0 012 2v10m-6 5h6"></path>
							</svg>
						</div>

						<h3 class="text-2xl font-bold text-gray-900 mb-2">
							<?php esc_html_e( 'Web Console', 'mobiris' ); ?>
						</h3>
						<p class="text-gray-600 font-semibold mb-6">
							<?php esc_html_e( 'Full management experience', 'mobiris' ); ?>
						</p>

						<ul class="space-y-3 mb-8 text-gray-700 text-sm">
							<li class="flex gap-2">
								<svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
								</svg>
								<span><?php esc_html_e( 'Full dashboard access', 'mobiris' ); ?></span>
							</li>
							<li class="flex gap-2">
								<svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
								</svg>
								<span><?php esc_html_e( 'Driver management', 'mobiris' ); ?></span>
							</li>
							<li class="flex gap-2">
								<svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
								</svg>
								<span><?php esc_html_e( 'Remittance reports', 'mobiris' ); ?></span>
							</li>
							<li class="flex gap-2">
								<svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
								</svg>
								<span><?php esc_html_e( 'All settings & configuration', 'mobiris' ); ?></span>
							</li>
						</ul>

						<p class="text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
							<span class="font-semibold"><?php esc_html_e( 'For:', 'mobiris' ); ?></span> <?php esc_html_e( 'Fleet managers, operations leads, business owners', 'mobiris' ); ?>
						</p>

						<?php $web_app_url = get_theme_mod( 'mobiris_web_app_url', 'https://app.mobiris.ng' ); ?>
						<a href="<?php echo esc_url( $web_app_url ); ?>" target="_blank" rel="noopener noreferrer" class="inline-block w-full text-center bg-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity duration-200">
							<?php esc_html_e( 'Open Web Console →', 'mobiris' ); ?>
						</a>
					</div>
				</div>

				<!-- iOS App -->
				<div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
					<div class="p-8">
						<div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
							<svg class="w-8 h-8 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
								<path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.12-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.48-2.53 3.2l-.02-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
							</svg>
						</div>

						<h3 class="text-2xl font-bold text-gray-900 mb-2">
							<?php esc_html_e( 'iOS App', 'mobiris' ); ?>
						</h3>
						<p class="text-gray-600 font-semibold mb-6">
							<?php esc_html_e( 'For on-the-go management', 'mobiris' ); ?>
						</p>

						<ul class="space-y-3 mb-8 text-gray-700 text-sm">
							<li class="flex gap-2">
								<svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
								</svg>
								<span><?php esc_html_e( 'Driver check-in', 'mobiris' ); ?></span>
							</li>
							<li class="flex gap-2">
								<svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
								</svg>
								<span><?php esc_html_e( 'Remittance tracking', 'mobiris' ); ?></span>
							</li>
							<li class="flex gap-2">
								<svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
								</svg>
								<span><?php esc_html_e( 'Push notifications', 'mobiris' ); ?></span>
							</li>
							<li class="flex gap-2">
								<svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
								</svg>
								<span><?php esc_html_e( 'Offline support', 'mobiris' ); ?></span>
							</li>
						</ul>

						<p class="text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
							<span class="font-semibold"><?php esc_html_e( 'For:', 'mobiris' ); ?></span> <?php esc_html_e( 'Fleet managers, field supervisors, drivers', 'mobiris' ); ?>
						</p>

						<?php $ios_app_url = get_theme_mod( 'mobiris_ios_app_url', '' ); ?>
						<?php if ( $ios_app_url ) : ?>
							<a href="<?php echo esc_url( $ios_app_url ); ?>" target="_blank" rel="noopener noreferrer" class="inline-block w-full text-center bg-gray-900 text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200">
								<?php esc_html_e( 'Download on App Store', 'mobiris' ); ?>
							</a>
						<?php else : ?>
							<div class="inline-block w-full text-center bg-gray-200 text-gray-500 font-semibold py-3 rounded-lg cursor-not-allowed">
								<?php esc_html_e( 'Coming to App Store', 'mobiris' ); ?>
							</div>
							<p class="text-xs text-gray-500 text-center mt-3">
								<?php esc_html_e( 'We\'ll notify you when it\'s available', 'mobiris' ); ?>
							</p>
						<?php endif; ?>

						<p class="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
							<span class="font-semibold"><?php esc_html_e( 'Bundle ID:', 'mobiris' ); ?></span> com.discipledeckapp.mobilityos
						</p>
					</div>
				</div>

				<!-- Android App -->
				<div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
					<div class="p-8">
						<div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
							<svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
								<path d="M6.6 7.2c1.1 0 2-1 2-2.2C8.6 3.8 7.7 3 6.6 3 5.5 3 4.6 3.9 4.6 5s.9 2.2 2 2.2M3.2 19.5c0 .6.4 1 1 1h2.4c.6 0 1-.4 1-1v-7.5H3.2v7.5zM19.8 8.6l2.3-3.8c.1-.3 0-.6-.3-.8-.3-.1-.6 0-.8.3L19 7.2c-1.2-.5-2.5-.7-3.9-.7-1.4 0-2.7.3-3.9.7L9 3.3c-.2-.3-.5-.4-.8-.3-.3.1-.4.5-.3.8l2.3 3.8c-2.4 2.1-4 5.1-4 8.5v6.8c0 .6.4 1 1 1h14c.6 0 1-.4 1-1v-6.8c0-3.4-1.6-6.4-4-8.5zm-7 13.3c-1.1 0-2-1-2-2.2 0-1.2.9-2.2 2-2.2 1.1 0 2 1 2 2.2 0 1.2-.9 2.2-2 2.2zm7-2.2c0 1.2-.9 2.2-2 2.2s-2-1-2-2.2c0-1.2.9-2.2 2-2.2 1.1 0 2 1 2 2.2z"/>
							</svg>
						</div>

						<h3 class="text-2xl font-bold text-gray-900 mb-2">
							<?php esc_html_e( 'Android App', 'mobiris' ); ?>
						</h3>
						<p class="text-gray-600 font-semibold mb-6">
							<?php esc_html_e( 'For on-the-go management', 'mobiris' ); ?>
						</p>

						<ul class="space-y-3 mb-8 text-gray-700 text-sm">
							<li class="flex gap-2">
								<svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
								</svg>
								<span><?php esc_html_e( 'Driver check-in', 'mobiris' ); ?></span>
							</li>
							<li class="flex gap-2">
								<svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
								</svg>
								<span><?php esc_html_e( 'Remittance tracking', 'mobiris' ); ?></span>
							</li>
							<li class="flex gap-2">
								<svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
								</svg>
								<span><?php esc_html_e( 'Push notifications', 'mobiris' ); ?></span>
							</li>
							<li class="flex gap-2">
								<svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
								</svg>
								<span><?php esc_html_e( 'Offline support', 'mobiris' ); ?></span>
							</li>
						</ul>

						<p class="text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
							<span class="font-semibold"><?php esc_html_e( 'For:', 'mobiris' ); ?></span> <?php esc_html_e( 'Fleet managers, field supervisors, drivers', 'mobiris' ); ?>
						</p>

						<?php $android_app_url = get_theme_mod( 'mobiris_android_app_url', '' ); ?>
						<?php if ( $android_app_url ) : ?>
							<a href="<?php echo esc_url( $android_app_url ); ?>" target="_blank" rel="noopener noreferrer" class="inline-block w-full text-center bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors duration-200">
								<?php esc_html_e( 'Download on Google Play', 'mobiris' ); ?>
							</a>
						<?php else : ?>
							<div class="inline-block w-full text-center bg-gray-200 text-gray-500 font-semibold py-3 rounded-lg cursor-not-allowed">
								<?php esc_html_e( 'Coming to Google Play', 'mobiris' ); ?>
							</div>
							<p class="text-xs text-gray-500 text-center mt-3">
								<?php esc_html_e( 'We\'ll notify you when it\'s available', 'mobiris' ); ?>
							</p>
						<?php endif; ?>

						<p class="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
							<span class="font-semibold"><?php esc_html_e( 'Package ID:', 'mobiris' ); ?></span> com.discipledeckapp.mobilityos
						</p>
					</div>
				</div>

			</div>
		</div>
	</section>

	<!-- Key Mobile Features -->
	<section class="py-20 bg-gray-50">
		<div class="container mx-auto px-6">
			<h2 class="text-4xl font-bold text-center mb-16 text-gray-900">
				<?php esc_html_e( 'Mobile-First Fleet Management', 'mobiris' ); ?>
			</h2>

			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

				<!-- Offline-Capable -->
				<div class="bg-white p-8 rounded-lg border border-gray-200">
					<div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
						<svg class="w-6 h-6 text-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?>" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.251a.375.375 0 01-.469-.369V5.75A2.375 2.375 0 0110.006 3.375c.369 0 .75.111 1.248.348l4.148 1.948c.181.084.362.168.624.168h1.297c.944 0 1.677.733 1.677 1.677v9.645c0 .944-.733 1.677-1.677 1.677h-1.297c-.262 0-.443.084-.624.168l-4.148 1.948c-.498.237-.879.348-1.248.348a2.375 2.375 0 01-2.364-2.375z"></path>
						</svg>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">
						<?php esc_html_e( 'Offline-Capable', 'mobiris' ); ?>
					</h3>
					<p class="text-gray-600 text-sm">
						<?php esc_html_e( 'Works without reliable internet. Data syncs automatically when connectivity is restored.', 'mobiris' ); ?>
					</p>
				</div>

				<!-- WhatsApp Integration -->
				<div class="bg-white p-8 rounded-lg border border-gray-200">
					<div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
						<svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
							<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.781 1.149.139.139 0 00-.057.196l.861 1.401a.139.139 0 00.163.063 8.602 8.602 0 015.32-.97.14.14 0 00.117-.166l-.364-1.429a.139.139 0 00-.151-.115zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22.194c-5.537 0-10.194-4.657-10.194-10.194S6.463 1.806 12 1.806s10.194 4.657 10.194 10.194-4.657 10.194-10.194 10.194z"/>
						</svg>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">
						<?php esc_html_e( 'WhatsApp Integration', 'mobiris' ); ?>
					</h3>
					<p class="text-gray-600 text-sm">
						<?php esc_html_e( 'Driver communication happens in the app they already use daily.', 'mobiris' ); ?>
					</p>
				</div>

				<!-- Biometric Verification -->
				<div class="bg-white p-8 rounded-lg border border-gray-200">
					<div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
						<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
						</svg>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">
						<?php esc_html_e( 'Biometric Verification', 'mobiris' ); ?>
					</h3>
					<p class="text-gray-600 text-sm">
						<?php esc_html_e( 'Camera-based face capture for instant driver onboarding and verification.', 'mobiris' ); ?>
					</p>
				</div>

				<!-- Push Notifications -->
				<div class="bg-white p-8 rounded-lg border border-gray-200">
					<div class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
						<svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
						</svg>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">
						<?php esc_html_e( 'Push Notifications', 'mobiris' ); ?>
					</h3>
					<p class="text-gray-600 text-sm">
						<?php esc_html_e( 'Real-time remittance alerts, licence expiry warnings, and assignment updates.', 'mobiris' ); ?>
					</p>
				</div>

				<!-- Dual-Mode App -->
				<div class="bg-white p-8 rounded-lg border border-gray-200">
					<div class="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
						<svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
						</svg>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">
						<?php esc_html_e( 'Dual-Mode', 'mobiris' ); ?>
					</h3>
					<p class="text-gray-600 text-sm">
						<?php esc_html_e( 'One app serves both operator and driver modes. Login determines what you see.', 'mobiris' ); ?>
					</p>
				</div>

				<!-- Encrypted Sync -->
				<div class="bg-white p-8 rounded-lg border border-gray-200">
					<div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
						<svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
						</svg>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">
						<?php esc_html_e( 'Encrypted Data Sync', 'mobiris' ); ?>
					</h3>
					<p class="text-gray-600 text-sm">
						<?php esc_html_e( 'All connections are encrypted. Your fleet data is always secure.', 'mobiris' ); ?>
					</p>
				</div>

			</div>
		</div>
	</section>

	<!-- Get Notified Section (conditional) -->
	<?php
	$ios_app_url = get_theme_mod( 'mobiris_ios_app_url', '' );
	$android_app_url = get_theme_mod( 'mobiris_android_app_url', '' );
	if ( ! $ios_app_url || ! $android_app_url ) :
		?>
		<section class="py-20 bg-white border-t border-gray-200">
			<div class="container mx-auto px-6">
				<div class="max-w-2xl mx-auto text-center">
					<h2 class="text-3xl font-bold mb-4 text-gray-900">
						<?php esc_html_e( 'Get notified when the mobile apps launch', 'mobiris' ); ?>
					</h2>
					<p class="text-gray-600 mb-8">
						<?php esc_html_e( 'Subscribe to stay updated on iOS and Android app releases.', 'mobiris' ); ?>
					</p>

					<form id="app-notify-form" class="flex gap-3 max-w-md mx-auto">
						<input
							type="email"
							name="email"
							placeholder="<?php esc_attr_e( 'your.email@company.com', 'mobiris' ); ?>"
							required
							class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> focus:border-transparent"
						>
						<button
							type="submit"
							class="bg-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity duration-200"
						>
							<?php esc_html_e( 'Notify Me', 'mobiris' ); ?>
						</button>
					</form>

					<div id="notify-success-message" class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg hidden">
						<?php esc_html_e( 'Thanks! We\'ll let you know when the apps are available.', 'mobiris' ); ?>
					</div>
				</div>
			</div>
		</section>
	<?php endif; ?>

	<!-- System Requirements -->
	<section class="py-20 bg-gray-50">
		<div class="container mx-auto px-6">
			<h2 class="text-3xl font-bold text-center mb-12 text-gray-900">
				<?php esc_html_e( 'System Requirements', 'mobiris' ); ?>
			</h2>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">

				<!-- Web Requirements -->
				<div class="bg-white p-8 rounded-lg border border-gray-200">
					<h3 class="font-semibold text-gray-900 mb-4">
						<?php esc_html_e( 'Web Console', 'mobiris' ); ?>
					</h3>
					<ul class="space-y-2 text-gray-700 text-sm">
						<li class="flex gap-2">
							<svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
							</svg>
							<span><?php esc_html_e( 'Any modern browser', 'mobiris' ); ?></span>
						</li>
						<li class="flex gap-2">
							<svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
							</svg>
							<span>Chrome, Firefox, Safari, Edge</span>
						</li>
					</ul>
				</div>

				<!-- iOS Requirements -->
				<div class="bg-white p-8 rounded-lg border border-gray-200">
					<h3 class="font-semibold text-gray-900 mb-4">
						<?php esc_html_e( 'iOS App', 'mobiris' ); ?>
					</h3>
					<ul class="space-y-2 text-gray-700 text-sm">
						<li class="flex gap-2">
							<svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
							</svg>
							<span><?php esc_html_e( 'iOS 14 or later', 'mobiris' ); ?></span>
						</li>
						<li class="flex gap-2">
							<svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
							</svg>
							<span><?php esc_html_e( 'iPhone, iPad, iPod touch', 'mobiris' ); ?></span>
						</li>
					</ul>
				</div>

				<!-- Android Requirements -->
				<div class="bg-white p-8 rounded-lg border border-gray-200">
					<h3 class="font-semibold text-gray-900 mb-4">
						<?php esc_html_e( 'Android App', 'mobiris' ); ?>
					</h3>
					<ul class="space-y-2 text-gray-700 text-sm">
						<li class="flex gap-2">
							<svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
							</svg>
							<span><?php esc_html_e( 'Android 8.0 or later', 'mobiris' ); ?></span>
						</li>
						<li class="flex gap-2">
							<svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
							</svg>
							<span><?php esc_html_e( 'Tested on typical African networks', 'mobiris' ); ?></span>
						</li>
					</ul>
				</div>

			</div>
		</section>

	<!-- Security & Privacy Note -->
	<section class="py-16 bg-blue-50 border-t border-blue-200">
		<div class="container mx-auto px-6 max-w-3xl">
			<h2 class="text-2xl font-bold mb-6 text-gray-900">
				<?php esc_html_e( 'Your Data is Secure', 'mobiris' ); ?>
			</h2>

			<div class="bg-white p-8 rounded-lg border border-blue-200">
				<ul class="space-y-4 text-gray-700">
					<li class="flex gap-3">
						<svg class="w-6 h-6 text-green-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
						</svg>
						<span>
							<strong><?php esc_html_e( 'Encrypted Connections:', 'mobiris' ); ?></strong> <?php esc_html_e( 'All data in transit is encrypted using industry-standard TLS/SSL.', 'mobiris' ); ?>
						</span>
					</li>
					<li class="flex gap-3">
						<svg class="w-6 h-6 text-green-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
						</svg>
						<span>
							<strong><?php esc_html_e( 'Biometric Privacy:', 'mobiris' ); ?></strong> <?php esc_html_e( 'We store only mathematical face embeddings, never raw biometric images.', 'mobiris' ); ?>
						</span>
					</li>
					<li class="flex gap-3">
						<svg class="w-6 h-6 text-green-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
						</svg>
						<span>
							<strong><?php esc_html_e( 'Data Isolation:', 'mobiris' ); ?></strong> <?php esc_html_e( 'Each operator\'s data is completely isolated. No cross-tenant access.', 'mobiris' ); ?>
						</span>
					</li>
					<li class="flex gap-3">
						<svg class="w-6 h-6 text-green-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
						</svg>
						<span>
							<strong><?php esc_html_e( 'Compliant:', 'mobiris' ); ?></strong> <?php esc_html_e( 'Built for compliance with NDPA (Nigeria), KDPA (Kenya), and GDPA (Ghana).', 'mobiris' ); ?>
						</span>
					</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="py-20 bg-white">
		<div class="container mx-auto px-6 text-center">
			<h2 class="text-3xl font-bold mb-6 text-gray-900">
				<?php esc_html_e( 'Ready to Get Started?', 'mobiris' ); ?>
			</h2>

			<div class="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
				<?php $web_app_url = get_theme_mod( 'mobiris_web_app_url', 'https://app.mobiris.ng' ); ?>
				<a href="<?php echo esc_url( $web_app_url ); ?>" target="_blank" rel="noopener noreferrer" class="inline-block bg-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> text-white font-semibold px-8 py-4 rounded-lg hover:opacity-90 transition-opacity duration-200 text-center">
					<?php esc_html_e( 'Access Web Console', 'mobiris' ); ?>
				</a>
				<a href="<?php echo esc_url( get_permalink( get_page_by_path( 'contact' ) ) ); ?>" class="inline-block bg-gray-200 text-gray-900 font-semibold px-8 py-4 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-center">
					<?php esc_html_e( 'Contact Support', 'mobiris' ); ?>
				</a>
			</div>
		</div>
	</section>

</main>

<?php get_footer(); ?>
