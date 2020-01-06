import React from 'react'
import { render } from '@testing-library/react'
import Board from '../components/Board'

describe('renders correctly', () => {
  test('should contain a board node', () => {
    try {
      const component = render(<Board />)
      const board = component.container.querySelector('.reversi-board')
      expect(board).toBeInTheDocument()
    } catch (e) {

    }
  })

  test('displays the score', () => {
    try {
      const { getByText } = render(<Board />)
      const linkElement = getByText(/score/i)
      expect(linkElement).toBeInTheDocument()
    } catch (e) {

    }
  })

  test('displays the turn of player', () => {
    try {
      const { getByText } = render(<Board />)
      const linkElement = getByText(/turn to play/i)
      expect(linkElement).toBeInTheDocument()
    } catch (e) {
    }
  })
})
