import { Board } from './board'
import { Figure } from './figure'

export class Game {
  render: () => void

  constructor(public board: Board, renderOutput: 'console' | 'web') {
    this.render = {
      console: this.renderToConsole,
      web: this.renderToWeb,
    }[renderOutput]
  }

  tick() {
    if (this.board.hasLost()) {
      alert('Has perdido')
      return
    }
    this.board.doGravity()
    this.board.updateCells()
    this.board.fixFigures()
    this.board.removeCompletedLines()
    if (!this.board.figure) this.addNewFigure()
  }

  addNewFigure(): void {
    this.board.figure = new Figure({ x: 0, y: 0 })
  }

  start() {
    setInterval(() => {
      this.tick()
      this.render()
    }, 1000)
  }

  renderToWeb() {
    // TODO: implement
  }

  renderToConsole() {
    const frame = this.board.cells
      .map((fila) => {
        const row = fila.map((celda) => (celda.ocupada ? 'X' : '.')).join('')
        return row
      })
      .join('\n')
    console.clear()
    console.log(frame)
    console.log(this.board.figure)
  }
}
