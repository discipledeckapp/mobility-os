/**
 * Mobiris v4 — Gated Content / Email Capture
 * Handles form submission via AJAX, shows success state, reveals download.
 */
(function () {
  'use strict';

  var form = document.querySelector('.gated__form');
  if (!form) return;

  var input      = form.querySelector('.gated__input');
  var submitBtn  = form.querySelector('.gated__submit');
  var errorEl    = form.querySelector('.gated__error');
  var formCard   = form.closest('.gated__form-card');
  var successEl  = formCard ? formCard.querySelector('.gated__success') : null;
  var downloadBtn = successEl ? successEl.querySelector('.gated__download-btn') : null;
  var resourceId = form.getAttribute('data-resource') || 'download';

  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.removeAttribute('hidden');
    input.classList.add('has-error');
  }

  function clearError() {
    if (!errorEl) return;
    errorEl.setAttribute('hidden', '');
    errorEl.textContent = '';
    input.classList.remove('has-error');
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.textContent = loading
      ? (submitBtn.getAttribute('data-loading') || 'Sending...')
      : (submitBtn.getAttribute('data-label') || submitBtn.textContent);
  }

  // Save original label on load
  submitBtn.setAttribute('data-label', submitBtn.textContent);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();

    var email = input.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('Please enter a valid email address.');
      input.focus();
      return;
    }

    setLoading(true);

    var data = new FormData();
    data.append('action',   'mobiris_capture_email');
    data.append('nonce',    MobirisGated.nonce);
    data.append('email',    email);
    data.append('resource', resourceId);

    fetch(MobirisGated.ajaxUrl, { method: 'POST', body: data })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        setLoading(false);
        if (res.success) {
          // Show success, hide form
          form.setAttribute('hidden', '');
          if (successEl) {
            successEl.removeAttribute('hidden');
            // Reveal download link if URL provided
            if (downloadBtn && res.data && res.data.downloadUrl) {
              downloadBtn.href = res.data.downloadUrl;
              if (res.data.downloadLabel) downloadBtn.textContent = res.data.downloadLabel;
              downloadBtn.style.display = '';
            }
          }
        } else {
          showError(res.data && res.data.message ? res.data.message : 'Something went wrong. Please try again.');
        }
      })
      .catch(function () {
        setLoading(false);
        showError('Network error. Please check your connection and try again.');
      });
  });

})();
