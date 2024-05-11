import { MazeManager } from "./mazeManager";

describe("MazeManager", () => {
  let mazeManager;
  const originalMaze = [
    [1, 0, 2],
    [0, 3, 4],
    [5, 1, 6],
  ];

  beforeEach(() => {
    mazeManager = new MazeManager(originalMaze);
  });

  test("should reset the maze correctly", () => {
    mazeManager.maze[0][0] = 9;
    mazeManager.resetMaze();
    expect(mazeManager.maze[0][0]).toBe(1);
  });

  test("should return correct maze dimensions", () => {
    expect(mazeManager.getMazeWidth()).toBe(3);
    expect(mazeManager.getMazeHeight()).toBe(3);
  });

  test("should accurately report wall presence", () => {
    expect(mazeManager.hasWall(0, 0)).toBeTruthy();
    expect(mazeManager.hasWall(1, 0)).toBeFalsy();
  });

  test("should identify walkable cells correctly", () => {
    expect(mazeManager.isWalkable(1, 0)).toBeTruthy();
    expect(mazeManager.isWalkable(0, 0)).toBeFalsy();
  });

  test("should manage pellet and power pellet queries and modifications", () => {
    expect(mazeManager.hasPellet(2, 0)).toBeTruthy();
    mazeManager.clearPellet(2, 0);
    expect(mazeManager.hasPellet(2, 0)).toBeFalsy();
  });
});
