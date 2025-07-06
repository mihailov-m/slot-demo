import React from 'react';
import styles from './LoadingScreen.module.css';

export const LoadingScreen: React.FC = () => {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.loadingContent}>
                <div className={styles.spinner}></div>
                <h2 className={styles.loadingText}>Loading Game...</h2>
                <p className={styles.loadingSubtext}>
                    Initializing PIXI and loading assets...
                </p>
            </div>
        </div>
    );
};