import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { playableTiles, makeMove, resetPlayable, filterTiles, initializeBoard } from '../utils/gameLogic'
import BoardService from '../services/boards'
import Tile from './Tile'

const Board = ({ board, socket }) => {
  const [loggedUser, setLoggedUser] = useState('')
  const [Board, setBoard] = useState([])
  const [turn, setTurn] = useState('')
  const [blackCount, setBlackCount] = useState(2)
  const [whiteCount, setWhiteCount] = useState(2)
  const [winner, setWinner] = useState(false)
  const [message, setMessage] = useState('')
  const [passCount, setPassCount] = useState(0)
  const [users, setusers] = useState('')

  useEffect(() => {
    socket.on('play', board => {
      setBoard(board.board)
      setBlackCount(board.blackscore)
      setWhiteCount(board.whitescore)
      setTurn(board.turn)
      setMessage("L'adversaire vient de jouer un coup !")
    })
    BoardService.getAll().then(data => {
      if (board) {
        const fetchedBoard = data.find(x => x.id === board.id)
        setTurn(fetchedBoard.turn)
        setBlackCount(fetchedBoard.blackscore)
        setWhiteCount(fetchedBoard.whitescore)
        setusers(fetchedBoard.users)
        if (fetchedBoard.turn === 'black' && loggedUser.id === fetchedBoard.users[0].id) {
          const playerBoard = [...fetchedBoard.board]
          const PlayableTiles = playableTiles('white', playerBoard)

          PlayableTiles.map(tile => {
            playerBoard[tile.rowIndex][tile.columnIndex] = tile
          })
          setBoard(playerBoard)
        } else {
          setBoard(fetchedBoard.board)
        }
        try {
          if (fetchedBoard.turn === 'white' && loggedUser.id === fetchedBoard.users[1].id) {
            const playerBoard = [...fetchedBoard.board]
            const PlayableTiles = playableTiles('black', playerBoard)

            PlayableTiles.map(tile => {
              playerBoard[tile.rowIndex][tile.columnIndex] = tile
            })
            setBoard(playerBoard)
          } else {
            setBoard(fetchedBoard.board)
          }
        } catch (error) {
          console.log('error', error)
        }

        if (filterTiles('empty', fetchedBoard.board).length + filterTiles('playable', fetchedBoard.board).length < 1) {
          return setWinner(true)
        }
      }
    })
    setLoggedUser(JSON.parse(localStorage.getItem('user')))
  }, [board, message, turn, blackCount])

  // if winner, reset all tiles in case the board is not full
  if (winner) {
    const winnerBoard = [...Board]
    const tilesToReset = resetPlayable(winnerBoard)
    tilesToReset.map(tile => {
      winnerBoard[tile.rowIndex][tile.columnIndex] = tile
    })
    BoardService.update(board.id, { ...Board, board: winnerBoard, active: false })
  }

  const updateBoard = async (newBoard) => {
    const newTurn = turn === 'black' ? 'white' : 'black'
    BoardService.setToken(loggedUser.token)
    const updatedBoard = { board: newBoard, turn: newTurn, blackscore: filterTiles('black', newBoard).length, whitescore: filterTiles('white', newBoard).length }
    try {
      const data = await BoardService.update(board.id, updatedBoard)
      console.log(data, 'new data ======')
      setBoard(data.board)
      setBlackCount(data.blackscore)
      setWhiteCount(data.whitescore)
      socket.emit('play', data)
    } catch (error) {
      setMessage(error.data.message)
    }
  }

  const handlePlayTurn = (row, col) => {
    const newBoard = [...Board]
    const tilesToChange = makeMove(row, col, turn, newBoard)
    tilesToChange.map(tile => {
      newBoard[tile.rowIndex][tile.columnIndex] = tile
    })

    const tilesToReset = resetPlayable(newBoard)
    tilesToReset.map(tile => {
      newBoard[tile.rowIndex][tile.columnIndex] = tile
    })
    setMessage('')

    updateBoard(newBoard)
  }

  const handleReset = async () => {
    const resetedBoard = {
      board: initializeBoard(),
      active: true,
      turn: 'black'
    }
    BoardService.setToken(loggedUser.token)
    setBoard(initializeBoard())
    setWinner(false)
    const data = await BoardService.update(board.id, resetedBoard)
    socket.emit('play', data)
  }

  const handlePass = async () => {
    const passBoard = [...Board]
    if (filterTiles('playable', passBoard).length > 0) {
      return setMessage('Vous ne pouvez pas passer un tour jouable')
    }
    setPassCount(passCount + 1)
    if (passCount === 1) {
      setWinner(true)
    }

    const tilesToReset = resetPlayable(passBoard)
    tilesToReset.map(tile => {
      passBoard[tile.rowIndex][tile.columnIndex] = tile
    })

    updateBoard(passBoard)
  }

  const displayMessage = (message) => (<div className="alert alert-secondary" role="alert">{message} <svg onClick={() => setMessage(false)} className="bi bi-x-square" width="1em" height="1em" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M16 3H4a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1zM4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4z" clipRule="evenodd"></path>
    <path fillRule="evenodd" d="M9.293 10L6.646 7.354l.708-.708L10 9.293l2.646-2.647.708.708L10.707 10l2.647 2.646-.708.708L10 10.707l-2.646 2.647-.708-.707L9.293 10z" clipRule="evenodd" ></path>
  </svg>

  </div>)

  const displayBoard = () => Board.map(row => (
    <div key={Board.indexOf(row)}>{row.map(tile =>
      <Tile key={tile.name} {...tile} handlePlayTurn={handlePlayTurn} />
    )}</div>))

  const displayWinner = () => {
    if (blackCount === whiteCount) {
      return <h3 className="reversi-board">ex-aequo, no winner!</h3>
    } else {
      return (blackCount > whiteCount
        ? <h3 className="reversi-board">{users[0].username} a gagné !</h3>
        : <h3 className="reversi-board">{users[1].username} a gagné !</h3>)
    }
  }

  const displayTurn = (users) => {
    if (users && users[0] && turn === 'black') {
      return (<h3 className="reversi-board">C`&apos;`est le tour de {users[0].username} de jouer !</h3>)
    } else if (users && users[1] && turn === 'white') {
      return (<h3 className="reversi-board">C`&apos;`est le tour de {users[1].username} de jouer !</h3>)
    }
    return (<h3 className="reversi-board">C`&apos;`est le tour de {turn} de jouer !</h3>)
  }

  return (
    <main className="main-board">
      {winner ? displayWinner() : displayTurn(users)}
      <h3 className="reversi-board">Score Noir: {blackCount} | Score Blanc: {whiteCount}</h3>
      {message ? displayMessage(message) : null}

      <article className="reversi-board">
        <button onClick={() => handleReset()}>Remettre à Zéro</button>
        {displayBoard()}
        <div className="player-names">
          <p>
            <svg className="bi bi-circle-fill" width="1em" height="1em" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8"></circle>
            </svg>
            {users[0] ? <>{users[0].username}<svg className="bi bi-circle-fill online-player" width="1em" height="1em" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8"></circle>
            </svg></> : 'En attende du joueur'}</p>
          <button onClick={() => handlePass()} >Passer le tour</button>
          <p>
            <svg className="bi bi-circle-fill white-player" width="1em" height="1em" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8"></circle>
            </svg>
            {users[1] ? <>{users[1].username}<svg className="bi bi-circle-fill online-player" width="1em" height="1em" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8"></circle>
            </svg></> : <>{'En attende du joueur'}<svg className="bi bi-circle-fill offline-player" width="1em" height="1em" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8"></circle>
            </svg></>}</p>
        </div>

      </article>
    </main>
  )
}

Board.propTypes = {
  board: PropTypes.object,
  socket: PropTypes.object
}

export default Board
