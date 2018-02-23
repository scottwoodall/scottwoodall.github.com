;(function () {
    var requestAnimFrame = (function(){
        return window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(callback){
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    // Create the canvas
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = 256;
    canvas.height = 192 + 32;
    document.body.appendChild(canvas);
    
    // Stats
    var stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = "absolute";
    stats.domElement.style.left = "0px";
    stats.domElement.style.top = "0px";
    document.body.appendChild(stats.domElement);

    // The main game loop
    var lastTime, lastKey, lastJump, lastGeneration;
    function main() {
        var now = Date.now();
        var dt = (now - lastTime) / 1000.0;

        stats.begin();
        update(dt);
        render();
        stats.end();
        
        lastTime = now;
        requestAnimFrame(main);
    }

    // CONSTANTS
    var _C = {
        boardWidth: 7,
        boardHeight: 7,
        numTiles: 28,
        tileWidth: 32,
        tileHeight: 32,
        offX: 0,
        entityWidth: 16,
        entityHeight: 16,
        delayKeys: 500,
        delayJump: 250,
        delayJumpEnemy: 500,
        delayEnemy: 250,
        enemySpeed: 36,
        fixedGenTime: 1500,
        varGenTime: 500
    };
    _C.offX = (canvas.width - _C.tileWidth) / 2;
    
    // Game
    var tile = {
        pos: [0, 0],
        spriteNotVisited: new Sprite("assets/qbert.png", [0, 160], [_C.tileWidth, _C.tileHeight], 0, 1, "horizontal", true),
        spriteVisited: new Sprite("assets/qbert.png", [0, 192], [_C.tileWidth, _C.tileHeight], 0, 1, "horizontal", true),
        sprite: null
    };
    tile.sprite = tile.spriteNotVisited;
    var board = [];
    var tilesVisited = 0;
    
    var enemies = [];
    
    var player = {
        pos: [0, 0],
        tile: [0, 0],
        vector: [0, 0],
        speed: 10,
        isJumping: false,
        isDead: false,
        cosine: 0,
        spriteS: new Sprite("assets/qbert.png", [64, 0], [_C.entityWidth, _C.entityHeight], 5, [0, 1]),
        spriteA: new Sprite("assets/qbert.png", [96, 0], [_C.entityWidth, _C.entityHeight], 5, [0, 1]),
        spriteW: new Sprite("assets/qbert.png", [0, 0], [_C.entityWidth, _C.entityHeight], 5, [0, 1]),
        spriteQ: new Sprite("assets/qbert.png", [32, 0], [_C.entityWidth, _C.entityHeight], 5, [0, 1]),
        sprite: null
    };
    player.sprite = player.spriteA;
    
    var death = {
        pos: [0, 0],
        sprite: new Sprite("assets/qbert.png", [128, 80], [48, 32], 0, [0])
    };
    
    
    ctx.fillStyle = "#999";
    ctx.font = (canvas.height / 4) + "px Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Loading...", canvas.width/2, canvas.height * 0.7);
    function init() {
        lastTime = lastGeneration = Date.now();
        currentVarGenTime = Math.random() * _C.varGenTime;
        createBoard();
        setPlayerPos();
        main();
    }
    resources.load([
        "assets/hexagon.png",
        "assets/qbert.png"
    ]);
    resources.onReady(init);    
    
    // Update game objects
    function update(dt) {        
        handleInput(dt);
        if (player.isDead) return;
        checkGeneration(dt);
        updateEntities(dt);
        checkWin();
        checkDeath();
    }
    
    function checkGeneration(dt) {
        if (Date.now() < lastGeneration + _C.fixedGenTime + currentVarGenTime) {
            return;
        }
        lastGeneration = Date.now();
        currentVarGenTime = Math.random() * _C.varGenTime;
        generateEnemy();
    }
    
    function generateEnemy() {
        var enemy = pool.getEnemy();
        var rnd = (Math.random() < 0.5) ? -1 : 1;
        var initialTile = getTilePos(rnd, null, 1);
        enemy.pos = [initialTile[0] + 8, 0];
        enemy.destination = initialTile[1] - 4;
        enemy.tile = [rnd, 1];
        enemy.isEntering = true;
        enemy.isJumping = false;
        enemy.isWaiting = false;
        enemy.isExitting = false;
        enemies.push(enemy);
    }

    function handleInput(dt) {
        if (Date.now() - lastKey < _C.delayKeys || player.isJumping) return;
        if (player.isDead && 
           (input.isDown("Q") ||
           input.isDown("W") ||
           input.isDown("A") ||
           input.isDown("S") ||
           input.isDown("SPACE"))) {
            resetGame();
        }
        if (input.isDown("Q")) {
            if (Math.abs(player.tile[0]-1) <= player.tile[1]-1) {
                lastKey = Date.now();
                player.isJumping = true;
                lastJump = Date.now();
                player.vector = [-1, -1];
                player.sprite = player.spriteQ;
            }
        }

        if (input.isDown("W")) {
            if (Math.abs(player.tile[0]+1) <= player.tile[1]-1) {
                lastKey = Date.now();
                player.isJumping = true;
                lastJump = Date.now();
                player.vector = [1, -1];
                player.sprite = player.spriteW;
            }
        }

        if (player.tile[1] < _C.boardHeight-1) {
            if (input.isDown("A")) {
                lastKey = Date.now();
                player.isJumping = true;
                lastJump = Date.now();
                player.vector = [-1, 1];
                player.sprite = player.spriteA;
            }

            if (input.isDown("S")) {
                lastKey = Date.now();
                player.isJumping = true;
                lastJump = Date.now();
                player.vector = [1, 1];
                player.sprite = player.spriteS;
            }
        }

        if (input.isDown("SPACE")  && true) {

        }
    }

    function updateEntities(dt) {
        // player
        player.sprite.update(dt);
        if (player.isJumping) {
            player.cosine += player.speed * dt * 1.15;
            player.pos[0] += player.vector[0] + (player.speed * dt * 1.15);
            player.pos[1] += player.vector[1] + (player.speed * dt) - Math.sin(player.cosine);
            if (Date.now() - lastJump > _C.delayJump) {
                player.cosine = 0;
                player.isJumping = false;
                player.tile[0] += player.vector[0];
                player.tile[1] += player.vector[1];
                setPlayerPos(true);
            }
        }
        
        // other entities
        for (var e=enemies.length-1; e>=0; e--) {
            var enemy = enemies[e];
            enemy.sprite.update(dt);
            if (enemy.isEntering) {
                enemy.pos[1] += 2;
                if (enemy.pos[1] >= enemy.destination) {
                    enemy.pos[1] = enemy.destination;
                    enemy.isEntering = false;
                }
            } else if (enemy.isExitting) {
                enemy.cosine += _C.enemySpeed * dt * 0.15;
                enemy.pos[0] += enemy.vector[0] * dt * _C.enemySpeed;
                enemy.pos[1] += 1.5*enemy.vector[1] - 2*Math.sin(enemy.cosine);
                if (enemy.pos[1] > canvas.height) {
                    pool.removeEnemy(enemies, e);
                }
            } else if (enemy.isWaiting) {
                if (Date.now() > enemy.lastWait + _C.delayEnemy) {
                    enemy.isWaiting = false;
                }
            } else if (!enemy.isJumping) {
                if (enemy.tile[1] < _C.boardHeight-1) {
                    enemy.isJumping = true;
                    enemy.vector = [(Math.random() < 0.5) ? -1 : 1, 1];
                    enemy.lastJump = Date.now();
                    enemy.cosine = 0;
                } else {
                    enemy.isExitting = true;
                    enemy.cosine = 0;
                }
            } else if (enemy.isJumping) {
                enemy.cosine += _C.enemySpeed * dt * 0.2;
                enemy.pos[0] += enemy.vector[0] * dt * _C.enemySpeed;
                enemy.pos[1] += enemy.vector[1] - 1.25*Math.sin(enemy.cosine);
                if (Date.now() - enemy.lastJump > _C.delayJumpEnemy) {
                    enemy.tile[0] += enemy.vector[0];
                    enemy.tile[1] += enemy.vector[1];
                    setEnemyPos(enemy);
                    enemy.isJumping = false;
                    enemy.isWaiting = true;
                    enemy.lastWait = Date.now();
                }                    
            }
        }
    }
    
    // Draw everything
    function render() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        renderBoard();
        renderPlayer();
        renderEnemies();
        renderDeath();
    }
    
    function renderEntity(entity) {
        ctx.save();
        ctx.translate(entity.pos[0], entity.pos[1]);
        entity.sprite.render(ctx);
        ctx.restore();
    }

    function renderBoard() {
        for (var q=0, len=board.length; q<len; q++) {
            tile.pos = board[q][3];
            tile.sprite = (board[q][4]) ? tile.spriteVisited : tile.spriteNotVisited;
            renderEntity(tile);
        }
    }
    
    function renderPlayer() {
        renderEntity(player);
    }
    
    function renderEnemies() {
        for (var e=enemies.length-1; e>=0; e--) {
            renderEntity(enemies[e]);
        }
    }
    
    function renderDeath() {
        if (!player.isDead) return;
        death.pos[0] = player.pos[0] - 8;
        death.pos[1] = player.pos[1] - 30;
        renderEntity(death);
    }
    
    function createBoard() {
        for (var j=0; j<_C.boardHeight; j++) {
            for (var i=0; i<_C.boardWidth - j; i++) {
                var x = i - j ;
                var y = j ;
                var z = j + i;
                var pos = [(x * _C.tileWidth / 2) + _C.offX, (z * _C.tileHeight * 0.75) + 16];
                var visited = false;
                board.push([x, y, z, pos, visited]);
            }
        }
        var tempBoard = {};
        for (var q=0, len=board.length; q<len; q++) {
            if (!tempBoard[board[q][2]]) tempBoard[board[q][2]] = [];
            tempBoard[board[q][2]].push(board[q]);
        }
        board = [];
        for (var key in tempBoard) {
            var arr = tempBoard[key];
            for (var k=0, l=arr.length; k<l; k++) {
                board.push(arr[k]);
            }
        }
        console.log(board);
    }
    
    function getTilePos(x, y, z) {
        // to-do: find a use to the parameter "y"
        for (var q=0, l=board.length; q<l; q++) {
            if (board[q][0] == x && board[q][2] == z) {
                return [(x * _C.tileWidth / 2) + _C.offX, (z * _C.tileHeight * 0.75) + 16];
            }
        }
        throw new Error("stop!");
        //return [0, 0];
    }
    
    function setTileAsVisited(x, y, z) {
        // to-do: find a use to the parameter "y"
        for (var q=0, l=board.length; q<l; q++) {
            if (board[q][0] == x && board[q][2] == z) {
                if (!board[q][4]) {
                    tilesVisited++;
                    board[q][4] = true;
                }
                break;
            }
        }
    }
    
    function setPlayerPos(visitTile) {
        player.pos = getTilePos(player.tile[0], null, player.tile[1]);
        if (visitTile) setTileAsVisited(player.tile[0], null, player.tile[1]);
        player.pos[0] += _C.entityWidth/2;
        player.pos[1] -= _C.entityHeight/2;
    }
    
    function setEnemyPos(enemy) {
        enemy.pos = getTilePos(enemy.tile[0], null, enemy.tile[1]);
        enemy.pos[0] += 8;
        enemy.pos[1] -= 4;
    }
    
    function checkWin() {
        if (tilesVisited >= _C.numTiles) {
            tilesVisited = 0;
            for (var q=0, l=board.length; q<l; q++) {
                board[q][4] = false;
            }
            for (var e=enemies.length-1; e>=0; e--) {
                pool.removeEnemy(enemies, e);
            }
            resetPlayer();
        }
    }
    
    function checkDeath() {
        for (var e=enemies.length-1; e>=0; e--) {
            var enemy = enemies[e];
            if (enemy.isEntering || enemy.isExitting) continue;
            if (enemy.tile[0] == player.tile[0] && enemy.tile[1] == player.tile[1]) {
                player.isDead = true;
                break;
            }
        }
    }
    
    function resetGame() {
        tilesVisited = 999;
        checkWin();
        resetPlayer();
    }
    
    function resetPlayer() {
        player.pos = [0, 0];
        player.tile = [0, 0];
        player.vector = [0, 0];
        player.isJumping = false;
        player.isDead = false;
        player.lastJump = 0;
        player.cosine = 0;
        player.sprite = player.spriteA;
        setPlayerPos();
    }
})();