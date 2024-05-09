import { Ghost } from "./ghosts";
import { MazeManager } from "./mazeManager";
import { cellSize } from "./setup";

function createMockImage(src) {
  return {
    src: src,
    onload: jest.fn(),
    onerror: jest.fn(),
  };
}

describe("reset", () => {
  it("should reset properties to their initial values", () => {
    const images = [createMockImage("path/to/ghost.png")];
    const ghost = new Ghost("blinky", null, null, cellSize, images, {
      position: { x: 3, y: 3 },
    });
    ghost.reset();
    expect(ghost.position).toEqual(ghost.initialPosition);
    expect(ghost.mode).toBe("random");
    expect(ghost.lastDirection.dx).toBe(0);
    expect(ghost.lastDirection.dy).toBe(0);
  });
});

describe("Ghost movement", () => {
  test("should only move to valid positions", () => {
    const mockMaze = [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
    ];

    const mazeManager = new MazeManager(mockMaze);
    const images = [createMockImage("path/to/ghost.png")];
    const ghost = new Ghost("blinky", null, mazeManager, cellSize, images, {
      position: { x: 3, y: 3 },
    });

    const tries = 20;
    for (let i = 0; i < tries; i++) {
      ghost.chooseRandomDirection();
      let ghostGridPosX = Math.floor(ghost.position.x / cellSize);
      let ghostGridPosY = Math.floor(ghost.position.y / cellSize);

      expect(mazeManager.hasWall(ghostGridPosX, ghostGridPosY)).toBe(false);
    }
  });

  test("should not move to invalid position", () => {
    const mockMaze = [
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
    ];
    const mazeManager = new MazeManager(mockMaze);
    const images = [createMockImage("path/to/ghost.png")];
    const ghost = new Ghost("blinky", null, mazeManager, cellSize, images, {
      position: { x: 1, y: 1 },
    });

    const tries = 20;
    for (let i = 0; i < tries; i++) {
      ghost.chooseRandomDirection();
      let ghostGridPosX = Math.floor(ghost.position.x / cellSize);
      let ghostGridPosY = Math.floor(ghost.position.y / cellSize);

      expect(ghostGridPosX).toBe(1);
      expect(ghostGridPosY).toBe(1);
    }
  });

  test("moves left correctly from position 0,1 to 1,1 wrapping around", () => {
    const mockMaze = [
      [1, 1],
      [0, 0],
      [1, 1],
    ];
    const mazeManager = new MazeManager(mockMaze);
    const images = [createMockImage("path/to/ghost.png")];
    const ghost = new Ghost("blinky", null, mazeManager, cellSize, images, {
      position: { x: 0, y: 1 },
    });

    ghost.lastDirection = { dx: -1 * ghost.velocity, dy: 0 };
    ghost.chooseRandomDirection();

    let ghostGridPosX = Math.floor(ghost.position.x / cellSize);
    let ghostGridPosY = Math.floor(ghost.position.y / cellSize);

    expect(ghostGridPosX).toBe(1);
    expect(ghostGridPosY).toBe(1);
  });

  test("moves right correctly from position {maze width},1 to 0,1 wrapping around", () => {
    const mockMaze = [
      [1, 1],
      [0, 0],
      [1, 1],
    ];
    const mazeManager = new MazeManager(mockMaze);

    // Place ghost at the very edge of the maze using maze width
    const images = [createMockImage("path/to/ghost.png")];
    const ghost = new Ghost("blinky", null, mazeManager, cellSize, images, {
      position: { x: mazeManager.getMazeWidth(), y: 1 },
    });

    ghost.lastDirection = { dx: 1 * ghost.velocity, dy: 0 };
    ghost.chooseRandomDirection();

    let ghostGridPosX = Math.floor(ghost.position.x / cellSize);
    let ghostGridPosY = Math.floor(ghost.position.y / cellSize);

    expect(ghostGridPosX).toBe(0);
    expect(ghostGridPosY).toBe(1);
  });

  describe("should not reverse the current direction if path is clear", () => {
    const mockMaze = [
      [1, 1, 1, 1],
      [1, 0, 0, 1],
      [1, 0, 0, 1],
      [1, 1, 1, 1],
    ];
    const images = [createMockImage("path/to/ghost.png")];
    const mazeManager = new MazeManager(mockMaze);
    let ghost;

    beforeEach(() => {
      ghost = new Ghost("blinky", null, mazeManager, cellSize, images, {
        position: { x: 1, y: 1 },
      });
    });

    test("should not reverse to left when moving right if path is clear", () => {
      ghost.lastDirection = { dx: 1 * ghost.velocity, dy: 0 }; // Initially moving right
      ghost.chooseRandomDirection();
      expect(ghost.lastDirection.dx).not.toBe(-1 * ghost.velocity); // Should not choose left
    });

    test("should not reverse to up when moving down if path is clear", () => {
      ghost.lastDirection = { dx: 0, dy: 1 * ghost.velocity }; // Initially moving down
      ghost.chooseRandomDirection();
      expect(ghost.lastDirection.dy).not.toBe(-1 * ghost.velocity); // Should not choose up
    });
  });
});

describe("Ghost drawn", () => {
  test("flips image when moving left", () => {
    const mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      drawImage: jest.fn(),
    };
    const images = [createMockImage("path/to/ghost.png")];
    const ghost = new Ghost("blinky", mockCtx, null, cellSize, images, {
      position: { x: 1, y: 1 },
    });

    ghost.lastDirection = { dx: -1 * ghost.velocity, dy: 0 }; // Left
    ghost.draw();

    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.scale).toHaveBeenCalledWith(-1, 1);
    expect(mockCtx.translate).toHaveBeenCalledWith(-60, 0);
    expect(mockCtx.drawImage).toHaveBeenCalledWith(
      ghost.images[0],
      20,
      20,
      cellSize,
      cellSize
    );
    expect(mockCtx.restore).toHaveBeenCalled();
  });
});
