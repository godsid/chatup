
var 	mongoose = require('mongoose'),
	io = require('socket.io').listen(8080,{
        	heartbeats:true,
        	'log level':0
		});


mongoose.connect('mongodb://localhost/chatup',function(err){
	if(err){
	 console.log(err);
	}else{
		console.log("Connect to mongodb/chatup");
	}
});

var roomsSchema = mongoose.Schema({
    name: String,
    loc: {lat: Number,lng: Number},
    memberCount: Number,
    created: {type: Date, Default: Date.now}
});

var messagesSchema = mongoose.Schema({
	from: String,
	msg: String,
	room: String,
	created: {type: Date, Default: Date.now()}
});

var membersSchema = mongoose.Schema({
  nick: String,
  loc: {lat: Number,lng: Number},
})

var Rooms = mongoose.model('rooms',roomsSchema);
var Messages = mongoose.model('messages',messagesSchema);
var Members = mongoose.model('members',membersSchema);




//new Messages({from:'tui',msg:'test',room:'room1'}).save();

//newMessage.save(function(err){
//  if(err) throw err;
//});
/* *
 * io.set('heartbeats',false);
 * */
var roomsDefault = Array(
                {name: "room1",
                loc: {lat: 100.6206392,lng: 13.8353902},
                memberCount: 0,
                created: (Date.now())}
                ,
                {name: "room2",
                loc: {lat: 100.6206178,lng: 13.8349631},
                memberCount: 0,
                created: (Date.now())}
        );

var chat = io
  .of('/chat')
  .on('connection', function (socket) {
	  
    //socket.join(roomName);
    //socket.broadcast.to(roomName).emit('message','New User join');
    console.log('New User Connect');
    
    
    socket.on('find room',function(recv){
      console.log('Find room: '+JSON.stringify(recv));
      socket.emit('find room',{lists:roomsDefault});  
    });

    socket.on('join room',function(recv){
      console.log('join room: '+JSON.stringify(recv));
      socket.join(recv.name);

      socket.broadcast.emit('message','New User Join');

    });

    socket.on('message',function(msg){
        //socket.broadcast.to('room1').emit('message',msg);
        console.log('Recv: '+msg);
        console.log(socket);
        //socket.send(msg);
    });
  });






var news = io
  .of('/news')
  .on('connection', function (socket) {
    socket.emit('item', { news: 'item' });
  });



function getRoom(name,lat,lng){
        rooms[0].members.count++;
        rooms[0].members.lists.push(name);
        return rooms[0].name;
}
