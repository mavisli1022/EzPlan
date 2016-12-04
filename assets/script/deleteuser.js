function back(){
	var form = document.createElement("form");

	form.method = "GET";
	form.action = "/dashboard/admin";
	document.body.appendChild(form);
	form.submit();
}

$(document).ready(function() {

    $("#removeUserid").submit(function (e) {
        e.preventDefault();
        $.post('/delUser', $("#removeUserid").serialize());
        location.reload(true);
    });
});
