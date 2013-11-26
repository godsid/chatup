var io = require('socket.io').listen(8080,{
        heartbeats:true,
        'log level':0

});
/* *
 * io.set('heartbeats',false);
 * */
var rooms = [   {name:'loc1',lat:100.5257415,lng:13.7244345,members:{count:0,lists:[]}},
                {name:'loc2',lat:100.5469202,lng:13.726579,members:{count:0,lists:[]}}
        ];

var chat = io
  .of('/chat')
  .on('connection', function (socket) {
	var roomName = getRoom('xxx');
    socket.join(roomName);
    socket.broadcast.to(roomName).emit('message','New User join');
    console.log('New User join');
    console.log(rooms);
    socket.on('message',function(msg){
        socket.broadcast.to('room1').emit('message',msg);
        console.log('Recv: '+msg);
        //socket.send(msg);
    });
  });

var Room = {name:'',memberCount:0};
Room.join = function(){
};
Room.leave = function(){
};
Room.get = function(){
};





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
