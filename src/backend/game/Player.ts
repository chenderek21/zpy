import { Card } from './Card';  // Assuming you have a Card class defined
import { Hand } from './Hand';

export class Player {
    score: number;
    team: string;
    currentPoints: number;
    hand: Hand;
    isPlaying: boolean;
    isDeclarer: boolean;

    constructor(team: string) {
        this.score = 2; //All players start at rank 2. 
        this.team = "Offense"; //All players are on offense, declarer is first on defense
        this.currentPoints = 0;
        this.hand = new Hand();
        this.isPlaying = false;
        this.isDeclarer = false;
    }

    updateScore(numRanks: number) {
        this.score += numRanks;
    }

    // Method to calculate points, update score, etc.
    updatePoints(points: number) {
        this.currentPoints += points;
    }

    declare() {
        this.team = "Defense";
        this.isDeclarer = true;
    }

    // ... other methods as per your game's logic
    setHand(hand: Hand) {
        this.hand = hand;
    }

    dealCard(card: Card) {
        this.hand.addCardSorted(card);
    }
}