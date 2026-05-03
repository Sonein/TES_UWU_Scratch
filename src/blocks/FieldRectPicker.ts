import * as Blockly from "blockly";

export type RectSelection = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};

const DEFAULT_RECT: RectSelection = {
    x1: 50,
    y1: 50,
    x2: 200,
    y2: 200
};

export class FieldRectPicker extends Blockly.Field {
    static stageElement: HTMLElement | null = null;

    SERIALIZABLE = true;

    private rect?: RectSelection;

    constructor(value?: string) {
        super(value ?? "Select area");

        this.rect = this.parseRect(value);
        this.setValue(JSON.stringify(this.rect));
    }

    static configure(stageElement: HTMLElement) {
        FieldRectPicker.stageElement = stageElement;
    }

    private parseRect(value?: string | null): RectSelection {
        if (!value) {
            return { ...DEFAULT_RECT };
        }

        try {
            const parsed = JSON.parse(value);

            if (
                typeof parsed.x1 === "number" &&
                typeof parsed.y1 === "number" &&
                typeof parsed.x2 === "number" &&
                typeof parsed.y2 === "number"
            ) {
                return parsed;
            }
        } catch {
        }

        return { ...DEFAULT_RECT };
    }

    getValue(): string {
        return JSON.stringify(this.rect);
    }

    setValue(value: string) {
        try {
            this.rect = JSON.parse(value);
        } catch {
        }
        super.setValue(this.getText());
    }

    private getRect(): RectSelection {
        if (!this.rect) {
            this.rect = { ...DEFAULT_RECT };
        }

        return this.rect;
    }

    getText(): string {
        const rect = this.getRect();

        const x = Math.round(Math.min(rect.x1, rect.x2));
        const y = Math.round(Math.min(rect.y1, rect.y2));
        const w = Math.round(Math.abs(rect.x2 - rect.x1));
        const h = Math.round(Math.abs(rect.y2 - rect.y1));

        return `area ${x},${y} ${w}x${h}`;
    }

    protected showEditor_() {
        if (!FieldRectPicker.stageElement) return;

        const stage = FieldRectPicker.stageElement;
        const bounds = stage.getBoundingClientRect();

        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.left = `${bounds.left}px`;
        overlay.style.top = `${bounds.top}px`;
        overlay.style.width = `${bounds.width}px`;
        overlay.style.height = `${bounds.height}px`;
        overlay.style.background = "rgba(0,0,0,0.15)";
        overlay.style.cursor = "crosshair";
        overlay.style.zIndex = "9999";

        const box = document.createElement("div");
        box.style.position = "absolute";
        box.style.border = "3px solid #ff69b4";
        box.style.background = "rgba(255,105,180,0.2)";
        overlay.appendChild(box);

        let startX = 0;
        let startY = 0;

        overlay.onpointerdown = (event) => {
            startX = event.clientX - bounds.left;
            startY = event.clientY - bounds.top;

            box.style.left = `${startX}px`;
            box.style.top = `${startY}px`;
            box.style.width = "0px";
            box.style.height = "0px";

            overlay.setPointerCapture(event.pointerId);
        };

        overlay.onpointermove = (event) => {
            if (!(event.buttons & 1)) return;

            const currentX = event.clientX - bounds.left;
            const currentY = event.clientY - bounds.top;

            const x = Math.min(startX, currentX);
            const y = Math.min(startY, currentY);
            const w = Math.abs(currentX - startX);
            const h = Math.abs(currentY - startY);

            box.style.left = `${x}px`;
            box.style.top = `${y}px`;
            box.style.width = `${w}px`;
            box.style.height = `${h}px`;
        };

        overlay.onpointerup = (event) => {
            const endX = event.clientX - bounds.left;
            const endY = event.clientY - bounds.top;

            const rect: RectSelection = {
                x1: startX,
                y1: startY,
                x2: endX,
                y2: endY
            };

            this.setValue(JSON.stringify(rect));

            overlay.remove();
        };

        document.body.appendChild(overlay);
    }

}

Blockly.fieldRegistry.register("field_rect_picker", FieldRectPicker);

