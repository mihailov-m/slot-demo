import {GameFSM} from '../state/GameFSM';
import {GameState, EventType} from '../../types/enums';
import {EventBus, Events} from '../../utils/EventBus';
import {ISpinResult} from "shared/types";
import {Emitter} from "mitt";

export class WinController {
    private eventBus: Emitter<Events>;

    constructor(private readonly fsm: GameFSM) {
        this.eventBus = EventBus.getInstance();
    }

    public async showWins(spinResult: ISpinResult): Promise<void> {
        this.eventBus.emit(EventType.WIN_BALANCE_UPDATE, spinResult);
        this.eventBus.emit(EventType.WIN_AMOUNT_SET, spinResult.financials.totalWin);
        this.eventBus.emit(EventType.WIN_SYMBOLS_HIGHLIGHT, spinResult);

        this.fsm.transitionTo(GameState.IDLE);
    }

    public destroy(): void {
    }
}
