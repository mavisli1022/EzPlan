function displayRecommended(uid) {

    $("ul").empty();
    $.get('session', function(data){
        uid = data["userid"];
        $.get('/recommendedFriendsGet', {userid: uid}, function (data) {
            var resultsArray = data;
            if (resultsArray != null && resultsArray.length != 0){
                for (var i = resultsArray.length - 1; i >= 0; i--) {
                    var friendInfo = resultsArray[i].user;
                    var first, last, id;
                    first = friendInfo["firstname"];
                    last = friendInfo["lastname"];
                    id = friendInfo["userid"];
                    if (friendInfo["discoverable"]) {
                        $("ul#recommended-friends-results").append("<li>" + first + " " + last + " (Common Courses: " + resultsArray[i].common + ")" +" <a class='add' href='/addfriend/" + id + "'>Add friend</a></li>");
                    }
                }
            }

        });
    });
}

$(document).ready(function() {
    displayRecommended();

});

