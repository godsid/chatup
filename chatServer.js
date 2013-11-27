var mongoose = require('mongoose'),
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

var chat = io
  .of('/chat')
  .on('connection', function (socket) {
	/*****************************************
	** On new connect
	******************************************/
    //socket.join(roomName);
    //socket.broadcast.to(roomName).emit('message','New User join');
    console.log('New User Connect');
	/****************************************/

    /****************************************
	** Search rooms on near your location
	****************************************/
	socket.on('find room',function(recv){
		console.log('Find room: '+JSON.stringify(recv));
		Rooms.find({"loc":{
						$near:{type:"Point",coordinates:[recv.lat,recv.lng]},
						$maxDistance:recv.dist}
					})
				//.select('name loc memberCount')
				.limit(20)
				.exec(function(err,list){
					if(err) throw err;
					socket.emit('find room',list);
		});
    });
	/****************************************/
	
	/****************************************
	** Create rooms 
	****************************************/
	socket.on('create room',function(recv){
		console.log('create room: '+JSON.stringify(recv));
		= new Rooms({
				name:recv.name,
				loc:{lat:recv.lat,lng:recv.lng},
				memberCount:0,
				created:Date.now()
			}).save();
		
		/*socket.join(recv.name);
		Rooms.findOneAndUpdate({name:recv.name},{$inc:{memberCount:1}},true,function(err,resp){
			console.log("Update room: "+JSON.stringify(resp));
			socket.broadcast.emit('update room',{room:resp,newMember:recv.user.name});
		});
		*/

    });
	/****************************************/


	/****************************************
	** Join rooms 
	****************************************/
	socket.on('join room',function(recv){
		
		console.log('join room: '+JSON.stringify(recv));
		socket.join(recv.name);
		
		Rooms.findOneAndUpdate({name:recv.name},{$inc:{memberCount:1}},true,function(err,resp){
			console.log("Update room: "+JSON.stringify(resp));
			socket.broadcast.emit('update room',{room:resp,newMember:recv.user.name});
		});

    });
	/****************************************/
	
	/****************************************
	** Leave rooms 
	****************************************/
	socket.on('leave room',function(recv){
		
		console.log('leave room: '+JSON.stringify(recv));
		socket.leave(recv.name);
		Rooms.findOneAndUpdate({name:recv.name},{$dec:{memberCount:1}},true,function(err,resp){
			
			console.log("Update room: "+JSON.stringify(resp));
			socket.broadcast.emit('update room',{room:resp,leftMember:"xxx"});
		});
    });
	/****************************************/
	
    socket.on('message',function(recv){
        //socket.broadcast.to('room1').emit('message',msg);
        console.log('Recv: '+JSON.stringify(recv));
        //console.log(socket);
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
