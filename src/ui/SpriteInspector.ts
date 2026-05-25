import { Sprite } from "../core/Sprite.ts";

export class SpriteInspector {
    container: HTMLElement;
    sprite: Sprite | null = null;
    onEditCostumes?: (sprite: Sprite) => void;

    constructor(container: HTMLElement) {
        this.container = container;
        this.container.style.display = "flex";
        this.container.style.alignItems = "center";
        this.container.style.gap = "8px";
        this.container.style.marginBottom = "6px";
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
        costumeInput.type = "button";

        costumeInput.style.height = "60px";
        costumeInput.style.width = "60px";
        costumeInput.style.padding = "0"
        costumeInput.style.border = "none";
        costumeInput.style.background = "transparent";
        costumeInput.style.cursor = "pointer";

        const costumeImg = document.createElement("img");
        costumeImg.src = "/assets/costadd/ca.gif";
        costumeImg.width = 60;
        costumeImg.height = 60;
        costumeImg.draggable = false;
        costumeImg.style.pointerEvents = "none";

        costumeInput.appendChild(costumeImg);

        this.container.append("Meno:", name);
        this.container.append("X:", x);
        this.container.append("Y:", y);
        this.container.append("Rotacia:", rotation);
        this.container.append("Velkost:", scale);
        this.container.append("Vididtelnost:", visible);
        this.container.append("Vyzory:", costumeInput)

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