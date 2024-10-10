"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const Lobby_1 = require("../../shared/Lobby");
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
function getRoomCodeFromURL() {
    const urlParts = window.location.pathname.split('/');
    return urlParts[urlParts.length - 1];
}
/* shows error message on homescreen */
function displayErrorMessage(message) {
    const errorMessageDiv = document.getElementById('errorMessage');
    if (errorMessageDiv) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
    }
}
/* logic when player first enters room */
document.addEventListener("DOMContentLoaded", () => {
    const roomCode = getRoomCodeFromURL();
    /* Adds player (socket) to room, but not lobby */
    socket.emit('joinRoom', { roomCode });
    const welcomeToRoom = document.getElementById('welcomeToRoom');
    if (welcomeToRoom) {
        welcomeToRoom.textContent = `Welcome to Room ${roomCode}!`;
    }
    const enterName = document.getElementById('enterName');
    const playerNameInput = document.getElementById('playerName');
    const waitingForPlayers = document.getElementById('waitingForPlayers');
    const joinButton = document.getElementById('joinButton');
    /* adds player to lobby, hides enterName */
    if (joinButton) {
        joinButton.addEventListener('click', () => {
            const playerName = playerNameInput.value;
            if (playerName) {
                socket.emit('joinLobby', { roomCode, playerName });
                if (enterName) {
                    enterName.style.display = 'none';
                }
                if (waitingForPlayers) {
                    waitingForPlayers.style.display = 'block';
                }
            }
        });
    }
});
//join lobby sockets
socket.on('joinSuccess', ({ code, playerName }) => {
    alert(`Welcome ${playerName}! You have joined room ${code}.`);
});
socket.on('joinError', (message) => {
    alert(message);
});
//Lobby UI Logic
socket.on('update', (lobby) => {
    const lobbyState = Lobby_1.Lobby.deserializeLobbyState(lobby);
    //console.log(lobbyState);
    /* Update the lobby state immediately, then change any UI */
    updateLobbyState(lobbyState);
    /* show host controls to host */
    const hostControls = document.getElementById('hostControls');
    let playerId = socket.id;
    const isHost = lobby.isHost(playerId);
    hostControls.style.display = isHost ? 'block' : 'none';
    /* display game settings to non host players */
    const nonHostSettings = document.getElementById('nonHostSettings');
    nonHostSettings.style.display = isHost ? 'none' : 'block';
    const numPlayersDisplay = document.getElementById('numPlayersDisplay');
    const numDecksDisplay = document.getElementById('numDecksDisplay');
    const waitingForHostSettings = document.getElementById('waitingForHostSettings');
    if (lobbyState.getNumMaxPlayers() != 0) {
        waitingForHostSettings.style.display = 'none';
        numPlayersDisplay.style.display = 'block';
        numDecksDisplay.style.display = 'block';
        numPlayersDisplay.textContent = 'Number of Players: ' + lobbyState.getNumMaxPlayers();
        numDecksDisplay.textContent = 'Number of Decks: ' + lobbyState.getNumDecks();
    }
    /* hide waiting for players to ready up */
    const gameStatus = document.getElementById('gameStatus');
    gameStatus.textContent = (lobbyState.areAllPlayersReady() && lobbyState.getNumPlayers() > 1) ? 'All players are ready!' : 'Waiting for players to ready up...';
    /* control whether to display start game button to host and waiting for host message */
    const startGame = document.getElementById('startGame');
    const waitingForHostStart = document.getElementById('waitingForHostStart');
    /* If number of players matches expected players and all players are ready */
    if (lobbyState.getNumMaxPlayers() != 0 && lobbyState.getNumPlayers() == lobbyState.getNumMaxPlayers() && lobbyState.areAllPlayersReady()) {
        if (isHost) {
            startGame.style.display = 'block';
        }
        else {
            waitingForHostStart.style.display = 'block';
        }
    }
    else { //in case host changes settings
        waitingForHostStart.style.display = 'none';
        startGame.style.display = 'none';
    }
});
function updateLobbyState(lobbyState) {
    const playerContainer = document.getElementById('playerContainer');
    playerContainer.innerHTML = '';
    lobbyState.getPlayers().forEach((player) => {
        const playerDiv = document.createElement('div');
        playerDiv.textContent = `${player.name}${player.host ? ' (Host)' : ''} ${player.ready ? '(Ready)' : ''}`;
        playerContainer.appendChild(playerDiv);
    });
}
socket.on('assignHost', (playerName) => {
    alert(`The host has left! ${playerName} is now the host.`);
});
//Save settings logic
const saveSettingsButton = document.getElementById('saveSettings');
const numPlayersSetting = document.getElementById('numPlayers');
const numDecksSetting = document.getElementById('numDecks');
if (saveSettingsButton) {
    saveSettingsButton.addEventListener('click', () => {
        const numPlayersSet = Number(numPlayersSetting.value);
        const numDecksSet = Number(numDecksSetting.value);
        socket.emit('saveSettings', { roomCode, numPlayersSet, numDecksSet });
        saveSettingsButton.textContent = 'Update Settings';
    });
}
//Ready up logic 
const readyButton = document.getElementById('readyButton');
const roomCode = getRoomCodeFromURL();
if (readyButton) {
    let isReady = false;
    readyButton.addEventListener('click', () => {
        isReady = !isReady;
        socket.emit('readyUp', { roomCode });
        readyButton.textContent = isReady ? "Undo Ready" : "Ready Up";
    });
}
//Start game logic
const startGameButton = document.getElementById('startGame');
if (startGameButton) {
    startGameButton.addEventListener('click', () => {
        socket.emit('startGame', { roomCode });
        startGameButton.textContent = 'Game Starting...';
    });
}
//# sourceMappingURL=home.js.map