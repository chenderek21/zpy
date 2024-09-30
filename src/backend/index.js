"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const Card_1 = require("./game/Card");
const Deck_1 = require("./game/Deck");
const Game_1 = require("./game/Game");
const Player_1 = require("./game/Player");
const Play_1 = require("./game/Play");
const Room_1 = require("./game/Room");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
var rooms = {};
app.use(express_1.default.static('src/frontend'));
app.use(express_1.default.static('dist'));
app.use(express_1.default.json());
app.get('/getFirstTenCards', (req, res) => {
    (0, Game_1.setTrumpCard)(new Card_1.Card("hearts", "3"));
    let twoDecks = new Deck_1.Deck(2);
    let firstThirtyHand = twoDecks.getFirstNAsHand(30);
    firstThirtyHand.sort();
    res.json(firstThirtyHand);
});
app.get('/simulateGame', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let twoDecks = new Deck_1.Deck(2);
    let player1 = new Player_1.Player('asdf');
    let player2 = new Player_1.Player('hjkl');
    let declared = false;
    (0, Game_1.setTrumpCard)(null);
    console.log("game simulation starting.");
    while (twoDecks.getLength() > 64) {
        // Deal cards to player 1 and player 2
        for (let [index, player] of [player1, player2].entries()) {
            yield delay(250); // Introduce delay
            const card = twoDecks.drawCard();
            if (card) {
                player.dealCard(card);
                console.log(`Player${index + 1} hand: ${player.hand.getCards().map(c => `${c.rank}${c.suit.charAt(0)}`).join(', ')}`);
                // Declare the trump card if it's a card with a rank of 3 and not declared yet
                if (card.rank === '3' && !declared) {
                    (0, Game_1.setTrumpCard)(card);
                    for (let player of [player1, player2]) {
                        player.hand.sort();
                    }
                    declared = true;
                    console.log(`Declared ${card.rank} of ${card.suit} as trump!`);
                }
            }
        }
        ;
    }
    // Return some result or status
    res.send("Game simulation completed");
}));
app.post('/create-room', (req, res) => {
    const roomCode = req.body.roomCode; // or generate the code server-side
    createRoom(roomCode);
    res.status(200).json({ message: 'Room created', code: roomCode });
});
function createRoom(roomCode) {
    console.log('generated room with code: ' + roomCode);
    const room = new Room_1.Room(roomCode);
    rooms[roomCode] = room;
    return room;
}
function getRoom(roomCode) {
    return rooms[roomCode];
}
app.get('/join/:roomCode', (req, res) => {
    const roomCode = req.params.roomCode;
    const room = getRoom(roomCode);
    if (room) {
        // Define the absolute path to your game.html
        console.log("displaying join room to " + roomCode);
        const gamePath = path_1.default.join(__dirname, '../frontend/views/joinRoom.html');
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
        console.log("joining via link to room " + roomCode);
        const gamePath = path_1.default.join(__dirname, '../frontend/views/game.html');
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
app.get('/testValidatePlay', (req, res) => {
    (0, Game_1.setTrumpCard)(new Card_1.Card("hearts", "3"));
    let cards = [new Card_1.Card('spades', '2'), new Card_1.Card('spades', '2'), new Card_1.Card('spades', '2'), new Card_1.Card('spades', '4'), new Card_1.Card('spades', '4'), new Card_1.Card('spades', '4')];
    let play = new Play_1.Play(cards);
    console.log(play.parsePlay());
    res.send("Game simulation completed");
});
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
io.on('connection', (socket) => {
    console.log('a user connected');
    console.log(socket.id);
    socket.on('joinRoom', ({ roomCode, playerName }) => {
        const room = getRoom(roomCode);
        if (room) {
            socket.join(roomCode);
            const player = new Player_1.Player(socket.id);
            player.setName(playerName);
            room.addPlayer(player);
            socket.emit('joinSuccess', { code: roomCode, playerName: playerName });
            console.log("emitting updatePlayers event from server to room " + roomCode);
            console.log(room.getPlayers());
            // Emit the updated player list to everyone in the room
            const players = room.getPlayers().map(player => ({ id: player.getId(), name: player.getName() }));
            console.log(players);
            socket.emit('updatePlayers', players);
            console.log(`Emitted updatePlayers to room ${roomCode}`, players);
        }
        else {
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
//# sourceMappingURL=index.js.map