import { Celda, Color, getRandomColor } from "./cell";

type nombreFigura = "T" | "I" | "S" | "Z" | "O" | "J" | "L";

class FormaFigura {
  public forma: Celda[][];

  constructor(public nombre: nombreFigura, formaNumbers: number[][]) {
    this.forma = formaNumbers.map((fila) =>
      fila.map((celda) => new Celda(celda === 1, getRandomColor()))
    );
  }
}

const formaFiguraT = new FormaFigura("T", [
  [1, 1, 1],
  [0, 1, 0],
]);
const formaFiguraI = new FormaFigura("I", [[1], [1], [1], [1]]);
const formaFiguraS = new FormaFigura("S", [
  [0, 1, 1],
  [1, 1, 0],
]);
const formaFiguraZ = new FormaFigura("Z", [
  [1, 1, 0],
  [0, 1, 1],
]);
const formaFiguraO = new FormaFigura("O", [
  [1, 1],
  [1, 1],
]);
const formaFiguraJ = new FormaFigura("J", [
  [0, 1],
  [0, 1],
  [1, 1],
]);
const formaFiguraL = new FormaFigura("L", [
  [1, 0],
  [1, 0],
  [1, 1],
]);

const getRandomFormaFigura = (): FormaFigura => {
  const formas = [
    formaFiguraT,
    formaFiguraI,
    formaFiguraS,
    formaFiguraZ,
    formaFiguraO,
    formaFiguraJ,
    formaFiguraL,
  ];
  return formas[Math.floor(Math.random() * formas.length)];
};

type Rotation = 0 | 1 | 2 | 3;

export class Figura {
  private forma: FormaFigura;
  public color: Color;
  public ticksParaFijar: number | null = null;

  constructor(
    public posicion: { x: number; y: number },
    public rotacion: Rotation = 0,
    formaArg?: FormaFigura,
    colorArg?: Color
    // la figura se fija cuando toca el fondo o una celda fijada
    // si deberia fijarse, inicializar ticksParaFijar
    // si ticksParaFijar es 0, fijar la figura
  ) {
    if (formaArg) {
      this.forma = formaArg;
    } else {
      this.forma = getRandomFormaFigura();
    }

    if (colorArg) {
      this.color = colorArg;
    } else {
      this.color = getRandomColor();
    }
  }

  clone(): Figura {
    const clone = new Figura(
      this.posicion,
      this.rotacion,
      this.forma,
      this.color
    );
    clone.ticksParaFijar = this.ticksParaFijar;
    return clone;
  }
  rotar(direccion:): void {
    this.rotacion = ((this.rotacion + 1) % 4) as Rotation;
  }
  mover(direccion: "left" | "right" | "down"): void {
    switch (direccion) {
      case "left":
        this.posicion.x--;
        break;
      case "right":
        this.posicion.x++;
        break;
      case "down":
        this.posicion.y++;
        break;
    }
  }
  canMover(newPosition: Figura): boolean {
    // TODO: implement
    // comprobar si el movimiento es solo 1 de distancia
    // comprobar si la nueva posicion esta dentro del tablero
    // comprobar si la nueva posicion no colisiona con ninguna celda fijada
    return true;
  }
}
