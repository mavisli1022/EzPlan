$(function(){
  $('#fb-login-bt').click(function(){
    FB.init({
      appId      : '1805734163039739',
      cookie     : true,  // enable cookies to allow the server to access
                          // the session
      xfbml      : true,  // parse social plugins on this page
      version    : 'v2.8' // use graph api version 2.8
    });
    FB.login(function(response) {
      // handle the response
      FB.api('/me', function(response) {
        console.log(response);
      });

    }, {scope: 'public_profile,email'});
  })

  $("#login-link").click(function(e){
    e.preventDefault();
    if($("#signup-link").hasClass("active")){
      $("#signup-link").removeClass("active");
      $("#login-link").addClass("active");
      //+150
      $("#login-nav .selected").animate({
        left: "-=150"
      }, 1000, function(){
        //if this is not active, hide this and show other one
        $(".sign-up-box").fadeOut("slow", function(){
          $(".login-box").fadeIn("slow");
        });
      });
    }
  })

  $("#signup-link").click(function(e){
    e.preventDefault();
    if($("#login-link").hasClass("active")){
      $("#login-link").removeClass("active");
      $("#signup-link").addClass("active");

      $("#login-nav .selected").animate({
        left: "+=150"
      }, 1000, function(){
        //if this is not active, hide this and show other one
        $(".login-box").fadeOut("slow", function(){
          $(".sign-up-box").fadeIn("slow");
        });
      });
    }
  })
})
