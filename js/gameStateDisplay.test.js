/**
 * @jest-environment jsdom
 */
import { GameStateDisplay } from "./gameStateDisplay";

describe("GameStateDisplay", () => {
  let mockScoreElement, mockLivesElement, mockCtx, mockCanvas, display;

  beforeEach(() => {
    mockScoreElement = { textContent: "" };
    mockLivesElement = { innerHTML: "", appendChild: jest.fn() };

    document.getElementById = jest.fn((id) => {
      if (id === "score") return mockScoreElement;
      if (id === "lives") return mockLivesElement;
      return null;
    });

    mockCtx = {
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      fillText: jest.fn(),
      measureText: jest.fn(() => ({ width: 100 })),
      drawImage: jest.fn(),
    };

    mockCanvas = {
      width: 800,
      height: 600,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      style: jest.fn(() => ({ cursor: "default" })),
      getBoundingClientRect: jest.fn(),
      dispatchEvent: jest.fn(),
    };

    display = new GameStateDisplay(mockCtx, mockCanvas);
  });

  test("constructor should initialize with default values and fetch score element", () => {
    expect(display.score).toBe(0);
    expect(display.lives).toBe(2);
    expect(display.scoreElement).toBe(mockScoreElement);
  });

  test("reset should set score to zero, lives to two, and update display", () => {
    display.updateLifeIcons = jest.fn();
    display.reset();
    expect(display.score).toBe(0);
    expect(display.lives).toBe(2);
    expect(mockScoreElement.textContent).toBe(0);
    expect(display.updateLifeIcons).toHaveBeenCalled();
  });

  test("updateScore should increase score and update display", () => {
    const initialScore = display.score;
    const scoreIncrease = 5;
    display.updateScore(scoreIncrease);
    expect(display.score).toBe(initialScore + scoreIncrease);
    expect(mockScoreElement.textContent).toBe(initialScore + scoreIncrease);
  });

  test("decrementLives should decrease lives by one and update life icons", () => {
    const initialLives = display.lives;
    display.updateLifeIcons = jest.fn();
    display.decrementLives();
    expect(display.lives).toBe(initialLives - 1);
    expect(display.updateLifeIcons).toHaveBeenCalled();
  });

  test("updateLifeIcons should clear and recreate life icons based on lives count", () => {
    display.lives = 3;
    display.updateLifeIcons();
    expect(mockLivesElement.innerHTML).toBe("");
    expect(mockLivesElement.appendChild).toHaveBeenCalledTimes(display.lives);
    for (let i = 0; i < display.lives; i++) {
      expect(mockLivesElement.appendChild.mock.calls[i][0].className).toBe(
        "pacman-life"
      );
    }
  });

  test("displayGameOver should display game over screen and setup button", () => {
    jest.spyOn(mockCtx, "fillRect");
    jest.spyOn(mockCtx, "fillText");
    jest.spyOn(display, "setupRestartButton");

    display.displayGameOver();

    // Check that fillRect was called immediately after setting fillStyle to rgba
    expect(mockCtx.fillRect).toHaveBeenCalledWith(
      0,
      0,
      mockCanvas.width,
      mockCanvas.height
    );
    expect(mockCtx.fillStyle).toBe("white"); // Last known state

    expect(mockCtx.fillText).toHaveBeenCalledWith(
      "Game Over",
      mockCanvas.width / 2,
      mockCanvas.width / 2
    );
    expect(mockCtx.fillText).toHaveBeenCalledWith(
      "Click to restart",
      mockCanvas.width / 2,
      mockCanvas.width / 2 + 50
    );

    expect(display.setupRestartButton).toHaveBeenCalled();
  });

  test("setupRestartButton should setup button and handle click events correctly", () => {
    jest.spyOn(display, "resetCanvas");

    const mockEvent = {
      clientX: 460,
      clientY: 440,
    };
    const rect = {
      left: 100,
      top: 100,
    };
    jest.spyOn(mockCanvas, "getBoundingClientRect").mockReturnValue(rect);

    display.setupRestartButton(
      mockCanvas.width / 2,
      mockCanvas.height / 2,
      "Click to restart"
    );

    expect(mockCanvas.addEventListener).toHaveBeenCalledWith(
      "click",
      expect.any(Function)
    );
    expect(mockCanvas.addEventListener).toHaveBeenCalledWith(
      "mousemove",
      expect.any(Function)
    );

    // Simulate a click within the button area
    display.clickListener(mockEvent);
    expect(display.resetCanvas).toHaveBeenCalled();

    // Simulate mouse movement over the button
    display.mouseMoveListener(mockEvent);
    expect(mockCanvas.style.cursor).toBe("pointer");
  });

  test("resetCanvas should remove listeners and reset cursor", () => {
    display.resetCanvas();

    expect(mockCanvas.removeEventListener).toHaveBeenCalledWith(
      "click",
      display.clickListener
    );
    expect(mockCanvas.removeEventListener).toHaveBeenCalledWith(
      "mousemove",
      display.mouseMoveListener
    );
    expect(mockCanvas.style.cursor).toBe("default");
  });
});
