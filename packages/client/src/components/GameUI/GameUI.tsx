import React, {useRef} from 'react';
import {useGame} from '../../hooks/useGame';
import {SpinButton} from '../SpinButton/SpinButton';
import {useGameStore} from '../../state/store';
import {LoadingScreen} from '../LoadingScreen/LoadingScreen';
import {gameConfig} from '../../config';
import styles from './GameUI.module.css';

export const GameUI: React.FC = () => {
    const gameContainerRef = useRef<HTMLDivElement>(null);
    useGame(gameContainerRef);
    const balance = useGameStore((state) => state.balance);
    const lastSpinWin = useGameStore((state) => state.win);
    const isGameReady = useGameStore((state) => state.isGameReady);

    return (
        <div className={styles.gameWrapper}>
            <div ref={gameContainerRef} className={styles.gameContainer}/>
            {isGameReady && <div className={styles.uiContainer}>
              <div className={styles.infoDisplay}>
                Balance: ${balance}
              </div>
              <div className={styles.infoDisplay}>
                Bet: ${gameConfig.BET_AMOUNT}
              </div>
              <div className={styles.infoDisplay}>
                Win: {lastSpinWin > 0 ? `$${lastSpinWin}` : ''}
              </div>
              <SpinButton/>
            </div>}
            {!isGameReady && <LoadingScreen/>}
        </div>
    );
};
