var fs = require('fs');
var UglifyJS = require("uglify-js");

var outputPath = "./build/";
var outputName = "AyceVR.min.js";
var outputNameMap = outputName + ".map";

var files = [
    "src/allyoucaneatVR.js",

    "src/math/Vector2.js",
    "src/math/Vector3.js",
    "src/math/Quaternion.js",
    "src/math/Matrix4.js",
    "src/math/Matrix3.js",
    "src/math/Geometry.js",

    "src/stage/Timer.js",
    "src/stage/XMLLoader.js",
    "src/stage/renderer/Renderer.js",
    "src/stage/renderer/VRRenderer.js",
    "src/stage/Scene.js",
    "src/stage/Light.js",
    "src/stage/buffer/Buffer.js",
    "src/stage/buffer/BufferMulti.js",
    "src/stage/buffer/Shader.js",
    "src/stage/buffer/ShaderGenerator.js",
    "src/stage/sound/Sound.js",
    "src/stage/sound/AudioContext.js",
    "src/stage/camera/Camera.js",
    "src/stage/camera/CameraManager.js",
    "src/stage/camera/cameraModifiers/CameraModifier.js",
    "src/stage/camera/cameraModifiers/Cardboard.js",
    "src/stage/camera/cameraModifiers/WebVR.js",
    "src/stage/camera/cameraModifiers/MouseKeyboard.js",
    "src/stage/camera/cameraModifiers/Gamepad.js",

    "src/objects/Object3D.js",
    "src/objects/loader/OBJLoader.js",
    "src/objects/types/VRSquare.js",
    "src/objects/types/ParticleSystem.js",
    "src/objects/types/Skybox.js",
    "src/objects/examples/Cube3D.js",
    "src/objects/examples/Pyramid3D.js",
    "src/objects/examples/Sphere3D.js",
    "src/objects/examples/Square.js",

    "src/inputHandlers/KeyboardHandler.js",
    "src/inputHandlers/GamepadHandler.js",
    "src/inputHandlers/MouseHandler.js",
    "src/inputHandlers/SensorsHandler.js",
    "src/inputHandlers/HMDHandler.js"

];

console.log("Starting building process...");
console.log("Be sure to include all source files!\n");

var result = UglifyJS.minify(files, {
    outSourceMap: outputNameMap
});


writeFile(outputPath, outputName, result.code);
writeFile(outputPath, outputNameMap, result.map);

function writeFile(filePath, fileName, fileContent) {
    fs.writeFile(filePath + fileName, fileContent, function(err) {
        if (err) {
            return console.log(err);
        }
        console.log(fileName + " was saved!");
    });
}