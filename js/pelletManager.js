export class PelletManager {
  static color = "#f3f4f6";

  /**
   * Constructs a new instance of the PelletManager class.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw pellets.
   * @param {MazeManager} mazeManager - The maze manager that handles maze logic and pellet positions.
   * @param {number} cellSize - The size of each cell in the maze, used to scale pellets appropriately.
   */
  constructor(ctx, mazeManager, cellSize) {
    this.ctx = ctx;
    this.mazeManager = mazeManager;
    this.cellSize = cellSize;
    this.pelletRadius = this.cellSize / 10;
    this.powerPelletRadius = this.cellSize / 3;
    this.cellCenter = this.cellSize / 2;
    this.pelletCount = 0;
    this.initializePellets();
  }

  /**
   * Resets the pellet count and reinitializes the pellet positions based on the maze configuration.
   * This method is invoked when the game restarts.
   */
  reset() {
    this.pelletCount = 0;
    this.initializePellets();
  }

  /**
   * Initializes pellets by counting all pellets and power pellets present in the maze.
   * This method is called at construction or when resetting the game state.
   */
  initializePellets() {
    this.pelletCount = 0;
    for (let row = 0; row < this.mazeManager.getMazeHeight(); row++) {
      for (let col = 0; col < this.mazeManager.getMazeWidth(); col++) {
        if (
          this.mazeManager.hasPellet(col, row) ||
          this.mazeManager.hasPowerPellet(col, row)
        ) {
          this.pelletCount++;
        }
      }
    }
  }

  /**
   * Draws a single pellet at a specified grid position with a given radius.
   * @param {number} x - The x-coordinate of the pellet in the maze grid.
   * @param {number} y - The y-coordinate of the pellet in the maze grid.
   * @param {number} radius - The radius of the pellet to be drawn.
   */
  drawPellet(x, y, radius) {
    this.ctx.beginPath();
    this.ctx.arc(
      x * this.cellSize + this.cellCenter,
      y * this.cellSize + this.cellCenter,
      radius,
      0,
      2 * Math.PI
    );
    this.ctx.fill();
  }

  /**
   * Draws all pellets and power pellets in the maze.
   * Iterates over each cell in the maze grid and draws a pellet if one is present.
   */
  draw() {
    this.ctx.fillStyle = PelletManager.color;
    for (let row = 0; row < this.mazeManager.getMazeHeight(); row++) {
      for (let col = 0; col < this.mazeManager.getMazeWidth(); col++) {
        if (this.mazeManager.hasPellet(col, row)) {
          this.drawPellet(col, row, this.pelletRadius);
        } else if (this.mazeManager.hasPowerPellet(col, row)) {
          this.drawPellet(col, row, this.powerPelletRadius);
        }
      }
    }
  }
}
