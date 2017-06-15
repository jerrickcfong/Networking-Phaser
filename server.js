var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/assets',express.static(__dirname + '/assets'));

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});
 
var port = 3000;

server.players;
server.lastPlayerID = 0;

function init() {
    players = [];
};

init();
 
server.listen(process.env.PORT || port);
console.log('Started Socket.io, listening on port:' + process.env.PORT);

io.on('connection',function(socket){

    socket.on('newplayer',function(){
        socket.player = {
            id: server.lastPlayerID++,
            // Default coordinates. Make random later.
            //x: 32,
            x: randomInt(100, 400),
            y: 450
        };
        socket.emit('allplayers',getAllPlayers());
        socket.broadcast.emit('newplayer',socket.player);

        socket.on('coor',function(data){
            //console.log('move to '+data.x+', '+data.y);
            socket.player.x = data.x;
            socket.player.y = data.y;
            io.emit('move',socket.player);
        });

        socket.on('left', function(){
            io.emit('left', socket.player.id);
        })

        socket.on('right', function(){
            io.emit('right', socket.player.id);
        })

        socket.on('stop', function(){
            io.emit('stop', socket.player.id);
        })

        socket.on('disconnect',function(){
            io.emit('remove',socket.player.id);
        });
    });

    socket.on('test',function(){
        console.log('test received');
    });
});

function getAllPlayers(){
    var playerList = [];
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        if(player) playerList.push(player);
    });
    return playerList;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}