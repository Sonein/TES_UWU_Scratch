import * as Blockly from "blockly"
import { FieldAngle } from "@blockly/field-angle";
import "blockly/blocks";
import { FieldRectPicker } from "./FieldRectPicker";
import { FieldCostumePicker } from "./FieldCostumePicker";
import { FieldSpriteDropdown } from "./FieldSpriteDropdown";

//@TODO change colors
export function registerBlocks() {

    Blockly.Blocks["start"] = {
        init: function () {
            this.appendDummyInput()
                .appendField("Zacni :3")

            this.setNextStatement(true)
            this.setColour(57)
            this.setDeletable(false)
            this.setMovable(true)
        }
    };

    Blockly.Blocks["move_forward"] = {
        init: function () {
            this.appendValueInput("STEPS")
                .setCheck("Number")
                .appendField("Vpred!");

            this.appendDummyInput()
                .appendField("... o pixely");

            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(320);
        }
    };

    Blockly.Blocks["turn_left"] = {
        init: function () {
            this.appendValueInput("DEGREES")
                .setCheck("Number")
                .appendField("Vlavo o");

            this.appendDummyInput()
                .appendField("stupnov");

            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(320);
        }
    };

    Blockly.Blocks["turn_right"] = {
        init: function () {
            this.appendValueInput("DEGREES")
                .setCheck("Number")
                .appendField("Vpravo o");

            this.appendDummyInput()
                .appendField("stupnov");

            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(320);
        }
    };

    Blockly.Blocks["set_rotation"] = {
        init: function () {
            this.appendDummyInput()
                .appendField("Nech rotacia")
                .appendField(new FieldAngle(90), "ANGLE")
                .appendField("stupnov");

            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(320);
        }
    };

    Blockly.Blocks["jump_to_xy"] = {
        init: function () {
            this.appendValueInput("X")
                .setCheck("Number")
                .appendField("Skoc na x");

            this.appendValueInput("Y")
                .setCheck("Number")
                .appendField("y");

            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(320);
        }
    };

    Blockly.Blocks["glide_to_xy"] = {
        init: function () {
            this.appendValueInput("X")
                .setCheck("Number")
                .appendField("Prejdi na x");

            this.appendValueInput("Y")
                .setCheck("Number")
                .appendField("y");

            this.appendValueInput("TIME")
                .setCheck("Number")
                .appendField("za sekund");

            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(320);
        }
    };

    Blockly.Blocks["next_costume"] = {
        init: function () {
            this.appendDummyInput()
                .appendField("Dalsie costume");

            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(300);
        }
    };

    Blockly.Blocks["show"] = {
        init: function () {
            this.appendDummyInput()
                .appendField("Ukaz sa");

            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(300);
        }
    };

    Blockly.Blocks["hide"] = {
        init: function () {
            this.appendDummyInput()
                .appendField("Schovaj sa");

            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(300);
        }
    };

    Blockly.Blocks["wait"] = {
        init: function () {
            this.appendValueInput("TIME")
                .setCheck("Number")
                .appendField("Cakaj sekund");

            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(340);
        }
    };

    Blockly.Blocks["repeat"] = {
        init: function () {
            this.appendValueInput("TIMES")
                .setCheck("Number")
                .appendField("Opakuj");

            this.appendStatementInput("DO")
                .appendField("rob");

            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(340);
        }
    };

    Blockly.Blocks["while"] = {
        init: function () {
            this.appendValueInput("COND")
                .setCheck("Boolean")
                .appendField("kym");

            this.appendStatementInput("DO")
                .appendField("rob");

            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(340);
        }
    };

    Blockly.Blocks["always_true"] = {
        init: function () {
            this.appendDummyInput()
                .appendField("pravda");

            this.setOutput(true, "Boolean");
            this.setColour(210);
        }
    };

    Blockly.Blocks["always_false"] = {
        init: function () {
            this.appendDummyInput()
                .appendField("nepravda");

            this.setOutput(true, "Boolean");
            this.setColour(210);
        }
    };

    Blockly.Blocks["jump_to_mouse_select"] = {
        init: function () {
            this.appendDummyInput()
                .appendField("Skoc na bod v:")
                .appendField(
                    new FieldRectPicker(JSON.stringify({
                        x1: 50,
                        y1: 50,
                        x2: 200,
                        y2: 200
                    })),
                    "RECT"
                );

            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(320);
        }
    };

    Blockly.Blocks["glide_to_mouse_select"] = {
        init: function () {
            this.appendDummyInput()
                .appendField("Prejdi na bod v:")
                .appendField(
                    new FieldRectPicker(JSON.stringify({
                        x1: 50,
                        y1: 50,
                        x2: 200,
                        y2: 200
                    })),
                    "RECT"
                );

            this.appendValueInput("TIME")
                .setCheck("Number")
                .appendField("za sekund");

            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(320);
        }
    };

    Blockly.Blocks["set_costume"] = {
        init: function () {
            this.appendDummyInput()
                .appendField("set costume")
                .appendField(new FieldCostumePicker("0"), "COSTUME");

            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(300);
        }
    };

    Blockly.Blocks["start_clicked"] = {
        init: function () {
            this.appendDummyInput()
                .appendField("Zacni ked kliknem :3");

            this.setNextStatement(true);
            this.setColour(57);
        }
    };

    Blockly.Blocks["start_key_pressed"] = {
        init: function () {
            this.appendDummyInput()
                .appendField("Zacni ked stlacim:")
                .appendField(new Blockly.FieldDropdown([
                    ["space", "Space"],
                    ["arrow up", "ArrowUp"],
                    ["arrow down", "ArrowDown"],
                    ["arrow left", "ArrowLeft"],
                    ["arrow right", "ArrowRight"],
                    ["w", "KeyW"],
                    ["a", "KeyA"],
                    ["s", "KeyS"],
                    ["d", "KeyD"],
                    ["enter", "Enter"]
                ]), "KEY");

            this.setNextStatement(true);
            this.setColour(57);
        }
    };

    Blockly.Blocks["set_bounce"] = {
        init: function () {
            this.appendValueInput("VALUE")
                .setCheck("Boolean")
                .appendField("Odraz sa od kraja");

            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(320);
        }
    };

    Blockly.Blocks["if"] = {
        init: function () {
            this.appendDummyInput()
                .appendField("Ak")
                .appendField(new Blockly.FieldDropdown([
                    ["...mys na", "HOVERED"],
                    ["...na okraji", "EDGE"],
                    ["...narazil na inu", "SPRITE"]
                ]), "CONDITION")
                .appendField("ciel")
                .appendField(new FieldSpriteDropdown(), "TARGET");

            this.appendStatementInput("DO")
                .appendField("Rob");

            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(340);
        }
    };

    Blockly.Blocks["if_else"] = {
        init: function () {
            this.appendDummyInput()
                .appendField("Ak")
                .appendField(new Blockly.FieldDropdown([
                    ["...mys na", "HOVERED"],
                    ["...na okraji", "EDGE"],
                    ["...narazil na inu", "SPRITE"]
                ]), "CONDITION")
                .appendField("ciel")
                .appendField(new FieldSpriteDropdown(), "TARGET");

            this.appendStatementInput("DO")
                .appendField("Rob");

            this.appendStatementInput("ELSE")
                .appendField("Inak");

            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(340);
        }
    };

}