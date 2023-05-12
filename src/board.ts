import { Cell } from './cell'
import { Figure } from './figure'

export class Board {
  constructor(
    public height: number,
    public width: number,
    public cells: Cell[][] = [],
    public figure: Figure | null = null,
  ) {
    this.cells = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => new Cell(false)),
    )
  }

  doGravity(): void {
    if (!this.figure) return
    const newPos = this.figure.clone()
    newPos.move('down')
    if (this.figure.canMove(newPos)) {
      this.figure.move('down')
    }
  }

  updateCells(): void {
    // TODO: implement
    // actualizar el estado de las celdas en función de la figura
  }

  fixFigures(): void {
    // TODO: implement
  }

  removeCompletedLines(): void {
    this.cells.filter(row => !row.every((cell) => cell.ocupada))
    this.cells.unshift(Array.from({ length: this.width }, () => new Cell(false)))
    // optimizacion: comprobar solo las lineas donde se ha fijado la figura
  }
  hasLost(): boolean {
    // TODO: implement
    // comprobar si la figura se ha fijado en la parte superior del tablero
    return false
  }
}
