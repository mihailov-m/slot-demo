import {Container} from 'pixi.js';
import {gameConfig} from '../../config';
import {Reel} from '../entities/Reel';
import {AssetService} from '../../services/AssetService';
import {ReelsLayoutService} from '../../services/ReelsLayoutService';
import {EventBus} from '../../utils/EventBus';
import {EventType} from '../../types/enums';
import {IWinInfo} from 'shared/types';
import {ReelsDataService} from "../../services/ReelsDataService";

export class ReelsController {
    private readonly container: Container;
    private readonly reels: Reel[] = [];
    private readonly reelConfig = gameConfig.REELS;
    private readonly assetService: AssetService;
    private readonly layoutService: ReelsLayoutService;
    private readonly eventBus = EventBus.getInstance();
    private reelsDataService: ReelsDataService;

    constructor(assetService: AssetService) {
        this.container = new Container();
        this.assetService = assetService;
        this.layoutService = new ReelsLayoutService();
        this.reelsDataService = new ReelsDataService();
    }

    public init() {
        for (let i = 0; i < this.reelConfig.REEL_COUNT; i++) {
            const reel = new Reel(this.assetService, i);
            this.reels.push(reel);
            this.container.addChild(reel.container);
        }
        this.reels.forEach(reel => reel.init());
        this.layoutService.setupLayout(this.reels);
        this.layoutService.setupMask(this.container);
        this.container.x = gameConfig.REELS.CONTAINER_X_OFFSET + gameConfig.REELS.SYMBOL_WIDTH / 2;
        this.container.y = gameConfig.REELS.CONTAINER_Y_OFFSET + gameConfig.REELS.SYMBOL_HEIGHT / 2;

        const initialGrid = this.reelsDataService.generateInitialGrid();
        this.reels.forEach((reel, i) => reel.populate(initialGrid[i]));
    }

    public getContainer(): Container {
        return this.container;
    }

    public spin(): void {
        this.reels.forEach(reel => reel.spin());
    }

    public async stop(finalGrid: string[][]): Promise<void> {
        return new Promise<void>((resolve) => {
            let stoppedReels = 0;
            const totalReels = this.reels.length;

            const handleReelStopped = () => {
                if (++stoppedReels === totalReels) {
                    this.eventBus.off(EventType.REEL_STOPPED, handleReelStopped);
                    resolve();
                }
            };

            this.eventBus.on(EventType.REEL_STOPPED, handleReelStopped);

            this.reels.forEach((reel, i) => {
                setTimeout(() => {
                    reel.beginStopping(finalGrid[i]);
                }, i * gameConfig.TIMINGS.REEL_STOP_DELAY_MS);
            });
        });
    }

    public highlightWinningSymbols(wins: IWinInfo[]) {
        const positionsByReel = new Map<number, Set<number>>();

        for (const win of wins) {
            for (const [reelIndex, rowIndex] of win.positions) {
                if (!positionsByReel.has(reelIndex)) {
                    positionsByReel.set(reelIndex, new Set<number>());
                }
                positionsByReel.get(reelIndex)!.add(rowIndex);
            }
        }

        positionsByReel.forEach((rowSet, reelIndex) => {
            if (reelIndex < this.reels.length) {
                const rowIndices = Array.from(rowSet);
                this.reels[reelIndex].highlightWinningSymbols(rowIndices);
            }
        });
    }

    public resetWinningHighlight() {
        this.reels.forEach(reel => reel.resetWinningHighlight());
    }

    public destroy(): void {
        this.reels.forEach(reel => reel.destroy());
        this.reels.length = 0;
        this.container.removeChildren();
        this.container.destroy();
    }

}
