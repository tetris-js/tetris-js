import { Board } from './board'
import { Cell } from './cell'
import { Figure } from './figure'
import { render } from './grid'

type GameEventname = 'completedLines' | 'lose'
interface Events {
  completedLines: Array<(arg: { count: number }) => void>
  lose: Array<() => void>
}

export class Game {
  public figure: Figure | null = null
  private render: () => void
  private clockPeriod: number = 300
  private clock: number | null = null
  public score: number = 0
  private eventCallbacks: Events = {
    completedLines: [],
    lose: [],
  }

  constructor(public board: Board, renderOutput: 'console' | 'web') {
    this.render = {
      console: this.renderToConsole,
      web: this.renderToWeb,
    }[renderOutput]
  }

  public on(name: GameEventname, callback: (...arg: unknown[]) => void): void {
    this.eventCallbacks[name]!.push(callback)
  }

  private doGravity(): void {
    if (!this.figure) return
    if (!this.move('down', { isGravity: true })) {
      this.figure.ticksToFix = this.figure.ticksToFix ?? 5
    } else {
      this.figure.ticksToFix = null
    }
  }

  private fixFigures(): boolean {
    if (!this.figure) return false

    if (this.figure.ticksToFix === null) return false
    if (this.figure.ticksToFix > 0) {
      this.figure.ticksToFix -= 1
      return false
    }

    for (let y = 0; y < this.figure.shape.cells.length; y++) {
      for (let x = 0; x < this.figure.shape.cells[y].length; x++) {
        const cell = this.figure.shape.cells[y][x]

        if (!cell.occupied) continue

        const boardY = this.figure.position.y + y
        const boardX = this.figure.position.x + x

        this.board.cells[boardY][boardX].occupied = true

        this.board.cells[boardY][boardX].color = this.figure.color
      }
    }

    this.figure = null
    return true
  }

  private removeCompletedLines(): number {
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
    this.eventCallbacks.completedLines?.forEach((callback) =>
      callback({ count }),
    )
    return count
  }

  public get hasLost(): boolean {
    return this.board.cells[0].some((cell) => cell.occupied)
  }

  private tick() {
    if (this.hasLost) {
      this.eventCallbacks.lose?.forEach((callback) => callback())
      this.board = new Board(this.board.height, this.board.width)
      this.figure = null
      return
    }
    this.doGravity()

    const fixed = this.fixFigures()
    if (fixed) {
      let completedLines = this.removeCompletedLines()
      if (completedLines > 0) {
        const scores = [10, 25, 45, 70]
        this.score += scores[completedLines - 1]
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

  public move(
    direction: 'left' | 'right' | 'down',
    { isGravity }: { isGravity: boolean } = { isGravity: false },
  ): boolean {
    if (!this.figure) return false
    const clonedFigure = this.figure!.clone()
    clonedFigure.move(direction)
    const collides = this.board.collides(clonedFigure)
    if (!collides) {
      this.figure.move(direction)
      if (direction === 'down' && !isGravity) {
        this.score += 1
      }
    }
    return !collides
  }

  public rotate(direction: 1 | -1): boolean {
    if (!this.figure) return false
    const clonedFigure = this.figure!.clone()
    clonedFigure.rotate(direction)
    const collides = this.board.collides(clonedFigure)
    if (!collides) {
      this.figure.rotate(direction)
    }
    return !collides
  }

  get isPaused(): boolean {
    return this.clock === null
  }

  public pause() {
    if (this.clock) {
      clearInterval(this.clock)
      this.clock = null
    }
  }

  public resume() {
    // let lastTime = Date.now()
    let lastScore = this.score
    this.clock = setInterval(() => {
      console.log('tick')
      this.tick()
      // const now = Date.now()
      // const elapsed = now - lastTime
      if (this.score % 100 === 0 && this.score !== lastScore) {
        this.clockPeriod = Math.max(this.clockPeriod - 50, 50)
        this.pause()
        this.resume()
        lastScore = this.score
      }
    }, this.clockPeriod)
  }

  public start() {
    setInterval(() => {
      this.render()
    }, 10)

    this.resume()
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
