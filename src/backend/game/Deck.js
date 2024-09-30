"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deck = void 0;
const Card_1 = require("./Card");
const Hand_1 = require("./Hand");
class Deck {
    constructor(numberOfDecks = 1) {
        this.cards = [];
        for (let i = 0; i < numberOfDecks; i++) {
            this.initializeDeck();
        }
        this.shuffle();
    }
    initializeDeck() {
        const suits = ['clubs', 'diamonds', 'spades', 'hearts'];
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        for (const suit of suits) {
            for (const rank of ranks) {
                this.cards.push(new Card_1.Card(suit, rank));
            }
        }
        this.cards.push(new Card_1.Card('black', 'Joker'));
        this.cards.push(new Card_1.Card('red', 'Joker'));
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
    drawCard() {
        return this.cards.shift(); // Removes and returns the first element of the array
    }
    getFirstNCards(n) {
        return this.cards.slice(0, n);
    }
    getFirstNAsHand(n) {
        const hand = new Hand_1.Hand();
        for (let i = 0; i < n; i++) {
            if (i < this.cards.length) {
                hand.addCard(this.cards[i]);
            }
        }
        return hand;
    }
    getLength() {
        return this.cards.length;
    }
    isEmpty() {
        return this.cards.length == 0;
    }
}
exports.Deck = Deck;
//# sourceMappingURL=Deck.js.map