import { FigureName } from './figure'

export type Color = `color-${FigureName}`

export class Cell {
  constructor(public occupied: boolean, public color?: Color) {}
}
