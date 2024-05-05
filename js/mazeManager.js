export class MazeManager {
  constructor(originalMaze) {
    this.originalMaze = originalMaze;
    this.resetMaze();
  }

  resetMaze = () => (this.maze = this.originalMaze.map((row) => [...row]));
  getMaze = () => this.maze;

  getMazeWidth = () => this.maze[0].length;
  getMazeHeight = () => this.maze.length;
  getCellType = (col, row) => this.maze[row][col];

  hasWall = (col, row) => this.maze[row][col] === 1;
  hasInvisibleWall = (col, row) => this.maze[row][col] === 6;
  hasGhostLair = (col, row) => this.maze[row][col] === 3;
  hasGhostLairDoor = (col, row) => this.maze[row][col] === 5;
  isWalkable = (col, row) =>
    !this.hasWall(col, row) &&
    !this.hasGhostLair(col, row) &&
    !this.hasGhostLairDoor(col, row);

  hasPellet = (col, row) => this.maze[row][col] === 2;
  hasPowerPellet = (col, row) => this.maze[row][col] === 4;
  clearPellet = (col, row) => (this.maze[row][col] = 0);
}
