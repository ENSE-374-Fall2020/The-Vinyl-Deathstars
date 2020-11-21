
$(document).ready(function () {
    console.log("ready!");


    $("tr.mailEntry").click(function (e) {

        $("#email").collapse('show');
        var from = $(this).find(".username").html();
        var subject = $(this).find(".subject").html();
        var date = $(this).find(".date").html();
        var msgID = e.currentTarget.children[4].value;
        jQuery.get("/viewMail", { mail: msgID }, function (response) {
            if (response) {
                $("#emailText").html(response.message);
                $("#subject").html(subject);
                $("#from").html(from);
                $("#date").html(date);
            }
        });
    });









});
