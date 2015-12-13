/**
 * jslint browser: true
 */

/**
 * Creates new matrix4 as identity matrix
 * @class
 * @constructor
 */
Ayce.Matrix4 = function () {
    this.data = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
};

/**
 * Creates perspective matrix for viewing frustum
 * @param {Number} fieldOfView
 * @param {Number} aspect
 * @param {Number} near
 * @param {Number} far
 * @return {Ayce.Matrix4} m
 */
Ayce.Matrix4.makePerspective = function (fieldOfView, aspect, near, far) {
    var m = new Ayce.Matrix4();
    var radians = fieldOfView / 2.0 * Math.PI / 180.0;
    var sine = Math.sin(radians);
    var f = Math.cos(radians) / sine;

    var rightHanded = true;
    var handednessScale = rightHanded ? -1.0 : 1.0;

    m.data = new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, far / (near - far) * -handednessScale, handednessScale,
        0, 0, (far * near) / (near - far), 0
    ]);

    return m;
};
/**
 * Creates orthographic perspective matrix
 * @param {Number} left
 * @param {Number} right
 * @param {Number} top
 * @param {Number} bottom
 * @param {Number} near
 * @param {Number} far
 * @return {Ayce.Matrix4} m
 */
Ayce.Matrix4.makeOrthoPerspective = function (left, right, top, bottom, near, far) {

    var m = new Ayce.Matrix4();

    var lr = 1 / (left - right);
    var bt = 1 / (bottom - top);
    var nf = 1 / (near - far);

    m.data = new Float32Array([
        -2 * lr, 0, 0, 0,
        0, -2 * bt, 0, 0,
        0, 0, 2 * nf, 0,
        (left + right) * lr, (top + bottom) * bt, (far + near) * nf, 1
    ]);


    return m;
};
/**
 * Creates perspective matrix for use with the Oculus Rift
 * @param {Number} VRfov
 * @param {Number} zNear
 * @param {Number} zFar
 * @return {Ayce.Matrix4} m
 */
Ayce.Matrix4.makeVRPerspective = function (VRfov, zNear, zFar) {
    var DEG2RAD = Math.PI / 180.0;

    var upTan = Math.tan(VRfov.upDegrees * DEG2RAD);
    var downTan = Math.tan(VRfov.downDegrees * DEG2RAD);
    var leftTan = Math.tan(VRfov.leftDegrees * DEG2RAD);
    var rightTan = Math.tan(VRfov.rightDegrees * DEG2RAD);

    var pxscale = 2.0 / (leftTan + rightTan);
    var pxoffset = (leftTan - rightTan) * pxscale * 0.5;
    var pyscale = 2.0 / (upTan + downTan);
    var pyoffset = (upTan - downTan) * pyscale * 0.5;

    var rightHanded = true;
    var handednessScale = rightHanded ? -1.0 : 1.0;

    var m = new Ayce.Matrix4();
    m.data = new Float32Array([
        pxscale, 0, 0, 0,
        0, pyscale, 0, 0,
        pxoffset * handednessScale, pyoffset * handednessScale, zFar / (zNear - zFar) * -handednessScale, handednessScale,
        0, 0, (zFar * zNear) / (zNear - zFar), 0
    ]);

    return m;
};

