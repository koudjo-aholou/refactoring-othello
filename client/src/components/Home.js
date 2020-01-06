import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

const Home = ({
  handleGameCreation,
  changeName,
  changePassword,
  handleLogin,
  handleRegister,
  loggedUser,
  allBoards,
  handleJoinGame,
  changeBoardName,
  disconnect
}) => {
  const registerForm = () => (
    <Fragment>
      <form onSubmit={handleRegister} className="register-form">
        <h2>Créer un compte</h2>
        <div className="form-group">
          <label htmlFor="username">Pseudonyme</label>
          <input type="text" onChange={changeName} className="form-control"/>
        </div>
        <div className="form-group">
          <label htmlFor="password">Mot de passe</label>
          <input type="password" onChange={changePassword} className="form-control"/>
        </div>
        <button type="submit" className="btn btn-secondary" >Créer un compte</button>
      </form>
    </Fragment>
  )

  const loginForm = () => (
    <Fragment>
      <form onSubmit={handleLogin} className="form-group connexion-form" >
        <h2>Connexion</h2>
        <div className="form-group">
          <label htmlFor="username">Pseudonyme</label>
          <input type="text" name="username" title="Pseudonyme" onChange={changeName} className="form-control"/>
        </div>
        <div className="form-group">
          <label htmlFor="password">Mot de passe</label>
          <input type="password" name="password" title="Password" onChange={changePassword} className="form-control" />
        </div>
        <button type="submit" className="btn btn-secondary">login</button>
      </form>
    </Fragment>
  )

  const activeBoards = () => {
    const activeBoards = allBoards.filter(board => board.active)
    return (activeBoards.map(board => (
      <div className="active-game" key={board.id} ><div>
        <div><span className="fat">Nom</span>: {board.name}</div>
        <div><span className="fat">Créateur</span>: {board.users ? board.users[0].username : null} </div>
        <div><span className="fat">Score</span> : {board.blackscore + board.whitescore ? `Score noir ${board.blackscore} VS Score blanc ${board.whitescore}` : 'Pas encore joué'}</div>
        <div><span className="fat">État</span> : { board && board.users[1] ? 'Partie pleine' : 'Place disponible'}</div>
      </div>
      {board && board.users[1] && !board.users.find(user => user.id === loggedUser.id)
        ? <button onClick={() => handleJoinGame(board.id)} className="btn btn-secondary">Regarder la partie</button>
        : <button onClick={() => handleJoinGame(board.id)} className="btn btn-secondary">Rejoindre la partie</button>}

      </div>)))
  }

  if (loggedUser) {
    return (
      <main className="main-home">
        <h1 role="welcome">Bienvenue {loggedUser.username} !</h1>
        <div className="form-group">

          <input type="text" placeholder="Nom de la partie" onChange={changeBoardName} className="form-control"></input>
          <button onClick={() => handleGameCreation()} className="btn btn-secondary">Créer une partie</button>
          <button className="btn btn-danger" onClick={disconnect}>Se déconnecter</button>
        </div>
        <h3>Parties en cours</h3>
        {activeBoards()}
      </main>
    )
  } else {
    return (
      <main className="main-home">
        <h1>React Reversi Game</h1>
        {registerForm()}
        {loginForm()}
      </main>
    )
  }
}

export default Home

Home.propTypes = {
  handleGameCreation: PropTypes.func,
  changeName: PropTypes.func,
  changePassword: PropTypes.func,
  handleLogin: PropTypes.func,
  handleRegister: PropTypes.func,
  loggedUser: PropTypes.func,
  allBoards: PropTypes.func,
  handleJoinGame: PropTypes.func,
  changeBoardName: PropTypes.func,
  disconnect: PropTypes.func
}
