const socket = io('/')

const requestAlertDiv = document.querySelector("#request-alert-div")
const accept = document.querySelector("#accept")
const reject = document.querySelector("#reject")
const infoCard = document.querySelector("#info-card")
const waitText = document.querySelector("#wait-text")
const main = document.querySelector("main")

const alerts = document.querySelector("#alerts")
const gridContainer = document.querySelector(".grid-container")


let playersList = []
let opponent
let turnFlag = false
let yourTurn

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

socket.on("register-move", id => {
    let char;
    if (turnFlag)
        char = "O";
    else
        char = "X";
    document.getElementById(id).innerText = char
    count++
})

socket.on("change-player", () => {
    turnFlag = !turnFlag
    play()
})

socket.on("opponent-won", () => {
    alerts.innerText = `${opponent} won !`;
    p2++;
    document.getElementById("scores").innerText = `${p1} / ${p2}`;
    document.getElementById("btn").style.display = "block"
})

socket.on("match-tied", () => {
    alerts.innerText = "It's a Tie";
})

function play() {
    // multiply by one to make it int
    if (playersList[turnFlag * 1] == username) {
        yourTurn = true
        alerts.innerText = `It's your turn`
    }
    else {
        yourTurn = false
        alerts.innerText = `It's ${opponent}'s turn`
    }
}

socket.on("game-started", users => {
    playersList = users
    opponent = playersList.filter((player) => player != username)[0]

    waitText.style.display = "none"
    main.style.display = "grid"

    play()
})

socket.on("clear", () => {
    resetBoard()
    document.getElementById("btn").style.display = ""
})

socket.on("reset-game", () => {
    p1 = 0;
    p2 = 0;
    document.getElementById("scores").innerText = "0 / 0";
    resetBoard();
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


function buildGrid() {
    gridContainer.innerHTML = ''
    for (let i = 1; i < 10; i++) {
        const div = document.createElement("div")
        div.className = "grid-tile"
        div.id = `b${i}`
        gridContainer.appendChild(div)
    }
}

buildGrid()

let cards = document.getElementsByClassName("grid-tile");

let box1 = document.getElementById("b1");
let box2 = document.getElementById("b2");
let box3 = document.getElementById("b3");
let box4 = document.getElementById("b4");
let box5 = document.getElementById("b5");
let box6 = document.getElementById("b6");
let box7 = document.getElementById("b7");
let box8 = document.getElementById("b8");
let box9 = document.getElementById("b9");

let count = 0;
let won;

let p1 = 0, p2 = 0;

function resetBoard() {
    document.getElementById("btn").style.display = ""
    count = 0
    turnFlag = false
    won = false
    if (playersList[turnFlag * 1] == username) {
        yourTurn = true
        alerts.innerText = `It's your Turn`
    }
    else {
        yourTurn = false
        alerts.innerText = `It's ${opponent}'s Turn`
    }
    Array.from(cards).forEach(function (element) {
        element.innerText = null;
    })
}

function check() {
    let char;
    won = false;
    if (turnFlag)
        char = "O";
    else
        char = "X";

    // horizontal check
    if (box1.innerText == char && box2.innerText == char && box3.innerText == char)
        won = true;
    else if (box4.innerText == char && box5.innerText == char && box6.innerText == char)
        won = true;
    else if (box7.innerText == char && box8.innerText == char && box9.innerText == char)
        won = true;

    // vertical check
    else if (box1.innerText == char && box4.innerText == char && box7.innerText == char)
        won = true;
    else if (box2.innerText == char && box5.innerText == char && box8.innerText == char)
        won = true;
    else if (box3.innerText == char && box6.innerText == char && box9.innerText == char)
        won = true;

    // diagonal check
    else if (box1.innerText == char && box5.innerText == char && box9.innerText == char)
        won = true;
    else if (box3.innerText == char && box5.innerText == char && box7.innerText == char)
        won = true;

    if (won) {
        alerts.innerText = "you won !";
        p1++;
        document.getElementById("scores").innerText = `${p1} / ${p2}`;
    }
}

function clicked(box) {

    if (!box.innerText && !won) {

        // to change the alerts accoording to players turn
        if (!yourTurn) {
            alerts.innerText = "It's your Turn";
        }
        else {
            alerts.innerText = `It's ${opponent}'s Turn`;
        }

        // to change the symbols according to players turn

        if (!turnFlag) {
            box.innerText = "X";
        }
        else {
            box.innerText = "O";
        }

        socket.emit("played", box.id)
        check()

        if (won) {
            document.getElementById("btn").style.display = "block"
            socket.emit("won")
            return
        }

        yourTurn = !yourTurn

        count++;

        if (count >= 9) {
            alerts.innerText = "It's a Tie";
            socket.emit("tie")
            return
        }

        socket.emit("turn-change")
    }
}

Array.from(cards).forEach(card => {
    card.addEventListener("click", e => {
        if (!yourTurn)
            return
        clicked(e.target)
    })
})

document.getElementById("btn").addEventListener("click", () => {
    resetBoard()
    socket.emit("clear-board")
});

document.getElementById("reset").addEventListener("click", function () {
    p1 = 0;
    p2 = 0;
    document.getElementById("scores").innerText = "0 / 0";
    resetBoard();
    socket.emit("reset")
})