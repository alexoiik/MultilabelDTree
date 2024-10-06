$(function () {
    $('#loginbtn').hide();
    $('#email_resend').hide();

    // Handling Alert Messages for the User's Account Verification. 
    const alertPlaceholder = $('#alertPlaceholder');

    const alert_danger = (message) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = [
            `<div class="alert alert-danger d-flex align-items-center" role="alert">`,
            `   <svg xmlns="http://www.w3.org/2000/svg" class="bi bi-x-octagon-fill register-alert-icon alert-danger-color" viewBox="0 0 16 16"><path d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353L11.46.146zm-6.106 4.5L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708z"/></svg> <div class="alert-text">${message}</div>`,
            '</div>'
        ].join('');

        alertPlaceholder.append(wrapper);
    }

    const alert_success = (message) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = [
            '<div class="alert alert-success d-flex align-items-center" role="alert">',
            '<svg xmlns="http://www.w3.org/2000/svg" class="bi bi-check-circle-fill register-alert-icon" viewBox="0 0 16 16">',
            '<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>',
            `</svg> <div class="alert-text">${message}</div>`,
            '</div>'
        ].join('');

        alertPlaceholder.append(wrapper);
    }

    const alert_warning = (message) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = [
            '<div class="alert alert-warning d-flex align-items-center" role="alert">',
            '<svg xmlns="http://www.w3.org/2000/svg" class="bi bi-exclamation-octagon-fill register-alert-icon" viewBox="0 0 16 16">',
            '<path d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353L11.46.146zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>',
            `</svg> <div class="alert-text">${message}</div>`,
            '</div>'
        ].join('');

        alertPlaceholder.append(wrapper);
    }

    // GetUrlParams Function to Handle Verification Key.
    function getUrlParams(param) {
        var par = {};
        window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (symbol, param, value) {
            par[param] = value;
        });
        if (param) {
            return par[param];
        }
        else {
            return par;
        }
    }

    // Handling User's Verification.
    var verif_key = getUrlParams('verif_key');
    var link = '../server/php/verification.php?verif_key=' + verif_key;
    var email;

    $('#alertPlaceholder').html("");
    $('#loadingbtn').show();

    $.ajax({
        url: link,
        method: 'GET',
        success: function () {
            alert_success("Successfully signed up.");
            sessionStorage.clear();
            $('#loadingbtn').hide();
            $('#loginbtn').show();
        },
        error: function (xhr, status, error) {
            var response = JSON.parse(xhr.responseText);
            var errormes = response.errormesg;
            alert_danger(errormes);
            $('#loadingbtn').hide();
            if (errormes == "Verification key expired.") {
                email = response.email;
                $('#email_resend').show();
            }
        }
    });

    $("#loginbtn").click(function () {
        window.location.href = 'login.html';
    });

    // Handling Email Resend.
    $("#email_resend").click(function () {

        $('#alertPlaceholder').html("");
        var link = '../server/php/emailResend.php?email=' + email;
        $('#email_resend').hide();
        $('#loadingbtn').show();

        // AJAX Request to Handle Email Resend.
        $.ajax({
            url: link,
            method: 'GET',
            success: function () {
                alert_success("Email successfully sent.");
                alert_warning("Please verify your account.");
                $('#loadingbtn').hide();
                $('#email_resend').show();
            },
            error: function (xhr, status, error) {
                var response2 = JSON.parse(xhr.responseText);
                var errormes2 = response2.errormesg;
                alert_danger(errormes2);
                $('#loadingbtn').hide();
                $('#email_resend').show();
            }
        });
    });
});