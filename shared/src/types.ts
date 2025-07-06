export interface IWinInfo {
  symbol: string;
  amount: number;
  positions: [number, number][];
}

export interface ISpinResult {
  reelGrid: string[][];
  financials: {
    totalWin: number;
    newBalance: number;
  };
  wins: IWinInfo[];
}

export interface ISpinRequestPayload {
  betAmount: number;
}