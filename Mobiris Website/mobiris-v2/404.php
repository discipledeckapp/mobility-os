<?php
/**
 * 404 — Not Found template.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>
<div class="mv2-404-wrapper mv2-section mv2-section--dark-navy">
	<div class="mv2-container mv2-404-inner">
		<div class="mv2-404-content">
			<div class="mv2-404-code">404</div>
			<h1 class="mv2-404-title">
				<span data-lang-en="Page not found" data-lang-fr="Page introuvable">Page not found</span>
			</h1>
			<p class="mv2-404-text">
				<span data-lang-en="This page doesn't exist or has moved. Let's get you back on track."
				      data-lang-fr="Cette page n'existe pas ou a été déplacée. Retrouvons le bon chemin.">This page doesn't exist or has moved. Let's get you back on track.</span>
			</p>
			<div class="mv2-404-actions">
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="mv2-btn mv2-btn--primary">
					<span data-lang-en="Back to Home" data-lang-fr="Retour à l'accueil">Back to Home</span>
				</a>
				<a href="<?php echo esc_url( mv2_wa_url( 'I need help with Mobiris' ) ); ?>" class="mv2-btn mv2-btn--wa" target="_blank" rel="noopener noreferrer">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
					<span data-lang-en="Get Help on WhatsApp" data-lang-fr="Aide sur WhatsApp">Get Help on WhatsApp</span>
				</a>
			</div>

			<!-- Quick Links -->
			<div class="mv2-404-links">
				<h2 class="mv2-404-links__title">
					<span data-lang-en="Quick links" data-lang-fr="Liens rapides">Quick links</span>
				</h2>
				<ul class="mv2-404-links__list">
					<li><a href="<?php echo esc_url( get_permalink( get_page_by_path( 'product' ) ) ); ?>" data-lang-en="Product" data-lang-fr="Produit">Product</a></li>
					<li><a href="<?php echo esc_url( get_permalink( get_page_by_path( 'pricing' ) ) ); ?>" data-lang-en="Pricing" data-lang-fr="Tarifs">Pricing</a></li>
					<li><a href="<?php echo esc_url( get_permalink( get_page_by_path( 'how-it-works' ) ) ); ?>" data-lang-en="How It Works" data-lang-fr="Comment ça marche">How It Works</a></li>
					<li><a href="<?php echo esc_url( get_permalink( get_page_by_path( 'contact' ) ) ); ?>" data-lang-en="Contact" data-lang-fr="Contact">Contact</a></li>
				</ul>
			</div>
		</div>
	</div>
</div>
<?php
get_footer();
