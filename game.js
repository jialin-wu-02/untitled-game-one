(function () {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

const keyActionMapping = {
    KeyA: "left",
    KeyD: "right",
    KeyW: "up",
    KeyS: "down",
    Space: "up"
}

var framecount = 0;

// load pictures

const idleMainImg = new Image(),
    jumpMainImg = new Image(),
    deadMainImg = new Image();
idleMainImg.src = 'assest/flat-boi/Idle.png';
jumpMainImg.src = 'assest/flat-boi/Jump.png';
deadMainImg.src = 'assest/flat-boi/Dead.png';

let walk = [];

let walktick = 0; // cycle from 0 to 15. 

for (let i = 1; i < 16; i++) {
    walk[i - 1] = new Image();
    walk[i - 1].src = 'assest/flat-boi/Walk_' + i + '.png';
}

var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    width = 1000,
    height = 500,
    leftFrameOffset = canvas.offsetLeft,
    topFrameOffset = canvas.offsetTop,
    player = {
        x: width / 2,
        y: height - 100,
        width: 80,
        height: 80,
        speed: 4,
        velX: 0,
        velY: 0,
        jumping: false,
        ground: false,
        facing: "right", // facing can have right or left.
    },
    keys = {
        left: false,
        right: false,
        up: false,
        down: false,
    },
    friction = 0.8,
    gravity = 0.3;

var walls = [];

// create frames
walls.push({
    x: 0,
    y: 0,
    width: 2,
    height: height
});
walls.push({
    x: 0,
    y: height - 2,
    width: width,
    height: 50
});
walls.push({
    x: width - 2,
    y: 0,
    width: 2,
    height: height
});

canvas.width = width;
canvas.height = height;

// Player Functions
const updatePlayerUpAction = () => {
    if (!player.jumping && player.ground) {
        player.jumping = true;
        player.ground = false;
        player.velY = -player.speed * 2;
    }
}

const updatePlayerRightAction = () => {
    if (player.velX < player.speed) {
        player.velX++;
    }
}

const updatePlayerleftAction = () => {
    if (player.velX > -player.speed) {
        player.velX--;
    }
}

const updatePlayerState = () => {

    if (keys.up) {
        updatePlayerUpAction();
    }
    if (keys.right) {
        updatePlayerRightAction();
    }
    if (keys.left) {
        updatePlayerleftAction();
    }

    player.velX *= friction;
    if (Math.abs(player.velX) <= 0.05) {
        player.velX = 0;
    }
    player.velY += gravity;

    player.ground = false;
    for (let wall of walls) {
        
        var dir = checkCollision(player, wall);

        if (dir === "left" || dir === "right") {
            player.velX = 0;
            player.jumping = false;
        } else if (dir === "bottom") {
            player.ground = true;
            player.jumping = false;
        } else if (dir === "top") {
            player.velY *= -1;
        }

    }
    
    if (player.ground){
         player.velY = 0;
    }
    
    player.x += player.velX;
    player.y += player.velY;

    ctx.clearRect(0, 0, width, height);
    drawMain(player.x, player.y, player.width, player.height);
    // ctx.fillStyle = "red";
    // ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Wall Functions

const createWall = (xVal, yVal, width, height) => {
    walls.push({
        x: offsetCenterPosition(xVal, width),
        y: offsetCenterPosition(yVal, height),
        width,
        height
    });
    console.log(walls);
}

const updateWallState = () => {
    walls.forEach((wall) => {
        ctx.fillStyle = "black";
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    })
}

// Util
checkCollision = (objectA, objectB) => {

    let xDiff = getCenterPosition(objectA.x, objectA.width) - getCenterPosition(objectB.x, objectB.width),
        yDiff = getCenterPosition(objectA.y, objectA.height) - getCenterPosition(objectB.y, objectB.height),
        halfWidthCombined = (objectA.width / 2) + (objectB.width / 2),
        halfHeightCombined = (objectA.height / 2) + (objectB.height / 2),
        collisionDirection = null;

    if (Math.abs(xDiff) < halfWidthCombined && Math.abs(yDiff) < halfHeightCombined) {
        let offsetX = halfWidthCombined - Math.abs(xDiff),
            offsetY = halfHeightCombined - Math.abs(yDiff);
        if (offsetX >= offsetY) {
            if (yDiff > 0) {
                collisionDirection = "top";
                objectA.y += offsetY;
            } else {
                collisionDirection = "bottom";
                objectA.y -= offsetY;
            }
        } else {
            if (xDiff > 0) {
                collisionDirection = "left";
                objectA.x += offsetX;
            } else {
                collisionDirection = "right";
                objectA.x -= offsetX;
            }
        }
    }
    return collisionDirection;
}

const offsetCenterPosition = (x, xWidth) => (x - Math.floor(xWidth / 2));
const getCenterPosition = (x, xWidth) => (x + Math.floor(xWidth / 2));

currentImage = idleMainImg;

// Drawing things
const drawMain = (x, y, width, height) => {

    if (player.ground && player.velX === 0) {
        currentImage = idleMainImg;
        ctx.drawImage(idleMainImg, x, y, width, height);
    } 
    else if (player.ground && player.velX > 0) {
        currentImage = walk[walktick];
        ctx.drawImage(walk[walktick], x, y, width, height);
        walktick =(walktick + 1) % 15;
    }
    else if (player.jumping) {
        currentImage = jumpMainImg;
        ctx.drawImage(jumpMainImg, x, y, width, height);
    }
    else {
        // default idle
        ctx.drawImage(currentImage, x, y, width, height);
    }
}


// main update
const update = () => {
    updatePlayerState();
    updateWallState();
    requestAnimationFrame(update);
}

// event listeners

document.body.addEventListener("keydown", (e) => {
    keys[keyActionMapping[e.code]] = true;
});

document.body.addEventListener("keyup", (e) => {
    keys[keyActionMapping[e.code]] = false;
});

document.body.addEventListener("click", (e) => {
    createWall(e.pageX - leftFrameOffset, e.pageY - topFrameOffset, 25, 25);
});

window.addEventListener("load", function () {
    update();
});