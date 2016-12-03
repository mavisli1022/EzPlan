$(function(){
  //get name
  //get friends by this userID
  $.get("/getfriends", displayFriends);

  $("#search-trigger").click(function(){
    var field = $("#search-friend").val();
    var type = $("#search-field").val();

    if(type == "name"){
      if(field.indexOf(" ") != -1 && field.indexOf(" ")+1 < field.length){
        var splittedName = field.split(" ");
        var firstname = splittedName[0];
        var lastname = splittedName[1];

        $.get("/findfriends/fname/" + firstname + "/" + lastname, displayFriendSearchResults);

      } else {
        $.get("/findfriends/name/" + field, displayFriendSearchResults);
      }
    } else {
      $.get("/findfriends/email/" + field, displayFriendSearchResults);
    }

  })

})

function displayFriends(data){
  for(var i = 0; i < data.friends.length; i++){
    var friendID = data.friends[i].userid;
    $.get("/getuser/" + friendID, function(resp){
      $("ul#friends-list").append("<li>" + resp.firstname + " " + resp.lastname + " <a class='remove' href='/removefriend/" + friendID + "'>Remove friend</a></li>");
    })
  }
}

function displayFriendSearchResults(data){
  for(var i = 0; i < data.length; i++){
    console.log(data[i]);
    $("#search-results").append("<li>" + data[i].firstname + " " + data[i].lastname + " <a class='add' href='/addfriend/" + data[i].userid + "'>Add friend</a></li>");
  }
}
