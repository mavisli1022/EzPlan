$(document).ready(function() {

    $("#searchCourse").submit(function (e) {
        e.preventDefault();
        var temp = $('#searchCourse').serializeArray();
        displaySearchedFriends(temp[0].value, temp[1].value);

    });

});

function displaySearchedFriends(courseCode, sectionCode){

    $.get('/searchCourse', {courseCodeInput: courseCode, sectionCodeInput:sectionCode}, function (data) {
        console.log(3);
        var resultsArray = data;
        console.log(resultsArray);

        for (var i = 0; i < resultsArray.length; i++){
            console.log(4);
            var friendInfo = resultsArray[i];
            $("ul#course-search-results").append("<li>" + friendInfo.firstname + " " + friendInfo.lastname + " <a class='add' href='/addfriend/" + friendInfo.userid + "'>Add friend</a></li>");
        }
    });
    location.reload(true);
}


function back(){
var form = document.createElement("form");

form.method = "POST";
form.action = "/main";
document.body.appendChild(form);
form.submit();

}