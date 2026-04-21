import { Sprite } from "../core/Sprite.ts";

export class SpriteInspector {
    container: HTMLElement;
    sprite: Sprite | null = null;
    onEditCostumes?: (sprite: Sprite) => void;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    showSprite(sprite: Sprite | null): void {
        this.sprite = sprite;
        this.container.innerHTML = "";

        if (!sprite) {
            return
        }

        const data = sprite.data;

        const name = document.createElement("input")
        name.value = data.name;

        const x = document.createElement("input");
        x.type = "number";
        x.value = data.x.toString();

        const y = document.createElement("input");
        y.type = "number";
        y.value = data.y.toString();

        const rotation = document.createElement("input");
        rotation.type = "number";
        rotation.value = data.rotation.toString();

        const scale = document.createElement("input");
        scale.type = "number";
        scale.step = "0.1";
        scale.value = data.scale.toString();

        const visible = document.createElement("input");
        visible.type = "checkbox";
        visible.checked = data.visible;

        const costumeInput = document.createElement("button");
        costumeInput.textContent = "Edit Costumes";

        this.container.append("Name:", name);
        this.container.append("X:", x);
        this.container.append("Y:", y);
        this.container.append("Rotation:", rotation);
        this.container.append("Scale:", scale);
        this.container.append("Visible:", visible);
        this.container.append("Costumes:", costumeInput)

        name.oninput = () => data.name = name.value;
        x.oninput = () => data.x = Number(x.value);
        y.oninput = () => data.y = Number(y.value);
        rotation.oninput = () => data.rotation = Number(rotation.value);
        scale.oninput = () => data.scale = Number(scale.value);
        visible.onchange = () => data.visible = visible.checked;
        costumeInput.onclick = () => {
            this.onEditCostumes?.(sprite)
        };
    }
}