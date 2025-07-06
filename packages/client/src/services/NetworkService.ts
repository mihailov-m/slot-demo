import { SocketService } from './SocketService';
import { ISpinRequestPayload } from 'shared/types';

export class NetworkService {
    constructor(private readonly socketService: SocketService) {}

    public async connect(url: string): Promise<void> {
        return this.socketService.connect(url);
    }

    public sendSpinRequest(payload: ISpinRequestPayload): void {
        this.socketService.sendSpinRequest(payload);
    }
}