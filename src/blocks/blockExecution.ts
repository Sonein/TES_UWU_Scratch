import type {Sprite} from "../core/Sprite.ts";
import * as Blockly from "blockly";
import {ExecutionController} from "../scripting/ExecutionController.ts";
import {SpriteView} from "../renderer/SpriteView.ts";

export type ExecutionEnvironment = {
    stageWidth: number;
    stageHeight: number;
    mouseX: number;
    mouseY: number;

    getSpriteView(spriteId: string): SpriteView | undefined;
    getAllSpriteViews(): SpriteView[];
};

export async function runProgram(sprite: Sprite, controller: ExecutionController, starterType = "start", eventData?: any, environment?: ExecutionEnvironment) {
    const program = sprite.data.program;
    if (!program) return;
    if (!environment) {
        throw new Error("ExecutionEnvironment is required");
    }
    const workspace = new Blockly.Workspace();
    console.log(environment);

    Blockly.serialization.workspaces.load(program, workspace);
    const blocks = workspace.getTopBlocks(true);

    for (const block of blocks) {
        controller.throwIfStopped();

        if (block.type !== starterType) continue;

        if (starterType === "start_key_pressed") {
            const wantedKey = block.getFieldValue("KEY");
            if (wantedKey !== eventData?.keyCode) continue;
        }

        await executeChain(block, sprite, controller, environment);
    }

    workspace.dispose();
}

async function executeChain(block: Blockly.Block, sprite: Sprite, controller: ExecutionController, environment: ExecutionEnvironment) {
    let current: Blockly.Block | null = block;

    while (current) {
        controller.throwIfStopped();
        await executeBlock(current, sprite, controller, environment);
        current = current.getNextBlock();
    }
}

async function executeSubChain(block: Blockly.Block | null, sprite: Sprite, controller: ExecutionController, environment: ExecutionEnvironment) {

    let current = block;

    while (current) {
        controller.throwIfStopped();
        await executeBlock(current, sprite, controller, environment);
        current = current.getNextBlock();
    }

}

async function executeBlock(block: Blockly.Block, sprite: Sprite, controller: ExecutionController, environment: ExecutionEnvironment) {
    switch (block.type) {
        case "move_forward": {
            const steps = getNumberInput(block, "STEPS");

            const radians = normalizeAngle(sprite.data.rotation) * Math.PI / 180;

            const dx = Math.sin(radians) * steps;
            const dy = -Math.cos(radians) * steps;

            sprite.setPosition(
                sprite.data.x + dx,
                sprite.data.y + dy
            );

            break;
        }

        case "turn_left": {
            const degrees = normalizeAngle(getNumberInput(block, "DEGREES"));

            sprite.setRotation(normalizeAngle(sprite.data.rotation - degrees));
            break;
        }

        case "turn_right": {
            const degrees = getNumberInput(block, "DEGREES");

            sprite.setRotation(normalizeAngle(sprite.data.rotation + degrees));
            break;
        }

        case "set_rotation": {
            const angle = Number(block.getFieldValue("ANGLE"));
            sprite.setRotation(angle);
            break;
        }

        case "jump_to_xy": {
            const x = getNumberInput(block, "X");
            const y = getNumberInput(block, "Y");

            sprite.setPosition(x, y);
            break;
        }

        case "next_costume": {
            sprite.nextCostume();
            break;
        }

        case "show": {
            sprite.data.visible = true;
            break;
        }

        case "hide": {
            sprite.data.visible = false;
            break;
        }

        case "glide_to_xy": {

            const targetX = getNumberInput(block, "X");
            const targetY = getNumberInput(block, "Y");
            const duration = getNumberInput(block, "TIME") * 1000;

            await glideTo(sprite, targetX, targetY, duration, controller);

            break;
        }

        case "wait": {
            const time = getNumberInput(block, "TIME");
            await sleep(time * 1000, controller);
            break;
        }

        case "repeat": {

            const times = getNumberInput(block, "TIMES");
            const body = block.getInputTargetBlock("DO");
            for (let i = 0; i < times; i++) {
                controller.throwIfStopped();
                if (body) {
                    await executeSubChain(body, sprite, controller, environment);
                }
            }

            break;
        }

        case "while": {

            const body = block.getInputTargetBlock("DO");
            let iterations = 0;
            const MAX = 1000;

            while (getBooleanInput(block, "COND")) {
                controller.throwIfStopped();
                if (iterations++ > MAX) break;
                if (body) {
                    await executeSubChain(body, sprite, controller, environment);
                }
            }

            break;
        }

        case "jump_to_mouse_select": {
            const rect = getRectField(block, "RECT");
            const point = randomInRect(rect);

            sprite.setPosition(point.x, point.y);
            break;
        }

        case "glide_to_mouse_select": {
            const rect = getRectField(block, "RECT");
            const point = randomInRect(rect);

            const duration = getNumberInput(block, "TIME") * 1000;

            await glideTo(
                sprite,
                point.x,
                point.y,
                duration,
                controller
            );

            break;
        }

        case "set_costume": {
            const index = Number(block.getFieldValue("COSTUME"));

            if (
                Number.isInteger(index) &&
                index >= 0 &&
                index < sprite.data.costumes.length
            ) {
                sprite.data.currentCostume = index;
            }

            break;
        }

        case "set_bounce": {
            sprite.data.bounceOnEdge = getBooleanInput(block, "VALUE");
            break;
        }

        case "if": {
            console.log(evaluateCondition(block, sprite, environment))
            if (evaluateCondition(block, sprite, environment)) {
                await executeSubChain(
                    block.getInputTargetBlock("DO"),
                    sprite,
                    controller,
                    environment
                );
            }

            break;
        }

        case "if_else": {
            if (evaluateCondition(block, sprite, environment)) {
                await executeSubChain(
                    block.getInputTargetBlock("DO"),
                    sprite,
                    controller,
                    environment
                );
            } else {
                await executeSubChain(
                    block.getInputTargetBlock("ELSE"),
                    sprite,
                    controller,
                    environment
                );
            }

            break;
        }

    }

}

