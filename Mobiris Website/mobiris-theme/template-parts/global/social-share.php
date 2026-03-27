<?php
/**
 * Social Share Template Part
 *
 * Social sharing component for posts and guides.
 * Includes Twitter, LinkedIn, and copy-to-clipboard functionality.
 *
 * @package Mobiris
 * @since 1.0.0
 */

$post_url   = get_permalink();
$post_title = get_the_title();
$post_url_encoded = urlencode( $post_url );
$post_title_encoded = urlencode( $post_title );
?>

<div class="share-links" aria-label="<?php esc_attr_e( 'Share this article', 'mobiris' ); ?>">
	<span class="share-label"><?php esc_html_e( 'Share:', 'mobiris' ); ?></span>

	<div class="share-buttons">
		<?php
		// Twitter/X share
		$twitter_share_url = sprintf(
			'https://twitter.com/intent/tweet?url=%s&text=%s',
			$post_url_encoded,
			$post_title_encoded
		);
		?>
		<a href="<?php echo esc_url( $twitter_share_url ); ?>"
		   target="_blank"
		   rel="noopener"
		   class="share-btn share-twitter"
		   aria-label="<?php esc_attr_e( 'Share on Twitter', 'mobiris' ); ?>"
		   title="<?php esc_attr_e( 'Share on Twitter', 'mobiris' ); ?>">
			<svg class="share-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
				<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.338-6.977-6.142 6.977H1.705l7.73-8.835L1.239 2.25H8.082l4.872 6.244 5.89-6.244zM17.002 18.807h1.791L5.697 3.88H3.635l13.367 14.927z"/>
			</svg>
		</a>

		<?php
		// LinkedIn share
		$linkedin_share_url = sprintf(
			'https://www.linkedin.com/sharing/share-offsite/?url=%s',
			$post_url_encoded
		);
		?>
		<a href="<?php echo esc_url( $linkedin_share_url ); ?>"
		   target="_blank"
		   rel="noopener"
		   class="share-btn share-linkedin"
		   aria-label="<?php esc_attr_e( 'Share on LinkedIn', 'mobiris' ); ?>"
		   title="<?php esc_attr_e( 'Share on LinkedIn', 'mobiris' ); ?>">
			<svg class="share-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
				<path d="M18.571 0H1.429C0.64 0 0 0.64 0 1.429v17.142C0 19.36 0.64 20 1.429 20h17.142C19.36 20 20 19.36 20 18.571V1.429C20 0.64 19.36 0 18.571 0zM5.953 17.143H2.976V7.5h2.977v9.643zM4.464 6.179c-0.955 0-1.727-0.771-1.727-1.727s0.771-1.727 1.727-1.727 1.727 0.771 1.727 1.727-0.771 1.727-1.727 1.727zm12.679 10.964h-2.977v-4.688c0-1.116-0.043-2.55-1.554-2.55-1.554 0-1.793 1.215-1.793 2.468v4.77h-2.977V7.5h2.86v1.319h0.043c0.398-0.755 1.373-1.554 2.828-1.554 3.025 0 3.582 1.991 3.582 4.583v5.295z"/>
			</svg>
		</a>

		<?php
		// Copy link button
		?>
		<button class="share-btn share-copy"
		        data-copy-text="<?php echo esc_attr( $post_url ); ?>"
		        aria-label="<?php esc_attr_e( 'Copy link', 'mobiris' ); ?>"
		        title="<?php esc_attr_e( 'Copy link to clipboard', 'mobiris' ); ?>">
			<svg class="share-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
				<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.829.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
			</svg>
		</button>
	</div>
</div>

<script type="module">
(function() {
	'use strict';

	const shareButton = document.querySelector('.share-copy');
	if (!shareButton) return;

	shareButton.addEventListener('click', function(e) {
		e.preventDefault();
		const textToCopy = this.getAttribute('data-copy-text');

		// Use modern clipboard API if available
		if (navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(textToCopy).then(function() {
				// Show success feedback
				const originalLabel = shareButton.getAttribute('aria-label');
				shareButton.setAttribute('aria-label', '<?php esc_attr_e( 'Copied!', 'mobiris' ); ?>');
				shareButton.classList.add('copied');

				// Reset after 2 seconds
				setTimeout(function() {
					shareButton.setAttribute('aria-label', originalLabel);
					shareButton.classList.remove('copied');
				}, 2000);
			});
		} else {
			// Fallback for older browsers
			const textarea = document.createElement('textarea');
			textarea.value = textToCopy;
			textarea.style.position = 'fixed';
			textarea.style.opacity = '0';
			document.body.appendChild(textarea);
			textarea.select();
			try {
				document.execCommand('copy');
				const originalLabel = shareButton.getAttribute('aria-label');
				shareButton.setAttribute('aria-label', '<?php esc_attr_e( 'Copied!', 'mobiris' ); ?>');
				shareButton.classList.add('copied');

				setTimeout(function() {
					shareButton.setAttribute('aria-label', originalLabel);
					shareButton.classList.remove('copied');
				}, 2000);
			} catch (err) {
				console.error('Failed to copy text', err);
			} finally {
				document.body.removeChild(textarea);
			}
		}
	});
})();
</script>
