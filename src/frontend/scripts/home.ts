import { io } from 'socket.io-client';
import { LobbyPlayer } from '../../shared/Lobby';

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



document.addEventListener("DOMContentLoaded", () => {
    // Listen for lobby state updates from the server
    socket.on('update', (data) => {
        updateLobbyState(data.lobbyState);
    });
    const roomCode = getRoomCodeFromURL();
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
                joinForm.style.display = 'none';
            }
        });
    }

    function updateLobbyState(lobbyState: { players: LobbyPlayer[], gameStarted: boolean }) {
        const playerContainer = document.getElementById('playerContainer') as HTMLElement;
        playerContainer.innerHTML = ''; 

        lobbyState.players.forEach((player: LobbyPlayer) => {
            const playerDiv = document.createElement('div');
            playerDiv.textContent = `${player.name} ${player.ready ? '(Ready)' : ''}`;
            playerContainer.appendChild(playerDiv);
        });

        const gameStatus = document.getElementById('gameStatus') as HTMLElement;
        gameStatus.textContent = lobbyState.gameStarted ? 'Game has started!' : 'Waiting for players to ready up...';
    }

    function getRoomCodeFromURL(): string {
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


document.getElementById('joinRoomBtn')?.addEventListener('click', () => {
    const roomInput = document.getElementById('roomCodeInput') as HTMLInputElement;
    const roomCode = roomInput.value;
    const errorMessageDiv = document.getElementById('errorMessage');

    if (roomCode) {
        // Make an API call to check if the room exists
        fetch(`/join/${roomCode}`)
        .then(response => {
            if (response.ok) {
                // If the room exists, redirect to the game room
                window.location.href = `${window.location.origin}/join/${roomCode}`;
            } else {
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
    } else {
        displayErrorMessage('Please enter a room code');
    }
});

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


