$(function(){
  var sessionID;
  var sessionEmail;
  $.get("/session", function(data){
    $(".emailed").text(data.email);
    var obj = {
      email: data.email,
      userid: data.userid,
      fname: data.firstname
    }
    console.log(obj);
    //post to server
    $.post("/verify", obj, function(data){
      console.log(data);
    })

  })
})
