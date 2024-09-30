"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trick = void 0;
class Trick {
    constructor(plays) {
        //a trick consists of plays, one per player 
        //let's handle non throws first
        //the first play is the lead. the following plays are the follows
        this.plays = [];
        this.plays = plays;
    }
    numPoints() {
        let points = 0;
        for (let play of this.plays) {
            for (let card of play.getCards()) {
                if (card.rank === "5") {
                    points += 5;
                }
                else if (card.rank === "10" || card.rank === "K") {
                    points += 10;
                }
            }
        }
        return points;
    }
    getWinner() {
        let leadPlay = this.plays[0].parsePlay();
        for (let play of this.plays) {
            console.log(play.parsePlay());
            console.log(play);
        }
        return 0;
    }
}
exports.Trick = Trick;
//# sourceMappingURL=Trick.js.map