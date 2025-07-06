import {WebSocket, WebSocketServer} from 'ws';
import {ISpinResult, ISpinRequestPayload, IWinInfo} from 'shared/types';

const REELS_COUNT = 6;
const VISIBLE_ROWS = 4;

const REEL_STRIPS: string[][] = [
    ['S1', 'S5', 'S8', 'S3', 'WILD', 'S6', 'S5', 'S4', 'S2', 'S7', 'S8', 'S1'],
    ['S2', 'S6', 'S1', 'S4', 'S7', 'S3', 'WILD', 'S2', 'S8', 'S1', 'S6', 'S4'],
    ['S3', 'S7', 'S2', 'WILD', 'S1', 'S4', 'S8', 'S6', 'S3', 'S5'],
    ['S4', 'S1', 'S5', 'S2', 'S8', 'S7', 'WILD', 'S3', 'S6', 'S4', 'S1', 'S5'],
    ['S5', 'S2', 'S6', 'S1', 'S4', 'S8', 'WILD', 'S7', 'S3', 'S5', 'S2', 'S6'],
    ['S6', 'S3', 'S7', 'S2', 'S5', 'S1', 'WILD', 'S4', 'S8', 'S6', 'S3', 'S7'],
];

const PAYTABLE: Record<string, Record<number, number>> = {
    'S1': {5: 100, 6: 200, 7: 400, 8: 800, 9: 1600, 10: 3200},
    'S2': {5: 80, 6: 160, 7: 320, 8: 640, 9: 1280, 10: 2560},
    'S3': {5: 60, 6: 120, 7: 240, 8: 480, 9: 960, 10: 1920},
    'S4': {5: 50, 6: 100, 7: 200, 8: 400, 9: 800, 10: 1600},
    'S5': {5: 40, 6: 80, 7: 160, 8: 320, 9: 640, 10: 1280},
    'S6': {5: 30, 6: 60, 7: 120, 8: 240, 9: 480, 10: 960},
    'S7': {5: 20, 6: 40, 7: 80, 8: 160, 9: 320, 10: 640},
    'S8': {5: 20, 6: 40, 7: 80, 8: 160, 9: 320, 10: 640},
    'WILD': {5: 500, 6: 1000, 7: 2000, 8: 4000, 9: 8000, 10: 16000},
};

// -----------------------------------------------------------------

const wss = new WebSocketServer({port: 8080});

console.log('ws on 8080');

const pingClients = () => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.ping();
        }
    });
};

const pingInterval = setInterval(pingClients, 30000);

wss.on('close', () => {
    clearInterval(pingInterval);
});

wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');
    let balance = 1000;
    let isAlive = true;

    const initialBalancePayload = JSON.stringify({
        type: 'INITIAL_BALANCE',
        payload: { balance }
    });
    ws.send(initialBalancePayload);

    ws.on('pong', () => {
        isAlive = true;
    });

    ws.on('message', (message: string) => {
        try {
            const data = JSON.parse(message);
            console.log('msg:', data);

            if (data.type === 'PING') {
                ws.send(JSON.stringify({type: 'PONG'}));
                return;
            }

            if (data.type === 'SPIN_REQUEST') {
                const payload: ISpinRequestPayload = data.payload;
                const betAmount = payload.betAmount || 1;

                if (balance < betAmount) {
                    ws.send(JSON.stringify({
                        type: 'ERROR',
                        payload: {message: 'Insufficient balance'}
                    }));
                    return;
                }
                balance -= betAmount;

                const spinResult: ISpinResult = generateSpinResult(betAmount);
                balance += spinResult.financials.totalWin;
                spinResult.financials.newBalance = balance;

                ws.send(JSON.stringify({
                    type: 'SPIN_RESULT',
                    payload: spinResult
                }));
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

function generateSpinResult(bet: number): ISpinResult {
    const stopPositions = REEL_STRIPS.map(strip => Math.floor(Math.random() * strip.length));
    const reelGrid: string[][] = REEL_STRIPS.map((strip, i) => {
        const reel: string[] = [];
        const stopPos = stopPositions[i];
        for (let j = 0; j < VISIBLE_ROWS; j++) {
            reel.push(strip[(stopPos + j) % strip.length]);
        }
        return reel;
    });

    const wins: IWinInfo[] = [];
    let totalWin = 0;

    const symbolCount: Record<string, { count: number; positions: [number, number][] }> = {};

    for (let reel = 0; reel < REELS_COUNT; reel++) {
        for (let row = 0; row < VISIBLE_ROWS; row++) {
            const symbol = reelGrid[reel][row];
            if (!symbolCount[symbol]) {
                symbolCount[symbol] = {count: 0, positions: []};
            }
            symbolCount[symbol].count++;
            symbolCount[symbol].positions.push([reel, row]);
        }
    }

    for (const symbol in symbolCount) {
        const entry = symbolCount[symbol];
        if (entry.count >= 5) {
            const paytable = PAYTABLE[symbol];
            if (paytable && paytable[entry.count]) {
                const winAmount = paytable[entry.count] * bet;
                totalWin += winAmount;
                wins.push({
                    symbol,
                    amount: winAmount,
                    positions: entry.positions,
                });
            }
        }
    }

    return {
        reelGrid,
        wins,
        financials: {
            totalWin,
            newBalance: 0,
        }
    };
}
