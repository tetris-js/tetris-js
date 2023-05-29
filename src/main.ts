import { Board } from './game/engine/board'
import { Game } from './game/engine/game'
import { render as webRender } from './game/renders/web'
import './style.css'

const game = new Game(new Board(20, 10), webRender)
game.on('lose', () => {
  console.log('You lose!')
})
game.start()
