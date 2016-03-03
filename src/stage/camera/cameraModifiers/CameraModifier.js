/**
 * Creates new camera modifier which should be used as the base for all modifiers
 * @class
 * @constructor
 */
Ayce.CameraModifier = function(){

    this.position = new Ayce.Vector3();
    this.orientation = new Ayce.Quaternion();
    
    this.update = function(){
        
    };
    
    /**
     * Returns orientation from device configuration
     * @return {Ayce.Quaternion} orientation
     */
    this.getOrientation = function(){
        return this.orientation;
    };

    /**
     * Returns position from device configuration
     * @return {Ayce.Vector3} position
     */
    this.getPosition = function(){
        return this.position;
    };
};