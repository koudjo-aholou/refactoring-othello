import React from 'react'
import { render } from '@testing-library/react'
import App from '../App'

describe('renders Home', () => {
  test('renders React Reversi Game', () => {
    const { getByText } = render(<App />)
    const linkElement = getByText(/React Reversi Game/i)
    expect(linkElement).toBeInTheDocument()
  })

  test('should be a login form', () => {
    const { getByText, getByTitle } = render(<App />)
    const linkElement = getByText(/Connexion/i)
    const nameInput = getByTitle(/Pseudonyme/i)
    const passwordInput = getByTitle(/Password/i)
    const submitInput = getByText(/login/i)
    expect(linkElement).toBeInTheDocument()
    expect(nameInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()
    expect(submitInput).toBeInTheDocument()
  })
})
