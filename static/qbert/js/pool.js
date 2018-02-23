;(function() {
    var enemiesPool = [];
    
    window.pool = {
        getEnemy: function(canvas) {
            var enemy;
            
            if (enemiesPool.length == 0) {
                return {
                    pos: [0, 0],
                    sprite: new Sprite("assets/qbert.png", [0, 16], [16, 16], 5, [0, 1])
                };   
            } else {
                var enemy = enemiesPool.pop();
                enemy.pos = [0, 0];
                return enemy;
            }
        },
        removeEnemy: function(enemies, i) {
            enemiesPool.push(enemies[i]);
            enemies.splice(i, 1);
        },
        getPoolLength: function() {
            return enemiesPool.length;
        }
    };
})();