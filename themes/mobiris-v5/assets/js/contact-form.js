/* Mobiris v5 — Contact Form AJAX handler */
( function () {
    'use strict';

    var form     = document.getElementById( 'mobiris-contact-form' );
    if ( ! form ) return;

    var submitBtn   = document.getElementById( 'cf-submit' );
    var submitLabel = submitBtn.querySelector( '.cf-submit-label' );
    var submitLoad  = submitBtn.querySelector( '.cf-submit-loading' );
    var feedback    = document.getElementById( 'cf-feedback' );
    var successBox  = document.getElementById( 'cf-success' );
    var successMsg  = document.getElementById( 'cf-success-msg' );
    var waFallback  = document.getElementById( 'cf-wa-fallback' );

    function setLoading( on ) {
        submitBtn.disabled = on;
        submitLabel.hidden = on;
        submitLoad.hidden  = ! on;
    }

    function showError( msg ) {
        feedback.hidden    = false;
        feedback.className = 'contact-form__feedback contact-form__feedback--error';
        feedback.textContent = msg;
        feedback.scrollIntoView( { behavior: 'smooth', block: 'nearest' } );
    }

    function showSuccess( msg, waUrl ) {
        form.querySelectorAll( '.contact-form__row, .contact-form__group, .contact-form__footer' )
            .forEach( function ( el ) { el.hidden = true; } );
        feedback.hidden = true;
        successBox.hidden = false;
        successMsg.textContent = msg;
        if ( waUrl ) {
            waFallback.href   = waUrl;
            waFallback.hidden = false;
        }
        successBox.scrollIntoView( { behavior: 'smooth', block: 'nearest' } );
    }

    form.addEventListener( 'submit', function ( e ) {
        e.preventDefault();
        feedback.hidden = true;

        var name    = form.querySelector( '[name="name"]' ).value.trim();
        var email   = form.querySelector( '[name="email"]' ).value.trim();
        var message = form.querySelector( '[name="message"]' ).value.trim();

        if ( ! name ) { showError( 'Please enter your name.' ); return; }
        if ( ! email || ! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( email ) ) {
            showError( 'Please enter a valid email address.' ); return;
        }
        if ( ! message ) { showError( 'Please enter a message.' ); return; }

        setLoading( true );

        var data = new FormData( form );
        data.append( 'action', 'mobiris_contact_form' );
        data.append( 'nonce',  MobirisContact.nonce );

        fetch( MobirisContact.ajaxUrl, {
            method: 'POST',
            credentials: 'same-origin',
            body: data,
        } )
        .then( function ( res ) { return res.json(); } )
        .then( function ( json ) {
            setLoading( false );
            if ( json.success ) {
                showSuccess( json.data.message, json.data.waUrl || null );
            } else {
                showError( json.data.message || 'Something went wrong. Please try again.' );
            }
        } )
        .catch( function () {
            setLoading( false );
            showError( 'Connection error. Please check your internet and try again, or reach us on WhatsApp.' );
        } );
    } );
} )();
