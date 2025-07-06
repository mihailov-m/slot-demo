import { ISpinResult } from 'shared/types';
import { StateManager } from './StateManager';

export class BalanceService {
    private stateManager = StateManager.getInstance();

    public setInitialBalance(balance: number): void {
        this.stateManager.setInitialBalance(balance);
    }

    public deductBetAmount(): void {
        this.stateManager.deductBetAmount();
    }

    public updateBalanceFromSpinResult(spinResult: ISpinResult): void {
        this.stateManager.updateBalanceFromSpinResult(spinResult);
    }

    public getCurrentBalance(): number {
        return this.stateManager.getCurrentBalance();
    }

    public setWinAmount(amount: number): void {
        this.stateManager.setWinAmount(amount);
    }

    public clearWin(): void {
        this.stateManager.clearWin();
    }
}
