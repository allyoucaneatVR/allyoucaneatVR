/**
 * jslint browser: true
 */

/**
 * Creates device configuration for the Oculus Rift. Only works in WebVR compatible browsers
 * @class
 * @constructor
 */
Ayce.WebVR = function () {
    var scope = this;
    var position = new Ayce.Vector3();
    var orientation = new Ayce.Quaternion();
    
    this.update = function(playerRotation){
        Ayce.HMDHandler.update();
        if (Ayce.KeyboardHandler.isKeyDown("R"))Ayce.HMDHandler.resetSensor();
        
        var p = Ayce.HMDHandler.getPosition();
        var o = Ayce.HMDHandler.getRotation();
        
        orientation = o.getConjugate();
        position = o.multiply(playerRotation, orientation).rotatePoint(p);
    };

    /**   //TODO: remove if HMD still works
     * Description
     * @return position
     */
    this.getPosition = function () {
        return position;
    };
    
    /**
     * Description
     * @return CallExpression
     */
    this.getOrientation = function(){
        return orientation;
    };
};

Ayce.WebVR.prototype = new Ayce.CameraModifier();