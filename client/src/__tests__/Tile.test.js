import React from 'react'
import { render } from '@testing-library/react'
import Case from '../components/Tile'
describe('renders correctly', () => {
  test('should exist', () => {
    const component = render(<Case />)
    console.log('component', component)
    expect(component).toBeTruthy()
  })

  test('should contain a "reversi case" node', () => {

  })
})
