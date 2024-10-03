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
document.addEventListener("DOMContentLoaded", () => {
    // Listen for lobby state updates from the server
    socket.on('update', (data) => {
        updateLobbyState(data.lobbyState);
    });
    const roomCode = getRoomCodeFromURL();
    socket.emit('showContent', { roomCode });
    const welcomeToRoom = document.getElementById('welcomeToRoom');
    if (welcomeToRoom) {
        welcomeToRoom.textContent = `Welcome to Room ${roomCode}!`;
    }
    const enterName = document.getElementById('enterName');
    const playerNameInput = document.getElementById('playerName');
    const waitingForPlayers = document.getElementById('waitingForPlayers');
    const joinButton = document.getElementById('joinButton');
    const joinForm = document.getElementById('joinForm');
    if (joinButton) {
        joinButton.addEventListener('click', () => {
            const playerName = playerNameInput.value;
            if (playerName) {
                socket.emit('joinRoom', { roomCode, playerName });
                if (enterName) {
                    enterName.style.display = 'none';
                }
                if (waitingForPlayers) {
                    waitingForPlayers.style.display = 'block';
                }
                joinForm.style.display = 'none';
            }
        });
    }
    // Update the UI based on the lobby state
    function updateLobbyState(lobbyState) {
        const playerContainer = document.getElementById('playerContainer');
        playerContainer.innerHTML = ''; // Clear current list
        lobbyState.players.forEach((player) => {
            const playerDiv = document.createElement('div');
            playerDiv.textContent = `${player.name} ${player.ready ? '(Ready)' : ''}`;
            playerContainer.appendChild(playerDiv);
        });
        const gameStatus = document.getElementById('gameStatus');
        gameStatus.textContent = lobbyState.gameStarted ? 'Game has started!' : 'Waiting for players to ready up...';
    }
    function getRoomCodeFromURL() {
        const urlParts = window.location.pathname.split('/');
        return urlParts[urlParts.length - 1];
    }
});
// Handle socket events
socket.on('joinSuccess', ({ code, playerName }) => {
    alert(`Welcome ${playerName}! You have joined room ${code}.`);
});
socket.on('joinError', (message) => {
    alert(message);
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
function generateRoomCode() {
    return Math.random().toString(36).slice(2, 7).toUpperCase();
}
//# sourceMappingURL=home.js.map