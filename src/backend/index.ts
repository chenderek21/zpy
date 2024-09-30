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
import { Room } from './game/Room';
const app = express();
const server = http.createServer(app);
const io = new Server(server);
var rooms: { [code: string]: Room } = {};

app.use(express.static('src/frontend')); 
app.use(express.static('dist')); 
app.use(express.json());


app.get('/getFirstTenCards', (req, res) => {
  setTrumpCard(new Card("hearts","3"));
  let twoDecks = new Deck(2);
  let firstThirtyHand = twoDecks.getFirstNAsHand(30);
  firstThirtyHand.sort()
  res.json(firstThirtyHand);
});

app.get('/simulateGame', async (req, res) => {
  let twoDecks = new Deck(2);
  let player1 = new Player('asdf');
  let player2 = new Player('hjkl');
  let declared = false;
  setTrumpCard(null);
  console.log("game simulation starting.");
  while (twoDecks.getLength() > 64) {
    // Deal cards to player 1 and player 2
    for (let [index, player] of [player1, player2].entries()) {
      await delay(250); // Introduce delay
      const card = twoDecks.drawCard();
      if (card) {
        player.dealCard(card);
        console.log(`Player${index + 1} hand: ${player.hand.getCards().map(c => `${c.rank}${c.suit.charAt(0)}`).join(', ')}`);

        // Declare the trump card if it's a card with a rank of 3 and not declared yet
        if (card.rank === '3' && !declared) {
          setTrumpCard(card);
          for (let player of [player1, player2]) {
            player.hand.sort();
          }
          declared = true;
          console.log(`Declared ${card.rank} of ${card.suit} as trump!`);
        }
      }
    };
  }

  // Return some result or status
  res.send("Game simulation completed");
});

app.post('/create-room', (req, res) => {
  const roomCode = req.body.roomCode; // or generate the code server-side
  createRoom(roomCode);
  res.status(200).json({ message: 'Room created', code: roomCode });
});

function createRoom(roomCode: string): Room {
  console.log('generated room with code: '+roomCode);
  const room = new Room(roomCode);
  rooms[roomCode] = room;
  return room;
}

function getRoom(roomCode: string): Room | undefined {
  return rooms[roomCode];
}

app.get('/join/:roomCode', (req, res) => {
  
  const roomCode = req.params.roomCode;
  const room = getRoom(roomCode);
  if (room) {
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
  const room = getRoom(roomCode); 
  if (room) {
    // Define the absolute path to your game.html
    console.log("joining via link to room "+roomCode);
    const gamePath = path.join(__dirname, '../frontend/views/game.html');
    // Send the game.html file to the client
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
  socket.on('joinRoom', ({ roomCode, playerName }) => {
    const room = getRoom(roomCode);
    if (room) {
      socket.join(roomCode);

      const player = new Player(socket.id);
      player.setName(playerName);
      room.addPlayer(player);

      socket.emit('joinSuccess', { code: roomCode, playerName: playerName });
      console.log("emitting updatePlayers event from server to room "+roomCode);
      console.log(room.getPlayers());
      // Emit the updated player list to everyone in the room
      const players = room.getPlayers().map(player => ({ id: player.getId(), name: player.getName() }));
      console.log(players)
      socket.emit('updatePlayers', players);
      console.log(`Emitted updatePlayers to room ${roomCode}`, players);

    } else {
      socket.emit('joinError', 'Room not found');
    }

  });
  // Handle the 'cardClicked' event
  socket.on('cardClicked', (card) => {
      console.log(`Card clicked: ${card.rank} of ${card.suit}`);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  //   for (let code in rooms) {
  //     const room = rooms[code];
  //     if (room) {
  //         room.removePlayer(socket.id); // Change to use player's name or ID
  //         io.to(code).emit('updatePlayers', room.getPlayers().map(player => ({ id: socket.id, name: player.getName() })));
  //         console.log(`Updated players in room ${code}`, room.getPlayers());
  //     }
  // }
  });
  // ... more socket event handlers ...
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//test commit