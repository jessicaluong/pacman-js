import {
  cellSize,
  pacmanImages,
  ghostDetails,
  loadImages,
  setupGameEnvironment,
} from "./setup.js";
import { Pacman } from "./pacman.js";
import { Ghost, GhostManager } from "./ghosts.js";

// Game constants
const { mazeManager, gameStateDisplay, pelletManager, gameCtx, gameCanvas } =
  setupGameEnvironment();

// Game variables
let requestId;
let gameOver = false;
let mouseMoveListener;
let clickListener;
let pacman;
let ghosts;
let ghostManager;
let collisionCooldown = 0;

function createPacman() {
  return new Pacman(
    gameCtx,
    mazeManager,
    cellSize,
    { position: { x: 10, y: 13 } },
    handleEatPellet,
    pacmanImages
  );
}

function createGhosts() {
  return ghostDetails.map(
    (ghost) =>
      new Ghost(ghost.name, gameCtx, mazeManager, cellSize, ghost.image, {
        position: { ...ghost.position },
      })
  );
}

const checkGameOver = () =>
  (gameOver = pelletManager.pelletCount === 0 || gameStateDisplay.lives < 0);

function displayGameOver() {
  gameCtx.fillStyle = "rgba(0, 0, 0, 0.5)";
  gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  const xPos = gameCanvas.width / 2;
  const yPos = gameCanvas.width / 2;

  gameCtx.fillStyle = "white";
  gameCtx.textAlign = "center";
  gameCtx.font = "24px 'Roboto Mono', monospace";
  gameCtx.fillText("Game Over", xPos, yPos);

  const buttonText = "Click to restart";
  gameCtx.font = "18px 'Roboto Mono', monospace";
  gameCtx.fillText(buttonText, xPos, yPos + 50);
  const buttonX = xPos - gameCtx.measureText(buttonText).width / 2;
  const buttonY = yPos + 50 - 18;
  const buttonWidth = gameCtx.measureText(buttonText).width;
  const buttonHeight = 24;

  clickListener = function (event) {
    const rect = gameCanvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    const isInsideButton =
      clickX >= buttonX &&
      clickX <= buttonX + buttonWidth &&
      clickY >= buttonY &&
      clickY <= buttonY + buttonHeight;

    if (isInsideButton) {
      restartGame();
    }
  };

  mouseMoveListener = function (event) {
    const rect = gameCanvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const isInsideButton =
      mouseX >= buttonX &&
      mouseX <= buttonX + buttonWidth &&
      mouseY >= buttonY &&
      mouseY <= buttonY + buttonHeight;

    gameCanvas.style.cursor = isInsideButton ? "pointer" : "default";
  };

  gameCanvas.addEventListener("click", clickListener);
  gameCanvas.addEventListener("mousemove", mouseMoveListener);
}

function handleEatPellet(position) {
  let scoreValue = 0;
  if (mazeManager.hasPellet(position.x, position.y)) {
    scoreValue = gameStateDisplay.pelletScore;
  } else if (mazeManager.hasPowerPellet(position.x, position.y)) {
    scoreValue = gameStateDisplay.powerPelletScore;
  }

  if (scoreValue > 0) {
    mazeManager.clearPellet(position.x, position.y);
    pelletManager.pelletCount--;
    gameStateDisplay.updateScore(scoreValue);
  }

  checkGameOver();
}

function checkCollisionWithGhosts() {
  if (collisionCooldown > 0) {
    collisionCooldown--;
    return;
  }
  // If pacman overlaps ghost or vice versa within a tolerance number of pixels
  const tolerance = cellSize / 2;
  ghosts.forEach((ghost) => {
    if (
      Math.abs(pacman.position.x - ghost.position.x) < tolerance &&
      Math.abs(pacman.position.y - ghost.position.y) < tolerance
    ) {
      handleCollisionWithGhost(ghost);
      collisionCooldown = 120;
    }
  });
}

function handleCollisionWithGhost(ghost) {
  if (ghost.mode === "random") {
    // then handle here
    gameStateDisplay.decrementLives();
    // lose life
  } else {
    // ghost frightened
    // ghost go back to original position
  }
}

addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowLeft":
      pacman.nextDirection = "LEFT";
      event.preventDefault();
      break;
    case "ArrowRight":
      pacman.nextDirection = "RIGHT";
      event.preventDefault();
      break;
    case "ArrowUp":
      pacman.nextDirection = "UP";
      event.preventDefault();
      break;
    case "ArrowDown":
      pacman.nextDirection = "DOWN";
      event.preventDefault();
      break;
    case "r":
    case "R":
      restartGame();
      break;
    default:
      break;
  }
});

function restartGame() {
  cancelAnimationFrame(requestId);
  gameCanvas.removeEventListener("click", clickListener);
  gameCanvas.removeEventListener("mousemove", mouseMoveListener);
  gameCanvas.style.cursor = "default";
  gameOver = false;
  initializeGame();
}

function initializeGame() {
  // Create all game components
  pacman = createPacman();
  ghosts = createGhosts();
  ghostManager = new GhostManager(ghosts);
  pelletManager.reset();
  mazeManager.resetMaze();
  gameStateDisplay.reset();

  drawInitialGameState();

  setTimeout(startGame, 1000);
}

function drawInitialGameState() {
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  pelletManager.draw();
  pacman.draw();
  ghostManager.draw();
}

function startGame() {
  cancelAnimationFrame(requestId);
  requestAnimationFrame(animate);
}

function animate() {
  if (gameOver) {
    displayGameOver();
  } else {
    requestId = requestAnimationFrame(animate);
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    pelletManager.draw();
    pacman.update();
    ghostManager.update();
    checkCollisionWithGhosts();
  }
}

loadImages(initializeGame);
