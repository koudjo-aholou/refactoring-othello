const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const Board = require('../models/board')
const updateBoardWithMe = require('../utils/updateBoard')

const initialUsers = [
  {
    username: 'norbert',
    password: 'norbert'
  },
  {
    username: 'jeremie',
    password: 'jeremie'
  }
]

const mockBoards = [
  {
    board: [[], [], []],
    active: true,
    name: 'mockBoard'
  },
  {
    board: [[], [], []],
    active: true,
    name: 'mockBoard2'
  }

]

const boardsInDB = async () => {
  const boards = await Board.find({})
  return boards.map(board => board.toJSON())
}

const usersInDB = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

beforeEach(async () => {
  await User.deleteMany({})

  for (const user of initialUsers) {
    const userObject = new User(user)
    await userObject.save()
  }

  await Board.deleteMany({})

  for (const board of mockBoards) {
    const boardObject = new Board(board)
    await boardObject.save()
  }
})

describe('CRUD USER', () => {
  test('users are returned as json', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  describe('Contract Test USER', () => {
  //AJOUT REFACTORING : Contract Test
    test('Has property "id" in the response ', async () => {
      const jsonData = await api.get('/api/users');
      expect(jsonData.body[0]).toHaveProperty('id');
    });

    test('Property "id" is a String', async () => {
      const jsonData = await api.get('/api/users');
      expect(typeof jsonData.body[0].id).toBe('string');
    });

    test('Property "id" not be null or empty', async() => {
      const jsonData = await api.get('/api/users');
      expect(jsonData.body[0].id).not.toEqual('');
      expect(jsonData.body[0].id).not.toEqual(' ');
      expect(jsonData.body[0].id).not.toEqual(null);
      expect(jsonData.body[0].id.length).not.toEqual(0);
    });

    test('Has property "boards" in the response ', async () => {
      const jsonData = await api.get('/api/users');
      expect(jsonData.body[0]).toHaveProperty('boards');
    });

    test('Property "boards" is an Array ', async() => {
      const jsonData = await api.get('/api/users');
      expect( Array.isArray([jsonData.body[0].boards]));
    });

    test('has 3 properties', async() =>{
      const jsonData = await api.get('/api/users');
      const size = Object.keys(jsonData.body[0]).length;
      expect(size).toEqual(3)
    })

    test('Has property "username" in the response ', async () => {
      const jsonData = await api.get('/api/users');
      expect(jsonData.body[0]).toHaveProperty('username');
    });
  })

  test('should be two users in DB', async () => {
    const response = await api.get('/api/users')
    expect(response.body.length).toEqual(initialUsers.length)
  })

  test('should view a specific user', async () => {
    const users = await usersInDB()

    const norbert = users[0]

    const resultNorbert = await api
      .get(`/api/users/${norbert.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultNorbert.body).toEqual(norbert)
  })
  test('should be able to add an user', async () => {
    const usersBeforeRequest = await usersInDB()

    const newUser = {
      username: 'firmin',
      password: 'firmin'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAfterRequest = await usersInDB()
    expect(usersAfterRequest.length).toBe(usersBeforeRequest.length + 1)

    const usernames = usersAfterRequest.map(n => n.username)
    expect(usernames).toContain('firmin')
  })

  test('should only update user to add boards ie. join rooms', async () => {
    const usersBeforeRequest = await usersInDB()

    const updatedUser = { ...usersBeforeRequest[0], username: 'updatedUser' }

    await api
      .put(`/api/users/${updatedUser.id}`)
      .send(updatedUser)
      .expect(500)
  })

  test('should be able to delete a user', async () => {
    const usersBeforeRequest = await usersInDB()
    const userToDelete = usersBeforeRequest[0]

    await api
      .delete(`/api/users/${userToDelete.id}`)
      .expect(204)

    const usersAfterRequest = await usersInDB()

    expect(usersAfterRequest.length).toBe(
      usersBeforeRequest.length - 1
    )

    const usernames = usersAfterRequest.map(r => r.username)

    expect(usernames).not.toContain(userToDelete.username)
  })

  test('should be able to login', async () => {
    const newUser = {
      username: 'firmin',
      password: 'firmin'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)

    const credentials = { username: newUser.username, password: newUser.password }

    await api
      .post('/api/login')
      .send(credentials)
      .expect(200)
  })

  test('should get 401 when entering wrong credentials', async () => {
    const newUser = {
      username: 'firmin',
      password: 'firmin'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)

    const credentials = { username: newUser.username, password: 'wrongPassword' }

    await api
      .post('/api/login')
      .send(credentials)
      .expect(401)
  })
})

describe('CRUD BOARD', () => {
  test('boards are returned as json', async () => {
    await api
      .get('/api/boards')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('should be two boards in DB', async () => {
    const response = await api.get('/api/boards')

    expect(response.body.length).toEqual(mockBoards.length)
  })

  test('should view a specific board', async () => {
    const boards = await boardsInDB()

    const firstBoard = boards[0]

    const resultBoard = await api
      .get(`/api/boards/${firstBoard.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultBoard.body).toEqual(firstBoard)
  })

  test('should be able to add a board', async () => {
    const boardsBeforeRequest = await boardsInDB()

    const newUser = {
      username: 'firmin',
      password: 'firmin'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)

    const credentials = { username: newUser.username, password: newUser.password }

    const res = await api
      .post('/api/login')
      .send(credentials)
      .expect(200)

    const newBoard = {
      board: [[], [], []],
      active: true,
      name: 'newBoard'
    }

    await api
      .post('/api/boards')
      .set('Authorization', 'Bearer ' + res.body.token)
      .send(newBoard)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const boardsAfterRequest = await boardsInDB()
    expect(boardsAfterRequest.length).toBe(boardsBeforeRequest.length + 1)

    const boardnames = boardsAfterRequest.map(n => n.name)
    expect(boardnames).toContain('newBoard')
  })

  test('should not be able to update board if not in hits users array', async () => {
    const boardsBeforeRequest = await boardsInDB()

    const newUser = {
      username: 'firmin',
      password: 'firmin'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)

    const credentials = { username: newUser.username, password: newUser.password }

    const res = await api
      .post('/api/login')
      .send(credentials)
      .expect(200)

    const updatedBoard = { ...boardsBeforeRequest[0], name: 'updatedBoard' }

    await api
      .put(`/api/boards/${updatedBoard.id}`)
      .set('Authorization', 'Bearer ' + res.body.token)
      .send(updatedBoard)
      .expect(401)
  })

  test('should be able to delete a board', async () => {
    const boardsBeforeRequest = await boardsInDB()
    const boardToDelete = boardsBeforeRequest[0]

    await api
      .delete(`/api/boards/${boardToDelete.id}`)
      .expect(204)

    const boardsAfterRequest = await boardsInDB()

    expect(boardsAfterRequest.length).toBe(
      boardsBeforeRequest.length - 1
    )

    const names = boardsAfterRequest.map(r => r.name)

    expect(names).not.toContain(boardToDelete.name)
  })
})

describe('New USER Can subscribe and play || User can join a Game and play', () => { 

  const userOneBlack = {
    username: 'UserSubscribe',
    password: 'user'
  }
  test('Create a user then login then create a board then play with this board and Wait White', async () => { 
    // user subscribe

    await api
      .post('/api/users')
      .send(userOneBlack)
      .expect(200)

    const credentials = { username: userOneBlack.username, password: userOneBlack.password }

    const res = await api
      .post('/api/login')
      .send(credentials)
      .expect(200)

    const idOfThisUser = res.body.id
    // user  name a game and create it
    const newBoard = {
      board: [[], [], []],
      active: true,
      name: 'newBoard-UserSubscribe'
    }

    const respAddBoard = await api
      .post('/api/boards')
      .set('Authorization', 'Bearer ' + res.body.token)
      .send(newBoard)
      .expect(200)
      
      expect(respAddBoard.body.name).toEqual(newBoard.name)

      const IdBoardGame = respAddBoard.body.id

    // user join its game
      const resultBoard = await api
        .get(`/api/boards/${IdBoardGame}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(resultBoard.body.id).toEqual(IdBoardGame)
      expect(resultBoard.body.turn).toEqual("black")

    // user can modify the board 
    let updateBoardMove = {...respAddBoard.body}
    updateBoardMove.board = updateBoardWithMe.board;

    const updateBoard =  await api
      .put(`/api/boards/${IdBoardGame}`)
      .set('Authorization', 'Bearer ' + res.body.token)
      .send(updateBoardMove)
      .expect(200)

      expect(updateBoard.body).toEqual(updateBoardMove)
      // waiting Player Two
      const usersLength = updateBoard.body.users.length
      expect(usersLength).toEqual(1)
      expect(updateBoard.body.users[0]).toEqual(idOfThisUser)

      const userWhite = {
        username: 'UserWhite',
        password: 'user'
      }
  
      await api
        .post('/api/users')
        .send(userWhite)
        .expect(200)
  
      const credentialsTwo = { username: userWhite.username, password: userWhite.password }
  
      const resTwo = await api
        .post('/api/login')
        .send(credentialsTwo)
        .expect(200)
    
      expect(resTwo.body.username).toEqual(credentialsTwo.username)
      const AddBoardId = {board : respAddBoard.body.id}
      const idPlayerTwo = resTwo.body.id

      // user join its game
      const addPlayerTwoBoard = await api
      .put(`/api/users/${idPlayerTwo}`)
      .send(AddBoardId)
      .expect(200)

  //    console.log(addPlayerTwoBoard, "here ===============");

      // const resultPlayertwoCanPlayBoard = await api
      // .get(`/api/boards/${AddBoardId}`)
      // .expect(200)
      // .expect('Content-Type', /application\/json/)

      // expect(resultPlayertwoCanPlayBoard.users).toEqual(idPlayerTwo)
      
  })
})

describe('USER2 Can join a Game create by a userOneBlack and can play with userOneBlack', () => { 

  test('Log user White && join specific game', async () => {
   
 })
  // user join a game
  // user can modify the board 
  // score change or not
  // waiting Player One
})

afterAll(() => {
  mongoose.connection.close()
})
