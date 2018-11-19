var body = document.getElementsByTagName('body')[0],
    sides = document.getElementsByClassName('side-cover'),
    canvas = document.getElementById('canvas'),
    playerSpan = document.getElementById('player'),
    headerSpan = document.getElementById('header-text'),
    headerContainer = document.getElementById('header-container'),

    ctx = canvas.getContext("2d"),
    tileWidth = 40,
    tilePaddingO = 8,
    tilePaddingX = 5,
    isBusy = false,
    alpha = 0,
    delta = 0.05,
    numTiles = canvas.width * canvas.height / tileWidth,
    startingTile, endTile, player, turn, tiles,
    players = Object.freeze({ default: "", X: "X", O: "O" }),
    colors = {
        headerColor: "black",
        bodyColor: "#BDBF8F",
        sideBackground: "skyblue",
        canvasBgColor: "#DFD59F",
        borderColor: "#654321",
        xColor: "#8B0000",
        oColor: "#000080"
    };
ctx.lineWidth = 1.5;

resetGame();
redrawPage();

function resetGame() {
    setPlayer(players.X);
    turn = 0;
    headerSpan.innerText = 'Player: ';
    playerSpan.style.visibility = 'visible';

    tiles = new Array(canvas.width / tileWidth);
    for (let i = 0; i < tiles.length; i++) { tiles[i] = new Array(canvas.height / tileWidth).fill(players.default); }
    canvas.onclick = function (e) { put((e.offsetX / tileWidth) | 0, (e.offsetY / tileWidth) | 0); }
    resetCanvas();
}

function resetCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
}

function drawGrid() {
    ctx.fillStyle = colors.borderColor;
    for (let i = 1; i < tiles.length; i++) {
        ctx.fillRect(i * tileWidth, 0, 1.5, canvas.height);
        ctx.fillRect(0, i * tileWidth, canvas.width, 1.5);
    }
}

function put(xPos, yPos) {
    if (isBusy) return;
    if (tiles[yPos][xPos] === players.X || tiles[yPos][xPos] === players.O) return;
    tiles[yPos][xPos] = player;
    player === players.X ? drawX(xPos * tileWidth, yPos * tileWidth) : drawO(xPos * tileWidth, yPos * tileWidth);
    if (checkWinner(xPos, yPos)) endGame(player);
    else togglePlayer();
    if (++turn === numTiles) endGame(null);
}

function setPlayer(value) {
    player = value;
    playerSpan.innerText = player;
}

function togglePlayer() { player === players.X ? setPlayer(players.O) : setPlayer(players.X); }

function drawX(x, y) {
    isBusy = true;
    ctx.strokeStyle = colors.xColor;
    (function draw() {
        ctx.clearRect(x + 2, y + 2, tileWidth - 2, tileWidth - 2);
        ctx.globalAlpha = alpha;
        alpha += delta;
        ctx.beginPath();
        ctx.moveTo(x + tilePaddingX, y + tilePaddingX);
        ctx.lineTo(x + tileWidth - tilePaddingX, y + tileWidth - tilePaddingX);
        ctx.moveTo(x + tileWidth - tilePaddingX, y + tilePaddingX);
        ctx.lineTo(x + tilePaddingX, y + tileWidth - tilePaddingX);
        ctx.stroke();
        if (alpha < 1) requestAnimationFrame(draw);
        else {
            alpha = 0;
            isBusy = false;
            return;
        }
    })();

}

function drawO(x, y) {
    isBusy = true;
    ctx.strokeStyle = colors.oColor;
    (function draw() {
        ctx.clearRect(x + 2, y + 2, tileWidth - 2, tileWidth - 2);
        ctx.globalAlpha = alpha;
        alpha += delta;
        ctx.beginPath();
        ctx.arc(x + tileWidth / 2, y + tileWidth / 2, (tileWidth - tilePaddingO) / 2, 0, 2 * Math.PI);
        ctx.stroke();
        if (alpha < 1) requestAnimationFrame(draw);
        else {
            alpha = 0;
            isBusy = false;
            return;
        }
    })();
}

function checkWinner(x, y) {
    return (
        check(x, y, add, noop)
        || check(x, y, noop, add)
        || check(x, y, add, add)
        || check(x, y, add, sub)
    );
}

function add(a, b) { return a + b; }
function noop(a, _b) { return a; }
function sub(a, b) { return a - b; }

function check(x, y, funcX, funcY) {
    let score = 0;
    for (let i = - 4; i <= 4; i++) {
        let xCurr = funcX(x, i);
        let yCurr = funcY(y, i);
        let tileCurr = { x: xCurr, y: yCurr };
        if (isOut(xCurr, yCurr)) continue;
        if (tiles[yCurr][xCurr] === player) {
            if (score === 0) startingTile = tileCurr;
            if (++score === 5) {
                endTile = tileCurr;
                return true;
            }
        } else score = 0;
    }
    return false;
}

function isOut(x, y) {
    return (
        x < 0
        || y < 0
        || x >= canvas.width / tileWidth
        || y >= canvas.height / tileWidth
    );
}

function endGame(winner) {
    canvas.onclick = null;
    if (winner) {
        setTimeout(() => showWinnerTiles(winner), 300);
        headerSpan.innerText = 'Winner: ';
    }
    else {
        headerSpan.innerText = 'Draw!';
        playerSpan.style.visibility = 'hidden';
    }
}

function showWinnerTiles() {
    subValues = { x: (startingTile.x - endTile.x) / 4, y: (startingTile.y - endTile.y) / 4 };
    for (let i = 0; i < 5; i++) {
        setTimeout(() => colorTile((startingTile.x - subValues.x * i) * tileWidth, (startingTile.y - subValues.y * i) * tileWidth), 100 * i);
    }
}

function colorTile(x, y) {
    ctx.fillStyle = player === players.X ? colors.xColor : colors.oColor;
    let a = 0;
    (function draw() {
        ctx.globalAlpha = a;
        a += 0.01;
        ctx.fillRect(x, y, tileWidth, tileWidth);
        if (a < 0.15) requestAnimationFrame(draw);
        else {
            a = 0;
            return;
        }
    })();
}


function randomizeColors() {
    Object.keys(colors).forEach(key => colors[key] = getRandomColor());
    redrawPage();
}

function redrawPage() {
    if (isBusy) return;
    headerContainer.style.color = colors.headerColor;
    body.style.background = colors.bodyColor;
    sides[0].style.background = colors.sideBackground;
    sides[1].style.background = colors.sideBackground;
    sides[0].style.outlineColor = colors.borderColor;
    sides[1].style.outlineColor = colors.borderColor;
    canvas.style.background = colors.bodyColor;
    canvas.style.borderColor = colors.borderColor;
    drawGrid();
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}