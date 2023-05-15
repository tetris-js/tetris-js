import { Board } from './board'
import { Cell } from './cell'
import { Figure } from './figure'

export class Game {
  private render: () => void

  constructor(
    private board: Board,
    private figure: Figure,
    renderOutput: 'console' | 'web',
  ) {
    this.render = {
      console: this.renderToConsole,
      web: this.renderToWeb,
    }[renderOutput]
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
    this.board.cells.filter((row) => !row.every((cell) => cell.ocupada))
    this.board.cells.unshift(
      Array.from({ length: this.board.width }, () => new Cell(false)),
    )
  }
  hasLost(): boolean {
    // TODO: implement
    // comprobar si la figura se ha fijado en la parte superior del tablero
    return false
  }

  private tick() {
    if (this.hasLost()) {
      alert('Has perdido')
      return
    }
    this.doGravity()
    this.updateCells()
    this.fixFigures()
    this.removeCompletedLines()
    if (!this.figure) this.addNewFigure()
  }

  private addNewFigure(): void {
    this.figure = new Figure({ x: 0, y: 0 })
  }

  public move(direction: 'left' | 'right' | 'down'): void {}
  public rotate(direction: 1 | -1): void {}

  // on(
  //   action: 'move',
  //   { direction }: { direction: 'left' | 'right' | 'down' },
  // ): void {
  //   // TODO: implement
  //   // comprobar si el movimiento es solo 1 de distancia
  //   // comprobar si la nueva posicion esta dentro del tablero
  //   // comprobar si la nueva posicion no colisiona con ninguna celda fijada
  // }

  // on(action: 'rotate', { direction }: { direction: 1 | -1 }): void {}

  start() {
    setInterval(() => {
      this.tick()
      this.render()
    }, 1000)
  }

  private renderToWeb(): void {
    // TODO: implement
  }

  private renderToConsole(): void {
    const frame = this.board.cells
      .map((fila) => {
        const row = fila.map((celda) => (celda.ocupada ? 'X' : '.')).join('')
        return row
      })
      .join('\n')
    console.clear()
    console.log(frame)
    console.log(this.figure)
  }
}
