import { Server, Socket } from 'socket.io';
import { LobbyPlayer, Lobby } from '../../shared/Lobby';

class LobbyManager {
    private io: Server;
    private lobbies: { [roomCode: string]: Lobby } = {};

    constructor(io: Server) {
        this.io = io;
        this.initializeNamespace();
    }

    private initializeNamespace() {
        const lobbyNamespace = this.io.of('/lobby');
        
        lobbyNamespace.on('connection', (socket: Socket) => {
            console.log(`User connected: ${socket.id}`);

            socket.on('joinRoom', ({ roomCode, playerName }) => {
                this.joinRoom(socket, roomCode, playerName);
            });

            socket.on('saveSettings', ({ roomCode, numPlayersSet, numDecksSet }) => {
                this.saveSettings(roomCode, numPlayersSet, numDecksSet);
            });

            socket.on('readyUp', ({ roomCode }) => {
                this.toggleReady(roomCode, socket.id);
            });

            socket.on('startGame', ({ roomCode }) => {
                this.startGame(roomCode);
            });

            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });

            socket.on('cardClicked', (card) => {
                console.log(`Card clicked: ${card.rank} of ${card.suit}`);
            });
        });
    }

    private joinRoom(socket: Socket, roomCode: string, playerName: string) {
        if (!this.lobbies[roomCode]) {
            this.lobbies[roomCode] = new Lobby(roomCode);
        }

        const lobby = this.lobbies[roomCode];
        const isHost = lobby.getPlayers().length === 0;
        const newPlayer: LobbyPlayer = { id: socket.id, name: playerName, ready: false, host: isHost };

        lobby.addPlayer(newPlayer);
        socket.join(roomCode);

        socket.emit('joinSuccess', { roomCode, playerName });
        this.updateLobbyState(roomCode);
    }

    private saveSettings(roomCode: string, numPlayersSet: number, numDecksSet: number) {
        const lobby = this.lobbies[roomCode];
        if (lobby) {
            lobby.setNumMaxPlayers(numPlayersSet);
            lobby.setNumDecks(numDecksSet);
            this.updateLobbyState(roomCode);
        }
    }

    private toggleReady(roomCode: string, playerId: string) {
        const lobby = this.lobbies[roomCode];
        if (lobby) {
            lobby.toggleReady(playerId);
            this.updateLobbyState(roomCode);
        }
    }

    private startGame(roomCode: string) {
        const lobby = this.lobbies[roomCode];
        if (lobby && lobby.areAllPlayersReady()) {
            lobby.startGameIfReady();
            this.updateLobbyState(roomCode);
        }
    }

    private handleDisconnect(socket: Socket) {
        for (const roomCode in this.lobbies) {
            const lobby = this.lobbies[roomCode];
            let assignNewHost = false;

            if (lobby.isHost(socket.id)) {
                assignNewHost = true;
            }

            lobby.removePlayer(socket.id);

            if (assignNewHost && lobby.getPlayers().length > 0) {
                const newHost = lobby.getPlayers()[0];
                lobby.assignHost(newHost.id);
                this.io.of('/lobby').to(roomCode).emit('assignHost', newHost.name);
            }

            if (lobby.getPlayers().length === 0) {
                delete this.lobbies[roomCode]; // Clean up empty lobbies
            } else {
                this.updateLobbyState(roomCode);
            }
        }
    }

    private updateLobbyState(roomCode: string) {
        const lobby = this.lobbies[roomCode];
        if (lobby) {
            this.io.of('/lobby').to(roomCode).emit('update', lobby.getLobbyState());
        }
    }
}

export default LobbyManager;