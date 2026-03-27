<?php
/**
 * Footer — Mobiris V2
 * @package MobirisV2
 */
$wa_num     = mv2_opt('mv2_whatsapp','2348053108039');
$signup_url = mv2_signup_url();
?>
</main><!-- #mv2-main -->

<footer class="mv2-footer" role="contentinfo">
  <div class="mv2-footer__top mv2-container">

    <!-- Brand -->
    <div class="mv2-footer__brand">
      <div class="mv2-footer__logo-text"><?php echo esc_html( mv2_opt('mv2_company_name','Mobiris') ); ?></div>
      <p class="mv2-footer__tagline"
         data-lang-en="Mobility risk infrastructure for transport operators in West Africa."
         data-lang-fr="Infrastructure de risque de mobilité pour les opérateurs de transport en Afrique de l'Ouest.">
        Mobility risk infrastructure for transport operators in West Africa.
      </p>
      <!-- App links -->
      <div class="mv2-footer__apps">
        <?php
        $ios_url     = mv2_opt('mv2_ios_url','');
        $android_url = mv2_opt('mv2_android_url','');
        ?>
        <a href="<?php echo $ios_url ? esc_url($ios_url) : '#'; ?>"
           class="mv2-app-badge<?php echo !$ios_url ? ' mv2-app-badge--soon' : ''; ?>"
           <?php if($ios_url): ?>target="_blank" rel="noopener"<?php endif; ?>>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M11.5 0h-7A3.5 3.5 0 001 3.5v9A3.5 3.5 0 004.5 16h7a3.5 3.5 0 003.5-3.5v-9A3.5 3.5 0 0011.5 0zM8 13.5a1 1 0 110-2 1 1 0 010 2z"/></svg>
          <div><small><?php echo $ios_url ? esc_html__('Download on','mobiris-v2') : esc_html__('Coming to','mobiris-v2'); ?></small><strong>App Store</strong></div>
        </a>
        <a href="<?php echo $android_url ? esc_url($android_url) : '#'; ?>"
           class="mv2-app-badge<?php echo !$android_url ? ' mv2-app-badge--soon' : ''; ?>"
           <?php if($android_url): ?>target="_blank" rel="noopener"<?php endif; ?>>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M11 6H5v8h6V6zm-1 7H6V7h4v6zM8 0a1 1 0 011 1v1.5H7V1a1 1 0 011-1zM3 3H1v6h2V3zm10 0v6h2V3h-2zM9.5 4a.5.5 0 110 1 .5.5 0 010-1zm-3 0a.5.5 0 110 1 .5.5 0 010-1z"/></svg>
          <div><small><?php echo $android_url ? esc_html__('Get on','mobiris-v2') : esc_html__('Coming to','mobiris-v2'); ?></small><strong>Google Play</strong></div>
        </a>
        <a href="<?php echo esc_url( mv2_opt('mv2_login_url','https://app.mobiris.ng') ); ?>"
           class="mv2-app-badge" target="_blank" rel="noopener">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 2a6 6 0 010 12A6 6 0 018 2z"/></svg>
          <div><small>Open</small><strong>Web App</strong></div>
        </a>
      </div>
    </div>

    <!-- Nav columns -->
    <div class="mv2-footer__cols">
      <div class="mv2-footer__col">
        <h4 class="mv2-footer__col-title" data-lang-en="Product" data-lang-fr="Produit">Product</h4>
        <?php wp_nav_menu( array( 'theme_location'=>'footer-1','container'=>false,'menu_class'=>'mv2-footer__col-list','fallback_cb'=>false,'depth'=>1 ) ); ?>
        <?php if ( ! has_nav_menu('footer-1') ) : ?>
          <ul class="mv2-footer__col-list">
            <li><a href="<?php echo esc_url(home_url('/product')); ?>">Product</a></li>
            <li><a href="<?php echo esc_url(home_url('/how-it-works')); ?>">How It Works</a></li>
            <li><a href="<?php echo esc_url(home_url('/pricing')); ?>">Pricing</a></li>
            <li><a href="<?php echo esc_url(home_url('/profit-calculator')); ?>">Calculator</a></li>
          </ul>
        <?php endif; ?>
      </div>
      <div class="mv2-footer__col">
        <h4 class="mv2-footer__col-title" data-lang-en="For You" data-lang-fr="Pour Vous">For You</h4>
        <ul class="mv2-footer__col-list">
          <li><a href="<?php echo esc_url(home_url('/for-fleet-owners')); ?>" data-lang-en="Fleet Owners" data-lang-fr="Propriétaires de Flotte">Fleet Owners</a></li>
          <li><a href="<?php echo esc_url(home_url('/for-investors')); ?>" data-lang-en="Investors" data-lang-fr="Investisseurs">Investors</a></li>
          <li><a href="<?php echo esc_url(home_url('/start-transport-business')); ?>" data-lang-en="Start a Business" data-lang-fr="Créer une Entreprise">Start a Business</a></li>
          <li><a href="<?php echo esc_url(home_url('/why-losing-money')); ?>" data-lang-en="Why You Lose Money" data-lang-fr="Pourquoi Vous Perdez">Why You Lose Money</a></li>
        </ul>
      </div>
      <div class="mv2-footer__col">
        <h4 class="mv2-footer__col-title" data-lang-en="Company" data-lang-fr="Société">Company</h4>
        <ul class="mv2-footer__col-list">
          <li><a href="<?php echo esc_url(home_url('/blog')); ?>">Blog</a></li>
          <li><a href="<?php echo esc_url(home_url('/contact')); ?>" data-lang-en="Contact" data-lang-fr="Contact">Contact</a></li>
          <li><a href="<?php echo esc_url(home_url('/privacy-policy')); ?>" data-lang-en="Privacy Policy" data-lang-fr="Politique de Confidentialité">Privacy Policy</a></li>
          <li><a href="<?php echo esc_url(home_url('/terms-of-service')); ?>" data-lang-en="Terms of Service" data-lang-fr="Conditions d'Utilisation">Terms of Service</a></li>
        </ul>
      </div>
      <div class="mv2-footer__col">
        <h4 class="mv2-footer__col-title" data-lang-en="Talk to Us" data-lang-fr="Nous Contacter">Talk to Us</h4>
        <p class="mv2-footer__contact-note" data-lang-en="We respond fastest on WhatsApp." data-lang-fr="Nous répondons le plus vite sur WhatsApp.">We respond fastest on WhatsApp.</p>
        <a href="<?php echo esc_url( mv2_wa_url('mv2_wa_msg_operator') ); ?>"
           class="mv2-btn mv2-btn--whatsapp mv2-btn--sm" target="_blank" rel="noopener">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 0C4.48 0 0 4.48 0 10c0 1.77.46 3.43 1.27 4.86L0 20l5.3-1.24A9.94 9.94 0 0010 20c5.52 0 10-4.48 10-10S15.52 0 10 0zm5.22 14.09c-.22.61-1.08 1.12-1.75 1.26-.47.1-1.09.17-3.14-.67C7.7 13.58 5.28 10.77 5.1 10.54c-.18-.23-1.52-2.03-1.52-3.87 0-1.84.97-2.73 1.49-2.92.52-.18.86-.13 1.22-.13.3 0 .62 0 .88.67.3.74 1.01 2.47 1.1 2.65.09.18.14.4.03.63-.11.24-.17.38-.34.59-.17.21-.35.47-.5.64-.17.17-.34.37-.15.72.2.35.85 1.4 1.81 2.26 1.24 1.1 2.29 1.44 2.62 1.6.33.16.52.14.71-.06.2-.2.83-.97 1.05-1.3.22-.33.44-.27.75-.17.3.11 1.93.91 2.26 1.07.33.17.56.25.64.38.08.14.08.82-.14 1.43z"/></svg>
          <span data-lang-en="WhatsApp Us" data-lang-fr="Nous envoyer un message">WhatsApp Us</span>
        </a>
        <p class="mv2-footer__email"><a href="mailto:hello@mobiris.ng">hello@mobiris.ng</a></p>
      </div>
    </div>

  </div>

  <div class="mv2-footer__bottom mv2-container">
    <p class="mv2-footer__copy">
      © <?php echo date_i18n('Y'); ?> Growth Figures Limited (Mobiris) · RC1957484 · Lagos, Nigeria
    </p>
    <div class="mv2-footer__bottom-lang">
      <button class="mv2-lang-btn mv2-lang-btn--active" data-lang="en">EN</button>
      <button class="mv2-lang-btn" data-lang="fr">FR</button>
    </div>
  </div>
</footer>

<?php mv2_global('whatsapp-float'); ?>

<?php wp_footer(); ?>
</body>
</html>
