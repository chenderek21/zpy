export interface LobbyPlayer {
    id: string;
    name: string;
    ready: boolean;
    host: boolean;
}

export class Lobby {
    private players: LobbyPlayer[] = [];
    private gameStarted: boolean = false;
    private numDecks: number = 0;
    private numMaxPlayers: number = 0;

    constructor(private roomCode: string) {}

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

    areAllPlayersReady(): boolean {
        return this.players.every(player => player.ready);
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
}