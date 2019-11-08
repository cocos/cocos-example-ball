import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

export const utils = {
    getDiffCoeff: function (e: number, t: number, a: number) {
        return (a * e + 1) / (1 * e + ((a + 1) / t - 1));
    },

    getRandomInt: function (min: number, max: number) {
        var r = Math.random();
        var rr = r * (max - min + 1) + min;
        return Math.floor(rr);
    }
}
