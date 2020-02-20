import React from 'react'
import PropTypes from 'prop-types'

const Tile = props => {
  if (props.state === 'playable') {
    return (
      <div className="reversi-tile">
        <div
          className={props.state}
          name={props.name}
          onClick={() => props.handlePlayTurn(props.rowIndex, props.columnIndex)}
        >
        </div>
      </div>
    )
  }

  return (
    <div className="reversi-tile">
      <div
        className={props.state}
        name={props.name}
      >
      </div>
    </div>
  )
}

Tile.propTypes = {
  name: PropTypes.string,
  state: PropTypes.string,
  handlePlayTurn: PropTypes.func,
  rowIndex: PropTypes.number,
  columnIndex: PropTypes.number
}

export default Tile
