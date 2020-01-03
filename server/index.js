const app = require('./app') // the actual Express app
const http = require('http')
const config = require('./utils/config')

const server = http.createServer(app)

server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})

const io = require('socket.io')(server)

io.on('connection', (socket) => {
  console.log('a user connected')
  socket.on('coucou', data => {
    socket.broadcast.emit('coucou', data)
  })
  socket.on('play', data => {
    socket.broadcast.emit('play', data)
  })
})
