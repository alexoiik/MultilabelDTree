$(function () {
    $('#loadingbtn').hide();

    // Handling Alert Message for the User's Resetting of Forgotten Password. 
    const alertPlaceholder = $('#alertPlaceholder');

    const alert_danger = (message) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = [
            `<div class="alert alert-danger d-flex align-items-center" role="alert">`,
            `   <svg xmlns="http://www.w3.org/2000/svg" class="bi bi-x-octagon-fill alert-icon alert-danger-color" viewBox="0 0 16 16"><path d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353L11.46.146zm-6.106 4.5L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708z"/></svg> <div class="alert-text">${message}</div>`,
            '</div>'
        ].join('');

        alertPlaceholder.append(wrapper);
    }

    const alert_success = (message) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = [
            '<div class="alert alert-success d-flex align-items-center" role="alert">',
            '<svg xmlns="http://www.w3.org/2000/svg" class="bi bi-check-circle-fill alert-icon" viewBox="0 0 16 16">',
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
            '<svg xmlns="http://www.w3.org/2000/svg" class="bi bi-exclamation-octagon-fill alert-icon" viewBox="0 0 16 16">',
            '<path d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353L11.46.146zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>',
            `</svg> <div class="alert-text">${message}</div>`,
            '</div>'
        ].join('');

        alertPlaceholder.append(wrapper);
    }

    var input_key = $("input");
    input_key.on("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            if ($("#confbtn").css("display") !== "none") {
                $("#confbtn").click();
            }
        }
    });

    if (sessionStorage.getItem("token") !== null) {
        window.location.href = '../';
    }

    // Handling User's Resetting of Forgotten Password.
    $('#confbtn').click(function () {

        $('#alertPlaceholder').html("");
        var email = $('#email').val().trim();

        // User's Email Validation.
        if (email.length == 0) {
            alert_danger("Email is Required.");
            return;
        }

        $('#alertPlaceholder').html("");
        $('#confbtn').hide();
        $('#loadingbtn').show();

        $.ajax({
            url: '../server/php/resetPassword.php',
            method: 'POST',
            data: JSON.stringify({ email: email }),
            dataType: "json",
            contentType: 'application/json',
            success: function () {
                alert_success("Verification email sent.");
                alert_warning("Please verify your account.");
                $('#loadingbtn').hide();
                $('#confbtn').show();
                $("#confbtn").text("Resend Email.");
            },
            error: function (xhr, status, error) {
                var response = JSON.parse(xhr.responseText);
                var errormes = response.errormesg;
                alert_danger(errormes);
                $('#loadingbtn').hide();
                $('#confbtn').show();
            }
        });
    });
});