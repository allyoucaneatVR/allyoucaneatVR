/**
 * jslint browser: true
 */

/**
 * Creates new vector2;
 * @param {Number} x
 * @param {Number} y
 * @class
 * @constructor
 */
ayce.Vector2 = function (x, y) {
    this.x = x || 0;
    this.y = y || 0;
};

ayce.Vector2.prototype = {
    /**
     * Returns length of vector
     * @return {Number} length
     */
    getLength: function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    /**
     * Converts vector to unit vector
     * @return {ayce.Vector2} vector
     */
    normalize: function () {
        var l = Math.sqrt(this.x*this.x + this.y*this.y);
        if (l !== 0) {
            this.x /= l;
            this.y /= l;
        }
        return this;
    },

    /**
     * Negates vector
     * @return {ayce.Vector2} ayce.Vector2
     */
    negate: function(){
        this.x = -this.x;
        this.y = -this.y;
        return this;
    },

    /**
     * Sets Vector to (0, 0, 0)
     * @return {ayce.Vector2} vector
     */
    nullVector: function(){
        this.x = 0;
        this.y = 0;
        return this;
    },

    /**
     * Scales vector by given factor
     * @param {Number} s
     * @return {ayce.Vector2} vector
     */
    scaleBy: function(s){
        this.x *= s;
        this.y *= s;
        return this;
    },

    /**
     * Sets vector to given values
     * @param {Number} x
     * @param {Number} y
     * @return {ayce.Vector2} vector
     */
    set: function(x, y){
        this.x = x;
        this.y = y;
        return this;
    },

    /**
     * Adds values to vector
     * @param {Number} x
     * @param {Number} y
     * @return {ayce.Vector2} vector
     */
    add: function(x, y){
        this.x += x;
        this.y += y;
        return this;
    },

    /**
     * Subtracts values off of vector
     * @param {Number} x
     * @param {Number} y
     * @return {ayce.Vector2} vector
     */
    subtract: function(x, y){
        this.x -= x;
        this.y -= y;
        return this;
    },

    /**
     * Multiplies vector by values
     * @param {Number} x
     * @param {Number} y
     * @return {ayce.Vector2} vector
     */
    multiply: function(x, y){
        this.x *= x;
        this.y *= y;
        return this;
    },

    /**
     * Returns distance between two points
     * @param {ayce.Vector2} pt1
     * @param {ayce.Vector2} pt2
     * @return {Number} distance
     */
    distance: function(pt1, pt2){
        var x = pt2.x - pt1.x;
        var y = pt2.y - pt1.y;
        return Math.sqrt (x * x + y * y);
    },

    /**
     * Returns dot product
     * @param {ayce.Vector2} a
     * @return {Number} product
     */
    dotProduct: function(a) {
        return this.x * a.x + this.y * a.y;
    },

    /**
     * Adds vector
     * @param {ayce.Vector2} v
     * @return {ayce.Vector2} vector
     */
    addVector2: function(v){
        this.x += v.x;
        this.y += v.y;
        return this;
    },

    /**
     * Copies values from one vector to another
     * @param {ayce.Vector2} from
     * @param {ayce.Vector2} to
     */
    copyToVector: function(from, to){
        to.x = from.x;
        to.y = from.y;
    },

    /**
     * Returns copy of vector
     * @return {ayce.Vector2} vector
     */
    copy: function(){
        return new ayce.Vector2(this.x, this.y);
    }
};