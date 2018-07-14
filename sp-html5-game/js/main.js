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
    color: 'green'
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
const Upgrade = (id, x, y, speedX, speedY, width, height, color) => {
    let upgrade = {
        x: x,
        y: y,
        speedX: speedX,
        speedY: speedY,
        name: 'E',
        id: id,
        width: width,
        height: height,
        color: color || 'orange'
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
        color: color || 'black'
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

    Upgrade(id, x, y, speedX, speedY, width, height);
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

// Player Movement Based On Mouse Position
document.addEventListener("mousemove", (mouse) => {
    let mouseX = mouse.clientX - canvas.getBoundingClientRect().left;
    let mouseY = mouse.clientY - canvas.getBoundingClientRect().top;

    // Player out of bounds prevention
    if (mouseX < player.width / 2) {
        mouseX = player.width / 2;
    } else if (mouseX > canvasWidth - player.width / 2) {
        mouseX = canvasWidth - player.width / 2;
    }

    if (mouseY < player.height / 2) {
        mouseY = player.height / 2;
    } else if (mouseY > canvasHeight - player.height / 2) {
        mouseY = canvasHeight - player.height / 2;
    }

    player.x = mouseX;
    player.y = mouseY;
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
    if (frameCount % 25 === 0) { // every 1 seconds
        randomlyGenerateBullet();
    }

    for (let upgrade in upgradeList) {
        updateEntity(upgradeList[upgrade]);

        if (hasCollided(player, upgradeList[upgrade])) {
            score += 100;
            delete upgradeList[upgrade];
        }
    }

    for (let bullet in bulletList) {
        updateEntity(bulletList[bullet]);
    }

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