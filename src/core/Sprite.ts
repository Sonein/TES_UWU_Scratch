interface Costume {
    name: string;
    image: string;
}

export interface SpriteData {

    id: string;

    name: string;

    x: number;
    y: number;

    rotation: number;
    scale: number;

    visible: boolean;

    costumes: Costume[];
    currentCostume: number;

    program?: any;
}

export class Sprite {

    data: SpriteData;

    constructor(data: SpriteData) {
        this.data = data;
    }

    setPosition(x: number, y: number) {
        this.data.x = x;
        this.data.y = y;
    }

    setRotation(rotation: number) {
        this.data.rotation = rotation;
    }

    nextCostume() {

        this.data.currentCostume++;

        if (this.data.currentCostume >= this.data.costumes.length) {
            this.data.currentCostume = 0;
        }
    }

    getCurrentCostume(): string {
        return this.data.costumes[this.data.currentCostume].image;
    }

}