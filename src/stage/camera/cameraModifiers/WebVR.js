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
    var o = new Ayce.Quaternion();
    var p = new Ayce.Vector3();

    /**
     * Description
     * @return CallExpression
     */
    this.getHMDData = function(){
        return Ayce.HMDHandler.getHMDData();
    };
    
    this.update = function(playerRotation){
        if (Ayce.KeyboardHandler.isKeyDown("R"))Ayce.HMDHandler.resetSensor();
        var data = Ayce.HMDHandler.getPositionalData();
        
        if(data){
            if(data.position){
                position.x = data.position.x;
                position.y = data.position.y;
                position.z = data.position.z;
                position.w = data.position.w;
            }
            orientation.x = data.orientation.x;
            orientation.y = data.orientation.y;
            orientation.z = data.orientation.z;
            orientation.w = data.orientation.w;
        }
        
        position = o.multiply(playerRotation, orientation.getConjugate()).rotatePoint(p);
        orientation = orientation.getConjugate();
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