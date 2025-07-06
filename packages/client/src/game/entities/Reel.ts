import {Container, Ticker} from 'pixi.js';
import {gsap} from 'gsap';
import {gameConfig} from '../../config';
import {AssetService} from '../../services/AssetService';
import {Symbol} from './Symbol';
import {EventBus} from '../../utils/EventBus';
import {EventType} from '../../types/enums';

export interface SymbolSize {
    width: number;
    height: number;
}

export class Reel {
    public readonly container: Container;
    private readonly symbols: Symbol[] = [];
    private readonly assetService: AssetService;
    private readonly reelIndex: number;
    private readonly eventBus = EventBus.getInstance();
    private readonly ticker: Ticker;

    private symbolY: number[] = [];
    private symbolSize: SymbolSize = {width: 0, height: 0};
    private isSpinning: boolean = false;
    private spinTween: gsap.core.Tween | null = null;
    private stopTween: gsap.core.Timeline | null = null;
    private spinSpeed: number = 0;
    private finalSymbolsQueue: string[] = [];
    private placedFinalSymbols: boolean = false;
    private readonly updateSpinCallback: () => void;

    constructor(assetService: AssetService, reelIndex: number) {
        this.container = new Container();
        this.assetService = assetService;
        this.reelIndex = reelIndex;
        this.ticker = new Ticker();
        this.updateSpinCallback = () => this.updateSpin();
    }

    public init(): void {
    }

    public populate(initialSymbols: string[]) {
        this.container.removeChildren();
        this.symbols.length = 0;

        const textures = this.assetService.textures;
        const numSymbols = gameConfig.REELS.SYMBOLS + 1;
        for (let i = 0; i < numSymbols; i++) {
            const symbolId = initialSymbols[i ? (i - 1) : 0]
            // Row starts from -1 for the temp symbol
            const row = i - 1;
            const symbol = new Symbol(textures[symbolId], symbolId, row);
            this.symbols.push(symbol);
            this.container.addChild(symbol);
        }
        this.setSymbolPositionsAndSizes();
    }

    public updateLayout(symbolSize: SymbolSize, symbolY: number[]) {
        this.symbolSize = symbolSize;
        this.symbolY = symbolY;
        this.setSymbolPositionsAndSizes();
    }

    public spin(): void {
        if (this.isSpinning) return;

        for (const symbol of this.symbols) {
            symbol.resetWinHighlight();
        }

        this.isSpinning = true;
        this.spinSpeed = 0;
        this.finalSymbolsQueue = [];
        this.placedFinalSymbols = false;

        this.ticker.remove(this.updateSpinCallback);
        this.ticker.add(this.updateSpinCallback);
        this.ticker.start();

        if (this.spinTween) {
            this.spinTween.kill();
        }
        this.spinTween = gsap.to(this, {
            spinSpeed: gameConfig.REELS.SPIN_SPEED,
            duration: 0.5,
            ease: "power2.in"
        });
    }

    public beginStopping(finalSymbols: string[]): void {
        this.finalSymbolsQueue = [this.getRandomSymbolId(), ...finalSymbols];
        this.placedFinalSymbols = true;
    }

    public highlightWinningSymbols(rowIndices: number[]) {
        for (const rowIndex of rowIndices) {
            const symbol = this.symbols.find(s => s.row === rowIndex);
            if (symbol) {
                symbol.startWinAnimation();
            }
        }
    }

    public resetWinningHighlight() {
        for (const symbol of this.symbols) {
            symbol.resetWinHighlight();
        }
    }

    public destroy(): void {
        if (this.spinTween) {
            this.spinTween.kill();
            this.spinTween = null;
        }
        if (this.stopTween) {
            this.stopTween.kill();
            this.stopTween = null;
        }
        this.ticker.remove(this.updateSpinCallback);
        this.ticker.stop();
        this.ticker.destroy();
        for (const symbol of this.symbols) {
            symbol.destroy();
        }
        this.container.removeChildren();
        this.container.destroy();
        this.symbols.length = 0;
    }

    private stop(): void {
        if (!this.isSpinning) return;
        this.isSpinning = false;

        if (this.spinTween) {
            this.spinTween.kill();
            this.spinTween = null;
        }

        this.ticker.remove(this.updateSpinCallback);
        this.ticker.stop();

        if (this.stopTween) {
            this.stopTween.kill();
            this.stopTween = null;
        }

        this.stopTween = gsap.timeline()
            .to(this.symbols, {
                y: `+=30`,
                duration: 0.15,
                ease: "power3.out",
            })
            .to(this.symbols, {
                y: `-=30`,
                duration: 0.3,
                ease: "elastic.out(1.2,0.3)",
                onComplete: () => {
                    if (this.stopTween) {
                        this.stopTween.kill();
                        this.stopTween = null;
                    }
                    this.updateSymbolRows();
                    this.eventBus.emit(EventType.REEL_STOPPED, {reelIndex: this.reelIndex});
                }
            });
    }

    private setSymbolPositionsAndSizes(): void {
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            symbol.width = this.symbolSize.width;
            symbol.height = this.symbolSize.height;
            symbol.setOriginalSize(this.symbolSize.width, this.symbolSize.height);
            symbol.position.set(0, this.symbolY[i]);
        }
    }

    private updateSymbolRows(): void {
        const sortedSymbols = [...this.symbols].sort((a, b) => a.y - b.y);
        for (let i = 0; i < sortedSymbols.length; i++) {
            sortedSymbols[i].row = i - 1;
        }
    }

    private getRandomSymbolId(): string {
        const symbolsList = gameConfig.REELS.SYMBOLS_LIST;
        const randomIndex = Math.floor(Math.random() * symbolsList.length);
        return symbolsList[randomIndex];
    }

    private updateSpin(): void {
        if (!this.isSpinning) return;

        const fullHeight = this.symbolSize.height + gameConfig.REELS.SYMBOL_PADDING;
        const maxY = gameConfig.REELS.SYMBOLS * fullHeight;

        for (const symbol of this.symbols) {
            symbol.y += this.spinSpeed * this.ticker.deltaMS;
            if (symbol.y > maxY) {
                let nextSymbolId = ''

                if (this.placedFinalSymbols) {
                    const queueLength = this.finalSymbolsQueue.length;
                    if (queueLength) {
                        nextSymbolId = <string>this.finalSymbolsQueue.pop();
                    }
                    if (queueLength === 1) {
                        this.stop();
                    }
                } else {
                    nextSymbolId = this.getRandomSymbolId();
                }

                symbol.y -= (gameConfig.REELS.SYMBOLS + 1) * fullHeight;
                symbol.texture = this.assetService.textures[nextSymbolId];
                symbol.symbolId = nextSymbolId;
            }
        }
    }
}
