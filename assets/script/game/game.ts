
/**
 * Copyright (c) 2019 Xiamen Yaji Software Co.Ltd. All rights reserved.
 * Created by daisy on 2019/06/25.
 */
import { _decorator, Component, Node, instantiate, Prefab } from "cc";
import { Constants } from "../data/constants";
import { Ball } from "./ball";
import { BoardManager } from "./board-manager";
import { CameraCtrl } from "./camera-ctrl";
import { UIManager } from "./ui-manager";
const { ccclass, property } = _decorator;

/**
 * @zh 游戏管理类，同时也是事件监听核心对象。
 */
@ccclass("Game")
export class Game extends Component {
    @property(Prefab)
    ballPref: Prefab = null;

    get ball(){
        return this._ball;
    }

    boardManager: BoardManager = null;
    cameraCtrl: CameraCtrl = null;
    uiManager: UIManager = null;

    state = Constants.GAME_STATE.READY;
    score = 0;
    hasRevive = false;
    _ball: Ball = null;
    __preload () {
        Constants.game = this;
    }

    onLoad(){
        if (!this.ballPref) {
            console.log('There is no ball!!');
            this.enabled = false;
            return;
        }

        const ball = instantiate(this.ballPref) as Node;
        // @ts-ignore
        ball.parent = this.node.parent;
        this._ball = ball.getComponent(Ball);
    }

    start(){
        this.node.on(Constants.GAME_EVENT.RESTART, this.gameStart, this);
        this.node.on(Constants.GAME_EVENT.REVIVE, this.gameRevive, this);
    }

    onDestroy() {
        this.node.off(Constants.GAME_EVENT.RESTART, this.gameStart, this);
        this.node.off(Constants.GAME_EVENT.REVIVE, this.gameRevive, this);
    }

    resetGame() {
        this.state = Constants.GAME_STATE.READY;
        this._ball.reset();
        this.cameraCtrl.reset();
        this.boardManager.reset();
        this.uiManager.showDialog(true);
    }

    gameStart(){
        this.uiManager.showDialog(false);
        this.state = Constants.GAME_STATE.PLAYING;
        this.hasRevive = false;
        this.score = 0;
    }

    gameDie(){
        // audioManager.instance.stop(constants.AUDIO_MUSIC.BACKGROUND);
        this.state = Constants.GAME_STATE.PAUSE;

        if (!this.hasRevive) {
            this.node.emit(Constants.GAME_EVENT.DYING, ()=>{
                this.gameOver();
            });
        } else {
            this.gameOver();
        }
    }

    gameOver() {
        this.state = Constants.GAME_STATE.OVER;
        // audioManager.instance.stop(constants.AUDIO_MUSIC.BACKGROUND);

        this.resetGame();
    }

    gameRevive(){
        this.hasRevive = true;
        this.state = Constants.GAME_STATE.READY;
        this.ball.revive();
        this.scheduleOnce(() => {
            // audioManager.instance.playMusic(constants.AUDIO_MUSIC.BACKGROUND, true);
            this.state = Constants.GAME_STATE.PLAYING;
        }, 1);
    }

    addScore(score: number){
        this.score += score;
        this.node.emit(Constants.GAME_EVENT.ADDSCORE, this.score);
    }
}
