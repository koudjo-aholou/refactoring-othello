import React from 'react'
import { render } from '@testing-library/react'
import Tile from '../components/Tile'

describe('renders correctly', () => {
  test('should contain a tile node', () => {
    const component = render(<Tile />)
    const tile = component.container.querySelector('.reversi-tile')
    expect(tile).toBeInTheDocument()
  })
})
