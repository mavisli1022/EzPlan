$(function(){

  //send login url to backend
  $("#fb-login-bt").click(function(){
    //connect to fb in backend
    $.get("/login", function(data){
      console.log(data);
    })

  })

});
