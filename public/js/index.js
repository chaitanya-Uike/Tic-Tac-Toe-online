const joinBtn = document.querySelector("#join-btn")
const createBtn = document.querySelector("#create-btn")
const usernameField = document.querySelector("#username")
const roomIdField = document.querySelector("#roomId")
const infoCard = document.querySelector("#info-card")


// room join logic
joinBtn.addEventListener("click", async e => {
    if (!checkUsername())
        return
    const roomAvail = await checkRoomId()
    if (!roomAvail)
        return

    const roomId = roomIdField.value
    joinRoom(roomId)
})

function joinRoom(roomId) {
    window.location.href = `/${roomId}`
}

function checkUsername() {
    if (!usernameField.value) {
        displayinfo("Enter Username!")
        return false
    }
    return true
}

async function checkRoomId() {
    const roomId = roomIdField.value
    if (roomId.length != 6) {
        displayinfo("Room id is invalid!")
        return false
    }

    const res = await fetch(`/checkRoomId/${roomId}`)
    const data = await res.json()

    displayinfo(data.msg)

    if (res.ok)
        return true

    return false

}

// create btm logic
createBtn.addEventListener("click", async e => {
    if (!checkUsername())
        return

    const res = await fetch('/createRoom')
    const data = await res.json()

    if (!res.ok) {
        displayinfo(data.msg)
        return
    }

    window.location.href = `/${data.roomId}`

})

function displayinfo(msg) {
    infoCard.style.display = "inline-block"
    infoCard.querySelector("p").innerText = msg
}

// close info-card
infoCard.querySelector("#close-info-card").onclick = () => {
    infoCard.style.display = ""
}