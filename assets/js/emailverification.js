$(function(){
  var sessionID;
  var sessionEmail;
  $.get("/session", function(data){
    var email = data.email;
    var userid = data.userid;
    $(".emailed").text(email);

    //send email now
    
  })
})
