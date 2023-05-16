export type Color =
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'purple'
  | 'orange'
  | 'white'

export const getRandomColor = (): Color => {
  const colors: Color[] = [
    'red',
    'blue',
    'green',
    'yellow',
    'purple',
    'orange',
    'white',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export class Cell {
  constructor(public occupied: boolean, public color?: Color) {}
}
