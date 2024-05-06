export class WallManager {
  static borderThickness = 3;
  static borderColor = "teal";

  /**
   * Constructor for the WallManager class.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw walls.
   * @param {MazeManager} mazeManager - The maze manager that provides maze structure and wall positions.
   * @param {number} cellSize - The size of each cell in the maze.
   */
  constructor(ctx, mazeManager, cellSize) {
    this.ctx = ctx;
    this.mazeManager = mazeManager;
    this.width = cellSize;
    this.height = cellSize;
  }

  /**
   * Draws the top border of a cell if there is no connecting wall above.
   * @param {number} x - The x-coordinate (column) of the cell in the maze.
   * @param {number} y - The y-coordinate (row) of the cell in the maze.
   */
  drawTopBorder(x, y) {
    this.ctx.beginPath();
    this.ctx.moveTo(x * this.width, y * this.height);
    this.ctx.lineTo((x + 1) * this.width, y * this.height);
    this.ctx.stroke();
  }

  /**
   * Draws the bottom border of a cell if there is no connecting wall below.
   * @param {number} x - The x-coordinate (column) of the cell.
   * @param {number} y - The y-coordinate (row) of the cell.
   */
  drawBottomBorder(x, y) {
    this.ctx.beginPath();
    this.ctx.moveTo(x * this.width, (y + 1) * this.height);
    this.ctx.lineTo((x + 1) * this.width, (y + 1) * this.height);
    this.ctx.stroke();
  }

  /**
   * Draws the left border of a cell if there is no connecting wall to the left.
   * @param {number} x - The x-coordinate (column) of the cell.
   * @param {number} y - The y-coordinate (row) of the cell.
   */
  drawLeftBorder(x, y) {
    this.ctx.beginPath();
    this.ctx.moveTo(x * this.width, y * this.height);
    this.ctx.lineTo(x * this.width, (y + 1) * this.height);
    this.ctx.stroke();
  }

  /**
   * Draws the right border of a cell if there is no connecting wall to the right.
   * @param {number} x - The x-coordinate (column) of the cell.
   * @param {number} y - The y-coordinate (row) of the cell.
   */
  drawRightBorder(x, y) {
    this.ctx.beginPath();
    this.ctx.moveTo((x + 1) * this.width, y * this.height);
    this.ctx.lineTo((x + 1) * this.width, (y + 1) * this.height);
    this.ctx.stroke();
  }

  /**
   * Draws a white door for the ghost lair located at the specified cell.
   * @param {number} x - The x-coordinate (column) of the cell.
   * @param {number} y - The y-coordinate (row) of the cell.
   */
  drawGhostLairDoor(x, y) {
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(
      x * this.width,
      y * this.height + this.height / 3,
      this.width,
      this.height / 3
    );
  }

  /**
   * Iterates over the entire maze and draws borders for each cell that has walls,
   * based on the adjacent cells' wall presence to create the maze structure.
   * Also handles the drawing of ghost lair doors.
   */
  draw() {
    this.ctx.lineWidth = WallManager.borderThickness;
    this.ctx.strokeStyle = WallManager.borderColor;

    for (let row = 0; row < this.mazeManager.getMazeHeight(); row++) {
      for (let col = 0; col < this.mazeManager.getMazeWidth(); col++) {
        if (this.mazeManager.hasWall(col, row)) {
          const hasWallAbove =
            row > 0 && this.mazeManager.hasWall(col, row - 1);
          const hasWallBelow =
            row < this.mazeManager.getMazeHeight() - 1 &&
            this.mazeManager.hasWall(col, row + 1);
          const hasWallLeft = col > 0 && this.mazeManager.hasWall(col - 1, row);
          const hasWallRight =
            col < this.mazeManager.getMazeWidth() - 1 &&
            this.mazeManager.hasWall(col + 1, row);

          if (!hasWallAbove) this.drawTopBorder(col, row);
          if (!hasWallBelow) this.drawBottomBorder(col, row);
          if (!hasWallLeft) this.drawLeftBorder(col, row);
          if (!hasWallRight) this.drawRightBorder(col, row);
        } else if (this.mazeManager.hasGhostLairDoor(col, row)) {
          this.drawGhostLairDoor(col, row);
        }
      }
    }
  }
}
