import {Renderer} from "../renderer/Renderer.ts"
import {Runtime} from "../core/Runtime.ts";
import {EditorTool} from "./EditorTool.ts";
import type {Sprite} from "../core/Sprite.ts";
import {generateId} from "../core/IdGenerator.ts";
import { SpriteInspector } from "./SpriteInspector";
import { CostumesManager } from "./CostumesManager.ts";
import { BlocklyWorkspace } from "../blocks/BlocklyWorkspace";
import { registerBlocks } from "../blocks/blockDefinitions";
import { runProgram } from "../blocks/blockExecution.ts";
import { ExecutionController } from "../scripting/ExecutionController.ts";
import { FieldRectPicker } from "../blocks/FieldRectPicker";
import { FieldCostumePicker } from "../blocks/FieldCostumePicker";
import { FieldSpriteDropdown } from "../blocks/FieldSpriteDropdown";
import type {ExecutionEnvironment} from "../blocks/blockExecution.ts";

type ToolbarImageSet = {
    normal: string;
    active?: string;
    disabled?: string;
};

type ToolbarImageButton = {
    button: HTMLButtonElement;
    img: HTMLImageElement;
    images: ToolbarImageSet;
    tool?: EditorTool;
};

export class EditorLayout {

    toolbar: HTMLElement;
    blockPanel: HTMLElement;
    stage: HTMLElement;
    blockly!: BlocklyWorkspace;

    renderer!: Renderer;
    runtime!: Runtime;
    inspector!: SpriteInspector;
    costumesManager!: CostumesManager;

    private activeTool: EditorTool = EditorTool.SELECT;
    private toolButtons: Map<EditorTool, HTMLButtonElement> = new Map();
    private toolbarActionButtons: HTMLButtonElement[] = [];
    private toolbarImageButtons: ToolbarImageButton[] = [];
    private runButton!: HTMLButtonElement;
    private stopButton!: HTMLButtonElement;
    private currentProgramSprite: Sprite | null = null;
    private preExecutionProject: any | null = null;
    private executionController: ExecutionController | null = null;
    private lastMouseX = 0;
    private lastMouseY = 0;

    constructor() {

        const toolbar = document.getElementById("toolbar");
        const blockPanel = document.getElementById("block-panel");
        const stage = document.getElementById("stage-inner");

        if (!toolbar || !blockPanel || !stage) {
            throw new Error("Layout panels not found in DOM");
        }

        this.toolbar = toolbar;
        this.blockPanel = blockPanel;
        this.stage = stage;

        FieldRectPicker.configure(this.stage);
    }

    async initialize() {

        this.setupToolbar();
        this.renderer = new Renderer(this.stage);

        await this.renderer.initialize();
        this.runtime = new Runtime();

        this.costumesManager = new CostumesManager();

        const inspectorElement = document.getElementById("inspector")!;
        this.inspector = new SpriteInspector(inspectorElement);
        this.inspector.onEditCostumes = (sprite) => {
            this.costumesManager.open(sprite);
        };

        this.runtime.onSpriteSelected = (s) => {
            if (this.currentProgramSprite) {
                this.currentProgramSprite.data.program = this.blockly.save();
            }

            this.currentProgramSprite = s;

            if (s) {
                this.blockly.load(s.data.program);
            } else {
                this.blockly.load(null);
            }

            this.inspector.showSprite(s);
            this.renderer.setSelectedSprite(
                s ? s.data.id : null
            );
        };

        FieldSpriteDropdown.configure(() => this.runtime.getAllSprites());

        //await this.testObject();
        registerBlocks();
        this.blockly = new BlocklyWorkspace(this.blockPanel);
        this.blockly.initialize();
        FieldCostumePicker.configure(() => this.runtime.getSelectedSprite());

        this.setupKeyboardEvents();
        this.stage.addEventListener("pointermove", (event) => {
            const rect = this.stage.getBoundingClientRect();
            this.lastMouseX = event.clientX - rect.left;
            this.lastMouseY = event.clientY - rect.top;
        });

        console.log("Renderer initialized");
    }

    private registerToolbarButton(button: HTMLButtonElement) {
        this.toolbarActionButtons.push(button);
        return button;
    }

