/**
 * jslint browser: true
 */

/**
 * Creates square to be used as a framebuffer by the vr renderer
 * @class
 * @constructor
 */
Ayce.VRSquare = function () {

    Ayce.Object3D.call(this);

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

Ayce.VRSquare.prototype = new Ayce.Object3D();