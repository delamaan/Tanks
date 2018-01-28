/*
 * Tanks!
 * Author: Andrew & Austin Delamar
 * License MIT
 * Main.js program
 */
window.onload = function() {
    var cameraWidth = 1200;
    var cameraHeight = 600;

    var game = new Phaser.Game(cameraWidth, cameraHeight, Phaser.AUTO, 'game', {
        preload: preload, create: create, update: update, render: render
    });

    // ============== //
    // Game variables //
    // ============== //

    var gameWidth = 5000;
    var gameHeight = cameraHeight;
    var tileSize = 64;
    var groundStart = tileSize*3;

    var shotSpeed = 600;
    var reloading = false;
    var reloadTime = 1000;
    var bulletTTL = 1500;

    var bossFight = false;
    var bossArenaWidth = gameWidth - cameraWidth;
    var win = false;

    var ui = [];

    // ==================== //
    // Preload: load assets //
    // ==================== //

    function preload() {
        game.load.image('goblin', 'sprites/goblins/Fatty.gif');
        game.load.image('superFatty', 'sprites/bosses/SuperFatty.gif')
        game.load.image('tank', 'sprites/tanks/RedTank.gif');
        game.load.image('shell', 'sprites/tanks/RedTankShell.gif');
        game.load.image('dirt', 'sprites/tiles/TileDirt.gif');
        game.load.image('skyDirt', 'sprites/tiles/TileSkyDirt.gif');
        game.load.image('sky', 'sprites/tiles/TileSky2.gif');
    }

    // =========================================== //
    // Create: instantiate game objects and groups //
    // =========================================== //

    function create() {
        // ===== //
        // Stage //
        // ===== //

        game.add.tileSprite(
            0, 0, gameWidth, tileSize*2, 'sky'
        );
        game.add.tileSprite(
            0, tileSize*2, gameWidth, tileSize, 'skyDirt'
        );
        game.add.tileSprite(
            0, tileSize*3, gameWidth, gameHeight - tileSize*3, 'dirt'
        );

        game.world.setBounds(0, 0, gameWidth, gameHeight);

        game.physics.startSystem(Phaser.Physics.ARCADE);

        cursors = game.input.keyboard.createCursorKeys();

        // ============================= //
        // Groups: collection of sprites //
        // ============================= //

        bosses = game.add.group();
        bosses.enableBody = true;
        bosses.collideWorldBounds = true;

        enemies = game.add.group();
        enemies.enableBody = true;
        enemies.collideWorldBounds = true;

        playerProjectiles = game.add.group();
        playerProjectiles.enableBody = true;

        deadBodies = game.add.group();

        // ====== //
        // Player //
        // ====== //

        player = game.add.sprite(100, cameraHeight/2, 'tank');
        player.anchor.setTo(0.5, 0.5);

        game.physics.arcade.enable(player);
        player.body.collideWorldBounds = true;

        // ======= //
        // Enemies //
        // ======= //

        spawnEnemy(300, 300, 'goblin');
        spawnEnemy(700, 200, 'goblin');
        spawnEnemy(450, 500, 'goblin');
        spawnEnemy(800, 450, 'goblin');
        spawnEnemy(700, 350, 'goblin');

        // ====== //
        // Camera //
        // ====== //

        initCamera();
    }

    // ================= //
    // Update: main loop //
    // ================= //

    function update() {
        // ========== //
        // Collisions //
        // ========== //

        game.physics.arcade.collide(playerProjectiles, enemies, hit);
        game.physics.arcade.collide(playerProjectiles, bosses, damage);

        // ===== //
        // State //
        // ===== //

        if (!bossFight) {
            checkCameraPosition();
        }
        else {
            restrictHorizontalMovement();
        }

        // =============== //
        // Player Movement //
        // =============== //

        // Horizontal Movement
        if (cursors.left.isDown)
        {
            player.body.velocity.x = -150;
        }
        else if (cursors.right.isDown)
        {
            player.body.velocity.x = 150;
        }
        else {
            player.body.velocity.x = 0;
        }

        // Vertical Movement
        if (cursors.up.isDown) {
            player.body.velocity.y = -150;
        }
        else if (cursors.down.isDown) {
            player.body.velocity.y = 150;
        }
        else {
            player.body.velocity.y = 0;
        }

        restrictVerticalMovement();

        // ============== //
        // Player Actions //
        // ============== //

        // Main Gun
        if (!reloading && game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            fire();
        }

        if (!bossFight && game.input.keyboard.isDown(Phaser.Keyboard.B)) {
            player.x = 4200;
        }

        if (win && game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            restart();
        }
    }

    // ========================== //
    // Render: debugging purposes //
    // ========================== //

    function render() {
        // game.debug.body(player);

        // playerProjectiles.forEachAlive(game.debug.body, game.debug);

        // game.debug.cameraInfo(game.camera, 30, 30);
    }

    // ================ //
    // Helper functions //
    // ================ //

    // player bullets hitting enemies
    function hit(projectile, enemy) {
        projectile.kill();
        enemy.kill();

        var deadBody = deadBodies.create(enemy.x+16, enemy.y+16, 'goblin');
        deadBody.rotation = 90;
        deadBody.anchor.setTo(0.5, 0.5);
    }

    function damage(projectile, boss) {
        projectile.kill();
        boss.health--;
        boss.body.velocity.x = 0;

        if (boss.health <= 0) {
            boss.kill();
            var deadBody = deadBodies.create(boss.x+64, boss.y+64, 'superFatty');
            deadBody.rotation = 90;
            deadBody.anchor.setTo(0.5, 0.5);

            win = true;

            showWinDialog();
        }
    }

    // instantiate player bullet
    function fire() {

        var xPos = player.x;
        var yPos = player.y - 32 - 10;

        var shot = playerProjectiles.create(xPos, yPos, 'shell');

        shot.body.velocity.x = shotSpeed;
        shot.body.setSize(32, 32, 16, 16);

        // reloading
        reloading = true;
        setTimeout(function() {
            shotCount = 0;
            reloading = false;
            player.rotation = 0;
        }, reloadTime);

        // expiration: clearing memory usage
        setTimeout(function() {
            if (shot.alive) {
                shot.kill();
            }
            shot.destroy();
        }, bulletTTL);
    }

    // instantiate enemy
    function spawnEnemy(x, y, sprite) {
        var e = enemies.create(x, y, sprite);
        e.body.setSize(32, 56, 16, 4);
        e.anchor.setTo(0.5, 0.5);

        // silly AI movement
        // setInterval(function() {
        //     var speed = Math.floor(Math.random() * 51);
        //     var horizontal = Math.floor(Math.random() * 3) - 1;
        //     var vertical = Math.floor(Math.random() * 3) - 1;
        //     e.body.velocity.x = horizontal * speed;
        //     e.body.velocity.y = vertical * speed;
        // }, 100);
    }

    function spawnBoss() {
        boss = bosses.create(gameWidth - 250, gameHeight/2, 'superFatty');
        boss.body.setSize(64, 112, 32, 12);
        boss.anchor.setTo(0.5, 0.5);
        boss.health = 3;
    }

    function checkCameraPosition() {
        if (game.camera.x >= bossArenaWidth) {
            bossFight = true;
            game.camera.follow(null);
            spawnBoss();
        }
    }

    function restrictVerticalMovement() {
        if (player.y < groundStart) {
            player.y = groundStart;
        }
    }

    function restrictHorizontalMovement() {
        if (player.x < bossArenaWidth + tileSize) {
            player.x = bossArenaWidth + tileSize;
        }
        if (player.x > gameWidth - tileSize) {
            player.x = gameWidth - tileSize;
        }
    }

    function showWinDialog() {
        var bar = game.add.graphics();
        bar.beginFill(0x000000, 0.3);
        bar.drawRect(0, cameraHeight/2-100, cameraWidth, 200);
        bar.fixedToCamera = true;

        var style = { fill: '#fff', fontSize: "50px" };
        var smallStyle = Object.assign({}, style);
        smallStyle.fontSize = "20px";

        var text = game.add.text(cameraWidth/2, cameraHeight/2 - 50, "Defeated: Super Fatty", style);
        text.anchor.setTo(0.5, 0.5);
        text.fixedToCamera = true;

        var rankText = game.add.text(cameraWidth/2, cameraHeight/2 + 10, "Rank: A", style);
        rankText.anchor.setTo(0.5, 0.5);
        rankText.fixedToCamera = true;

        var continueText = game.add.text(cameraWidth/2, cameraHeight/2 + 60, "Fire to Continue", smallStyle);
        continueText.anchor.setTo(0.5, 0.5);
        continueText.fixedToCamera = true;

        ui.push(bar);
        ui.push(text);
        ui.push(rankText);
        ui.push(continueText);
    }

    function restart() {
        bosses.removeAll(true);
        enemies.removeAll(true);
        deadBodies.removeAll(true);
        playerProjectiles.removeAll(true);

        player.x = 100;
        player.y = cameraHeight/2;

        game.camera.x = 0;
        game.camera.y = 0;

        initCamera();

        // clear ui
        ui.forEach(function(item) {
            item.destroy();
        });

        bossFight = false;
        reloading = false;
        win = false;
    }

    function initCamera() {
        game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
        game.camera.deadzone = new Phaser.Rectangle(100, 50, 200, cameraHeight)
            ;
    }
};
