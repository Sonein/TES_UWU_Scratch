import { Sprite } from "../core/Sprite.ts";

export class CostumesManager {

    container: HTMLElement;
    sprite: Sprite | null = null;

    constructor() {
        this.container = document.createElement("div")
        this.container.style.position = "fixed"
        this.container.style.top = "50%"
        this.container.style.left = "50%"
        this.container.style.transform = "translate(-50%, -50%)"
        this.container.style.background = "#ffd6df"
        this.container.style.border = "4px solid #c86b8b"
        this.container.style.padding = "20px"
        this.container.style.display = "none"

        document.body.appendChild(this.container)
    }

    open(sprite: Sprite): void {
        this.sprite = sprite;
        this.container.style.display = "block";

        this.render();
    }

    close() {
        this.container.style.display = "none";
    }

    render(): void {
        if (!this.sprite) return;

        const sprite = this.sprite;

        this.container.innerHTML = "";

        const title = document.createElement("h3");
        title.textContent = "Costume Manager";

        const closeBtn = document.createElement("button");
        closeBtn.textContent = "Close";
        closeBtn.onclick = () => this.close();

        const addBtn = document.createElement("button");
        addBtn.textContent = "Add Costume";
        addBtn.onclick = () => this.importCostume();

        this.container.append(title, closeBtn, addBtn);

        const list = document.createElement("div");

        sprite.data.costumes.forEach((costume,index) => {

            const item = document.createElement("div");

            const img = document.createElement("img");
            img.src = costume.image;
            img.width = 80;

            const selectBtn = document.createElement("button");
            selectBtn.textContent = "Use";

            selectBtn.onclick = () => {
                sprite.data.currentCostume = index;
            };

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";

            deleteBtn.onclick = () => {
                sprite.data.costumes.splice(index, 1);

                if (sprite.data.currentCostume >= sprite.data.costumes.length) {
                    sprite.data.currentCostume = 0;
                }

                this.render();
            };

            item.append(img, selectBtn, deleteBtn);
            list.appendChild(item);
        });

        this.container.appendChild(list);
    }

    private importCostume(): void {
        if (!this.sprite) return;

        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) return;
            const reader = new FileReader();

            reader.onload = () => {
                this.sprite!.data.costumes.push({
                    name: file.name,
                    image: reader.result as string
                });
                this.render();
            }

            reader.readAsDataURL(file);

        };

        input.click();
    }
}