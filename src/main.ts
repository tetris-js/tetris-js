import { Board } from './board.ts'
import { Game } from './game.ts'
import './style.css'

new Game(new Board(20, 10), 'web').start()
