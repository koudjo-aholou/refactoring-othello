import React, { useState, useEffect } from 'react'
import Board from './components/Board'
import Home from './components/Home'
import BoardService from './services/boards'
import UserService from './services/users'
import io from 'socket.io-client'
import LoginService from './services/login'
import { initializeBoard } from './utils/gameLogic'
import {
  HashRouter as Router,
  Route,
  Redirect
} from 'react-router-dom'

const App = () => {
  const [game, setGame] = useState(false)
  const [allBoards, setAllBoards] = useState([])
  const [loggedUser, setLoggedUser] = useState('')
  const [username, setUsername] = useState('')
  const [boardName, setBoardName] = useState('')
  const [password, setPassword] = useState('')
  const [boardToJoin, setBoardToJoin] = useState([])
  const [socket] = useState(io('http://localhost:5000'))

  useEffect(() => {
    BoardService.getAll().then(data => setAllBoards(data))
    setLoggedUser(JSON.parse(localStorage.getItem('user')))
  }, [])

  const boardById = (id) => allBoards.find(board => board.id === id)

  const handleRegister = (e) => {
    e.preventDefault()
    UserService.create({ username, password })
    setUsername('')
    setPassword('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const user = await LoginService.login({
        username, password
      })
      localStorage.setItem('user', JSON.stringify(user))
      setLoggedUser(user)
      setTimeout(() => {
        setUsername('')
        setPassword('')
      }, 200)
    } catch (error) {
      console.log('error', error)
    }
  }

  const handleGameCreation = async () => {
    BoardService.setToken(loggedUser.token)
    const data = await BoardService.create({ board: initializeBoard(), name: boardName })
    setBoardToJoin(data)
    setAllBoards(allBoards.concat(data))
    setTimeout(() => {
      setGame(true)
    }, (500))
  }

  const handleJoinGame = async (id) => {
    UserService.update(loggedUser.id, { board: id })
    const foundBoard = allBoards.find(board => board.id === id)
    setBoardToJoin(foundBoard)
    setTimeout(() => {
      setGame(true)
    }, (500))
  }

  const handleDisconnect = () => {
    localStorage.setItem('user', JSON.stringify(''))
    setLoggedUser('')
  }

  return (
    <Router>
      <div>
        {game ? <Redirect to={`game/${boardToJoin.id}`} /> : null}

        <Route exact path="/" render={() => <Home
          handleRegister={handleRegister}
          handleLogin={handleLogin}
          handleGameCreation={handleGameCreation}
          loggedUser={loggedUser}
          allBoards={allBoards}
          changeBoardName={({ target }) => setBoardName(target.value)}
          changeName={({ target }) => setUsername(target.value)}
          handleJoinGame={handleJoinGame}
          changePassword={({ target }) => setPassword(target.value)}
          disconnect={handleDisconnect}
        />}
        />

        <Route exact path="/game/:id" render={({ match }) => <Board board={boardById(match.params.id)} socket={socket} />
        } />

      </div>
    </Router>

  )
}

export default App
