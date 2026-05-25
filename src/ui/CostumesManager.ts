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
        closeBtn.type = "button";

        closeBtn.style.width = "40px";
        closeBtn.style.height = "40px";
        closeBtn.style.padding = "0";
        closeBtn.style.border = "none";
        closeBtn.style.background = "transparent";
        closeBtn.style.cursor = "pointer";

        const closeImg = document.createElement("img");
        closeImg.src = "/assets/close/close.gif"; //path
        closeImg.width = 40;
        closeImg.height = 40;
        closeImg.draggable = false;
        closeImg.style.pointerEvents = "none";

        closeBtn.appendChild(closeImg);

        closeBtn.onclick = () => this.close();

        const addBtn = document.createElement("button");
        addBtn.type = "button";

        addBtn.style.width = "40px";
        addBtn.style.height = "40px";
        addBtn.style.padding = "0";
        addBtn.style.border = "none";
        addBtn.style.background = "transparent";
        addBtn.style.cursor = "pointer";

        const addImg = document.createElement("img");
        addImg.src = "/assets/costadd/ca.gif";
        addImg.width = 40;
        addImg.height = 40;
        addImg.draggable = false;
        addImg.style.pointerEvents = "none";
        addBtn.appendChild(addImg);

        addBtn.onclick = () => this.importCostume();

        this.container.append(title, closeBtn, addBtn);

        const list = document.createElement("div");

        sprite.data.costumes.forEach((costume,index) => {

            const item = document.createElement("div");

            const img = document.createElement("img");
            img.src = costume.image;
            img.width = 80;

            const selectBtn = document.createElement("button");
            selectBtn.type = "button";
            selectBtn.style.width = "40px";
            selectBtn.style.height = "40px";
            selectBtn.style.padding = "0";
            selectBtn.style.border = "none";
            selectBtn.style.background = "transparent";
            selectBtn.style.cursor = "pointer";

            const selectImg = document.createElement("img");
            selectImg.src = "/assets/use/use.gif";
            selectImg.width = 40;
            selectImg.height = 40;
            selectImg.draggable = false;
            selectImg.style.pointerEvents = "none";
            selectBtn.appendChild(selectImg);

            selectBtn.onclick = () => {
                sprite.data.currentCostume = index;
            };

            const deleteBtn = document.createElement("button");
            deleteBtn.type = "button";
            deleteBtn.style.width = "40px";
            deleteBtn.style.height = "40px";
            deleteBtn.style.padding = "0";
            deleteBtn.style.border = "none";
            deleteBtn.style.background = "transparent";
            deleteBtn.style.cursor = "pointer";
            deleteBtn.disabled = sprite.data.costumes.length <= 1;

            const deleteImg = document.createElement("img");
            if (deleteBtn.disabled) {
                deleteImg.src = "/assets/costdel/cd1.png";
            } else {
                deleteImg.src = "/assets/costdel/cd.gif";
            }
            deleteImg.width = 40;
            deleteImg.height = 40;
            deleteImg.draggable = false;
            deleteImg.style.pointerEvents = "none";
            deleteBtn.appendChild(deleteImg);

            deleteBtn.onclick = () => {
                if (!this.sprite) return;
                const costumes = this.sprite.data.costumes;

                if (costumes.length <= 1) {
                    return;
                }

                const current = this.sprite.data.currentCostume;

                costumes.splice(index, 1);

                if (index < current) {
                    this.sprite.data.currentCostume = current - 1;
                }
                else if (index === current) {
                    this.sprite.data.currentCostume = Math.min(
                        index,
                        costumes.length - 1
                    );
                }

                this.sprite.data.currentCostume = Math.max(
                    0,
                    Math.min(
                        this.sprite.data.currentCostume,
                        costumes.length - 1
                    )
                );

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