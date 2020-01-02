import React, { useState } from 'react'
import useSocket from 'use-socket.io-client'
import Board from './Board'

const Room = () => {
  const [id, setId] = useState('')
  const [socket] = useSocket('')
  const [nameInput, setNameInput] = useState('')
  const [room, setRoom] = useState('')

  socket.connect()
  console.log(socket)

  const handleSubmit = e => {
    e.preventDefault()
    if (!nameInput) {
      return alert("Name can't be empty")
    }
    setId(nameInput)
    socket.emit('join', nameInput, room)
  }

  return id ? (
    <Board />
  ) : (
    <div style={{ textAlign: 'center', margin: '30vh auto', width: '70%' }}>
      <form onSubmit={event => handleSubmit(event)}>
        <input
          id="playerName"
          onChange={e => setNameInput(e.target.value.trim())}
          required
          placeholder="What is your name .."
        />
        <br />
        <input
          id="room"
          onChange={e => setRoom(e.target.value.trim())}
          placeholder="What is your room .."
        />
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default Room
