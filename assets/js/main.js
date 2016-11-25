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
})
