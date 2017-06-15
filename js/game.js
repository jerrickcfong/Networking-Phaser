var game = new Phaser.Game(800, 600, Phaser.AUTO, document.getElementById('game'), { preload: preload, create: create, update: update });
game.state.add('Game',Game);
game.state.start('Game');
var Game = {};
/*Game.init = function(){
    game.stage.disableVisibilityChange = true;
};*/

function preload() {

    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.image('diamond', 'assets/diamond.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.stage.disableVisibilityChange = true;
    Game.config.setForceTimeOut = true;
}

var player;
var socket;

var diamond;
var platforms;
var cursors;

var stars;
var score = 0;
var scoreText;
var sky;

function create() {
game.world.resize(4000, 600);
    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    sky = game.add.sprite(0, 0, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(10, 2);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Now let's create two ledges
    var ledge = platforms.create(400, 400, 'ground');
    ledge.body.immovable = true;

    ledge = platforms.create(-150, 250, 'ground');
    ledge.body.immovable = true;

    // The player and its settings
    player = game.add.sprite(32, game.world.height - 150, 'dude');
    diamond = game.add.sprite(32, game.world.height - 150, 'diamond');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);
    game.physics.arcade.enable(diamond);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;

    diamond.body.bounce.y = 0.2;
    diamond.body.gravity.y = 300;
    diamond.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    //  Finally some stars to collect
    stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 70, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 300;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }

    //  The score
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();

    Game.playerMap = {};

    //playerMap.enableBody = true;

    Client.askNewPlayer();
}

    Game.addNewPlayer = function(id,x,y){
        Game.playerMap[id] = game.add.sprite(x,y,'dude');
        game.physics.arcade.enable(Game.playerMap[id]);
        Game.playerMap[id].animations.add('left', [0, 1, 2, 3], 10, true);
        Game.playerMap[id].animations.add('right', [5, 6, 7, 8], 10, true);
        Game.playerMap[id].body.collideWorldBounds = true;

    }

    Game.removePlayer = function(id){
        Game.playerMap[id].destroy();
        delete Game.playerMap[id];
    };

    Game.getCoordinates = function(player){
        Client.sendCoor(player.body.x, player.body.y);
    };

    Game.movePlayer = function(id,x,y){
        /*var mover = Game.playerMap[id];
        mover.body.x = x;
        mover.body.y = y;

        stars.create(100, 0, 'star');
        Client.test();*/

        var player = Game.playerMap[id];
    var tween = game.add.tween(player);
    tween.to({x:x,y:y}, 1);
    tween.start();
    };

    Game.moveLeft = function(id) {
         var player = Game.playerMap[id];
        //  Move to the left
        player.body.velocity.x = -120;

        player.animations.play('left');

        Game.getCoordinates(player);
    };

    Game.moveRight = function(id) {
         var player = Game.playerMap[id];
        //  Move to the left
        player.body.velocity.x = 120;

        player.animations.play('right');

        Game.getCoordinates(player);
    };

    Game.stop = function(id) {
         var player = Game.playerMap[id];
        //  Stop
        player.body.velocity.x = 0;

        player.animations.stop();

        player.frame = 4;
    };

function update() {

    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(diamond, platforms);
    game.physics.arcade.collide(stars, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    //  Reset the players velocity (movement)
    diamond.body.velocity.x = (player.body.x - diamond.body.x) * 5;
    if (diamond.body.y > player.body.y + 34 && diamond.body.touching.down) {
        diamond.body.velocity.y = -350;
    }
    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
        /*player.body.velocity.x = -120;

        player.animations.play('left');*/
        Client.sendLeft();
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        /*player.body.velocity.x = 120;

        player.animations.play('right');*/

        Client.sendRight();
    }
    else
    {
        //  Stand still
        /*player.animations.stop();

        player.frame = 4;*/

        Client.sendStop();
    }

    //Move camera with player
    if(player.body.x - game.camera.x >= game.camera.width * 2/3) {
        game.camera.x+=2;
        if (sky.position.x < game.world.width - game.camera.width)
        sky.position.x += 2;
    }
    if(player.body.x - game.camera.x <= game.camera.width * 1/3) {
        game.camera.x-=2;
        if (sky.position.x > 0)
        sky.position.x -= 2;
    }
    
    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down)
    {
        player.body.velocity.y = -350;
    }

    // Send coordinates and have all clients tween character to point
        //Game.getCoordinates(player);
}

function collectStar (player, star) {
    
    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;

}