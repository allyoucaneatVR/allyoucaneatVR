/**
 * jslint browser: true
 */

/**
 * Creates device configuration for the Oculus Rift. Only works in WebVR compatible browsers
 * @class
 * @constructor
 */
ayce.WebVR = function () {

    var scope = this;
    var position = new ayce.Vector3();
    var orientation = new ayce.Quaternion();

    /**
     * Description
     * @return CallExpression
     */
    this.getHMDData = function(){
        return ayce.HMDHandler.getHMDData();
    };
    
    var o = new ayce.Quaternion();
    var p = new ayce.Vector3();
    this.update = function(playerRotation){
        if (ayce.KeyboardHandler.isKeyDown("R"))ayce.HMDHandler.resetSensor();
        var data = ayce.HMDHandler.getPositionalData();
        
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

ayce.WebVR.prototype = new ayce.CameraModifier();