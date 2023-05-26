import { Cell } from './cell'
import { Figure } from './figure'

export class Board {
  constructor(
    public height: number,
    public width: number,
    public cells: Cell[][] = [],
  ) {
    this.cells = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => new Cell(false)),
    )
  }

  public collides(figure: Figure): boolean {
    for (let y = 0; y < figure.shape.cells.length; y++) {
      for (let x = 0; x < figure.shape.cells[y].length; x++) {
        const cell = figure.shape.cells[y][x]
        const boardCell =
          this.cells[figure.position.y + y]?.[figure.position.x + x]
        if (!cell.occupied) continue
        if (!boardCell || boardCell.occupied) return true
      }
    }
    return false
  }
}
