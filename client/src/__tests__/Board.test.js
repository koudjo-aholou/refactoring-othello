import React from 'react'
import { render } from '@testing-library/react'
import Board from '../components/Board'

describe('renders correctly', () => {
  test('should contain a board node', () => {
    const component = render(<Board />)
    const board = component.container.querySelector('.reversi-board')
    expect(board).toBeInTheDocument()
  })

  test('displays the score', () => {
    const { getByText } = render(<Board />)
    const linkElement = getByText(/score/i)
    expect(linkElement).toBeInTheDocument()
  })

  test('displays the turn of player', () => {
    const { getByText } = render(<Board />)
    const linkElement = getByText(/turn to play/i)
    expect(linkElement).toBeInTheDocument()
  })
})
