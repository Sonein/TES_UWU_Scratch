import { Sprite, type SpriteData } from "./Sprite"

export class Runtime {
    private sprites: Map<string, Sprite> = new Map();
    private selectedSpriteId: string | null = null;
    onSpriteSelected?: (sprite: Sprite | null) => void;

    addSprite(data: SpriteData): Sprite {
        const sprite = new Sprite(data);
        this.sprites.set(sprite.data.id, sprite);
        if(!this.selectedSpriteId) {
            this.selectedSpriteId = sprite.data.id;
        }
        return sprite;
    }

    removeSprite(id: string): void {
        this.sprites.delete(id);
        if (this.selectedSpriteId === id) {
            this.selectedSpriteId = null;
        }
    }

    getSprite(id: string): Sprite | undefined {
        return this.sprites.get(id);
    }

    getAllSprites(): Sprite[] {
        return Array.from(this.sprites.values());
    }

    getSelectedSprite(): Sprite | null {
        if (!this.selectedSpriteId) {
            return null;
        }

        return this.sprites.get(this.selectedSpriteId) || null;
    }

    selectSprite(id: string): void {
        if (!this.sprites.has(id)) {
            return;
        }
        this.selectedSpriteId = id;
        if (this.onSpriteSelected) {
            this.onSpriteSelected(this.getSelectedSprite());
        }
    }

    clear(): void {
        this.sprites.clear();
    }
}