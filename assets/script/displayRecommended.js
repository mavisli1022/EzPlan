function displayRecommended(uid) {

    $("ul").empty();
    $.get('session', function(data){
        uid = data["userid"];
        $.get('/recommendedFriendsGet', {userid: uid}, function (data) {
            var resultsArray = data;
            if (resultsArray != null && resultsArray.length != 0){
                for (var i = 0; i < resultsArray.length; i++) {
                    var friendInfo = resultsArray[i];
                    var first, last, id;
                    first = friendInfo["firstname"];
                    last = friendInfo["lastname"];
                    id = friendInfo["userid"];
                    if (friendInfo["discoverable"]) {
                        $("ul#recommended-friends-results").append("<li>" + first + " " + last + " <a class='add' href='/addfriend/" + id + "'>Add friend</a></li>");
                    }
                }
            }

        });
    });
}

$(document).ready(function() {
    displayRecommended();

});

function back(){
var form = document.createElement("form");

form.method = "POST";
form.action = "/main";
document.body.appendChild(form);
form.submit();

}
