import { io } from 'socket.io-client';

import { LobbyPlayer } from '../../shared/Lobby';
import { Lobby } from '../../shared/Lobby';


function getRoomCodeFromURL(): string {
    const urlParts = window.location.pathname.split('/');
    return urlParts[urlParts.length - 1].substring(0,5);
}
const roomCode = getRoomCodeFromURL();
const socket = io(`/lobby/${roomCode}`);

/* logic when player first enters room */
document.addEventListener("DOMContentLoaded", () => {


    const welcomeToRoom = document.getElementById('welcomeToRoom') as HTMLElement;
    if (welcomeToRoom) {
        welcomeToRoom.textContent = `Welcome to Room ${roomCode}!`;
    }

    const enterName = document.getElementById('enterName') as HTMLElement;
    const playerNameInput = document.getElementById('playerName') as HTMLInputElement;
    const waitingForPlayers = document.getElementById('waitingForPlayers') as HTMLElement;
    const joinButton = document.getElementById('joinButton') as HTMLButtonElement;

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
    alert(`Sorry, you have been disconnected.`);
    window.location.href = `${window.location.origin}`;
});

//Lobby UI Logic
socket.on('update', (lobby) => {
        
    const lobbyState = Lobby.deserializeLobbyState(lobby);

    //console.log(lobbyState);

    /* Update the lobby state immediately, then change any UI */
    updateLobbyState(lobbyState);

    /* show host controls to host */
    const hostControls = document.getElementById('hostControls') as HTMLElement;
    let playerId = socket.id;
    const isHost = lobbyState.isHost(playerId);

    hostControls.style.display = isHost ? 'block' : 'none';

    /* display game settings to non host players */
    const nonHostSettings = document.getElementById('nonHostSettings') as HTMLElement;
    nonHostSettings.style.display = isHost ? 'none' : 'block';
    const numPlayersDisplay = document.getElementById('numPlayersDisplay') as HTMLElement;
    const numDecksDisplay = document.getElementById('numDecksDisplay') as HTMLElement;
    const waitingForHostSettings = document.getElementById('waitingForHostSettings') as HTMLElement;
    if (lobbyState.getNumMaxPlayers() != 0) {
        waitingForHostSettings.style.display = 'none';
        numPlayersDisplay.style.display = 'block';
        numDecksDisplay.style.display = 'block';
        numPlayersDisplay.textContent = 'Number of Players: '+lobbyState.getNumMaxPlayers();
        numDecksDisplay.textContent = 'Number of Decks: '+lobbyState.getNumDecks();
    }
    
    /* hide waiting for players to ready up */
    const gameStatus = document.getElementById('gameStatus') as HTMLElement;
    gameStatus.textContent = (lobbyState.areAllPlayersReady() && lobbyState.getNumPlayers() > 1) ? 'All players are ready!' : 'Waiting for players to ready up...';
    
    /* control whether to display start game button to host and waiting for host message */
    const startGame = document.getElementById('startGame') as HTMLButtonElement;
    const waitingForHostStart = document.getElementById('waitingForHostStart') as HTMLElement;
    
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
    const lobbyDisplay = document.getElementById('lobbyDisplay') as HTMLElement;
    const gameDisplay = document.getElementById('gameDisplay') as HTMLElement;
    if (lobbyState.isGameStarted()) {
        lobbyDisplay.style.display = 'none';
        gameDisplay.style.display = 'block';
    }
});

function updateLobbyState(lobbyState: Lobby) {
    const playerContainer = document.getElementById('playerContainer') as HTMLElement;
    playerContainer.innerHTML = ''; 

    lobbyState.getPlayers().forEach((player: LobbyPlayer) => {
        const playerDiv = document.createElement('div');
        playerDiv.textContent = `${player.name}${player.host ? ' (Host)' : ''} ${player.ready ? '(Ready)' : ''}`;
        playerContainer.appendChild(playerDiv);
    });

}

socket.on('assignHost', (playerName) => {
    alert(`The host has left! ${playerName} is now the host.`);
});

//Save settings logic
const saveSettingsButton = document.getElementById('saveSettings') as HTMLButtonElement;
const numPlayersSetting = document.getElementById('numPlayers') as HTMLSelectElement;
const numDecksSetting = document.getElementById('numDecks') as HTMLSelectElement;
if (saveSettingsButton) {
    saveSettingsButton.addEventListener('click', () => {
        const numPlayersSet = Number(numPlayersSetting.value);
        const numDecksSet = Number(numDecksSetting.value);
        socket.emit('saveSettings', {numPlayersSet, numDecksSet})
        saveSettingsButton.textContent = 'Update Settings';
    })
}

//Ready up logic 
const readyButton = document.getElementById('readyButton') as HTMLButtonElement;
if (readyButton) {
    let isReady = false;
    readyButton.addEventListener('click', () => {
        isReady = !isReady;
        socket.emit('readyUp');
        readyButton.textContent = isReady ? "Undo Ready" : "Ready Up";
    });
}

//Start game logic
const startGameButton = document.getElementById('startGame') as HTMLButtonElement;
if (startGameButton) {
    startGameButton.addEventListener('click', () => {
        socket.emit('startGame')
        startGameButton.textContent = 'Game Starting...';
    })
}