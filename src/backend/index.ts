import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { Card } from './game/Card';
import { Deck } from './game/Deck';
import { setTrumpCard } from './game/Game';
import { Hand } from './game/Hand';
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('src/frontend')); 

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.get('/game', (req, res) => {
  // Define the absolute path to your game.html
  const gamePath = path.join(__dirname, '../frontend/views/game.html');
  // Send the game.html file to the client
  res.sendFile(gamePath);
});

app.get('/getFirstTenCards', (req, res) => {
  setTrumpCard(new Card("hearts","3"));
  let twoDecks = new Deck(2);
  let firstThirtyHand = twoDecks.getFirstNAsHand(30);
  firstThirtyHand.sort()
  res.json(firstThirtyHand);
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  // ... more socket event handlers ...
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