function normalizeAngle(angle: number): number {
    return ((angle % 360) + 360) % 360;
}

function getNumberInput(block: Blockly.Block, name: string): number {
    const input = block.getInputTargetBlock(name);
    return input ? Number(input.getFieldValue("NUM")) : 0;
}

function glideTo(
    sprite: Sprite,
    targetX: number,
    targetY: number,
    duration: number,
    controller: ExecutionController
): Promise<void> {
    return new Promise((resolve, reject) => {
        const startX = sprite.data.x;
        const startY = sprite.data.y;
        const startTime = performance.now();

        function update(now: number) {
            if (controller.isStopped) {
                reject(new Error("Execution stopped"));
                return;
            }

            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);

            const x = startX + (targetX - startX) * t;
            const y = startY + (targetY - startY) * t;

            sprite.setPosition(x, y);

            if (t < 1) {
                requestAnimationFrame(update);
            } else {
                resolve();
            }
        }

        requestAnimationFrame(update);
    });
}

function sleep(ms: number, controller: ExecutionController): Promise<void> {
    return new Promise((resolve, reject) => {
        const start = performance.now();

        function tick(now: number) {
            if (controller.isStopped) {
                reject(new Error("Execution stopped"));
                return;
            }

            if (now - start >= ms) {
                resolve();
                return;
            }

            requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
    });
}

function getBooleanInput(block: Blockly.Block, name: string): boolean {
    const input = block.getInputTargetBlock(name);
    if (!input) return false;

    switch (input.type) {
        case "always_true":
            return true;
        case "always_false":
            return false;
        default:
            return false;
    }
}

function getRectField(block: Blockly.Block, name: string) {
    const raw = block.getFieldValue(name);

    const rect = JSON.parse(raw) as {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };

    const minX = Math.min(rect.x1, rect.x2);
    const maxX = Math.max(rect.x1, rect.x2);
    const minY = Math.min(rect.y1, rect.y2);
    const maxY = Math.max(rect.y1, rect.y2);

    return { minX, maxX, minY, maxY };
}

function randomInRect(rect: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}) {
    return {
        x: rect.minX + Math.random() * (rect.maxX - rect.minX),
        y: rect.minY + Math.random() * (rect.maxY - rect.minY)
    };
}

function evaluateCondition(
    block: Blockly.Block,
    sprite: Sprite,
    env?: ExecutionEnvironment
): boolean {
    if (!env) return false;

    const view = env.getSpriteView(sprite.data.id);
    if (!view) return false;

    const condition = block.getFieldValue("CONDITION");

    switch (condition) {
        case "HOVERED":
            return view.containsPoint(env.mouseX, env.mouseY);

        case "EDGE":
            return view.touchesStageEdge(env.stageWidth, env.stageHeight);

        case "SPRITE": {
            const targetId = block.getFieldValue("TARGET");
            const targetView = env.getSpriteView(targetId);

            if (!targetView || targetId === sprite.data.id) {
                return false;
            }

            return view.collidesWith(targetView);
        }

        default:
            return false;
    }
}