import * as Blockly from "blockly";
import { Sprite } from "../core/Sprite";

export class FieldSpriteDropdown extends Blockly.FieldDropdown {
    static getSprites: (() => Sprite[]) | null = null;

    constructor() {
        super(() => {
            const sprites = FieldSpriteDropdown.getSprites?.() ?? [];

            if (sprites.length === 0) {
                return [["no sprites", ""]];
            }

            return sprites.map(sprite => [
                sprite.data.name,
                sprite.data.id
            ]);
        });
    }

    static configure(getSprites: () => Sprite[]) {
        FieldSpriteDropdown.getSprites = getSprites;
    }
}