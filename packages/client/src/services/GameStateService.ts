import { GameState } from '../types/enums';
import { StateManager } from './StateManager';

export class GameStateService {
    private stateManager = StateManager.getInstance();

    public setGameReady(isReady: boolean): void {
        this.stateManager.setGameReady(isReady);
    }

    public isGameReady(): boolean {
        return this.stateManager.isGameReady();
    }

    public getGameState(): GameState {
        return this.stateManager.getGameState();
    }
}
