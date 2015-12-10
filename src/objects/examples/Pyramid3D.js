/**
 * jslint browser: true
 */
ayce.Pyramid3D = function () {

    ayce.Object3D.call(this);

    this.vertices = [
        // Tip
        0.0, 1.0, 0.0,

        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0
    ];

    //this.colors = [
    //    1.0, 0.0, 0.0, 1.0,
    //    0.0, 1.0, 0.0, 1.0,
    //    0.0, 0.0, 1.0, 1.0,
    //    0.0, 0.0, 1.0, 1.0,
    //    0.0, 1.0, 0.0, 1.0
    //];

    this.colors = [
        1.0, 0.0, 0.0, 0.5,
        0.0, 1.0, 0.0, 0.5,
        0.0, 0.0, 1.0, 0.5,
        0.0, 0.0, 1.0, 0.5,
        0.0, 1.0, 0.0, 0.5
    ];

    this.indices = [
        0, 2, 1,
        0, 3, 2,
        0, 4, 3,
        0, 1, 4,
        1, 2, 3,
        1, 3, 4
    ];

    this.transparent = true;
};

ayce.Pyramid3D.prototype = ayce.Object3D.prototype;