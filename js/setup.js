import { WallManager } from "./wallManager.js";
import { MazeManager } from "./mazeManager.js";
import { GameStateDisplay } from "./gameStateDisplay.js";
import { PelletManager } from "./pelletManager.js";

export const cellSize = 20;

export const imageDetails = [
  { id: "pacman_opened", src: "assets/pacman_opened.png" },
  { id: "pacman_closed", src: "assets/pacman_closed.png" },
  { id: "pinky", src: "assets/pinky.png" },
  { id: "inky", src: "assets/inky.png" },
  { id: "blinky", src: "assets/blinky.png" },
  { id: "clyde", src: "assets/clyde.png" },
  { id: "frightened_blue", src: "assets/frightened_blue.png" },
  { id: "frightened_white", src: "assets/frightened_white.png" },
];

export let pacmanImages = [];
export let ghostDetails = [];

let ghostImages = {};

export function loadImages(callback) {
  let loadedImages = 0;
  let totalImages = imageDetails.length;

  function imageLoaded() {
    loadedImages++;
    if (loadedImages === totalImages) {
      callback(); // Call the start game function once all images are loaded
    }
  }

  imageDetails.forEach((detail) => {
    const img = new Image();
    img.onload = imageLoaded;
    img.src = detail.src;
    if (detail.id.includes("pacman")) {
      pacmanImages.push(img);
    } else {
      ghostImages[detail.id] = img;
    }
  });

  ghostDetails = [
    { name: "inky", position: { x: 9, y: 11 }, image: ghostImages["inky"] },
    { name: "pinky", position: { x: 10, y: 11 }, image: ghostImages["pinky"] },
    { name: "clyde", position: { x: 11, y: 11 }, image: ghostImages["clyde"] },
    { name: "blinky", position: { x: 10, y: 8 }, image: ghostImages["blinky"] },
  ];
}

// 0 - empty
// 1 - wall
// 2 - pellet
// 3 - ghost lair
// 4 - power pellet
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

let mazeManager;
let gameStateDisplay;
let pelletManager;

function initializeCanvas() {
  const backgroundCanvas = document.getElementById("backgroundCanvas");
  const gameCanvas = document.getElementById("gameCanvas");
  const bgCtx = backgroundCanvas.getContext("2d");
  const gameCtx = gameCanvas.getContext("2d");

  backgroundCanvas.width = gameCanvas.width = 420;
  backgroundCanvas.height = gameCanvas.height = 460;

  return { bgCtx, gameCtx, gameCanvas };
}

function setupBackground(bgCtx, mazeManager, cellSize) {
  const wallManager = new WallManager(bgCtx, mazeManager, cellSize);
  wallManager.draw();
}

export function setupGameEnvironment() {
  const { bgCtx, gameCtx, gameCanvas } = initializeCanvas();
  mazeManager = new MazeManager(maze);
  gameStateDisplay = new GameStateDisplay();
  pelletManager = new PelletManager(gameCtx, mazeManager, cellSize);
  setupBackground(bgCtx, mazeManager, cellSize);
  gameStateDisplay.updateLifeIcons();

  return {
    mazeManager,
    gameStateDisplay,
    pelletManager,
    gameCtx,
    gameCanvas,
  };
}
