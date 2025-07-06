import {useEffect} from 'react';
import {GameController} from '../game/controllers/GameController';

export const useGame = (containerRef: React.RefObject<HTMLDivElement | null>) => {
    useEffect(() => {
        let gameController: GameController | null = null;

        if (containerRef.current) {
            gameController = new GameController();
            gameController.init(containerRef.current);
        }

        return () => {
            gameController?.destroy();
        };
    }, [containerRef]);
};
