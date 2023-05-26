import { Board } from './game/engine/board'
import { Game } from './game/engine/game'
import { render as webRender } from './game/renders/web'
import './style.css'

const game = new Game(new Board(40, 10), webRender)
game.on('lose', () => {
  console.log('You lose!')
})
game.start()
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
