/**
 * Creates new camera modifier which should be used as the base for all modifiers
 * @class
 * @constructor
 */
ayce.CameraModifier = function(){

    this.position = new ayce.Vector3();
    this.orientation = new ayce.Quaternion();
    
    this.update = function(){
        
    };
    
    /**
     * Returns orientation from device configuration
     * @return {ayce.Quaternion} orientation
     */
    this.getOrientation = function(){
        return this.orientation;
    };

    /**
     * Returns position from device configuration
     * @return {ayce.Vector3} position
     */
    this.getPosition = function(){
        return this.position;
    };

    this.getHMDData = function(){
        return null;
    };
};