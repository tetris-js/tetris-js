import { Board } from './board'
import { Figure, shapeO } from './figure'
import { Game } from './game'

const renderNothing = () => {}
const getBoardRepresentation = (board: Board) =>
  '\n' +
  board.cells
    .map((row) => row.map((cell) => (cell.occupied ? 'x' : '_')).join(''))
    .join('\n')

describe('Game', () => {
  describe('addNewFigure', () => {
    it('should add a new figure', () => {
      const board = new Board(10, 10)
      const game = new Game(board, renderNothing)
      expect(game.figure).toBeNull()
      game.addNewFigure()
      expect(game.figure).toBeInstanceOf(Figure)
    })
  })

  describe('when the first line is not occupied', () => {
    it('should not lose', () => {
      const board = new Board(10, 10)
      const game = new Game(board, renderNothing)
      expect(game.hasLost).toBe(false)
    })
  })

  describe('when the first line is occupied', () => {
    it('should lose', () => {
      const board = new Board(10, 10)
      board.cells[0][2].occupied = true
      const game = new Game(board, renderNothing)
      expect(game.hasLost).toBe(true)
    })
  })

  describe('when there are completed lines', () => {
    describe('and the figure is fixed on this tick', () => {
      it('should remove the completed lines', () => {
        const board = new Board(10, 10)
        board.cells[2].forEach((cell, i) => (cell.occupied = i % 2 === 0))
        board.cells[3].forEach((cell) => (cell.occupied = true))
        board.cells[4].forEach((cell, i) => (cell.occupied = i % 2 === 0))
        board.cells[5].forEach((cell) => (cell.occupied = true))
        const game = new Game(board, renderNothing)
        game.addNewFigure(new Figure({ y: 8, x: 3 }, 0, shapeO))
        game.figure!.ticksToFix = 0
        game.tick()
        expect(getBoardRepresentation(board)).toBe(`
__________
__________
__________
__________
x_x_x_x_x_
x_x_x_x_x_
__________
__________
___xx_____
___xx_____`)
      })
    })
  })
})
