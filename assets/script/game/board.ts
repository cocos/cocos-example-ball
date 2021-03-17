/**
 * Copyright (c) 2019 Xiamen Yaji Software Co.Ltd. All rights reserved.
 * Created by daisy on 2019/06/25.
 */
import { _decorator, Component, Node, Vec3, Prefab, instantiate, MeshRenderer, Color } from "cc";
import { Constants } from "../data/constants";
import { Game } from "./game";
import { utils } from '../utils/utils';
const { ccclass, property } = _decorator;

const _tempPos = new Vec3();

@ccclass("Board")
export class Board extends Component {

    @property(Prefab)
    diamondPrefab: Prefab = null!;

    @property({ type: Prefab })
    centerPrefab: Prefab = null!;

    @property({ type: Prefab })
    wavePrefab: Prefab = null!;

    // 弹簧片
    @property({ type: Prefab })
    springTopPrefab: Prefab = null!;

    // 弹簧
    @property({ type: Prefab })
    springHelixPrefab: Prefab = null!;

    isActive = false;
    diamondList: Node[] = [];
    type = Constants.BOARD_TYPE.NORMAL;
    wave: Node = null!;
    waveInner: Node = null!;
    waveOriginScale = new Vec3();
    currWaveFrame = 0;
    currSpringFrame = 0;
    currBumpFrame = Constants.BOARD_BUMP_FRAMES;
    springTop: Node = null!;
    springHelix: Node = null!;
    springHelixOriginScale = new Vec3();
    center: Node = null!;
    isMovingRight = true;
    hasDiamond = false;
    isMoving = false;
    posBeforeDrop = new Vec3();
    originScale = new Vec3();
    currDropFrame = Constants.BOARD_DROP_FRAMES;

    _game: Game = null!;

    onLoad() {
        this.originScale.set(this.node.scale);
        this.initCenter();
        this.initWave();
        this.initSpring();
        this.initDiamond();
    }

    update() {
        this.effectBump();
        this.effectWave();
        if (this.type === Constants.BOARD_TYPE.SPRING || this.type === Constants.BOARD_TYPE.SPRINT) {
            this.effectSpring();
        }
        this.effectDrop();
        this.effectMove();
        if (this.hasDiamond) {
            this.effectDiamondRotate();
        }
    }

    reset(type: number, pos: Vec3, level: number) {
        this.isActive = false;
        this.type = type;
        this.node.setPosition(pos);
        this.isMoving = false;
        this.currDropFrame = Constants.BOARD_DROP_FRAMES;
        // 按概率来决定是否是移动板
        if (this.type === Constants.BOARD_TYPE.NORMAL || this.type === Constants.BOARD_TYPE.DROP || this.type === Constants.BOARD_TYPE.SPRING) {
            this.isMoving = this.setMove(level);
        }

        if (this.type === Constants.BOARD_TYPE.GIANT) {
            this.node.setScale(this.originScale.x * Constants.BOARD_SCALE_GIANT, this.originScale.y, this.originScale.z);
        } else if (this.type === Constants.BOARD_TYPE.DROP) {
            this.node.setScale(this.originScale.x, this.originScale.y * Constants.BOARD_HEIGTH_SCALE_DROP, this.originScale.z);
            this.posBeforeDrop.set(this.node.position);
        } else {
            this.node.setScale(this.originScale);
        }

        this.springTop.active = false;
        if (this.type === Constants.BOARD_TYPE.SPRING || this.type === Constants.BOARD_TYPE.SPRINT) {
            this.springHelix.active = true;
            this.springTop.active = true;
            this.setSpringPos();
        }

        this.hasDiamond = false;
        if (this.diamondList[0]) {
            for (let i = 0; i < 5; i++) {
                this.diamondList[i].active = false;
            }

            if (this.type === Constants.BOARD_TYPE.GIANT) {
                for (let i = 0; i < 5; i++) {
                    this.diamondList[i].active = true;
                    this.hasDiamond = true;
                }
            } else if (this.type === Constants.BOARD_TYPE.NORMAL || this.type === Constants.BOARD_TYPE.DROP) {
                if (Math.random() > .7) {
                    this.diamondList[2].active = Constants.game.initFirstBoard;
                    Constants.game.initFirstBoard = true;
                    this.hasDiamond = true;
                }
            }

            if (this.hasDiamond) {
                this.setDiamondPos();
            }
        }
    }

    setDrop() {
        this.currDropFrame = 0;
        this.posBeforeDrop.set(this.node.position);
    }

    effectDrop() {
        if (this.currDropFrame < Constants.BOARD_DROP_FRAMES) {
            for (let i = 0; i < 5; i++) {
                this.diamondList[i].active = false;
            }

            if (this.springTop.active) {
                this.springHelix.active = false;
                const pos = this.springTop.position;
                this.springTop.setPosition(pos.x, pos.y - Constants.BOARD_DROP_STEP, pos.z);
            }
            _tempPos.set(this.node.position);
            _tempPos.y -= Constants.BOARD_DROP_STEP;
            this.node.setPosition(_tempPos);
            this.setCenterPos();
            this.currDropFrame++;
        }
    }

