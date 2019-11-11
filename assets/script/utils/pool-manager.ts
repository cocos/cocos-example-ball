// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Prefab, Node, instantiate, NodePool } from "cc";
const { ccclass, property } = _decorator;

@ccclass("PoolManager")
export class PoolManager {
    dictPool = {}
    dictPrefab = {}

    static _instance: PoolManager;

    static get instance () {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new PoolManager();
        return this._instance;
    }

    /**
     * 根据预设从对象池中获取对应节点
     */
    getNode (prefab: Prefab, parent: Node) {
        let name = prefab.data.name;
        this.dictPrefab[name] = prefab;
        let node: Node = null;
        if (this.dictPool.hasOwnProperty(name)) {
            //已有对应的对象池
            let pool = this.dictPool[name];
            if (pool.size() > 0) {
                node = pool.get();
            } else {
                node = instantiate(prefab);
            }
        } else {
            //没有对应对象池，创建他！
            let pool = new NodePool();
            this.dictPool[name] = pool;

            node = instantiate(prefab);
        }

        node.parent = parent;
        return node;
    }

    /**
     * 将对应节点放回对象池中
     */
    putNode (node: Node) {
        let name = node.name;
        let pool = null;
        if (this.dictPool.hasOwnProperty(name)) {
            //已有对应的对象池
            pool = this.dictPool[name];
        } else {
            //没有对应对象池，创建他！
            pool = new cc.NodePool();
            this.dictPool[name] = pool;
        }

        pool.put(node);
    }

    /**
     * 根据名称，清除对应对象池
     */
    clearPool (name: string) {
        if (this.dictPool.hasOwnProperty(name)) {
            let pool = this.dictPool[name];
            pool.clear();
        }
    }
}
