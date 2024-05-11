/**
 * @jest-environment jsdom
 */
import { initializeCanvas, loadImages, setupGameEnvironment } from "./setup.js";

describe("initializeCanvas", () => {
  beforeEach(() => {
    document.getElementById = jest.fn((id) => {
      return {
        getContext: jest.fn().mockReturnValue({}),
        width: 0,
        height: 0,
      };
    });
  });

  test("should initialize canvas elements correctly", () => {
    const { bgCtx, gameCtx, gameCanvas } = initializeCanvas();
    expect(document.getElementById).toHaveBeenCalledWith("backgroundCanvas");
    expect(document.getElementById).toHaveBeenCalledWith("gameCanvas");
    expect(gameCanvas.width).toBe(420);
    expect(gameCanvas.height).toBe(460);
    expect(bgCtx).toBeDefined();
    expect(gameCtx).toBeDefined();
  });
});

describe("setupGameEnvironment", () => {
  beforeEach(() => {
    const mockCanvas = {
      getContext: () => ({
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        drawImage: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),
      }),
      width: 420,
      height: 460,
    };

    const mockLivesElement = {
      innerHTML: "",
      appendChild: jest.fn(),
    };

    document.getElementById = jest.fn((id) => {
      if (id === "lives") return mockLivesElement;
      return mockCanvas;
    });

    jest.mock("./MazeManager.js");
    jest.mock("./GameStateDisplay.js");
    jest.mock("./PelletManager.js");
    jest.mock("./WallManager.js");
  });

  test("should set up game environment with necessary components", () => {
    const {
      gameCtx,
      gameCanvas,
      mazeManager,
      gameStateDisplay,
      pelletManager,
    } = setupGameEnvironment();
    expect(gameCanvas).toBeDefined();
    expect(gameCtx).toBeDefined();
    expect(mazeManager).toBeDefined();
    expect(gameStateDisplay).toBeDefined();
    expect(pelletManager).toBeDefined();
  });
});

describe("loadImages", () => {
  beforeEach(() => {
    global.Image = class {
      constructor() {
        setTimeout(() => this.onload(), 50);
      }
    };
  });

  test("should load all images successfully", async () => {
    const images = await loadImages();
    expect(Object.keys(images)).toHaveLength(8);
  });

  test("should reject on image load error", async () => {
    global.Image = class {
      constructor() {
        setTimeout(() => this.onerror(new Error("Failed to load")), 50);
      }
    };

    await expect(loadImages()).rejects.toThrow("Failed to load");
  });
});
