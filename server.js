const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const { randId } = require('./utilities/utilities.js')

let rooms = {}

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    return res.render('index')
})

app.get('/checkRoomId/:roomId', (req, res) => {
    const roomId = req.params.roomId
    if (!rooms[roomId]) {
        return res.status(400).json({ "msg": "room doesn't exist" })
    }
    if (rooms[roomId] == 2) {
        return res.status(409).json({ "msg": "room is populated" })
    }

    res.status(200).json({ "msg": "connecting..." })
})

app.get('/createRoom', (req, res) => {
    const roomId = randId(6)
    rooms[roomId] = 1
    return res.status(200).json({ "roomId": roomId })
})

app.post('/join/:roomId/:username', (req, res) => {
    const roomId = req.params.roomId
    const username = req.params.username

    req.username = username

})

app.get('/:roomId', (req, res) => {
    const roomId = req.params.roomId
    return res.render('room', { "roomId": roomId })
})

io.on('connection', socket => {
    socket.on("joinRoom", (username, roomId) => {

    })
})

server.listen(3000, console.log("Server is listening on PORT 3000..."))