import { Card } from "./Card";
import { globalCardStrengthMap } from "./Game";

export class Play {
    private cards: Card[] = [];
    
    constructor(cards: Card[]) {
        //a basic play is either some multiple of a single card 
        //i.e. single, double, triple
        //or a tractor (two or more consecutive ranks of duplicity two or greater)
        //i.e. JJQQ, JJQQKK,JJJQQQ, JJJQQQKKK
        //some special logic exists for cards surrounding the declared trump card
        //e.g. if 3 of hearts is trump, 2H2H4H4H is a tractor
        //the global card strength map accounts for this logic
        this.cards = cards;
    }

    isValid(): boolean {
        //parse the cards into a map
        let playedCardsFreqMap: Map<string, number> = new Map();
        for (let card of this.cards) {
            let keyName = card.rank + "_" + card.suit;
            if (!playedCardsFreqMap.has(keyName)) {
                playedCardsFreqMap.set(keyName, 0);
            }
            playedCardsFreqMap.set(keyName, playedCardsFreqMap.get(keyName)!+1)
        }
        //check to see if all frequencies are the same (if they're not, return false)
        let firstFrequency = null;
        let numKeys = 0;
        for (let frequency of playedCardsFreqMap.values()) {
            numKeys += 1;
            if (firstFrequency === null) {
                firstFrequency = frequency;
            } else if (frequency !== firstFrequency) {
                return false;
            }
        }
        if (numKeys > 1) {
            //if there's multiple single cards played then we disqualify the play as well
            if (firstFrequency === 1) {
                return false;
            }
            //if there's multiple cards of duplicity one or greater then we have to confirm it's a valid tractor
            return this.isTractor(globalCardStrengthMap, playedCardsFreqMap);
        }
        return true;
    }

    isTractor(cardStrengthMap: Map<string, number>, playedCardsFreqMap: Map<string, number>): boolean {
        let strengths: number[] = [];
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
                return false; 
            }
        }
    
        return true; 
    }
}