
$(document).ready(function () {
    console.log("ready!");

    var quill = new Quill('#editor', {
        theme: 'snow'
    });
    var myEditor = $('#editor');



    $("#sendMessage").click(function (e) {
        e.preventDefault();
        var mail = {};
        mail.message = myEditor.find('.ql-editor').html();
        mail.to = $("#to").val();
        mail.subject = $("#subject").val();
        $.ajax({
            type: 'POST',
            data: JSON.stringify(mail),
            contentType: 'application/json',
            url: 'http://localhost:3000/compose',
            success: function (response) {
                console.log(response);
            }
        });
    });







});
