<?php
/**
 * Template Name: Contact
 * Template Post Type: page
 * Description: Contact page with form and contact details
 *
 * @package Mobiris
 * @since 1.0.0
 */

get_header(); ?>

<main id="primary" class="site-main">

	<!-- Page Header -->
	<section class="mobiris-page-header" style="background: linear-gradient(135deg, <?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> 0%, <?php echo esc_attr( get_theme_mod( 'mobiris_navy', '#0F172A' ) ); ?> 100%);">
		<div class="container mx-auto px-6 py-20 text-center text-white">
			<h1 class="text-5xl font-bold mb-4"><?php esc_html_e( 'Get in touch', 'mobiris' ); ?></h1>
			<p class="text-xl opacity-90 max-w-2xl mx-auto">
				<?php esc_html_e( "Whether you're exploring Mobiris for your fleet or need support, we're here.", 'mobiris' ); ?>
			</p>
		</div>
	</section>

	<!-- Two-Column Contact Layout -->
	<section class="py-20 bg-white">
		<div class="container mx-auto px-6">
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

				<!-- LEFT: Contact Form -->
				<div class="contact-form-wrapper">
					<h2 class="text-3xl font-bold mb-8 text-gray-900">
						<?php esc_html_e( 'Send us a message', 'mobiris' ); ?>
					</h2>

					<form id="mobiris-contact-form" class="mobiris-contact-form space-y-6" method="post">
						<?php wp_nonce_field( 'mobiris_ajax', 'mobiris_nonce' ); ?>
						<input type="hidden" name="action" value="mobiris_contact_form">

						<!-- Full Name -->
						<div class="form-group">
							<label for="contact-name" class="block text-sm font-semibold text-gray-900 mb-2">
								<?php esc_html_e( 'Full Name', 'mobiris' ); ?>
								<span class="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="contact-name"
								name="full_name"
								required
								class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> focus:border-transparent"
								placeholder="<?php esc_attr_e( 'Your full name', 'mobiris' ); ?>"
							>
							<span class="error-message text-red-500 text-sm mt-1 hidden"></span>
						</div>

						<!-- Email -->
						<div class="form-group">
							<label for="contact-email" class="block text-sm font-semibold text-gray-900 mb-2">
								<?php esc_html_e( 'Email Address', 'mobiris' ); ?>
								<span class="text-red-500">*</span>
							</label>
							<input
								type="email"
								id="contact-email"
								name="email"
								required
								class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> focus:border-transparent"
								placeholder="<?php esc_attr_e( 'your.email@company.com', 'mobiris' ); ?>"
							>
							<span class="error-message text-red-500 text-sm mt-1 hidden"></span>
						</div>

						<!-- Phone -->
						<div class="form-group">
							<label for="contact-phone" class="block text-sm font-semibold text-gray-900 mb-2">
								<?php esc_html_e( 'Phone Number', 'mobiris' ); ?>
							</label>
							<input
								type="tel"
								id="contact-phone"
								name="phone"
								class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> focus:border-transparent"
								placeholder="<?php esc_attr_e( '+234 80 1234 5678', 'mobiris' ); ?>"
							>
						</div>

						<!-- Company/Organisation -->
						<div class="form-group">
							<label for="contact-company" class="block text-sm font-semibold text-gray-900 mb-2">
								<?php esc_html_e( 'Company / Organisation', 'mobiris' ); ?>
							</label>
							<input
								type="text"
								id="contact-company"
								name="company"
								class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> focus:border-transparent"
								placeholder="<?php esc_attr_e( 'Your company name', 'mobiris' ); ?>"
							>
						</div>

						<!-- Fleet Size -->
						<div class="form-group">
							<label for="contact-fleet-size" class="block text-sm font-semibold text-gray-900 mb-2">
								<?php esc_html_e( 'Fleet Size', 'mobiris' ); ?>
							</label>
							<select
								id="contact-fleet-size"
								name="fleet_size"
								class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> focus:border-transparent"
							>
								<option value="">-- <?php esc_html_e( 'Select fleet size', 'mobiris' ); ?> --</option>
								<option value="1-10">1–10 vehicles</option>
								<option value="11-50">11–50 vehicles</option>
								<option value="51-200">51–200 vehicles</option>
								<option value="200+">200+ vehicles</option>
							</select>
						</div>

						<!-- Subject -->
						<div class="form-group">
							<label for="contact-subject" class="block text-sm font-semibold text-gray-900 mb-2">
								<?php esc_html_e( 'Subject', 'mobiris' ); ?>
								<span class="text-red-500">*</span>
							</label>
							<select
								id="contact-subject"
								name="subject"
								required
								class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> focus:border-transparent"
							>
								<option value="">-- <?php esc_html_e( 'Select a subject', 'mobiris' ); ?> --</option>
								<option value="general">General enquiry</option>
								<option value="demo">Book a demo</option>
								<option value="support">Support</option>
								<option value="partnership">Partnership</option>
								<option value="press">Press</option>
							</select>
							<span class="error-message text-red-500 text-sm mt-1 hidden"></span>
						</div>

						<!-- Message -->
						<div class="form-group">
							<label for="contact-message" class="block text-sm font-semibold text-gray-900 mb-2">
								<?php esc_html_e( 'Message', 'mobiris' ); ?>
								<span class="text-red-500">*</span>
							</label>
							<textarea
								id="contact-message"
								name="message"
								required
								rows="6"
								class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> focus:border-transparent"
								placeholder="<?php esc_attr_e( 'Tell us how we can help...', 'mobiris' ); ?>"
							></textarea>
							<span class="error-message text-red-500 text-sm mt-1 hidden"></span>
						</div>

						<!-- Submit Button -->
						<div class="pt-4">
							<button
								type="submit"
								class="w-full bg-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity duration-200"
							>
								<?php esc_html_e( 'Send Message', 'mobiris' ); ?>
							</button>
						</div>

						<!-- Form Messages -->
						<div id="form-success-message" class="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg hidden" role="alert">
							<p class="font-semibold"><?php esc_html_e( 'Success!', 'mobiris' ); ?></p>
							<p><?php esc_html_e( 'Your message has been sent. We\'ll be in touch soon.', 'mobiris' ); ?></p>
						</div>

						<div id="form-error-message" class="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg hidden" role="alert">
							<p class="font-semibold"><?php esc_html_e( 'Error', 'mobiris' ); ?></p>
							<p id="error-text"><?php esc_html_e( 'Something went wrong. Please try again.', 'mobiris' ); ?></p>
						</div>
					</form>

					<!-- WhatsApp Note -->
					<div class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
						<p class="text-sm text-gray-700 mb-4">
							<?php esc_html_e( 'Or reach us directly on WhatsApp', 'mobiris' ); ?>
						</p>
						<?php
						$whatsapp_link = mobiris_whatsapp_link( __( 'Hi, I\'d like to learn more about Mobiris', 'mobiris' ) );
						if ( $whatsapp_link ) {
							echo wp_kses_post( $whatsapp_link );
						}
						?>
					</div>
				</div>

				<!-- RIGHT: Contact Details -->
				<div class="contact-details-wrapper">
					<h2 class="text-3xl font-bold mb-8 text-gray-900">
						<?php esc_html_e( 'Contact Information', 'mobiris' ); ?>
					</h2>

					<div class="space-y-8">

						<!-- Email -->
						<div class="flex gap-4">
							<div class="flex-shrink-0">
								<div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
									<svg class="w-6 h-6 text-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?>" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
									</svg>
								</div>
							</div>
							<div>
								<h3 class="font-semibold text-gray-900 mb-1">
									<?php esc_html_e( 'Email', 'mobiris' ); ?>
								</h3>
								<p class="text-gray-700 mb-2">
									<?php esc_html_e( 'General enquiries:', 'mobiris' ); ?><br>
									<a href="mailto:hello@mobiris.ng" class="text-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> hover:underline">
										hello@mobiris.ng
									</a>
								</p>
								<p class="text-gray-700">
									<?php esc_html_e( 'Support:', 'mobiris' ); ?><br>
									<a href="mailto:support@mobiris.ng" class="text-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> hover:underline">
										support@mobiris.ng
									</a>
								</p>
							</div>
						</div>

						<!-- WhatsApp -->
						<div class="flex gap-4">
							<div class="flex-shrink-0">
								<div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
									<svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
										<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.781 1.149.139.139 0 00-.057.196l.861 1.401a.139.139 0 00.163.063 8.602 8.602 0 015.32-.97.14.14 0 00.117-.166l-.364-1.429a.139.139 0 00-.151-.115zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22.194c-5.537 0-10.194-4.657-10.194-10.194S6.463 1.806 12 1.806s10.194 4.657 10.194 10.194-4.657 10.194-10.194 10.194z"/>
									</svg>
								</div>
							</div>
							<div>
								<h3 class="font-semibold text-gray-900 mb-1">
									<?php esc_html_e( 'WhatsApp', 'mobiris' ); ?>
								</h3>
								<p class="text-gray-700 mb-2">
									<?php echo esc_html( get_theme_mod( 'mobiris_whatsapp_number', '+234 800 000 0000' ) ); ?>
								</p>
								<?php
								$whatsapp_link = mobiris_whatsapp_link( __( 'Hi, I\'d like to learn more about Mobiris', 'mobiris' ) );
								if ( $whatsapp_link ) {
									echo wp_kses_post( '<a href="' . esc_url( mobiris_whatsapp_url( __( 'Hi, I\'d like to learn more about Mobiris', 'mobiris' ) ) ) . '" class="inline-block text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200">' . esc_html__( 'Click to chat', 'mobiris' ) . '</a>' );
								}
								?>
								<p class="text-gray-600 text-sm mt-2">
									<?php esc_html_e( 'Typically responds within 2 hours', 'mobiris' ); ?>
								</p>
							</div>
						</div>

						<!-- Hours -->
						<div class="flex gap-4">
							<div class="flex-shrink-0">
								<div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
									<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
									</svg>
								</div>
							</div>
							<div>
								<h3 class="font-semibold text-gray-900 mb-1">
									<?php esc_html_e( 'Business Hours', 'mobiris' ); ?>
								</h3>
								<p class="text-gray-700">
									<?php esc_html_e( 'Monday – Friday, 9am – 6pm WAT', 'mobiris' ); ?>
								</p>
							</div>
						</div>

					</div>

					<!-- Enterprise Note -->
					<div class="mt-12 p-6 bg-gray-50 border border-gray-200 rounded-lg">
						<p class="text-sm text-gray-700 leading-relaxed">
							<?php esc_html_e( 'For enterprise enquiries, SLA discussions, or partnership conversations, email us at', 'mobiris' ); ?>
							<a href="mailto:hello@mobiris.ng" class="text-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> hover:underline">
								hello@mobiris.ng
							</a>
							<?php esc_html_e( 'or message us on WhatsApp.', 'mobiris' ); ?>
						</p>
					</div>

				</div>

			</div>
		</div>
	</section>

	<!-- Alternative Contact Options -->
	<section class="py-16 bg-gray-50 border-t border-gray-200">
		<div class="container mx-auto px-6">
			<h2 class="text-2xl font-bold text-center mb-12 text-gray-900">
				<?php esc_html_e( 'Other Ways to Reach Us', 'mobiris' ); ?>
			</h2>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">

				<!-- Schedule Demo -->
				<?php $demo_url = get_theme_mod( 'mobiris_demo_url', '' ); ?>
				<?php if ( $demo_url ) : ?>
					<div class="text-center">
						<div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
							<svg class="w-8 h-8 text-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?>" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
							</svg>
						</div>
						<h3 class="font-semibold text-gray-900 mb-2">
							<?php esc_html_e( 'Schedule a Demo', 'mobiris' ); ?>
						</h3>
						<p class="text-gray-600 text-sm mb-4">
							<?php esc_html_e( 'See Mobiris in action with a personalized walkthrough.', 'mobiris' ); ?>
						</p>
						<a href="<?php echo esc_url( $demo_url ); ?>" class="inline-block text-<?php echo esc_attr( get_theme_mod( 'mobiris_primary_blue', '#2563EB' ) ); ?> hover:underline font-semibold text-sm">
							<?php esc_html_e( 'Book a Demo →', 'mobiris' ); ?>
						</a>
					</div>
				<?php else : ?>
					<div class="text-center opacity-50">
						<div class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
							<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
							</svg>
						</div>
						<h3 class="font-semibold text-gray-900 mb-2">
							<?php esc_html_e( 'Schedule a Demo', 'mobiris' ); ?>
						</h3>
						<p class="text-gray-600 text-sm">
							<?php esc_html_e( '(Not yet configured)', 'mobiris' ); ?>
						</p>
					</div>
				<?php endif; ?>

				<!-- LinkedIn -->
				<?php $linkedin_url = get_theme_mod( 'mobiris_linkedin_url', '' ); ?>
				<?php if ( $linkedin_url ) : ?>
					<div class="text-center">
						<div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
							<svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
								<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
							</svg>
						</div>
						<h3 class="font-semibold text-gray-900 mb-2">
							<?php esc_html_e( 'LinkedIn', 'mobiris' ); ?>
						</h3>
						<p class="text-gray-600 text-sm mb-4">
							<?php esc_html_e( 'Connect with us on LinkedIn for updates and insights.', 'mobiris' ); ?>
						</p>
						<a href="<?php echo esc_url( $linkedin_url ); ?>" target="_blank" rel="noopener noreferrer" class="inline-block text-blue-600 hover:underline font-semibold text-sm">
							<?php esc_html_e( 'Visit LinkedIn →', 'mobiris' ); ?>
						</a>
					</div>
				<?php else : ?>
					<div class="text-center opacity-50">
						<div class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
							<svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
								<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
							</svg>
						</div>
						<h3 class="font-semibold text-gray-900 mb-2">
							<?php esc_html_e( 'LinkedIn', 'mobiris' ); ?>
						</h3>
						<p class="text-gray-600 text-sm">
							<?php esc_html_e( '(Not yet configured)', 'mobiris' ); ?>
						</p>
					</div>
				<?php endif; ?>

				<!-- FAQ -->
				<div class="text-center">
					<div class="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
						<svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
					</div>
					<h3 class="font-semibold text-gray-900 mb-2">
						<?php esc_html_e( 'Looking for Answers?', 'mobiris' ); ?>
					</h3>
					<p class="text-gray-600 text-sm mb-4">
						<?php esc_html_e( 'Check our FAQ for quick answers.', 'mobiris' ); ?>
					</p>
					<a href="<?php echo esc_url( get_page_link( get_page_by_path( 'faq' ) ) ); ?>" class="inline-block text-amber-600 hover:underline font-semibold text-sm">
						<?php esc_html_e( 'Visit FAQ →', 'mobiris' ); ?>
					</a>
				</div>

			</div>
		</div>
	</section>

</main>

<?php get_footer(); ?>
