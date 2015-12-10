/**
 * jslint browser: true
 */

/**
 * Creates square to be used as a framebuffer by the vr renderer
 * @class
 * @constructor
 */
ayce.VRSquare = function () {

    ayce.Object3D.call(this);

    this.shader = "vr-canvas";

    this.vertices = [
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        -1.0,  1.0, 1.0,
        1.0,  1.0, 1.0
    ];

    this.textureCoords = [
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0
    ];
};

ayce.VRSquare.prototype = new ayce.Object3D();