const socket = io('/')

const requestAlertDiv = document.querySelector("#request-alert-div")
const accept = document.querySelector("#accept")
const reject = document.querySelector("#reject")

socket.emit("join-room", roomId, username)

socket.on('request', (username, socketId) => {
    requestAlertDiv.style.display = "block"
    requestAlertDiv.querySelector("h1").innerText = username

    accept.onclick = () => {
        socket.emit("approval", true, socketId)
        requestAlertDiv.style.display = ""
    }

    reject.onclick = () => {
        socket.emit("approval", false, socketId)
        requestAlertDiv.style.display = ""
    }
})

socket.on("user-connected", username => {
    console.log(username, "connected");
})
