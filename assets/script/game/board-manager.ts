/**
 * Copyright (c) 2019 Xiamen Yaji Software Co.Ltd. All rights reserved.
 * Created by daisy on 2019/06/25.
 */
import { _decorator, Component, Node, Prefab, instantiate, Vec3 } from "cc";
import { Board } from "./board";
import { Constants } from "../data/constants";
import { utils } from "../utils/utils";
const { ccclass, property } = _decorator;

const _tempPos = new Vec3();
const _diamondPos = new Vec3();

@ccclass("BoardManager")
export class BoardManager extends Component {
    @property(Prefab)
    boardPrefab: Prefab = null!;
    @property(Prefab)
    diamondPrefab: Prefab = null!;

    diamondSprintList: Node[] = []; // 钻石列表
    diamondCenterX = 0; // 钻石摆放中心位置
    _boardList: Board[] = []; // 跳板列表
    _boardInsIdx = 0; // 当前实例编号

    start () {
        this.initBoard();
        this.initDiamond();
    }

    // 每次开始游戏板重置
    reset(){
        this._boardInsIdx = 0;
        Constants.game.initFirstBoard = false;
        let pos = Constants.BOARD_INIT_POS.clone();
        let board: Board;
        const type = Constants.BOARD_TYPE.NORMAL;
        for (let i = 0; i < Constants.BOARD_NUM; i++) {
            board = this._boardList[i];
            board.reset(type, pos, 1);
            pos = this.getNextPos(board, 1);
        }

        board = this._boardList[0];
        board.isActive = true;
        Constants.game.ball.currBoard = board;

        if (this.diamondSprintList[0]) {
            for (var i = 0; i < Constants.DIAMOND_NUM; i++) {
                this.diamondSprintList[i].active = false;
            }
        }
    }

    // 板初始化
    initBoard() {
        for (let i = 0; i < Constants.BOARD_NUM; i++) {
            const node = instantiate(this.boardPrefab) as Node;
            node.name = this._boardInsIdx.toString();
            this._boardInsIdx++;
            this.node.addChild(node);
            const board = node.getComponent('Board') as Board;
            this._boardList.push(board);
        }
        this.reset();
    }

    // 游戏过程中新增板
    newBoard(newType: number, diffLevel: number) {
        const oldBoard = this._boardList[Constants.BOARD_NUM - 1];
        const pos = this.getNextPos(oldBoard, diffLevel, _tempPos);
        const board = this._boardList.shift()!;
        if (newType === Constants.BOARD_TYPE.SPRINT) {
            this.diamondCenterX = pos.x;
            this.setDiamond(pos);
            board.reset(newType, pos, 0);
        } else {
            board.reset(newType, pos, diffLevel);
        }

        board.name = this._boardInsIdx.toString();
        this._boardInsIdx++;
        this._boardList.push(board);
    }

    // 获得新板位置
    getNextPos(board: Board, count: number, out?: Vec3) {
        const pos: Vec3 = out ? out.set(board.node.position) : board.node.position.clone();
        const o = utils.getDiffCoeff(count, 1, 2);
        pos.x = (Math.random() - .5) * Constants.SCENE_MAX_OFFSET_X * o;
        if (board.type === Constants.BOARD_TYPE.SPRINT) {
            pos.y += Constants.BOARD_GAP_SPRINT;
            pos.x = board.node.position.x;
        }

        if (board.type === Constants.BOARD_TYPE.SPRING) {
            pos.y += Constants.BOARD_GAP_SPRING;
        } else {
            pos.y += Constants.BOARD_GAP;
        }
        return pos;
    }

    initDiamond() {
        for (let i = 0; i < Constants.DIAMOND_NUM; i++) {
            this.diamondSprintList[i] = instantiate(this.diamondPrefab) as Node;
            this.node.addChild(this.diamondSprintList[i]);
            this.diamondSprintList[i].active = false;
        }
    }

    setDiamond(pos: Vec3) {
        const position = pos.clone();
        position.y += Constants.BALL_JUMP_STEP_SPRINT * Constants.DIAMOND_START_FRAME;

        for (let i = 0; i < Constants.DIAMOND_NUM; i++) {
            this.setNextDiamondPos(position);
            this.diamondSprintList[i].setPosition(position);
            this.diamondSprintList[i].active = true;
        }
    }

    newDiamond() {
        _diamondPos.set(this.diamondSprintList[Constants.DIAMOND_NUM - 1].position);
        this.setNextDiamondPos(_diamondPos);
        const node = this.diamondSprintList.shift()!;
        node.setPosition(_diamondPos);
        node.active = true;
        this.diamondSprintList.push(node);
    }

    clearDiamond() {
        for (let i = 0; i < Constants.DIAMOND_NUM; i++) {
            this.diamondSprintList[i].active = false;
        }
    }

    setNextDiamondPos(pos: Vec3) {
        pos.y += Constants.DIAMOND_SPRINT_STEP_Y;
        pos.x += 1.5 * (Math.random() - 0.5);
        if (pos.x > this.diamondCenterX + Constants.SCENE_MAX_OFFSET_X) {
            pos.x = this.diamondCenterX + Constants.SCENE_MAX_OFFSET_X;
        } else if (pos.x < this.diamondCenterX - Constants.SCENE_MAX_OFFSET_X) {
            pos.x = this.diamondCenterX - Constants.SCENE_MAX_OFFSET_X;
        }
    }

    getBoardList() {
        return this._boardList;
    }

    getDiamondSprintList() {
        return this.diamondSprintList;
    }
}
