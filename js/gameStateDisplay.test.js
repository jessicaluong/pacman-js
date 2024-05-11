/**
 * @jest-environment jsdom
 */
import { GameStateDisplay } from "./gameStateDisplay";

describe("GameStateDisplay", () => {
  let mockScoreElement, mockLivesElement, display;

  beforeEach(() => {
    mockScoreElement = { textContent: "" };
    mockLivesElement = { innerHTML: "", appendChild: jest.fn() };

    document.getElementById = jest.fn((id) => {
      if (id === "score") return mockScoreElement;
      if (id === "lives") return mockLivesElement;
      return null;
    });

    display = new GameStateDisplay();
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
});
