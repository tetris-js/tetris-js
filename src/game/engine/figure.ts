import { Cell, Color } from './cell'

export type FigureName = 'T' | 'I' | 'S' | 'Z' | 'O' | 'J' | 'L'

class Shape {
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

const shapeT = new Shape('T', [
  [1, 1, 1],
  [0, 1, 0],
])
const shapeI = new Shape('I', [[1], [1], [1], [1]])
const shapeS = new Shape('S', [
  [0, 1, 1],
  [1, 1, 0],
])
const shapeZ = new Shape('Z', [
  [1, 1, 0],
  [0, 1, 1],
])
const shapeO = new Shape('O', [
  [1, 1],
  [1, 1],
])
const shapeJ = new Shape('J', [
  [0, 1],
  [0, 1],
  [1, 1],
])
const shapeL = new Shape('L', [
  [1, 0],
  [1, 0],
  [1, 1],
])

const getRandomShape = (): Shape => {
  const shapes = [shapeT, shapeI, shapeS, shapeZ, shapeO, shapeJ, shapeL]
  return shapes[Math.floor(Math.random() * shapes.length)]
}

type Rotation = 0 | 1 | 2 | 3

export class Figure {
  public shape: Shape
  public ticksToFix: number | null = null

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
  }

  get color(): Color {
    return `color-${this.shape.name}`
  }

  clone(): Figure {
    const clone = new Figure({ ...this.position }, this.rotation, this.shape)
    clone.ticksToFix = this.ticksToFix
    return clone
  }

  rotate90(figura: Shape): Shape {
    const rows = figura.cells.length
    const cols = figura.cells[0].length

    // Crear una nueva matriz para almacenar la rotación
    const rotated = new Array(cols).fill(0).map(() => new Array(rows).fill(0))

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        rotated[j][rows - 1 - i] = figura.cells[i][j]
      }
    }

    return { name: figura.name, cells: rotated }
  }

  rotate(direction: 1 | -1): void {
    direction === 1
      ? (this.shape = this.rotate90(this.shape))
      : (this.shape = this.rotate90(this.rotate90(this.shape)))
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
