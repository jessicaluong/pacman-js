/**
 * @jest-environment jsdom
 */
import { Pacman } from "./pacman";
import { cellSize } from "./setup";

describe("Pacman", () => {
  let pacman, mockCtx, mockMazeManager, onEatPellet;

  beforeEach(() => {
    mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      drawImage: jest.fn(),
    };

    mockMazeManager = {
      getMazeWidth: jest.fn().mockReturnValue(28),
      isWalkable: jest.fn().mockReturnValue(true),
    };

    onEatPellet = jest.fn();

    pacman = new Pacman(
      mockCtx,
      mockMazeManager,
      cellSize,
      { position: { x: 5, y: 5 } },
      onEatPellet,
      [new Image(), new Image()]
    );
  });

  test("reset should reset properties to their initial values", () => {
    pacman.reset();
    expect(pacman.position).toEqual(pacman.initialPosition);
    expect(pacman.direction).toBe("RIGHT");
    expect(pacman.nextDirection).toBe("RIGHT");
    expect(pacman.animationFrame).toBe(0);
    expect(pacman.currentImageIndex).toBe(0);
    expect(pacman.currentImage).toBe(pacman.images[0]);
  });

  describe("draw", () => {
    test("should save context, perform transformations, and draw image", () => {
      pacman.draw();
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.translate).toHaveBeenCalledWith(
        pacman.position.x + pacman.radius,
        pacman.position.y + pacman.radius
      );
      expect(mockCtx.rotate).not.toHaveBeenCalled(); // Should not rotate as default direction is RIGHT
      expect(mockCtx.drawImage).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    test("should rotate image when Pac-Man moves left", () => {
      pacman.direction = "LEFT";
      pacman.draw();
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.translate).toHaveBeenCalledWith(
        pacman.position.x + pacman.radius,
        pacman.position.y + pacman.radius
      );
      expect(mockCtx.rotate).toHaveBeenCalledWith(Math.PI);
      expect(mockCtx.drawImage).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    test("should rotate image when Pac-Man moves up", () => {
      pacman.direction = "UP";
      pacman.draw();
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.translate).toHaveBeenCalledWith(
        pacman.position.x + pacman.radius,
        pacman.position.y + pacman.radius
      );
      expect(mockCtx.rotate).toHaveBeenCalledWith(-Math.PI / 2);
      expect(mockCtx.drawImage).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    test("should rotate image when Pac-Man moves down", () => {
      pacman.direction = "DOWN";
      pacman.draw();
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.translate).toHaveBeenCalledWith(
        pacman.position.x + pacman.radius,
        pacman.position.y + pacman.radius
      );
      expect(mockCtx.rotate).toHaveBeenCalledWith(Math.PI / 2);
      expect(mockCtx.drawImage).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });
  });

  test("animateMouth should cycle through images every 8 frames", () => {
    pacman.animationFrame = 7;
    pacman.animateMouth();
    expect(pacman.currentImageIndex).toBe(1);
    expect(pacman.currentImage).toBe(pacman.images[1]);
  });

  describe("update", () => {
    beforeEach(() => {
      jest.spyOn(pacman, "moveForwards");
      const spyCollideWall = jest
        .spyOn(pacman, "isCollideWithWall")
        .mockReturnValue(true);
      jest.spyOn(pacman, "moveBackwards");
      jest.spyOn(pacman, "checkEatPellet");
      jest.spyOn(pacman, "animateMouth");
      jest.spyOn(pacman, "draw");
    });

    test("should handle game logic for moving and drawing Pac-Man", () => {
      jest.spyOn(pacman, "isCollideWithWall").mockReturnValue(false);
      pacman.update();

      expect(pacman.moveForwards).toHaveBeenCalled();
      expect(pacman.isCollideWithWall).toHaveBeenCalled();
      expect(pacman.moveBackwards).not.toHaveBeenCalled();
      expect(pacman.checkEatPellet).toHaveBeenCalled();
      expect(pacman.animateMouth).toHaveBeenCalled();
      expect(pacman.draw).toHaveBeenCalled();
    });

    test("should move Pac-Man backwards upon wall collision", () => {
      jest.spyOn(pacman, "isCollideWithWall").mockReturnValue(true);
      pacman.update();

      expect(pacman.moveForwards).toHaveBeenCalled();
      expect(pacman.isCollideWithWall).toHaveBeenCalled();
      expect(pacman.moveBackwards).toHaveBeenCalled();
      expect(pacman.checkEatPellet).toHaveBeenCalled();
      expect(pacman.animateMouth).toHaveBeenCalled();
      expect(pacman.draw).toHaveBeenCalled();
    });
  });

  describe("changeDirectionIfPossible", () => {
    test("should change direction if no collision is detected", () => {
      const mockIsCollideWithWall = jest.fn().mockReturnValue(false);
      pacman.isCollideWithWall = mockIsCollideWithWall;
      pacman.nextDirection = "LEFT";
      pacman.changeDirectionIfPossible();
      expect(pacman.direction).toBe("LEFT");
      expect(mockIsCollideWithWall).toHaveBeenCalled();
    });

    test("should revert to original direction and position on collision", () => {
      const originalPosition = { ...pacman.position };
      pacman.nextDirection = "LEFT";
      const mockIsCollideWithWall = jest.fn().mockReturnValue(true);
      pacman.isCollideWithWall = mockIsCollideWithWall;
      pacman.changeDirectionIfPossible();
      expect(pacman.direction).not.toBe("LEFT");
      expect(pacman.position).toEqual(originalPosition);
      expect(mockIsCollideWithWall).toHaveBeenCalled();
    });
  });

  describe("moveForwards", () => {
    test("should update position based on direction and velocity", () => {
      pacman.direction = "RIGHT";
      const initialPositionX = pacman.position.x;
      pacman.moveForwards();
      expect(pacman.position.x).toBe(
        (initialPositionX + pacman.velocity) %
          (pacman.mazeManager.getMazeWidth() * pacman.cellSize)
      );
    });

    test("should wrap around the game area horizontally", () => {
      pacman.direction = "LEFT";
      pacman.position.x = 0;
      pacman.moveForwards();
      const gameWidth = pacman.mazeManager.getMazeWidth() * pacman.cellSize;
      expect(pacman.position.x).toBe((gameWidth - pacman.velocity) % gameWidth);
    });
  });

  describe("moveBackwards", () => {
    test("should reverse position movement", () => {
      pacman.direction = "RIGHT";
      const initialPositionX = pacman.position.x;
      pacman.moveForwards(); // Move forward first
      pacman.moveBackwards(); // Then move backward
      expect(pacman.position.x).toBe(initialPositionX); // Should end up where it started
    });

    test("should handle horizontal wrapping when moving backwards", () => {
      pacman.direction = "LEFT";
      pacman.position.x = 0;
      pacman.moveBackwards();
      const gameWidth = pacman.mazeManager.getMazeWidth() * pacman.cellSize;
      expect(pacman.position.x).toBe((gameWidth + pacman.velocity) % gameWidth);
    });
  });

  describe("isCollideWithWall", () => {
    test("returns true if any corner is not walkable", () => {
      const mockIsWalkable = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false); // Last corner is not walkable

      pacman.mazeManager.isWalkable = mockIsWalkable;
      expect(pacman.isCollideWithWall()).toBe(true);
      expect(mockIsWalkable).toHaveBeenCalledTimes(4);
    });

    test("returns false if all corners are walkable", () => {
      pacman.mazeManager.isWalkable = jest.fn().mockReturnValue(true);
      expect(pacman.isCollideWithWall()).toBe(false);
      expect(pacman.mazeManager.isWalkable).toHaveBeenCalledTimes(4);
    });
  });

  test("checkEatPellet should trigger onEatPellet if Pac-Man is on a pellet", () => {
    pacman.position.x = 40;
    pacman.position.y = 40;

    pacman.checkEatPellet();

    expect(pacman.onEatPellet).toHaveBeenCalledWith({ x: 2, y: 2 });
  });
});
