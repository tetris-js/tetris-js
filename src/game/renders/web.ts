import { Cell } from '../engine/cell'
import { Figure } from '../engine/figure'
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
const mainGameGrid = document.getElementById('main-game-grid')!
const nextFiguresContainer = document.getElementById('next-figures')!
const nextFiguresElements: HTMLElement[] = []

const useDebug = () => {
  debugElement.addEventListener('click', () => {
    fullDebug = !fullDebug
  })
}

const useControls = (
  cb: (
    control: 'left' | 'right' | 'down' | 'rotate' | 'tick' | 'pause' | 'mute',
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
      else if (event.key === 'm') cb('mute')
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

const useMusic = () => {
  const musicStr =
    '䰄䜈䠈䨄䠈䜈䔄䔈䠈䰄䨈䠈䜄䜈䠈䨄䰄䠄䔄䔄\x04䨃䴈億伈䴈䰃䠈䰄䨈䠈䜄䜈䠈䨄䰄䠄䔄䔄\x04'

  const music: Array<[number, number]> = []

  for (let i = 0; i < musicStr.length; i++) {
    const charCode = musicStr.charCodeAt(i)
    const a = charCode >> 8
    const b = charCode & 0xff
    music.push([a, b])
  }
  const eps = 0.01
  const context = new AudioContext()
  const oscillator = context.createOscillator()
  oscillator.connect(context.destination)
  oscillator.start(0)
  let time = context.currentTime + eps
  const loop = () => {
    music.forEach((note) => {
      const freq = Math.pow(2, (note[0] - 69) / 12) * 440
      oscillator.frequency.setTargetAtTime(0, time - eps, 0.001)
      oscillator.frequency.setTargetAtTime(freq, time, 0.001)
      time += 2 / note[1]
    })
  }
  loop()
  const loopId = setInterval(loop, time * 1000 - context.currentTime * 1000)
  return () => {
    oscillator.stop()
    clearInterval(loopId)
  }
}

let removeControlHandler: undefined | (() => void)

const controlHandler =
  (game: Game) =>
  (
    control: 'left' | 'right' | 'down' | 'rotate' | 'tick' | 'pause' | 'mute',
  ): void => {
    if (control === 'mute') {
      isMuted = !isMuted
      stopMusic?.()
      stopMusic = undefined
    }
    if (control === 'left') game.move('left')
    if (control === 'right') game.move('right')
    if (control === 'down') game.move('down')
    if (control === 'rotate') game.rotate(1)
    if (control === 'tick') game.tick()
    if (control === 'pause') {
      if (game.isPaused) {
        removeControlHandler = useControls(controlHandler(game))
        if (!isMuted) {
          stopMusic = useMusic()
        }
        game.resume()
      } else {
        removeControlHandler?.()
        game.pause()
      }
    }
  }
let stopMusic: undefined | (() => void)
let isMuted = false

const onMounted = (game: Game) => {
  if (!stopMusic && !isMuted) {
    stopMusic = useMusic()
  }
  removeControlHandler = useControls(controlHandler(game))
  useDebug()
}

const renderCellsToGameGrid = ({
  cells,
  figure,
  grid,
}: {
  cells: Cell[][]
  figure?: Figure
  grid: HTMLElement
}) => {
  if (grid.children.length === 0) {
    grid.style.gridTemplateColumns = `repeat(${cells[0].length}, ${cellWidth}px)`
    grid.style.gridTemplateRows = `repeat(${cells.length}, ${cellWidth}px)`
    for (let i = 0; i < cells[0].length * cells.length; i++) {
      const cell = document.createElement('div')
      cell.classList.add('cell')
      grid.appendChild(cell)
    }
  }

  const virtualBoard: Array<string | undefined> = []

  cells.forEach((row) => {
    row.forEach((cell) => {
      virtualBoard.push(cell.color)
    })
  })

  if (figure) {
    for (let y = 0; y < figure.cells.length; y++) {
      for (let x = 0; x < figure.cells[y].length; x++) {
        const cell = figure.cells[y][x]

        if (!cell.occupied) continue

        const boardY = figure.position.y + y
        const boardX = figure.position.x + x

        virtualBoard[boardY * cells[0].length + boardX] = figure.color
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
}

export const render = (game: Game) => {
  if (mainGameGrid.children.length === 0) {
    onMounted(game)
  }

  renderCellsToGameGrid({
    cells: game.board.cells,
    figure: game.figure ?? undefined,
    grid: mainGameGrid,
  })

  if (game.nextFigures.length > 0 && nextFiguresElements.length === 0) {
    nextFiguresContainer.innerHTML =
      '<div class="next-figure game-grid"></div>'.repeat(
        game.nextFigures.length,
      )
    nextFiguresElements.push(
      ...(Array.from(nextFiguresContainer.children) as HTMLElement[]),
    )
  }

  game.nextFigures.forEach((figure, i) => {
    const element = nextFiguresElements[i]
    const cells = Array.from({ length: 5 }, () =>
      Array.from({ length: 5 }, () => new Cell(false)),
    )
    renderCellsToGameGrid({
      cells,
      figure: {
        ...figure,
        color: figure.color,
        position: {
          x: figure.shape.name === 'I' ? 2 : 1,
          y: figure.shape.name === 'I' ? 0 : 1,
        },
      } as Figure,
      grid: element,
    })
  })

  pointsElement.innerText = game.score.toString()
  debugElement.innerHTML = JSON.stringify(
    fullDebug ? game : redactGame(game),
    null,
    2,
  )
}
