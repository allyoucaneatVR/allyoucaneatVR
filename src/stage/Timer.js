/**
 * jslint browser: true
 */

/**
 * Creates a new timer
 * @class
 * @constructor
 */
Ayce.Timer = function () {

};

Ayce.Timer.prototype = {

};

/**
 * Returns current time
 * @return {Number} time
 */
Ayce.Timer.prototype.getCurrentTimeMs = function(){
    return new Date().getTime();
};