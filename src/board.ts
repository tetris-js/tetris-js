import { Cell } from './cell'

export class Board {
  constructor(
    public height: number,
    public width: number,
    public cells: Cell[][] = [],
  ) {
    this.cells = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => new Cell(false)),
    )
  }
}
