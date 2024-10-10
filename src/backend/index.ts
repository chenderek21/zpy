import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { Card } from './game/Card';
import { Deck } from './game/Deck';
import { globalCardStrengthMap, setTrumpCard } from './game/Game';
import { Hand } from './game/Hand';
import { Player } from './game/Player';
import { Play } from './game/Play';
import { Lobby } from '../shared/Lobby';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const lobbies: { [roomCode: string]: Lobby } = {};

app.use(express.static('src/frontend')); 
app.use(express.static('dist')); 
app.use(express.json());


// app.get('/getFirstTenCards', (req, res) => {
//   setTrumpCard(new Card("hearts","3"));
//   let twoDecks = new Deck(2);
//   let firstThirtyHand = twoDecks.getFirstNAsHand(30);
//   firstThirtyHand.sort()
//   res.json(firstThirtyHand);
// });

// app.get('/simulateGame', async (req, res) => {
//   let twoDecks = new Deck(2);
//   let player1 = new Player('asdf');
//   let player2 = new Player('hjkl');
//   let declared = false;
//   setTrumpCard(null);
//   console.log("game simulation starting.");
//   while (twoDecks.getLength() > 64) {
//     // Deal cards to player 1 and player 2
//     for (let [index, player] of [player1, player2].entries()) {
//       await delay(250); // Introduce delay
//       const card = twoDecks.drawCard();
//       if (card) {
//         player.dealCard(card);
//         console.log(`Player${index + 1} hand: ${player.hand.getCards().map(c => `${c.rank}${c.suit.charAt(0)}`).join(', ')}`);

//         // Declare the trump card if it's a card with a rank of 3 and not declared yet
//         if (card.rank === '3' && !declared) {
//           setTrumpCard(card);
//           for (let player of [player1, player2]) {
//             player.hand.sort();
//           }
//           declared = true;
//           console.log(`Declared ${card.rank} of ${card.suit} as trump!`);
//         }
//       }
//     };
//   }

//   res.send("Game simulation completed");
// });

app.post('/create-room', (req, res) => {
  const roomCode = req.body.roomCode; 
  createLobby(roomCode);
  res.status(200).json({ message: 'Lobby created', code: roomCode });
});

function createLobby(roomCode: string): Lobby {
  console.log('generated lobby with code: '+roomCode);
  const lobby = new Lobby(roomCode);
  lobbies[roomCode] = lobby;
  return lobby;
}

function getLobby(roomCode: string): Lobby | undefined {
  return lobbies[roomCode];
}

app.get('/join/:roomCode', (req, res) => {
  
  const roomCode = req.params.roomCode;
  const lobby = getLobby(roomCode);
  if (lobby) {
    // Define the absolute path to your game.html
    console.log("displaying join room to "+roomCode);
    
    const gamePath = path.join(__dirname, '../frontend/views/joinRoom.html');
    // Send the game.html file to the client
    
    res.sendFile(gamePath);
  } 
  else {
    res.status(404).json({
        status: 404,
        success: false,
        error: "Room not found"
    });
  }
});

app.get('/game/:roomCode', (req, res) => {
  const roomCode = req.params.roomCode;
  const room = getLobby(roomCode); 
  if (room) {
    console.log("joining via link to room "+roomCode);
    const gamePath = path.join(__dirname, '../frontend/views/game.html');
    res.sendFile(gamePath);
  } else {
    res.status(404).json({
        status: 404,
        success: false,
        error: "Room not found"
    });
  }
});


app.get('/testValidatePlay', (req, res) => {
  setTrumpCard(new Card("hearts","3"));
  let cards = [new Card('spades', '2'), new Card('spades', '2'), new Card('spades', '2'),new Card('spades', '4'), new Card('spades', '4'), new Card('spades', '4')];
  let play = new Play(cards);
  console.log(play.parsePlay());
  
  res.send("Game simulation completed");
})

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


io.on('connection', (socket) => {
  console.log('a user connected');
  console.log(socket.id);
  socket.on('joinRoom', ({ roomCode }) => {
    updateLobbyState(roomCode)
  })

  socket.on('joinLobby', ({ roomCode, playerName }) => {
    if (!lobbies[roomCode]) {
        lobbies[roomCode] = new Lobby(roomCode);
    }
    const lobby = lobbies[roomCode];
    socket.emit('joinSuccess', ({code: roomCode, playerName: playerName}))
    const isHost = lobbies[roomCode].getLobbyState().players.length == 0;
    const lobbyPlayer = { id: socket.id, name: playerName, ready: false, host: isHost };
    lobby.addPlayer(lobbyPlayer);

    updateLobbyState(roomCode);
  });

  socket.on('readyUp', ({ roomCode }) => {
    const lobby = lobbies[roomCode];
    if (lobby) {
      lobby.toggleReady(socket.id);
      updateLobbyState(roomCode);
    }
  });

  socket.on('saveSettings', ({ roomCode, numPlayersSet, numDecksSet }) => {
    const lobby = lobbies[roomCode];
    if (lobby) {
      lobby.setNumMaxPlayers(numPlayersSet);
      lobby.setNumDecks(numDecksSet);
      console.log('Saved settings of room '+roomCode+' as '+numPlayersSet+' players and '+numDecksSet+' decks.');
      updateLobbyState(roomCode);
    }
  });

  socket.on('startGame', ({roomCode}) => {
    const lobby = lobbies[roomCode];
    if (lobby) {
      lobby.startGameIfReady();
      console.log('started game for lobby '+roomCode); 
      updateLobbyState(roomCode);
    }
  })

  socket.on('disconnect', () => {
    for (const roomCode in lobbies) {
      const lobby = lobbies[roomCode];
      let assignNewHost = false;
      if (lobby.isHost(socket.id)) {
        assignNewHost = true;
      }
      lobby.removePlayer(socket.id);
      if (assignNewHost) {
        if (lobby.getNumPlayers() > 0) {
          const newHost = lobby.getPlayers()[0];
          lobby.assignHost(newHost.id);
          io.to(roomCode).emit('assignHost', newHost.name);
        }
      }
      updateLobbyState(roomCode);
    }
  });


  function updateLobbyState(roomCode: string) {
    socket.join(roomCode);
    const lobby = lobbies[roomCode];
    if (lobby) {
      console.log("LobbyState Update to "+roomCode+": "+JSON.stringify(lobby.getLobbyState()));
      io.to(roomCode).emit('update', lobby);
    }
  }
    // Handle the 'cardClicked' event
  socket.on('cardClicked', (card) => {
      console.log(`Card clicked: ${card.rank} of ${card.suit}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
