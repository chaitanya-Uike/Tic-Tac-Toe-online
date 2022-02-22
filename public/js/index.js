const joinBtn = document.querySelector("#join-btn")
const createBtn = document.querySelector("#create-btn")
const usernameField = document.querySelector("#username")
const roomIdField = document.querySelector("#roomId")
const infoCard = document.querySelector("#info-card")

const socket = io('/')

function checkUsername() {
    if (!usernameField.value) {
        displayinfo("Enter Username!")
        return false
    }
    return true
}

function checkRoomId() {
    const roomId = roomIdField.value
    if (roomId.length != 6) {
        displayinfo("Room id is invalid!")
        return false
    }
    return true
}

createBtn.addEventListener("click", async () => {
    if (!checkUsername())
        return

    const res = await fetch('/createRoom', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "host": usernameField.value,
        })
    })

    const data = await res.json()
    const roomId = data.roomId

    window.location.href = `/${roomId}`
})


joinBtn.addEventListener("click", async () => {
    if (!checkUsername())
        return
    if (!checkRoomId())
        return

    const res = await fetch('/join', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "roomId": roomIdField.value,
            "username": usernameField.value,
            "socketId": socket.id,
        })
    })

    const data = await res.json()
    displayinfo(data.msg)

    if (!res.ok)
        return

    socket.on("enter-room", approved => {
        if (approved)
            window.location.href = `/${roomIdField.value}`
        else
            displayinfo("request rejected")
    })
    // if (res.ok)
    //     window.location.href = `/${roomIdField.value}`

})
function displayinfo(msg) {
    infoCard.style.display = "inline-block"
    infoCard.querySelector("p").innerText = msg
}

// close info-card
infoCard.querySelector("#close-info-card").onclick = () => {
    infoCard.style.display = ""
}