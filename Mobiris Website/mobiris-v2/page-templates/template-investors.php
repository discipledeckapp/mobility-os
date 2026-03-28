<?php
/**
 * Template Name: For Investors
 */
get_header(); ?>

<div class="mv2-inner-hero mv2-inner-hero--investors">
  <div class="mv2-container">
    <div class="mv2-badge mv2-badge--blue"
         data-lang-en="For investors" data-lang-fr="Pour les investisseurs">For investors</div>
    <h1 data-lang-en="Africa's transport sector is large, fragmented, and digitally underserved"
        data-lang-fr="Le secteur du transport en Afrique est vaste, fragmenté et sous-servi digitalement">
      Africa's transport sector is large, fragmented, and digitally underserved
    </h1>
    <p data-lang-en="Mobiris is building the operational infrastructure for the informal transport economy — starting with fleet management and remittance, expanding into identity, compliance, and financial services."
       data-lang-fr="Mobiris construit l'infrastructure opérationnelle pour l'économie informelle du transport — en commençant par la gestion de flotte et les remises, en s'étendant à l'identité, la conformité et les services financiers.">
      Mobiris is building the operational infrastructure for the informal transport economy — starting with fleet management and remittance, expanding into identity, compliance, and financial services.
    </p>
  </div>
</div>

<section class="mv2-section mv2-section--white">
  <div class="mv2-container mv2-prose">
    <?php while (have_posts()) : the_post(); ?>
      <?php the_content(); ?>
    <?php endwhile; ?>
  </div>
</section>

<div class="mv2-section mv2-section--offwhite">
  <div class="mv2-container mv2-section-header mv2-section-header--center">
    <h2 data-lang-en="Interested in learning more?"
        data-lang-fr="Intéressé à en savoir plus ?">Interested in learning more?</h2>
    <p data-lang-en="Reach out to our founding team directly."
       data-lang-fr="Contactez directement notre équipe fondatrice.">Reach out to our founding team directly.</p>
    <a href="<?php echo esc_url(mv2_wa_url('whatsapp_msg_general')); ?>"
       class="mv2-btn mv2-btn--primary" target="_blank" rel="noopener noreferrer">
      <span data-lang-en="Contact the team" data-lang-fr="Contacter l'équipe">Contact the team</span>
    </a>
  </div>
</div>

<?php get_footer();
