import React, { useState, useEffect } from 'react'
import Board from './components/Board'
import Home from './components/Home'
import BoardService from './services/boards'
import UserService from './services/users'
import LoginService from './services/login'
import { initializeBoard } from './utils/gameLogic'
import {
  BrowserRouter as Router,
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

  useEffect(() => {
    // BoardService.getAll().then(data => localStorage.setItem('boards', JSON.stringify(data)))
    BoardService.getAll().then(data => setAllBoards(data))
    setLoggedUser(JSON.parse(localStorage.getItem('user')))
  }, [])

  // const boardById = (id) => {
  //   const localboards = JSON.parse(localStorage.getItem('boards'))
  //   return localboards.find(board => board.id === id)
  // }
  const boardById = (id) => allBoards.find(board => board.id === id)

  const handleRegister = (e) => {
    e.preventDefault()
    UserService.create({ username, password })
    setUsername('')
    setPassword('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    const user = await LoginService.login({
      username, password
    })
    localStorage.setItem('user', JSON.stringify(user))
    setLoggedUser(user)
    setTimeout(() => {
      setUsername('')
      setPassword('')
    }, 200)
  }

  const handleGameCreation = async () => {
    BoardService.setToken(loggedUser.token)
    const data = await BoardService.create({ board: initializeBoard(), name: boardName })
    setBoardToJoin(data)
    // const localboards = JSON.parse(localStorage.getItem('boards'))
    // localStorage.setItem('boards', JSON.stringify(localboards.concat(data)))
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
          changePassword={({ target }) => setPassword(target.value)} />}
        />

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
