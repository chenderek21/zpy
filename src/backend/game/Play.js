"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Play = void 0;
const Game_1 = require("./Game");
const Game_2 = require("./Game");
class Play {
    constructor(cards) {
        this.cards = [];
        this.duplicity = 0;
        this.strength = 0;
        this.suit = "";
        //a basic play is either some multiple of a single card 
        //i.e. single, double, triple
        //or a tractor (two or more consecutive ranks of duplicity two or greater)
        //i.e. JJQQ, JJQQKK, JJJQQQ, JJJQQQKKK
        //some special logic exists for cards surrounding the declared trump card
        //e.g. if 3 of hearts is trump, 2H2H4H4H is a tractor
        //the global card strength map accounts for this logic
        this.cards = cards;
    }
    getCards() {
        return this.cards;
    }
    parsePlay() {
        //parse the cards into a map
        let playedCardsFreqMap = new Map();
        for (let card of this.cards) {
            let keyName = card.suit + "_" + card.rank;
            if (!playedCardsFreqMap.has(keyName)) {
                playedCardsFreqMap.set(keyName, 0);
            }
            playedCardsFreqMap.set(keyName, playedCardsFreqMap.get(keyName) + 1);
        }
        //check to see if all frequencies are the same (if they're not, return false)
        let firstFrequency = 0;
        let numKeys = 0;
        for (let frequency of playedCardsFreqMap.values()) {
            numKeys += 1;
            if (firstFrequency === 0) {
                firstFrequency = frequency;
            }
            else if (frequency !== firstFrequency) {
                console.log('mismatched duplicities, should be a throw instead of a play.');
                return 'Invalid play: cards selected with varying duplicity, to play this combination please select "throw".';
            }
        }
        let cardDuplicityMap = new Map();
        cardDuplicityMap.set(1, 'Single');
        cardDuplicityMap.set(2, 'Pair');
        cardDuplicityMap.set(3, 'Triple');
        cardDuplicityMap.set(4, 'Quadruple');
        cardDuplicityMap.set(5, 'Quintuple');
        if (numKeys > 1) {
            //if there's multiple single cards played then we disqualify the play as well
            if (firstFrequency === 1) {
                console.log('different cards of duplicity 1, should be a throw instead of a play.');
                return 'Invalid play: different cards of duplicity 1, to play this combination please select "throw".';
            }
            //if there's multiple cards of duplicity one or greater then we have to confirm it's a valid tractor
            return this.parseTractor(Game_1.globalCardStrengthMap, playedCardsFreqMap, cardDuplicityMap);
        }
        //at this point all plays will consist a unique card (but of duplicity 1 or greater)
        console.log('valid non-tractor play');
        this.duplicity = firstFrequency;
        let strength = Game_1.globalCardStrengthMap.get(this.cards[0].suit + "_" + this.cards[0].rank);
        if (strength !== undefined) {
            this.strength = strength;
        }
        else {
            this.strength = 0;
        }
        if (this.cards[0].isTrump(Game_2.trumpCardGlobal)) {
            this.suit = "trump";
            return 'Trump ' + cardDuplicityMap.get(firstFrequency);
        }
        else {
            let unformattedSuit = this.cards[0].suit;
            this.suit = unformattedSuit;
            let formattedSuit = unformattedSuit.charAt(0).toUpperCase() + unformattedSuit.slice(1, -1);
            return formattedSuit + ' ' + cardDuplicityMap.get(firstFrequency);
        }
    }
    parseTractor(cardStrengthMap, playedCardsFreqMap, cardDuplicityMap) {
        let strengths = [];
        //Convert card frequency map keys to their strengths
        for (let card of playedCardsFreqMap.keys()) {
            let strength = cardStrengthMap.get(card);
            if (strength === undefined) {
                throw new Error(`Strength not found for card: ${card}`);
            }
            strengths.push(strength);
        }
        strengths.sort((a, b) => a - b);
        //Check for consecutive strengths
        for (let i = 0; i < strengths.length - 1; i++) {
            if (strengths[i + 1] - strengths[i] !== 1) {
                console.log('card rank strengths are not consecutive, invalid tractor');
                return 'Invalid play: card rank strengths are not consecutive (invalid tractor)';
            }
        }
        //Parse if it's a valid tractor
        let firstFrequency = 0;
        let tractorDuplicity;
        for (let frequency of playedCardsFreqMap.values()) {
            firstFrequency = frequency;
        }
        tractorDuplicity = cardDuplicityMap.get(firstFrequency);
        this.strength = strengths[0];
        this.duplicity = firstFrequency;
        if (this.cards[0].isTrump(Game_2.trumpCardGlobal)) {
            this.suit = "trump";
            if (tractorDuplicity === "Pair") {
                return 'Trump Tractor';
            }
            return 'Trump ' + tractorDuplicity + ' Tractor';
        }
        else {
            let unformattedSuit = this.cards[0].suit;
            this.suit = unformattedSuit;
            let formattedSuit = unformattedSuit.charAt(0).toUpperCase() + unformattedSuit.slice(1, -1);
            if (tractorDuplicity === "Pair") {
                return formattedSuit + ' Tractor';
            }
            return formattedSuit + ' ' + tractorDuplicity + ' Tractor';
        }
    }
}
exports.Play = Play;
//# sourceMappingURL=Play.js.map