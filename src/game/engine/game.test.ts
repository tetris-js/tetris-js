import { Board } from './board'
import { Game } from './game'

describe('Game', () => {
  it('should be true', () => {
    const board = new Board(10, 10)
    const render = () => {}
    const game = new Game(board, render)
  })
})
