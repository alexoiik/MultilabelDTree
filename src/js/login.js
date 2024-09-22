$(function () {
    $('#loadingbtn').hide();

    // Handling Alert Message for the User's Log In. 
    const alertPlaceholder = $('#alertPlaceholder');

    const alert = (message) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = [
            `<div class="alert alert-danger d-flex align-items-center alert-dismissible" role="alert">`,
            `   <svg xmlns="http://www.w3.org/2000/svg" class="bi bi-x-octagon-fill login-alert-icon alert-danger-color" viewBox="0 0 16 16"><path d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353L11.46.146zm-6.106 4.5L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708z"/></svg> <div class="alert-text">${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('');

        alertPlaceholder.append(wrapper);
    }

    var input_key = $("input");
    input_key.on("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            if ($("#loginbtn").css("display") !== "none") {
                $("#loginbtn").click();
            }
        }
    });

    if (sessionStorage.getItem("token") !== null) {
        window.location.href = '../';
    }

    // Handling User's Log In.
    $('#loginbtn').click(function () {

        $('#alertPlaceholder').html("");
        var email = $('#email').val().trim();
        var pass = $('#pass').val().trim();

        // User's Information Validation.
        if (email.length == 0) {
            alert('Email is Required.');
            return;
        }
        if (pass.length == 0) {
            alert("Password is Required.");
            return;
        }

        $('#alertPlaceholder').html("");
        $('#loginbtn').hide();
        $('#loadingbtn').show();

        $.ajax({
            url: '../server/php/api/login.php',
            method: 'POST',
            data: JSON.stringify({
                email: email, // User's Email.
                pass: pass // User's Password.
            }),
            dataType: "json",
            contentType: 'application/json',
            success: function (data) {
                sessionStorage.setItem("email", data.email);
                sessionStorage.setItem("token", data.token);
                sessionStorage.setItem("fname", data.fname);
                sessionStorage.setItem("lname", data.lname);

                $('#loadingbtn').hide();
                $('#loginbtn').show();

                window.location.href = '../';
            },
            error: function (xhr, status, error) {
                var response = JSON.parse(xhr.responseText);
                var errormes = response.errormesg;
                alert(errormes);
                $('#loadingbtn').hide();
                $('#loginbtn').show();
            }
        });
    });
});