    initDiamond() {
        for (let i = 0; i < 5; i++) {
            this.diamondList[i] = instantiate(this.diamondPrefab);
            this.node.parent!.addChild(this.diamondList[i]);
            this.diamondList[i].active = false;
        }
    }

    setDiamondPos() {
        const pos = new Vec3();
        for (let i = 0; i < 5; i++) {
            if (this.diamondList[i].active) {
                pos.set(this.node.position);
                pos.x += 1.4 * (i - 2);
                pos.y += Constants.BOARD_HEIGTH;
                this.diamondList[i].setPosition(pos);
            }
        }
    }

    hideDiamond(index: number) {
        this.diamondList[index].active = false;
    }

    checkDiamond(x: number) {
        if (this.hasDiamond) {
            let flag = true;
            for (let i = 0; i < 5; i++) {
                if (this.diamondList[i].active) {
                    flag = false;
                    if (Math.abs(x - this.diamondList[i].position.x) <= Constants.DIAMOND_SCORE_AREA) {
                        Constants.game.ball.playDiamondParticle(this.diamondList[i].position);
                        this.hideDiamond(i);
                        Constants.game.addScore(Constants.DIAMOND_SCORE);
                    }
                }
            }
            if (flag) {
                this.hasDiamond = false;
            }
        }
    }

    // 钻石旋转
    effectDiamondRotate() {
        for (let i = 0; i < 5; i++) {
            const eulerAngles = this.diamondList[i].eulerAngles;
            this.diamondList[i].eulerAngles = new Vec3(eulerAngles.x, eulerAngles.y + Constants.DIAMOND_ROTATE_STEP_Y, eulerAngles.z);
        }
    }

    initSpring() {
        this.springHelix = instantiate(this.springHelixPrefab);
        this.springHelixOriginScale = this.springHelix.getScale();
        this.springHelix.setScale(1.5, 1, 1.5);
        this.node.parent!.addChild(this.springHelix);
        this.springHelix.active = false;
        this.currSpringFrame = 2 * Constants.BOARD_SPRING_FRAMES;
        this.springTop = instantiate(this.springTopPrefab);
        this.node.parent!.addChild(this.springTop);
        this.springTop.active = false;
        const pos = this.node.position.clone();
        pos.y += (Constants.BOARD_HEIGTH + Constants.SPRING_HEIGHT) / 2;
        this.springTop.setPosition(pos);

        this.setSpringPos();
    }

    setSpring() {
        this.currSpringFrame = 0;
        this.setSpringPos();
        this.springHelix.setScale(1.5, 1, 1.5);
        this.springHelix.active = true;
        this.springTop.active = true;
    }

    setSpringPos() {
        let pos = this.node.position.clone();
        pos.y += Constants.BOARD_HEIGTH / 2;
        this.springHelix.setPosition(pos);
        pos = this.node.position.clone();
        pos.y += (Constants.BOARD_HEIGTH + Constants.SPRING_HEIGHT) / 2;
        this.springTop.setPosition(pos);
    }

    effectSpring() {
        const z = this.type === Constants.BOARD_TYPE.SPRINT ? Constants.SPRING_HELIX_STEP_SPIRNT : Constants.SPRING_HELIX_STEP;
        const y = this.type === Constants.BOARD_TYPE.SPRINT ? Constants.SPRING_TOP_STEP_SPRINT : Constants.SPRING_TOP_STEP;
        const scale = this.springHelix.scale;
        const pos = this.springTop.position;
        if (this.currSpringFrame < Constants.BOARD_SPRING_FRAMES) {
            this.springHelix.setScale(scale.x, scale.y + z, scale.z);
            this.springTop.setPosition(pos.x, pos.y + y, pos.z);
            this.currSpringFrame++;
        } else if (this.currSpringFrame >= Constants.BOARD_SPRING_FRAMES && this.currSpringFrame < 2 * Constants.BOARD_SPRING_FRAMES) {
            this.springHelix.setScale(scale.x, scale.y - z, scale.z);
            this.springTop.setPosition(pos.x, pos.y - y, pos.z);
            this.currSpringFrame++;
        } else {
            this.springHelix.active = false;
        }
    }

    setBump() {
        this.currBumpFrame = 0;
    }

    effectBump() {
        if (this.currBumpFrame < Constants.BOARD_BUMP_FRAMES) {
            const pos = this.node.position;
            this.node.setPosition(pos.x, pos.y + Constants.BOARD_BUMP_STEP[this.currBumpFrame], pos.z);
            this.setCenterPos();
            this.currBumpFrame++;
        }
    }

    initCenter() {
        this.center = instantiate(this.centerPrefab);
        this.node.parent!.addChild(this.center);
        this.center.active = false;
    }

    setCenterPos() {
        const pos = this.node.position.clone();
        pos.y += Constants.BOARD_HEIGTH / 2;
        this.center.setPosition(pos);
    }

