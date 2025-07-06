import {Sprite, Texture} from 'pixi.js';
import {gsap} from 'gsap';

export class Symbol extends Sprite {
    private winAnimationTimeline: gsap.core.Timeline | null = null;
    private originalWidth: number = 0;
    private originalHeight: number = 0;
    public row: number = -1; //temp symbol
    public symbolId: string = '';

    constructor(texture: Texture, symbolId: string = '', row: number = -1) {
        super(texture);
        this.anchor.set(0.5);
        this.symbolId = symbolId;
        this.row = row;
    }

    public setOriginalSize(width: number, height: number): void {
        this.originalWidth = width;
        this.originalHeight = height;
    }

    public startWinAnimation(): void {
        this.resetWinHighlight();

        this.winAnimationTimeline = gsap.timeline()
            .to(this, {
                width: this.originalWidth * 1.3,
                height: this.originalHeight * 1.3,
                duration: 0.3,
                ease: "elastic.out(1.2,0.5)"
            })
            .to(this, {rotation: 0.1, duration: 0.15, yoyo: true, repeat: 3, ease: "sine.inOut"}, 0)
            .to(this, {
                width: this.originalWidth,
                height: this.originalHeight,
                duration: 0.3,
                ease: "power4.inOut"
            }).repeat(4);
    }

    public resetWinHighlight(): void {
        if (this.winAnimationTimeline) {
            this.winAnimationTimeline.kill();
            this.winAnimationTimeline = null;
        }
        this.tint = 0xffffff;
        if (this.originalWidth > 0 && this.originalHeight > 0) {
            this.width = this.originalWidth;
            this.height = this.originalHeight;
        }
        this.rotation = 0;
    }

    public destroy(): void {
        this.resetWinHighlight();
        super.destroy();
    }
}
