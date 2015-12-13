/**
 * jslint browser: true
 */
Ayce.Square = function () {

    Ayce.Object3D.call(this);

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

Ayce.Square.prototype = Ayce.Object3D.prototype;