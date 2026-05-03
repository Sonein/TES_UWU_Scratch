import * as Blockly from "blockly";
import { Sprite } from "../core/Sprite";

export class FieldCostumePicker extends Blockly.Field {
    SERIALIZABLE = true;

    static getSelectedSprite: (() => Sprite | null) | null = null;

    private costumeIndex = 0;

    constructor(value?: string) {
        super(value ?? "0");

        const parsed = Number(value);
        this.costumeIndex = Number.isFinite(parsed) ? parsed : 0;
        this.setValue(String(this.costumeIndex));
    }

    static configure(getSelectedSprite: () => Sprite | null) {
        FieldCostumePicker.getSelectedSprite = getSelectedSprite;
    }

    getValue(): string {
        return String(this.costumeIndex);
    }

    setValue(value: string) {
        const parsed = Number(value);
        this.costumeIndex = Number.isFinite(parsed) ? parsed : 0;

        super.setValue(String(this.costumeIndex));
    }

    getText(): string {
        return String(this.costumeIndex);
    }

    protected showEditor_() {
        const sprite = FieldCostumePicker.getSelectedSprite?.();
        if (!sprite) return;

        const modal = document.createElement("div");
        modal.style.position = "fixed";
        modal.style.top = "50%";
        modal.style.left = "50%";
        modal.style.transform = "translate(-50%, -50%)";
        modal.style.background = "#ffd6df";
        modal.style.border = "4px solid #c86b8b";
        modal.style.padding = "16px";
        modal.style.zIndex = "10000";
        modal.style.maxHeight = "70vh";
        modal.style.overflowY = "auto";

        const title = document.createElement("h3");
        title.textContent = `Select costume for ${sprite.data.name}`;

        const closeBtn = document.createElement("button");
        closeBtn.textContent = "Close";
        closeBtn.onclick = () => modal.remove();

        modal.append(title, closeBtn);

        const list = document.createElement("div");
        list.style.display = "grid";
        list.style.gridTemplateColumns = "repeat(auto-fill, 100px)";
        list.style.gap = "10px";
        list.style.marginTop = "12px";
        list.style.minWidth = "320px";

        sprite.data.costumes.forEach((costume, index) => {
            const item = document.createElement("button");
            item.type = "button";
            item.style.border = index === this.costumeIndex
                ? "4px solid #ff69b4"
                : "2px solid #c86b8b";
            item.style.background = "#fff";
            item.style.padding = "6px";
            item.style.cursor = "pointer";

            const img = document.createElement("img");
            img.src = costume.image;
            img.width = 80;
            img.height = 80;
            img.style.objectFit = "contain";
            img.style.display = "block";

            const label = document.createElement("div");
            label.textContent = String(index);

            item.append(img, label);

            item.onclick = () => {
                this.setValue(String(index));
                modal.remove();
            };

            list.appendChild(item);
        });

        modal.appendChild(list);
        document.body.appendChild(modal);
    }
}

Blockly.fieldRegistry.register("field_costume_picker", FieldCostumePicker);