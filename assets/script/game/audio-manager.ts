import { _decorator, AudioClip, loader, Component, AudioSourceComponent } from "cc";
import { Constants } from "../data/constants";
const { ccclass, property } = _decorator;

@ccclass("AudioManager")
export class AudioManager extends Component{
    @property(AudioClip)
    bg: AudioClip = null;
    @property(AudioClip)
    click: AudioClip = null;

    audioComp: AudioSourceComponent = null;

    start() {
        this.audioComp = this.getComponent(AudioSourceComponent);
    }

    playSound(play = true) {
        if(!play){
            this.audioComp.stop();
            return;
        }

        this.audioComp.clip = this.bg;
        this.audioComp.play();
    }

    playClip() {
        this.audioComp.playOneShot(this.click);
    }

}
