$(function() {

    // Initializing content.
    $('#loadingbtn').hide();
    $('#loadingbtn2').hide();
    $('#loadingbtn3').hide();
    $('#table_div').hide();
    $('#params_div').hide();
    $('#results_div').hide();
    $('#loadingbtn_dataset').hide();
    $('#loadingbtnSave').hide();

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    if(sessionStorage.getItem("token") !== null) {
        $("#username").html($(`
        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
        <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
        <path d="M399 384.2C376.9 345.8 335.4 320 288 320H224c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z"/>
        </svg><span style="margin-left: 10px;">${sessionStorage.getItem("fname")} ${sessionStorage.getItem("lname")}</span>`));
    }
    else {
        // window.location.href = 'login.html'; << Correct for redirect.
    }

    var token = sessionStorage.getItem("token");

    $("#logoutb").click(function() {
        sessionStorage.clear();
        window.location.href = '../';
    });

    $('#drop_width').click(function(event) {
        event.stopPropagation();
    });

    var modal_key = $("#modal2");
    modal_key.on("keypress", function(event) {
        if(event.key === "Enter"){
            event.preventDefault();
            if($("#modal2").css("display") !== "none"){
                $("#modal_btn").click();
            }
        }
    });

    var input_key = $("#params input");
    input_key.on("keypress", function(event) {
        if(event.key === "Enter"){
            event.preventDefault();
            if($("#buildModelBtn").css("display") !== "none"){
                $("#buildModelBtn").click();
            }
        }
    });

    var input_key = $("#model_name");
    input_key.on("keypress", function(event) {
        if(event.key === "Enter"){
            event.preventDefault();
            if($("#save_btn").css("display") !== "none"){
                $("#save_btn").click();
            }
        }
    });

    // Function for getting all datasets.
    function getDatasets() {

        var link = '../server/php/api/receiveDatasets.php?token=' + token;

        $.ajax({
            url: link,
            method: 'GET',
            success: function(data){
                var data2 = JSON.parse(data);
                var publicDatasets = data2.public_data;
                var privateDatasets = data2.private_data;

                $("#select_dataset").html("");
                $("#select_dataset").append($("<option value='default' selected>Select an existing Dataset</option>"));

                for(var i = 0; i < publicDatasets.length; i++){
                    $("#select_dataset").append($(`<option class='public' value='${publicDatasets[i]}'>[PUBLIC]  ${publicDatasets[i]}</option>`));
                }

                // for(var i = 0; i < privateDatasets.length; i++) {
                //     $("#select_dataset").append($(`<option class='private' value='${privateDatasets[i]}'>[PRIVATE]  ${privateDatasets[i]}</option>`));
                // }

                $('#delbtn').prop("disabled",true);
                $('#dnload-btn').prop("disabled",true);
                $('#table_div').hide();
                $('#params_div').hide();
                $('#results_div').hide();
            },
            error: function(xhr, status, error) {
                var response = JSON.parse(xhr.responseText);
                var errormes = response.errormesg;
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html(errormes);
                $("#select_dataset").html("");
                $("#select_dataset").append($("<option value='default' selected>Select an existing Dataset</option>"));
                $('#delbtn').prop("disabled",true);
                $('#dnload-btn').prop("disabled",true);
                $('#table_div').hide();
                $('#params_div').hide();
                $('#results_div').hide();
            }
        });
    }

    getDatasets(); // Calling getDatasets Function.

    // Handling Alert Messages when Uploading New Dataset. 
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

    // Handling Upload New Dataset Button.
    $("#upload_btn").click(function() {
        $('#upl_modal').modal('show');
        $('#alertPlaceholder').html("");
        $("#select_folder").val('0');
        $("#formFile").val("");
    });

    $('#cancelbtn').click(function(){
        $('#alertPlaceholder').html("");
    });

    // Handling new dataset's uploading.
    $('#conf_upl').click(function() {
        
        $('#alertPlaceholder').html("");

        // File Uploading Validation.
        if($("#formFile").prop('files').length == 0) {
            alert_danger("You must upload a dataset.");
            return;
        }

        var file = $("#formFile").prop('files')[0];
        var checkFile = /(\.csv)$/i;

        if(!checkFile.test(file.name)) {
            alert_danger("Only .csv files are allowed.");
            return;
        }
        if(file.size > 10485760) {
            alert_danger("Max dataset size is 10 MB.");
            return;
        }

        var folder = $("#select_folder :selected").val();

        if(folder == "Select a folder type") {
            alert_danger("Please select a folder type.");
            return;
        }   

        switch(folder) { 
            case "Private folder":
                folder = "private";
                break;
            case "Public folder":
                folder = "public";
                break;
        }

        var formData = new FormData();
        formData.set("token", token);
        formData.set("folder", folder);
        formData.set("file", file);
        
        $('#alertPlaceholder').html("");
        $("#conf_upl").hide();
        $('#loadingbtn').show();

        // AJAX Request for Uploading a New Dataset.
        $.ajax({
            url: '../server/php/api/uploadDataset.php',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function() {
                alert_success("File uploaded successfully.");
                $("#formFile").val("");
                $("#select_folder").val('0');
                $("#loadingbtn").hide();
                $("#conf_upl").show();
                getDatasets();
            },
            error: function(xhr, status, error) {
                var response = JSON.parse(xhr.responseText);
                var errormes = response.errormesg;
                alert_danger(errormes);
                $("#formFile").val("");
                $("#select_folder").val('0');
                $("#loadingbtn").hide();
                $("#conf_upl").show();
            }
        });
    });

    // Selecting All Features.
    $("#checkSelectAll").click(function() {
        var selAll = $("input[name=select_all]:checked");
        var check = $("input[name=num_field]");
        if(selAll.length > 0) {
            for(var i = 0; i < check.length; i++) {
                if(check[i].type == 'checkbox') {
                    check[i].checked = true;
                }
            }
            $("#checkBoxes").click();
        }
        else {
            for(var i = 0; i < check.length; i++) {
                if(check[i].type == 'checkbox') {
                    check[i].checked = false;
                }
            }
            $("#checkBoxes").click();
        }
    });
    
    // Selecting All Labels.
    $("#checkSelectAll2").click(function() {
        var selAll = $("input[name=select_all2]:checked");
        var check = $("input[name=fields1]");
        if(selAll.length > 0) {
            for(var i = 0; i < check.length; i++) {
                if(check[i].type == 'checkbox') {
                    check[i].checked = true;
                }
            }
            $("#select_class").click();
        }
        else {
            for(var i = 0; i < check.length; i++) {
                if(check[i].type == 'checkbox') {
                    check[i].checked = false;
                }
            }
            $("#select_class").click();
        }
    });

    // Handling Dataset Selection.
    $("#select_dataset").on("change",function() {

        $('#table_div').hide();
        $('#params_div').hide();
        $('#results_div').hide();

        var selected = $("#select_dataset :selected").val();
        var folder = $("#select_dataset :selected").attr("class");

        if(selected == "default") {
            $('#delbtn').prop("disabled", true);
            $('#dnload-btn').prop("disabled", true);
            return;
        }

        $('#delbtn').prop("disabled",false);
        $('#dnload-btn').prop("disabled",false);
        $('#loadingbtn_dataset').show();
        
        // AJAX Request for getting the dataset content.
        $.ajax({
            url: `../server/php/api/multilabelDatasetContent.php?token=${token}&file=${selected}&folder=${folder}`,
            method: 'GET',
            success: function(data) {
                try {
                    var data2 = JSON.parse(data);
                    //console.log(data2)
                    var csv_array = data2.csv_array;
                    //console.log(csv_array)
                    var num_fields = data2.numerical_fields;
                    //console.log(num_fields)
                    var fields1 = data2.fields;
                    //console.log(fields1)

                    $("#data_table_head_tr").html("");
                    $("#data_table_tbody").html("");
                        
                    // 15-Row Preview of the dataset.
                    $.each(csv_array[0], function(index,val){
                        $("#data_table_head_tr").append($(`<th scope="col">${val}</th>`));
                    });

                    for(var i = 1; i <= 15; i++){
                        var tr_id = 'tr' + i;
                        $("#data_table_tbody").append($(`<tr id="${tr_id}"></tr>`));
                        $.each(csv_array[i], function(index3,val3){
                            $(`#${tr_id}`).append($(`<td><div class="data_table_tbody_td">${val3}</div></td>`)); 
                        });
                    }
                    
                    $('#loadingbtn_dataset').hide();
                    $('#table_div').show();

                    // Getting the total record length.
                    $('#record-count').text(csv_array.length);

                    // Features Selection.
                    $('#checkSelectAll').html("");
                    $('#checkSelectAll').append($(`
                        <input class="form-check-input edit_checkbox" type="checkbox" name="select_all" value="Select all" id="flexCheckDefault">
                        <label class="form-check-label" for="flexCheckDefault">
                            Select all
                        </label>
                    `));
                    $('#checkBoxes').html("");
                    for(var i = 0; i < num_fields.length; i++) {
                        $('#checkBoxes').append($(`
                            <div class="form-check form-check-inline">
                                <input class="form-check-input edit_checkbox" type="checkbox" name="num_field" value="${num_fields[i]}" id="flexCheckDefault">
                                <label class="form-check-label" for="flexCheckDefault">
                                    ${num_fields[i]}
                                </label>
                            </div>
                        `));
                    }

                    // Labels Selection.
                    $('#checkSelectAll2').html("");
                    $('#checkSelectAll2').append($(`
                        <input class="form-check-input edit_checkbox" type="checkbox" name="select_all2" value="Select all" id="flexCheckDefault">
                        <label class="form-check-label" for="flexCheckDefault">
                            Select all
                        </label>
                    `));
                    $('#select_class').html("");
                    for(var i = 0; i < fields1.length; i++) {
                        $('#select_class').append($(`
                            <div class="form-check form-check-inline">
                                <input class="form-check-input edit_checkbox" type="checkbox" name="fields1" value="${fields1[i]}" id="flexCheckDefault">
                                <label class="form-check-label" for="flexCheckDefault">
                                    ${fields1[i]}
                                </label>
                            </div>
                        `));
                    }

                    // Classifier Selection.
                    $("#select_classifier").html("");
                    $("#select_classifier").append($("<option value='default' selected>Select classifier</option>"));
                    var classifiers = [
                        'Auto', 
                        'BinaryRelevance', 
                        'LabelPowerset', 
                        'ClassifierChain'
                    ];
                    for(var i = 0; i < classifiers.length; i++) {
                        $("#select_classifier").append($(`<option value='${classifiers[i]}'>${classifiers[i]}</option>`));
                    }

                    $("#max_depth").val("");
                    $("#min_samples_leaf").val("1");
                    $("#kFolds").val("5");
                    $('#params_div').show();
                } catch(error) {
                    $('#loadingbtn_dataset').hide();
                    $('#dnload-btn').prop("disabled",true);
                    $('#modal2_text').html("");
                    $('#modal2').modal('show');
                    $('#modal2_text').html("Unable to proccess this dataset, because it's not well formated as a csv file.");
                }
            },
            error: function(xhr, status, error) {
                var response = JSON.parse(xhr.responseText);
                var errormes = response.errormesg;
                $('#loadingbtn_dataset').hide();
                $('#dnload-btn').prop("disabled", true);
                $("#select_classifier").append($("<option value='default' selected>Select classifier</option>"));
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html(errormes);
            }
        });
    });

    // Handling Dataset Deletion.
    $('#delbtn').click(function() {
        var file = $("#select_dataset :selected").val();
        var folder = $("#select_dataset :selected").attr("class");

        $('#dnload-btn').prop("disabled",true);
        $('#delbtn').hide();
        $('#loadingbtn2').show();

        $.ajax({
            url: '../server/php/api/destroyDataset.php',
            method: 'DELETE',
            data: JSON.stringify({file: file, folder: folder, token: token}),
            dataType: "json",
            contentType: 'application/json',
            success: function() {
                $("#loadingbtn2").hide();
                $("#delbtn").show();
                $('#delbtn').prop("disabled",true);
                $("#select_dataset :selected").remove();
                $("#select_dataset").val("default");
                $('#table_div').hide();
                $('#params_div').hide();
                $('#results_div').hide();
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html("Dataset successfully deleted.");
            },
            error: function(xhr, status, error) {
                var response = JSON.parse(xhr.responseText);
                var errormes = response.errormesg;
                $("#loadingbtn2").hide();
                $("#delbtn").show();
                $('#delbtn').prop("disabled",true);
                $("#select_dataset").val("default");
                $('#table_div').hide();
                $('#params_div').hide();
                $('#results_div').hide();
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html(errormes);
            }
        });
    });

    // Handling dataset's downloading.
    $('#dnload-btn').click(function(event) {
        var file = $("#select_dataset :selected").val();
        var folder = $("#select_dataset :selected").attr("class");
        var link = '../server/php/api/downloadDataset.php?token=' + token + '&folder=' + folder + '&file=' + file;
        event.preventDefault();
        window.location.href = link;
    });

    // Handling Auto checkbox for max_depth.
    $("#max_depth_auto_checkbox").change(function() {
        if(this.checked) {
            $("#max_depth").val("Auto").prop("disabled", true);
        } else {
            $("#max_depth").val("").prop("disabled", false);
        }
    });

    // Handling Auto checkbox for min_samples_leaf.
    $("#min_samples_leaf_auto_checkbox").change(function() {
        if(this.checked) {
            $("#min_samples_leaf").val("Auto").prop("disabled", true);
        } else {
            $("#min_samples_leaf").val("").prop("disabled", false);
        }
    });

    // Handling Build Model Classification.
    $("#buildModelBtn").click(function() {

        $('#results_div').hide();

        $("#max_depth:focus").blur(); // Max Depth.
        $("#min_samples_leaf:focus").blur(); // Min Samples Leaf.
        $("#kFolds:focus").blur(); // K for KFold.

        $("#model_name").val("my_model");
        
        // Features Selection Validation.
        var check = $("input[name=num_field]:checked");

        if(check.length == 0) {
            $('#modal2_text').html("");
            $('#modal2').modal('show');
            $('#modal2_text').html("You didn't select any feature.");
            return;
        }
        var checkVal = {};
        $.each(check, function(i) {
            checkVal[i] = $(this).val();
        });

        // Labels Selection Validation.
        var check2 = $("input[name=fields1]:checked");

        if(check2.length < 2) {
            $('#modal2_text').html("");
            $('#modal2').modal('show');
            $('#modal2_text').html("You have to select two or more labels.");
            return;
        }
        var checkVal2 = {};
        $.each(check2, function(i) {
            checkVal2[i] = $(this).val();
        });

        // Classifier Selection Validation.
        var selected = $("#select_classifier :selected").val();
        if(selected == 'default') {
            $('#modal2_text').html("");
            $('#modal2').modal('show');
            $('#modal2_text').html("Please select a classifier.");
            return;
        }

        // Max Depth Input Validation.
        var max_depth = $("#max_depth").val().trim();

        if(max_depth.length > 0 && max_depth !== 'Auto') {

            max_depth = Number.parseInt(max_depth);

            if(Number.isNaN(max_depth)) {
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html("Please give a valid value for the max_depth.");
                return;
            }
            if(max_depth < 1) {
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html("You should give a max_depth &ge; 1.");
                return;
            }
        }

        // Min Samples Leaf Validation.
        var min_samples_leaf = $("#min_samples_leaf").val().trim();

        if(min_samples_leaf !== 'Auto') {

            if(min_samples_leaf.length == 0) {
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html("Please give a min_samples_leaf.");
                return;
            }

            var min_samples_leaf = Number.parseInt(min_samples_leaf);

            if(Number.isNaN(min_samples_leaf)) {
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html("Please give a valid value for the min_samples_leaf.");
                return;
            }

            if(min_samples_leaf < 1) {
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html("You should give a min_samples_leaf &ge; 1.");
                return;
            }
        }

        // K for KFolds Validation.
        var kFolds = $("#kFolds").val().trim();
        if(kFolds.length == 0) {
            $('#modal2_text').html("");
            $('#modal2').modal('show');
            $('#modal2_text').html("Please give the k value.");
            return;
        }

        var kFoldsInt = Number.parseInt(kFolds);
        if(Number.isNaN(kFoldsInt)) {
	        $('#modal2_text').html("");
            $('#modal2').modal('show');
            $('#modal2_text').html("Please give a valid value for k.");
            return;
        }

        if((kFoldsInt < 5) || (kFoldsInt > 50)) {
            $('#modal2_text').html("");
            $('#modal2').modal('show');
            $('#modal2_text').html("Incorrect k. Range of accepted values: 5 - 50.");
            return;
        }

        var file = $("#select_dataset :selected").val();
        var folder = $("#select_dataset :selected").attr("class");

        $("#buildModelBtn").hide();
        $("#loadingbtn3").show();

        $.ajax({
            url: '../server/php/api/cross_validation.php',
            method: 'POST',
            data: JSON.stringify({
                token: token, 
                checkVal: checkVal, 
                selected: selected, 
                max_depth: max_depth, 
                min_samples_leaf: min_samples_leaf, 
                folder: folder, 
                file: file, 
                kFoldsInt: kFoldsInt
            }),
            dataType: "json",
            contentType: 'application/json',
            success: function(data) {
                var avg_acc = data.avg_acc;
                var avg_pre = data.avg_pre; 
                var avg_rec = data.avg_rec;
                var avg_fsc = data.avg_fsc;
                var pre_per_label = data.pre_per_label;
                var rec_per_label = data.rec_per_label;
                var fsc_per_label = data.fsc_per_label;
                var labels = data.labels;
                $("#results_tr").html("");
                $("#results_tr").append($(`<td>${avg_acc}</td>`));
                $("#results_tr").append($(`<td>${avg_pre}</td>`));
                $("#results_tr").append($(`<td>${avg_rec}</td>`));
                $("#results_tr").append($(`<td>${avg_fsc}</td>`));
                $("#results_tbody").html("");
                for(var i = 0; i < labels.length; i++) {
                    $("#results_tbody").append($(`
                        <tr>
                            <td>${labels[i]}</td>
                            <td>${pre_per_label[i]}</td>
                            <td>${rec_per_label[i]}</td>
                            <td>${fsc_per_label[i]}</td>
                        </tr>    
                    `));
                }
                $("#loadingbtn3").hide();
                $("#buildModelBtn").show();
                $('#results_div').show();
                window.location.href = '#results_div';
            },
            error: function(xhr, status, error) {
                var response = JSON.parse(xhr.responseText);
                var errormes = response.errormesg;
                $("#loadingbtn3").hide();
                $("#buildModelBtn").show();
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html(errormes);
            }
        });
    });

    // Handling Cancel Btn.
    $('#cancelBtn').click(function() {
        location.reload();
    });

    // Handling Save Model.

    // Handling Visualize DTree.

    // DataTable Selected Row Feature.
    $("#data_table").click(function(event) {
        $(".selectedRow").removeClass("selectedRow");
        $(event.target).closest("tr").addClass("selectedRow");
    });
});