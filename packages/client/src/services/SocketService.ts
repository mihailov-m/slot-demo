import {ISpinRequestPayload} from 'shared/types';
import {EventType} from '../types/enums';
import {EventBus} from '../utils/EventBus';

export class SocketService {
    private socket: WebSocket | null = null;
    private pingInterval: number | null = null;
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = 5;
    private readonly reconnectDelay = 3000;

    constructor(private readonly eventBus = EventBus.getInstance()) {
    }

    public connect(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(url);

            this.socket.onopen = () => {
                console.log('[WS] Connected');
                this.reconnectAttempts = 0;
                this.initializeListeners();
                this.startPingInterval();
                resolve();
            };

            this.socket.onerror = (err) => {
                console.error('[WS] Connection Error:', err);
                if (this.reconnectAttempts === 0) {
                    reject(err);
                }
            };

            this.socket.onclose = () => {
                console.log('[WS] Disconnected');
                this.stopPingInterval();
                this.attemptReconnect(url);
            };
        });
    }

    private attemptReconnect(url: string): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`[WS] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => {
                this.connect(url).catch(() => {
                    console.log('[WS] Reconnection attempt failed');
                });
            }, this.reconnectDelay);
        } else {
            console.error('[WS] Max reconnection attempts reached');
        }
    }

    private startPingInterval(): void {
        this.pingInterval = window.setInterval(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({type: 'PING'}));
            }
        }, 30000);
    }

    private stopPingInterval(): void {
        if (this.pingInterval !== null) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    private initializeListeners(): void {
        if (!this.socket) return;

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                switch (data.type) {
                    case 'SPIN_RESULT': {
                        this.eventBus.emit(EventType.NETWORK_RESULT_RECEIVED, data.payload);
                        break;
                    }
                    case 'INITIAL_BALANCE': {
                        this.eventBus.emit(EventType.INITIAL_BALANCE_RECEIVED, data.payload.balance);
                        break;
                    }
                    case 'PONG':
                        break;
                    default:
                        throw new Error('Unknown event type');
                }
            } catch (error) {
                console.error('[WS] Error parsing message:', error);
            }
        };
    }

    public sendSpinRequest(payload: ISpinRequestPayload): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'SPIN_REQUEST',
                payload
            }));
        } else {
            console.error('[WS] Cannot send message: socket not connected');
        }
    }
}
