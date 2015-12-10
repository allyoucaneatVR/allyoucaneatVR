/**
 * jslint browser: true
 */
ayce.Square = function () {

    ayce.Object3D.call(this);

    this.vertices = [
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0,
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0
    ];

    this.colors = [
        0.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 1.0, 1.0
    ];

    this.indices = [
        0, 1, 2, 0, 2, 3
    ];
};

ayce.Square.prototype = ayce.Object3D.prototype;