    initWave() {
        this.wave = instantiate(this.wavePrefab);
        this.node.parent!.addChild(this.wave);
        this.wave.active = false;
        this.waveInner = instantiate(this.wavePrefab);
        this.node.parent!.addChild(this.waveInner);
        this.waveInner.active = false;
        this.currWaveFrame = Constants.BOARD_WAVE_FRAMES;
        this.waveOriginScale.set(this.wave.scale);
    }

    setWave() {
        if (this.type != Constants.BOARD_TYPE.GIANT) {
            this.currWaveFrame = 0;
            const pos = this.node.position.clone();
            pos.y += Constants.WAVE_OFFSET_Y;
            this.wave.setPosition(pos);
            this.wave.setScale(this.waveOriginScale.clone());
            this.wave.active = true;
            const mat2 = this.wave.getComponent(MeshRenderer)!.material;
            // 初始化时保存以下变量
            const pass = mat2!.passes[0];
            const hColor = pass.getHandle('color');
            const color = new Color('#dadada');
            color.a = 127;
            pass.setUniform(hColor, color);
            this.waveInner.setPosition(pos);
            this.waveInner.setScale(this.waveOriginScale.clone());
        }
    }

    effectWave() {
        if (this.currWaveFrame < Constants.BOARD_WAVE_FRAMES) {
            if (this.currWaveFrame >= Constants.BOARD_WAVE_INNER_START_FRAMES) {
                if (!this.waveInner.active) {
                    this.waveInner.active = true;
                }

                const mat2 = this.waveInner.getComponent(MeshRenderer)!.material;
                // 初始化时保存以下变量
                const pass = mat2!.passes[0];
                const hColor = pass.getHandle('color');
                const color = new Color('#dadada');
                color.a = 127 - Math.sin(this.currWaveFrame * 0.05) * 127;
                pass.setUniform(hColor, color);

                const scale = this.waveInner.getScale();
                this.waveInner.setScale(scale.x + Constants.BOARD_WAVE_INNER_STEP, scale.y, scale.z + Constants.BOARD_WAVE_INNER_STEP);
            }

            const mat2 = this.wave.getComponent(MeshRenderer)!.material;
            // 初始化时保存以下变量
            const pass = mat2!.passes[0];
            const hColor = pass.getHandle('color');
            const color = new Color('#dadada');
            color.a = 127 - Math.sin(this.currWaveFrame * 0.1) * 127;
            pass.setUniform(hColor, color);
            const scale = this.waveInner.getScale();
            this.wave.setScale(scale.x + Constants.BOARD_WAVE_STEP, scale.y, scale.z + Constants.BOARD_WAVE_STEP);
            this.currWaveFrame++;
        } else {
            this.wave.active = false;
            this.waveInner.active = false;
        }
    }

    getHeight() {
        return this.type === Constants.BOARD_TYPE.DROP ? Constants.BOARD_HEIGTH * Constants.BOARD_HEIGTH_SCALE_DROP : Constants.BOARD_HEIGTH;
    }

    getRadius() {
        return this.type === Constants.BOARD_TYPE.GIANT ? Constants.BOARD_RADIUS * Constants.BOARD_RADIUS_SCALE_GIANT : Constants.BOARD_RADIUS;

    }

    setMove(coeff: number): boolean {
        const t = utils.getDiffCoeff(coeff, 1, 10);
        return Math.random() * t > 5;
    }

    effectMove() {
        if (this.isMoving) {
            var pos = this.node.getPosition().clone();
            var x = pos.x;
            if (this.isMovingRight && x <= Constants.SCENE_MAX_OFFSET_X) {
                x += Constants.BOARD_MOVING_STEP;
                this.node.setPosition(x, pos.y, pos.z);
            } else if (this.isMovingRight && x > Constants.SCENE_MAX_OFFSET_X) {
                this.isMovingRight = false;
            } else if (!this.isMovingRight && x >= - Constants.SCENE_MAX_OFFSET_X) {
                x -= Constants.BOARD_MOVING_STEP;
                this.node.setPosition(x, pos.y, pos.z);
            } else if (!this.isMovingRight && x < - Constants.SCENE_MAX_OFFSET_X) {
                this.isMovingRight = true
            }
            if (this.type === Constants.BOARD_TYPE.SPRING) {
                this.springHelix.setPosition(this.node.position.x, this.springHelix.position.y, this.springHelix.position.z);
                this.springTop.setPosition(this.node.position.x, this.springTop.position.y, this.springTop.position.z);
            }
            this.setCenterPos();
            if (this.hasDiamond) {
                this.setDiamondPos();
            }
        }
    }

    revive() {
        this.isActive = false;
        this.isMoving = false;
        if (this.type === Constants.BOARD_TYPE.DROP) {
            this.currDropFrame = Constants.BOARD_DROP_FRAMES;
            this.node.setPosition(this.posBeforeDrop);
        }
    }
}
