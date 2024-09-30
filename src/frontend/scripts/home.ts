import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

interface Player {
    id: string; 
    name: string; 
  }

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

//on the join room/lobby screen, allow the user to join the room (only adds to lobby list until game starts)
const joinForm = document.getElementById('joinForm');
if (joinForm) {
    joinForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const playerNameInput = document.getElementById('playerName') as HTMLInputElement;
        if (playerNameInput) {
            const playerName = playerNameInput.value;
            // Extract the room code from the URL
            const pathSegments = window.location.pathname.split('/');
            const roomCode = pathSegments[2];  
            socket.emit('joinRoom', { roomCode, playerName });
        } else {
            console.error('Player name input field is missing!');
        }
    });
} 

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
socket.on('updatePlayers', (players: Player[]) => {
    console.log("Updating players:", players);
    updatePlayerList(players);
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

function updatePlayerList(players: Player[]) {
    console.log("Updating player list");
    const playerContainer = document.getElementById('playerContainer') as HTMLElement;
    playerContainer.innerHTML = ''; // Clear existing player list
    players.forEach(player => {
      const playerElement = document.createElement('div');
      playerElement.textContent = player.name;
      playerContainer.appendChild(playerElement);
    });
  }


function generateRoomCode(): string {
    return Math.random().toString(36).slice(2, 7).toUpperCase();
}


