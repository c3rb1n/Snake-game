let circle = function (x, y, radius, fillCircle) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);

    if (fillCircle) {
        ctx.fill();
    } else {
        ctx.stroke();
    }
};

let gameLoop = function () {
    if (stop) {
        gameOver();
        return;
    }
    ctx.clearRect(0, 0, width, height);
    snake.move();
    snake.draw();
    apple.draw();
    drawScore();
    drawBorder();
    setTimeout(gameLoop, animationTime);
};

let drawBorder = function () {
    ctx.strokeStyle = "Gray";
    ctx.lineWidth = blockSize * 2;
    ctx.strokeRect(0, 0, width, height);
};

let drawScore = function () {
    ctx.font = "20px Courier";
    ctx.fillStyle = "Black";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Счёт: " + score, blockSize, blockSize);
};

let gameOver = function () {
    ctx.font = "60px Courier";
    ctx.fillStyle = "Black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Конец игры", width / 2, height / 2);
};

let getLevelOfDifficultyIndex = function () {
    let levelOfDifficultyIndex = null;
    let levelOfDifficulty = prompt (`Выберите и введите один из трёх уровней сложности: лёгкий, средний или сложный.`, "");

    if (levelOfDifficulty === "лёгкий" || levelOfDifficulty === "легкий") {
        levelOfDifficultyIndex = 0;
    } else if (levelOfDifficulty === "средний") {
        levelOfDifficultyIndex = 1;
    } else if (levelOfDifficulty === "сложный") {
        levelOfDifficultyIndex = 2;
    } else {
        snake.draw();
        apple.draw();
        drawScore();
        drawBorder();
        stop = true;
        return;
    }

    return levelOfDifficultyIndex;
};

class Block {
    constructor(col, row) {
        this.col = col;
        this.row = row;
    };

    drawSquare = color => {
        let x = this.col * blockSize;
        let y = this.row * blockSize;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, blockSize, blockSize);
    };

    drawCircle = color => {
        let centerX = this.col * blockSize + blockSize / 2;
        let centerY = this.row * blockSize + blockSize / 2;
        ctx.fillStyle = color;
        circle(centerX, centerY, blockSize / 2, true);
    };

    equal = otherBlock => {
        return this.col === otherBlock.col && this.row === otherBlock.row;
    };
};

class Snake {
    constructor() {
        this.segments = [
            new Block(7, 5),
            new Block(6, 5),
            new Block(5, 5),
        ];

        this.direction = "right";
        this.nextDirection = "right";
    };

    draw = () => {
        for (let i = 0; i < this.segments.length; i++) {
            if (i === 0) {
                this.segments[i].drawSquare("Green");
            } else if (i % 2 === 0) {
                this.segments[i].drawSquare("LimeGreen");
            } else {
                this.segments[i].drawSquare("Lime");
            }
        }
    };

    move = () => {
        let head = this.segments[0];
        let newHead;

        this.direction = this.nextDirection;

        if (this.direction === "right") {
            newHead = new Block(head.col + 1, head.row);
        } else if (this.direction === "down") {
            newHead = new Block(head.col, head.row + 1);
        } else if (this.direction === "left") {
            newHead = new Block(head.col - 1, head.row);
        } else if (this.direction === "up") {
            newHead = new Block(head.col, head.row - 1);
        }

        if (this.checkCollision(newHead)) {
            stop = true;
            return;
        }

        this.segments.unshift(newHead)

        if (newHead.equal(apple.position)) {
            score++;
            animationTime -= levelOfDifficultyIndex;
            let i = 0;

            while (i < this.segments.length) {
                if (this.segments[i].equal(apple.position)) {
                    apple.move();
                    i = 0;
                } else {
                    i++;
                }
            }
        } else {
            this.segments.pop();
        }
    };

    checkCollision = head => {
        let leftCollision = (head.col === 0);
        let topCollision = (head.row === 0);
        let rightCollision = (head.col === widthInBlocks - 1);
        let bottomCollision = (head.row === heightInBlocks - 1);

        let wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;

        let selfCollision = false;

        for (let i = 0; i < this.segments.length; i++) {
            if (head.equal(this.segments[i])) {
                selfCollision = true;
            }
        }

        return wallCollision || selfCollision;
    };

    setDirection = newDirection => {
        if (this.direction === "up" && newDirection === "down") {
            return;
        } else if (this.direction === "right" && newDirection === "left") {
            return;
        } else if (this.direction === "down" && newDirection === "up") {
            return;
        } else if (this.direction === "left" && newDirection === "right") {
            return;
        }

        this.nextDirection = newDirection;
    };
};

class Apple {
    constructor() {
        this.position = new Block(10, 10);
    };

    draw = () => {
        this.position.drawCircle("Red");
    };

    move = () => {
        let randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
        let randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
        this.position = new Block(randomCol, randomRow);
    };

    equal = otherBlock => {
        return this.col === otherBlock.col && this.row === otherBlock.row;
    };
};

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let width = canvas.width;
let height = canvas.height;

let blockSize = 10;
let widthInBlocks = width / blockSize;
let heightInBlocks = height / blockSize;

let snake = new Snake();
let apple = new Apple();

let score = 0;
let stop = false;
let animationTime = 100;
let levelOfDifficultyIndex = getLevelOfDifficultyIndex();

let directions = {
    37: "left",
    38: "up",
    39: "right",
    40: "down"
};

$("body").keydown(function (event) {
    let newDirection = directions[event.keyCode];
    if (newDirection !== undefined) {
        snake.setDirection(newDirection);
    }
});

gameLoop();