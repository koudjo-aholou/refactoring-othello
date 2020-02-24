import * as gameLogic from '../utils/gameLogic'

function flatten (arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten)
  }, [])
}

describe('Game Logic', () => {
  describe('Board', () => {
    test('Should Create the board', () => {
      const createNewBoard = gameLogic.createBoard()
      const mapStateProp = createNewBoard.map(nested => nested.map(element => element.state))
      const checkEmpty = flatten(mapStateProp).every(el => el === 'empty')
      const map = new Map(Object.entries(createNewBoard))
      expect(map.size).toBe(8)
      expect(checkEmpty).toBe(true)
    })

    test('Should initiate the Board', () => {
      const Board = gameLogic.initializeBoard()
      const mapStateProp = Board.map(nested => nested.map(element => element.state))
      const checkEmpty = flatten(mapStateProp).every(el => el === 'empty')
      expect(Board[3][3].state).toBe('white')
      expect(Board[3][4].state).toBe('black')
      expect(Board[4][3].state).toBe('black')
      expect(Board[4][4].state).toBe('white')
      expect(checkEmpty).toBe(false)
    })

    // filterTiles
    // isPlayable
    // playableTiles
    // resetPlayable
    // makeMove
  })
})
