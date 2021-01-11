/**
 * Copyright (c) 2019 Xiamen Yaji Software Co.Ltd. All rights reserved.
 * Created by daisy on 2019/06/25.
 */
import { _decorator, Component, Node } from "cc";
import { Constants } from "../data/constants";
const { ccclass, property } = _decorator;

@ccclass("UIManager")
export class UIManager extends Component {
    @property(Node)
    pageStart: Node = null!;
    @property(Node)
    pageResult: Node = null!;

    onLoad(){
        Constants.game.uiManager = this;
    }

    start () {
        this.pageResult.active = false;
    }

    showDialog(isMain: boolean, ...args: any[]){
        this.pageResult.active = !isMain;
        this.pageStart.active = isMain;
    }

}
