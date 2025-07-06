import { Graphics } from 'pixi.js';
import { gameConfig } from '../config';

export class Frame extends Graphics {
    
    constructor(reelsX: number, reelsY: number) {
        super();
        this.createFixedFrame(reelsX, reelsY);
    }

    private createFixedFrame(reelsX: number, reelsY: number): void {
        const frameWidth = 10;
        const colorFill = 0xffcb00;
        const maskX = reelsX - gameConfig.REELS.SYMBOL_WIDTH/2;
        const maskY = reelsY - gameConfig.REELS.SYMBOL_HEIGHT/2;
        const maskWidth = gameConfig.REELS.AREA_WIDTH;
        const maskHeight = gameConfig.REELS.AREA_HEIGHT;

        this.rect(maskX - frameWidth, maskY - frameWidth, maskWidth + 2 * frameWidth, frameWidth);
        this.rect(maskX - frameWidth, maskY + maskHeight, maskWidth + 2 * frameWidth, frameWidth);
        this.rect(maskX - frameWidth, maskY, frameWidth, maskHeight);
        this.rect(maskX + maskWidth, maskY, frameWidth, maskHeight);
        this.fill(colorFill);
    }
}