    private createToolbarImageButton(
        images: ToolbarImageSet,
        onClick: () => void,
        tool?: EditorTool
    ): HTMLButtonElement {
        const button = document.createElement("button");
        button.type = "button";

        button.style.height = "60px";
        button.style.width = "60px";
        button.style.padding = "0";
        button.style.border = "none";
        button.style.background = "transparent";
        button.style.cursor = "pointer";

        const img = document.createElement("img");
        img.src = images.normal;
        img.width = 60;
        img.height = 60;
        img.draggable = false;
        img.style.pointerEvents = "none";

        button.appendChild(img);
        button.onclick = onClick;

        this.toolbarImageButtons.push({
            button,
            img,
            images,
            tool
        });

        return button;
    }

    private setupToolbar() {

        //duplicate
        const dupeBtn = this.registerToolbarButton(
            this.createToolbarImageButton(
                {
                    normal: "/assets/dupe/dupe.gif",
                    active: "/assets/dupe/dupe1.png",
                    disabled: "/assets/dupe/dupeb.png"
                },
                () => this.setActiveTool(EditorTool.DUPLICATE),
                EditorTool.DUPLICATE
            )
        );
        this.toolbar.appendChild(dupeBtn);
        this.toolButtons.set(EditorTool.DUPLICATE, dupeBtn);

        //delete
        const delBtn = this.registerToolbarButton(this.createToolbarImageButton(
            {
                normal: "/assets/del/delete.gif",
                active: "/assets/del/delete1.png",
                disabled: "/assets/del/deleteb.png"
            },
            () => {
                this.setActiveTool(EditorTool.DELETE);
            },
            EditorTool.DELETE
        ));
        this.toolbar.appendChild(delBtn);
        this.toolButtons.set(EditorTool.DELETE, delBtn);

        //import
        const importBtn = this.registerToolbarButton(this.createToolbarImageButton(
            {
                normal: "/assets/is/is.gif",
                active: "/assets/is/is1.png",
                disabled: "/assets/is/isb.png"
            },
            () => this.importSprite()
        ));
        this.toolbar.appendChild(importBtn);

        //bg
        const bgBtn = this.registerToolbarButton(this.createToolbarImageButton(
            {
                normal: "/assets/ib/ib.gif",
                active: "/assets/ib/ib1.png",
                disabled: "/assets/ib/ibb.png"
            },
            () => this.changeBackground()
        ));
        this.toolbar.appendChild(bgBtn);

        //save
        const saveBtn = this.registerToolbarButton(this.createToolbarImageButton(
            {
                normal: "/assets/save/save.gif",
                active: "/assets/save/save1.png",
                disabled: "/assets/save/saveb.png"
            },
            () => this.saveProject()
        ));
        this.toolbar.appendChild(saveBtn);

        //load
        const loadBtn = this.registerToolbarButton(this.createToolbarImageButton(
            {
                normal: "/assets/load/load.gif",
                active: "/assets/load/load1.png",
                disabled: "/assets/load/loadb.png"
            },
            () => this.loadProject()
        ));
        this.toolbar.appendChild(loadBtn);

        //clear trash
        const clearTrashBtn = this.registerToolbarButton(this.createToolbarImageButton(
            {
                normal: "/assets/trash/trash.gif",
                active: "/assets/trash/trash1.png",
                disabled: "/assets/trash/trashb.png"
            },
            () => this.clearTrashcan()
        ));
        this.toolbar.appendChild(clearTrashBtn);

        //run
        this.runButton = this.createToolbarImageButton(
            {
                normal: "/assets/run/run.gif",
                active: "/assets/run/run1.png",
                disabled: "/assets/run/runb.png"
            },
            () => this.runPrograms()
        );
        this.toolbar.appendChild(this.runButton);

        //stop
        this.stopButton = this.createToolbarImageButton(
            {
                normal: "/assets/stop/stop.gif",
                active: "/assets/stop/stop1.png",
                disabled: "/assets/stop/stopb.png"
            },
            () => this.stopPrograms()
        );
        this.stopButton.disabled = true;
        this.toolbar.appendChild(this.stopButton);

        this.updateToolbarButtonImages();
    }

