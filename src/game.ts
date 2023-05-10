import { Tablero } from "./board";
import { Figura } from "./figure";

export class Game {
  constructor(public tablero: Tablero) {}

  tick() {
    if (this.tablero.isPerdido()) {
      alert("Has perdido");
      return;
    }
    this.tablero.doGravity();
    this.tablero.updateCeldas();
    this.tablero.fijar();
    this.tablero.eliminarLineasCompletas();
    if (!this.tablero.figura) this.crearFigura();
  }

  crearFigura(): void {
    this.tablero.figura = new Figura({ x: 0, y: 0 });
  }

  start() {
    setInterval(() => this.tick(), 100);
  }
}
