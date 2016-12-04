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
  //if(data == null)
  var friendID = [];
  console.log(JSON.stringify(data));
  for(var i = 0; i < data.friends.length; i++){
    friendID[i]= data.friends[i].userid;
    console.log(friendID);
  }

  for(var j=0; j<friendID.length;j++){
    $.get("/getuser/" + friendID[j], function(resp){
      $("ul#friends-list").append("<li>" + resp.firstname + " " + resp.lastname + " " +
        "<button id='"+ resp.userid + "' onclick='prepare(this.id)'> Compare Timetable</button>"
        + " <a class='remove' href='/removefriend/" + resp.userid + "'>Remove friend</a></li>");
    });
  }
}

function displayFriendSearchResults(data){
  for(var i = 0; i < data.length; i++){
    console.log(data[i]);
    $("#search-results").append("<li>" + data[i].firstname + " " + data[i].lastname + " <a class='add' href='/addfriend/" + data[i].userid + "'>Add friend</a></li>");
  }
}

function prepare(friend){
  $.get('/getUserID', function(data){
    console.log(data);
    compare(data, friend);
  });
}
