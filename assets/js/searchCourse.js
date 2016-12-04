function displaySearchedFriends(courseCode, sectionCode){
    $("ul").empty();
    $.get('/searchCourseGet', {courseCodeInput: courseCode, sectionCodeInput:sectionCode}, function (data) {
        var resultsArray = data;

        for (var i = 0; i < resultsArray.length; i++){
            var friendInfo = resultsArray[i];
            var first, last, id;
            first = friendInfo["firstname"];
            last = friendInfo["lastname"];
            id = friendInfo["userid"];

            console.log(first + last + id);
            $("ul#course-search-results").append("<li>" + first + " " + last + " <a class='add' href='/addfriend/" + id + "'>Add friend</a></li>");
        }

    });

}

$(document).ready(function() {

    $("#searchCourse").submit(function (e) {
        e.preventDefault();
        var temp = $('#searchCourse').serializeArray();
        displaySearchedFriends(temp[0].value, temp[1].value);

    });

});

function back(){
var form = document.createElement("form");

form.method = "POST";
form.action = "/main";
document.body.appendChild(form);
form.submit();

}
