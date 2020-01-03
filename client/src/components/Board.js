import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { playableTiles, makeMove, resetPlayable, filterTiles, initializeBoard } from '../utils/gameLogic'
import BoardService from '../services/boards'
import Tile from './Tile'
import io from 'socket.io-client'

const Board = ({ board }) => {
  const [loggedUser, setLoggedUser] = useState('')
  const [Board, setBoard] = useState([])
  const [turn, setTurn] = useState('')
  const [blackCount, setBlackCount] = useState(filterTiles('black', Board).length)
  const [whiteCount, setWhiteCount] = useState(filterTiles('white', Board).length)
  const [winner, setWinner] = useState(false)
  // const [players, setPlayers] = useState([])
  const [pass, setPass] = useState(false)
  const [passCount, setPassCount] = useState(0)
  const socket = io('http://localhost:9000')

  useEffect(() => {
    BoardService.getAll().then(data => {
      console.log('board', board)
      if (board) {
        const fetchedBoard = data.find(x => x.id === board.id)
        setTurn(fetchedBoard.turn)
        setBoard(fetchedBoard.board)
        // setPlayers(fetchedBoard.users)
        setBlackCount(fetchedBoard.blackscore)
        setWhiteCount(fetchedBoard.whitescore)
      }
    })
    setLoggedUser(JSON.parse(localStorage.getItem('user')))

    socket.on('coucou', data => { console.log('data', data) })
    socket.on('play', board => {
      setBoard(board.board)
      setBlackCount(board.blackscore)
      setWhiteCount(board.whitescore)
      setTurn(board.turn)
    })
  }, [board, io])

  const displayBoard = () => Board.map(row => (
    <div key={Board.indexOf(row)}>{row.map(tile =>
      <Tile key={tile.name} {...tile} handleTileChange={handleTileChange} />
    )}</div>))

  const displayWinner = () => {
    if (blackCount === whiteCount) {
      return <h3 className="reversi-board">ex-aequo, no winner!</h3>
    } else {
      return (blackCount > whiteCount
        ? <h3 className="reversi-board">Black player won!</h3>
        : <h3 className="reversi-board">White player won!</h3>)
    }
  }

  // if (board && board.turn === 'black' && loggedUser.id === players[1]) {
  //   const newBoard = [...Board]
  //   const tilesToReset = resetPlayable(newBoard)
  //   tilesToReset.map(tile => {
  //     newBoard[tile.rowIndex][tile.columnIndex] = tile
  //   })
  //   BoardService.update(board.id, { ...Board, board: newBoard, active: false })
  // }

  // if (board && board.turn === 'white' && loggedUser.id === players[0]) {
  //   const newBoard = [...Board]
  //   const tilesToReset = resetPlayable(newBoard)
  //   tilesToReset.map(tile => {
  //     newBoard[tile.rowIndex][tile.columnIndex] = tile
  //   })
  //   BoardService.update(board.id, { ...Board, board: newBoard, active: false })
  // }

  // if winner, reset all tiles
  if (winner) {
    const newBoard = [...Board]
    const tilesToReset = resetPlayable(newBoard)
    tilesToReset.map(tile => {
      newBoard[tile.rowIndex][tile.columnIndex] = tile
    })
    BoardService.update(board.id, { ...Board, board: newBoard, active: false })
  }

  // if too many passes, declare winner
  if (filterTiles('playable', Board) && !pass) {
    if (!winner && passCount === 3) {
      setWinner(true)
    }
    setPass(true)
    setPassCount(passCount + 1)
  }

  const updateBoard = async (newBoard) => {
    const newTurn = turn === 'black' ? 'white' : 'black'
    setTurn(newTurn)
    BoardService.setToken(loggedUser.token)
    const updatedBoard = { board: newBoard, turn: newTurn, blackscore: filterTiles('black', newBoard).length, whitescore: filterTiles('white', newBoard).length }
    try {
      const data = await BoardService.update(board.id, updatedBoard)
      setBoard(data.board)
      setBlackCount(data.blackscore)
      setWhiteCount(data.whitescore)
      socket.emit('play', data)
    } catch (error) {
      console.log('error.data', error.data)
    }
    const data = await BoardService.update(board.id, updatedBoard)
    setBoard(data.board)
    socket.emit('play', data)
  }

  const handleTileChange = (row, col) => {
    const newBoard = [...Board]
    const tilesToChange = makeMove(row, col, turn, newBoard)
    tilesToChange.map(tile => {
      newBoard[tile.rowIndex][tile.columnIndex] = tile
    })

    const tilesToReset = resetPlayable(newBoard)
    tilesToReset.map(tile => {
      newBoard[tile.rowIndex][tile.columnIndex] = tile
    })

    const PlayableTiles = playableTiles(turn, newBoard)

    PlayableTiles.map(tile => {
      newBoard[tile.rowIndex][tile.columnIndex] = tile
    })
    if (filterTiles('empty', newBoard).length + filterTiles('playable', newBoard).length < 1) {
      setPass(false)
      return setWinner(true)
    }
    updateBoard(newBoard)
  }

  const handlePass = () => {
    setPass(false)
    const newBoard = [...Board]

    const tilesToReset = resetPlayable(newBoard)
    tilesToReset.map(tile => {
      newBoard[tile.rowIndex][tile.columnIndex] = tile
    })

    const PlayableTiles = playableTiles(turn, newBoard)

    PlayableTiles.map(tile => {
      newBoard[tile.rowIndex][tile.columnIndex] = tile
    })

    updateBoard(newBoard)
  }

  const displayPass = () => (
    <button onClick={() => handlePass()}>Passer le tour</button>
  )

  const handleReset = () => {
    const resetedBoard = {
      board: initializeBoard(),
      active: true,
      turn: 'black'
    }
    BoardService.setToken(loggedUser.token)
    setBoard(initializeBoard())
    setTurn('black')
    setWinner(false)
    BoardService.update(board.id, resetedBoard)
  }

  return (
    <>
      {winner ? displayWinner() : <h3 className="reversi-board">it&apos;s {turn} turn to play</h3>}
      <h3 className="reversi-board">Black score: {blackCount} | White score: {whiteCount}</h3>
      <button onClick={() => handleReset()}>Reset Game</button>

      <article className="reversi-board">
        {displayBoard()}

      </article>
      {pass ? displayPass() : null}
    </>
  )
}

Board.propTypes = {
  board: PropTypes.object
}

export default Board
