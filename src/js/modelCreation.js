$(function () {

    // Initializing content.
    $('#loadingbtn').hide();
    $('#loadingbtn2').hide();
    $('#loadingbtn3').hide();
    $('#table_div').hide();
    $('#params_div').hide();
    $('#modelEvaluationResults').hide();
    $('#loadingbtn_dataset').hide();
    $('#loadingbtnSave').hide();

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

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

    $("#logoutb").click(function () {
        sessionStorage.clear();
        window.location.href = '../';
    });

    $('#drop_width').click(function (event) {
        event.stopPropagation();
    });

    // Handling PopUp Notification Modal.
    var modal_key = $("#modal2");
    modal_key.on("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            if ($("#modal2").css("display") !== "none") {
                $("#modal_btn").click();
            }
        }
    });

    // Function for Getting all Datasets.
    function getDatasets() {

        var link = '../server/php/api/receiveDatasets.php?token=' + token;

        // AJAX Request for Receiving all Datasets.
        $.ajax({
            url: link,
            method: 'GET',
            success: function (data) {
                var data2 = JSON.parse(data);
                var publicDatasets = data2.public_data;
                var privateDatasets = data2.private_data;

                $("#select_dataset").html("");
                $("#select_dataset").append($("<option value='default' selected>Select an existing Dataset</option>"));

                // Public Datasets.
                for (var i = 0; i < publicDatasets.length; i++) {
                    $("#select_dataset").append($(`<option class='public' value='${publicDatasets[i]}'>[PUBLIC]  ${publicDatasets[i]}</option>`));
                }
                // Private Datasets.
                for (var i = 0; i < privateDatasets.length; i++) {
                    $("#select_dataset").append($(`<option class='private' value='${privateDatasets[i]}'>[PRIVATE]  ${privateDatasets[i]}</option>`));
                }

                $('#delbtn').prop("disabled", true);
                $('#dnload-btn').prop("disabled", true);
                $('#table_div').hide();
                $('#params_div').hide();
                $('#modelEvaluationResults').hide();
            },
            error: function (xhr, status, error) {
                var response = JSON.parse(xhr.responseText);
                var errormes = response.errormesg;
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html(errormes);
                $("#select_dataset").html("");
                $("#select_dataset").append($("<option value='default' selected>Select an existing Dataset</option>"));
                $('#delbtn').prop("disabled", true);
                $('#dnload-btn').prop("disabled", true);
                $('#table_div').hide();
                $('#params_div').hide();
                $('#modelEvaluationResults').hide();
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
    $("#upload_btn").click(function () {
        $('#upl_modal').modal('show');
        $('#alertPlaceholder').html("");
        $("#select_folder").val('0');
        $("#formFile").val("");
    });

    // Handling Cancel btn of Modal.
    $('#cancelbtn').click(function () {
        $('#alertPlaceholder').html("");
    });

    // Handling New Dataset's Uploading.
    $('#conf_upl').click(function () {

        $('#alertPlaceholder').html("");

        // File Uploading Validation.
        if ($("#formFile").prop('files').length == 0) {
            alert_danger("You must upload a dataset.");
            return;
        }

        var file = $("#formFile").prop('files')[0];
        var checkFile = /(\.csv)$/i;

        if (!checkFile.test(file.name)) {
            alert_danger("Only .csv files are allowed.");
            return;
        }
        if (file.size > 10485760) {
            alert_danger("Max dataset size is 10 MB.");
            return;
        }

        var folder = $("#select_folder :selected").val();

        if (folder == "Select a folder type") {
            alert_danger("Please select a folder type.");
            return;
        }

        switch (folder) {
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
            success: function () {
                alert_success("Dataset uploaded successfully.");
                $("#formFile").val("");
                $("#select_folder").val('0');
                $("#loadingbtn").hide();
                $("#conf_upl").show();
                getDatasets();
            },
            error: function (xhr, status, error) {
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
    $("#checkSelectAll").click(function () {
        var selAll = $("input[name=select_all]:checked");
        var check = $("input[name=num_field]");
        if (selAll.length > 0) {
            for (var i = 0; i < check.length; i++) {
                if (check[i].type == 'checkbox') {
                    check[i].checked = true;
                }
            }
            $("#checkBoxes").click();
        }
        else {
            for (var i = 0; i < check.length; i++) {
                if (check[i].type == 'checkbox') {
                    check[i].checked = false;
                }
            }
            $("#checkBoxes").click();
        }
    });

    // Selecting All Labels.
    $("#checkSelectAll2").click(function () {
        var selAll = $("input[name=select_all2]:checked");
        var check = $("input[name=binary_fields]");
        if (selAll.length > 0) {
            for (var i = 0; i < check.length; i++) {
                if (check[i].type == 'checkbox') {
                    check[i].checked = true;
                }
            }
            $("#select_class").click();
        }
        else {
            for (var i = 0; i < check.length; i++) {
                if (check[i].type == 'checkbox') {
                    check[i].checked = false;
                }
            }
            $("#select_class").click();
        }
    });

    // Handling Dataset Selection.
    $("#select_dataset").on("change", function () {

        $('#table_div').hide();
        $('#params_div').hide();
        $('#modelEvaluationResults').hide();

        var selected = $("#select_dataset :selected").val(); // Getting current file selection.
        var folder = $("#select_dataset :selected").attr("class"); // Getting current folder type selection.

        if (selected == "default") {
            $('#delbtn').prop("disabled", true);
            $('#dnload-btn').prop("disabled", true);
            return;
        }

        $('#delbtn').prop("disabled", false);
        $('#dnload-btn').prop("disabled", false);
        $('#loadingbtn_dataset').show();

        // AJAX Request for Getting the Dataset Content.
        $.ajax({
            url: `../server/php/api/multilabelDatasetContent.php?token=${token}&file=${selected}&folder=${folder}`,
            method: 'GET',
            success: function (data) {
                try {
                    var data2 = JSON.parse(data);
                    var csv_array = data2.csv_array;
                    var num_fields = data2.numerical_fields;
                    var fields1 = data2.binary_fields;

                    // Filtering out from numerical fields, only the labels.
                    var filteredNumFields = num_fields.filter(field => !fields1.includes(field));

                    $("#data_table_head_tr").html("");
                    $("#data_table_tbody").html("");

                    // 15-Row Preview of the dataset.
                    $.each(csv_array[0], function (index, val) {
                        $("#data_table_head_tr").append($(`<th scope="col">${val}</th>`));
                    });
                    for (var i = 1; i <= 15; i++) {
                        var tr_id = 'tr' + i;
                        $("#data_table_tbody").append($(`<tr id="${tr_id}"></tr>`));
                        $.each(csv_array[i], function (index3, val3) {
                            $(`#${tr_id}`).append($(`<td><div class="data_table_tbody_td">${val3}</div></td>`));
                        });
                    }

                    $('#loadingbtn_dataset').hide();
                    $('#table_div').show();

                    // Displaying the total record length.
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
                    for (var i = 0; i < filteredNumFields.length; i++) {
                        $('#checkBoxes').append($(`
                            <div class="form-check form-check-inline">
                                <input class="form-check-input edit_checkbox" type="checkbox" name="num_field" value="${filteredNumFields[i]}" id="flexCheckDefault">
                                <label class="form-check-label" for="flexCheckDefault">
                                    ${filteredNumFields[i]}
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
                    for (var i = 0; i < fields1.length; i++) {
                        $('#select_class').append($(`
                            <div class="form-check form-check-inline">
                                <input class="form-check-input edit_checkbox" type="checkbox" name="binary_fields" value="${fields1[i]}" id="flexCheckDefault">
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
                    for (var i = 0; i < classifiers.length; i++) {
                        $("#select_classifier").append($(`<option value='${classifiers[i]}'>${classifiers[i]}</option>`));
                    }

                    $("#max_depth").val("");
                    $("#min_samples_leaf").val("1");
                    $("#kFolds").val("5");
                    $('#params_div').show();
                } catch (error) {
                    $('#loadingbtn_dataset').hide();
                    $('#dnload-btn').prop("disabled", true);
                    $('#modal2_text').html("");
                    $('#modal2').modal('show');
                    $('#modal2_text').html("Unable to proccess this dataset.");
                }
            },
            error: function (xhr, status, error) {
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

    // Handling Dataset's Deletion.
    $('#delbtn').click(function () {
        var file = $("#select_dataset :selected").val(); // Getting current file selection.
        var folder = $("#select_dataset :selected").attr("class"); // Getting current folder type selection.

        $('#dnload-btn').prop("disabled", true);
        $('#delbtn').hide();
        $('#loadingbtn2').show();

        // AJAX Request for Deleting a Dataset.
        $.ajax({
            url: '../server/php/api/destroyDataset.php',
            method: 'DELETE',
            data: JSON.stringify({ file: file, folder: folder, token: token }),
            dataType: "json",
            contentType: 'application/json',
            success: function () {
                $("#loadingbtn2").hide();
                $("#delbtn").show();
                $('#delbtn').prop("disabled", true);
                $("#select_dataset :selected").remove();
                $("#select_dataset").val("default");
                $('#table_div').hide();
                $('#params_div').hide();
                $('#modelEvaluationResults').hide();
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html("Dataset successfully deleted.");
            },
            error: function (xhr, status, error) {
                var response = JSON.parse(xhr.responseText);
                var errormes = response.errormesg;
                $("#loadingbtn2").hide();
                $("#delbtn").show();
                $('#delbtn').prop("disabled", true);
                $("#select_dataset").val("default");
                $('#table_div').hide();
                $('#params_div').hide();
                $('#modelEvaluationResults').hide();
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html(errormes);
            }
        });
    });

    // Handling Dataset's Downloading.
    $('#dnload-btn').click(function (event) {
        var file = $("#select_dataset :selected").val();
        var folder = $("#select_dataset :selected").attr("class");
        var link = '../server/php/api/downloadDataset.php?token=' + token + '&folder=' + folder + '&file=' + file;
        event.preventDefault();
        window.location.href = link;
    });

    // Handling Auto checkbox for max_depth.
    $("#max_depth_auto_checkbox").change(function () {
        if (this.checked) {
            $("#max_depth").val("Auto").prop("disabled", true);
        } else {
            $("#max_depth").val("").prop("disabled", false);
        }
    });

    // Handling Auto checkbox for min_samples_leaf.
    $("#min_samples_leaf_auto_checkbox").change(function () {
        if (this.checked) {
            $("#min_samples_leaf").val("Auto").prop("disabled", true);
        } else {
            $("#min_samples_leaf").val("").prop("disabled", false);
        }
    });

    // Handling Build Model for Multilabel Cross Validation.
    $("#buildModelBtn").click(function () {

        $('#modelEvaluationResults').hide(); // Hidding Model Evaluation Results.

        $("#max_depth:focus").blur(); // Max Depth.
        $("#min_samples_leaf:focus").blur(); // Min Samples Leaf.
        $("#kFolds:focus").blur(); // K for KFold.

        $("#model_name").val("my_multilabel_model"); // Default Model's Name.

        // Features Selection Validation.
        var check = $("input[name=num_field]:checked");

        if (check.length == 0) {
            $('#modal2_text').html("");
            $('#modal2').modal('show');
            $('#modal2_text').html("You didn't select any feature.");
            return;
        }
        var selected_features = {};
        $.each(check, function (i) {
            selected_features[i] = $(this).val();
        });

        // Labels Selection Validation.
        var check2 = $("input[name=binary_fields]:checked");

        if (check2.length < 2) {
            $('#modal2_text').html("");
            $('#modal2').modal('show');
            $('#modal2_text').html("You must select two or more labels.");
            return;
        }
        var selected_labels = {};
        $.each(check2, function (i) {
            selected_labels[i] = $(this).val();
        });

        // Classifier Selection Validation.
        var selected_classifier = $("#select_classifier :selected").val();
        if (selected_classifier == 'default') {
            $('#modal2_text').html("");
            $('#modal2').modal('show');
            $('#modal2_text').html("Please select a classifier.");
            return;
        }

        // Max Depth Input Validation.
        var max_depth = $("#max_depth").val().trim();

        if (max_depth.length > 0 && max_depth !== 'Auto') {

            max_depth = Number.parseInt(max_depth);

            if (Number.isNaN(max_depth)) {
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html("Please give a valid value for the Max Depth.");
                return;
            }
            if (max_depth < 1) {
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html("You should give a Max Depth &ge; 1.");
                return;
            }
        }

        // Min Samples Leaf Validation.
        var min_samples_leaf = $("#min_samples_leaf").val().trim();

        if (min_samples_leaf !== 'Auto') {

            if (min_samples_leaf.length == 0) {
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html("Please give a Min Samples Leaf.");
                return;
            }

            var min_samples_leaf = Number.parseInt(min_samples_leaf);

            if (Number.isNaN(min_samples_leaf)) {
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html("Please give a valid value for the Min Samples Leaf.");
                return;
            }

            if (min_samples_leaf < 1) {
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html("You should give a Min Samples Leaf &ge; 1.");
                return;
            }
        }

        // K for KFolds Validation.
        var kFolds = $("#kFolds").val().trim();
        if (kFolds.length == 0) {
            $('#modal2_text').html("");
            $('#modal2').modal('show');
            $('#modal2_text').html("Please give the k value.");
            return;
        }

        var kFoldsInt = Number.parseInt(kFolds);
        if (Number.isNaN(kFoldsInt)) {
            $('#modal2_text').html("");
            $('#modal2').modal('show');
            $('#modal2_text').html("Please give a valid value for k.");
            return;
        }

        if ((kFoldsInt < 5) || (kFoldsInt > 50)) {
            $('#modal2_text').html("");
            $('#modal2').modal('show');
            $('#modal2_text').html("Incorrect k. Range of accepted values: 5 - 50.");
            return;
        }

        var file = $("#select_dataset :selected").val(); // Getting current file selection.
        var folder = $("#select_dataset :selected").attr("class"); // Getting current folder type selection.

        $("#buildModelBtn").hide();
        $("#loadingbtn3").show();

        // AJAX Request for Performing Multilabel Cross Validation.
        $.ajax({
            url: '../server/php/api/multilabelCrossValidation.php',
            method: 'POST',
            data: JSON.stringify({
                token: token, // Current token.
                features: selected_features, // Features selection.
                labels: selected_labels, // Labels selection.
                classifier: selected_classifier, // Classifier selection.
                max_depth: max_depth, // Max Depth selection.
                min_samples_leaf: min_samples_leaf, // Min Samples Leaf selection.
                folder: folder, // Folder Type selection.
                file: file, // File selection.
                kFoldsInt: kFoldsInt // K for KFold selection.
            }),
            dataType: "json",
            contentType: 'application/json',
            success: function (data) {

                // console.log(data);

                var avg_hl = data.avg_hl;
                var avg_acc = data.avg_acc;
                var avg_pre = data.avg_pre;
                var avg_rec = data.avg_rec;
                var avg_fsc = data.avg_fsc;
                var pre_per_label = data.pre_per_label;
                var rec_per_label = data.rec_per_label;
                var fsc_per_label = data.fsc_per_label;
                var labels = data.labels;
                var classifier = data.classifier;
                var max_depth = data.max_depth;
                var min_samples_leaf = data.min_samples_leaf;
                var k = data.k;

                var labelsLength = (data.labels.length);

                // Metrics Information Display for Each Label.
                $("#results_container").html("");

                for (var i = 0; i < labels.length; i++) {
                    $("#results_tbody").append($(`
                        <tr>
                            <td>${labels[i]}</td>
                            <td>${pre_per_label[i]}</td>
                            <td>${rec_per_label[i]}</td>
                            <td>${fsc_per_label[i]}</td>
                        </tr>    
                    `));
                }
                for (var i = 0; i < labelsLength; i++) {
                    var tableHtml = `
                        <div id="results_tableDiv${i + 1}" style="margin-top: 33px; overflow-x:auto">
                            <table id="results_table${i + 1}" class="table table-bordered table-style table-hover">
                                <thead>
                                    <tr>
                                        <th scope="col" colspan="4">Metrics for Label ${i + 1} - ${selected_labels[i]}</th>
                                    </tr>
                                    <tr>
                                        <th scope="col">Label</th>
                                        <th scope="col">Precision</th>
                                        <th scope="col">Recall</th>
                                        <th scope="col">F-score</th>
                                    </tr>
                                </thead>
                                <tbody class="table-group-divider">`;

                    for (var j = 0; j < labels[i].length; j++) {
                        var precision = pre_per_label[i][j] !== undefined ? pre_per_label[i][j] : 0;
                        var recall = rec_per_label[i][j] !== undefined ? rec_per_label[i][j] : 0;
                        var fscore = fsc_per_label[i][j] !== undefined ? fsc_per_label[i][j] : 0;

                        tableHtml += `
                            <tr>
                                <td>${labels[i][j]}</td>
                                <td>${precision}</td>
                                <td>${recall}</td>
                                <td>${fscore}</td>
                            </tr>`;
                    }

                    tableHtml += `
                                </tbody>
                            </table>
                        </div>`;

                    $("#results_container").append($(tableHtml));
                }

                // Average Metrics Information Display.
                $("#results_tr").html("");
                $("#results_tr").append($(`<td>${avg_hl}</td>`));
                $("#results_tr").append($(`<td>${avg_acc}</td>`));
                $("#results_tr").append($(`<td>${avg_pre}</td>`));
                $("#results_tr").append($(`<td>${avg_rec}</td>`));
                $("#results_tr").append($(`<td>${avg_fsc}</td>`));

                // Model's Parameters Information Display.
                $("#selectedClassifier").text(classifier);
                $("#selectedMaxDepth").text(max_depth ? max_depth : "None");
                $("#selectedMinSamplesLeaf").text(min_samples_leaf);
                $("#selectedK").text(k);

                $("#loadingbtn3").hide();
                $("#buildModelBtn").show();
                $('#modelEvaluationResults').show();
                window.location.href = '#modelEvaluationResults';
            },
            error: function (xhr, status, error) {
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

    // Handling Clear Btn.
    $('#clearBtn').click(function () {
        // Unchecking the checkboxes of the patameters.
        $('#checkSelectAll input[type="checkbox"], #checkBoxes input[type="checkbox"], #checkSelectAll2 input[type="checkbox"], #select_class input[type="checkbox"], #max_depth_auto_checkbox, #min_samples_leaf_auto_checkbox').each(function () {
            $(this).prop('checked', false);
        });
        // Initializing the values of the parameters.
        $("#select_classifier").html("");
        $("#select_classifier").append($("<option value='default' selected>Select classifier</option>"));
        var classifiers = [
            'Auto',
            'BinaryRelevance',
            'LabelPowerset',
            'ClassifierChain'
        ];
        for (var i = 0; i < classifiers.length; i++) {
            $("#select_classifier").append($(`<option value='${classifiers[i]}'>${classifiers[i]}</option>`));
        }
        $("#min_samples_leaf").val("1").prop("disabled", false);;
        $("#max_depth").val("").prop("disabled", false);;
        $("#kFolds").val("5");
    });

    // Handling Cancel Btn.
    $('#cancelBtn').click(function () {
        location.reload();
    });

    // Handling Save Model.
    $("#saveModelBtn").click(function () {

        $("#model_name:focus").blur(); // Model Name.

        // Features Selection Validation.
        var check = $("input[name=num_field]:checked");

        if (check.length == 0) {
            $('#modal2_text').html("");
            $('#modal2').modal('show');
            $('#modal2_text').html("You didn't select any feature.");
            return;
        }
        var selected_features = {};
        $.each(check, function (i) {
            selected_features[i] = $(this).val();
        });

        // Labels Selection Validation.
        var check2 = $("input[name=binary_fields]:checked");

        if (check2.length < 2) {
            $('#modal2_text').html("");
            $('#modal2').modal('show');
            $('#modal2_text').html("You must select two or more labels.");
            return;
        }
        var selected_labels = {};
        $.each(check2, function (i) {
            selected_labels[i] = $(this).val();
        });

        // Getting Calculated Classifier Selection.
        var selected_classifier = $("#selectedClassifier").html();

        // Getting Calculated Max Depth Selection.
        var max_depth = $("#selectedMaxDepth").html();

        // Getting Calculated Min Samples Leaf Selection.
        var min_samples_leaf = $("#selectedMinSamplesLeaf").html();

        // Model Name Validation.
        var model_name = $("#model_name").val().trim();

        if (model_name.length == 0) {
            $('#modal2_text').html("");
            $('#modal2').modal('show');
            $('#modal2_text').html("Please give a name for your Model.");
            return;
        }

        var file = $("#select_dataset :selected").val(); // Getting current file selection.
        var folder = $("#select_dataset :selected").attr("class"); // Getting current folder type selection.

        $("#saveModelBtn").hide();
        $("#loadingbtnSave").show();

        // AJAX Request for Saving User's Model.
        $.ajax({
            url: '../server/php/api/saveMultilabelModel.php',
            method: 'POST',
            data: JSON.stringify({
                token: token, // Current token.
                features: selected_features, // Features selection.
                labels: selected_labels, // Labels selection.
                classifier: selected_classifier, // Classifier selection.
                max_depth: max_depth, // Max Depth selection.
                min_samples_leaf: min_samples_leaf, // Min Samples Leaf selection.
                folder: folder, // Folder Type selection.
                file: file, // File selection.
                model_name: model_name // Model Name selection.
            }),
            dataType: "json",
            contentType: 'application/json',
            success: function (data) {
                var mes = data.message;
                $("#loadingbtnSave").hide();
                $("#saveModelBtn").show();
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html($(`
                    <div>${mes}</div>
                    <div class="app_href">
                        You can now check out your model by going in the <a href="pretrainedModels.html">Pretrained Models</a> page!
                    </div>
                `));
            },
            error: function (xhr, status, error) {
                var response = JSON.parse(xhr.responseText);
                var errormes = response.errormesg;
                $("#loadingbtnSave").hide();
                $("#saveModelBtn").show();
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html(errormes);
            }
        });
    });

});