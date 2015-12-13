/**
 * jslint browser: true
 */

/**
 * Creates new quaternion
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @param {Number} w
 * @class
 * @constructor
 */
Ayce.Quaternion = function (x, y, z, w) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.w = w || 1;
};

Ayce.Quaternion.prototype = {

    /**
     * Multiplies two quaternions
     * @param {Ayce.Quaternion} qa
     * @param {Ayce.Quaternion} qb
     */
    multiply: function(qa, qb){
        var w1 = qa.w;
        var x1 = qa.x;
        var y1 = qa.y;
        var z1 = qa.z;
        var w2 = qb.w;
        var x2 = qb.x;
        var y2 = qb.y;
        var z2 = qb.z;
        this.w = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2;
        this.x = w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2;
        this.y = w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2;
        this.z = w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2;
        return this;
    },

    /**
     * Sets quaternion to given values
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     * @param {Number} w
     */
    set: function(x, y, z, w){
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    },

    /**
     * Sets quaternion to rotation around axis
     * @param {Ayce.Vector3} axis
     * @param {Number} angle
     */
    fromAxisAngle: function (axis, angle) {
        axis.normalize();
        var sin_a = Math.sin(angle / 2);
        var cos_a = Math.cos(angle / 2);
        this.x = axis.x * sin_a;
        this.y = axis.y * sin_a;
        this.z = axis.z * sin_a;
        this.w = cos_a;
        this.normalize();
        return this;
    },

    /**
     * Sets Quaternion values based on rotation around euler angles (radians)
     * @param {Number} ax
     * @param {Number} ay
     * @param {Number} az
     */
    fromEulerAngles: function(ax, ay, az) {
        var halfX = ax * 0.5;
        var halfY = ay * 0.5;
        var halfZ = az * 0.5;
        var cosX = Math.cos(halfX);
        var sinX = Math.sin(halfX);
        var cosY = Math.cos(halfY);
        var sinY = Math.sin(halfY);
        var cosZ = Math.cos(halfZ);
        var sinZ = Math.sin(halfZ);
        this.w = cosX * cosY * cosZ + sinX * sinY * sinZ;
        this.x = sinX * cosY * cosZ - cosX * sinY * sinZ;
        this.y = cosX * sinY * cosZ + sinX * cosY * sinZ;
        this.z = cosX * cosY * sinZ - sinX * sinY * cosZ;
        return this;
    },

    /**
     * Normalizes Quaternion
     * @return {Ayce.Quaternion} quaternion
     */
    normalize: function () {
        var x = this.x;
        var y = this.y;
        var z = this.z;
        var w = this.w;

        var mag = 1.0 / Math.sqrt(x * x + y * y + z * z + w * w);
        this.x *= mag;
        this.y *= mag;
        this.z *= mag;
        this.w *= mag;
        
        return this;
    },

    /**
     * Sets quaternion to (0, 0, 0, 1)
     */
    reset: function () {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 1;
    },

    /**
     * TODO: Description
     * @param {Ayce.Vector3} vector
     * @return vector
     */
    rotatePoint: function(vector) {
        var x = this.x;
        var y = this.y;
        var z = this.z;
        var w = this.w;

        var x2 = vector.x;
        var y2 = vector.y;
        var z2 = vector.z;

        var w1 = -x * x2 - y * y2 - z * z2;
        var x1 = w * x2 + y * z2 - z * y2;
        var y1 = w * y2 - x * z2 + z * x2;
        var z1 = w * z2 + x * y2 - y * x2;

        vector.x = -w1 * x + x1 * w - y1 * z + z1 * y;
        vector.y = -w1 * y + x1 * z + y1 * w - z1 * x;
        vector.z = -w1 * z - x1 * y + y1 * x + z1 * w;
        return vector;
    },

    /**
     * TODO: Description
     * @param {Ayce.Vector3} vector
     * @param {Ayce.Vector3} target
     * @return {Ayce.Vector3} v
     */
    getRotatedPoint: function(vector, target) {
        var x = this.x;
        var y = this.y;
        var z = this.z;
        var w = this.w;

        var x1;
        var y1;
        var z1;
        var w1;

        var x2 = vector.x;
        var y2 = vector.y;
        var z2 = vector.z;

        w1 = -x * x2 - y * y2 - z * z2;
        x1 = w * x2 + y * z2 - z * y2;
        y1 = w * y2 - x * z2 + z * x2;
        z1 = w * z2 + x * y2 - y * x2;
        
        var v = target ? target : new Ayce.Vector3();
        v.x = -w1 * x + x1 * w - y1 * z + z1 * y;
        v.y = -w1 * y + x1 * z + y1 * w - z1 * x;
        v.z = -w1 * z - x1 * y + y1 * x + z1 * w;
        return v;
    },

    /**
     * TODO: Description
     * @param {Ayce.Matrix4} matrix
     */
    toRotationMatrix: function (matrix) {
        var x = this.x;
        var y = this.y;
        var z = this.z;
        var w = this.w;

        var xx = x * x;
        var xy = x * y;
        var xz = x * z;
        var xw = x * w;
        var yy = y * y;
        var yz = y * z;
        var yw = y * w;
        var zz = z * z;
        var zw = z * w;

        matrix.data[0] = 1 - 2 * (yy + zz);
        matrix.data[1] = 2 * (xy - zw);
        matrix.data[2] = 2 * (xz + yw);
        matrix.data[4] = 2 * (xy + zw);
        matrix.data[5] = 1 - 2 * (xx + zz);
        matrix.data[6] = 2 * (yz - xw);
        matrix.data[8] = 2 * (xz - yw);
        matrix.data[9] = 2 * (yz + xw);
        matrix.data[10] = 1 - 2 * (xx + yy);
        matrix.data[3] = matrix.data[7] = matrix.data[11] = matrix.data[12] = matrix.data[13] = matrix.data[14] = 0;
        matrix.data[15] = 1;
    },

    /**
     * Returns conjugated quaternion
     * @return {Ayce.Quaternion} quaternion
     */
    getConjugate: function(target){
        this.normalize();
        if(target){
            target.x = -this.x;
            target.y = -this.y;
            target.z = -this.z;
            target.w = this.w;
            return target;
        }
        else{
            return new Ayce.Quaternion(-this.x, -this.y, -this.z, this.w);
        }
    },

    /**
     * Returns copy of quaternion
     * @return {Ayce.Quaternion} quaternion
     */
    copy: function(){
        return new Ayce.Quaternion(this.x, this.y, this.z, this.w);
    },

    /**
     * Copies values from one quaternion to another
     * @param {} from
     * @param {} to
     */
    copyToQuaternion: function(from, to){
        to.x = from.x;
        to.y = from.y;
        to.z = from.z;
        to.w = from.w;
    },

    /**
     * TODO: Description
     * @param {} ga
     * @param {} gb
     * @param {} t
     */
    slerp: function(qa, qb, t){
        var w1 = qa.w;
        var x1 = qa.x;
        var y1 = qa.y;
        var z1 = qa.z;
        var w2 = qb.w;
        var x2 = qb.x;
        var y2 = qb.y;
        var z2 = qb.z;
        var dot = w1 * w2 + x1 * x2 + y1 * y2 + z1 * z2;
        
        if (dot < 0) {
            dot = -dot;
            w2 = -w2;
            x2 = -x2;
            y2 = -y2;
            z2 = -z2;
        }
        if (dot < 0.95) {
            var angle = Math.acos(dot);
            var s = 1 / Math.sin(angle);
            var s1 = Math.sin(angle * (1 - t)) * s;
            var s2 = Math.sin(angle * t) * s;
            this.w = w1 * s1 + w2 * s2;
            this.x = x1 * s1 + x2 * s2;
            this.y = y1 * s1 + y2 * s2;
            this.z = z1 * s1 + z2 * s2;
        }
        else {
            this.w = w1 + t * (w2 - w1);
            this.x = x1 + t * (x2 - x1);
            this.y = y1 + t * (y2 - y1);
            this.z = z1 + t * (z2 - z1);
            var len = 1.0 / Math.sqrt(this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z);
            this.w *= len;
            this.x *= len;
            this.y *= len;
            this.z *= len;
        }
    },

    /**
     * Returns forward vector
     * @returns {Ayce.Vector3} vector
     */
    getForwardVector: function(){
        return new Ayce.Vector3(
            2 * (this.x * this.z + this.w * this.y),
            2 * (this.y * this.x - this.w * this.x),
            1 - 2 * (this.x * this.x + this.y * this.y));
    },

    /**
     * Returns up vector
     * @returns {Ayce.Vector3} vector
     */
    getUpVector: function(){
        return new Ayce.Vector3(
            2 * (this.x * this.y - this.w * this.z),
            1 - 2 * (this.x * this.x + this.z * this.z),
            2 * (this.y * this.z + this.w * this.x));
    },

    /**
     * Returns right vector
     * @returns {Ayce.Vector3} vector
     */
    getRightVector: function(){
        return new Ayce.Vector3(
            1 - 2 * (this.y * this.y + this.z * this.z),
            2 * (this.x * this.y + this.w * this.z),
            2 * (this.x * this.z - this.w * this.y));
    }
};