function displayRecommended(uid) {

console.log("HELLO")
    $("ul").empty();
    $.get('session', function(data){
        uid = data["userid"];
        console.log(uid);
        $.get('/recommendedFriendsGet', {userid: uid}, function (data) {
            var resultsArray = data;

            for (var i = 0; i < resultsArray.length; i++){
                var friendInfo = resultsArray[i];
                var first, last, id;
                first = friendInfo["firstname"];
                last = friendInfo["lastname"];
                id = friendInfo["userid"];


                $("ul#recommended-friends-results").append("<li>" + first + " " + last + " <a class='add' href='/addfriend/" + id + "'>Add friend</a></li>");
            }
        });
    });

}

$(document).ready(function() {

    displayRecommended();

});

