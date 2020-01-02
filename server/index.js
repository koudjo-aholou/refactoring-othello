const app = require('./app') // the actual Express app
const http = require('http')
const config = require('./utils/config')

const server = http.createServer(app)

server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})

const io = require('socket.io')(server)

let rooms = 0

io.on('connection', (socket) => {
  console.log('a user connected')
  socket.on('coucou', data => {
    io.sockets.emit('coucou', data )
  })
})


// socket.on('createGame', function (data) {
//   socket.join('room-' + ++rooms)
//   socket.emit('newGame', { name: data.name, room: 'room-' + rooms })
// })
// socket.on('joinGame', function (data) {
//   var room = io.nsps['/'].adapter.rooms[data.room]
//   if (room && room.length === 1) {
//     socket.join(data.room)
//     socket.broadcast.to(data.room).emit('player1', {})
//     socket.emit('player2', { name: data.name, room: data.room })
//   } else {
//     socket.emit('err', { message: 'Sorry, The room is full!' })
//   }
// })

// socket.on('playTurn', function (data) {
//   socket.broadcast.to(data.room).emit('turnPlayed', {
//     tile: data.tile,
//     room: data.room
//   })
// })

// socket.on('gameEnded', function (data) {
//   socket.broadcast.to(data.room).emit('gameEnd', data)
// })