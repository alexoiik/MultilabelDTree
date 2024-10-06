$(function () {
    $('#loadingbtn').hide();
    $("#homeref").hide();

    // Handling Alert Messages for the User's Delete Account.
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

    var pass_del;
    var pass_del_confirm;

    // Handling User's Delete Account Button.
    $('#delbtn').click(function () {

        $('#alertPlaceholder').html("");
        pass_del = $('#pass_del').val().trim();
        pass_del_confirm = $('#pass_del_confirm').val().trim();

        // User's Password Validation.
        if (pass_del.length == 0) {
            alert_danger("Password is Required.");
            return;
        }
        if (pass_del_confirm.length == 0) {
            alert_danger("Please Confirm Password.");
            return;
        }

        $('#alertPlaceholder').html("");
        $('#del_modal').modal('show');
    });

    // Handling User's Cancel Button.
    $('#cancelbtn').click(function () {
        $('#alertPlaceholder').html("");
        $('#pass_del').val("");
        $('#pass_del_confirm').val("");
    });

    // Handling User's Delete Account.
    $('#confbtn3').click(function () {

        $('#del_modal').modal('hide');
        $('#alertPlaceholder').html("");
        $("#delbtn").hide();
        $("#loadingbtn").show();

        // AJAX Request to Handle Delete Account.
        $.ajax({
            url: '../server/php/api/deleteAccount.php',
            method: 'DELETE',
            data: JSON.stringify({
                pass_del: pass_del, // User's Password.
                pass_del_confirm: pass_del_confirm, // User's Confirmed Password.
                token: token // User's Personal Token.
            }),
            dataType: "json",
            contentType: 'application/json',
            success: function () {
                sessionStorage.clear();
                alert_success("Account successfully deleted.");
                $("#loadingbtn").hide();
                $("#homeref").show();
            },
            error: function (xhr, status, error) {
                var response = JSON.parse(xhr.responseText);
                var errormes = response.errormesg;
                alert_danger(errormes);
                $("#loadingbtn").hide();
                $("#delbtn").show();
            }
        });
    });

    // Handling User's Return Home Button.
    $("#homeref").click(function () {
        window.location.href = '../';
    });
});