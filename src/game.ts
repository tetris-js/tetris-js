import { Board } from './board'
import { Cell } from './cell'
import { Figure } from './figure'

export class Game {
  private figure: Figure | null = null
  private render: () => void

  constructor(private board: Board, renderOutput: 'console' | 'web') {
    this.render = {
      console: this.renderToConsole,
      web: this.renderToWeb,
    }[renderOutput]
  }

  doGravity(): void {
    if (!this.figure) return
    if (!this.move('down')) {
      this.figure.ticksToFix = this.figure.ticksToFix ?? 5
    }
  }

  removeFigureFomBoard(): void {
    if (!this.figure) return
    for (let y = 0; y < this.figure.shape.cells.length; y++) {
      for (let x = 0; x < this.figure.shape.cells[y].length; x++) {
        if (!this.figure.shape.cells[y][x].occupied) continue
        const boardCell =
          this.board.cells[this.figure.position.y + y]?.[
            this.figure.position.x + x
          ]
        if (!boardCell) {
          console.error('this should never happen')
          continue
        }
        boardCell.occupied = false
        boardCell.color = undefined
      }
    }
  }

  updateCells(): void {
    if (!this.figure) return
    for (let y = 0; y < this.figure.shape.cells.length; y++) {
      for (let x = 0; x < this.figure.shape.cells[y].length; x++) {
        const cell = this.figure.shape.cells[y][x]
        const boardY = this.figure.position.y + y
        const boardX = this.figure.position.x + x
        const boardCell = this.board.cells[boardY]?.[boardX]
        if (!boardCell) {
          console.error('this should never happen')
          continue
        }
        if (cell.occupied) {
          boardCell.occupied = cell.occupied
          boardCell.color = this.figure.color
        }
      }
    }
  }

  fixFigures(): void {
    if (!this.figure) {
      console.log(1)
      return
    }
    if (this.figure.ticksToFix === null) {
      console.log(2)
      return
    }
    if (this.figure.ticksToFix > 0) {
      this.figure.ticksToFix -= 1
      return
    }
    this.figure = null
  }

  removeCompletedLines(): void {
    // TODO: this is not working now. It's adding new lines to the board
    return
    this.board.cells.filter((row) => !row.every((cell) => cell.occupied))
    this.board.cells.unshift(
      Array.from({ length: this.board.width }, () => new Cell(false)),
    )
  }

  hasLost(): boolean {
    return this.board.cells[0].some((cell) => cell.occupied)
  }

  private tick() {
    if (this.hasLost()) {
      this.board = new Board(this.board.height, this.board.width)
      this.figure = null
      // alert('Has perdido')
      return
    }
    this.doGravity()
    this.updateCells()
    this.fixFigures()
    this.removeCompletedLines()
    if (!this.figure) this.addNewFigure()
  }

  private addNewFigure(): void {
    const figure = new Figure({
      x: 3 + ((Math.random() * (this.board.cells[0].length - 7)) | 0),
      y: 0,
    })
    this.figure = figure
  }

  public move(direction: 'left' | 'right' | 'down'): boolean {
    if (!this.figure) return false
    this.removeFigureFomBoard()
    const clonedFigure = this.figure!.clone()
    clonedFigure.move(direction)
    const collides = this.board.collides(clonedFigure)
    if (!collides) {
      this.figure.move(direction)
    }
    this.updateCells()
    return !collides
  }

  public rotate(direction: 1 | -1): boolean {
    if (!this.figure) return false
    this.removeFigureFomBoard()
    const clonedFigure = this.figure!.clone()
    clonedFigure.rotate(direction)
    const collides = this.board.collides(clonedFigure)
    if (!collides) {
      this.figure.rotate(direction)
    }
    this.updateCells()
    return !collides
  }

  start() {
    setInterval(() => {
      console.log('tick!')
      this.tick()
      this.render()
    }, 100)
  }

  private renderToWeb(): void {
    // TODO: implement
  }

  private renderToConsole(): void {
    const frame = [`  ${this.board.cells[0].map((_, i) => i).join('')}`]
      .concat(
        this.board.cells.map((fila, i) => {
          const row = fila.map((celda) => (celda.occupied ? 'X' : '.')).join('')
          return `${i.toString().padStart(2)} ${row}`
        }),
      )
      .join('\n')
    console.clear()
    console.log(frame)
    console.log(this.figure)
  }
}
