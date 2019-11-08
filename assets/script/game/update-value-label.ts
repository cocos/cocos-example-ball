import { _decorator, Component, Node, LabelComponent } from "cc";
const { ccclass, property } = _decorator;

@ccclass("UpdateValueLabel")
export class UpdateValueLabel extends LabelComponent {
    isPlaying = false;
    startVal = 0;
    endVal = 0;
    diffVal = 0;
    currTime = 0;
    changingTime = 0;

    start() {
        // Your initialization goes here.
    }

    playUpdateValue(startVal: number, endVal: number, changingTime: number) {
        this.startVal = startVal;
        this.endVal = endVal;

        this.diffVal = this.endVal - this.startVal;

        this.currTime = 0;
        this.changingTime = changingTime;

        this.string = startVal.toString();

        this.isPlaying = true;
    }

    update(dt) {
        if (!this.isPlaying) {
            return;
        }

        if (this.currTime < this.changingTime) {
            this.currTime += dt;

            var currVal = this.startVal + parseInt((this.currTime / this.changingTime * this.diffVal).toString());
            if (currVal < this.startVal) {
                currVal = this.startVal;
            } else if (currVal > this.endVal) {
                currVal = this.endVal;
            }

            this.string = `${currVal}`;
            return;
        }

        this.string = `${this.endVal}`;
        this.isPlaying = false;

    }
}
