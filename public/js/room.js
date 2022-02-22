const socket = io('/')

const requestAlertDiv = document.querySelector("#request-alert-div")
const accept = document.querySelector("#accept")
const reject = document.querySelector("#reject")
const infoCard = document.querySelector("#info-card")
const waitText = document.querySelector("#wait-text")

let usersList = []

socket.emit("join-room", roomId, username)

socket.on('request', (username, socketId) => {
    requestAlertDiv.style.display = "flex"
    requestAlertDiv.querySelector("h1").innerText = `${username} wants to join`

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
    displayinfo(`${username} connected`)
})

socket.on("game-started", users => {
    usersList = users
    waitText.style.display = "none"
})


function displayinfo(msg) {
    infoCard.style.display = "flex"
    infoCard.querySelector("p").innerText = msg

    setTimeout(() => {
        infoCard.style.display = ""
    }, 3000);
}

// close info-card
infoCard.querySelector("#close-info-card").onclick = () => {
    infoCard.style.display = ""
}

