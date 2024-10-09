import { io } from 'socket.io-client';
import { LobbyPlayer } from '../../shared/Lobby';
import { Lobby } from '../../shared/Lobby';

const socket = io('http://localhost:3000');



//from the home page, create a new room -> redirects to the lobby page
document.getElementById('createRoomBtn')?.addEventListener('click', () => {
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
        } else {
            console.log("Room not found!");
        }
    })
    .catch(error => {
        console.error('Error creating room:', error);
    });
});

//homepage join room logic
document.getElementById('joinRoomBtn')?.addEventListener('click', () => {
    const roomInput = document.getElementById('roomCodeInput') as HTMLInputElement;
    const roomCode = roomInput.value;
    const errorMessageDiv = document.getElementById('errorMessage');

    if (roomCode) {
        fetch(`/join/${roomCode}`)
        .then(response => {
            if (response.ok) {
                window.location.href = `${window.location.origin}/join/${roomCode}`;
            } else {
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
    } else {
        displayErrorMessage('Please enter a room code');
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const roomCode = getRoomCodeFromURL();

    socket.on('update', (lobby) => {
            
        const lobbyState = Lobby.deserializeLobbyState(lobby);

        console.log(lobbyState);
        //Update the lobby state immediately, then change any UI
        updateLobbyState(lobbyState);

        //Host controls logic
        const hostControls = document.getElementById('hostControls') as HTMLElement;

        let playerId = socket.id;

        const isHost = (playerId: string): boolean => {
            const player = lobbyState.getPlayers().find(p => p.id === playerId);
            return player ? player.host : false;
        };
        let currentPlayerId = socket.id;
 
        hostControls.style.display = isHost(currentPlayerId) ? 'block' : 'none';
 
        //Logic to display game settings to non host players
        const nonHostSettings = document.getElementById('nonHostSettings') as HTMLElement;
        nonHostSettings.style.display = isHost(currentPlayerId) ? 'none' : 'block';
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

        //Logic to control whether to display start game button to host and waiting for host message
        const startGame = document.getElementById('startGame') as HTMLButtonElement;
        const waitingForHostStart = document.getElementById('waitingForHostStart') as HTMLElement;
        //If number of players matches expected players and all players are ready
        if (lobbyState.getNumMaxPlayers() != 0 && lobbyState.getNumPlayers() == lobbyState.getNumMaxPlayers() && lobbyState.areAllPlayersReady()) {
            if (isHost(currentPlayerId)) {
                startGame.style.display = 'block';
            }
            else {
            waitingForHostStart.style.display = 'block';
            }
        }
        else {
            waitingForHostStart.style.display = 'none';
            startGame.style.display = 'none';
        }

    });

    socket.emit('joinRoom', { roomCode })

    const welcomeToRoom = document.getElementById('welcomeToRoom') as HTMLElement;
    if (welcomeToRoom) {
        welcomeToRoom.textContent = `Welcome to Room ${roomCode}!`;
    }

    const enterName = document.getElementById('enterName') as HTMLElement;
    const playerNameInput = document.getElementById('playerName') as HTMLInputElement;
    const waitingForPlayers = document.getElementById('waitingForPlayers') as HTMLElement;
    const joinButton = document.getElementById('joinButton') as HTMLButtonElement;
    const joinForm = document.getElementById('joinForm') as HTMLFormElement;

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
                // joinForm.style.display = 'none';
            }
        });
    }



    function updateLobbyState(lobbyState: Lobby) {
        const playerContainer = document.getElementById('playerContainer') as HTMLElement;
        playerContainer.innerHTML = ''; 

        lobbyState.getPlayers().forEach((player: LobbyPlayer) => {
            const playerDiv = document.createElement('div');
            playerDiv.textContent = `${player.name}${player.host ? ' (Host)' : ''} ${player.ready ? '(Ready)' : ''}`;
            playerContainer.appendChild(playerDiv);
        });

        const gameStatus = document.getElementById('gameStatus') as HTMLElement;
        gameStatus.textContent = lobbyState.isGameStarted() ? 'Game has started!' : 'Waiting for players to ready up...';
    }
});

//join lobby sockets
socket.on('joinSuccess', ({ code, playerName }) => {
    alert(`Welcome ${playerName}! You have joined room ${code}.`);
});

socket.on('joinError', (message) => {
    alert(message);
});

socket.on('assignHost', (playerName) => {
    alert(`The host has left! ${playerName} is now the host.`);
});

function getRoomCodeFromURL(): string {
    const urlParts = window.location.pathname.split('/');
    return urlParts[urlParts.length - 1];
}

//Save settings logic
const saveSettingsButton = document.getElementById('saveSettings') as HTMLButtonElement;
const numPlayersSetting = document.getElementById('numPlayers') as HTMLSelectElement;
const numDecksSetting = document.getElementById('numDecks') as HTMLSelectElement;
if (saveSettingsButton) {
    saveSettingsButton.addEventListener('click', () => {
        const numPlayersSet = Number(numPlayersSetting.value);
        const numDecksSet = Number(numDecksSetting.value);
        socket.emit('saveSettings', {roomCode, numPlayersSet, numDecksSet})
        saveSettingsButton.textContent = 'Update Settings';
    })
}

//Start game logic
const startGameButton = document.getElementById('startGame') as HTMLButtonElement;
if (startGameButton) {
    startGameButton.addEventListener('click', () => {
        socket.emit('startGame', {roomCode})
        startGameButton.textContent = 'Game Starting...';
    })
}

//Ready up logic 
const readyButton = document.getElementById('readyButton') as HTMLButtonElement;
const roomCode = getRoomCodeFromURL();
if (readyButton) {
    let isReady = false;
    readyButton.addEventListener('click', () => {
        isReady = !isReady;
        socket.emit('readyUp', { roomCode });
        readyButton.textContent = isReady ? "Undo Ready" : "Ready Up";
    });
}


function displayErrorMessage(message: string) {
    const errorMessageDiv = document.getElementById('errorMessage');
    if (errorMessageDiv) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
    }
}

function generateRoomCode(): string {
    return Math.random().toString(36).slice(2, 7).toUpperCase();
}


