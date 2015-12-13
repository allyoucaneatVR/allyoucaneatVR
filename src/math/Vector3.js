/**
 * jslint browser: true
 */

/**
 * Creates new vector3;
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @class
 * @constructor
 */
Ayce.Vector3 = function (x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
};

Ayce.Vector3.prototype = {
    /**
     * Returns length of vector
     * @return {Number} length
     */
    getLength: function () {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    },

    /**
     * Converts vector to unit vector
     * @return {Ayce.Vector3} vector
     */
    normalize: function () {
        var l = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
        if (l !== 0) {
            this.x /= l;
            this.y /= l;
            this.z /= l;
        }
        return this;
    },

    /**
     * Negates vector
     * @return {Ayce.Vector3} Ayce.Vector3
     */
    negate: function(){
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    },

    /**
     * Sets Vector to (0, 0, 0)
     * @return {Ayce.Vector3} vector
     */
    nullVector: function(){
        this.x = 0;
        this.y = 0;
        this.z = 0;
        return this;
    },

    /**
     * Scales vector by given factor
     * @param {Number} s
     * @return {Ayce.Vector3} vector
     */
    scaleBy: function(s){
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    },

    /**
     * Sets vector to given values
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     * @return {Ayce.Vector3} vector
     */
    set: function(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    },

    /**
     * Adds values to vector
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     * @return {Ayce.Vector3} vector
     */
    add: function(x, y, z){
        this.x += x;
        this.y += y;
        this.z += z;
        return this;
    },

    /**
     * Subtracts values off of vector
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     * @return {Ayce.Vector3} vector
     */
    subtract: function(x, y, z){
        this.x -= x;
        this.y -= y;
        this.z -= z;
        return this;
    },

    /**
     * Multiplies vector by values
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     * @return {Ayce.Vector3} vector
     */
    multiply: function(x, y, z){
        this.x *= x;
        this.y *= y;
        this.z *= z;
        return this;
    },

    /**
     * Returns distance between two points
     * @param {Ayce.Vector3} pt1
     * @param {Ayce.Vector3} pt2
     * @return {Number} distance
     */
    distance: function(pt1, pt2){
        var x = pt2.x - pt1.x;
        var y = pt2.y - pt1.y;
        var z = pt2.z - pt1.z;
        return Math.sqrt (x * x + y * y + z * z);
    },

    /**
     * Returns dot product
     * @param {Ayce.Vector3} a
     * @return {Number} product
     */
    dotProduct: function(a) {
        return this.x * a.x + this.y * a.y + this.z * a.z;
    },

    /**
     * Returns cross product
     * @param {Ayce.Vector3} a
     * @return {Ayce.Vector3} vector
     */
    crossProduct: function (a) {
        return new Ayce.Vector3(this.y * a.z - this.z * a.y, this.z * a.x - this.x * a.z, this.x * a.y - this.y * a.x);
    },

    /**
     * Adds vector
     * @param {Ayce.Vector3} v
     * @return {Ayce.Vector3} vector
     */
    addVector3: function(v){
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    },

    /**
     * Copies values from one vector to another
     * @param {Ayce.Vector3} from
     * @param {Ayce.Vector3} to
     */
    copyToVector: function(from, to){
        to.x = from.x;
        to.y = from.y;
        to.z = from.z;
    },

    /**
     * Returns copy of vector
     * @return {Ayce.Vector3} vector
     */
    copy: function(){
        return new Ayce.Vector3(this.x, this.y, this.z);
    }
};