import {Application, Container} from 'pixi.js';
import {AssetService} from '../../services/AssetService';
import {SocketService} from '../../services/SocketService';
import {GameStateService} from '../../services/GameStateService';
import {BalanceService} from '../../services/BalanceService';
import {StateManager} from '../../services/StateManager';
import {GameFSM} from '../state/GameFSM';
import {gameConfig} from '../../config';
import {UIController} from './UIController';
import {SpinController} from './SpinController';
import {ReelsFacade} from '../facades/ReelsFacade';
import {EventBus, Events} from '../../utils/EventBus';
import {WinController} from "./WinController";
import {EventType} from "../../types/enums";
import {ISpinResult} from "shared/types";
import {Emitter} from "mitt";

export class GameController {
    public readonly app: Application;
    private readonly fsm: GameFSM;
    private readonly assetService: AssetService;
    private readonly socketService: SocketService;
    private readonly gameStateService: GameStateService;
    private readonly balanceService: BalanceService;
    private readonly reelsFacade: ReelsFacade;
    private readonly eventBus!: Emitter<Events>;
    private uiController!: UIController;
    private spinController!: SpinController;
    private winController!: WinController;


    private isInitialized = false;
    private boundWinSymbolsHighlightHandler = (spinResult: ISpinResult) => {
        this.reelsFacade.highlightWinningSymbols(spinResult.wins);
    };

    constructor() {
        this.app = new Application();
        this.fsm = new GameFSM();
        this.assetService = new AssetService();
        this.socketService = new SocketService();
        this.gameStateService = new GameStateService();
        this.balanceService = new BalanceService();
        this.eventBus = EventBus.getInstance();
        this.reelsFacade = new ReelsFacade(this.assetService);
        StateManager.getInstance();
    }

    public async init(container: HTMLElement): Promise<void> {
        await this.app.init({
            width: gameConfig.GAME_DIMENSIONS.WIDTH,
            height: gameConfig.GAME_DIMENSIONS.HEIGHT,
            backgroundColor: 0xa65917,
            resolution: 1,
            autoDensity: false,
        });

        await this.assetService.loadAssets();

        this.winController = new WinController(this.fsm);

        this.reelsFacade.init();

        this.uiController = new UIController();
        this.uiController.init();
        this.uiController.addReelContainer(this.reelsFacade.getReelsContainer());
        this.app.stage.addChild(this.uiController.getContainer());
        container.appendChild(this.app.canvas);

        this.spinController = new SpinController(
            this.fsm,
            this.socketService,
            this.reelsFacade,
            this.winController,
            this.balanceService,
            this.eventBus
        );

        this.eventBus.on(EventType.WIN_SYMBOLS_HIGHLIGHT, this.boundWinSymbolsHighlightHandler);

        try {
            await this.socketService.connect(gameConfig.SERVER_URL);
            this.isInitialized = true;
            this.spinController.init();
            this.gameStateService.setGameReady(true);
        } catch (error) {
            console.error("Failed to initialize game due to connection error:", error);
        }
    }

    public destroy(): void {
        this.eventBus.off(EventType.WIN_SYMBOLS_HIGHLIGHT, this.boundWinSymbolsHighlightHandler);

        if (this.uiController) {
            this.uiController.destroy();
        }

        if (this.spinController) {
            this.spinController.destroy();
        }

        if (this.winController) {
            this.winController.destroy();
        }

        this.reelsFacade.destroy();

        this.app.destroy(true);
        this.isInitialized = false;
    }
}
