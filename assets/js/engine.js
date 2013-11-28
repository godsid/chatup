var user = {};
var defaultDistance = 1000;
user.distance = defaultDistance;
$(document).ready(function(){
  if(location.hash==''){
    splash();
  }
  
  $("#str").keypress(function(event) {
    if( event.which == 13 )
    {
      $("#str").blur();
      sendmessage();
      $("#str").focus();
    }
  });
});

function splash(){
  console.log("Page splash");
  setTimeout(function(){
    $.mobile.changePage($('#register'), { transition: "fade"} );
    register();
  },1);
}

function register(){
  console.log("Page register");
	loading();
  $('.login-group').hide();
	window.fbAsyncInit = function() {
		console.log("FB.init");
		FB.init({
			appId      : '202755173188388',
			status     : true, // check login status
			cookie     : true, // enable cookies to allow the server to access the session
			xfbml      : false  // parse XFBML
		});
    
		if(FB.getAuthResponse()==null){
      console.log("FB.getAuthResponse is null");
			$('.login-group').show();
      unloading();
		}
		FB.Event.subscribe('auth.authResponseChange', function(response) {
      console.log("auth.authResponseChange:"+response.status);
			if (response.status === 'connected') {
				FB.api('/me',function(resp){
					unloading();
					user = resp;
          unloading();
          $.mobile.changePage($('#rooms'), { transition: "fade"} );
          rooms();
				});
			}else{
				console.log("FB not login");
        $('.login-group').show();
				unloading();
			}
		});
	};

	if(typeof FB === 'undefined'){
    console.log("FB undefined");
		(function(d){
		   var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
		   if (d.getElementById(id)) {return;}
		   js = d.createElement('script'); js.id = id; js.async = true;
		   js.src = "//connect.facebook.net/th_TH/all.js";
		   ref.parentNode.insertBefore(js, ref);
		  }(document));
	}
}
function FBlogin(){
	console.log("Click FB Login");
	if(FB.getAuthResponse()==null){
		FB.login(function(resp){
			$.mobile.changePage($('#rooms'), { transition: "fade"} );
      rooms();
		});
	}else{
		$.mobile.changePage($('#rooms'), { transition: "fade"} );
    rooms();
	}
}
function rooms()
{
  console.log("page rooms");
  navigator.geolocation.getCurrentPosition(function(position){

    coords = position.coords || position.coordinate || position;
    console.log("position:"+JSON.stringify(coords));
    user.loc = coords;
    createMap(coords.latitude,coords.longitude);

  },function(error){ 
    var msg;
    switch(error.code) 
    {
      case error.UNKNOWN_ERROR:
        msg = "Unable to find your location";
        break;
      case error.PERMISSION_DENINED:
        msg = "Permission denied in finding your location";
        break;
      case error.POSITION_UNAVAILABLE:
        msg = "Your location is currently unknown";
        break;
      case error.BREAK:
        msg = "Attempt to find location took too long";
        break;
      default:
        msg = "Location detection not supported in browser";
    }
    rooms();
  },{maximumAge:60000, timeout:5000, enableHighAccuracy:true});
}


var map;
var circle;
var centerPoint;
var infowindow;
var coords;
var marker;
var place;

