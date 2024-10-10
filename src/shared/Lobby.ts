import { Server, Socket } from 'socket.io';

export interface LobbyPlayer {
    id: string;
    name: string;
    ready: boolean;
    host: boolean;
}

export class Lobby {

    private code: string;
    private server: Server;
    private players: LobbyPlayer[] = [];
    private gameStarted: boolean = false;
    private numDecks: number = 0;
    private numMaxPlayers: number = 0;

    constructor(roomCode: string, io: Server) {
        this.code = roomCode;
        this.server = io; 
        this.initializeNamespace(io); 
    }

    static deserializeLobbyState(lobbyState: Partial<Lobby>): Lobby {
        const lobby = new Lobby(lobbyState.code);  // Just deserialize the state
        Object.assign(lobby, lobbyState);  // Assign the serialized state to the new object
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


    // This method initializes the namespace and sets up socket listeners for this room
    private initializeNamespace(io: Server) {
        const namespace = io.of(`/lobby/${this.code}`);

        namespace.on('connection', (socket: Socket) => {
            console.log(`User connected to ${this.code}, socket ID: ${socket.id}`);

            socket.on('joinRoom', ({ playerName }) => {
                const isHost = this.players.length === 0; // First player is the host
                const newPlayer: LobbyPlayer = { id: socket.id, name: playerName, ready: false, host: isHost };
                this.addPlayer(newPlayer);
                this.updateLobbyState();
            });

            socket.on('readyUp', () => {
                this.toggleReady(socket.id);
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

            socket.on('disconnect', () => {
                const wasHost = this.isHost(socket.id);
                this.removePlayer(socket.id);
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

    private updateLobbyState() {
        const namespace = this.server.of(`/lobby/${this.code}`);
        console.log(`Updating lobby state for ${this.code}`);
        namespace.emit('update', this.getLobbyState());
    }
    
}