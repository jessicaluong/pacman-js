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
      beginPath: jest.fn(),
      roundRect: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      fillText: jest.fn(),
      font: "",
      fillStyle: "",
      strokeStyle: "",
      textAlign: "",
    };

    mockCanvas = {
      width: 800,
      height: 600,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      style: jest.fn(() => ({ cursor: "default" })),
      getBoundingClientRect: jest.fn().mockReturnValue({ left: 100, top: 50 }),
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

  describe("handleEndGame", () => {
    beforeEach(() => {
      global.console = { log: jest.fn(), error: jest.fn() };
      display.fetchScores = jest.fn();
      display.displayAddScoreScreen = jest.fn();
      display.displayGameOverScreen = jest.fn();
      display.determineRank = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("displays the add score screen if the player's score is in the top 10", async () => {
      display.fetchScores.mockResolvedValue([
        { points: 50 },
        { points: 40 },
        { points: 30 },
      ]);
      display.score = 45;
      display.determineRank.mockReturnValue(2); // Top 10 rank

      await display.handleEndGame();

      expect(display.displayAddScoreScreen).toHaveBeenCalled();
      expect(display.displayGameOverScreen).not.toHaveBeenCalled();
    });

    test("displays the game over screen if the player's score is not in the top 10", async () => {
      display.fetchScores.mockResolvedValue([
        { points: 50 },
        { points: 40 },
        { points: 30 },
      ]);
      display.score = 20;
      display.determineRank.mockReturnValue(11); // Not top 10

      await display.handleEndGame();

      expect(display.displayAddScoreScreen).not.toHaveBeenCalled();
      expect(display.displayGameOverScreen).toHaveBeenCalled();
    });

    test("displays the game over screen if no scores are fetched", async () => {
      display.fetchScores.mockResolvedValue([]); // No scores returned

      await display.handleEndGame();

      expect(display.displayAddScoreScreen).not.toHaveBeenCalled();
      expect(display.displayGameOverScreen).toHaveBeenCalledWith([]);
      expect(console.log).toHaveBeenCalledWith(
        "No scores to display or error fetching scores"
      );
    });

    test("handles errors during score fetching", async () => {
      display.fetchScores.mockImplementation(() => {
        throw new Error("Network issue");
      });

      await display.handleEndGame();

      expect(display.displayAddScoreScreen).not.toHaveBeenCalled();
      expect(display.displayGameOverScreen).toHaveBeenCalledWith([]);
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching scores:",
        expect.any(Error)
      );
    });

    test("aborts the fetch call due to a timeout and handles the error", async () => {
      let controller = new AbortController();
      jest
        .spyOn(global, "AbortController")
        .mockImplementation(() => controller);

      const fetchPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new DOMException("Request aborted.", "AbortError")),
          1000
        )
      );
      display.fetchScores.mockReturnValue(fetchPromise);

      await display.handleEndGame();

      controller.abort();

      expect(display.displayAddScoreScreen).not.toHaveBeenCalled();
      expect(display.displayGameOverScreen).toHaveBeenCalledWith([]);
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching scores:",
        expect.any(DOMException)
      );
    });
  });

  describe("fetchScores", () => {
    let controller;

    beforeEach(() => {
      global.fetch = jest.fn();
      global.console = { log: jest.fn(), error: jest.fn() };
      controller = new AbortController();
      jest
        .spyOn(global, "AbortController")
        .mockImplementation(() => controller);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("should return a list of scores when the fetch is successful", async () => {
      const mockScores = [{ points: 90 }, { points: 85 }];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ scores: mockScores }),
      });

      const scores = await display.fetchScores(controller.signal);

      expect(fetch).toHaveBeenCalledWith(
        "https://pacman-js.onrender.com/api/v1/scores",
        { signal: controller.signal }
      );
      expect(scores).toEqual(mockScores);
    });

    test("should return an empty array and log an error when the fetch fails", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const scores = await display.fetchScores(controller.signal);

      expect(fetch).toHaveBeenCalledWith(
        "https://pacman-js.onrender.com/api/v1/scores",
        { signal: controller.signal }
      );
      expect(scores).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching scores:",
        expect.any(Error)
      );
    });
  });

  describe("determineRank", () => {
    const scores = [{ points: 99 }, { points: 90 }, { points: 85 }]; // Server returns sorted scores

    test("should return the correct rank when the current score is higher than some scores", () => {
      display.score = 95;
      const rank = display.determineRank(scores);
      expect(rank).toEqual(2);
    });

    test("should return the correct rank when the current score is the lowest", () => {
      display.score = 80;
      const rank = display.determineRank(scores);
      expect(rank).toEqual(4);
    });

    test("should return 1 when the current score is the highest", () => {
      display.score = 100;
      const result = display.determineRank(scores);
      expect(result).toEqual(1);
    });
  });

  describe("displayGameOverScreen", () => {
    let mockLeaderboardDiv;

    beforeEach(() => {
      jest.spyOn(display, "setupButtons");
      jest.spyOn(display, "addEventListeners");
      jest.spyOn(display, "resetCanvas");
      jest.spyOn(display, "displayHighScoresScreen");

      mockLeaderboardDiv = {
        querySelector: jest.fn().mockReturnValue({
          innerHTML: "",
          appendChild: jest.fn(),
        }),
        style: jest.fn().mockReturnValue({}),
      };

      document.getElementById = jest.fn().mockReturnValue(mockLeaderboardDiv);
    });

    test("should draw game over screen and set up buttons", () => {
      const scores = [
        { points: 500, name: "AAA" },
        { points: 300, name: "BBB" },
      ];
      display.displayGameOverScreen(scores);

      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
      expect(mockCtx.textAlign).toBe("center");
      expect(mockCtx.fillText).toHaveBeenCalledWith("Game Over", 400, 390); // yPos - 10
      expect(mockCtx.font).toContain("Roboto Mono");

      expect(display.buttons.length).toBe(2);
      expect(display.buttons[1].text).toBe("Display scores");
      expect(display.setupButtons).toHaveBeenCalled();
      expect(display.addEventListeners).toHaveBeenCalled();

      // Simulate button action
      display.buttons[1].action();
      expect(display.displayHighScoresScreen).toHaveBeenCalledWith(scores);
    });

    test("should only show play again button if no scores available", () => {
      const scores = [];

      display.displayGameOverScreen(scores);

      expect(display.buttons.length).toBe(1);
      expect(display.buttons[0].text).toBe("Play again!");

      // Simulate button action
      display.buttons[0].action();
      expect(display.resetCanvas).toHaveBeenCalled();
      expect(mockCanvas.dispatchEvent).toHaveBeenCalledWith(
        new Event("restartGame")
      );
    });
  });

  describe("displayAddScoreScreen", () => {
    let mockInputElement;

    beforeEach(() => {
      global.fetch = jest.fn();
      global.console = { log: jest.fn(), error: jest.fn() };

      jest.spyOn(display, "setupButtons");
      jest.spyOn(display, "addEventListeners");
      jest.spyOn(display, "resetCanvas");
      jest.spyOn(display, "addScore");

      mockInputElement = {
        style: {},
        focus: jest.fn(),
        value: "",
      };

      document.getElementById = jest.fn().mockReturnValue(mockInputElement);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("should draw add scores screen and setup buttons correctly", () => {
      display.displayAddScoreScreen();

      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
      expect(mockCtx.textAlign).toBe("center");
      expect(mockCtx.fillText).toHaveBeenCalledWith(
        "New high score!",
        400,
        330
      );
      expect(mockCtx.fillText).toHaveBeenCalledWith("_ _ _", 392, 390);
      expect(mockCtx.fillText).toHaveBeenCalledWith(
        "Enter your initials",
        400,
        430
      );
      expect(mockCtx.font).toContain("Roboto Mono");

      expect(mockInputElement.style.display).toBe("block");
      expect(mockInputElement.focus).toHaveBeenCalled();

      expect(display.buttons.length).toBe(2);
      expect(display.buttons[0].text).toBe("Add score");
      expect(display.buttons[1].text).toBe("Play again!");
      expect(display.setupButtons).toHaveBeenCalled();
      expect(display.addEventListeners).toHaveBeenCalled();
    });

    test("should add score if input is valid", () => {
      display.displayAddScoreScreen();

      mockInputElement.value = "ABC";
      display.buttons[0].action();

      expect(display.addScore).toHaveBeenCalledWith("ABC");
      expect(mockInputElement.style.display).toBe("none");
      expect(mockInputElement.value).toBe("");
    });

    test("should not add score if input is invalid (less than 3 characters)", () => {
      display.displayAddScoreScreen();

      mockInputElement.value = "AC";
      display.buttons[0].action();

      expect(display.addScore).not.toHaveBeenCalled();
    });

    test("should not add score if input is invalid (not alphabetical)", () => {
      display.displayAddScoreScreen();

      mockInputElement.value = "A1C";
      display.buttons[0].action();

      expect(display.addScore).not.toHaveBeenCalled();
    });

    test("should handle play again action correctly", () => {
      display.displayAddScoreScreen();

      // Simulate button action
      display.buttons[1].action();

      expect(mockInputElement.style.display).toBe("none");
      expect(mockInputElement.value).toBe("");
      expect(display.resetCanvas).toHaveBeenCalled();
      expect(mockCanvas.dispatchEvent).toHaveBeenCalledWith(
        new Event("restartGame")
      );
    });
  });

  describe("displayHighScoresScreen", () => {
    let mockLeaderboardDiv, mockUl;

    beforeEach(() => {
      jest.spyOn(display, "setupButtons");
      jest.spyOn(display, "addEventListeners");
      jest.spyOn(display, "resetCanvas");

      mockUl = {
        innerHTML: "",
        appendChild: jest.fn(),
      };

      mockLeaderboardDiv = {
        querySelector: jest.fn().mockReturnValue(mockUl),
        style: {},
      };

      document.getElementById = jest.fn().mockReturnValue(mockLeaderboardDiv);
    });

    test("should draw high score headings correctly", () => {
      const scores = [
        { points: 500, name: "AAA" },
        { points: 300, name: "BBB" },
      ];
      display.displayHighScoresScreen(scores);

      expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
      expect(mockCtx.textAlign).toBe("center");
      expect(mockCtx.fillText).toHaveBeenCalledWith(
        "High Scores",
        400,
        133.33333333333334
      );
      expect(mockCtx.fillText).toHaveBeenCalledWith(
        "Rank     Score    Name",
        400,
        173.33333333333334
      );
      expect(mockCtx.font).toContain("Roboto Mono");
    });

    test("should set up buttons correctly", () => {
      const scores = [
        { points: 500, name: "AAA" },
        { points: 300, name: "BBB" },
      ];
      display.displayHighScoresScreen(scores);

      expect(display.buttons.length).toBe(1);
      expect(display.buttons[0].text).toBe("Play again!");
      expect(display.setupButtons).toHaveBeenCalled();
      expect(display.addEventListeners).toHaveBeenCalled();
    });

    test("should set up leaderboard correctly if scores array is not empty", () => {
      const scores = [
        { points: 500, name: "AAA" },
        { points: 300, name: "BBB" },
        { points: 123, name: "CCC" },
      ];
      display.displayHighScoresScreen(scores);

      expect(mockLeaderboardDiv.style.display).toBe("block");
      expect(mockUl.innerHTML).toBe("");
      expect(mockUl.appendChild).toHaveBeenCalledTimes(scores.length);
      scores.forEach((score, index) => {
        expect(mockUl.appendChild.mock.calls[index][0].innerHTML).toContain(
          `${index + 1}`
        );
        expect(mockUl.appendChild.mock.calls[index][0].innerHTML).toContain(
          `${score.points}`
        );
        expect(mockUl.appendChild.mock.calls[index][0].innerHTML).toContain(
          score.name.toUpperCase()
        );
      });
    });

    test("should set up leaderboard correctly if scores array is empty", () => {
      const scores = [];
      display.displayHighScoresScreen(scores);
      expect(mockUl.appendChild).not.toHaveBeenCalled();
      expect(mockLeaderboardDiv.style.display).toBe("block");
    });

    test("should handle play again action correctly", () => {
      const scores = [
        { points: 500, name: "AAA" },
        { points: 300, name: "BBB" },
      ];
      display.displayHighScoresScreen(scores);

      // Simulate button action
      display.buttons[0].action();

      expect(mockLeaderboardDiv.style.display).toBe("none");
      expect(display.resetCanvas).toHaveBeenCalled();
      expect(mockCanvas.dispatchEvent).toHaveBeenCalledWith(
        new Event("restartGame")
      );
    });
  });

  describe("postScore", () => {
    beforeEach(() => {
      global.fetch = jest.fn();
      global.console = { log: jest.fn(), error: jest.fn() };
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("should post score successfully and return true", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
      });

      const scoreData = { name: "AAA", points: 100 };
      const result = await display.postScore(scoreData);

      expect(fetch).toHaveBeenCalledWith(
        "https://pacman-js.onrender.com/api/v1/scores",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(scoreData),
        }
      );
      expect(console.log).toHaveBeenCalledWith("Score successfully posted.");
      expect(result).toBe(true);
    });

    test("should handle HTTP error when posting score", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      const scoreData = { name: "AAA", points: 100 };
      const result = await display.postScore(scoreData);

      expect(console.error).toHaveBeenCalledWith(
        "Error fetching scores:",
        new Error("HTTP error, status = 400")
      );
      expect(result).toBeUndefined();
    });
  });

  describe("addScore", () => {
    beforeEach(() => {
      global.fetch = jest.fn();
      global.console = { log: jest.fn(), error: jest.fn() };
      jest
        .spyOn(display, "fetchScores")
        .mockResolvedValue([{ name: "AAA", points: 100 }]);
      jest.spyOn(display, "displayHighScoresScreen");
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("should add score and display high scores on success", async () => {
      jest.spyOn(display, "postScore").mockResolvedValue(true);

      await display.addScore("AAA");

      expect(display.postScore).toHaveBeenCalled();
      expect(display.fetchScores).toHaveBeenCalled();
      expect(display.displayHighScoresScreen).toHaveBeenCalledWith([
        { name: "AAA", points: 100 },
      ]);
    });

    test("should log error if posting score fails", async () => {
      jest.spyOn(display, "postScore").mockResolvedValue(false);

      await display.addScore("AAA");

      expect(display.postScore).toHaveBeenCalled();
      expect(display.fetchScores).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith("Failed to post score.");
    });

    test("should handle exceptions during posting and fetching scores", async () => {
      jest.spyOn(display, "postScore").mockImplementation(() => {
        throw new Error("Network issue");
      });

      await display.addScore("AAA");

      expect(display.postScore).toHaveBeenCalled();
      expect(display.fetchScores).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        "An error occurred while posting and fetching scores:",
        expect.any(Error)
      );
    });
  });

  test("setupButtons should setup button correctly", () => {
    display.buttons = [{ xPos: 100, yPos: 100, text: "Click Me!" }];

    display.setupButtons();

    expect(mockCtx.beginPath).toHaveBeenCalled();
    expect(mockCtx.roundRect).toHaveBeenCalledWith(
      22.5, // x position: xPos - width/2 - padding/2
      79.5, // y position: yPos - textSize - padding/2
      155, // width: 150 + padding
      35, // height: 30 + padding
      3 // rounded corner radius
    );
    expect(mockCtx.stroke).toHaveBeenCalled();
    expect(mockCtx.fill).toHaveBeenCalled();
    expect(mockCtx.fillText).toHaveBeenCalledWith(
      "Click Me!", // button text
      100, // xPos
      100 // yPos
    );
    expect(mockCtx.fillStyle).toBe("#fff"); // Last known state
    expect(mockCtx.strokeStyle).toBe("white");
    expect(mockCtx.font).toBe("18px 'Roboto Mono', monospace");
  });

  describe("handleClick", () => {
    let mockEvent;

    beforeEach(() => {
      display.buttons = [
        { x: 10, y: 10, width: 100, height: 20, action: jest.fn() },
      ];

      mockEvent = {
        clientX: 0,
        clientY: 0,
        preventDefault: jest.fn(),
      };
    });

    test("should trigger the button action if clicked within boundaries", () => {
      mockEvent.clientX = 110;
      mockEvent.clientY = 60;

      display.handleClick(mockEvent);

      expect(display.buttons[0].action).toHaveBeenCalled();
    });

    test("should not trigger the button action if clicked outside boundaries", () => {
      mockEvent.clientX = 300;
      mockEvent.clientY = 300;

      display.handleClick(mockEvent);

      expect(display.buttons[0].action).not.toHaveBeenCalled();
    });
  });

  describe("handleMouseMove", () => {
    let mockEvent;

    beforeEach(() => {
      display.buttons = [
        { x: 10, y: 10, width: 100, height: 20, action: jest.fn() },
      ];

      mockEvent = {
        clientX: 0,
        clientY: 0,
        preventDefault: jest.fn(),
      };
    });

    test("should change cursor to pointer over a button", () => {
      mockEvent.clientX = 110;
      mockEvent.clientY = 60;

      display.handleMouseMove(mockEvent);

      expect(mockCanvas.style.cursor).toBe("pointer");
    });

    test("handleMouseMove should not change cursor to pointer when not over a button", () => {
      mockEvent.clientX = 300;
      mockEvent.clientY = 300;

      display.handleMouseMove(mockEvent);

      expect(mockCanvas.style.cursor).toBe("default");
    });
  });

  test("addEventListeners should add listeners", () => {
    display.addEventListeners();

    expect(mockCanvas.addEventListener).toHaveBeenCalledWith(
      "click",
      display.boundHandleClick
    );
    expect(mockCanvas.addEventListener).toHaveBeenCalledWith(
      "mousemove",
      display.boundHandleMouseMove
    );
  });

  test("removeEventListeners should remove listeners", () => {
    display.removeEventListeners();

    expect(mockCanvas.removeEventListener).toHaveBeenCalledWith(
      "click",
      display.boundHandleClick
    );
    expect(mockCanvas.removeEventListener).toHaveBeenCalledWith(
      "mousemove",
      display.boundHandleMouseMove
    );
  });

  test("resetCanvas should remove listeners, reset cursor, and empty the button array", () => {
    jest.spyOn(display, "removeEventListeners");
    display.buttons = [{ text: "Play Again!" }, { text: "Display Scores" }];

    display.resetCanvas();

    expect(display.removeEventListeners).toHaveBeenCalled();
    expect(mockCanvas.style.cursor).toBe("default");
    expect(display.buttons).toEqual([]);
  });
});
