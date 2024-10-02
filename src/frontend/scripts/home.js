"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const socket = (0, socket_io_client_1.io)('http://localhost:3000');
//from the home page, create a new room -> redirects to the lobby page
(_a = document.getElementById('createRoomBtn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
    console.log("create room button clicked");
    const roomCode = generateRoomCode();
    // Send a request to the server to create the room
    fetch('/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: roomCode })
    })
        .then(response => response.json())
        .then(data => {
        if (data.code) {
            window.location.href = `${window.location.origin}/join/${data.code}`;
        }
        else {
            console.log("Room not found!");
        }
    })
        .catch(error => {
        console.error('Error creating room:', error);
    });
});
//on the join room/lobby screen, allow the user to join the room (only adds to lobby list until game starts)
const joinForm = document.getElementById('joinForm');
if (joinForm) {
    joinForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const playerNameInput = document.getElementById('playerName');
        if (playerNameInput) {
            const playerName = playerNameInput.value;
            // Extract the room code from the URL
            const pathSegments = window.location.pathname.split('/');
            const roomCode = pathSegments[2];
            socket.emit('joinRoom', { roomCode, playerName });
        }
        else {
            console.error('Player name input field is missing!');
        }
    });
}
document.addEventListener("DOMContentLoaded", () => {
    const urlParts = window.location.pathname.split('/');
    const roomCode = urlParts[urlParts.length - 1];
    const welcomeToRoom = document.getElementById('welcomeToRoom');
    if (welcomeToRoom) {
        welcomeToRoom.textContent = `Welcome to Room ${roomCode}!`;
    }
    const waitingForPlayers = document.getElementById('waitingForPlayers');
    const joinForm = document.getElementById('joinForm');
    if (joinForm) {
        joinForm.addEventListener('submit', (event) => {
            event.preventDefault();
            // const enterName = document.getElementById('enterName') as HTMLElement;
            // if (enterName) {
            //     enterName.style.display = 'none';
            // }
            if (waitingForPlayers) {
                waitingForPlayers.style.display = 'block';
            }
            joinForm.style.display = 'none';
        });
    }
});
// Handle socket events
socket.on('joinSuccess', ({ code, playerName }) => {
    alert(`Welcome ${playerName}! You have joined room ${code}.`);
    // Optionally, redirect to the game room or update the UI
    // window.location.href = `${window.location.origin}/game/${code}`;
});
socket.on('joinError', (message) => {
    alert(message);
});
// Listen for updates from the server about the players
socket.on('updatePlayers', (players) => {
    console.log("Updating players:", players);
    updatePlayerList(players);
});
(_b = document.getElementById('joinRoomBtn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
    const roomInput = document.getElementById('roomCodeInput');
    const roomCode = roomInput.value;
    const errorMessageDiv = document.getElementById('errorMessage');
    if (roomCode) {
        // Make an API call to check if the room exists
        fetch(`/join/${roomCode}`)
            .then(response => {
            if (response.ok) {
                // If the room exists, redirect to the game room
                window.location.href = `${window.location.origin}/join/${roomCode}`;
            }
            else {
                // If the response is not OK (e.g., 404), display an error message
                return response.json();
            }
        })
            .then(data => {
            if (data && data.error) {
                displayErrorMessage(data.error);
            }
        })
            .catch(error => {
            console.error('Error:', error);
            displayErrorMessage('Error checking room');
        });
    }
    else {
        displayErrorMessage('Please enter a room code');
    }
});
function displayErrorMessage(message) {
    const errorMessageDiv = document.getElementById('errorMessage');
    if (errorMessageDiv) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
    }
}
function updatePlayerList(players) {
    console.log("Updating player list");
    const playerContainer = document.getElementById('playerContainer');
    playerContainer.innerHTML = ''; // Clear existing player list
    players.forEach(player => {
        const playerElement = document.createElement('div');
        playerElement.textContent = player.name;
        playerContainer.appendChild(playerElement);
    });
}
function generateRoomCode() {
    return Math.random().toString(36).slice(2, 7).toUpperCase();
}
//# sourceMappingURL=home.js.map