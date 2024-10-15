import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');
const roomCode = window.location.pathname.split('/').pop();

socket.on('connect', () => {
  console.log('Connected to the server');
  if (roomCode) {
    socket.emit('joinRoom', roomCode);
  }
});

interface Player {
  id: string;
  name: string;
}

interface Card {
  rank: string;
  suit: string;
  img_url: string;
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

// Listen for updates from the server about the players
socket.on('updatePlayers', (players: Player[]) => {
  console.log("Updating players:", players);
  updatePlayerList(players);
});

socket.on('socket-test', () => {
  console.log('received socket-test event from server');
});

// Fetch the first ten cards from the backend
fetch('/getFirstTenCards')
  .then(response => response.json())
  .then((hand: { cards: Card[] }) => {
    const cards = hand.cards; // Access the cards array
    const container = document.getElementById('cardsContainer') as HTMLElement;
    container.className = 'card-container';
    cards.forEach(card => {
      const img = document.createElement('img');
      img.src = '/assets/cards/' + card.img_url;
      img.alt = `${card.rank} of ${card.suit}`;
      img.width = 100; // optional, set width for the card
      img.className = 'card';

      // Modify the click event listener
      img.addEventListener('click', () => {
        if (img.classList.contains('selected')) {
          // Card is already selected, so deselect it
          img.classList.remove('selected');
          console.log("adding no-hover");
          img.classList.add('no-hover');
          setTimeout(() => img.classList.remove('no-hover'), 1000); // 1000 ms delay
        } else {
          // Card is not selected, so select it
          img.classList.add('selected');
        }

        // Emit an event to the server with the card details
        socket.emit('cardClicked', { rank: card.rank, suit: card.suit });
        console.log(`Clicked: ${card.rank} of ${card.suit}`);
      });

      container.appendChild(img);
    });

    const cardWidth = (container.querySelector('.card') as HTMLImageElement).width;
    const gridColumnWidth = cardWidth * 0.25;
    container.style.gridTemplateColumns = `repeat(${cards.length}, ${gridColumnWidth}px)`;
  });
