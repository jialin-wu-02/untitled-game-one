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

// load character pictures
const idleMainImg = new Image(),
    jumpMainImg = new Image(),
    flipIdleMainImg = new Image(),
    flipJumpMainImg = new Image(),
    deadMainImg = new Image();
idleMainImg.src = 'assest/flat-boi/Idle.png';
jumpMainImg.src = 'assest/flat-boi/Jump.png';
deadMainImg.src = 'assest/flat-boi/Dead.png';

flipIdleMainImg.src = 'assest/flat-boi/Idle_flip.png';
flipJumpMainImg.src = 'assest/flat-boi/Jump_flip.png';

// load crate pictures
const crateImage = new Image();
crateImage.src = 'assest/flat-stuff/Object/Crate.png';

// load background picture
const backgroundImg = new Image();
backgroundImg.src = 'assest/flat-stuff/BG/BG.png';

let walk = [];
let walkflip = [];

let walktick = 0; // cycle from 0 to 15. 

for (let i = 1; i < 16; i++) {
    walk[i - 1] = new Image();
    walk[i - 1].src = 'assest/flat-boi/Walk_' + i + '.png';
    walkflip[i - 1] = new Image();
    walkflip[i - 1].src = 'assest/flat-boi/Walk_' + i + '_flip.png';
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
        width: 40,
        height: 65,
        speed: 5,
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
    gravity = 0.4;

var crates = [];

// create frames
crates.push({
    x: 0,
    y: 0,
    width: 2,
    height: height
});
crates.push({
    x: 0,
    y: height - 2,
    width: width,
    height: 50
});
crates.push({
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
    console.log("velY: ", player.velY);
    console.log("speed: ", player.speed);
    
}

const updatePlayerRightAction = () => {
    player.facing = "right";
    if (player.velX < player.speed) {
        player.velX++;
    }
}

const updatePlayerleftAction = () => {
    player.facing = "left";
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
    for (let crate of crates) {
        
        var dir = checkCollision(player, crate);

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
    ctx.drawImage(backgroundImg, 0, 0, width, height);
    drawMain(player.x, player.y, player.width, player.height);
}

// crate Functions

const createcrate = (xVal, yVal, width, height) => {
    crates.push({
        x: offsetCenterPosition(xVal, width),
        y: offsetCenterPosition(yVal, height),
        width,
        height
    });
}

const drawcrates = () => {
    crates.forEach((crate) => {
        ctx.drawImage(crateImage, crate.x, crate.y, crate.width, crate.height);
    })
}

// Util
const checkCollision = (objectA, objectB) => {

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

let currentImage = idleMainImg;

// Drawing things
const drawMain = (x, y, width, height) => {
    walkpointer = walk;
    idlepointer = idleMainImg;
    jumppointer = jumpMainImg;
    if (player.facing === "left") {
        // right as default
        walkpointer = walkflip;
        idlepointer = flipIdleMainImg;
        jumppointer = flipJumpMainImg;
    }

    if (player.ground && player.velX === 0) {
        currentImage = idlepointer;
        ctx.drawImage(idlepointer, x, y, width, height);
    } 
    else if (player.ground && Math.abs(player.velX) > 0) {
        currentImage = walkpointer[walktick];
        ctx.drawImage(walkpointer[walktick], x, y, width, height);
        walktick = (walktick + 1) % 15;
    }
    else if (player.jumping) {
        console.log(player);
        currentImage = jumppointer;
        ctx.drawImage(jumppointer, x, y, width + 5, height);
    }
    else {
        // default idle
        ctx.drawImage(currentImage, x, y, width, height);
    }
}

let gameReset = false;

// main update
const update = () => {
    if (gameReset) {
        return null;
    }
    updatePlayerState();
    drawcrates();
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
    createcrate(e.pageX - leftFrameOffset, e.pageY - topFrameOffset, 40, 40);
});

// update();

// reset functions
// reset everything, including crates created and character's position
const resetGame = () => {
    gameReset = true;
    player.x = width / 2;
    player.y = height - 100;
    player.velX = 0;
    player.velY = 0;
    player.jumping = false;
    player.ground = false;
    player.facing = "right";

    crates = [];
    // create frames
    crates.push({
        x: 0,
        y: 0,
        width: 2,
        height: height
    });
    crates.push({
        x: 0,
        y: height - 2,
        width: width,
        height: 50
    });
    crates.push({
        x: width - 2,
        y: 0,
        width: 2,
        height: height
    });
    gameReset = false;
    requestAnimationFrame(update);
}