Ayce.Matrix4.prototype = {
    poolMatrix: new Ayce.Matrix4(),
    poolVector3: new Ayce.Vector3(),
    /**
     * Description
     */
    identity: function () {
        this.data[0] = 1;
        this.data[1] = 0;
        this.data[2] = 0;
        this.data[3] = 0;
        this.data[4] = 0;
        this.data[5] = 1;
        this.data[6] = 0;
        this.data[7] = 0;
        this.data[8] = 0;
        this.data[9] = 0;
        this.data[10] = 1;
        this.data[11] = 0;
        this.data[12] = 0;
        this.data[13] = 0;
        this.data[14] = 0;
        this.data[15] = 1;
    },
    /**
     * Applies transformation matrix
     * @param {Ayce.Matrix4} lhs
     */
    apply: function (lhs) {
        var m111 = this.data[0],
            m121 = this.data[4],
            m131 = this.data[8],
            m141 = this.data[12],
            m112 = this.data[1],
            m122 = this.data[5],
            m132 = this.data[9],
            m142 = this.data[13],
            m113 = this.data[2],
            m123 = this.data[6],
            m133 = this.data[10],
            m143 = this.data[14],
            m114 = this.data[3],
            m124 = this.data[7],
            m134 = this.data[11],
            m144 = this.data[15],
            m211 = lhs.data[0],
            m221 = lhs.data[4],
            m231 = lhs.data[8],
            m241 = lhs.data[12],
            m212 = lhs.data[1],
            m222 = lhs.data[5],
            m232 = lhs.data[9],
            m242 = lhs.data[13],
            m213 = lhs.data[2],
            m223 = lhs.data[6],
            m233 = lhs.data[10],
            m243 = lhs.data[14],
            m214 = lhs.data[3],
            m224 = lhs.data[7],
            m234 = lhs.data[11],
            m244 = lhs.data[15];

        this.data[0] = m111 * m211 + m112 * m221 + m113 * m231 + m114 * m241;
        this.data[1] = m111 * m212 + m112 * m222 + m113 * m232 + m114 * m242;
        this.data[2] = m111 * m213 + m112 * m223 + m113 * m233 + m114 * m243;
        this.data[3] = m111 * m214 + m112 * m224 + m113 * m234 + m114 * m244;

        this.data[4] = m121 * m211 + m122 * m221 + m123 * m231 + m124 * m241;
        this.data[5] = m121 * m212 + m122 * m222 + m123 * m232 + m124 * m242;
        this.data[6] = m121 * m213 + m122 * m223 + m123 * m233 + m124 * m243;
        this.data[7] = m121 * m214 + m122 * m224 + m123 * m234 + m124 * m244;

        this.data[8] = m131 * m211 + m132 * m221 + m133 * m231 + m134 * m241;
        this.data[9] = m131 * m212 + m132 * m222 + m133 * m232 + m134 * m242;
        this.data[10] = m131 * m213 + m132 * m223 + m133 * m233 + m134 * m243;
        this.data[11] = m131 * m214 + m132 * m224 + m133 * m234 + m134 * m244;

        this.data[12] = m141 * m211 + m142 * m221 + m143 * m231 + m144 * m241;
        this.data[13] = m141 * m212 + m142 * m222 + m143 * m232 + m144 * m242;
        this.data[14] = m141 * m213 + m142 * m223 + m143 * m233 + m144 * m243;
        this.data[15] = m141 * m214 + m142 * m224 + m143 * m234 + m144 * m244;
    },
    /**
     * Applies rotation to matrix
     * @param {Number} degrees
     * @param {Ayce.Vector3} axis
     * @param {Ayce.Vector3} pivotPoint
     */
    applyRotation: function (degrees, axis, pivotPoint) {
        this.poolMatrix.data[0] = 1;
        this.poolMatrix.data[1] = 0;
        this.poolMatrix.data[2] = 0;
        this.poolMatrix.data[3] = 0;
        this.poolMatrix.data[4] = 0;
        this.poolMatrix.data[5] = 1;
        this.poolMatrix.data[6] = 0;
        this.poolMatrix.data[7] = 0;
        this.poolMatrix.data[8] = 0;
        this.poolMatrix.data[9] = 0;
        this.poolMatrix.data[10] = 1;
        this.poolMatrix.data[11] = 0;
        this.poolMatrix.data[12] = 0;
        this.poolMatrix.data[13] = 0;
        this.poolMatrix.data[14] = 0;
        this.poolMatrix.data[15] = 1;
        this.getAxisRotation(axis.x, axis.y, axis.z, degrees, this.poolMatrix);
        if (pivotPoint !== undefined) {
            var p = pivotPoint;
            this.poolMatrix.applyTranslation(p.x, p.y, p.z);
        }
        this.apply(this.poolMatrix);
    },
    /**
     * Applies scaling to matrix
     * @param {Number} xScale
     * @param {Number} yScale
     * @param {Number} zScale
     */
    applyScale: function (xScale, yScale, zScale) {
        this.poolMatrix.data[0] = xScale;
        this.poolMatrix.data[1] = 0;
        this.poolMatrix.data[2] = 0;
        this.poolMatrix.data[3] = 0;
        this.poolMatrix.data[4] = 0;
        this.poolMatrix.data[5] = yScale;
        this.poolMatrix.data[6] = 0;
        this.poolMatrix.data[7] = 0;
        this.poolMatrix.data[8] = 0;
        this.poolMatrix.data[9] = 0;
        this.poolMatrix.data[10] = zScale;
        this.poolMatrix.data[11] = 0;
        this.poolMatrix.data[12] = 0;
        this.poolMatrix.data[13] = 0;
        this.poolMatrix.data[14] = 0;
        this.poolMatrix.data[15] = 1;
        this.apply(this.poolMatrix);
    },
    /**
     * Applies translation to matrix
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     */
    applyTranslation: function (x, y, z) {
        this.data[12] += x;
        this.data[13] += y;
        this.data[14] += z;
    },
    /**
     * TODO: Description
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     * @param {Number} degrees
     * @param {Boolean} toMatrix
     * @return {Ayce.Matrix4} m
     */
    getAxisRotation: function (x, y, z, degrees, toMatrix) {
        var m;
        if(!toMatrix){
            m = new Ayce.Matrix4();
        }
        else{
            m = toMatrix;
        }

        var a1 = this.poolVector3;
        a1.x = x;
        a1.y = y;
        a1.z = z;

        var rad = -degrees * (Math.PI / 180);
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        var t = 1.0 - c;

        m.data[0] = c + a1.x * a1.x * t;
        m.data[5] = c + a1.y * a1.y * t;
        m.data[10] = c + a1.z * a1.z * t;

        var tmp1 = a1.x * a1.y * t;
        var tmp2 = a1.z * s;
        m.data[4] = tmp1 + tmp2;
        m.data[1] = tmp1 - tmp2;
        tmp1 = a1.x * a1.z * t;
        tmp2 = a1.y * s;
        m.data[8] = tmp1 - tmp2;
        m.data[2] = tmp1 + tmp2;
        tmp1 = a1.y * a1.z * t;
        tmp2 = a1.x * s;
        m.data[9] = tmp1 + tmp2;
        m.data[6] = tmp1 - tmp2;

        return m;
    },
    /**
     * Returns Determinant of matrix
     * @return {Number} determinant
     */
    getDeterminant: function () {
        return 1 * (
                (this.data[0] * this.data[5] - this.data[4] * this.data[1]) *
                (this.data[10] * this.data[15] - this.data[14] * this.data[11]) -
                (this.data[0] * this.data[9] - this.data[8] * this.data[1]) *
                (this.data[6] * this.data[15] - this.data[14] * this.data[7]) +
                (this.data[0] * this.data[13] - this.data[12] * this.data[1]) *
                (this.data[6] * this.data[11] - this.data[10] * this.data[7]) +
                (this.data[4] * this.data[9] - this.data[8] * this.data[5]) *
                (this.data[2] * this.data[15] - this.data[14] * this.data[3]) -
                (this.data[4] * this.data[13] - this.data[12] * this.data[5]) *
                (this.data[2] * this.data[11] - this.data[10] * this.data[3]) +
                (this.data[8] * this.data[13] - this.data[12] * this.data[9]) *
                (this.data[2] * this.data[7] - this.data[6] * this.data[3])
            );
    },
    /**
     * Transposes the matrix
     */
    transpose: function () {
        this.copyToMatrix(this, this.poolMatrix);

        this.data[1] = this.poolMatrix.data[4];
        this.data[2] = this.poolMatrix.data[8];
        this.data[3] = this.poolMatrix.data[12];
        this.data[4] = this.poolMatrix.data[1];
        this.data[6] = this.poolMatrix.data[9];
        this.data[7] = this.poolMatrix.data[13];
        this.data[8] = this.poolMatrix.data[2];
        this.data[9] = this.poolMatrix.data[6];
        this.data[11] = this.poolMatrix.data[14];
        this.data[12] = this.poolMatrix.data[3];
        this.data[13] = this.poolMatrix.data[7];
        this.data[14] = this.poolMatrix.data[11];
    },
    /**
     * Inverts the matrix
     * @return {Boolean} invertable
     */
    invert: function () {
        var d = this.getDeterminant();
        var invertable = Math.abs(d) > 0.00000000001;

        if (invertable) {
            d = 1 / d;
            var m11 = this.data[0];
            var m21 = this.data[4];
            var m31 = this.data[8];
            var m41 = this.data[12];
            var m12 = this.data[1];
            var m22 = this.data[5];
            var m32 = this.data[9];
            var m42 = this.data[13];
            var m13 = this.data[2];
            var m23 = this.data[6];
            var m33 = this.data[10];
            var m43 = this.data[14];
            var m14 = this.data[3];
            var m24 = this.data[7];
            var m34 = this.data[11];
            var m44 = this.data[15];

            this.data[0] = d * (m22 * (m33 * m44 - m43 * m34) - m32 * (m23 * m44 - m43 * m24) + m42 * (m23 * m34 - m33 * m24));
            this.data[1] = -d * (m12 * (m33 * m44 - m43 * m34) - m32 * (m13 * m44 - m43 * m14) + m42 * (m13 * m34 - m33 * m14));
            this.data[2] = d * (m12 * (m23 * m44 - m43 * m24) - m22 * (m13 * m44 - m43 * m14) + m42 * (m13 * m24 - m23 * m14));
            this.data[3] = -d * (m12 * (m23 * m34 - m33 * m24) - m22 * (m13 * m34 - m33 * m14) + m32 * (m13 * m24 - m23 * m14));
            this.data[4] = -d * (m21 * (m33 * m44 - m43 * m34) - m31 * (m23 * m44 - m43 * m24) + m41 * (m23 * m34 - m33 * m24));
            this.data[5] = d * (m11 * (m33 * m44 - m43 * m34) - m31 * (m13 * m44 - m43 * m14) + m41 * (m13 * m34 - m33 * m14));
            this.data[6] = -d * (m11 * (m23 * m44 - m43 * m24) - m21 * (m13 * m44 - m43 * m14) + m41 * (m13 * m24 - m23 * m14));
            this.data[7] = d * (m11 * (m23 * m34 - m33 * m24) - m21 * (m13 * m34 - m33 * m14) + m31 * (m13 * m24 - m23 * m14));
            this.data[8] = d * (m21 * (m32 * m44 - m42 * m34) - m31 * (m22 * m44 - m42 * m24) + m41 * (m22 * m34 - m32 * m24));
            this.data[9] = -d * (m11 * (m32 * m44 - m42 * m34) - m31 * (m12 * m44 - m42 * m14) + m41 * (m12 * m34 - m32 * m14));
            this.data[10] = d * (m11 * (m22 * m44 - m42 * m24) - m21 * (m12 * m44 - m42 * m14) + m41 * (m12 * m24 - m22 * m14));
            this.data[11] = -d * (m11 * (m22 * m34 - m32 * m24) - m21 * (m12 * m34 - m32 * m14) + m31 * (m12 * m24 - m22 * m14));
            this.data[12] = -d * (m21 * (m32 * m43 - m42 * m33) - m31 * (m22 * m43 - m42 * m23) + m41 * (m22 * m33 - m32 * m23));
            this.data[13] = d * (m11 * (m32 * m43 - m42 * m33) - m31 * (m12 * m43 - m42 * m13) + m41 * (m12 * m33 - m32 * m13));
            this.data[14] = -d * (m11 * (m22 * m43 - m42 * m23) - m21 * (m12 * m43 - m42 * m13) + m41 * (m12 * m23 - m22 * m13));
            this.data[15] = d * (m11 * (m22 * m33 - m32 * m23) - m21 * (m12 * m33 - m32 * m13) + m31 * (m12 * m23 - m22 * m13));
        } else {
            //TODO return false, don't throw
            throw "Can't invert Matrix";
        }
        return invertable;
    },
    /**
     * Applies matrix to vector
     * @param {Ayce.Vector3} vector
     * @return {Ayce.Vector3} vector
     */
    transformVector: function (vector) {
        var x = vector.x;
        var y = vector.y;
        var z = vector.z;

        vector.x = (x * this.data[0] + y * this.data[4] + z * this.data[8] + this.data[12]);
        vector.y = (x * this.data[1] + y * this.data[5] + z * this.data[9] + this.data[13]);
        vector.z = (x * this.data[2] + y * this.data[6] + z * this.data[10] + this.data[14]);

        return vector;
    },
    /**
     * Copies values from one matrix to another
     * @param {Ayce.Matrix4} from
     * @param {Ayce.Matrix4} to
     */
    copyToMatrix: function(from, to){
        to.data[0] = from.data[0];
        to.data[1] = from.data[1];
        to.data[2] = from.data[2];
        to.data[3] = from.data[3];
        to.data[4] = from.data[4];
        to.data[5] = from.data[5];
        to.data[6] = from.data[6];
        to.data[7] = from.data[7];
        to.data[8] = from.data[8];
        to.data[9] = from.data[9];
        to.data[10] = from.data[10];
        to.data[11] = from.data[11];
        to.data[12] = from.data[12];
        to.data[13] = from.data[13];
        to.data[14] = from.data[14];
        to.data[15] = from.data[15];
    },
    /**
     * Creates a copy of the matrix
     * @return {Ayce.Matrix4} m
     */
    copy: function () {
        var m = new Ayce.Matrix4();
        m.data = new Float32Array(this.data);
        return m;
    },
    /**
     * TODO: Converts Ayce.Matrix4 to Ayce.Matrix3
     * @param {Ayce.Matrix4} toMatrix
     * @return {Ayce.Matrix3} m3
     */
    getMatrix3: function (toMatrix) {
        var m3;
        if(toMatrix){
            m3 = toMatrix;
        }
        else{
            m3 = new Ayce.Matrix3();
        }
        m3.data[0] = this.data[0];
        m3.data[1] = this.data[1];
        m3.data[2] = this.data[2];
        m3.data[3] = this.data[4];
        m3.data[4] = this.data[5];
        m3.data[5] = this.data[6];
        m3.data[6] = this.data[8];
        m3.data[7] = this.data[9];
        m3.data[8] = this.data[10];
        return m3;
    }
};