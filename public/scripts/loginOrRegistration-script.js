
$(document).ready(function () {

    $(document).on('click', '#signUpSubmit', function (e) {
        e.preventDefault();
        var user = {};
        user.username = $("#signUpEmail").val();
        user.password = $("#signUpPassword").val();
        passwordConfirm = $("#signUpPasswordConfirm").val();
        if (user.password === passwordConfirm) {
            $.ajax({
                type: 'POST',
                ContentType: 'application/json',
                data: user,
                url: 'http://localhost:3000/register',
                success: function (response) {
                    window.location.reload();
                },
                error: function (response) {
                    $('#errTextSignup').text(response.responseJSON.message);
                    $("#errTextSignup").show();

                }
            });
        }
        else {
            $('#errTextSignup').text("Passwords do not match");
            $("#errTextSignup").show();
        }
    });


    $(document).on('click', '#loginSubmit', function (e) {
        e.preventDefault();
        var user = {};
        user.username = $("#loginEmail").val();
        user.password = $("#loginPassword").val();
        $.ajax({
            type: 'POST',
            ContentType: 'application/json',
            data: user,
            url: 'http://localhost:3000/login',
            success: function (response) {
                window.location.reload();
            },
            error: function (response) {
                console.log(response.responseText);
                $('#errTextSignup').text(response.responseJSON.message);
                $("#errTextSignup").show();

            }
        });
    });

});
