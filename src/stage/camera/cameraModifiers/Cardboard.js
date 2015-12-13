/**
 * jslint browser: true
 */

/**
 * Creates new VR device configuration for Google Cardboard (and similar viewers).
 * @class
 * @constructor
 */
Ayce.Cardboard = function () {
    
    Ayce.CameraModifier.call(this);
    
    var orientation = new Ayce.Quaternion();

    var degToRad = function(degrees){
        return degrees * Math.PI / 180;
    };

    this.update = function(){
        var alpha = degToRad(-Ayce.SensorsHandler.getRoll()+180);
        var beta = degToRad(-Ayce.SensorsHandler.getPitch());
        var gamma = degToRad(Ayce.SensorsHandler.getYaw()+90);
        var c1 = Math.cos(alpha/2);
        var c2 = Math.cos(beta/2);
        var c3 = Math.cos(gamma/2);
        var s1 = Math.sin(alpha/2);
        var s2 = Math.sin(beta/2);
        var s3 = Math.sin(gamma/2);
        orientation.x = s1*s2*c3 +c1*c2*s3;
        orientation.y = s1*c2*c3 + c1*s2*s3;
        orientation.z = -(c1*s2*c3 - s1*c2*s3);
        orientation.w = c1*c2*c3 - s1*s2*s3;
    };

    /**
     * Returns current orientation of the device based on accelerometer / gyroscope as a quaternion
     * @return {Ayce.Quaternion} orientation
     */
    this.getOrientation = function(){
        return orientation;
    };
};

Ayce.Cardboard.prototype = new Ayce.CameraModifier();