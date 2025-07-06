import {Container} from 'pixi.js';
import { gameConfig } from '../../config';
import { Frame } from '../../components/Frame';

export class UIController {
    private readonly container: Container;


    constructor() {
        this.container = new Container();
    }

    public init(): void {
        const frame = new Frame(gameConfig.REELS.CONTAINER_X_OFFSET + gameConfig.REELS.SYMBOL_WIDTH / 2, gameConfig.REELS.CONTAINER_Y_OFFSET + gameConfig.REELS.SYMBOL_HEIGHT / 2);
        this.container.addChild(frame);
    }

    public getContainer(): Container {
        return this.container;
    }

    public addReelContainer(container: Container): void {
        this.container.addChild(container);
    }

    public destroy(): void {
        this.container.removeChildren();
        this.container.destroy();
    }

}
