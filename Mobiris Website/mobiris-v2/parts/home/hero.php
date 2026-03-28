<?php
$headline_en   = mv2_opt('hero_headline_en', 'Your drivers collect money. Where does it go?');
$headline_fr   = mv2_opt('hero_headline_fr', 'Vos conducteurs collectent l\'argent. Où va-t-il ?');
$subhead_en    = mv2_opt('hero_subhead_en',  'Mobiris gives transport operators full visibility into daily remittance, driver performance, and compliance — so every naira is accounted for.');
$subhead_fr    = mv2_opt('hero_subhead_fr',  'Mobiris donne aux opérateurs de transport une visibilité complète sur les remises journalières, les performances des conducteurs et la conformité.');
$signup_url    = mv2_signup_url();
?>
<section class="mv2-hero" aria-label="Hero">
  <div class="mv2-container mv2-hero__inner">
    <div class="mv2-hero__copy">
      <div class="mv2-hero__eyebrow">
        <span class="mv2-badge mv2-badge--green"
              data-lang-en="Fleet Operations Platform"
              data-lang-fr="Plateforme de gestion de flotte">Fleet Operations Platform</span>
      </div>
      <h1 class="mv2-hero__headline"
          data-lang-en="<?php echo esc_attr($headline_en); ?>"
          data-lang-fr="<?php echo esc_attr($headline_fr); ?>">
        <?php echo esc_html($headline_en); ?>
      </h1>
      <p class="mv2-hero__subhead"
         data-lang-en="<?php echo esc_attr($subhead_en); ?>"
         data-lang-fr="<?php echo esc_attr($subhead_fr); ?>">
        <?php echo esc_html($subhead_en); ?>
      </p>
      <div class="mv2-hero__actions">
        <a href="<?php echo esc_url($signup_url); ?>" class="mv2-btn mv2-btn--primary mv2-btn--lg">
          <span data-lang-en="Start free — 14 days" data-lang-fr="Commencer — 14 jours gratuits">Start free — 14 days</span>
        </a>
        <a href="<?php echo esc_url(mv2_wa_url('whatsapp_msg_demo')); ?>"
           class="mv2-btn mv2-btn--wa mv2-btn--lg" target="_blank" rel="noopener noreferrer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          <span data-lang-en="Request a walkthrough" data-lang-fr="Demander une démo">Request a walkthrough</span>
        </a>
      </div>
      <div class="mv2-hero__trust">
        <span class="mv2-hero__trust-label"
              data-lang-en="Designed for keke, danfo, korope & matatu operators"
              data-lang-fr="Conçu pour les opérateurs de keke, danfo, korope et matatu">
          Designed for keke, danfo, korope &amp; matatu operators
        </span>
      </div>
    </div>
    <div class="mv2-hero__visual" aria-hidden="true">
      <div class="mv2-dashboard-mock">
        <div class="mv2-dm__topbar">
          <span class="mv2-dm__logo">Mobiris</span>
          <span class="mv2-dm__date">Today</span>
        </div>
        <div class="mv2-dm__stat-row">
          <div class="mv2-dm__stat">
            <span class="mv2-dm__stat-label">Fleet size</span>
            <span class="mv2-dm__stat-val">24</span>
          </div>
          <div class="mv2-dm__stat">
            <span class="mv2-dm__stat-label">Expected today</span>
            <span class="mv2-dm__stat-val mv2-dm__stat-val--green">₦270,000</span>
          </div>
          <div class="mv2-dm__stat">
            <span class="mv2-dm__stat-label">Collected</span>
            <span class="mv2-dm__stat-val">₦238,500</span>
          </div>
          <div class="mv2-dm__stat mv2-dm__stat--alert">
            <span class="mv2-dm__stat-label">Gap</span>
            <span class="mv2-dm__stat-val mv2-dm__stat-val--red">₦31,500</span>
          </div>
        </div>
        <div class="mv2-dm__rows">
          <div class="mv2-dm__row">
            <span class="mv2-dm__driver-dot mv2-dm__driver-dot--ok"></span>
            <span class="mv2-dm__driver-name">Emeka O.</span>
            <span class="mv2-dm__driver-amount">₦11,500</span>
            <span class="mv2-dm__badge mv2-dm__badge--ok">On time</span>
          </div>
          <div class="mv2-dm__row">
            <span class="mv2-dm__driver-dot mv2-dm__driver-dot--warn"></span>
            <span class="mv2-dm__driver-name">Musa A.</span>
            <span class="mv2-dm__driver-amount">₦9,000</span>
            <span class="mv2-dm__badge mv2-dm__badge--warn">Short ₦2,500</span>
          </div>
          <div class="mv2-dm__row">
            <span class="mv2-dm__driver-dot mv2-dm__driver-dot--risk"></span>
            <span class="mv2-dm__driver-name">Tunde B.</span>
            <span class="mv2-dm__driver-amount">₦7,000</span>
            <span class="mv2-dm__badge mv2-dm__badge--risk">Risk flag</span>
          </div>
          <div class="mv2-dm__row">
            <span class="mv2-dm__driver-dot mv2-dm__driver-dot--ok"></span>
            <span class="mv2-dm__driver-name">Chioma N.</span>
            <span class="mv2-dm__driver-amount">₦11,500</span>
            <span class="mv2-dm__badge mv2-dm__badge--ok">On time</span>
          </div>
        </div>
        <div class="mv2-dm__alert-bar">
          ⚠ 3 drivers below target — review remittance records
        </div>
      </div>
    </div>
  </div>
</section>
