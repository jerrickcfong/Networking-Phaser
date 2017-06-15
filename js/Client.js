var Client = {};
Client.socket = io.connect();

Client.askNewPlayer = function(){
    Client.socket.emit('newplayer');
};

Client.socket.on('newplayer',function(data){
    Game.addNewPlayer(data.id,data.x,data.y);
});

Client.socket.on('allplayers',function(data){
    console.log(data);
    for(var i = 0; i < data.length; i++){
        Game.addNewPlayer(data[i].id,data[i].x,data[i].y);
    }
});

Client.sendCoor = function(x,y){
  Client.socket.emit('coor',{x:x,y:y});
};

Client.socket.on('move',function(data){
    Game.movePlayer(data.id,data.x,data.y);
});

Client.socket.on('remove',function(id){
    Game.removePlayer(id);
});

Client.test = function(){
	Client.socket.emit('test');
};

Client.sendLeft = function(){
    Client.socket.emit('left');
}

Client.sendRight = function(){
    Client.socket.emit('right');
}

Client.sendStop = function(){
    Client.socket.emit('stop');
}

Client.socket.on('left', function(id){
    Game.moveLeft(id);
})

Client.socket.on('right', function(id){
    Game.moveRight(id);
})

Client.socket.on('stop', function(id){
    Game.stop(id);
})