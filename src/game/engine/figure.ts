import { Cell, Color } from './cell'

export type FigureName = 'T' | 'I' | 'S' | 'Z' | 'O' | 'J' | 'L'

export class Shape {
  public cells: Cell[][]

  constructor(public name: FigureName, shapeNumbers: number[][]) {
    const color = `color-${name}` as Color
    this.cells = shapeNumbers.map((fila) =>
      fila.map(
        (celda) => new Cell(celda === 1, celda === 1 ? color : undefined),
      ),
    )
  }
}

export const shapeT = new Shape('T', [
  [1, 1, 1],
  [0, 1, 0],
])
export const shapeI = new Shape('I', [[1], [1], [1], [1]])
export const shapeS = new Shape('S', [
  [0, 1, 1],
  [1, 1, 0],
])
export const shapeZ = new Shape('Z', [
  [1, 1, 0],
  [0, 1, 1],
])
export const shapeO = new Shape('O', [
  [1, 1],
  [1, 1],
])
export const shapeJ = new Shape('J', [
  [0, 1],
  [0, 1],
  [1, 1],
])
export const shapeL = new Shape('L', [
  [1, 0],
  [1, 0],
  [1, 1],
])

export const getRandomShape = (): Shape => {
  const shapes = [shapeT, shapeI, shapeS, shapeZ, shapeO, shapeJ, shapeL]
  return shapes[Math.floor(Math.random() * shapes.length)]
}

export type Rotation = 0 | 1 | 2 | 3

export class Figure {
  public shape: Shape
  public ticksToFix: number | null = null
  public cells: Cell[][] = []

  constructor(
    public position: { x: number; y: number },
    public rotation: Rotation = 0,
    shapeArg?: Shape,
  ) {
    if (shapeArg) {
      this.shape = shapeArg
    } else {
      this.shape = getRandomShape()
    }
    this.cells = this.shape.cells
    for (let i = 0; i < rotation; i++) {
      this.rotate90()
    }
  }

  get color(): Color {
    return `color-${this.shape.name}`
  }

  clone(): Figure {
    const clone = new Figure({ ...this.position }, this.rotation, this.shape)
    clone.ticksToFix = this.ticksToFix
    return clone
  }

  rotate90(): void {
    const rows = this.cells.length
    const cols = this.cells[0].length

    const rotated: Cell[][] = Array.from({ length: cols }, () =>
      Array.from({ length: rows }, () => new Cell(false)),
    )

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        rotated[j][rows - 1 - i] = this.cells[i][j]
      }
    }
    this.cells = rotated
  }

  rotate(direction: 1 | -1): void {
    if (direction === 1) this.rotate90()
    else {
      this.rotate90()
      this.rotate90()
      this.rotate90()
    }
    this.rotation = ((this.rotation + direction) % 4) as Rotation
  }

  move(direction: 'left' | 'right' | 'down'): void {
    switch (direction) {
      case 'left':
        this.position.x--
        break
      case 'right':
        this.position.x++
        break
      case 'down':
        this.position.y++
        break
    }
  }
}
