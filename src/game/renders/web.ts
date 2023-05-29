import { Game } from '../engine/game'

const cellWidth = 16
let fullDebug = false

const redactGame = (game: Game) => ({
  ...game,
  board: { ...game.board, cells: '...' },
  figure: {
    ...game.figure,
    cells: '...',
    shape: { ...game.figure?.shape, cells: '...' },
  },
})
const debugElement = document.getElementById('debug')!
const pointsElement = document.getElementById('points')!
const grid = document.getElementById('grid')!

const useDebug = () => {
  debugElement.addEventListener('click', () => {
    fullDebug = !fullDebug
  })
}

const useControls = (
  cb: (
    control: 'left' | 'right' | 'down' | 'rotate' | 'tick' | 'pause',
  ) => void,
) => {
  const useTouchControls = () => {
    let touchstartX = 0
    let touchstartY = 0
    let touchendX = 0
    let touchendY = 0

    let controlLoopId: NodeJS.Timer | null = null
    const controlLoop = () => {}
    document.addEventListener(
      'touchmove',
      (e) => {
        touchendX = e.changedTouches[0].screenX
        touchendY = e.changedTouches[0].screenY
        const deltaX = touchstartX - touchendX
        const deltaY = touchstartY - touchendY
        if (Math.abs(deltaX) > cellWidth) {
          if (deltaX > 0) cb('left')
          else cb('right')

          touchstartX = touchendX
        } else if (Math.abs(deltaY) > cellWidth) {
          if (deltaY < 0) cb('down')
          touchstartY = touchendY
        }
      },
      { passive: true },
    )

    document.addEventListener(
      'touchstart',
      (e) => {
        touchstartX = e.changedTouches[0].screenX
        touchstartY = e.changedTouches[0].screenY

        controlLoopId = setInterval(() => {
          controlLoop()
        })
      },
      { passive: true },
    )

    document.addEventListener(
      'touchend',
      (e) => {
        controlLoopId && clearInterval(controlLoopId)

        touchendX = e.changedTouches[0].screenX
        touchendY = e.changedTouches[0].screenY
        const deltaX = touchstartX - touchendX
        const deltaY = touchstartY - touchendY

        if (Math.abs(deltaX) + Math.abs(deltaY) < 10) {
          cb('rotate')
        }
      },
      { passive: true },
    )
  }

  const useKeyboardControls = () => {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') cb('left')
      if (event.key === 'ArrowRight') cb('right')
      if (event.key === 'ArrowDown') cb('down')
      if (event.key === 'ArrowUp') cb('rotate')
      if (event.key === 't') cb('tick')
      if (event.key === 'Escape') cb('pause')
    })
  }
  useTouchControls()
  useKeyboardControls()
}

const onMounted = (game: Game) => {
  grid.style.gridTemplateColumns = `repeat(${game.board.width}, ${cellWidth}px)`
  grid.style.gridTemplateRows = `repeat(${game.board.height}, ${cellWidth}px)`
  for (let i = 0; i < game.board.width * game.board.height; i++) {
    const cell = document.createElement('div')
    cell.classList.add('cell')
    grid.appendChild(cell)
  }

  useControls((control) => {
    if (control === 'left') game.move('left')
    if (control === 'right') game.move('right')
    if (control === 'down') game.move('down')
    if (control === 'rotate') game.rotate(1)
    if (control === 'tick') game.tick()
    if (control === 'pause') {
      if (game.isPaused) game.resume()
      else game.pause()
    }
  })

  useDebug()
}

export const render = (game: Game) => {
  if (grid.children.length === 0) {
    onMounted(game)
  }
  let virtualBoard: Array<string | undefined> = []

  game.board.cells.forEach((row) => {
    row.forEach((cell) => {
      virtualBoard.push(cell.color)
    })
  })

  if (game.figure) {
    for (let y = 0; y < game.figure.cells.length; y++) {
      for (let x = 0; x < game.figure.cells[y].length; x++) {
        const cell = game.figure.cells[y][x]

        if (!cell.occupied) continue

        const boardY = game.figure.position.y + y
        const boardX = game.figure.position.x + x

        virtualBoard[boardY * game.board.width + boardX] = game.figure.color
      }
    }
  }

  virtualBoard.forEach((color, i) => {
    if (color === undefined) {
      grid.children[i].classList.value = 'cell'
      return
    }
    grid.children[i].classList.value = 'cell occupied ' + color
  })

  pointsElement.innerText = game.score.toString()
  debugElement.innerHTML = JSON.stringify(
    fullDebug ? game : redactGame(game),
    null,
    2,
  )
}
