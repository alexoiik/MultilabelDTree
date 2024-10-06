$(function () {
    $('#loadingbtn').hide();

    // Handling Alert Message for the User's Edit Credentials. 
    const alertPlaceholder = $('#alertPlaceholder');

    const alert_danger = (message) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = [
            `<div class="alert alert-danger d-flex align-items-center alert-dismissible" role="alert">`,
            `   <svg xmlns="http://www.w3.org/2000/svg" class="bi bi-x-octagon-fill alert-icon alert-danger-color" viewBox="0 0 16 16"><path d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353L11.46.146zm-6.106 4.5L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708z"/></svg> <div class="alert-text">${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('');

        alertPlaceholder.append(wrapper);
    }

    const alert_success = (message) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = [
            '<div class="alert alert-success d-flex align-items-center alert-dismissible" role="alert">',
            '<svg xmlns="http://www.w3.org/2000/svg" class="bi bi-check-circle-fill alert-icon" viewBox="0 0 16 16">',
            '<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>',
            `</svg> <div class="alert-text">${message}</div>`,
            '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('');

        alertPlaceholder.append(wrapper);
    }

    var input_key = $("input");
    input_key.on("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            if ($("#confbtn1").css("display") !== "none") {
                $("#confbtn1").click();
            }
        }
    });

    if (sessionStorage.getItem("token") !== null) {
        $("#username").html($(`
            <svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; margin-bottom: 3px;" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            <span style="margin-left: 9px">
                ${sessionStorage.getItem("fname")} ${sessionStorage.getItem("lname")}
            </span>
        `));
    }
    else {
        window.location.href = 'login.html';
    }

    var token = sessionStorage.getItem("token");

    // Handling User's Logout.
    $("#logoutb").click(function () {
        sessionStorage.clear();
        window.location.href = '../';
    });

    $('#drop_width').click(function (event) {
        event.stopPropagation();
    });

    // Handling User's Edit Credentials.
    $('#confbtn1').click(function () {

        $('#alertPlaceholder').html("");
        var fname = $('#fname').val().trim(); // Getting User's First Name.
        var lname = $('#lname').val().trim(); // Getting User's Last Name.
        var pass = $('#pass').val().trim(); // Getting User's Password.
        var new_pass = $('#new_pass').val().trim(); // Getting User's New Password.
        var new_pass_confirm = $('#new_pass_confirm').val().trim(); // Getting User's Confirmed Password.

        // User's Information Validation.
        if ((fname.length == 0) && (lname.length == 0) && (pass.length == 0) && (new_pass.length == 0) && (new_pass_confirm.length == 0)) {
            alert_danger("You must edit at least one field.");
            return;
        }

        // User's First Name & Last Name Validation.
        var edited_fields = {};
        if (fname.length > 0) {
            if (fname == sessionStorage.getItem("fname")) {
                alert_danger("Enter a different First Name from the existing.");
                return;
            } else {
                edited_fields.fname = fname;
            }
        }
        if (lname.length > 0) {
            if (lname == sessionStorage.getItem("lname")) {
                alert_danger("Enter a different Last Name from the existing.");
                return;
            } else {
                edited_fields.lname = lname;
            }
        }

        // User's Password Validation.
        if ((pass.length > 0) && (new_pass.length == 0)) {
            alert_danger("New Password is Required.");
            return;
        }
        if ((pass.length == 0) && (new_pass.length > 0)) {
            alert_danger("Current Password is Required.");
            return;
        }
        if ((pass.length > 0) && (new_pass.length > 0) && (new_pass_confirm.length == 0)) {
            alert_danger("Please Confirm New Password.");
            return;
        }
        if ((new_pass_confirm.length > 0) && ((pass.length == 0) || (new_pass.length == 0))) {
            alert_danger("Password fields are Required.");
            return;
        }
        if ((pass.length > 0) && (new_pass.length > 0) && (new_pass_confirm.length > 0)) {
            edited_fields.pass = pass;
            edited_fields.new_pass = new_pass;
            edited_fields.new_pass_confirm = new_pass_confirm;
        }

        edited_fields.token = token;

        $('#alertPlaceholder').html("");
        $('#confbtn1').hide();
        $('#loadingbtn').show();

        // AJAX Request to Handle User's Edit Credentials.
        $.ajax({
            url: '../server/php/api/editAccount.php',
            method: 'POST',
            data: JSON.stringify(edited_fields),
            dataType: "json",
            contentType: 'application/json',
            success: function (data) {
                if (data.fname !== null) {
                    sessionStorage.setItem("fname", data.fname);
                }
                if (data.lname !== null) {
                    sessionStorage.setItem("lname", data.lname);
                }
                $("#username").html("");
                $("#username").html($(`
                    <svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; margin-bottom: 3px;" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                    <span style="margin-left: 9px">
                        ${sessionStorage.getItem("fname")} ${sessionStorage.getItem("lname")}
                    </span>
                `));
                $('#fname').val("");
                $('#lname').val("");
                $('#pass').val("");
                $('#new_pass').val("");
                $('#new_pass_confirm').val("");
                alert_success("Your changes have been successfully saved.");
                $('#loadingbtn').hide();
                $("#confbtn1").show();
            },
            error: function (xhr, status, error) {
                var response = JSON.parse(xhr.responseText);
                var errormes = response.errormesg;
                alert_danger(errormes);
                $('#loadingbtn').hide();
                $("#confbtn1").show();
            }
        });
    });
});