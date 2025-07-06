import {GameState, EventType} from '../../types/enums';
import {EventBus} from '../../utils/EventBus';

const transitions: Record<GameState, GameState[]> = {
    [GameState.IDLE]: [GameState.SPINNING],
    [GameState.SPINNING]: [GameState.REELS_STOPPING],
    [GameState.REELS_STOPPING]: [GameState.SHOWING_WINS, GameState.IDLE],
    [GameState.SHOWING_WINS]: [GameState.IDLE],
};

export class GameFSM {
    private currentState: GameState = GameState.IDLE;

    constructor(private readonly eventBus = EventBus.getInstance()) {
    }

    public getState(): GameState {
        return this.currentState;
    }

    public transitionTo(newState: GameState): boolean {
        const allowedTransitions = transitions[this.currentState];
        if (!allowedTransitions?.includes(newState)) {
            return false;
        }

        const oldState = this.currentState;
        this.currentState = newState;
        this.eventBus.emit(EventType.GAME_STATE_CHANGED, {from: oldState, to: newState});
        return true;
    }
}
