"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const Lobby_1 = require("../../backend/Lobby");
function getRoomCodeFromURL() {
    const urlParts = window.location.pathname.split('/');
    return urlParts[urlParts.length - 1].substring(0, 5);
}
const roomCode = getRoomCodeFromURL();
const socket = (0, socket_io_client_1.io)(`/lobby/${roomCode}`);
/* logic when player first enters room */
document.addEventListener("DOMContentLoaded", () => {
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
                socket.emit('joinRoom', { playerName });
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
socket.on('disconnect', () => {
    alert(`Sorry, you have been disconnected. Redirecting to homepage...`);
    console.log("sorry you've disconnected");
    window.location.href = `${window.location.origin}`;
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
    const isHost = lobbyState.isHost(playerId);
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
    /* hide lobby stuff when game starts */
    const lobbyDisplay = document.getElementById('lobbyDisplay');
    const gameDisplay = document.getElementById('gameDisplay');
    if (lobbyState.isGameStarted()) {
        lobbyDisplay.style.display = 'none';
        gameDisplay.style.display = 'block';
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
        socket.emit('saveSettings', { numPlayersSet, numDecksSet });
        saveSettingsButton.textContent = 'Update Settings';
    });
}
//Ready up logic 
const readyButton = document.getElementById('readyButton');
if (readyButton) {
    let isReady = false;
    readyButton.addEventListener('click', () => {
        isReady = !isReady;
        socket.emit('readyUp');
        readyButton.textContent = isReady ? "Undo Ready" : "Ready Up";
    });
}
//Start game logic
const startGameButton = document.getElementById('startGame');
if (startGameButton) {
    startGameButton.addEventListener('click', () => {
        socket.emit('startGame');
        startGameButton.textContent = 'Game Starting...';
    });
}
//# sourceMappingURL=joinRoom.js.map