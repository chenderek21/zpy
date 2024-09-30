import { Card } from "./Card";
import { Play } from "./Play";
import { globalCardStrengthMap } from "./Game";
import { trumpCardGlobal } from "./Game";

export class Trick {
    private plays: Play[] = [];

    constructor(plays: Play[]) {
        //a trick consists of plays, one per player 
        //let's handle non throws first
        //the first play is the lead. the following plays are the follows

        this.plays = plays;
    }

    numPoints(): number {
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

    getWinner(): number {
        let leadPlay = this.plays[0].parsePlay();
        for (let play of this.plays) {
            console.log(play.parsePlay());
            console.log(play);
        }
        return 0;
    }
}