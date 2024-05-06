import { WallManager } from "./wallManager.js";
import { MazeManager } from "./mazeManager.js";
import { GameStateDisplay } from "./gameStateDisplay.js";
import { PelletManager } from "./pelletManager.js";

export const cellSize = 20;

/**
 * 0 - empty
 * 1 - wall
 * 2 - pellet
 * 3 - ghost lair
 * 4 - power pellet
 * 5 - ghost lair door
 * 6 - invisible wall
 */
const maze = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 4, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 4, 1],
  [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 5, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 2, 0, 0, 1, 6, 3, 6, 1, 0, 0, 2, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 2, 1, 0, 1, 3, 3, 3, 1, 0, 1, 2, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
  [1, 4, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 4, 1],
  [1, 1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

function initializeCanvas() {
  const backgroundCanvas = document.getElementById("backgroundCanvas");
  const gameCanvas = document.getElementById("gameCanvas");
  const bgCtx = backgroundCanvas.getContext("2d");
  const gameCtx = gameCanvas.getContext("2d");

  backgroundCanvas.width = gameCanvas.width = 420;
  backgroundCanvas.height = gameCanvas.height = 460;

  return { bgCtx, gameCtx, gameCanvas };
}

export function setupGameEnvironment() {
  const { bgCtx, gameCtx, gameCanvas } = initializeCanvas();

  const mazeManager = new MazeManager(maze);
  const gameStateDisplay = new GameStateDisplay();
  const pelletManager = new PelletManager(gameCtx, mazeManager, cellSize);

  const wallManager = new WallManager(bgCtx, mazeManager, cellSize);
  wallManager.draw();

  gameStateDisplay.updateLifeIcons();

  return { gameCtx, gameCanvas, mazeManager, gameStateDisplay, pelletManager };
}

export function loadImages() {
  const imageDetails = [
    { id: "pacman_opened", src: "assets/pacman_opened.png" },
    { id: "pacman_closed", src: "assets/pacman_closed.png" },
    { id: "pinky", src: "assets/pinky.png" },
    { id: "inky", src: "assets/inky.png" },
    { id: "blinky", src: "assets/blinky.png" },
    { id: "clyde", src: "assets/clyde.png" },
    { id: "frightened_blue", src: "assets/frightened_blue.png" },
    { id: "frightened_white", src: "assets/frightened_white.png" },
  ];

  let loadedImages = 0;
  let totalImages = imageDetails.length;
  let images = {};

  return new Promise((resolve, reject) => {
    imageDetails.forEach((detail) => {
      const img = new Image();
      img.onload = () => {
        images[detail.id] = img;
        loadedImages++;
        if (loadedImages === totalImages) {
          resolve(images);
        }
      };
      img.onerror = reject;
      img.src = detail.src;
    });
  });
}
