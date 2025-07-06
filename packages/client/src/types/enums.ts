export enum GameState {
    IDLE = 'IDLE',
    SPINNING = 'SPINNING',
    REELS_STOPPING = 'REELS_STOPPING',
    SHOWING_WINS = 'SHOWING_WINS',
}

export enum EventType {
    UI_SPIN_REQUESTED = 'ui:spin_requested',
    NETWORK_RESULT_RECEIVED = 'network:result_received',
    INITIAL_BALANCE_RECEIVED = 'network:initial_balance_received',
    GAME_STATE_CHANGED = 'game:state_changed',
    LAYOUT_UPDATED = 'layout:updated',
    LAYOUT_AREA_CHANGED = 'layout:area_changed',
    REEL_STOPPED = 'reel:stopped',
    WIN_BALANCE_UPDATE = 'win:balance_update',
    WIN_AMOUNT_SET = 'win:amount_set',
    WIN_SYMBOLS_HIGHLIGHT = 'win:symbols_highlight',
}

export enum SocketEvent {
    CONNECT = 'connect',
    CONNECT_ERROR = 'connect_error',
    DISCONNECT = 'disconnect',
    SPIN = 'spin',
    SPIN_RESULT = 'spinResult',
}
