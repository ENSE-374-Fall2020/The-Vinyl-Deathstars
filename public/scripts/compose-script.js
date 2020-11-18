
$(document).ready(function () {
    console.log("ready!");

    var quill = new Quill('#editor', {
        theme: 'snow'
    });
    var myEditor = $('#editor');
    var html = {};
    html.input = myEditor.find('.ql-editor').html();
    console.log(html);

    $.ajax({
        type: 'POST',
        data: JSON.stringify(html),
        contentType: 'application/json',
        url: 'http://localhost:3000/compose',
        success: function (html) {
            console.log('success');
            console.log(JSON.stringify(html));
        }
    });






});
