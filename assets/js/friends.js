$(function(){
  //get name
  //get friends by this userID
  $.get("/getfriends", function(data){
    displayFriends(data);
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
