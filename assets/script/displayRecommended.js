function displayRecommended(uid) {

    $.get('session', function(data){
        uid = data["userid"];

        console.log(uid)

        $.get('/recommendedFriendsGet', {uid: uid}, function (data) {

            var resultsArray = data;
            console.log(resultsArray);

            for (var i = 0; i < resultsArray.length; i++){
                var friendInfo = resultsArray[i];
                $("ul#recommended-friends-list").append("<li>" + friendInfo.firstname + " " + friendInfo.lastname + " <a class='add' href='/addfriend/" + friendInfo.userid + "'>Add friend</a></li>");

                if (i == 9){
                    break;
                }
            }
        });
    });
}

$(document).ready(function() {
    displayRecommended();

});

