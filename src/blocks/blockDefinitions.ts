import * as Blockly from "blockly"
import { FieldAngle } from "@blockly/field-angle";
import "blockly/blocks";

//@TODO change colors
/*@TODO blocks
jump to mouse
glide to mouse
bounce from edge
change costume to choice
start on key
start on click
if (reached edge, mouse hover, touch other sprite by name)
if else
 */
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
                .appendField("repeat");

            this.appendStatementInput("DO")
                .appendField("do");

            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(340);
        }
    };

    Blockly.Blocks["while"] = {
        init: function () {
            this.appendValueInput("COND")
                .setCheck("Boolean")
                .appendField("while");

            this.appendStatementInput("DO")
                .appendField("do");

            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(340);
        }
    };

    Blockly.Blocks["always_true"] = {
        init: function () {
            this.appendDummyInput()
                .appendField("true");

            this.setOutput(true, "Boolean");
            this.setColour(210);
        }
    };

}