
$(document).ready(function () {
    console.log("ready!");


    $("tr").click(function (e) {

        msgID = e.currentTarget.children[4].value;
        jQuery.get("/viewMail", { mail: msgID }, function (response) {
            if (response) {
                $("#emailText").html(response.message);
            }
        });
    });



});
