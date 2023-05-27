import { Board } from './board'
import { Figure, Rotation, Shape, shapeL, shapeO, shapeS } from './figure'

const collisionTests: Array<{
  boardCells: Array<[number, number]>
  figureData: { y: number; x: number; rotation: Rotation; shape: Shape }
  collides: boolean
}> = [
  {
    boardCells: [[4, 4]],
    figureData: { y: 4, x: 4, rotation: 0, shape: shapeO },
    collides: true,
  },
  {
    boardCells: [[4, 4]],
    figureData: { y: 0, x: 0, rotation: 0, shape: shapeO },
    collides: false,
  },
  {
    boardCells: [[0, 0]],
    figureData: { y: 0, x: 0, rotation: 0, shape: shapeO },
    collides: true,
  },
  {
    boardCells: [[2, 1]],
    figureData: { y: 0, x: 0, rotation: 0, shape: shapeL },
    collides: true,
  },
  {
    boardCells: [[1, 1]],
    figureData: { y: 0, x: 0, rotation: 0, shape: shapeL },
    collides: false,
  },
  {
    boardCells: [[1, 0]],
    figureData: { y: 0, x: 0, rotation: 1, shape: shapeL },
    collides: true,
  },
  {
    boardCells: [[1, 1]],
    figureData: { y: 0, x: 0, rotation: 1, shape: shapeL },
    collides: false,
  },
  {
    boardCells: [[9, 9]],
    figureData: { y: 8, x: 7, rotation: 0, shape: shapeS },
    collides: false,
  },
  {
    boardCells: [[8, 9]],
    figureData: { y: 8, x: 7, rotation: 0, shape: shapeS },
    collides: true,
  },
]

describe('Board', () => {
  collisionTests.forEach(({ boardCells, figureData, collides }) => {
    describe(`when board cells are ${boardCells}, and the figure is ${
      figureData.shape.name
    }, and it's at ${[figureData.y, figureData.x]}`, () => {
      it(`should ${collides ? '' : 'not '}collide`, () => {
        const board = new Board(10, 10)
        boardCells.forEach(([y, x]) => (board.cells[y][x].occupied = true))
        const figure = new Figure(
          { y: figureData.y, x: figureData.x },
          figureData.rotation,
          figureData.shape,
        )
        expect(board.collides(figure)).toBe(collides)
      })
    })
  })
})
