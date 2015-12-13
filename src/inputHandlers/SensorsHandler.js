/**
 * jslint browser: true
 */

/**
 * Handles Accelerometer / Gyroscope input
 * @class
 * @constructor
 */
Ayce.SensorsHandler = function () {

    var scope = this;

    this.alpha = 0;
    this.beta = 0;
    this.gamma = 0;

    if (window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", function (event) {
            scope.alpha = event.alpha;
            scope.beta = event.beta;
            scope.gamma = event.gamma;
        }, true);
    }
};

var sensorsHandler = null;

/**
 * Returns roll value (alpha) from accelerometer / gyroscope
 * @return Number
 */
Ayce.SensorsHandler.getRoll = function(){
    if(sensorsHandler == null){
        sensorsHandler = new Ayce.SensorsHandler();
    }
    return sensorsHandler.alpha;
};

/**
 * Returns pitch value (beta) from accelerometer / gyroscope
 * @return Number
 */
Ayce.SensorsHandler.getPitch = function(){
    if(sensorsHandler == null){
        sensorsHandler = new Ayce.SensorsHandler();
    }
    return sensorsHandler.beta;
};

/**
 * Returns yaw value (gamma) from accelerometer / gyroscope
 * @return Number
 */
Ayce.SensorsHandler.getYaw = function(){
    if(sensorsHandler == null){
        sensorsHandler = new Ayce.SensorsHandler();
    }
    return sensorsHandler.gamma;
};

Ayce.SensorsHandler.prototype = {

};