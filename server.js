const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

var session = require('express-session');
const flash = require('connect-flash');

const { randId } = require('./utilities/utilities.js')

let rooms = {}

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())

// to enable persistent login session
app.use(session({
    secret: "secret key",
    resave: false,
    saveUninitialized: true,
}));
app.use(flash());


app.get('/', (req, res) => {
    return res.render('index')
})

app.post('/createRoom', (req, res) => {
    const host = req.body.host
    const roomId = randId(6)
    rooms[roomId] = []
    req.flash('username', host)
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

    if (req.flash('username').length == 0)
        req.flash('username', username)
    io.to(roomId).emit('request', username, socketId)
    return res.status(200).json({ "msg": "request sent, awaiting approval..." })
})

app.get('/:roomId', (req, res) => {
    const roomId = req.params.roomId
    return res.render('room', { "roomId": roomId, "username": req.flash('username') })
})

server.listen(3000, console.log("Server is listening on PORT 3000..."))

io.on("connection", socket => {
    socket.on("join-room", (roomId, username) => {
        rooms[roomId].push(username)
        socket.join(roomId)
        socket.broadcast.to(roomId).emit("user-connected", username)
    })

    socket.on("approval", (approved, socketId) => {
        io.to(socketId).emit("enter-room", approved)
    })
})