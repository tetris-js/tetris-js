import { Board } from './board'
import { Cell } from './cell'
import { Figure } from './figure'
import { render } from './grid'

export class Game {
  public figure: Figure | null = null
  private render: () => void
  private clockPeriod: number = 1000
  private clock: number | null = null
  public score: number = 9
  

  constructor(public board: Board, renderOutput: 'console' | 'web') {
    this.render = {
      console: this.renderToConsole,
      web: this.renderToWeb,
    }[renderOutput]
  }

  doGravity(): void {
    if (!this.figure) return
    if (!this.move('down')) {
      this.figure.ticksToFix = this.figure.ticksToFix ?? 5
    } else{
      this.figure.ticksToFix = null
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

  fixFigures(): boolean {
    if (!this.figure) return false

    if (this.figure.ticksToFix === null) return false
    if (this.figure.ticksToFix > 0) {
      this.figure.ticksToFix -= 1
      return false
    }

    for (let y = 0; y < this.figure.shape.cells.length; y++) {
      for (let x = 0; x < this.figure.shape.cells[y].length; x++) {

        const cell = this.figure.shape.cells[y][x]

        if(!cell.occupied) continue
        
        const boardY = this.figure.position.y + y
        const boardX = this.figure.position.x + x

        this.board.cells[boardY][boardX].occupied = true
    
    this.board.cells[boardY][boardX].color = this.figure.color
      }
    }

    this.figure = null
    return true
  }

  removeCompletedLines(): number {
    const rowsToRemove = this.board.cells
      .map((row, i) => (row.every((cell) => cell.occupied) ? i : null))
      .filter((i) => i !== null)
    let count = 0
    rowsToRemove.forEach((rowIndex) => {
      this.board.cells.splice(rowIndex! - count, 1)
      count++
    })
    const newLines = Array.from({ length: rowsToRemove.length }, () =>
      Array.from({ length: this.board.width }, () => new Cell(false)),
    )
    this.board.cells.unshift(...newLines)
    return count
  }

  hasLost(): boolean {
    return this.board.cells[0].some((cell) => cell.occupied)
  }

  private tick() {
    if (this.hasLost()) {
      this.board = new Board(this.board.height, this.board.width)
      this.figure = null
      alert('Has perdido')
      return
    }
    this.doGravity()
    
    const fixed = this.fixFigures()
    if (fixed) {
      let completedLines = this.removeCompletedLines()
      if (completedLines > 0){
        const scores = [10, 25, 45, 70]
        this.score += scores[completedLines-1]
      }
    }
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
    return !collides
  }

  dotick() {
    this.tick()
    this.render()
  }

  public pause() {
    this.clock && clearInterval(this.clock)
  }

  start() {
    setInterval(() => {
      this.render()
    }, 10)

    let lastTime = Date.now()
    const run = () => {
      this.clock = setInterval(() => {
        this.tick()
        const now = Date.now()
        const elapsed = now - lastTime
        if (elapsed > 5000) {
          this.clockPeriod = Math.max(this.clockPeriod - 100, 100)
          this.pause()
          run()
        }
      }, this.clockPeriod)
    }
    run()
  }

  private renderToWeb(): void {
    render(this)
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
