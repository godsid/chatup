$(document).ready(function(){
  //findLocation();
  
start();
	
  $("#str").keypress(function(event) {
    if( event.which == 13 )
    {
      $("#str").blur();
      sendmessage();
    }
  });



  $("#nickname").keypress(function(event) {
    if( event.which == 13 )
    {
      $("#nickname").blur();
      started();
    }
  });
  
});


function findLocation()
{
  overlayGoster('<br /><br /><center><img src="assets/img/loading.gif" border="0"><br /><br />Getting coordinate...</center>');

  navigator.geolocation.getCurrentPosition(function(position){  
  
    overlayKapat();
    coords = position.coords || position.coordinate || position;
    createMap(coords.latitude,coords.longitude)
      
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
    
   overlayGoster(msg);
   
   findLocation();

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
    
    setTimeout(function(){
      overlayGoster('<br /><br /><center><img src="assets/img/loading.gif" border="0"><br /><br />Getting location...</center>');
    },1000);
    
    
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
      //overlayGoster(place);
      setTimeout(function(){overlayGoster('<br /><br /><center><img src="assets/img/loading.gif" border="0"><br /><br />Loading map...</center>')},2000);
      setTimeout(function(){overlayKapat(); },4000);
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
function init()
{
	
  //var host = "ws://www.eminbudak.com.tr:10000/envato/chatloc/server/server.php";
  iochat = io.connect('http://localhost:8080/chat');
  console.log(iochat);
  iochat.on('connect', function () {
    console.log('Connected');
    iochat.emit('find room',{lat: 100.6206178,lng: 13.8349631,dist:5000});

    iochat.on('find room',function(rooms){
      console.log('find room'+JSON.stringify(rooms));
      iochat.emit('join room',{name:rooms.lists[0].name});  
      iochat.send('ssss');      
    });

    

	  iochat.on('message', function (msg) {
		  console.log("Recv: "+msg);
	  });

    
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
    socket.send(value);
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
  if(sendmessageallow=='1')
  {
    if(str!='')
    {
    send({'action':'chat', 'text':$('#str').val()});
    }
    else
    {
      var icerik = '';
      icerik += '<img src="assets/img/attention.png" border="0" width="128">';
      icerik += '<br /><br />';
      icerik += 'You should not send blank message.';
      overlayGoster(icerik);
    }
  }
  else
  {
    var icerik = '';
    icerik += '<img src="assets/img/attention.png" border="0" width="128">';
    icerik += '<br /><br />';
    icerik += 'You should connected someone to send message.';
    overlayGoster(icerik);
  }
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