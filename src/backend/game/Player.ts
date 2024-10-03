import { Card } from './Card';  
import { Hand } from './Hand';

export class Player {
    id: string;
    score: number;
    team: string;
    currentPoints: number;
    hand: Hand;
    isPlaying: boolean;
    isDeclarer: boolean;
    name: string;

    constructor(id: string) {
        this.id = id;
        this.score = 2; //All players start at rank 2. 
        this.team = "Offense"; //All players are on offense, declarer is first on defense
        this.currentPoints = 0;
        this.hand = new Hand();
        this.isPlaying = false;
        this.isDeclarer = false;
        this.name = "Player";
    }
    setId (id: string) {
        this.id = id;
    }
    getId() {
        return this.id;
    }
    setName (name: string) {
        this.name = name;
    }
    getName() {
        return this.name;
    }
    updateScore(numRanks: number) {
        this.score += numRanks;
    }

    updatePoints(points: number) {
        this.currentPoints += points;
    }

    declare() {
        this.team = "Defense";
        this.isDeclarer = true;
    }

    setHand(hand: Hand) {
        this.hand = hand;
    }

    dealCard(card: Card) {
        this.hand.addCardSorted(card);
    }
}