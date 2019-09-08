document.addEventListener("DOMContentLoaded", () => { //Wait till page finally loaded
    // let tasksnum = 0;
    let globaltask = [];
    let AjaxGet;
    let taskList = $('#taskList')[0];
    let audio1 = document.getElementById("plop_sound");

    load_tasks(); //call to function to get data from DB

    function GetDate() {
        let today = new Date();
        let date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        let dateTime = date + ' ' + time;
        return dateTime;
    }

    function GetTextFromUser() { //Check if appear text in Textbox
        if ($('#taskText').val() && $('#commentText').val()) {
            let taskName = $('#taskText').val();
            let taskComment = $('#commentText').val();
            let taskDate = GetDate();
            task = { 'taskName': taskName, 'taskComment': taskComment, 'taskDate': taskDate };
            return task;
        }
        else {
            return false;
        }
    }

    $("#button").click(function () { //Added listener to addButton
        if (GetTextFromUser()) {
            let task = GetTextFromUser();
            AjaxGet = false;
            addItemToList(task, AjaxGet);
            $('#taskText').val("");
            $('#commentText').val("");
        }
        else {
            show_modal_error("Error in input of task", "Name & Comment is mandatory")
        }
    });

    function show_modal_error(title, task) {
        $("#modal_title").text(title);
        $("#modal_task").text(task);
        $('#modalErrorInput').modal('show');
    }

    function addItemToList(task, AjaxGet) {
        // tasksnum++;
        let listItem = $('<li/>')[0];
        let link = $("<a/>")[0];
        // $(link).attr("class", "trigger")
        let title = $("<h3/>")[0];
        // $(link).attr("href", "#");
        let TaskParagraph = $("<p/>")[0];
        let detailParagraph = $("<p/>")[0];
        $(detailParagraph).attr("class", "clickDeatils");

        $(TaskParagraph).attr("class", "text");
        let trashIcon = $('<img/>')[0];
        let editIcon = $('<img/>')[0];
        let viewIcon = $('<img/>')[0];
        if (AjaxGet == true) {
            $(listItem).attr("id", task["taskID"]);
        }
        else {
            $(listItem).attr("id", 1);
        }
        $(listItem).attr("class", "listItem");
        $(trashIcon).attr(
            {
                "src": "/static/ToDo_App/images/trash.png",
                "id": "trashIconId",
                "class": "trash",
                "title": "Remove Task"
            });
        $(editIcon).attr(
            {
                "src": "/static/ToDo_App/images/edit.png",
                "id": "editIcon",
                "class": "edit",
                "title": "Edit Task",
                "display": "inline"

            });
        $(viewIcon).attr(
            {
                "src": "/static/ToDo_App/images/preview.png",
                "align":"left",
                "id": "previewIcon",
                "class": "preview",
                "title": "Preview Task"
            });

        title.append("Your note:")
        let res = task.taskName.replace(/(\S{8})/g, "$1 ");
        let myTxt = res.substring(0, 10) + "...\n";
        TaskParagraph.append(`${myTxt}`);
        // detailParagraph.append("click for more details");
        link.append(title);
        link.append(listItem.appendChild(TaskParagraph));
        link.append(listItem.appendChild(detailParagraph));
        link.append(editIcon);
        link.append(viewIcon);
        link.append(trashIcon);
        listItem.append(link);
        taskList.appendChild(listItem);
        if (!(AjaxGet)) {
            $.ajax({
                type: "POST",
                dataType: "json",
                url: "/save_tasks",
                data:
                {
                    'task': task["taskName"],
                    'comment': task["taskComment"],
                    'date_time': task["taskDate"],
                },
                success: function (response) {
                    let taskID = JSON.parse(response.id); //take the answer from the server from json
                    task['taskNum'] = taskID;
                    globaltask.push({ id: taskID, task: task.taskName, comment: task.taskComment, date: task.taskDate });
                    $(".listItem").last().attr("id", taskID);
                },
                error: function (msg) {
                    console.log(msg);
                },
                complete: function (response, status) {
                    console.log("complete");
                }
            })
        }
    }

    $('ul').on('mouseover', 'li', function () {
        // audio1.play();
    });

    function load_tasks() {
        $.ajax({
            type: "GET",
            dataType: "json",
            url: "/retrieve_tasks",
            success: function (response) {
                if (response) {
                    AjaxGet = true;
                    for (let i = 0; i < response.length; i++) {
                        taskID = (response[i]['id'])
                        taskName = (response[i]['title']);
                        taskComment = (response[i]['comment']);
                        taskDate = (response[i]['date_time']);
                        task = { taskID, taskName, taskComment, taskDate };
                        addItemToList(task, AjaxGet);
                        task['taskNum'] = response[i].id;
                        globaltask.push({ id: taskID, task: task.taskName, comment: task.taskComment, date: task.taskDate });
                    }
                }
            },
            error: function (msg) {
                console.log(msg);
            },
            complete: function (response, status) {
            }
        });
    }


    $('#modal_update').on('shown.bs.modal', function () {
        $('#user_title').focus();
    })


    $('ul').on('click', 'IMG', function (e) {
        let htmlId = parseInt(e.currentTarget.parentNode.parentNode.id)
        let dictid = getDictionaryIdSelected(htmlId);
        if (e.target.className == "edit") {
            $(".modal-title").text("Your note from " + globaltask[dictid].date + " is:");
            $("#user_title").val(globaltask[dictid].task);
            $("#user_comment").text(globaltask[dictid].comment);
            $('#modal_update').modal('show');
            $("#submit_change_task").click(function () {
                if ($("#user_title").val() != globaltask[dictid].task || $("#user_comment").val() != globaltask[dictid].comment) {
                    update_note(dictid, $("#user_title").val(), $("#user_comment").val())
                }
                else {
                    $('#modal_update').modal('hide');
                    show_modal_error("Error when updating task", "Nothing changed")
                }
            });
        }
        else if (e.target.className == "trash") {
            removeItem(e, dictid, htmlId);
        }
        else if (e.target.className == "preview"){
            $("#modal_title").text(globaltask[dictid].task);
            $("#modal_task").text(globaltask[dictid].comment);
            $('#modalErrorInput').modal('show');

        }
    });

    function getDictionaryIdSelected(htmlId) {
        for (let i = 0; i < globaltask.length; i++) {
            if (globaltask[i].id == htmlId) {
                return i;
            }
        }
    }

    function update_note(dicid, title, content) {
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "/update_tasks",
            data:
            {
                'id': globaltask[dicid].id,
                'task': title,
                'comment': content,
            },
            success: function (response) {
                $('#modal_update').modal('hide');
                if (response) {
                    globaltask[dicid].task = title;
                    globaltask[dicid].comment = content;
                    $(`#${globaltask[dicid].id} .text`).text(title);
                    $('#modal_update').modal('hide');
                    show_modal_error("Update notification..", "your note was updated successfully")
                }
            },
            error: function (msg) {
                console.log(msg);
                console.log("not updated")
            },
            complete: function (response, status) {
                console.log("complete");
            }
        })
    }

    function removeItem(e, dictid, htmlId) {
        if (e.target.nodeName === "IMG" && e.target.parentElement.parentElement.parentElement.className === "taskList") {
            globaltask.splice(dictid, 1);
            removeItemFromDB(htmlId);
        }
        if (e.target.nodeName === "IMG" && e.target.parentElement.parentElement.parentElement.className === "doneList") {
            todo--;
        }
        e.target.parentElement.parentElement.remove(e.target);
    }
    function removeItemFromDB(itemToRemove) {
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "/delete_task",
            data:
            {
                'id': itemToRemove
            },
            success: function (response) {
                console.log(response.status);
            },
            error: function (msg) {
                console.log(msg);
            },
            complete: function (response, status) {
                console.log("complete");
            }
        });
    }

    // function autoreloadnotes() {
    //    globaltask=[];
    //    load_tasks();

    // }

    // setInterval(autoreloadnotes, 5000);
});

