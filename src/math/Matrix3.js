/**
 * jslint browser: true
 */

/**
 * Creates new matrix3 as identity matrix
 * @class
 * @constructor
 */
ayce.Matrix3 = function () {
    this.data = new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ]);
};

ayce.Matrix3.prototype = {

};