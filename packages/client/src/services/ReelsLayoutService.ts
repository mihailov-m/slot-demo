import { Container, Graphics } from 'pixi.js';
import { gameConfig } from '../config';
import { Reel } from '../game/entities/Reel';

export class ReelsLayoutService {
    
    public setupLayout(reels: Reel[]): void {
        const reelConfig = gameConfig.REELS;
        
        for (let i = 0; i < reels.length; i++) {
            const reel = reels[i];
            reel.container.x = reelConfig.REELS_X[i] || 0;
            reel.container.y = 0;
            
            const symbolY: number[] = [];
            const numSymbols = reelConfig.SYMBOLS + 1;
            const symbolTotalHeight = reelConfig.SYMBOL_HEIGHT + reelConfig.SYMBOL_PADDING;
            
            for (let j = 0; j < numSymbols; j++) {
                symbolY[j] = j * symbolTotalHeight - reelConfig.SYMBOL_HEIGHT; // -SYMBOL_HEIGHT for extra symbol
            }
            
            reel.updateLayout(
                {width: reelConfig.SYMBOL_WIDTH, height: reelConfig.SYMBOL_HEIGHT},
                symbolY
            );
        }
    }
    
    public setupMask(container: Container): void {
        const reelConfig = gameConfig.REELS;
        const mask = new Graphics();
        mask.rect(-reelConfig.SYMBOL_WIDTH/2, -reelConfig.SYMBOL_HEIGHT/2, reelConfig.AREA_WIDTH, reelConfig.AREA_HEIGHT);
        mask.fill(0xffffff);
        container.addChild(mask);
        container.mask = mask;
    }
}