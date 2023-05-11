import { Celda } from './cell'
import { Figura } from './figure'

export class Tablero {
  constructor(
    public altura: number,
    public anchura: number,
    public celdas: Celda[][] = [],
    public figura: Figura | null = null,
  ) {
    this.celdas = Array.from({ length: altura }, () =>
      Array.from({ length: anchura }, () => new Celda(false)),
    )
  }

  doGravity(): void {
    if (!this.figura) return
    const newPos = this.figura.clone()
    newPos.mover('down')
    if (this.figura.canMover(newPos)) {
      this.figura.mover('down')
    }
  }

  updateCeldas(): void {
    // TODO: implement
    // actualizar el estado de las celdas en función de la figura
  }

  fijar(): void {
    // TODO: implement
  }

  eliminarLineasCompletas(): void {
    // TODO: implement
    // bajar las lineas superiores
    // optimizacion: comprobar solo las lineas donde se ha fijado la figura
  }
  isPerdido(): boolean {
    // TODO: implement
    // comprobar si la figura se ha fijado en la parte superior del tablero
    return false
  }
}
