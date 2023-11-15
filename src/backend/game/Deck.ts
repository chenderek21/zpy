import { Card, Suit, Rank } from "./Card";
import { Hand } from "./Hand";
export class Deck {
    private cards: Card[] = [];

    constructor(numberOfDecks: number = 1) {
        for (let i = 0; i < numberOfDecks; i++) {
            this.initializeDeck();
        }
        this.shuffle();
    }

    private initializeDeck() {
        const suits: Suit[] = ['clubs', 'diamonds', 'spades', 'hearts'];
        const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

        for (const suit of suits) {
            for (const rank of ranks) {
                this.cards.push(new Card(suit, rank));
            }
        }
        this.cards.push(new Card('black', 'Joker'));
        this.cards.push(new Card('red', 'Joker'));

    }

    shuffle() {
        // Fisher-Yates shuffle algorithm
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    deal() {
        // Deal cards to players
    }

    drawCard(): Card | undefined {
        return this.cards.shift(); // Removes and returns the first element of the array
    }

    getFirstNCards(n: number): Card[] {
        return this.cards.slice(0, n);
    }


    getFirstNAsHand(n: number): Hand {
        const hand = new Hand();
        for (let i = 0; i < n; i++) {
            if (i < this.cards.length) {
                hand.addCard(this.cards[i]);
            }
        }
        return hand;
    }

    getLength(): number {
        return this.cards.length;
    }

    isEmpty(): boolean {
        return this.cards.length == 0;
    }
}