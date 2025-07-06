import {useGameStore} from '../state/store';
import {GameState, EventType} from '../types/enums';
import {EventBus} from '../utils/EventBus';
import {ISpinResult} from 'shared/types';
import {gameConfig} from '../config';

export class StateManager {
    private static instance: StateManager;
    private eventBus = EventBus.getInstance();

    private constructor() {
        this.initializeEventListeners();
    }

    public static getInstance(): StateManager {
        if (!StateManager.instance) {
            StateManager.instance = new StateManager();
        }
        return StateManager.instance;
    }

    private initializeEventListeners(): void {
        this.eventBus.on(EventType.GAME_STATE_CHANGED, ({to}) => {
            useGameStore.setState({gameState: to});
        });

        this.eventBus.on(EventType.UI_SPIN_REQUESTED, () => {
            this.clearWin();
        });

        this.eventBus.on(EventType.INITIAL_BALANCE_RECEIVED, (balance: number) => {
            this.setInitialBalance(balance);
        });

        this.eventBus.on(EventType.WIN_BALANCE_UPDATE, (spinResult: ISpinResult) => {
            this.updateBalanceFromSpinResult(spinResult);
        });

        this.eventBus.on(EventType.WIN_AMOUNT_SET, (amount: number) => {
            this.setWinAmount(amount);
        });
    }

    public setGameReady(isReady: boolean): void {
        useGameStore.getState().actions.setGameReady(isReady);
    }

    public isGameReady(): boolean {
        return useGameStore.getState().isGameReady;
    }

    public getGameState(): GameState {
        return useGameStore.getState().gameState;
    }

    public setInitialBalance(balance: number): void {
        useGameStore.setState({balance});
    }

    public deductBetAmount(): void {
        const currentBalance = useGameStore.getState().balance;
        useGameStore.setState({balance: currentBalance - gameConfig.BET_AMOUNT});
    }

    public updateBalanceFromSpinResult(spinResult: ISpinResult): void {
        if (spinResult.financials?.newBalance !== undefined) {
            useGameStore.setState({balance: spinResult.financials.newBalance});
        }
    }

    public getCurrentBalance(): number {
        return useGameStore.getState().balance;
    }

    public setWinAmount(amount: number): void {
        useGameStore.getState().actions.setWin(amount);
    }

    public clearWin(): void {
        useGameStore.getState().actions.clearWin();
    }
}
