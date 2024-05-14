/**
 * @jest-environment jsdom
 */
import { setupGameEnvironment, loadImages, cellSize } from "./setup.js";
import { Game } from "./main.js";

jest.mock("./setup.js", () => {
  const MockImage = () => ({
    onload: jest.fn(),
    onerror: jest.fn(),
    src: "",
  });

  return {
    setupGameEnvironment: jest.fn().mockReturnValue({
      mazeManager: {
        resetMaze: jest.fn(),
        getMazeWidth: jest.fn(),
        isWalkable: jest.fn(),
        hasPellet: jest.fn(),
        hasPowerPellet: jest.fn(),
        clearPellet: jest.fn(),
      },
      gameCtx: {
        clearRect: jest.fn(),
        fillRect: jest.fn(),
        fillText: jest.fn(),
        measureText: jest.fn(() => ({ width: 100 })),
        drawImage: jest.fn(),
      },
      gameCanvas: {
        width: 800,
        height: 600,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        style: jest.fn(() => ({ cursor: "default" })),
        getBoundingClientRect: jest.fn(),
      },
      gameStateDisplay: {
        reset: jest.fn(),
        updateScore: jest.fn(),
        pelletScore: 1,
        powerPelletScore: 10,
        decrementLives: jest.fn(),
      },
      pelletManager: { reset: jest.fn(), draw: jest.fn() },
    }),
    loadImages: jest.fn().mockResolvedValue({
      pacman_opened: MockImage(),
      pacman_closed: MockImage(),
    }),
    cellSize: 20,
  };
});

jest.mock("./pacman.js", () => ({
  Pacman: jest.fn().mockImplementation(() => ({
    draw: jest.fn(),
    update: jest.fn(),
    position: { x: 2, y: 2 },
    reset: jest.fn(),
  })),
}));

jest.mock("./ghosts.js", () => ({
  GhostManager: jest.fn().mockImplementation(() => ({
    draw: jest.fn(),
    update: jest.fn(),
    frighten: jest.fn(),
    ghosts: Array.from({ length: 3 }, () => ({
      reset: jest.fn(),
      position: { x: 1, y: 1 },
    })),
  })),
  Ghost: jest.fn().mockImplementation(() => ({
    reset: jest.fn(),
    position: { x: 1, y: 1 },
  })),
}));

