import { create } from 'zustand';
import { GameState } from '../types/enums';

interface GameStore {
    gameState: GameState;
    balance: number;
    isGameReady: boolean;
    win: number;
    actions: {
        setGameReady: (isReady: boolean) => void;
        initBalance: (balance: number) => void;
        setWin: (win: number) => void;
        clearWin: () => void;
    };
}

export const useGameStore = create<GameStore>((set) => ({
    gameState: GameState.IDLE,
    balance: 0,
    isGameReady: false,
    win: 0,
    actions: {
        setGameReady: (isReady) => set({ isGameReady: isReady }),
        initBalance: (balance) => set({ balance }),
        setWin: (win) => set({ win }),
        clearWin: () => set({ win: 0 }),
    },
}));
