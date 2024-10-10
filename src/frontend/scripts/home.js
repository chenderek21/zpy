"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const socket = (0, socket_io_client_1.io)('http://localhost:3000');
/* from the home page, create a new room -> redirects to the lobby page */
(_a = document.getElementById('createRoomBtn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
    console.log("create room button clicked");
    const roomCode = generateRoomCode();
    /* sends request to the server to create the room */
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
/* from the home page, join an existing room -> redirects to lobby page */
(_b = document.getElementById('joinRoomBtn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
    const roomInput = document.getElementById('roomCodeInput');
    const roomCode = roomInput.value;
    const errorMessageDiv = document.getElementById('errorMessage');
    if (roomCode) {
        fetch(`/join/${roomCode}`)
            .then(response => {
            if (response.ok) {
                window.location.href = `${window.location.origin}/join/${roomCode}`;
            }
            else {
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
function generateRoomCode() {
    return Math.random().toString(36).slice(2, 7).toUpperCase();
}
/* shows error message on homescreen */
function displayErrorMessage(message) {
    const errorMessageDiv = document.getElementById('errorMessage');
    if (errorMessageDiv) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
    }
}
//# sourceMappingURL=home.js.map