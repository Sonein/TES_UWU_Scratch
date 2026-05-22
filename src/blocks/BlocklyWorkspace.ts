import * as Blockly from "blockly";

export class BlocklyWorkspace {
    workspace!: Blockly.WorkspaceSvg;
    container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    initialize(): void {
        Blockly.utils.colour.setHsvSaturation(0.3)
        this.workspace = Blockly.inject(this.container, {
            toolbox: this.createToolbox(),
            scrollbars: true,
            trashcan: true
        });
        Blockly.svgResize(this.workspace);
    }

    //@TODO make categories
    private createToolbox() : Blockly.utils.toolbox.ToolboxInfo {

        return {
            kind: "categoryToolbox",
            contents: [
                {
                    kind: "category",
                    name: "Zaciatky",
                    colour: "#E2CA2D",
                    contents: [
                        {
                            kind: "block",
                            type: "start"
                        },

                        {
                            kind: "block",
                            type: "start_clicked"
                        },

                        {
                            kind: "block",
                            type: "start_key_pressed"
                        },
                    ]
                },

                {
                    kind: "category",
                    name: "Pohyb",
                    colour: "#ff00aa",
                    contents: [
                        {
                            kind: "block",
                            type: "move_forward",
                            inputs: {
                                STEPS: {
                                    block: {
                                        type: "math_number",
                                        fields: { NUM: 0 }
                                    }
                                }
                            }
                        },

                        {
                            kind: "block",
                            type: "turn_left",
                            inputs: {
                                DEGREES: {
                                    block: {
                                        type: "math_number",
                                        fields: { NUM: 0 }
                                    }
                                }
                            }
                        },

                        {
                            kind: "block",
                            type: "turn_right",
                            inputs: {
                                DEGREES: {
                                    block: {
                                        type: "math_number",
                                        fields: { NUM: 0 }
                                    }
                                }
                            }
                        },

                        {
                            kind: "block",
                            type: "set_rotation"
                        },

                        {
                            kind: "block",
                            type: "jump_to_xy",
                            inputs: {
                                X: { block: { type: "math_number", fields: { NUM: 0 } } },
                                Y: { block: { type: "math_number", fields: { NUM: 0 } } }
                            }
                        },

                        {
                            kind: "block",
                            type: "glide_to_xy",
                            inputs: {
                                X: { block: { type: "math_number", fields: { NUM: 0 } } },
                                Y: { block: { type: "math_number", fields: { NUM: 0 } } },
                                TIME: { block: { type: "math_number", fields: { NUM: 0 } } }
                            }
                        },

                        {
                            kind: "block",
                            type: "jump_to_mouse_select"
                        },

                        {
                            kind: "block",
                            type: "glide_to_mouse_select",
                            inputs: {
                                TIME: { block: { type: "math_number", fields: { NUM: 0 } } }
                            }
                        },

                        {
                            kind: "block",
                            type: "set_bounce"
                        }
                    ]
                },

                {
                    kind: "category",
                    name: "Kontrola",
                    colour: "#ff0055",
                    contents: [
                        {
                            kind: "block",
                            type: "wait",
                            inputs: {
                                TIME: {block: { type: "math_number", fields: { NUM: 0 } } },
                            }
                        },

                        {
                            kind: "block",
                            type: "repeat",
                            inputs: {
                                TIMES: {block: { type: "math_number", fields: { NUM: 0 } } },
                            }
                        },

                        {
                            kind: "block",
                            type: "while"
                        },

                        {
                            kind: "block",
                            type: "if"
                        },

                        {
                            kind: "block",
                            type: "if_else"
                        }
                    ]
                },

                {
                    kind: "category",
                    name: "Vyzaz",
                    colour: "#ff00ff",
                    contents: [
                        {
                            kind: "block",
                            type: "next_costume"
                        },

                        {
                            kind: "block",
                            type: "hide",
                        },

                        {
                            kind: "block",
                            type: "show",
                        },

                        {
                            kind: "block",
                            type: "set_costume"
                        }
                    ]
                },

                {
                    kind: "category",
                    name: "Typy",
                    colour: "#0080ff",
                    contents: [
                        {
                            kind: "block",
                            type: "math_number"
                        },

                        {
                            kind: "block",
                            type: "always_true"
                        },

                        {
                            kind: "block",
                            type: "always_false"
                        }
                    ]
                }
            ]
        };

    }

    save(): any {
        return Blockly.serialization.workspaces.save(this.workspace);
    }

    load(data: any) {
        this.workspace.clear();
        if (!data) return;
        Blockly.serialization.workspaces.load(data, this.workspace);

    }
}