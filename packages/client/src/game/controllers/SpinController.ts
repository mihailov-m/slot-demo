import {GameFSM} from '../state/GameFSM';
import {SocketService} from '../../services/SocketService';
import {BalanceService} from '../../services/BalanceService';
import {ReelsFacade} from '../facades/ReelsFacade';
import {WinController} from './WinController';
import {ISpinResult} from 'shared/types';
import {gameConfig} from '../../config';
import {GameState, EventType} from '../../types/enums';
import {EventBus} from '../../utils/EventBus';

export class SpinController {
    private spinResult: ISpinResult | null = null;
    private isMinTimeElapsed = false;
    private isInitialized = false;
    private minSpinTimeoutId: number | null = null;
    private boundHandleSpinRequest = () => this.handleSpinRequest();
    private boundHandleSpinResult = (result: ISpinResult) => this.handleSpinResult(result);

    constructor(
        private readonly fsm: GameFSM,
        private readonly socketService: SocketService,
        private readonly reelsFacade: ReelsFacade,
        private readonly winController: WinController,
        private readonly balanceService: BalanceService,
        private readonly eventBus = EventBus.getInstance()
    ) {
    }

    public init(): void {
        this.listenToEvents();
        this.isInitialized = true;
    }

    private listenToEvents(): void {
        this.eventBus.on(EventType.UI_SPIN_REQUESTED, this.boundHandleSpinRequest);
        this.eventBus.on(EventType.NETWORK_RESULT_RECEIVED, this.boundHandleSpinResult);
    }

    private handleSpinRequest(): void {
        if (!this.isInitialized) return;

        const transitionSucceeded = this.fsm.transitionTo(GameState.SPINNING);
        if (transitionSucceeded) {
            this.balanceService.deductBetAmount();

            this.spinResult = null;
            this.isMinTimeElapsed = false;

            this.reelsFacade.startSpin();
            this.socketService.sendSpinRequest({
                betAmount: gameConfig.BET_AMOUNT
            });

            this.minSpinTimeoutId = setTimeout(() => {
                this.isMinTimeElapsed = true;
                this.tryStopReels();
            }, gameConfig.TIMINGS.MIN_SPIN_DURATION_MS);
        }
    }

    private handleSpinResult(result: ISpinResult): void {
        this.spinResult = result;
        this.tryStopReels();
    }

    private async tryStopReels(): Promise<void> {
        if (!this.spinResult || !this.isMinTimeElapsed || this.fsm.getState() !== GameState.SPINNING) {
            return;
        }

        const transitionSucceeded = this.fsm.transitionTo(GameState.REELS_STOPPING);
        if (transitionSucceeded) {
            await this.reelsFacade.stopReels(this.spinResult.reelGrid);

            if (this.spinResult.wins.length > 0) {
                this.fsm.transitionTo(GameState.SHOWING_WINS);
                await this.winController.showWins(this.spinResult);
            } else {
                this.balanceService.updateBalanceFromSpinResult(this.spinResult);
                this.fsm.transitionTo(GameState.IDLE);
            }
        }
    }

    public destroy(): void {
        this.eventBus.off(EventType.UI_SPIN_REQUESTED, this.boundHandleSpinRequest);
        this.eventBus.off(EventType.NETWORK_RESULT_RECEIVED, this.boundHandleSpinResult);

        if (this.minSpinTimeoutId) {
            clearTimeout(this.minSpinTimeoutId);
            this.minSpinTimeoutId = null;
        }

        this.spinResult = null;
        this.isMinTimeElapsed = false;
        this.isInitialized = false;
    }
}
