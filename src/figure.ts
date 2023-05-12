import { Cell, Color, getRandomColor } from './cell'

type figureName = 'T' | 'I' | 'S' | 'Z' | 'O' | 'J' | 'L'

class Shape {
  public shape: Cell[][]

  constructor(public name: figureName, shapeNumbers: number[][]) {
    this.shape = shapeNumbers.map((fila) =>
      fila.map((celda) => new Cell(celda === 1, getRandomColor())),
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
  private shape: Shape
  public color: Color
  public ticksParaFijar: number | null = null

  constructor(
    public position: { x: number; y: number },
    public rotation: Rotation = 0,
    shapeArg?: Shape,
    colorArg?: Color,
    // la figura se fija cuando toca el fondo o una celda fijada
    // si deberia fijarse, inicializar ticksParaFijar
    // si ticksParaFijar es 0, fijar la figura
  ) {
    if (shapeArg) {
      this.shape = shapeArg
    } else {
      this.shape = getRandomShape()
    }

    if (colorArg) {
      this.color = colorArg
    } else {
      this.color = getRandomColor()
    }
  }

  clone(): Figure {
    const clone = new Figure(
      this.position,
      this.rotation,
      this.shape,
      this.color,
    )
    clone.ticksParaFijar = this.ticksParaFijar
    return clone
  }

  rotate90(figura: Shape): Shape {
    const rows = figura.shape.length
    const cols = figura.shape[0].length

    // Crear una nueva matriz para almacenar la rotación
    const rotated = new Array(cols).fill(0).map(() => new Array(rows).fill(0))

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        rotated[j][rows - 1 - i] = figura.shape[i][j]
      }
    }

    return { name: figura.name, shape: rotated }
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
  canMove(newPosition: Figure): boolean {
    // TODO: implement
    // comprobar si el movimiento es solo 1 de distancia
    // comprobar si la nueva posicion esta dentro del tablero
    // comprobar si la nueva posicion no colisiona con ninguna celda fijada
    return true
  }
}
