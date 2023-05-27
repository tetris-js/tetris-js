import { Figure, Shape, getRandomShape, shapeL, shapeO } from './figure'

describe('getRandomShape', () => {
  it('should return a random shape', () => {
    const shape = getRandomShape()
    expect(shape).toBeInstanceOf(Shape)
  })
})

describe('Figure', () => {
  describe('when created', () => {
    it('should have the same cells as the shape', () => {
      const figure = new Figure({ x: 0, y: 0 }, 0, shapeO)
      expect(figure.cells).toEqual(shapeO.cells)
    })

    describe('if no shape is provided', () => {
      it('should have a random shape', () => {
        const figure = new Figure({ x: 0, y: 0 }, 0)
        expect(figure.shape).toBeInstanceOf(Shape)
      })
    })

    describe('if rotation is provided', () => {
      it('should initialize the cells rotated', () => {
        const figure = new Figure({ x: 0, y: 0 }, 1, shapeL)
        expect(figure.cells).toMatchObject([
          [{ occupied: true }, { occupied: true }, { occupied: true }],
          [{ occupied: true }, { occupied: false }, { occupied: false }],
        ])
      })
    })

    describe('clone', () => {
      it('should return a new figure with the same properties', () => {
        const figure = new Figure({ x: 2, y: 3 }, 1, shapeL)
        const clone = figure.clone()
        expect(clone).not.toBe(figure)
        expect(clone).toMatchObject(figure)
      })
    })

    describe('when the figure is rotated', () => {
      describe('and rotation is 1', () => {
        it('should rotate the figure', () => {
          const figure = new Figure({ x: 2, y: 3 }, 1, shapeL)
          figure.rotate(1)
          expect(figure.cells).toMatchObject([
            [{ occupied: true }, { occupied: true }],
            [{ occupied: false }, { occupied: true }],
            [{ occupied: false }, { occupied: true }],
          ])
        })
      })

      describe('and rotation is -1', () => {
        it('should rotate the figure', () => {
          const figure = new Figure({ x: 2, y: 3 }, 1, shapeL)
          figure.rotate(-1)
          expect(figure.cells).toMatchInlineSnapshot([
            [{ occupied: true }, { occupied: false }],
            [{ occupied: true }, { occupied: false }],
            [{ occupied: true }, { occupied: true }],
          ])
        })
      })
    })

    describe('when the figure is moved', () => {
      describe('and is moved to the right', () => {
        it('should move the figure', () => {
          const figure = new Figure({ x: 2, y: 3 }, 1, shapeL)
          figure.move('right')
          expect(figure.position).toMatchObject({ x: 3, y: 3 })
        })
      })
      describe('and is moved to the left', () => {
        it('should move the figure', () => {
          const figure = new Figure({ x: 2, y: 3 }, 1, shapeL)
          figure.move('left')
          expect(figure.position).toMatchObject({ x: 1, y: 3 })
        })
      })
      describe('and is moved down', () => {
        it('should move the figure', () => {
          const figure = new Figure({ x: 2, y: 3 }, 1, shapeL)
          figure.move('down')
          expect(figure.position).toMatchObject({ x: 2, y: 4 })
        })
      })
      describe('and is moved up', () => {
        it('should not work', () => {
          const figure = new Figure({ x: 2, y: 3 }, 1, shapeL)
          figure.move('up' as any)
          expect(figure.position).toMatchObject({ x: 2, y: 3 })
        })
      })
    })
  })
})