function createMap(yenilat,yenilong)
{
  console.log("create map");
  centerPoint = new google.maps.LatLng(yenilat, yenilong);
    var myOptions = {
      zoom: 17,
      center: centerPoint,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"),myOptions);

    map.setCenter(centerPoint);
    map.setZoom(17);
    marker = new google.maps.Marker({
        map: map,
        draggable:true,
        position: centerPoint,
        animation: google.maps.Animation.DROP,
        title: 'Why, there you are!'
      });
    
    infowindow = new google.maps.InfoWindow({content: 'You are here'});
    
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map,marker);
    });
    
    google.maps.event.addListener(marker, 'drag', function() {
      centerPoint=marker.getPosition();
      drawCircle();
    });
    
    // And reverse geocode.
    (new google.maps.Geocoder()).geocode({latLng: centerPoint}, function(resp) {
      place = "";
      if (resp[0]) {
        user.place = resp[0];
        var bits = [];
        for (var i = 0, I = resp[0].address_components.length; i < I; ++i) {
          var component = resp[0].address_components[i];
          if (arrayContains(component.types, 'political')) {
            bits.push('<b>' + component.long_name + '</b>');
          }
        }
        if (bits.length) {
          place = bits.join(' > ');
        }
        marker.setTitle(resp[0].formatted_address);
      }
    });
  
    drawCircle();
    
    $('#mapinfo').html('<img src="assets/img/icon-search.png" /> Search Distance: '+$('#distance').val()+' km');

    $("input#distance").live("change", function() {
      if($('#distance').val() < 1)
      {
        var tmp = $('#distance').val()*1000;
        $('#mapinfo').html('<img src="assets/img/icon-search.png" /> Search Distance: '+tmp+' m');
      }
      else
      {
        var tmp = $('#distance').val();
        if(tmp.indexOf(".")==-1)
        {
          $('#mapinfo').html('<img src="assets/img/icon-search.png" /> Search Distance: '+tmp+' km');
        }
        else
        {
          var distanceArray = tmp.split(".");
          $('#mapinfo').html('<img src="assets/img/icon-search.png" /> Search Distance: '+distanceArray[0]+' km');
        }
      }
      drawCircle();
    }); 

    init();
}

function addMaker(){

}
function drawCircle() 
{
  if (circle) { circle.setMap(null);  }
  var circleOptions = {
  strokeColor: "#000000",
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: "#000000",
  fillOpacity: 0.35,
  map: map,
  center: centerPoint,
  radius: $("#distance").val() * 1000
  };

  circle = new google.maps.Circle(circleOptions);
  map.fitBounds(circle.getBounds());
}

var socket;
var iochat;
var roomlist;
function init()
{
  //var host = "ws://www.eminbudak.com.tr:10000/envato/chatloc/server/server.php";
  iochat = io.connect('http://'+location.host+':8080/chat');
  console.log(iochat);
  iochat.on('connect', function () {
    console.log('Connected');
  
    /*****************************************
    ** find room
    *****************************************/
    console.log(user);

    iochat.emit('find room',{lat: user.loc.latitude,lng: user.loc.longitude,dist:user.distance,palce:'place'});
    
    iochat.on('find room',function(rooms){
      console.log('find room'+JSON.stringify(rooms));
      var roomsList = "";
      if(rooms.length){
          for(var i=0;i<rooms.length;i++){
          roomsList+='<li onclick="chatStarted(\''+rooms[i].name+'\')">'+rooms[i].name+' ('+rooms[i].memberCount+')</li>';
			}
			$(".roomsList").html("<ul>"+roomsList+"</ul>");
		}else{
    
      //iochat.emit('join room',{name:rooms[0].name,user:{name:'Userxxx'}});
    }
  });
	/*****************************************/
	
	/*****************************************
	** update room
	*****************************************/
	iochat.on('update room',function(recv){
		console.log('update room: '+JSON.stringify(recv));
	});
	/*****************************************/


    /*****************************************
	** new member on room
	*****************************************/
	iochat.on('join room',function(recv){
		console.log('join room: '+JSON.stringify(recv));
	});
	/*****************************************/
	
    /*****************************************
	** on chat message
	*****************************************/
	iochat.on('message', function (msg) {
    console.log(JSON.stringify(msg));
		console.log("Recv: "+msg);
    shwoMessage(msg);
	});
	
	
	/*****************************************/
  });


  /*
  try 
  {
    socket = ("MozWebSocket" in window ? new MozWebSocket (host) : new WebSocket(host));
    console.log('WebSocket - status ' + socket.readyState);
    
    socket.onopen = function (msg) {
      console.log("Welcome - status " + this.readyState);
      if(this.readyState=="1") 
      { 
        send({'action':'countusers','latitude':marker.getPosition().lat(), 'longitude':marker.getPosition().lng(),'distance':$('#distance').val()}); 
      } 
    }
    
    socket.onmessage = function (msg){
      console.log("Received: " + msg.data);
      chat(msg.data);
    }

    socket.onclose = function (msg){
      console.log("Disconnected - status " + this.readyState); 

      overlayGoster('<br /><br /><center><img src="assets/img/connection-closed.png" border="0" width="100"><br /><br />Bağlantınız Kesildi!!!</center>');
      setTimeout(function(){ overlayKapat(); },3000);
      menu();
    }
  }
  catch (ex) 
  {
    console.log(ex);
  }*/
}


