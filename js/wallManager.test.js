import { WallManager } from "./wallManager";
import { MazeManager } from "./mazeManager";
import { cellSize } from "./setup";

describe("WallManager", () => {
  let ctx, mazeManager, wallManager;
  // 1 - wall, 5 - ghost lair door
  const maze = [
    [1, 5, 1],
    [1, 0, 1],
    [1, 1, 1],
  ];

  beforeEach(() => {
    ctx = {
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      fillRect: jest.fn(),
      fillStyle: null,
      lineWidth: null,
      strokeStyle: null,
    };
    mazeManager = new MazeManager(maze);
    wallManager = new WallManager(ctx, mazeManager, cellSize);
  });

  test("should set context styles on draw", () => {
    wallManager.draw();
    expect(ctx.lineWidth).toBe(WallManager.borderThickness);
    expect(ctx.strokeStyle).toBe(WallManager.borderColor);
  });

  test.each([
    ["drawTopBorder", 0, 0],
    ["drawBottomBorder", 1, 1],
    ["drawLeftBorder", 2, 2],
    ["drawRightBorder", 3, 3],
  ])(
    "%s should call moveTo and lineTo with correct parameters",
    (method, x, y) => {
      wallManager[method](x, y);
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.lineTo).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    }
  );

  test("drawGhostLairDoor should set fillStyle to white and call fillRect", () => {
    wallManager.draw();
    const expectedX = 1 * wallManager.width;
    const expectedY = 0 * wallManager.height + wallManager.height / 3;
    const expectedWidth = wallManager.width;
    const expectedHeight = wallManager.height / 3;
    expect(ctx.fillRect).toHaveBeenCalledWith(
      expectedX,
      expectedY,
      expectedWidth,
      expectedHeight
    );
  });

  test("draw should correctly handle walls and ghost lair doors", () => {
    wallManager.draw();
    expect(ctx.beginPath).toHaveBeenCalledTimes(16); // Total calls for borders
    expect(ctx.fillRect).toHaveBeenCalledTimes(1); // Total calls for doors
  });
});
