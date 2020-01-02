import React, { useState, useEffect } from 'react'
import Board from './components/Board'
import BoardService from './services/boards'
import { initializeBoard } from './utils/gameLogic'
import useSocket from 'use-socket.io-client'
import {
  BrowserRouter as Router,
  Route,
  Redirect
} from 'react-router-dom'

const App = () => {
  const [game, setGame] = useState(false)
  const [createdBoard, setCreatedBoard] = useState([])
  const [socket] = useSocket('http://localhost:9000')

  useEffect(() => {
    BoardService.getAll().then(data => localStorage.setItem('boards', JSON.stringify(data)))
    socket.on('coucou', data => { console.log('data', data) })
  }, [])

  const boardById = (id) => {
    const localboards = JSON.parse(localStorage.getItem('boards'))
    return localboards.find(board => board.id === id)
  }

  const handleCoucou = () => {
    socket.emit('coucou', { msg: 'coucou' })
  }

  const handleGameCreation = async () => {
    const data = await BoardService.create({ board: initializeBoard() })
    setCreatedBoard(data)
    const localboards = JSON.parse(localStorage.getItem('boards'))
    localStorage.setItem('boards', JSON.stringify(localboards.concat(data)))
    setTimeout(() => {
      setGame(true)
    }, (500))
  }

  return (
    <Router>
      <div>
        <h1>React Reversi Game</h1>
        <button onClick={() => handleGameCreation()}>Créer une partie</button>
        <button onClick={() => handleCoucou()}>faire coucou</button>
        {game ? <Redirect to={`game/${createdBoard.id}`} /> : null}

        <Route exact path="/game/:id" render={({ match }) => {
          console.log('boardById', boardById(match.params.id))
          return (
            <Board board={boardById(match.params.id)} />
          )
        }
        } />
      </div>
    </Router>

  )
}

export default App
