/**
 * @jest-environment jsdom
 */
import { Ghost, GhostManager } from "./ghosts";
import { cellSize } from "./setup";

global.window = {};
window.PF = {
  Grid: jest.fn().mockImplementation((matrix) => ({
    clone: jest.fn().mockReturnThis(),
  })),
  AStarFinder: jest.fn().mockImplementation(() => ({
    findPath: jest.fn().mockReturnValue([
      [1, 1],
      [1, 2],
    ]),
  })),
};

describe("Ghost", () => {
  let ghost, mockCtx, mockMazeManager;

  beforeEach(() => {
    mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      drawImage: jest.fn(),
      scale: jest.fn(),
    };

    mockMazeManager = {
      getMazeWidth: jest.fn().mockReturnValue(3),
      hasWall: jest.fn(),
      hasInvisibleWall: jest.fn(),
      getMaze: jest.fn().mockReturnValue([
        [0, 1, 0],
        [0, 0, 0],
        [1, 0, 1],
      ]),
    };

    ghost = new Ghost(
      "blinky",
      mockCtx,
      mockMazeManager,
      cellSize,
      [new Image(), new Image(), new Image()],
      { position: { x: 1, y: 1 } }
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("frighten mode", () => {
    beforeEach(() => {
      originalSetTimeout = global.setTimeout;
      originalClearTimeout = global.clearTimeout;
      originalSetInterval = global.setInterval;
      originalClearInterval = global.clearInterval;

      global.setTimeout = jest
        .fn()
        .mockImplementation((fn, delay) => "timeoutId");
      global.clearTimeout = jest.fn();
      global.setInterval = jest
        .fn()
        .mockImplementation((fn, interval) => "intervalId");
      global.clearInterval = jest.fn();
    });

    afterEach(() => {
      global.setTimeout = originalSetTimeout;
      global.clearTimeout = originalClearTimeout;
      global.setInterval = originalSetInterval;
      global.clearInterval = originalClearInterval;
    });

    test("frighten should set mode to frighten and handle timers correctly", () => {
      ghost.frightenedTimer = global.setTimeout(() => {}, 1000);

      ghost.frighten();
      expect(ghost.mode).toBe("frighten");
      expect(ghost.currentImage).toBe(ghost.images[1]);
      expect(global.clearTimeout).toHaveBeenCalled();
      expect(global.setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        ghost.frightenedDuration - ghost.blinkDuration
      );
      expect(ghost.frightenedTimer).toBe("timeoutId");
    });

    test("startBlinking should toggle images and set correct timers", () => {
      ghost.startBlinking();
      expect(global.setInterval).toHaveBeenCalledWith(
        expect.any(Function),
        ghost.blinkInterval
      );
      expect(ghost.blinkTimer).toBe("intervalId");
      expect(global.setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        ghost.blinkDuration
      );
    });

    test("endFrighten should reset mode to random and clear timers", () => {
      ghost.frighten();
      ghost.blinkTimer = "intervalId";

      ghost.endFrighten();
      expect(ghost.mode).toBe("random");
      expect(ghost.currentImage).toBe(ghost.images[0]);
      expect(global.clearInterval).toHaveBeenCalledWith("intervalId");
      expect(ghost.blinkTimer).toBeNull();
      expect(ghost.frightenedTimer).toBeNull();
      expect(ghost.lastDirection).toEqual({ dx: 0, dy: 0 });
    });
  });

  describe("reset", () => {
    beforeEach(() => {
      originalClearTimeout = global.clearTimeout;
      originalClearInterval = global.clearInterval;

      global.clearTimeout = jest.fn();
      global.clearInterval = jest.fn();
    });

    afterEach(() => {
      global.clearTimeout = originalClearTimeout;
      global.clearInterval = originalClearInterval;
    });

    test("should restore initial state and clear timers", () => {
      ghost.frightenedTimer = "timeoutId";
      ghost.blinkTimer = "intervalId";

      ghost.reset();
      expect(ghost.position).toEqual(ghost.initialPosition);
      expect(ghost.mode).toBe("random");
      expect(ghost.currentImage).toBe(ghost.images[0]);
      expect(ghost.lastDirection).toEqual({ dx: 0, dy: 0 });
      expect(global.clearInterval).toHaveBeenCalledWith("intervalId");
      expect(global.clearTimeout).toHaveBeenCalledWith("timeoutId");
    });
  });

  describe("draw", () => {
    test("should handle image flip when moving left", () => {
      ghost.lastDirection = { dx: -2, dy: 0 }; // Moving left
      ghost.draw();
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.scale).toHaveBeenCalledWith(-1, 1);
      expect(mockCtx.translate).toHaveBeenCalledWith(-60, 0); // Translated position
      expect(mockCtx.drawImage).toHaveBeenCalledWith(
        ghost.currentImage,
        ghost.position.x,
        ghost.position.y,
        ghost.cellSize,
        ghost.cellSize
      );
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    test("should not flip image when moving right", () => {
      ghost.lastDirection = { dx: 2, dy: 0 }; // Moving right
      ghost.draw();
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.scale).not.toHaveBeenCalled();
      expect(mockCtx.translate).not.toHaveBeenCalled();
      expect(mockCtx.drawImage).toHaveBeenCalledWith(
        ghost.currentImage,
        ghost.position.x,
        ghost.position.y,
        ghost.cellSize,
        ghost.cellSize
      );
      expect(mockCtx.restore).toHaveBeenCalled();
    });
  });

  describe("isCollideWithWall", () => {
    test("should return true if any corner collides with a wall", () => {
      mockMazeManager.hasWall.mockReturnValue(false);
      mockMazeManager.hasInvisibleWall.mockReturnValue(true); // One corner hits an invisible wall
      const result = ghost.isCollideWithWall(100, 100);
      expect(result).toBeTruthy();
      expect(mockMazeManager.hasWall).toHaveBeenCalledTimes(1);
      expect(mockMazeManager.hasInvisibleWall).toHaveBeenCalledTimes(1);
    });

    test("should return false if no corners collide with a wall", () => {
      mockMazeManager.hasWall.mockReturnValue(false);
      mockMazeManager.hasInvisibleWall.mockReturnValue(false);
      const result = ghost.isCollideWithWall(100, 100);
      expect(result).toBeFalsy();
      expect(mockMazeManager.hasWall).toHaveBeenCalledTimes(4);
      expect(mockMazeManager.hasInvisibleWall).toHaveBeenCalledTimes(4);
    });
  });

  describe("move", () => {
    test("should choose random direction in random mode", () => {
      ghost.mode = "random";
      const spy = jest.spyOn(ghost, "chooseRandomDirection");
      ghost.move({ x: 0, y: 0 });
      expect(spy).toHaveBeenCalled();
    });

    test("should choose A* in chase mode", () => {
      ghost.mode = "chase";
      const spy = jest.spyOn(ghost, "chooseDirectionUsingAStar");
      ghost.move({ x: 1, y: 2 });
      expect(spy).toHaveBeenCalledWith(1, 2);
    });
  });

  describe("chooseRandomDirection", () => {
    beforeEach(() => {
      jest.spyOn(ghost, "isCollideWithWall");
    });

    test("should update position and last direction correctly", () => {
      ghost.isCollideWithWall.mockReturnValue(false);
      ghost.lastDirection = { dx: 2, dy: 0 }; // Moving right

      ghost.chooseRandomDirection();
      expect(ghost.isCollideWithWall).toHaveBeenCalledTimes(4);
      expect(ghost.position).not.toBe({ x: 20, y: 20 }); // Position should change
      expect(ghost.lastDirection).not.toEqual({ dx: -2, dy: 0 }); // Should not reverse direction
    });

    test("filters out reverse directions and collisions", () => {
      ghost.isCollideWithWall
        .mockReturnValueOnce(false) // Left
        .mockReturnValueOnce(true) // Right, collides
        .mockReturnValueOnce(true) // Up, collides
        .mockReturnValueOnce(false); // Down
      ghost.lastDirection = { dx: 2, dy: 0 }; // Moving right

      ghost.chooseRandomDirection();
      expect(ghost.isCollideWithWall).toHaveBeenCalledTimes(4);

      // Should move down
      expect(ghost.position).not.toBe({ x: 20, y: 22 });
      expect(ghost.lastDirection).toEqual({ dx: 0, dy: 2 });
    });
  });

  describe("chase mode", () => {
    test("setupPathfindingGrid initializes grid and finder correctly", () => {
      expect(window.PF.Grid).toHaveBeenCalled();
      expect(window.PF.AStarFinder).toHaveBeenCalled();
      expect(ghost.grid).toBeDefined();
      expect(ghost.finder).toBeDefined();
    });

    test("toGridPosition adjusts x position based on positive x direction", () => {
      const pos = ghost.toGridPosition(105, ghost.cellSize, { dx: 2, dy: 0 });
      expect(pos).toBe(5);
    });

    test("toGridPosition adjusts x position based on negative x direction", () => {
      const pos = ghost.toGridPosition(105, ghost.cellSize, { dx: -2, dy: 0 });
      expect(pos).toBe(6);
    });

    test("toGridPosition adjusts y position based on positive y direction", () => {
      const pos = ghost.toGridPosition(105, ghost.cellSize, { dx: 0, dy: 2 });
      expect(pos).toBe(5);
    });

    test("toGridPosition adjusts y position based on negative y direction", () => {
      const pos = ghost.toGridPosition(105, ghost.cellSize, { dx: 0, dy: -2 });
      expect(pos).toBe(6);
    });

    test("chooseDirectionUsingAStar computes correct path and updates position", () => {
      jest.spyOn(ghost, "updatePositionBasedOnPath");
      ghost.chooseDirectionUsingAStar(140, 140);
      expect(ghost.grid.clone).toHaveBeenCalled();
      expect(ghost.finder.findPath).toHaveBeenCalledWith(
        1,
        1,
        7,
        7,
        ghost.grid
      );
      expect(ghost.updatePositionBasedOnPath).toHaveBeenCalledWith([1, 2]);
    });

    test("updatePositionBasedOnPath moves ghost to the next step correctly (down)", () => {
      ghost.updatePositionBasedOnPath([1, 5]);
      expect(ghost.lastDirection.dx).toBe(0);
      expect(ghost.lastDirection.dy).toBe(1 * ghost.velocity);
    });

    test("updatePositionBasedOnPath moves ghost to the next step correctly (left)", () => {
      ghost.updatePositionBasedOnPath([0, 1]);
      expect(ghost.lastDirection.dx).toBe(-1 * ghost.velocity);
      expect(ghost.lastDirection.dy).toBe(0);
    });
  });
});

class MockGhost {
  constructor() {
    this.mode = "random";
    this.move = jest.fn();
    this.draw = jest.fn();
    this.frighten = jest.fn();
  }
}

describe("GhostManager", () => {
  let ghosts, manager;

  beforeEach(() => {
    ghosts = [new MockGhost(), new MockGhost(), new MockGhost()];
    manager = new GhostManager(ghosts);
  });

  test("update should call move and draw on each ghost", () => {
    manager.update({ x: 50, y: 50 }, 100);
    ghosts.forEach((ghost) => {
      expect(ghost.move).toHaveBeenCalledWith({ x: 50, y: 50 });
      expect(ghost.draw).toHaveBeenCalled();
    });
  });

  test("update should handle mode transitions correctly", () => {
    manager.mode = "chase";
    manager.update({}, 3001); // deltaTime to exceed chaseDuration
    expect(manager.mode).toBe("random");
    expect(manager.modeDuration).toBe(0);

    manager.update({}, 7001); // deltaTime to exceed randomDuration
    expect(manager.mode).toBe("chase");
    expect(manager.modeDuration).toBe(0);
  });

  test("draw should call draw on each ghost", () => {
    manager.draw();
    ghosts.forEach((ghost) => {
      expect(ghost.draw).toHaveBeenCalled();
    });
  });

  test("setMode should update mode for all ghosts", () => {
    manager.setMode("chase");
    expect(manager.mode).toBe("chase");
    ghosts.forEach((ghost) => {
      expect(ghost.mode).toBe("chase");
    });
  });

  test("frighten should activate frighten mode for all ghosts", () => {
    manager.frighten();
    ghosts.forEach((ghost) => {
      expect(ghost.frighten).toHaveBeenCalled();
    });
  });
});
