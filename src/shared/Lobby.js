"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lobby = void 0;
class Lobby {
    //server is optional parameter, used to initialize namespace 
    constructor(roomCode, io) {
        this.players = [];
        this.gameStarted = false;
        this.numDecks = 0;
        this.numMaxPlayers = 0;
        this.code = roomCode;
        this.io = io;
        if (io) {
            this.initializeNamespace(io);
        }
    }
    static deserializeLobbyState(lobbyState) {
        const lobby = new Lobby(lobbyState.code);
        Object.assign(lobby, lobbyState);
        return lobby;
    }
    getRoomCode() {
        return this.code;
    }
    setNumDecks(numDecks) {
        this.numDecks = numDecks;
    }
    getNumDecks() {
        return this.numDecks;
    }
    setNumMaxPlayers(numMaxPlayers) {
        this.numMaxPlayers = numMaxPlayers;
    }
    getNumMaxPlayers() {
        return this.numMaxPlayers;
    }
    addPlayer(player) {
        this.players.push(player);
    }
    removePlayer(playerId) {
        this.players = this.players.filter(player => player.id !== playerId);
    }
    getPlayer(playerId) {
        return this.players.find(player => player.id === playerId);
    }
    getPlayers() {
        return this.players;
    }
    getNumPlayers() {
        return this.players.length;
    }
    toggleReady(playerId) {
        const player = this.getPlayer(playerId);
        if (player) {
            player.ready = !player.ready;
        }
    }
    isHost(playerId) {
        const player = this.players.find(player => player.id === playerId);
        if (player) {
            return player.host;
        }
    }
    assignHost(playerId) {
        const player = this.players.find(player => player.id === playerId);
        if (player) {
            player.host = true;
        }
    }
    areAllPlayersReady() {
        return this.players.every(player => player.ready);
    }
    isGameStarted() {
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
    // This method initializes the namespace and sets up socket listeners for this lobby
    initializeNamespace(io) {
        const namespace = io.of(`/lobby/${this.code}`);
        console.log('initializeNamespace');
        namespace.on('connection', (socket) => {
            console.log(`User connected to ${this.code}, socket ID: ${socket.id}`);
            socket.on('joinRoom', ({ playerName }) => {
                const isHost = this.players.length === 0;
                const newPlayer = { id: socket.id, name: playerName, ready: false, host: isHost };
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
    updateLobbyState() {
        if (this.io) {
            const namespace = this.io.of(`/lobby/${this.code}`);
            console.log(`Updating lobby state for ${this.code}`);
            namespace.emit('update', this.getLobbyState());
        }
    }
}
exports.Lobby = Lobby;
//# sourceMappingURL=Lobby.js.map