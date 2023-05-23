import { Board } from './board.ts'
import { Game } from './game.ts'
import './style.css'

const game = new Game(new Board(20, 10), 'web')
game.start()

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') game.move('left')
  if (event.key === 'ArrowRight') game.move('right')
  if (event.key === 'ArrowDown') game.move('down')
  if (event.key === 'ArrowUp') game.rotate(1)
})
