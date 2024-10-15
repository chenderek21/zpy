import { IncomingMessage } from 'http';
import { Server, Socket } from 'socket.io';
import { SessionData } from 'express-session';

export interface LobbyPlayer {
    id: string;
    name: string;
    ready: boolean;
    host: boolean;
}

declare module "express-session" {
    interface SessionData {
      id: string;
      name: string;
    }
  }

declare module 'http' {
  interface IncomingMessage {
    session: SessionData;
  }
}


export class Lobby {

    private code: string;
    private io: Server | undefined;
    private players: LobbyPlayer[] = [];
    private sessionToSocket = new Map<string, Socket>();
    private gameStarted: boolean = false;
    private numDecks: number = 0;
    private numMaxPlayers: number = 0;

    //server is optional parameter, used to initialize namespace 
    constructor(roomCode: string, io ? : Server) {
        this.code = roomCode;
        this.io = io; 
        if (io) {
            this.initializeNamespace(io);
        }
    }

    static deserializeLobbyState(lobbyState: Lobby): Lobby {
        const lobby = new Lobby(lobbyState.code);  
        Object.assign(lobby, lobbyState);  
        return lobby;
    }

    getRoomCode(): string {
        return this.code;
    }

    setNumDecks(numDecks: number) {
        this.numDecks = numDecks;
    }

    getNumDecks() {
        return this.numDecks;
    }

    setNumMaxPlayers(numMaxPlayers: number) {
        this.numMaxPlayers = numMaxPlayers;
    }

    getNumMaxPlayers() {
        return this.numMaxPlayers;
    }

    addPlayer(player: LobbyPlayer) {
        this.players.push(player);
    }

    removePlayer(playerId: string) {
        this.players = this.players.filter(player => player.id !== playerId);
    }

    getPlayer(playerId: string): LobbyPlayer | undefined {
        return this.players.find(player => player.id === playerId);
    }
    
    getPlayers() {
        return this.players;
    }

    getNumPlayers() {
        return this.players.length;
    }

    toggleReady(playerId: string) {
        const player = this.getPlayer(playerId);
        if (player) {
            player.ready = !player.ready;
        }
    }

    isHost(playerId: string) {
        const player = this.players.find(player => player.id === playerId);
        if (player) {
            return player.host;
        }
    }

    assignHost(playerId: string) {
        const player = this.players.find(player => player.id === playerId);
        if (player) {
            player.host = true;
        }
    }

    areAllPlayersReady(): boolean {
        return this.players.every(player => player.ready);
    }

    isGameStarted(): boolean {
        return this.gameStarted;
    }

    startGameIfReady() {
        if (this.areAllPlayersReady()) {
            this.gameStarted = true;
        }
    }

    getLobbyState() {
        return {
            players: this.players,
            gameStarted: this.gameStarted,
            numMaxPlayers: this.numMaxPlayers,
            numDecks: this.numDecks
        };
    }

    initializeNamespace(io: Server) {
        const namespace = io.of(`/lobby/${this.code}`);
        console.log('initializeNamespace');

        namespace.on('connection', (socket) => {
            const session = socket.request.session;
            const sessionId = session.id;
            //handles duplicate sessions, removes existing socket
            const prevSocket = this.sessionToSocket.get(sessionId);
            if (prevSocket) {
                prevSocket.disconnect();
                console.log("socket disconnected");
            }
            this.sessionToSocket.set(sessionId, socket);
            console.log(`User connected to ${this.code}, socket ID: ${socket.id}, session ID: ${sessionId}`);
            this.updateLobbyState();
            socket.on('joinRoom', ({ playerName }) => {
                const isHost = this.players.length === 0;
                const newPlayer: LobbyPlayer = { id: sessionId, name: playerName, ready: false, host: isHost };
                this.addPlayer(newPlayer);
                this.updateLobbyState();
                socket.emit('joinSuccess', ({code: this.code, playerName: playerName}));
            });

            socket.on('readyUp', () => {
                this.toggleReady(sessionId);
                this.updateLobbyState();
            });

            socket.on('saveSettings', ({ numPlayersSet, numDecksSet }) => {
                this.setNumMaxPlayers(numPlayersSet);
                this.setNumDecks(numDecksSet);
                console.log(`Updated settings: ${numPlayersSet} players, ${numDecksSet} decks.`);
                this.updateLobbyState();
            });

            socket.on('startGame', () => {
                this.startGameIfReady();
                this.updateLobbyState();
            });

            socket.on('disconnect', (reason) => {
                if (reason==='server namespace disconnect') {
                    console.log('server namespace disconnect');
                    return
                }
                const wasHost = this.isHost(sessionId);
                this.removePlayer(sessionId);
                if (wasHost && this.getPlayers().length > 0) {
                    const newHost = this.getPlayers()[0];
                    this.assignHost(newHost.id);
                    namespace.emit('assignHost', newHost.name);
                }
                this.updateLobbyState();
            });

            socket.on('cardClicked', (card) => {
                console.log(`Card clicked: ${card.rank} of ${card.suit}`);
            });
        });
    }

    updateLobbyState() {
        if (this.io) {
            const namespace = this.io.of(`/lobby/${this.code}`);
            console.log(`Updating lobby state for ${this.code}`);
            namespace.emit('update', this.getLobbyState());
        }
    }
    
}