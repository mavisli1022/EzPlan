$(document).ready(function() {

    $("#addUser").submit(function (e) {
        e.preventDefault();
        $.post('/addUser', $("#addUser").serialize());
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
