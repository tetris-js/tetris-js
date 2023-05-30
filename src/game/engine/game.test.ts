import { Board } from './board'
import { Figure, shapeL, shapeO } from './figure'
import { Game } from './game'

const renderNothing = () => {}
const getBoardRepresentation = (board: { cells: Board['cells'] }) =>
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
      game.figure = new Figure({ x: 3, y: 0 })
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

  describe('when the figure is at the bottom', () => {
    describe("and it's been there for a while", () => {
      it('should fix', () => {
        const board = new Board(10, 10)
        const game = new Game(board, renderNothing)
        game.figure = new Figure({ y: 7, x: 3 }, 0, shapeL)
        game.tick()
        game.tick()
        game.tick()
        game.tick()
        game.tick()
        game.tick()
        expect(getBoardRepresentation(board)).toMatchInlineSnapshot(`
          "
          __________
          __________
          __________
          __________
          __________
          __________
          __________
          ___x______
          ___x______
          ___xx_____"
        `)
      })
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
        game.figure = new Figure({ y: 8, x: 3 }, 0, shapeO)
        game.figure!.ticksToFix = 0
        game.tick()
        expect(getBoardRepresentation(board)).toMatchInlineSnapshot(`
          "
          __________
          __________
          __________
          __________
          x_x_x_x_x_
          x_x_x_x_x_
          __________
          __________
          ___xx_____
          ___xx_____"
        `)
      })
    })
  })

  describe('when the figure can move to the right', () => {
    describe('and the figure is moved to the right', () => {
      it('should move to the right', () => {
        const board = new Board(10, 10)
        const game = new Game(board, renderNothing)
        game.figure = new Figure({ y: 3, x: 1 }, 0, shapeL)
        expect(game.move('right')).toBe(true)
        expect(getBoardRepresentation(board)).toMatchInlineSnapshot(`
          "
          __________
          __________
          __________
          __________
          __________
          __________
          __________
          __________
          __________
          __________"
        `)
        expect(game.figure?.position).toMatchObject({ y: 3, x: 2 })
      })
    })
  })

  describe('when the figure can move down', () => {
    describe('and gravity is applied', () => {
      it('should move down', () => {
        const board = new Board(10, 10)
        const game = new Game(board, renderNothing)
        game.figure = new Figure({ y: 3, x: 1 }, 0, shapeL)
        game.tick()
        expect(game.figure?.position).toMatchObject({ y: 4, x: 1 })
      })

      it('should not add points to the score', () => {
        const board = new Board(10, 10)
        const game = new Game(board, renderNothing)
        game.figure = new Figure({ y: 3, x: 1 }, 0, shapeL)
        game.tick()
        expect(game.score).toBe(0)
      })
    })

    describe('and the figure is moved down', () => {
      it('should move down', () => {
        const board = new Board(10, 10)
        const game = new Game(board, renderNothing)
        game.figure = new Figure({ y: 3, x: 1 }, 0, shapeL)
        expect(game.move('down')).toBe(true)
        expect(game.figure?.position).toMatchObject({ y: 4, x: 1 })
      })

      it('should add points to the score', () => {
        const board = new Board(10, 10)
        const game = new Game(board, renderNothing)
        game.figure = new Figure({ y: 3, x: 1 }, 0, shapeL)
        expect(game.move('down')).toBe(true)
        expect(game.score).toBe(1)
      })
    })
  })

  describe('when there is no figure', () => {
    describe('and move is called', () => {
      it('should not crash', () => {
        const board = new Board(10, 10)
        const game = new Game(board, renderNothing)
        expect(() => game.move('down')).not.toThrow()
      })
    })
  })

  describe('when the figure is rotated', () => {
    describe('and there is no figure', () => {
      it('should not crash', () => {
        const board = new Board(10, 10)
        const game = new Game(board, renderNothing)
        expect(() => game.rotate(1)).not.toThrow()
      })
    })

    describe('and it can rotate', () => {
      it('should rotate', () => {
        const board = new Board(10, 10)
        const game = new Game(board, renderNothing)
        game.figure = new Figure({ y: 3, x: 1 }, 0, shapeL)
        game.rotate(1)
        expect(game.figure?.rotation).toBe(1)
        game.rotate(1)
        expect(game.figure?.rotation).toBe(2)
      })
    })

    describe('and it cannot rotate', () => {
      it('should not rotate', () => {
        const board = new Board(10, 10)
        const game = new Game(board, renderNothing)
        game.figure = new Figure({ y: 3, x: 8 }, 0, shapeL)
        expect(game.rotate(1)).toBe(false)
        expect(game.figure?.rotation).toBe(0)
      })
    })
  })

  describe('when the game is started', () => {
    it('should call the render', () => {
      const board = new Board(10, 10)
      const render = vi.fn()
      const game = new Game(board, render)
      vi.useFakeTimers()
      game.start()
      vi.advanceTimersByTime(50)
      vi.useRealTimers()
      expect(render).toHaveBeenCalled()
    })

    it('should resume the game', () => {
      const board = new Board(10, 10)
      const game = new Game(board, renderNothing)
      const mockResume = vi.fn()
      Object.defineProperty(game, 'resume', { value: mockResume })
      game.start()
      expect(mockResume).toHaveBeenCalled()
    })

    describe('and pause is called', () => {
      describe('isPaused', () => {
        it('should be true', () => {
          const board = new Board(10, 10)
          const game = new Game(board, renderNothing)
          game.start()
          game.pause()
          expect(game.isPaused).toBe(true)
        })
      })

      it('should pause the game', () => {
        const board = new Board(10, 10)
        const game = new Game(board, renderNothing)
        const mockTick = vi.fn()
        Object.defineProperty(game, 'tick', { value: mockTick })
        vi.useFakeTimers()
        game.start()
        vi.advanceTimersByTime(5000)
        expect(mockTick).toHaveBeenCalledTimes(16)
        game.pause()
        vi.advanceTimersByTime(5000)
        expect(mockTick).toHaveBeenCalledTimes(16)
        vi.useRealTimers()
      })
    })

    describe('and score grows', () => {
      it('should increase difficulty', () => {
        const board = new Board(100, 10)
        const game = new Game(board, renderNothing)
        const mockTick = vi.fn()
        Object.defineProperty(game, 'tick', { value: mockTick })
        vi.useFakeTimers()
        game.start()
        vi.advanceTimersByTime(5000)
        expect(mockTick).toHaveBeenCalledTimes(16)
        game.figure = new Figure({ x: 3, y: 0 })
        game.score = 99
        game.move('down')
        expect(game.score).toBe(100)
        vi.advanceTimersByTime(5000)
        expect(mockTick).toHaveBeenCalledTimes(36)
        vi.useRealTimers()
      })
    })

    describe('and the game is lost', () => {
      it('should reset the game', () => {
        const board = new Board(10, 10)
        board.cells[0].forEach((cell) => (cell.occupied = true))
        const game = new Game(board, renderNothing)
        vi.useFakeTimers()
        game.start()
        expect(game.hasLost).toBe(true)
        vi.advanceTimersByTime(5000)
        expect(getBoardRepresentation({ cells: game.board.cells.slice(0, 3) }))
          .toMatchInlineSnapshot(`
          "
          __________
          __________
          __________"
        `)
        vi.useRealTimers()
      })
    })
  })

  describe('when the game has not been started', () => {
    describe('isPaused', () => {
      it('should be true', () => {
        const board = new Board(10, 10)
        const game = new Game(board, renderNothing)
        expect(game.isPaused).toBe(true)
      })
    })
  })

  describe('event', () => {
    describe('completedLines', () => {
      describe('when lines are completed', () => {
        it('should be called', () => {})
      })
    })
    describe('lose', () => {
      describe('when the game lis lost', () => {
        it('should be called', () => {})
      })
    })
    describe('tick', () => {
      describe('when a game tick runs', () => {
        it('should be called', () => {})
      })
    })
  })
})
