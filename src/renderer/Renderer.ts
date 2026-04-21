import * as PIXI from "pixi.js"
import { SpriteView } from "./SpriteView"
import { Sprite } from "../core/Sprite"

export class Renderer {

    app!: PIXI.Application;
    stageContainer!: PIXI.Container;
    htmlContainer: HTMLElement;

    private spriteViews: Map<string, SpriteView> = new Map();
    private backgroundSprite!: PIXI.Sprite;
    private backgroundImage: string | null = null;

    constructor(container: HTMLElement) {
        this.htmlContainer = container;
    }

    async initialize() {
        this.app = new PIXI.Application();

        await this.app.init({
            resizeTo: this.htmlContainer,
            background: "#ffffff",
            antialias: true
        })

        this.htmlContainer.appendChild(this.app.canvas);
        this.stageContainer = new PIXI.Container();

        this.backgroundSprite = new PIXI.Sprite();
        this.backgroundSprite.pivot.set(this.backgroundSprite.width/2, this.backgroundSprite.height/2);
        this.backgroundSprite.x = 0;
        this.backgroundSprite.y = 0;

        this.app.stage.addChild(this.backgroundSprite);
        this.app.stage.addChild(this.stageContainer);
        this.app.ticker.add(() => {
            this.update();
        });
    }

    async addSprite(sprite: Sprite, onClick?: (sprite: Sprite) => void, canDrag?: () => boolean) {
        const view = new SpriteView(sprite);
        await view.initialize();
        view.onClick = onClick;
        view.canDrag = canDrag;
        this.stageContainer.addChild(view.pixiSprite);
        this.spriteViews.set(sprite.data.id, view);

        return view;
    }

    removeSprite(spriteId: string) {
        const view = this.spriteViews.get(spriteId);
        if(!view) return;
        this.stageContainer.removeChild(view.pixiSprite);
        view.pixiSprite.destroy();
        this.spriteViews.delete(spriteId);
    }

    getSpriteView(spriteId: string) {
        return this.spriteViews.get(spriteId);
    }

    syncSprite(sprite: Sprite) {
        const view = this.spriteViews.get(sprite.data.id);
        if (!view) return;
        view.syncFromSprite();
    }

    private update() {
        for (const view of this.spriteViews.values()) {
            view.syncFromSprite();
        }
    }

    async setBackground(image: string) {
        this.backgroundSprite.texture = await PIXI.Assets.load(image);
        this.backgroundImage = image;
        const ratio = this.app.renderer.height/this.backgroundSprite.height;
        const w = this.backgroundSprite.width;
        const h = this.backgroundSprite.height;
        this.backgroundSprite.width = w*ratio;
        this.backgroundSprite.height = h*ratio;
    }

    getBackground() {
        return this.backgroundImage;
    }

    removeBackground() {
        if (this.backgroundImage) {
            PIXI.Assets.unload(this.backgroundImage);
        }

        this.backgroundSprite.texture = PIXI.Texture.EMPTY;
        this.backgroundImage = null;
    }

    setSelectedSprite(spriteId: string | null) {

        for (const [id, view] of this.spriteViews) {
            view.setSelected(id === spriteId)
        }

    }
}