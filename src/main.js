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

  var kills = 0;
  var bossKills = 0;

  var enemyShotSpeed = 200;

  var bossFight = false;
  var bossArenaWidth = gameWidth - cameraWidth;
  var win = false;
  var isDead = false;
  var currentLevel = 1;

  var ui = [];

  // ==================== //
  // Preload: load assets //
  // ==================== //

  function preload() {
    game.load.spritesheet('tiny', 'sprites/goblins/Tiny.png', 32, 32);
    game.load.spritesheet('axe', 'sprites/goblins/TinyBullet.png', 32, 32);
    game.load.spritesheet('fatty', 'sprites/goblins/Fatty.png', 64, 64);
    game.load.spritesheet('spear', 'sprites/goblins/FattyBullet.png', 64, 64);
    game.load.spritesheet('superFatty', 'sprites/bosses/SuperFatty.png', 128, 128);
    game.load.spritesheet('boulder', 'sprites/bosses/Boulder.png', 64, 64);
    game.load.spritesheet('tank', 'sprites/tanks/RedTank.png', 64, 64);
    game.load.spritesheet('shell', 'sprites/tanks/RedTankShell.png', 64, 64);

    game.load.image('dirt', 'sprites/tiles/TileDirt.gif');
    game.load.image('skyDirt', 'sprites/tiles/TileSkyDirt.gif');
    game.load.image('sky', 'sprites/tiles/TileSky2.gif');

    game.load.audio('goblins1', 'sounds/Goblins1.mp3');
    game.load.audio('goblins2', 'sounds/Goblins2.mp3');
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

    enemyProjectiles = game.add.group();
    enemyProjectiles.enableBody = true;

    deadBodies = game.add.group();

    // ====== //
    // Player //
    // ====== //

    player = game.add.sprite(100, cameraHeight/2, 'tank');
    player.animations.add('playerAnimate');
    player.animations.play('playerAnimate', 10, true);
    player.anchor.setTo(0.5, 0.5);

    game.physics.arcade.enable(player);
    player.body.setSize(64, 40, 0, 12);
    player.body.collideWorldBounds = true;

    // ======= //
    // Enemies //
    // ======= //

    loadLevel(currentLevel);

    // ====== //
    // Camera //
    // ====== //

    initCamera();

    // ====== //
    // Music  //
    // ====== //
    var music = game.add.audio('goblins1');
    music.loopFull();
    music.volume = 1;
  }

  // ================= //
  // Update: main loop //
  // ================= //

  function update() {
    // ===== //
    // State //
    // ===== //
    if (win) {
      if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        currentLevel++;
        restart();
      }
      else {
        return;
      }
    }

    if (isDead) {
      if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        restart();
      }
      else {
        return;
      }
    }

    if (!bossFight) {
      checkCameraPosition();
    }
    else {
      restrictHorizontalMovement();
    }

    // ========== //
    // Collisions //
    // ========== //

    game.physics.arcade.collide(playerProjectiles, enemies, hit);
    game.physics.arcade.collide(playerProjectiles, bosses, damage);
    game.physics.arcade.collide(enemyProjectiles, player, die);

    // =============== //
    // Player Movement //
    // =============== //

    // Horizontal Movement
    if (cursors.left.isDown) {
      player.body.velocity.x = -150;
    }
    else if (cursors.right.isDown) {
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
  }

  // ========================== //
  // Render: debugging purposes //
  // ========================== //

  function render() {
    // game.debug.body(player);

    // enemyProjectiles.forEachAlive(game.debug.body, game.debug);

    // game.debug.cameraInfo(game.camera, 30, 30);
  }

  // ================ //
  // Helper functions //
  // ================ //

  // player bullets hitting enemies
  function hit(projectile, enemy) {
    kills++;
    projectile.kill();
    enemy.kill();
    clearInterval(enemy.attack);
    clearInterval(enemy.move);

    var deadBody = deadBodies.create(enemy.x+16, enemy.y+16, enemy.key);
    deadBody.rotation = 90;
    deadBody.anchor.setTo(0.5, 0.5);
  }

  function damage(projectile, boss) {
    projectile.kill();
    boss.health--;
    boss.body.velocity.x = 0;

    if (boss.health <= 0) {
      bossKills++;
      boss.kill();
      var deadBody = deadBodies.create(boss.x+64, boss.y+64, 'superFatty');
      deadBody.rotation = 90;
      deadBody.anchor.setTo(0.5, 0.5);

      win = true;

      showWinDialog();
    }
  }

  function die(projectile, player) {
    projectile.kill();
    player.kill();

    isDead = true;
    game.camera.follow(null);

    showLoseDialog();
  }

  // instantiate player bullet
  function fire() {
    var xPos = player.x;
    var yPos = player.y - 32 - 10;

    var shot = playerProjectiles.create(xPos, yPos, 'shell');
    shot.animations.add('shotAnimate');
    shot.animations.play('shotAnimate', 12, true);

    shot.body.velocity.x = shotSpeed;
    shot.body.setSize(18, 10, 22, 26);

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
  function spawnFatty(x, y) {
    var e = enemies.create(x, y, 'fatty');
    e.animations.add('fattyAnimate');
    e.animations.play('fattyAnimate', 2, true);
    e.body.setSize(32, 56, 16, 4);
    e.anchor.setTo(0.5, 0.5);

    e.attack = setInterval(function() {
      var spear = enemyProjectiles.create(e.x, e.y - e.height/2, 'spear');
      spear.animations.add('spearAnimate');
      spear.animations.play('spearAnimate', 10, true);
      spear.body.setSize(30, 14, 2, 24);
      spear.body.velocity.x = -2 * enemyShotSpeed;

      setTimeout(function() {
        if (spear.alive) {
          spear.kill();
        }
        spear.destroy();
      }, bulletTTL);
    }, 750);

    e.moveState = 0;

    e.move = setInterval(function() {
      e.moveState++;

      if (e.moveState > 3) {
        e.moveState = 0;
      }

      var moveSpeed = 60;

      switch(e.moveState) {
        case 0:
          e.body.velocity.x = moveSpeed;
          e.body.velocity.y = moveSpeed;
          break;
        case 1:
          e.body.velocity.x = -moveSpeed;
          e.body.velocity.y = moveSpeed;
          break;
        case 2:
          e.body.velocity.x = -moveSpeed;
          e.body.velocity.y = -moveSpeed;
          break;
        case 3:
          e.body.velocity.x = moveSpeed;
          e.body.velocity.y = -moveSpeed;
        break;
      }
    }, 1500);
  }

  function spawnTiny(x, y) {
    var e = enemies.create(x, y, 'tiny');
    e.animations.add('tinyAnimate');
    e.animations.play('tinyAnimate', 2, true);
    // e.body.setSize()
    e.anchor.setTo(0.5, 0.5);

    e.attack = setInterval(function() {
      var axe1 = enemyProjectiles.create(e.x, e.y - e.height/2, 'axe');
      axe1.animations.add('axeAnimate');
      axe1.animations.play('axeAnimate', 10, true);
      axe1.body.setSize(16, 16, 8, 8);
      axe1.body.velocity.x = -1 * enemyShotSpeed;
      axe1.body.velocity.y = -0.5 * enemyShotSpeed;

      var axe2 = enemyProjectiles.create(e.x, e.y - e.height/2, 'axe');
      axe2.animations.add('axeAnimate');
      axe2.animations.play('axeAnimate', 10, true);
      axe2.body.setSize(16, 16, 8, 8);
      axe2.body.velocity.x = -1 * enemyShotSpeed;
      axe2.body.velocity.y = 0.5 * enemyShotSpeed;

      setTimeout(function() {
        if (axe1.alive) {
          axe1.kill();
        }
        axe1.destroy();
      }, bulletTTL);

      setTimeout(function() {
        if (axe2.alive) {
          axe2.kill();
        }
        axe2.destroy();
      }, bulletTTL);
    }, 750);

    e.moveState = 0;

    e.move = setInterval(function() {
      var moveSpeed = 100;

      e.moveState++;

      if (e.moveState > 3) {
        e.moveState = 0;
      }

      switch(e.moveState) {
        case 0:
          e.body.velocity.x = moveSpeed;
          e.body.velocity.y = 0;
          break;
        case 1:
          e.body.velocity.x = 0;
          e.body.velocity.y = moveSpeed;
          break;
        case 2:
          e.body.velocity.x = -moveSpeed;
          e.body.velocity.y = 0;
          break;
        case 3:
          e.body.velocity.x = 0;
          e.body.velocity.y = -moveSpeed;
          break;
      }
    }, 2000);
  }

  function spawnBoss() {
    boss = bosses.create(gameWidth - 250, gameHeight/2, 'superFatty');
    boss.animations.add('bossAnimate');
    boss.animations.play('bossAnimate', 2, true);
    boss.body.setSize(64, 112, 32, 12);
    boss.anchor.setTo(0.5, 0.5);
    boss.health = 3;

    boss.moveState = -1;

    boss.move = setInterval(function() {
      boss.moveState++;

      if (boss.moveState > 11) {
        boss.moveState = 0;
      }

      switch(boss.moveState) {
        case 0:
          boss.body.velocity.x = 200;
          boss.body.velocity.y = 100;
          break;

        case 1:
          boss.body.velocity.x = 0;
          boss.body.velocity.y = 0;
          break;

        case 2:
          boss.body.velocity.x = 0;
          boss.body.velocity.y = 100;
          break;

        case 3:
          boss.body.velocity.x = 0;
          boss.body.velocity.y = 0;
          break;

        case 4:
          boss.body.velocity.x = -200;
          boss.body.velocity.y = 100;
          break;

        case 5:
          boss.body.velocity.x = 0;
          boss.body.velocity.y = 0;
          break;

        case 6:
          boss.body.velocity.x = 200;
          boss.body.velocity.y = -100;
          break;

        case 7:
          boss.body.velocity.x = 0;
          boss.body.velocity.y = 0;
          break;

        case 8:
          boss.body.velocity.x = 0;
          boss.body.velocity.y = -100;
          break;

        case 9:
          boss.body.velocity.x = 0;
          boss.body.velocity.y = 0;
          break;

        case 10:
          boss.body.velocity.x = -200;
          boss.body.velocity.y = -100;
          break;

        case 11:
          boss.body.velocity.x = 0;
          boss.body.velocity.y = 0;
          break;
      }
    }, 500);
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

    var text = game.add.text(cameraWidth/2, cameraHeight/2 - 50, "Mission: Accomplished", style);
    text.anchor.setTo(0.5, 0.5);
    text.fixedToCamera = true;

    var rankText = game.add.text(cameraWidth/2, cameraHeight/2 + 10, "Kills: " + (kills + bossKills), style);
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

  function showLoseDialog() {
    var bar = game.add.graphics();
    bar.beginFill(0x000000, 0.3);
    bar.drawRect(0, cameraHeight/2-100, cameraWidth, 200);
    bar.fixedToCamera = true;

    var style = { fill: '#fff', fontSize: "50px" };
    var smallStyle = Object.assign({}, style);
    smallStyle.fontSize = "20px";

    var text = game.add.text(cameraWidth/2, cameraHeight/2 - 50, "Mission: Failed", style);
    text.anchor.setTo(0.5, 0.5);
    text.fixedToCamera = true;

    var rankText = game.add.text(cameraWidth/2, cameraHeight/2 + 10, "Kills: " + (kills + bossKills), style);
    rankText.anchor.setTo(0.5, 0.5);
    rankText.fixedToCamera = true;

    var continueText = game.add.text(cameraWidth/2, cameraHeight/2 + 60, "Fire to Retry", smallStyle);
    continueText.anchor.setTo(0.5, 0.5);
    continueText.fixedToCamera = true;

    ui.push(bar);
    ui.push(text);
    ui.push(rankText);
    ui.push(continueText);
  }

  function restart() {
    bosses.forEach(function(boss) {
      clearInterval(boss.move);
    });
    enemies.forEach(function(enemy) {
      clearInterval(enemy.attack);
      clearInterval(enemy.move);
    });

    bosses.removeAll(true);
    enemies.removeAll(true);
    deadBodies.removeAll(true);
    playerProjectiles.removeAll(true);
    enemyProjectiles.removeAll(true);

    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

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
    isDead = false;

    kills = 0;
    bossKills = 0;

    loadLevel(currentLevel);

    if (!player.alive) {
      player.revive();
    }
  }

  function initCamera() {
    game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
    game.camera.deadzone = new Phaser.Rectangle(100, 50, 200, cameraHeight);
  }

  function loadLevel(index) {

    switch(index) {
      case 1:
        spawnFatty(800, 350);
        spawnFatty(1100, 450);
        spawnFatty(1600, 350);
        spawnTiny(1700, 200);
        spawnTiny(1800, 275);

        spawnFatty(2825, 200);
        spawnFatty(2825, 500);
        spawnTiny(2800, 225);
        spawnTiny(2700, 375);
        spawnTiny(2800, 525);

        spawnFatty(4700, 200);
        spawnFatty(4700, 350);
        spawnFatty(4700, 500);

        spawnFatty(3400, 200);
        spawnFatty(3500, 250);
        spawnFatty(3600, 300);
        spawnFatty(3700, 350);
        spawnFatty(3400, 400);
        spawnFatty(3500, 450);
        break;

      case 2:
        break;

      case 3:
        break;
    }
  }
};
