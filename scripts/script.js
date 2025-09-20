const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");

let gameOver = false;
let foodX, foodY;
let snakeX = 5; snakeY = 10;
let velocityX = 0; velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;
let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `Highscore: ${highScore}`;

const changeFoodPosition = () => {
  foodX = Math.floor(Math.random() * 30) + 1;
  console.log("Posicion en X:",foodX);
  foodY = Math.floor(Math.random() * 30) + 1;
  console.log("Posicion en Y:",foodY);
}

const handleGameOver = () => {
  clearInterval(setIntervalId);
  alert("Game Over!");
  location.reload();
}

const changeDirection = (e) => {
//console.log(e);
if ((e.key === "ArrowUp" || e.key === "w") && velocityY !== 1) {
  velocityX = 0;
  velocityY = -1;
} else if ((e.key === "ArrowDown" || e.key === "s") && velocityY !== -1) {
  velocityX = 0;
  velocityY = 1;
} else if ((e.key === "ArrowLeft" || e.key === "a") && velocityX !== 1) {
  velocityX = -1;
  velocityY = 0;
} else if ((e.key === "ArrowRight" || e.key === "d") && velocityX !== -1) {
  velocityX = 1;
  velocityY = 0;
}
//initGame();
}

const initGame = () => {
  if (gameOver) return handleGameOver();
  let htmlMarkUp = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

  if(snakeX === foodX && snakeY === foodY){
    changeFoodPosition();
    snakeBody.push([foodX, foodY]);
    console.log(snakeBody);
    score ++;

    highScore = score >= highScore ? score : highScore;
    localStorage.setItem("high-score", highScore);
    highScoreElement.innerText = `Highscore: ${highScore}`;
    scoreElement.innerText = `Score: ${score}`;
    
   

  }

  for(let i = snakeBody.length - 1; i > 0; i--){
    snakeBody[i] = snakeBody[i - 1];
  }

  snakeBody[0] = [snakeX, snakeY];

  snakeX += velocityX;
  snakeY += velocityY;

  if(snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30){
    console.log("Game Over!");
    gameOver = true;
  }


  for(let i = 0; i < snakeBody.length; i++){
    htmlMarkUp += `<div class="head" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
    if(i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]){
      gameOver = true;
    }
  }
  playBoard.innerHTML = htmlMarkUp;
}

changeFoodPosition();
//initGame();
setIntervalId = setInterval(initGame, 125);
document.addEventListener("keydown", changeDirection);