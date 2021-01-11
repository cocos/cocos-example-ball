/**
 * Copyright (c) 2019 Xiamen Yaji Software Co.Ltd. All rights reserved.
 * Created by daisy on 2019/06/25.
 */
import { _decorator, Component, Node, Vec3 } from "cc";
import { Constants } from "../data/constants";
const { ccclass, property } = _decorator;

const _tempPos = new Vec3();

@ccclass("CameraCtrl")
export class CameraCtrl extends Component {
    @property(Node)
    planeNode: Node = null!;

    preType = Constants.BOARD_TYPE.NORMAL;
    _originPos = new Vec3();

    start () {
        this._originPos.set(Constants.CAMERA_INIT_POS);
        this.setPosition(this._originPos);
        this.node.eulerAngles = Constants.CAMERA_INIT_ROT;
    }

    setOriginPosX(val: number){
        this._originPos.x = val;
    }

    setOriginPosY(val: number) {
        this._originPos.y = val;
    }

    update() {
        _tempPos.set(this.node.position);
        if(_tempPos.x === this._originPos.x && _tempPos.y === this._originPos.y){
            return;
        }

        // 横向位置误差纠正
        if (Math.abs(_tempPos.x - this._originPos.x) <= Constants.CAMERA_MOVE_MINI_ERR) {
            _tempPos.x = this._originPos.x;
            this.setPosition(_tempPos);
        } else {
            const x = this._originPos.x - _tempPos.x;
            _tempPos.x += x / Constants.CAMERA_MOVE_X_FRAMES;
            this.setPosition(_tempPos);
        }

        _tempPos.set(this.node.position);
         // 纵向位置误差纠正
        if (Math.abs(_tempPos.y - this._originPos.y) <= Constants.CAMERA_MOVE_MINI_ERR) {
            _tempPos.y = this._originPos.y;
            this.setPosition(_tempPos);
        } else {
            const y = this._originPos.y - _tempPos.y;
            if (this.preType === Constants.BOARD_TYPE.SPRING) {
                _tempPos.y += y / Constants.CAMERA_MOVE_Y_FRAMES_SPRING;

                this.setPosition(_tempPos);
            } else {
                _tempPos.y += y / Constants.CAMERA_MOVE_Y_FRAMES;
                this.setPosition(_tempPos);
            }
        }
    }

    // 相机的默认位置
    reset() {
        this._originPos.set(Constants.CAMERA_INIT_POS);
        this.setPosition(this._originPos);
    }

    // 相机更新的同时更新背景板
    setPosition(position: Vec3) {
        this.node.setPosition(position);
        const y = position.y - 27;
        this.planeNode.setPosition(position.x, y, -100);
    }
}
