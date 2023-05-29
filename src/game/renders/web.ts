import { Game } from '../engine/game'

const cellWidth = 64
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
    const touchMoveHandler = (e: TouchEvent) => {
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
    }

    const touchstartHandler = (e: TouchEvent): void => {
      touchstartX = e.changedTouches[0].screenX
      touchstartY = e.changedTouches[0].screenY

      controlLoopId = setInterval(() => {
        controlLoop()
      })
    }

    const touchendHandler = (e: TouchEvent): void => {
      controlLoopId && clearInterval(controlLoopId)

      touchendX = e.changedTouches[0].screenX
      touchendY = e.changedTouches[0].screenY
      const deltaX = touchstartX - touchendX
      const deltaY = touchstartY - touchendY

      if (Math.abs(deltaX) + Math.abs(deltaY) < 10) {
        cb('rotate')
      }
    }

    document.addEventListener('touchmove', touchMoveHandler, { passive: true })
    document.addEventListener('touchstart', touchstartHandler, {
      passive: true,
    })
    document.addEventListener('touchend', touchendHandler, { passive: true })

    return () => {
      document.removeEventListener('touchmove', touchMoveHandler)
      document.removeEventListener('touchstart', touchstartHandler)
      document.removeEventListener('touchend', touchendHandler)
    }
  }

  const useKeyboardControls = () => {
    const keyboardEventHandler = (event: KeyboardEvent): void => {
      if (event.key === 'ArrowLeft') cb('left')
      else if (event.key === 'ArrowRight') cb('right')
      else if (event.key === 'ArrowDown') cb('down')
      else if (event.key === 'ArrowUp') cb('rotate')
      else if (event.key === 't') cb('tick')
      else if (event.key === 'Escape') cb('pause')
      else return

      event.preventDefault()
    }
    document.addEventListener('keydown', keyboardEventHandler)
    return () => {
      document.removeEventListener('keydown', keyboardEventHandler)
    }
  }
  const touchControlCleanup = useTouchControls()
  const keyboardControlsCleanup = useKeyboardControls()
  return () => {
    touchControlCleanup()
    keyboardControlsCleanup()
  }
}

const onMounted = (game: Game) => {
  grid.style.gridTemplateColumns = `repeat(${game.board.width}, ${cellWidth}px)`
  grid.style.gridTemplateRows = `repeat(${game.board.height}, ${cellWidth}px)`
  for (let i = 0; i < game.board.width * game.board.height; i++) {
    const cell = document.createElement('div')
    cell.classList.add('cell')
    grid.appendChild(cell)
  }

  let removeControlHandler: undefined | (() => void)

  const controlHandler = (
    control: 'left' | 'right' | 'down' | 'rotate' | 'tick' | 'pause',
  ): void => {
    if (control === 'left') game.move('left')
    if (control === 'right') game.move('right')
    if (control === 'down') game.move('down')
    if (control === 'rotate') game.rotate(1)
    if (control === 'tick') game.tick()
    if (control === 'pause') {
      if (game.isPaused) {
        removeControlHandler = useControls(controlHandler)
        game.resume()
      } else {
        removeControlHandler?.()
        game.pause()
      }
    }
  }
  removeControlHandler = useControls(controlHandler)
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