    private async onSpriteClicked(sprite: Sprite) {
        if (this.activeTool === EditorTool.RUNNING) {
            await this.runSingleSpriteEvent(sprite, "start_clicked");
            return;
        }

        if (this.activeTool === EditorTool.SELECT) {
            this.runtime.selectSprite(sprite.data.id);
            return;
        }

        if (this.activeTool === EditorTool.DUPLICATE) {
            const data = sprite.data;

            const newSprite = this.runtime.addSprite({
                id: "sprite-" + Math.random(),
                name: data.name + "_copy",
                x: data.x + 40,
                y: data.y + 40,
                rotation: data.rotation,
                scale: data.scale,
                visible: data.visible,
                costumes: structuredClone(data.costumes),
                currentCostume: data.currentCostume,
                program: structuredClone(data.program),
                bounceOnEdge: data.bounceOnEdge
            });

            await this.renderer.addSprite(
                newSprite,
                (s) => this.onSpriteClicked(s),
                () => this.activeTool === EditorTool.SELECT
            );

            return;
        }

        if (this.activeTool === EditorTool.DELETE) {
            const id = sprite.data.id;
            this.runtime.removeSprite(id);
            this.renderer.removeSprite(id);
            return;
        }

        if (this.activeTool === EditorTool.PROGRAM) {
            this.runtime.selectSprite(sprite.data.id);
            return;
        }
    }

    private setActiveTool(tool: EditorTool) {
        if (this.activeTool === EditorTool.RUNNING) {
            return;
        }

        if (this.activeTool === tool) {
            this.activeTool = EditorTool.SELECT;
        } else {
            this.activeTool = tool;
        }

        this.updateToolbarStyles();
        this.updateInspectorVisibility();
    }

    private setupKeyboardEvents() {
        window.addEventListener("keydown", async (event) => {
            if (this.activeTool !== EditorTool.RUNNING) {
                return;
            }

            if (!this.executionController) {
                return;
            }
            const environment = this.createExecutionEnvironment();
            const promises = this.runtime.getAllSprites().map(sprite =>
                runProgram(sprite, this.executionController!, "start_key_pressed", {
                    keyCode: event.code
                }, environment)
            );

            await Promise.all(promises);
        });
    }

    private async importSprite() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = async () => {
            const file = input.files?.[0]
            if (!file) return;
            const reader = new FileReader();
            reader.onloadend = async () => {
                const imageData = reader.result as string;

                const sprite = this.runtime.addSprite({
                    id: generateId(),
                    name: file.name,
                    x: 100,
                    y: 100,
                    rotation: 0,
                    scale: 1,
                    visible: true,
                    costumes: [{
                        name: file.name,
                        image: imageData
                    }],
                    currentCostume: 0,
                    bounceOnEdge: false
                });

                await this.renderer.addSprite(sprite,
                    (s) => this.onSpriteClicked(s),
                    () => this.activeTool === EditorTool.SELECT);
            }

            reader.readAsDataURL(file);
        }

