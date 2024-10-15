import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { Lobby } from '../shared/Lobby';
import session from 'express-session'
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from '../../webpack.config';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const compiler = webpack(config);
app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
}));
app.use(webpackHotMiddleware(compiler));
app.use(express.static('src/frontend'));
app.use(express.static('dist'));
app.use(express.json());

const sessionMiddleware = session({
  secret: 'tmp-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
});

io.engine.use(sessionMiddleware);

app.post('/create-room', (req, res) => {
  const roomCode = generateRoomCode();
  const lobby = new Lobby(roomCode, io);
  console.log('created lobby with roomCode ' + roomCode);
  res.status(200).json({ message: 'Lobby created', code: roomCode });
});

function generateRoomCode(): string {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}

app.get('/join/:roomCode', (req, res) => {
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
