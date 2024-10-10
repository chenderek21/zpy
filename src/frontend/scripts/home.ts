import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

/* from the home page, create a new room -> redirects to the lobby page */
document.getElementById('createRoomBtn')?.addEventListener('click', () => {
    console.log("create room button clicked");
    /* sends request to the server to create the room */
    fetch('/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ roomCode: roomCode })
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

/* from the home page, join an existing room -> redirects to lobby page */
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

/* shows error message on homescreen */
function displayErrorMessage(message: string) {
    const errorMessageDiv = document.getElementById('errorMessage');
    if (errorMessageDiv) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
    }
}
