$(document).ready(function() {
    console.log("Hello");
    $("#addUser").submit(function (e) {
        e.preventDefault();
        $.post('/addUser', $("#addUser").serialize());
        location.reload(true);
    });

    $("#removeUserid").submit(function (e) {
        e.preventDefault();
        $.post('/delUser', $("#removeUserid").serialize());
        location.reload(true);
    });

    $("#updateUser").submit(function (e) {
        e.preventDefault();
        $.post('/updateUser', $("#updateUser").serialize());
        location.reload(true);
    });

});