function chatStarted(room){
  if(room=='undefined'){
    $.mobile.changePage($('#rooms'), { transition: "fade"});
    rooms();
    return false;
  }
  $.mobile.changePage($('#chatStarted'), { transition: "fade"});
  iochat.emit('join room',{name:room,user:{name:user.name,avatar:getUserAvatar()}});


}

function chat(msg)
{  
  if(msg.indexOf("|action:totalusers|")!=-1)
  {
      var parca = msg.split('|');
      
      var icerik = '';
      icerik += '<div>You are here:</div>';
      icerik += place;
      icerik += '<div style="margin-top: 30px;"><b>'+parca[4]+'</b> people(s) chatting, <b>'+parca[6]+'</b> waitting for chat, <b>'+parca[2]+'</b> total online in <u>'+$("#distance").val()+'</u>KM area.</div>';
      icerik += '<div style="font-size: 15px;text-align: center;margin-top: 100px;color: rgb(248, 248, 248);text-shadow: 1px 1px 0px rgb(117, 117, 117);">You should increase search distance for connecting with more people.</div>';
      
      $("#currentusers").html(icerik);
  }
  else if(msg.indexOf("|action:baglantiyikes|")!=-1)
  {
      menu();      
      setTimeout(function(){
        var icerik = '';
        icerik += '<img src="assets/img/attention.png" border="0" width="128">';
        icerik += '<br /><br />';
        icerik += 'This username is already in use.<br />Write a different username.';
        overlayGoster(icerik);
      },500);
      setTimeout(function(){ overlayKapat(); },4000);
  }
  else if(msg.indexOf("|action:chatwith|")!=-1)
  {
      var parca = msg.split('|');
      if(parca[2]=="")
      {
        $("#chatinfo").html('<img src="assets/img/icon-waiting.png" /> Waiting for someone...');
        sendmessageallow = 0;
      }
      else
      {
        sendmessageallow = 1;
        var icerik = '';
        icerik += '<div style="width:100%; text-align:left;><img src="assets/img/icon-connected.png" /> Connected with '+parca[2] + ' - ';
        if(parca[3]<1)
        {
          icerik += 'too close';
        }
        else if(parca[3].indexOf('.')!=-1)
        {
          icerik += parca[3].split('.')[0]+' KM away';
        }
        else
        {        
          icerik += parca[3]+' KM away';
        }
        icerik += '</div>';
        $("#chatinfo").html(icerik);
      }
  }
  else
  {
    var parca = msg.split('|');
    var saat = parca[0];
    var ad = parca[1];
    var mesaj = parca[2];

    var icerik ="";
    
          if(ad==$("#nickname").val())
          {
            icerik += '<div class="chatbubbleme">';
          }
          else
          {
            icerik += '<div class="chatbubble">';
          }
          
            if(ad==$("#nickname").val())
            {
              icerik += '<div style="float:left; width:130px;text-align:left; color:blue; font-weight:400;font-size: 12px;">'+ad+': </div>';
              icerik += '<div style="float:right; width:50px; text-align:right; color: #000; font-weight: 400; font-size: 9px;text-shadow: 0px 0px 0px white;">'+saat+'</div>';
            }
            else
            {
              icerik += '<div style="float:left; width:130px;text-align:left; color: rgb(206, 90, 90); font-weight: 400; font-size: 12px;">'+ad+': </div>';
              icerik += '<div style="float:right; width:50px; text-align:right; color: #000; font-weight: 400; font-size: 9px;text-shadow: 0px 0px 0px white;">'+saat+'</div>';
            }

          icerik += '<br class="clear" />'; 
          icerik += mesaj;
        icerik += "</div>"; 
        icerik += '<br class="clear" />'; 
        
        $('#chat').append(icerik);
        document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;
  }
}



