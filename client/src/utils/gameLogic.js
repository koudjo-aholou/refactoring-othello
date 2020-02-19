// A tile can have four states : playable, empty, white, black. It starts empty.
const tile = {
  state: 'empty'
}

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const index = [0, 1, 2, 3, 4, 5, 6, 7]

const createBoard = () => index.map(row => index.map(column => {
  return { ...tile, rowIndex: row, columnIndex: column, name: letters[row] + (column + 1) }
}))

export const initializeBoard = () => {
  const Board = createBoard()
  Board[3][3].state = 'white'
  Board[3][4].state = 'black'
  Board[4][3].state = 'black'
  Board[4][4].state = 'white'
  return Board
}

export const filterTiles = (chosenState, Board) => {
  const FilteredTiles = []
  Board.map(row => row.map(tile => tile.state === chosenState ? FilteredTiles.push(tile) : null))
  return FilteredTiles
}

const isUpperLeft = (rowIndex, columnIndex, Board) => Board[rowIndex - 1][columnIndex - 1]
const isLowerLeft = (rowIndex, columnIndex, Board) => Board[rowIndex - 1][columnIndex + 1]
const isUpperRight = (rowIndex, columnIndex, Board) => Board[rowIndex + 1][columnIndex - 1]
const isLowerRight = (rowIndex, columnIndex, Board) => Board[rowIndex + 1][columnIndex + 1]
const isUpper = (rowIndex, columnIndex, Board) => Board[rowIndex][columnIndex - 1]
const isLower = (rowIndex, columnIndex, Board) => Board[rowIndex][columnIndex + 1]
const isLeft = (rowIndex, columnIndex, Board) => Board[rowIndex - 1][columnIndex]
const isRight = (rowIndex, columnIndex, Board) => Board[rowIndex + 1][columnIndex]

const moves = [isUpperLeft, isUpperRight, isLowerLeft, isLowerRight, isLower, isUpper, isLeft, isRight]

export const isPlayable = (tile, turn, Board) => {
  const { rowIndex, columnIndex } = tile
  const playableTiles = []
  moves.map(move => {
    try {
      let tileAround = move(rowIndex, columnIndex, Board)
      if (tileAround && tileAround.state === turn) {
        while (tileAround && tileAround.state === turn) {
          tileAround = move(tileAround.rowIndex, tileAround.columnIndex, Board)
        }
        if (tileAround && tileAround.state === 'empty') {
          playableTiles.push(tileAround)
        }
      }
    } catch (e) { console.log('error', e) }
  })
  return playableTiles
}

export const playableTiles = (turn, Board) => {
  const opposite = turn === 'black' ? 'white' : 'black'
  const playableTiles = []
  const Tiles = filterTiles(opposite, Board)
  const playableArrays = Tiles.map(tile => isPlayable(tile, turn, Board))
  playableArrays.map(arr => arr.map(tile => playableTiles.push(tile)))
  const tilesToPlay = playableTiles.map(tile => {
    tile.state = 'playable'
    return tile
  })
  return tilesToPlay
}

export const resetPlayable = (Board) => {
  const tilesToReset = filterTiles('playable', Board)
  const resetedTiles = tilesToReset.map(tile => {
    tile.state = 'empty'
    return tile
  })
  return resetedTiles
}

export const makeMove = (rowIndex, columnIndex, turn, Board) => {
  const opposite = turn === 'black' ? 'white' : 'black'
  let tilesToChange = [Board[rowIndex][columnIndex]]
  moves.map(move => {
    try {
      let tileAround = move(rowIndex, columnIndex, Board)
      const possibleTiles = [tileAround]
      if (tileAround && tileAround.state === opposite) {
        while (tileAround && tileAround.state === opposite) {
          tileAround = move(tileAround.rowIndex, tileAround.columnIndex, Board)
          possibleTiles.push(tileAround)
        }
        if (tileAround && tileAround.state === turn) {
          tilesToChange = tilesToChange.concat(possibleTiles)
        }
      }
    } catch (e) { console.log('error', e) }
  })
  tilesToChange.map(tile => {
    tile.state = turn
    return tile
  })
  return tilesToChange
}
