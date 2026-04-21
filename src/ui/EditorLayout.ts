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
    private runButton!: HTMLButtonElement;
    private stopButton!: HTMLButtonElement;
    private currentProgramSprite: Sprite | null = null;
    private preExecutionProject: any | null = null;
    private executionController: ExecutionController | null = null;

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

        //await this.testObject();
        registerBlocks();
        this.blockly = new BlocklyWorkspace(this.blockPanel);
        this.blockly.initialize();

        console.log("Renderer initialized");
    }

    private registerToolbarButton(button: HTMLButtonElement) {
        this.toolbarActionButtons.push(button);
        return button;
    }

    private setupToolbar() {

        //duplicate
        const dupeBtn = this.registerToolbarButton(document.createElement("button"));
        dupeBtn.textContent = "Duplicate";
        dupeBtn.onclick = () => {
            this.setActiveTool(EditorTool.DUPLICATE);
        };
        this.toolbar.appendChild(dupeBtn);
        this.toolButtons.set(EditorTool.DUPLICATE, dupeBtn);

        //delete
        const delBtn = this.registerToolbarButton(document.createElement("button"));
        delBtn.textContent = "Delete";
        delBtn.onclick = () => {
            this.setActiveTool(EditorTool.DELETE);
        };
        this.toolbar.appendChild(delBtn);
        this.toolButtons.set(EditorTool.DELETE, delBtn);

        //import
        const importBtn = this.registerToolbarButton(document.createElement("button"));
        importBtn.textContent = "Import Sprite";
        importBtn.onclick = () => this.importSprite()
        this.toolbar.appendChild(importBtn);

        //bg
        const bgBtn = this.registerToolbarButton(document.createElement("button"));
        bgBtn.textContent = "Background";
        bgBtn.onclick = () => this.changeBackground();
        this.toolbar.appendChild(bgBtn);

        //save
        const saveBtn = this.registerToolbarButton(document.createElement("button"));
        saveBtn.textContent = "Save";
        saveBtn.onclick = () => this.saveProject();
        this.toolbar.appendChild(saveBtn);

        //load
        const loadBtn = this.registerToolbarButton(document.createElement("button"));
        loadBtn.textContent = "Load";
        loadBtn.onclick = () => this.loadProject();
        this.toolbar.appendChild(loadBtn);

        //run
        this.runButton = document.createElement("button");
        this.runButton.textContent = "Run";
        this.runButton.onclick = () => this.runPrograms();
        this.toolbar.appendChild(this.runButton);

        //stop
        this.stopButton = document.createElement("button");
        this.stopButton.textContent = "Stop";
        this.stopButton.onclick = () => this.stopPrograms();
        this.stopButton.disabled = true;
        this.toolbar.appendChild(this.stopButton);
    }

    private async onSpriteClicked(sprite: Sprite) {
        if (this.activeTool === EditorTool.RUNNING) {
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
                program: structuredClone(data.program)
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
                    currentCostume: 0
                });

                await this.renderer.addSprite(sprite,
                    (s) => this.onSpriteClicked(s),
                    () => this.activeTool === EditorTool.SELECT);
            }

            reader.readAsDataURL(file);
        }

        input.click();
    }

    private updateToolbarStyles() {

        for (const [tool, button] of this.toolButtons) {

            if (tool === this.activeTool) {
                button.style.background = "#ff9bb5";
            } else {
                button.style.background = "";
            }

        }

    }

    private updateInspectorVisibility() {
        if (this.activeTool === EditorTool.SELECT) {
            this.inspector.container.style.display = "block";
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

        //@TODO give saves images
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

        if (!this.preExecutionProject) {
            return;
        }

        await this.loadProjectData(this.preExecutionProject);

        this.preExecutionProject = null;
        this.executionController = null;
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

    //@TODO fix selection box
    private async runPrograms() {
        if (this.executionController && !this.executionController.isStopped) {
            return;
        }

        this.preExecutionProject = this.createProjectSnapshot();
        this.executionController = new ExecutionController();

        const previousTool = this.activeTool;
        this.activeTool = EditorTool.RUNNING;
        this.setBlocklyLocked(true);
        this.setToolbarLocked(true);
        this.updateToolbarStyles();
        this.updateInspectorVisibility();

        this.saveProject("temp.json")

        try {
            const promises = this.runtime.getAllSprites().map(sprite =>
                runProgram(sprite, this.executionController!)
            );

            await Promise.all(promises);
        } catch (error) {
            //stopped
        } finally {
            this.executionController = null;
            this.activeTool = previousTool;
            this.setBlocklyLocked(false);
            this.setToolbarLocked(false);
            this.updateToolbarStyles();
            this.updateInspectorVisibility();
        }
    }
}