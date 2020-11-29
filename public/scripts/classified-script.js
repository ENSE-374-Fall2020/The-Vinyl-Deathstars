$(document).ready(function () {
    console.log("ready!");




    $(document).on('click', '#favourite', function (e) {
        e.preventDefault();
        let searchParams = new URLSearchParams(window.location.search);
        var favourite = {};
        favourite.c_id = searchParams.get('_id');
        $.ajax({
            type: 'POST',
            data: JSON.stringify(favourite),
            contentType: 'application/json',
            url: 'http://localhost:3000/setFavourite',
            success: function (response) {
                $("#unfavourite").show();
                $("#favourite").hide();
            },
            error: function (response) {
            }
        });
    });



    $(document).on('click', '#unfavourite', function (e) {
        e.preventDefault();
        let searchParams = new URLSearchParams(window.location.search);
        var favourite = {};
        favourite.c_id = searchParams.get('_id');
        $.ajax({
            type: 'POST',
            data: JSON.stringify(favourite),
            contentType: 'application/json',
            url: 'http://localhost:3000/unsetFavourite',
            success: function (response) {
                $("#unfavourite").hide();
                $("#favourite").show();
            },
            error: function (response) {
            }
        });
    });

});

