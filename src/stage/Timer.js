/**
 * jslint browser: true
 */

/**
 * Creates a new timer
 * @class
 * @constructor
 */
ayce.Timer = function () {

};

ayce.Timer.prototype = {

};

/**
 * Returns current time
 * @return {Number} time
 */
ayce.Timer.prototype.getCurrentTimeMs = function(){
    return new Date().getTime();
};