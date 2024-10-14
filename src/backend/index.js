"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const Lobby_1 = require("../shared/Lobby");
const express_session_1 = __importDefault(require("express-session"));
// import { sessionMiddleware } from './session/session.middleware'
const sessionMiddleware = (0, express_session_1.default)({
    secret: 'tmp-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
});
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
app.use(express_1.default.static('src/frontend'));
app.use(express_1.default.static('dist'));
app.use(express_1.default.json());
io.engine.use(sessionMiddleware);
app.post('/create-room', (req, res) => {
    const roomCode = generateRoomCode();
    const lobby = new Lobby_1.Lobby(roomCode, io);
    console.log('created lobby with roomCode ' + roomCode);
    res.status(200).json({ message: 'Lobby created', code: roomCode });
});
function generateRoomCode() {
    return Math.random().toString(36).slice(2, 7).toUpperCase();
}
app.get('/join/:roomCode', (req, res) => {
    const gamePath = path_1.default.join(__dirname, '../frontend/views/joinRoom.html');
    res.sendFile(gamePath);
});
app.get('/game/:roomCode', (req, res) => {
    const gamePath = path_1.default.join(__dirname, '../frontend/views/game.html');
    res.sendFile(gamePath);
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map