function send(value)
{
  if (typeof value != 'string') {value = JSON.stringify(value);}

  try 
  {
    iochat.emit('message',{msg:value,user:{name:user.name,avatar:getUserAvatar()}});
    console.log('Sent: ' + value);
  }
  catch (ex) 
  {
    console.log(ex);
  }

  $('#str').val("");
}


function quit () 
{
  console.log("Goodbye!");
  socket.close ();
  socket = null;
}



var sendmessageallow = 0;
function sendmessage()
{
  //if(sendmessageallow=='1')
  //{
    if(str!='')
    {
      send($('#str').val());
      //send({'action':'chat', 'text':$('#str').val()});
    }
    else
    {
      var icerik = '';
      icerik += '<img src="assets/img/attention.png" border="0" width="128">';
      icerik += '<br /><br />';
      icerik += 'You should not send blank message.';
      overlayGoster(icerik);
    }
  /*}
  else
  {
    var icerik = '';
    icerik += '<img src="assets/img/attention.png" border="0" width="128">';
    icerik += '<br /><br />';
    icerik += 'You should connected someone to send message.';
    overlayGoster(icerik);
  }*/
}

function shwoMessage(recv){
  $('#chat').append('<p class="msg me"><img src="'+recv.user.avatar+'" /><i>'+recv.user.name+'</i><span>'+recv.msg+'</span></p>');
}








function start()
{
  //$.mobile.changePage($('#chatStart'), { transition: "fade"} );
  init();
  started();
  //overlayGoster('<br /><br /><center><img src="assets/img/loading.gif" border="0"><br /><br />Connecting to server...</center>');
  //setTimeout(function(){overlayKapat(); },2000);
}

function started()
{   
  if($('#nickname').val()!="")
  {
   $.mobile.changePage($('#chatStarted'), { transition: "fade"} );
   //send({'action':'login', 'username':$('#nickname').val(), 'latitude':marker.getPosition().lat(), 'longitude':marker.getPosition().lng(),'distance':$('#distance').val()}); 
  }
  else
  {
    overlayGoster('<br /><br /><center><img src="assets/img/attention.png" border="0" width="128"><br /><br />Nickname should not be blank!!!</center>');
    setTimeout(function(){ overlayKapat(); },3000);
  }
}










function info()
{
  $.mobile.changePage($('#info'), { transition: "fade"} );
}

function menu()
{
  $.mobile.changePage($('#menu'), { transition: "fade"} );
  $('#chat').html("");
  quit();
}


      



















function arrayContains(array, item) 
{
  for (var i = 0, I = array.length; i < I; ++i)
  {
    if (array[i] == item) return true;
  }
  return false;
}



function overlayKapat()
{
  $("#overlay").remove();
}



function overlayGoster(msg)
{
  overlayKapat();
  var overlay = $('<div id="overlay" onclick="overlayKapat();">'+msg+'</div>');
  overlay.appendTo(document.body);  
}
function loading(){
    unloading();
    var loadingEle = $('<div id="loading"><img src="assets/img/loading.gif" /></div>');
    loadingEle.appendTo(document.body);
}
function unloading(){
  $("#loading").remove();
}

function getUserAvatar(){
  return 'http://graph.facebook.com/'+user.id+'/picture?type=square';
}