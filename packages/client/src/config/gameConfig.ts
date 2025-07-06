export const gameConfig = {
    GAME_DIMENSIONS: {
        WIDTH: 1280,
        HEIGHT: 720,
    },
    REELS: {
        REEL_COUNT: 6,
        SYMBOLS: 4,
        SYMBOL_PADDING: 6,
        REEL_PADDING: 20,
        SYMBOL_ASPECT_RATIO: 1,
        AREA_WIDTH: 961,
        AREA_HEIGHT: 600,
        SYMBOL_WIDTH: 144,
        SYMBOL_HEIGHT: 144,
        REELS_X: [0, 163.5, 327, 490.5, 654, 817.5],
        SPIN_SPEED: 2,
        CONTAINER_X_OFFSET: 160,
        CONTAINER_Y_OFFSET: 30,
        SYMBOLS_LIST: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'WILD']
    },
    TIMINGS: {
        MIN_SPIN_DURATION_MS: 1000,
        REEL_STOP_DELAY_MS: 500,
    },
    SYMBOLS_COUNT: 8,
    SERVER_URL: 'wss://slot-demo-server.onrender.com',
    BET_AMOUNT: 10,
};
