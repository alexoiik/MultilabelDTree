$(function () {

    // Initializing content.
    $('#loadingbtn').hide();
    $('#loadingbtn2').hide();
    $('#loadingbtn3').hide();
    $('#params_div2').hide();
    $('#loadingbtnModel').hide();
    $('#loadingbtnModel2').hide();
    $('#loadingbtnDTree').hide();
    $('#loadingbtn_dataset').hide();
    $('#uplDiv_0').hide();
    $('#uplDiv').hide();
    $('#table_div').hide();
    $('#results_div').hide();

    if (sessionStorage.getItem("token") !== null) {
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

    // Handling Metrics PopUp Modal.
    var modal_key2 = $("#metrics_modal");
    modal_key2.on("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            if ($("#metrics_modal").css("display") !== "none") {
                $("#metricsBtn").click();
            }
        }
    });

    // Function for Getting all Models.
    function getModels() {

        var link = '../server/php/api/receiveModels.php?token=' + token;

        // AJAX Request for Receiving all Models.
        $.ajax({
            url: link,
            method: 'GET',
            success: function (data) {

                var data2 = JSON.parse(data);
                var models = data2.models_data;

                $("#select_model").html("");
                $("#select_model").append($("<option value='default' selected>Select a Pretrained Model</option>"));

                for (var i = 0; i < models.length; i++) {
                    let m2 = models[i];
                    m2 = m2.substring(0, m2.length - 4);
                    $("#select_model").append($(`<option value='${models[i]}'>${m2}</option>`));
                }

                $('#del-model').prop("disabled", true);
                $('#dnload-model').prop("disabled", true);
                $('#visualizeDTree').prop("disabled", true);
                $('#params_div2').hide();
                $('#uplDiv_0').hide();
                $('#uplDiv').hide();
                $('#table_div').hide();
                $('#results_div').hide();
            },
            error: function (xhr, status, error) {
                var response = JSON.parse(xhr.responseText);
                var errormes = response.errormesg;
                console.log(errormes);
                $("#select_model").html("");
                $("#select_model").append($("<option value='default' selected>Select a Pretrained Model</option>"));
                $('#del-model').prop("disabled", true);
                $('#dnload-model').prop("disabled", true);
                $('#visualizeDTree').prop("disabled", true);
                $('#params_div2').hide();
                $('#uplDiv_0').hide();
                $('#uplDiv').hide();
                $('#table_div').hide();
                $('#results_div').hide();
            }
        });
    }

    getModels(); // Calling getModels Function.

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

    // Handling Model Selection.
    $("#select_model").on("change", function () {

        $('#params_div2').hide();
        $('#uplDiv_0').hide();
        $('#uplDiv').hide();
        $('#table_div').hide();
        $('#results_div').hide();

        var selected = $("#select_model :selected").val(); // Getting current model file selection.

        if (selected == "default") {
            $('#del-model').prop("disabled", true);
            $('#dnload-model').prop("disabled", true);
            $('#visualizeDTree').prop("disabled", true);
            return;
        }

        $('#del-model').prop("disabled", false);
        $('#dnload-model').prop("disabled", false);
        $('#visualizeDTree').prop("disabled", false);
        $('#loadingbtnModel2').show();

        // AJAX Request for Getting the Model Content.
        $.ajax({
            url: `../server/php/api/multilabelModelContent.php?token=${token}&file=${selected}`,
            method: 'GET',
            success: function (data) {
                let d = JSON.parse(data);
                // console.log(d);

                let cols = d.columns;
                let classifier_type = d.classifier_type
                let max_depth = d.max_depth
                let min_samples_leaf = d.min_samples_leaf
                let labels = d.labels;

                // Displaying Model Classifier Type.
                $("#model_classifierType").html("");
                $("#model_classifierType").append($(`<option value='${classifier_type}' selected>${classifier_type}</option>`));

                // Displaying Model Features.
                $('#model_features').html("");
                for (var i = 0; i < cols.length; i++) {
                    $('#model_features').append($(`
                        <div class="form-check form-check-inline">
                            <input class="form-check-input edit_checkbox" type="checkbox" id="flexCheckDefault2" name="num_field" value="${cols[i]}" checked disabled>
                            <label class="form-check-label" for="flexCheckDefault2">
                                ${cols[i]}
                            </label>
                        </div>
                    `));
                }

                // Displaying Model Labels.
                $("#model_labels").html("");
                for (var i = 0; i < labels.length; i++) {
                    $('#model_labels').append($(`
                        <div class="form-check form-check-inline">
                            <input class="form-check-input edit_checkbox" type="checkbox" id="flexCheckDefault2" name="binary_fields" value="${labels[i]}" checked disabled>
                            <label class="form-check-label" for="flexCheckDefault2">
                                ${labels[i]}
                            </label>
                        </div>
                    `));
                }

                // Displaying Model Max Depth.
                $("#model_max_depth").val(max_depth);

                // Displaying Model Min Samples Leaf
                $("#model_min_samples_leaf").val(min_samples_leaf);

                $('#loadingbtnModel2').hide();
                $('#params_div2').show();
                getDatasets();
                $('#uplDiv_0').show();
                $('#uplDiv').show();
            },
            error: function (xhr, status, error) {
                var response = JSON.parse(xhr.responseText);
                var errormes = response.errormesg;
                $('#dnload-model').prop("disabled", true);
                $('#visualizeTree').prop("disabled", true);
                $('#loadingbtnModel2').hide();
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html(errormes);
            }
        });
    });

    // Handling Model Deletion.
    $('#del-model').click(function () {

        var file = $("#select_model :selected").val(); // Getting current model file selection.

        $('#del-model').prop("disabled", true);
        $('#del-model').hide();
        $('#loadingbtnModel').show();

        // AJAX Request for Deleting a Model.
        $.ajax({
            url: '../server/php/api/destroyModel.php',
            method: 'DELETE',
            data: JSON.stringify({ file: file, token: token }),
            dataType: "json",
            contentType: 'application/json',
            success: function () {
                $("#loadingbtnModel").hide();
                $("#del-model").show();
                $('#del-model').prop("disabled", true);
                $("#select_model :selected").remove();
                $("#select_model").val("default");
                $('#dnload-model').prop("disabled", true);
                $('#visualizeDTree').prop("disabled", true);
                $('#params_div2').hide();
                $('#uplDiv_0').hide();
                $('#uplDiv').hide();
                $('#table_div').hide();
                $('#results_div').hide();
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html("Model successfully deleted.");
            },
            error: function (xhr, status, error) {
                var response = JSON.parse(xhr.responseText);
                var errormes = response.errormesg;
                $("#loadingbtnModel").hide();
                $("#del-model").show();
                $('#del-model').prop("disabled", true);
                $("#select_model").val("default");
                $('#dnload-model').prop("disabled", true);
                $('#visualizeDTree').prop("disabled", true);
                $('#params_div2').hide();
                $('#uplDiv_0').hide();
                $('#uplDiv').hide();
                $('#table_div').hide();
                $('#results_div').hide();
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html(errormes);
            }
        });
    });

    // Handling Model's downloading.
    $('#dnload-model').click(function (event) {
        var file = $("#select_model :selected").val();
        event.preventDefault();
        window.location.href = `../server/php/api/downloadModel.php?token=${token}&file=${file}`;
    });

    // Handling DTrees Visualization.
    // ...

    // Handling DTrees Download.
    // ...

    // Function for Getting all Unclassifed Datasets.
    function getDatasets() {
        // AJAX Request for Receiving all Unclassified Datasets.
        $.ajax({
            url: `../server/php/api/receiveUnclassifiedDatasets.php?token=${token}`,
            method: 'GET',
            success: function (data) {
                var data2 = JSON.parse(data);
                var datasets = data2.unclassified_data;

                $("#select_dataset").html("");
                $("#select_dataset").append($("<option value='default' selected>Select an Unclassified Dataset</option>"));
                for (var i = 0; i < datasets.length; i++) {
                    $("#select_dataset").append($(`<option value='${datasets[i]}'>[UNCLASSIFIED]  ${datasets[i]}</option>`));
                }
                $('#delbtn').prop("disabled", true);
                $('#dnload-btn').prop("disabled", true);
                $('#table_div').hide();
                $('#results_div').hide();
            },
            error: function (xhr, status, error) {
                var response = JSON.parse(xhr.responseText);
                var errormes = response.errormesg;
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html(errormes);
                $("#select_dataset").html("");
                $("#select_dataset").append($("<option value='default' selected>Select an Unclassified Dataset</option>"));
                $('#delbtn').prop("disabled", true);
                $('#dnload-btn').prop("disabled", true);
                $('#table_div').hide();
                $('#results_div').hide();
            }
        });
    }

    // Handling Upload Unclassified Dataset Button.
    $("#upload_btn").click(function () {
        $('#upl_modal').modal('show');
        $('#alertPlaceholder').html("");
        $("#formFile").val("");
    });

    $('#cancelbtn').click(function () {
        $('#alertPlaceholder').html("");
    });

    // Handling Unclassified Dataset's Uploading.
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

        var formData = new FormData();
        formData.set("token", token);
        formData.set("file", file);

        $('#alertPlaceholder').html("");
        $("#conf_upl").hide();
        $('#loadingbtn').show();

        // AJAX Request for Uploading Unclassified Dataset.
        $.ajax({
            url: '../server/php/api/uploadUnclassifiedDataset.php',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function () {
                alert_success("File uploaded successfully.");
                $("#formFile").val("");
                $("#loadingbtn").hide();
                $("#conf_upl").show();
                getDatasets();
            },
            error: function (xhr, status, error) {
                var response = JSON.parse(xhr.responseText);
                var errormes = response.errormesg;
                alert_danger(errormes);
                $("#formFile").val("");
                $("#loadingbtn").hide();
                $("#conf_upl").show();
            }
        });
    });

    // Handling Dataset Selection.
    $("#select_dataset").on("change", function () {

        $('#table_div').hide();
        $('#results_div').hide();

        var selected = $("#select_dataset :selected").val(); // Getting current file selection.

        if (selected == "default") {
            $('#delbtn').prop("disabled", true);
            $('#dnload-btn').prop("disabled", true);
            return;
        }

        $('#delbtn').prop("disabled", false);
        $('#dnload-btn').prop("disabled", false);
        $('#loadingbtn_dataset').show();

        // AJAX Request for Getting Unclassified Dataset Content.
        $.ajax({
            url: `../server/php/api/multilabelUnclassifiedDatasetContent.php?token=${token}&file=${selected}`,
            method: 'GET',
            success: function (data) {
                try {
                    var data2 = JSON.parse(data);
                    var csv_array = data2.csv_array;

                    $("#data_table_head_tr").html("");
                    $("#data_table_tbody").html("");

                    // 15-Row Preview of the Unclasified Dataset.
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

                    window.location.href = "#select_class";
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
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html(errormes);
            }
        });
    });

    // Handling Unclassified Dataset's Deletion.
    $('#delbtn').click(function () {
        var file = $("#select_dataset :selected").val(); // Getting current file selection.

        $('#dnload-btn').prop("disabled", true);
        $('#delbtn').hide();
        $('#loadingbtn2').show();

        // AJAX Request for Deleting Unclassified Dataset.
        $.ajax({
            url: '../server/php/api/destroyUnclassifiedDataset.php',
            method: 'DELETE',
            data: JSON.stringify({ file: file, token: token }),
            dataType: "json",
            contentType: 'application/json',
            success: function () {
                $("#loadingbtn2").hide();
                $("#delbtn").show();
                $('#delbtn').prop("disabled", true);
                $("#select_dataset :selected").remove();
                $("#select_dataset").val("default");
                $('#table_div').hide();
                $('#results_div').hide();
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
                $('#results_div').hide();
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html(errormes);
            }
        });
    });

    // Handling Unclassified Dataset's Downloading.
    $('#dnload-btn').click(function (event) {
        var file = $("#select_dataset :selected").val();
        var link = `../server/php/api/downloadUnclassifiedDataset.php?token=${token}&file=${file}`;
        event.preventDefault();
        window.location.href = link
    });

    // Handling Unclassified Dataset's Multilabel Classification.
    $("#classifyMultilabelData_btn").click(function () {

        $('#results_div').hide();
        $('#showMetrics').prop("disabled", true);

        // Features Selection Validation.
        var check = $("input[name=num_field]:checked");

        var selected_features = {};
        $.each(check, function (i) {
            selected_features[i] = $(this).val();
        });

        // Labels Selection Validation.
        var check2 = $("input[name=binary_fields]:checked");

        var selected_labels = {};
        $.each(check2, function (i) {
            selected_labels[i] = $(this).val();
        });

        var file = $("#select_dataset :selected").val(); // Getting current file selection.
        var model = $("#select_model :selected").val(); // Getting current model file selection.

        $("#classifyMultilabelData_btn").hide();
        $("#loadingbtn3").show();

        $.ajax({
            url: '../server/php/api/classifyMultilabelData.php',
            method: 'POST',
            data: JSON.stringify({
                token: token, // Current token.
                features: selected_features, // Features selection.
                labels: selected_labels, // Labels selection.
                file: file, // File selection.
                model: model // Model selection.
            }),
            dataType: "json",
            contentType: 'application/json',
            success: function (data) {

                console.log(data);

                var csv_array = data.dataset;
                var avg_hl = data.avg_hl;
                var avg_acc = data.avg_acc;
                var avg_pre = data.avg_pre;
                var avg_rec = data.avg_rec;
                var avg_fsc = data.avg_fsc;
                var pre_per_label = data.pre_per_label;
                var rec_per_label = data.rec_per_label;
                var fsc_per_label = data.fsc_per_label;
                var labels = data.labels;

                $("#data_table2_head_tr").html("");
                $("#data_table2_tbody").html("");

                // 15-Row Preview of the Classified Dataset.
                $.each(csv_array[0], function (index, val) {
                    $("#data_table2_head_tr").append($(`<th scope="col">${val}</th>`));
                });
                for (var i = 1; i <= 10; i++) {
                    var tr2_id = 'tr2' + i;
                    $("#data_table2_tbody").append($(`<tr id="${tr2_id}"></tr>`));
                    $.each(csv_array[i], function (index3, val3) {
                        $(`#${tr2_id}`).append($(`<td><div class="data_table_tbody_td">${val3}</div></td>`));
                    });
                }

                var labelsLength = (data.labels.length);

                // Metrics Information Display for Each Label.
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

                $('#showMetrics').prop("disabled", false);
                $("#loadingbtn3").hide();
                $("#classifyMultilabelData_btn").show();
                $('#results_div').show();
                window.location.href = '#results_div';
            },
            error: function (xhr, status, error) {
                var response = JSON.parse(xhr.responseText);
                var errormes = response.errormesg;
                $("#loadingbtn3").hide();
                $("#classifyMultilabelData_btn").show();
                $('#modal2_text').html("");
                $('#modal2').modal('show');
                $('#modal2_text').html(errormes);
            }
        });
    });
});