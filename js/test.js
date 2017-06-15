
var game = new Phaser.Game(800, 600, Phaser.AUTO, document.getElementById('game'));
game.state.add('Game',Game);
game.state.start('Game');
var Game = {};

Game.init = function(){
    game.stage.disableVisibilityChange = true;
};

Game.preload = function() {
    game.load.image('sky', 'assets/sky.png');
    game.load.image('sprite','assets/star.png');
};

Game.create = function(){
    Game.playerMap = {};
    Game.sky = game.add.sprite(0, 0, 'sky');
    Client.askNewPlayer();
};