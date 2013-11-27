<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,height=device-height, initial-scale=1.0, maximum-scale=1.0, user-scalable = no" />
  <meta name="apple-touch-fullscreen" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black" />
  <link rel="apple-touch-icon" href="assets/img/logo-icon.png"/>  

  <meta http-equiv="Content-type" content="text/html; charset=utf-8">

	<title>ChatUp</title>
  <meta name="description" content="Random location based chat, mobile web app"/>
  <meta name="keywords" content="random chat, mobile chat, chat app, location chat, location app, gps chat, gps app, random meet"/>
  
  <link href='http://fonts.googleapis.com/css?family=Merriweather+Sans:400,300,700,800,400italic&subset=latin,latin-ext' rel='stylesheet' type='text/css'>

  <link rel="stylesheet" href="lib/jquery.mobile-1.2.0.min.css" />

  <link rel="stylesheet" href="assets/css/style.css" />
  
  <script src="lib/jquery-1.8.2.min.js"></script>
  <script src="lib/jquery.mobile-1.2.0.min.js"></script>
  
  <script src="http://maps.googleapis.com/maps/api/js?sensor=false" type="text/javascript"></script>
  <script src="plugins/geometa.js"></script>
            
  <script src="lib/socket.io.min.js"></script> 
  <script src="assets/js/engine.js"></script>

            
            

</head>
<body>
  <div data-role="page" id="login">
    <div class="header">
      <div class="logo">CHATUP</div>
    </div>
	<div class="login-group">
		<div id="fb-root"></div>
		<a href="#" onclick="FBlogin()" class="fb-login">Login with Facebook</a>
		<a href="#" class="gplus-login">Login with Google+</a>
	</div>
  </div>


  <div data-role="page" id="menu">
    <div class="header">
      <div class="buttonLeft" onclick="info();">Info</div>
      <div class="logo">CHATUP</div>
      <div class="buttonRight" onclick="start();">Start</div>
    </div>	
    <div id="mapinfo"></div>
    <div id="map_canvas"></div>
    <div style="width:270px; margin:0 auto; margin-top:15px;">
      <input type="range" name="distance" id="distance" value="10" min="0.2" max="100" />
    </div>
	<ul>
		<li><a href="joinRoom(this.value)">loc1</a></li>
	</ul>
  </div>


  
  <div data-role="page" id="chatStart">
    <div class="header">
      <div class="buttonLeft" onclick="menu();">Menu</div>
      <div class="logo">ChatUp</div>
      <div class="buttonRight" onclick="started();">Chat</div>
    </div>	
    
    <div id="chatStartDiv">

      <span style="font-size:20px; text-shadow: 1px 1px 1px #5E5E5E; color: #FFF;">Username:</span>
      <br />
      <input type="text" id="nickname" style="background: white;width: 100%;" value="tui" />
      <br />
      <br />
      <div id="currentusers">-</div>
    </div>
  </div>

  
  <div data-role="page" id="chatStarted">
    <div class="header">
      <div class="buttonLeft" onclick="menu();">Menu</div>
      <div class="logo">ChatUp</div>
    </div>	
    <div id="chatinfo"></div>

    <div id="chat"></div>
    <div style="width:310px; margin:0 auto;">
      <input type="text" id="str" style="background: white;width: 70%;float: left;" />
      <button onclick="sendmessage();">Send</button>
    </div>
	<div class="roomsList">
	</div>
  </div>
  
  <div data-role="page" id="info">
    <div class="header">
      <div class="buttonLeft" onclick="menu();">Menu</div>
      <div class="logo">ChatUp</div>
    </div>	
    
    <div id="infoDiv">
      <div style="text-align:center;">
      <img src="assets/img/logo-icon.png" border="0">
      <br />
      <br />
      <a href="http://codecanyon.net/user/EminBudak" target="_blank" style="color: white;text-shadow: 1px 1px 1px black;text-decoration: none;">Emin Budak @codecanyon</a>
      </div>
    </div>
  </div>
  

      
      
  </body>
</html>
