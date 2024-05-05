export class PelletManager {
  static color = "#f3f4f6";

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

  reset() {
    this.pelletCount = 0;
    this.initializePellets();
  }

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
