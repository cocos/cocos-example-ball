import { _decorator, AudioClip, loader, Component, AudioSource } from "cc";
const { ccclass, property } = _decorator;

@ccclass("AudioManager")
export class AudioManager extends Component{
    @property(AudioClip)
    bg: AudioClip = null!;
    @property(AudioClip)
    click: AudioClip = null!;

    audioComp: AudioSource = null!;

    start() {
        this.audioComp = this.getComponent(AudioSource)!;
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