        input.click();
    }

    private updateToolbarButtonImages() {
        for (const entry of this.toolbarImageButtons) {
            const { button, img, images, tool } = entry;

            if (button.disabled && images.disabled) {
                img.src = images.disabled;
            } else if (tool && this.activeTool === tool && images.active) {
                img.src = images.active;
            } else {
                img.src = images.normal;
            }

            button.style.cursor = button.disabled ? "not-allowed" : "pointer";
        }
    }

    private updateToolbarStyles() {
        for (const [, button] of this.toolButtons) {
            button.style.background = "transparent";
        }

        this.updateToolbarButtonImages();
    }

    private updateInspectorVisibility() {
        if (this.activeTool === EditorTool.SELECT) {
            this.inspector.container.style.display = "flex";
        } else {
            this.inspector.container.style.display = "none";
        }
    }

    private setBlocklyLocked(locked: boolean) {
        this.blockPanel.style.pointerEvents = locked ? "none" : "auto";
        this.blockPanel.style.opacity = locked ? "0.85" : "1";
    }

    private setToolbarLocked(locked: boolean) {
        for (const button of this.toolbarActionButtons) {
            button.disabled = locked;
        }

        if (this.runButton) {
            this.runButton.disabled = locked;
        }

        if (this.stopButton) {
            this.stopButton.disabled = !locked;
        }

        this.updateToolbarButtonImages();
    }

    private async runSingleSpriteEvent(sprite: Sprite, starterType: string, eventData?: any) {
        if (this.activeTool !== EditorTool.RUNNING) return;
        if (!this.executionController) return;
        const environment = this.createExecutionEnvironment();
        await runProgram(sprite, this.executionController, starterType, eventData, environment);
    }

    private changeBackground() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) return;
            const reader = new FileReader();

            reader.onloadend = async () => {
                await this.renderer.setBackground(reader.result as string);
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }

    private saveProject(name = "project.json") {
        const project = {
            sprites: this.runtime.getAllSprites().map(sprite => sprite.data),
            background: this.renderer.getBackground()
        };

        //@TODO give saves images, very optional
        const json = JSON.stringify(project, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        a.click();
    }

    private async loadProjectData(project: any) {
        for (const sprite of this.runtime.getAllSprites()) {
            this.renderer.removeSprite(sprite.data.id);
        }

        this.runtime.clear();
        this.renderer.removeBackground();
        this.blockly.load(null);

        for (const spriteData of project.sprites) {
            const sprite = this.runtime.addSprite(structuredClone(spriteData));

            await this.renderer.addSprite(
                sprite,
                (s) => this.onSpriteClicked(s),
                () => this.activeTool === EditorTool.SELECT
            );
        }

        if (project.background) {
            await this.renderer.setBackground(project.background);
        }

        this.currentProgramSprite = null;
    }

    private loadProject() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            const text = await file.text();
            const project = JSON.parse(text);

            await this.loadProjectData(project);
        };

        input.click();
    }

    private async stopPrograms() {
        if (this.executionController) {
            this.executionController.stop();
        }

        if (this.preExecutionProject) {
            await this.loadProjectData(this.preExecutionProject);
            this.preExecutionProject = null;
        }

        this.executionController = null;

        this.activeTool = EditorTool.SELECT;

        this.setBlocklyLocked(false);
        this.setToolbarLocked(false);
        this.updateToolbarStyles();
        this.updateInspectorVisibility();
    }

    private saveCurrentProgram() {
        if (this.currentProgramSprite) {
            this.currentProgramSprite.data.program = this.blockly.save();
        }
    }

    private createProjectSnapshot() {
        this.saveCurrentProgram();

        return structuredClone({
            sprites: this.runtime.getAllSprites().map(sprite => sprite.data),
            background: this.renderer.getBackground()
        });
    }

    private async runPrograms() {
        if (this.executionController && !this.executionController.isStopped) {
            return;
        }

        this.saveCurrentProgram();

        this.runtime.clearSelection();
        this.inspector.showSprite(null);
        this.renderer.setSelectedSprite(null);
        this.currentProgramSprite = null;

        this.preExecutionProject = this.createProjectSnapshot();
        this.executionController = new ExecutionController();

        this.activeTool = EditorTool.RUNNING;
        this.setBlocklyLocked(true);
        this.setToolbarLocked(true);
        this.updateToolbarStyles();
        this.updateInspectorVisibility();

        this.saveProject("temp.json");

        try {
            const environment = this.createExecutionEnvironment();
            const promises = this.runtime.getAllSprites().map(sprite =>
                runProgram(
                    sprite,
                    this.executionController!,
                    "start",
                    undefined,
                    environment
                )
            );

            await Promise.all(promises);
        } catch {
            // stopped
        }
    }

    private clearTrashcan() {
        const trash = this.blockly.workspace.trashcan;
        if (!trash) return;
        trash.emptyContents()
    }

    private createExecutionEnvironment(): ExecutionEnvironment {
        return {
            stageWidth: this.stage.clientWidth,
            stageHeight: this.stage.clientHeight,
            mouseX: this.lastMouseX,
            mouseY: this.lastMouseY,

            getSpriteView: (spriteId: string) =>
                this.renderer.getSpriteView(spriteId),

            getAllSpriteViews: () =>
                this.renderer.getAllSpriteViews()
        };
    }
}