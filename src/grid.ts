import { Board } from './board'

export const render = (board: Board) => {
  const grid = document.getElementById('grid')!
  if (grid.children.length === 0) {
    for (let i = 0; i < 200; i++) {
      const cell = document.createElement('div')
      cell.classList.add('cell')
      grid.appendChild(cell)
    }
  }
  board.cells.forEach((row, y) => {
    row.forEach((cell, x) => {
      const cellElement = grid.children[y * board.width + x]
      cellElement.classList.toggle('occupied', cell.occupied)
      cellElement.classList.remove('red')
      cellElement.classList.remove('blue')
      cellElement.classList.remove('green')
      cellElement.classList.remove('yellow')
      cellElement.classList.remove('purple')
      cellElement.classList.remove('orange')
      cellElement.classList.remove('white')
      cell.color && cellElement.classList.toggle(cell.color, cell.occupied)
    })
  })
}
