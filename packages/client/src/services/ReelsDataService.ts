import { gameConfig } from '../config';

export class ReelsDataService {
    
    public generateInitialGrid(): string[][] {
        const initialGrid: string[][] = [];

        for (let col = 0; col < gameConfig.REELS.REEL_COUNT; col++) {
            const column: string[] = [];
            for (let row = 0; row < gameConfig.REELS.SYMBOLS; row++) {
                const symbolIndex = Math.floor(Math.random() * gameConfig.SYMBOLS_COUNT) + 1;
                const alias = `S${symbolIndex}`;
                column.push(alias);
            }
            initialGrid.push(column);
        }
        
        return initialGrid;
    }
}