import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { playableTiles, makeMove, resetPlayable, filterTiles } from '../utils/gameLogic'
import BoardService from '../services/boards'
import Tile from './Tile'
import useSocket from 'use-socket.io-client'

const Board = ({ board }) => {
  const [Board, setBoard] = useState(board.board)
  const [turn, setTurn] = useState(board.turn)
  const [blackCount, setBlackCount] = useState(filterTiles('black', Board).length)
  const [whiteCount, setWhiteCount] = useState(filterTiles('white', Board).length)
  const [winner, setWinner] = useState(false)
  const [pass, setPass] = useState(false)
  const [passCount, setPassCount] = useState(0)
  const [socket] = useSocket('http://localhost:9000')

  useEffect(() => {
    socket.on('board', board => {
      setBoard(board)
    })
  }, [])

  const displayBoard = () => Board.map(row => (
    <div key={Board.indexOf(row)}>{row.map(tile =>
      <Tile key={tile.name} {...tile} handleTileChange={handleTileChange} />
    )}</div>))

  const displayWinner = () => {
    return blackCount > whiteCount
      ? <h3 className="reversi-board">Black player won!</h3>
      : <h3 className="reversi-board">White player won!</h3>
  }

  if (winner) {
    BoardService.update(board.id, { ...Board, active: false })
  }

  const updateBoard = async (newBoard, pass) => {
    const newTurn = turn === 'black' ? 'white' : 'black'
    setTurn(newTurn)
    const updatedBoard = { board: newBoard, turn: pass || newTurn }
    const localboards = JSON.parse(localStorage.getItem('boards'))
    const data = await BoardService.update(board.id, updatedBoard)
    localStorage.setItem('boards', JSON.stringify(localboards.map(b => b.id !== board.id ? b : data)))
    setBoard(data.board)
    socket.emit('board', data.board)
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
    console.log('PlayableTiles', PlayableTiles)

    if (PlayableTiles && PlayableTiles.length < 1) {
      if (passCount === 2) {
        return setWinner(true)
      }
      setPass(true)
      return setPassCount(passCount + 1)
    }

    PlayableTiles.map(tile => {
      newBoard[tile.rowIndex][tile.columnIndex] = tile
    })
    if (filterTiles('empty', newBoard).length + filterTiles('playable', newBoard).length < 1) {
      setPass(false)
      return setWinner(true)
    }
    updateBoard(newBoard)
    setBlackCount(filterTiles('black', newBoard).length)
    setWhiteCount(filterTiles('white', newBoard).length)
  }

  const handlePass = () => {
    setPass(false)
    const pass = turn === 'black' ? 'white' : 'black'
    setTurn(turn === 'black' ? 'white' : 'black')
    updateBoard(Board, pass)
  }

  const displayPass = () => (
    <button onClick={() => handlePass()}>Passer le tour</button>
  )

  return (
    <>
      {winner ? displayWinner() : <h3 className="reversi-board">it&apos;s {turn} turn to play</h3>}
      <h3 className="reversi-board">Black score: {blackCount} | White score: {whiteCount}</h3>

      <article className="reversi-board">
        {displayBoard()}

      </article>
      {pass ? displayPass() : null}
    </>
  )
}

Board.propTypes = {
  board: PropTypes.object.isRequired
}

export default Board
