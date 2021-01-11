import { _decorator, Component, SpriteComponent, Node, WidgetComponent, Label } from "cc";
import { Constants } from "../data/constants";
import { PageResult } from "./page-result";
const { ccclass, property } = _decorator;

@ccclass("Revive")
export class Revive extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */

    closeCb: Function = null;

    @property(WidgetComponent)
    wgMenu: WidgetComponent = null;

    @property(Label)
    historyLabel: Label = null;

    @property({ type: Label })
    scoreLabel: Label = null;

    @property({ type: Label })
    progressLabel: Label = null;

    @property(SpriteComponent)
    spCountDown: SpriteComponent = null;  //倒计时

    pageResult: PageResult = null;
    countDownTime: number;
    currentTime: number;
    isCountDowning: boolean;

    onEnable() {
        this.show();
    }

    show() {
        const score = Constants.game.score;
        this.scoreLabel.string = score.toString();
        if (Constants.MAX_SCORE < score){
            Constants.MAX_SCORE = score;
        }

        this.historyLabel.string = Constants.MAX_SCORE.toString();

        // this.closeCb = closeCallback;
        this.countDownTime = 5;
        this.progressLabel.string = this.countDownTime + '';
        this.currentTime = 0;
        this.spCountDown.fillRange = 1;
        this.isCountDowning = true;
    }

    onBtnReviveClick() {
        this.isCountDowning = false;
        Constants.game.audioManager.playClip();

        Constants.game.node.emit(Constants.GAME_EVENT.REVIVE);
        this.pageResult.showResult(false);
        // uiManager.instance.hideDialog('fight/revive');
    }

    onBtnSkipClick() {
        Constants.game.audioManager.playClip();
        this.isCountDowning = false;
        // uiManager.instance.hideDialog('fight/revive');

        // this.closeCb && this.closeCb();
        Constants.game.gameOver();
    }

    update(dt: number) {
        if (!this.isCountDowning) {
            return;
        }

        this.currentTime += dt;

        let spare = this.countDownTime - this.currentTime;
        this.progressLabel.string = Math.ceil(spare) + '';
        if (spare <= 0) {
            spare = 0;

            //触发倒计时结束
            this.isCountDowning = false;
            this.onBtnSkipClick();
        }

        let percent = spare / this.countDownTime; // 展示百分比
        this.spCountDown.fillRange = percent;


    }

}
