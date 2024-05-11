import { PelletManager } from "./pelletManager.js";
import { MazeManager } from "./mazeManager.js";
import { cellSize } from "./setup";

describe("PelletManager", () => {
  let ctx, mazeManager, pelletManager;
  // 2 - pellet, 4 - power pellet
  const maze = [
    [1, 0, 2],
    [0, 3, 4],
    [5, 1, 6],
  ];

  beforeEach(() => {
    ctx = {
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      fillStyle: null,
    };
    mazeManager = new MazeManager(maze);
    pelletManager = new PelletManager(ctx, mazeManager, cellSize);
  });

  test("should initialize with two pellets", () => {
    expect(pelletManager.pelletCount).toBe(2);
  });

  test("reset should reinitialize the pellet count", () => {
    pelletManager.pelletCount--;
    pelletManager.reset();
    expect(pelletManager.pelletCount).toBe(2);
  });

  test("drawPellet should draw a pellet at the correct canvas location with the given radius", () => {
    const x = 1,
      y = 1,
      radius = 10;
    pelletManager.drawPellet(x, y, radius);
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalledWith(
      x * cellSize + pelletManager.cellCenter,
      y * cellSize + pelletManager.cellCenter,
      radius,
      0,
      2 * Math.PI
    );
    expect(ctx.fill).toHaveBeenCalled();
  });

  test("draw should draw all pellets on the canvas", () => {
    pelletManager.draw();
    expect(ctx.arc).toHaveBeenCalledTimes(2);
  });
});
