// eslint-disable-next-line no-unused-vars
import React, { useState, Fragment } from 'react'

const Home = ({
  handleGameCreation,
  changeName,
  changePassword,
  handleLogin,
  handleRegister,
  loggedUser,
  allBoards,
  handleJoinGame,
  changeBoardName
}) => {
  // const [showRegister, setShowRegister] = useState(false)
  // const [showLogin, setShowLogin] = useState(false)

  const registerForm = () => (
    <form onSubmit={handleRegister}>
      <div><input type="text" onChange={changeName}/></div>
      <div><input type="password" onChange={changePassword}/></div>
      <button type="submit" >Créer un compte</button>
    </form>
  )

  const loginForm = () => (
    <React.Fragment>
      <h2>Connexion</h2>

      <form onSubmit={handleLogin}>
        <div><label htmlFor="username">Pseudonyme</label><input type="text" name="username" title="Pseudonyme" onChange={changeName}/></div>
        <div><label htmlFor="password">Mot de passe</label><input type="password" name="password" title="Password" onChange={changePassword} /></div>
        <button type="submit">login</button>
      </form>
    </React.Fragment>
  )

  const activeBoards = () => {
    const activeBoards = allBoards.filter(board => board.active)
    return (activeBoards.map(board => (
      <p key={board.id} >{board.name}
        <button onClick={() => handleJoinGame(board.id)}>Rejoindre la partie</button></p>)))
  }

  if (loggedUser) {
    return (
      <div style={{ textAlign: 'center', margin: '30vh auto', width: '70%' }}>
        <h1 role="welcome">Bienvenue {loggedUser.username} !</h1>
        <input type="text" placeholder="Nom de la partie" onChange={changeBoardName}></input>
        <button onClick={() => handleGameCreation()}>Créer une partie</button>
        {activeBoards()}
      </div>
    )
  } else {
    return (
      <Fragment>
        <h1>React Reversi Game</h1>
        {registerForm()}
        {loginForm()}
      </Fragment>
    )
  }
}

export default Home

Home.propTypes = {

}
