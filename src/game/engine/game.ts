import { Board } from './board'
import { Cell } from './cell'
import { Figure } from './figure'

interface Events {
  completedLines: Array<(arg: { count: number }) => void>
  lose: Array<() => void>
  tick: Array<() => void>
}

export interface GameConfig {
  nextFigureHintNumber: number
  initialGameClockPeriod: number
  initialScore: number
  multipleLineScoreMultiplier: number[]
  scoreLevelStep: number
  minimumGameClockPeriod: number
  renderClockPeriod: number
  levelGameClockStep: number
  moveDownScorePoints: number
  newFigurePaddingX: number
  newFigurePaddingTop: number
}

const defaultGameConfig: GameConfig = {
  // number of figures to show in the next figure hint
  nextFigureHintNumber: 3,
  // how often the game is rendered in ms
  renderClockPeriod: 10,
  // initial game clock (used for difficulty) in ms
  initialGameClockPeriod: 300,
  // minimum game clock (used for difficulty) in ms. 100 means the game clock
  // will never be faster than 100ms.
  minimumGameClockPeriod: 100,
  // how much the game clock is reduced when the player levels up
  levelGameClockStep: 50,
  // score multiplier when multiple lines are completed at once. Each index
  // score the player has to reach to level up. E.g. 100, 200, 300, etc.
  scoreLevelStep: 100,
  // represents the number of lines completed at once, and the value is the
  // multiplier. For example, if the player completes 2 lines at once, the
  // score will be multiplied by 25.
  multipleLineScoreMultiplier: [10, 25, 45, 70],
  // how many points the player gets when moving down
  moveDownScorePoints: 1,
  initialScore: 0,
  // how many cells on the X axis to NOT use when generating a new figure
  newFigurePaddingX: 3,
  // how many cells will the new figure be from the top
  newFigurePaddingTop: 0,
}

export class Game {
  // these are set on reset()
  private clockPeriod!: number
  public score!: number
  public figure!: Figure | null
  public nextFigures!: Figure[]

  private clock: NodeJS.Timer | null = null
  private eventCallbacks: Events = {
    completedLines: [],
    lose: [],
    tick: [],
  }
  public config: GameConfig

  constructor(
    public board: Board,
    private render: (game: Game) => void,
    config: Partial<GameConfig> = {},
  ) {
    this.config = { ...defaultGameConfig, ...config }
    this.reset({ board: false })
  }

  public on(name: keyof Events, callback: (...arg: unknown[]) => void): void {
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

    for (let y = 0; y < this.figure.cells.length; y++) {
      for (let x = 0; x < this.figure.cells[y].length; x++) {
        const cell = this.figure.cells[y][x]

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

  public reset({ board }: { board: boolean } = { board: true }): void {
    if (board) {
      this.board = new Board(this.board.height, this.board.width)
    }
    this.figure = null
    this.nextFigures = []
    this.score = this.config.initialScore
    this.clockPeriod = this.config.initialGameClockPeriod
  }

  public tick() {
    if (this.hasLost) {
      this.eventCallbacks.lose?.forEach((callback) => callback())
      this.reset()
      return
    }
    this.doGravity()

    const fixed = this.fixFigures()
    if (fixed) {
      let completedLines = this.removeCompletedLines()
      if (completedLines > 0) {
        const scores = this.config.multipleLineScoreMultiplier
        this.score += scores[completedLines - 1]
      }
    }
    this.addNewFigures()
    this.eventCallbacks.tick?.forEach((callback) => callback())
  }

  private addNewFigures(): void {
    const numberOfFiguresToAdd =
      this.config.nextFigureHintNumber -
      this.nextFigures.length +
      (this.figure === null ? 1 : 0)
    if (numberOfFiguresToAdd > 0) {
      for (let i = 0; i < numberOfFiguresToAdd; i++) {
        const randomizedPositionX =
          this.config.newFigurePaddingX +
          ((Math.random() *
            (this.board.cells[0].length - this.config.newFigurePaddingX * 2)) |
            0)
        this.nextFigures.push(
          new Figure({
            x: randomizedPositionX,
            y: this.config.newFigurePaddingTop,
          }),
        )
      }
    }

    if (this.figure === null) {
      this.figure = this.nextFigures.shift()!
    }
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
        this.score += this.config.moveDownScorePoints
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
    let lastLevel = (this.score / this.config.scoreLevelStep) | 0
    this.clock = setInterval(() => {
      this.tick()
      const currentLevel = (this.score / this.config.scoreLevelStep) | 0
      if (currentLevel > lastLevel) {
        this.clockPeriod = Math.max(
          this.clockPeriod - this.config.levelGameClockStep,
          this.config.minimumGameClockPeriod,
        )
        this.pause()
        this.resume()
      }
      lastLevel = currentLevel
    }, this.clockPeriod)
  }

  public start() {
    setInterval(() => {
      this.render(this)
    }, this.config.renderClockPeriod)

    this.resume()
  }
}