describe("Game", () => {
  let game;

  beforeEach(() => {
    jest.useFakeTimers();
    global.requestAnimationFrame = jest.fn((cb) => {
      setTimeout(cb, 16);
    });
    global.cancelAnimationFrame = jest.fn();

    game = new Game();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test("constructor should initialize game environment and load images", () => {
    expect(setupGameEnvironment).toHaveBeenCalled();
    expect(loadImages).toHaveBeenCalled();
  });

  test("initializeGame should set up Pacman, Ghosts, and reset game state", async () => {
    await game.initializeGame();
    expect(game.pacman).toBeDefined();
    expect(game.ghosts).toBeDefined();
    expect(game.ghostManager).toBeDefined();
    expect(game.gameStateDisplay.reset).toHaveBeenCalled();
    expect(game.mazeManager.resetMaze).toHaveBeenCalled();
    expect(game.pelletManager.reset).toHaveBeenCalled();
  });

  test("drawInitialGameState should clear the canvas and draw all game components", () => {
    game.drawInitialGameState();
    expect(game.gameCtx.clearRect).toHaveBeenCalledWith(
      0,
      0,
      game.gameCanvas.width,
      game.gameCanvas.height
    );
    expect(game.pelletManager.draw).toHaveBeenCalled();
    expect(game.pacman.draw).toHaveBeenCalled();
    expect(game.ghostManager.draw).toHaveBeenCalled();
  });

  test("startGame should cancel any previous animation frames and start the game loop", () => {
    jest.spyOn(window, "cancelAnimationFrame");
    jest.spyOn(game, "gameLoop");

    game.requestId = 123;
    game.startGame();
    expect(cancelAnimationFrame).toHaveBeenCalledWith(123);
    expect(game.lastUpdateTime).toBeNull();
    expect(game.gameLoop).toHaveBeenCalled();
  });

  test("gameLoop should request a new animation frame", () => {
    jest.spyOn(game, "update");
    jest.spyOn(window, "requestAnimationFrame");

    game.gameLoop();
    expect(requestAnimationFrame).toHaveBeenCalled();
    jest.runOnlyPendingTimers();
    expect(game.update).toHaveBeenCalled();
  });

  describe("update", () => {
    beforeEach(() => {
      jest.spyOn(game.gameCtx, "clearRect");
      jest.spyOn(game.pelletManager, "draw");
      jest.spyOn(game.pacman, "update");
      jest.spyOn(game.ghostManager, "update");
      jest.spyOn(game, "updatePacmanPosition");
      jest.spyOn(game, "checkCollisionWithGhosts");
      jest.spyOn(game, "displayGameOver");
      game.gameStateDisplay.lives = 3;
      game.pelletManager.pelletCount = 20;
    });

    test("should update game state and re-trigger game loop if game continues", () => {
      const timestamp = Date.now();
      game.update(timestamp);
      expect(game.gameCtx.clearRect).toHaveBeenCalledWith(
        0,
        0,
        game.gameCanvas.width,
        game.gameCanvas.height
      );
      expect(game.pelletManager.draw).toHaveBeenCalled();
      expect(game.pacman.update).toHaveBeenCalled();
      expect(game.updatePacmanPosition).toHaveBeenCalled();
      expect(game.ghostManager.update).toHaveBeenCalled();
      expect(game.checkCollisionWithGhosts).toHaveBeenCalled();
      expect(requestAnimationFrame).toHaveBeenCalled();
    });

    test("should cancel the game loop and show game over when all lives are lost", () => {
      game.gameStateDisplay.lives = -1; // Game over condition
      game.update(Date.now());
      expect(cancelAnimationFrame).toHaveBeenCalledWith(game.requestId);
      expect(game.displayGameOver).toHaveBeenCalled();
    });

    test("should cancel the game loop and show game over when all pellets are collected", () => {
      game.pelletManager.pelletCount = 0; // Game over condition
      game.update(Date.now());
      expect(cancelAnimationFrame).toHaveBeenCalledWith(game.requestId);
      expect(game.displayGameOver).toHaveBeenCalled();
    });
  });

  test("restartGame should reset all components and prepare the game for a restart", () => {
    jest.spyOn(window, "cancelAnimationFrame");

    jest.spyOn(game.gameCanvas, "removeEventListener");
    jest.spyOn(game.pacman, "reset");
    jest.spyOn(game.mazeManager, "resetMaze");
    jest.spyOn(game.pelletManager, "reset");
    jest.spyOn(game.gameStateDisplay, "reset");
    jest.spyOn(game, "drawInitialGameState");
    jest.spyOn(game, "startGame");

    game.restartGame();

    expect(cancelAnimationFrame).toHaveBeenCalledWith(game.requestId);
    expect(game.gameCanvas.removeEventListener).toHaveBeenCalledWith(
      "click",
      game.clickListener
    );
    expect(game.gameCanvas.removeEventListener).toHaveBeenCalledWith(
      "mousemove",
      game.mouseMoveListener
    );
    expect(game.pacman.reset).toHaveBeenCalled();
    expect(
      game.ghosts.forEach((ghost) => expect(ghost.reset).toHaveBeenCalled())
    );
    expect(game.mazeManager.resetMaze).toHaveBeenCalled();
    expect(game.pelletManager.reset).toHaveBeenCalled();
    expect(game.gameStateDisplay.reset).toHaveBeenCalled();
    expect(game.drawInitialGameState).toHaveBeenCalled();

    jest.advanceTimersByTime(2000);
    expect(game.startGame).toHaveBeenCalled();
  });

  test("updatePacmanPosition should update the stored position of Pacman", () => {
    const newX = 5;
    const newY = 10;
    game.updatePacmanPosition(newX, newY);
    expect(game.pacmanPosition).toEqual({ x: newX, y: newY });
  });

  describe("handleEatPellet", () => {
    beforeEach(() => {
      jest.spyOn(game.mazeManager, "hasPellet").mockReturnValue(false);
      jest.spyOn(game.mazeManager, "hasPowerPellet").mockReturnValue(false);
      jest.spyOn(game.mazeManager, "clearPellet");
      jest.spyOn(game.gameStateDisplay, "updateScore");
      jest.spyOn(game.ghostManager, "frighten");
      game.pelletManager.pelletCount = 20;
    });

    test("should handle eating a regular pellet", () => {
      const position = { x: 1, y: 1 };

      game.mazeManager.hasPellet.mockReturnValue(true);
      game.handleEatPellet(position);

      expect(game.mazeManager.clearPellet).toHaveBeenCalledWith(
        position.x,
        position.y
      );
      expect(game.pelletManager.pelletCount).toBe(19);
      expect(game.gameStateDisplay.updateScore).toHaveBeenCalledWith(
        game.gameStateDisplay.pelletScore
      );
    });

    test("should handle eating a power pellet and frighten ghosts", () => {
      const position = { x: 2, y: 2 };
      game.mazeManager.hasPowerPellet.mockReturnValue(true);
      game.handleEatPellet(position);

      expect(game.mazeManager.clearPellet).toHaveBeenCalledWith(
        position.x,
        position.y
      );
      expect(game.pelletManager.pelletCount).toBe(19);
      expect(game.gameStateDisplay.updateScore).toHaveBeenCalledWith(
        game.gameStateDisplay.powerPelletScore
      );
      expect(game.ghostManager.frighten).toHaveBeenCalled();
    });
  });

  test("createGhosts should create ghosts with correct configurations", () => {
    const ghostModule = require("./ghosts.js");
    Ghost = ghostModule.Ghost; // Reset 'Ghost' mock's call count as it is called in initializeGame() when game is created
    Ghost.mockClear();
    const ghosts = game.createGhosts();

    expect(ghosts.length).toBe(4);
    expect(Ghost).toHaveBeenCalledTimes(4);
    expect(Ghost).toHaveBeenCalledWith(
      "blinky",
      game.gameCtx,
      game.mazeManager,
      cellSize,
      expect.any(Array),
      { position: { x: 10, y: 8 } }
    );
    expect(Ghost).toHaveBeenCalledWith(
      "inky",
      game.gameCtx,
      game.mazeManager,
      cellSize,
      expect.any(Array),
      { position: { x: 9, y: 11 } }
    );
    expect(Ghost).toHaveBeenCalledWith(
      "pinky",
      game.gameCtx,
      game.mazeManager,
      cellSize,
      expect.any(Array),
      { position: { x: 10, y: 11 } }
    );
    expect(Ghost).toHaveBeenCalledWith(
      "clyde",
      game.gameCtx,
      game.mazeManager,
      cellSize,
      expect.any(Array),
      { position: { x: 11, y: 11 } }
    );
  });

  test("checkCollisionWithGhosts should detect and handle collisions correctly", () => {
    game.collisionCooldown = 0;
    game.pacman = { position: { x: 10, y: 10 } };
    game.ghosts = [
      { position: { x: 10, y: 10.5 } }, // Within collision distance
      { position: { x: 20, y: 20 } }, // Outside collision distance
    ];
    jest.spyOn(game, "handleCollisionWithGhost");

    game.checkCollisionWithGhosts();
    expect(game.handleCollisionWithGhost).toHaveBeenCalledWith(game.ghosts[0]);
    expect(game.handleCollisionWithGhost).not.toHaveBeenCalledWith(
      game.ghosts[1]
    );
  });

  describe("handleCollisionWithGhost", () => {
    test("should decrement lives and reset positions if ghost is not frightened", () => {
      const ghost = { mode: "chase", reset: jest.fn() };
      game.handleCollisionWithGhost(ghost);
      expect(game.gameStateDisplay.decrementLives).toHaveBeenCalled();
      expect(game.pacman.reset).toHaveBeenCalled();
      game.ghosts.forEach((ghost) => expect(ghost.reset).toHaveBeenCalled());
    });

    test("should only reset ghost if frightened", () => {
      const ghost = { mode: "frighten", reset: jest.fn() };
      game.handleCollisionWithGhost(ghost);
      expect(game.gameStateDisplay.decrementLives).not.toHaveBeenCalled();
      expect(game.pacman.reset).not.toHaveBeenCalled();
      expect(ghost.reset).toHaveBeenCalled();
    });
  });

  test("displayGameOver should display game over screen and setup button", () => {
    jest.spyOn(game.gameCtx, "fillRect");
    jest.spyOn(game.gameCtx, "fillText");
    jest.spyOn(game, "setupRestartButton");

    game.displayGameOver();

    // Check that fillRect was called immediately after setting fillStyle to rgba
    expect(game.gameCtx.fillRect).toHaveBeenCalledWith(
      0,
      0,
      game.gameCanvas.width,
      game.gameCanvas.height
    );
    expect(game.gameCtx.fillStyle).toBe("white"); // Last known state

    expect(game.gameCtx.fillText).toHaveBeenCalledWith(
      "Game Over",
      game.gameCanvas.width / 2,
      game.gameCanvas.width / 2
    );
    expect(game.gameCtx.fillText).toHaveBeenCalledWith(
      "Click to restart",
      game.gameCanvas.width / 2,
      game.gameCanvas.width / 2 + 50
    );

    expect(game.setupRestartButton).toHaveBeenCalled();
  });

  test("setupRestartButton should setup button and handle click events correctly", () => {
    jest.spyOn(game, "restartGame");

    const mockEvent = {
      clientX: 460,
      clientY: 440,
    };
    const rect = {
      left: 100,
      top: 100,
    };
    jest.spyOn(game.gameCanvas, "getBoundingClientRect").mockReturnValue(rect);

    game.setupRestartButton(
      game.gameCanvas.width / 2,
      game.gameCanvas.height / 2,
      "Click to restart"
    );

    expect(game.gameCanvas.addEventListener).toHaveBeenCalledWith(
      "click",
      expect.any(Function)
    );
    expect(game.gameCanvas.addEventListener).toHaveBeenCalledWith(
      "mousemove",
      expect.any(Function)
    );

    // Simulate a click within the button area
    game.clickListener(mockEvent);
    expect(game.restartGame).toHaveBeenCalled();

    // Simulate mouse movement over the button
    game.mouseMoveListener(mockEvent);
    expect(game.gameCanvas.style.cursor).toBe("pointer");
  });

  test("bindEvents should add keydown event listener to window", () => {
    jest.spyOn(window, "addEventListener");

    game.bindEvents();
    expect(window.addEventListener).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
  });

  describe("handleKeyDown", () => {
    beforeEach(() => {
      game.pacman = { nextDirection: null };
      jest.spyOn(Event.prototype, "preventDefault");
    });

    test("should handle ArrowLeft to move Pacman left", () => {
      const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
      game.handleKeyDown(event);
      expect(game.pacman.nextDirection).toBe("LEFT");
      expect(event.preventDefault).toHaveBeenCalled();
    });

    test("should handle ArrowRight to move Pacman right", () => {
      const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
      game.handleKeyDown(event);
      expect(game.pacman.nextDirection).toBe("RIGHT");
      expect(event.preventDefault).toHaveBeenCalled();
    });

    test("should handle ArrowUp to move Pacman up", () => {
      const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
      game.handleKeyDown(event);
      expect(game.pacman.nextDirection).toBe("UP");
      expect(event.preventDefault).toHaveBeenCalled();
    });

    test("should handle ArrowDown to move Pacman down", () => {
      const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
      game.handleKeyDown(event);
      expect(game.pacman.nextDirection).toBe("DOWN");
      expect(event.preventDefault).toHaveBeenCalled();
    });

    test("should ignore other keys", () => {
      const event = new KeyboardEvent("keydown", { key: "A" });
      game.handleKeyDown(event);
      expect(game.pacman.nextDirection).toBeNull();
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });
});
