import { Tablero } from './board'
import { Figura } from './figure'

export class Game {
  render: () => void

  constructor(public tablero: Tablero, renderOutput: 'console' | 'web') {
    this.render = {
      console: this.renderToConsole,
      web: this.renderToWeb,
    }[renderOutput]
  }

  tick() {
    if (this.tablero.isPerdido()) {
      alert('Has perdido')
      return
    }
    this.tablero.doGravity()
    this.tablero.updateCeldas()
    this.tablero.fijar()
    this.tablero.eliminarLineasCompletas()
    if (!this.tablero.figura) this.crearFigura()
  }

  crearFigura(): void {
    this.tablero.figura = new Figura({ x: 0, y: 0 })
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
    const frame = this.tablero.celdas
      .map((fila) => {
        const row = fila.map((celda) => (celda.ocupada ? 'X' : '.')).join('')
        return row
      })
      .join('\n')
    console.clear()
    console.log(frame)
    console.log(this.tablero.figura)
  }
}
