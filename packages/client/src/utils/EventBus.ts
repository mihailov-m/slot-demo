import mitt, { Emitter } from 'mitt';
import { ISpinResult } from 'shared/types';
import { GameState, EventType } from '../types/enums';
import { SymbolSize } from '../game/entities/Reel';

export interface LayoutData {
    reelPositions: number[];
    symbolPositions: number[];
    symbolSize: SymbolSize;
    areaWidth: number;
    areaHeight: number;
}

export interface LayoutAreaData {
    width: number;
    height: number;
}

export type Events = {
    [EventType.UI_SPIN_REQUESTED]: void;
    [EventType.NETWORK_RESULT_RECEIVED]: ISpinResult;
    [EventType.INITIAL_BALANCE_RECEIVED]: number;
    [EventType.GAME_STATE_CHANGED]: { from: GameState; to: GameState };
    [EventType.LAYOUT_UPDATED]: LayoutData;
    [EventType.LAYOUT_AREA_CHANGED]: LayoutAreaData;
    [EventType.REEL_STOPPED]: { reelIndex: number };
    [EventType.WIN_BALANCE_UPDATE]: ISpinResult;
    [EventType.WIN_AMOUNT_SET]: number;
    [EventType.WIN_SYMBOLS_HIGHLIGHT]: ISpinResult;
};

export class EventBus {
    private static instance: Emitter<Events>;

    public static getInstance(): Emitter<Events> {
        if (!EventBus.instance) {
            EventBus.instance = mitt<Events>();
        }
        return EventBus.instance;
    }
}