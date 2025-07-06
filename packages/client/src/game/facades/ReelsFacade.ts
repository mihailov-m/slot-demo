import {ReelsController} from '../controllers/ReelsController';
import {AssetService} from '../../services/AssetService';
import {IWinInfo} from 'shared/types';
import {Container} from "pixi.js";

export class ReelsFacade {
    private readonly reelsController: ReelsController;

    constructor(assetService: AssetService) {
        this.reelsController = new ReelsController(assetService);
    }

    public init() {
        this.reelsController.init();
    }

    public getReelsController(): ReelsController {
        return this.reelsController;
    }

    public getReelsContainer(): Container {
        return this.reelsController.getContainer();
    }

    public startSpin(): void {
        this.reelsController.spin();
    }

    public async stopReels(finalGrid: string[][]): Promise<void> {
        await this.reelsController.stop(finalGrid);
    }

    public highlightWinningSymbols(wins: IWinInfo[]): void {
        this.reelsController.highlightWinningSymbols(wins);
    }

    public resetWinningHighlight(): void {
        this.reelsController.resetWinningHighlight();
    }

    public destroy(): void {
        this.reelsController.destroy();
    }
}
