import * as PIXI from "pixi.js"
import { Sprite } from "../core/Sprite"
//import { GlowFilter } from '@pixi/filter-glow';

export class SpriteView {

    sprite: Sprite;
    pixiSprite!: PIXI.Sprite;

    onClick?: (sprite: Sprite) => void;
    canDrag?: () => boolean;

    private dragging = false;
    private lastCostumeIndex = -1
    private outline!: PIXI.Graphics;
    private isSelected = false;

    constructor(sprite: Sprite) {
        this.sprite = sprite;
    }

    async initialize() {
        const texture = await PIXI.Assets.load(this.sprite.getCurrentCostume());
        this.pixiSprite = new PIXI.Sprite(texture);
        this.pixiSprite.eventMode = "static";
        this.pixiSprite.cursor = "pointer";
        this.outline = new PIXI.Graphics();
        this.outline.visible = false;
        /*this.outline.filters = [
            new GlowFilter({ distance: 15, outerStrength: 2 }),
            ];*/

        this.pixiSprite.addChild(this.outline)

        this.pixiSprite.on("pointerdown", () => {
            if (this.onClick) {
                this.onClick(this.sprite)
            }

            if (this.canDrag && !this.canDrag()) {
                return;
            }

            this.dragging = true;
        });

        this.pixiSprite.on("pointerup", () => {
            this.dragging = false;
        });

        this.pixiSprite.on("pointerupoutside", () => {
            this.dragging = false;
        });

        this.pixiSprite.on("pointermove", (event) => {
            if (!this.dragging) return;
            const position = event.global;
            this.sprite.setPosition(position.x, position.y);
        })

        this.syncFromSprite();
    }

    syncFromSprite() {
        const data = this.sprite.data;

        this.pixiSprite.x = data.x;
        this.pixiSprite.y = data.y;
        this.pixiSprite.scale.set(data.scale);
        this.pixiSprite.rotation = data.rotation * (Math.PI / 180);
        this.pixiSprite.visible = data.visible;

        if (this.lastCostumeIndex !== data.currentCostume) {
            this.lastCostumeIndex = data.currentCostume;
            const costume = data.costumes[data.currentCostume];

            PIXI.Assets.load(costume.image).then(texture => {
                this.pixiSprite.texture = texture;

                this.pixiSprite.pivot.set(
                    texture.width / 2,
                    texture.height / 2
                );
            });
        }

        if (this.isSelected) {
            this.drawOutline();
        }
    }

    updateCostume() {
        this.pixiSprite.texture = PIXI.Texture.from(this.sprite.getCurrentCostume());
    }

    setSelected(selected: boolean) {
        this.isSelected = selected
        this.outline.visible = selected

        if (selected) {
            this.drawOutline()
        }
    }

    private drawOutline() {
        this.outline.clear();
        const bounds = this.pixiSprite.getLocalBounds();
        this.outline.rect(
            bounds.x,
            bounds.y,
            bounds.width,
            bounds.height
        );
        this.outline.stroke({
            width: 3,
            color: 0xff69b4
        });

    }

    getCollisionRadius(): number {
        const texture = this.pixiSprite.texture;

        const w = texture.width * this.sprite.data.scale;
        const h = texture.height * this.sprite.data.scale;

        return Math.max(w, h) / 2;
    }

    containsPoint(x: number, y: number): boolean {
        const dx = x - this.sprite.data.x;
        const dy = y - this.sprite.data.y;
        const r = this.getCollisionRadius();

        return dx * dx + dy * dy <= r * r;
    }

    collidesWith(other: SpriteView): boolean {
        const dx = this.sprite.data.x - other.sprite.data.x;
        const dy = this.sprite.data.y - other.sprite.data.y;

        const r = this.getCollisionRadius() + other.getCollisionRadius();

        return dx * dx + dy * dy <= r * r;
    }

    touchesStageEdge(stageWidth: number, stageHeight: number): boolean {
        const r = this.getCollisionRadius();
        const data = this.sprite.data;

        return (
            data.x - r <= 0 ||
            data.x + r >= stageWidth ||
            data.y - r <= 0 ||
            data.y + r >= stageHeight
        );
    }

}