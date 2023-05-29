import { Game } from '../engine/game'

export const render = (game: Game) => {
  const board = game.board
  const figure = game.figure
  const grid = document.getElementById('grid')!
  if (grid.children.length === 0) {
    grid.style.gridTemplateColumns = `repeat(${game.board.width}, 1rem)`
    grid.style.gridTemplateRows = `repeat(${game.board.height}, 1rem)`
    for (let i = 0; i < game.board.width * game.board.height; i++) {
      const cell = document.createElement('div')
      cell.classList.add('cell')
      grid.appendChild(cell)
    }
    document.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') game.move('left')
      if (event.key === 'ArrowRight') game.move('right')
      if (event.key === 'ArrowDown') game.move('down')
      if (event.key === 'ArrowUp') game.rotate(1)
      if (event.key === 't') game.tick()
      if (event.key === 'Escape') {
        if (game.isPaused) game.resume()
        else game.pause()
      }
    })
  }

  let virtualBoard: Array<string | undefined> = []

  board.cells.forEach((row) => {
    row.forEach((cell) => {
      virtualBoard.push(cell.color)
    })
  })

  if (figure) {
    for (let y = 0; y < figure.cells.length; y++) {
      for (let x = 0; x < figure.cells[y].length; x++) {
        const cell = figure.cells[y][x]

        if (!cell.occupied) continue

        const boardY = figure.position.y + y
        const boardX = figure.position.x + x

        virtualBoard[boardY * board.width + boardX] = figure.color
      }
    }
  }

  virtualBoard.forEach((color, i) => {
    if (color === undefined) {
      grid.children[i].classList.value = 'cell'
      return
    }
    grid.children[i].classList.value = 'cell occupied ' + color
  })

  document.getElementById('points')!.innerText = game.score.toString()
  document.getElementById('debug')!.innerText = JSON.stringify({
    ...game,
    board: 'redacted',
  })
}
