import express from 'express';
import session from "express-session"
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { Card } from './game/Card';
import { Deck } from './game/Deck';
import { globalCardStrengthMap, setTrumpCard } from './game/Game';
import { Hand } from './game/Hand';
import { Player } from './game/Player';
import { Play } from './game/Play';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('src/frontend')); 
app.use(express.static('dist')); 
app.use(express.json());

app.post('/create-room', (req, res) => {
  const roomCode = generateRoomCode(); 
  res.status(200).json({ message: 'Lobby created', code: roomCode });
});

function generateRoomCode(): string {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}

app.get('/join/:roomCode', (req, res) => {
  const session = req.session;

  const roomCode = req.params.roomCode;
  const gamePath = path.join(__dirname, '../frontend/views/joinRoom.html');    
  res.sendFile(gamePath);
});

app.get('/game/:roomCode', (req, res) => {
  const gamePath = path.join(__dirname, '../frontend/views/game.html');
  res.sendFile(gamePath);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// app.get('/testValidatePlay', (req, res) => {
//   setTrumpCard(new Card("hearts","3"));
//   let cards = [new Card('spades', '2'), new Card('spades', '2'), new Card('spades', '2'),new Card('spades', '4'), new Card('spades', '4'), new Card('spades', '4')];
//   let play = new Play(cards);
//   console.log(play.parsePlay());
  
//   res.send("Game simulation completed");
// })

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

// function delay(ms: number) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }