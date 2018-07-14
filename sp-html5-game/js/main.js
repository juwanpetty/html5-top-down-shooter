const canvas = document.getElementById("ctx");
const ctx = canvas.getContext("2d");

ctx.font = '30px Arial';

const canvasWidth = 500;
const canvasHeight = 500;

let timeWhenGameStarted = Date.now(); // return time in milliseconds
let frameCount = 0;
let score = 0;
let enemyList = {};
let upgradeList = {};
let bulletList = {};

// return distance (number)
const getDistance = (entity1, entity2) => {
    const vx = entity1.x - entity2.x;
    const vy = entity1.y - entity2.y;
    return Math.sqrt(vx * vx + vy * vy);
}

// return if colliding (true/false)
const hasCollided = (entity1, entity2) => {
    const distance = getDistance(entity1, entity2);
    return distance < 30;
}

const testCollisionRect = (rect1, rect2) => {
    return rect1.x <= rect2.x + rect2.width
        && rect2.x <= rect1.x + rect1.width
        && rect1.y <= rect2.y + rect2.height
        && rect2.y <= rect1.y + rect1.height;
}

const testCollisionEntity = (entity1, entity2) => {
    let rect1 = {
        x: entity1.x - entity1.width / 2,
        y: entity1.y - entity1.height / 2,
        width: entity1.width,
        height: entity1.height
    }

    let rect2 = {
        x: entity2.x - entity2.width / 2,
        y: entity2.y - entity2.height / 2,
        width: entity2.width,
        height: entity2.height
    }

    return testCollisionRect(rect1, rect2);
}


// Player
const player = {
    x: 50,
    y: 40,
    speedX: 30,
    speedY: 5,
    name: 'P',
    hp: 10,
    width: 20,
    height: 20,
    color: 'green',
    attackSpeed: 1, 
    attackCounter: 0,
    pressingDown: false,
    pressingUp: false,
    pressingLeft: false,
    pressingRight: false
}

// Enemy
const Enemy = (id, x, y, speedX, speedY, width, height, color) => {
    let enemy = {
        x: x,
        y: y,
        speedX: speedX,
        speedY: speedY,
        name: 'E',
        id: id,
        width: width,
        height: height,
        color: color || 'red'
    };
    enemyList[id] = enemy;
}

// Upgrades
const Upgrade = (id, x, y, speedX, speedY, width, height, color, category) => {
    let upgrade = {
        x: x,
        y: y,
        speedX: speedX,
        speedY: speedY,
        name: 'E',
        id: id,
        width: width,
        height: height,
        color: color || 'orange',
        category, category
    };
    upgradeList[id] = upgrade;
}

// Bullets
const Bullet = (id, x, y, speedX, speedY, width, height, color) => {
    let bullet = {
        x: x,
        y: y,
        speedX: speedX,
        speedY: speedY,
        name: 'E',
        id: id,
        width: width,
        height: height,
        color: color || 'black',
        timer: 0
    };
    bulletList[id] = bullet;
}

const randomlyGenerateEnemy = () => {
    let x = Math.random() * canvasWidth;
    let y = Math.random() * canvasHeight;
    let height = 10 + Math.random() * 30; // between 10 and 40
    let width = 10 + Math.random() * 30;
    let speedX = 5 + Math.random() * 5;
    let speedY = 5 + Math.random() * 5;
    let id = Math.random();

    Enemy(id, x, y, speedX, speedY, width, height);
}

const randomlyGenerateUpgrade = () => {
    let x = Math.random() * canvasWidth;
    let y = Math.random() * canvasHeight;
    let height = 10; // between 10 and 40
    let width = 10;
    let speedX = 0;
    let speedY = 0;
    let id = Math.random();
    let color;
    let category;
    Math.random() < 0.5 ? category = 'score' : category = 'attackSpeed';

    category === 'score' ? color = 'orange' : color = 'lightgreen';

    Upgrade(id, x, y, speedX, speedY, width, height, color,  category);
}

const randomlyGenerateBullet = () => {
    let x = player.x;
    let y = player.y;
    let height = 10;
    let width = 10;

    let angle = Math.random() * 360;

    let speedX = Math.cos(angle / 180 * Math.PI) * 5;
    let speedY = Math.sin(angle / 180 * Math.PI) * 5;
    let id = Math.random();

    Bullet(id, x, y, speedX, speedY, width, height);
}

