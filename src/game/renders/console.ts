import { Game } from '../engine/game'

export const render = (game: Game) => {
  const frame = [`  ${game.board.cells[0].map((_, i) => i).join('')}`]
    .concat(
      game.board.cells.map((fila, i) => {
        const row = fila.map((celda) => (celda.occupied ? 'X' : '.')).join('')
        return `${i.toString().padStart(2)} ${row}`
      }),
    )
    .join('\n')
  console.clear()
  console.log(frame)
  console.log(game.figure)
}
