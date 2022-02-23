const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const session = require('express-session');

const { randId } = require('./utilities/utilities.js')

let rooms = {}

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())

// to enable persistent login session
app.use(session({
    secret: "secret key",
    resave: false,
    saveUninitialized: false,
}));

app.get('/', (req, res) => {
    return res.render('index')
})

app.post('/createRoom', (req, res) => {
    const host = req.body.host
    const roomId = randId(6)
    rooms[roomId] = []
    req.session.username = host
    res.json({ "roomId": roomId })
})

app.post('/join', (req, res) => {
    const { roomId, username, socketId } = req.body
    if (!rooms[roomId])
        return res.status(400).json({ "msg": "room doesn't exist!" })
    if (rooms[roomId][0] == username)
        return res.status(400).json({ "msg": "username is already used!" })
    if (rooms[roomId].length == 2)
        return res.status(400).json({ "msg": "Room is already populated!" })

    req.session.username = username
    io.to(roomId).emit('request', username, socketId)
    return res.status(200).json({ "msg": "request sent, awaiting approval..." })
})

app.get('/:roomId', (req, res) => {
    const roomId = req.params.roomId
    return res.render('room', { "roomId": roomId, "username": req.session.username })
})

server.listen(3000, console.log("Server is listening on PORT 3000..."))

io.on("connection", socket => {
    socket.on("join-room", (roomId, username) => {
        if (!rooms[roomId])
            return

        // // if page is reloaded
        if (rooms[roomId].indexOf(username) == -1)
            rooms[roomId].push(username)

        socket.join(roomId)
        socket.broadcast.to(roomId).emit("user-connected", username)

        if (rooms[roomId].length == 2) {
            io.to(roomId).emit("game-started", rooms[roomId])
        }

        socket.on("played", (move) => {
            socket.to(roomId).emit("register-move", move)
        })

        socket.on("turn-change", () => {
            io.to(roomId).emit("change-player")
        })

        socket.on("won", () => {
            socket.to(roomId).emit("opponent-won")
        })

        socket.on("tie", () => {
            socket.to(roomId).emit("match-tied")
        })

        socket.on("clear-board", () => {
            socket.to(roomId).emit("clear")
        })

        socket.on("reset", () => {
            socket.to(roomId).emit("reset-game")
        })

        // socket.on("disconnected")
    })

    socket.on("approval", (approved, socketId) => {
        io.to(socketId).emit("enter-room", approved)
    })

})