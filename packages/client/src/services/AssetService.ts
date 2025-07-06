import {Assets, Texture} from 'pixi.js';

export class AssetService {
    public textures: Record<string, Texture> = {};

    constructor() {
    }

    public async loadAssets(): Promise<void> {
        const sheet = await Assets.load('/assets/sprsheet.json');
        this.textures = sheet.textures;
    }
}
