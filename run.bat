@echo off

IF NOT EXIST node_modules (
    echo Installing dependencies...
    npm install vite
    npm install blockly
    npm install pixi.js
    npm install @blockly/field-angle
    npm audit fix
)

npm run dev
start http://localhost:5173
pause