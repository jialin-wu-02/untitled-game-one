(function() {
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

var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    elemLeft = canvas.offsetLeft,
    elemTop = canvas.offsetTop,
    width = 1000,
    height = 500,
    goal = {
        positions: [
            [240, 180]
        ],
        width : 20,
        height : 20,
    }
    walls = {
        positions: [
            [200, 200],
            [220, 200],
            [240, 200],
            [260, 200],
            [280, 200],
        ],
        width : 20,
        height : 20,
    },
    player = {
      x : width / 2,
      y : height - 5,
      width : 20,
      height : 20,
      speed: 4,
      velX: 0,
      velY: 0,
      jumping: false
    },
    keys = {
        left: false,
        right: false,        
        up: false,
        down: false,
    },
    friction = 0.8,
    gravity = 0.3;


canvas.width = width;
canvas.height = height;

const updatePlayerUpAction = () => {
    if (!player.jumping) {
        player.jumping = true;
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

    prevPlayerX = player.x;
    prevPlayerY = player.y;
       
    player.velX *= friction;
   
    player.velY += gravity;
  
    player.x += player.velX;
    player.y += player.velY;
    
    if (player.x >= width - player.width) {
        player.x = width - player.width;
    } else if (player.x <= 0) {
        player.x = 0;
    }
  
    if (player.y >= height - player.height){
        player.y = height - player.height;
        player.jumping = false;
    }
  
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "red";
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

const createWall = (xVal, yVal) => {
    console.log(xVal, yVal);
    // TODO:
    // 1. frame the click within the "20 * 20 grid".
    // 2. make sure that the square created is centered.
    walls.positions.push([xVal, yVal]);
}

const updateWallState = () => {
    walls.positions.forEach((position) => {
        ctx.fillStyle = "black";
        ctx.fillRect(position[0], position[1], walls.width, walls.height);
    })
}

const updateGoalState = () => {
    goal.positions.forEach((position) => {
        ctx.fillStyle = "blue";
        ctx.fillRect(position[0], position[1], walls.width, walls.height);
    })
}

const update = () => {

    if (keys.up) {
        updatePlayerUpAction();
    }
    if (keys.right) {
        updatePlayerRightAction();
    }
    if (keys.left) {
        updatePlayerleftAction();
    }

    updatePlayerState();
    updateWallState();
    updateGoalState();
    requestAnimationFrame(update);
}

document.body.addEventListener("keydown", (e) => {
    keys[keyActionMapping[e.code]] = true;
});

document.body.addEventListener("keyup", (e) => {
    keys[keyActionMapping[e.code]] = false;
});

document.body.addEventListener("click", (e) => {
    var xVal = e.pageX - elemLeft;
    var yVal = e.pageY - elemTop;
    createWall(xVal, yVal);
});


window.addEventListener("load", () => {
    update();
});