// Track player movement based on keyboard press
document.addEventListener("keydown", (event) => {
    if (event.keyCode === 68 || event.keyCode === 39) {         // move right
        player.pressingRight = true;
    } else if (event.keyCode === 65 || event.keyCode === 37) {  // move left
        player.pressingLeft = true;
    } else if (event.keyCode === 87 || event.keyCode === 38) {  // move up
        player.pressingUp = true;
    } else if (event.keyCode === 83 || event.keyCode === 40) {  // move down
        player.pressingDown = true;
    }
});

document.addEventListener("keyup", (event) => {
    if (event.keyCode === 68 || event.keyCode === 39) {         // move right
        player.pressingRight = false;
    } else if (event.keyCode === 65 || event.keyCode === 37) {  // move left
        player.pressingLeft = false;
    } else if (event.keyCode === 87 || event.keyCode === 38) {  // move up
        player.pressingUp = false;
    } else if (event.keyCode === 83 || event.keyCode === 40) {  // move down
        player.pressingDown = false;
    }
});

const updatePlayerPosition = () => {
    if (player.pressingRight) {
        player.x += 10;
    }
    if (player.pressingLeft) {
        player.x -= 10;
    }
    if (player.pressingUp) {
        player.y -= 10;
    }
    if (player.pressingDown) {
        player.y += 10;
    }

    // check for player out of bounds
    if (player.x < player.width / 2) {
        player.x = player.width / 2;
    } else if (player.x > canvasWidth - player.width / 2) {
        player.x = canvasWidth - player.width / 2;
    }

    if (player.y < player.height / 2) {
        player.y = player.height / 2;
    } else if (player.y > canvasHeight - player.height / 2) {
        player.y = canvasHeight - player.height / 2;
    }
}

// Track player attack
document.addEventListener("click", (mouse) => {
    if (player.attackCounter > 25) {
        randomlyGenerateBullet();
        player.attackCounter = 0;
    }
});

const updateEntity = entity => {
    updateEntityPosition(entity);
    drawEntity(entity);
}

const updateEntityPosition = (entity) => {
    entity.x += entity.speedX;
    entity.y += entity.speedY;

    if (entity.x <= 0 || entity.x >= canvasWidth) {
        entity.speedX = -entity.speedX;
    }

    if (entity.y <= 0 || entity.y >= canvasHeight) {
        entity.speedY = -entity.speedY;
    }
}

const drawEntity = (entity) => {
    ctx.save();
    ctx.fillStyle = entity.color;
    ctx.fillRect(entity.x - entity.width / 2, entity.y - entity.height / 2, entity.width, entity.height);
    ctx.restore();
}

const startNewGame = () => {
    timeWhenGameStarted = Date.now();
    player.hp = 10;
    frameCount = 0;
    score = 0;
    enemyList = {};
    upgradeList = {};
    bulletList = {};
    randomlyGenerateEnemy();
    randomlyGenerateEnemy();
    randomlyGenerateEnemy();
}

const update = () => {
    // Clear Canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    frameCount++;
    score++;

    if (frameCount % 100 === 0) { // every 4 seconds
        randomlyGenerateEnemy();
    }

    if (frameCount % 75 === 0) { // every 3 seconds
        randomlyGenerateUpgrade();
    }

    player.attackCounter += player.attackSpeed;

    for (let upgrade in upgradeList) {
        updateEntity(upgradeList[upgrade]);

        if (hasCollided(player, upgradeList[upgrade])) {
            if (upgradeList[upgrade].category === 'score') {
                score += 100;
            } else if (upgradeList[upgrade].category === 'attackSpeed') {
                player.attackSpeed++;
            }
            
            delete upgradeList[upgrade];
        }
    }

    for (let bullet in bulletList) {
        updateEntity(bulletList[bullet]);

        bulletList[bullet].timer++;

        if (bulletList[bullet].timer > 100) {
            delete bulletList[bullet]; // delete bullet
            continue;
        }

        for (let enemy in enemyList) {
            if (hasCollided(bulletList[bullet], enemyList[enemy])) {
                delete bulletList[bullet]; // delete bullet
                delete enemyList[enemy]; // delete enemy
                
                // break out of loop once bullet is removed
                break;
            }
        }
    }

    updatePlayerPosition();
    drawEntity(player);    
    ctx.fillText(player.hp + ' HP', 0, 30);
    ctx.fillText('Score: ' + score, 200, 30);

    for (let enemy in enemyList) {
        updateEntity(enemyList[enemy]);

        if (hasCollided(player, enemyList[enemy])) {
            player.hp--;
        }
    }

    if (player.hp <= 0) {
        const timeSurvived = Date.now() - timeWhenGameStarted;
        
        console.log('You Are Die...');
        console.log('You survived for ' + timeSurvived + " ms");
        startNewGame();
    }
}

startNewGame();
setInterval(update, (1000 / 25));