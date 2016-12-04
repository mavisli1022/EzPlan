$(document).ready(function() {
    $("#updateUser").submit(function (e) {
        e.preventDefault();
        $.post('/updateUser', $("#updateUser").serialize());
        location.reload(true);
    });

});

function back(){
	var form = document.createElement("form");

	form.method = "GET";
	form.action = "/dashboard/admin";
	document.body.appendChild(form);
	form.submit();
}