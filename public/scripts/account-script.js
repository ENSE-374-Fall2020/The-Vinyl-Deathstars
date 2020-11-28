
$(document).ready(function () {
    $('[data-toggle=confirmation]').confirmation({
        rootSelector: '[data-toggle=confirmation]',
        onConfirm: function () {
            var form = $(this).closest("form");
            console.log(form);
            form.submit();
        }
    });



});
