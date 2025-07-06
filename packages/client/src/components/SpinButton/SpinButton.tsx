import React from 'react';
import {useGameStore} from '../../state/store';
import {EventBus} from '../../utils/EventBus';
import {GameState, EventType} from '../../types/enums';
import styles from './SpinButton.module.css';

export const SpinButton: React.FC = () => {
    const gameState = useGameStore((state) => state.gameState);
    const isGameReady = useGameStore((state) => state.isGameReady);
    const isDisabled = gameState !== GameState.IDLE || !isGameReady;

    const handleClick = () => {
        if (!isDisabled) {
            EventBus.getInstance().emit(EventType.UI_SPIN_REQUESTED);
        }
    };

    return (
        <button className={styles.spinButton} onClick={handleClick} disabled={isDisabled}>
            {isGameReady ? 'SPIN' : 'LOADING...'}
        </button>
    );
};
