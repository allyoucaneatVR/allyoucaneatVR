/**
 * jslint browser: true
 */

/**
 * Creates new camera manager that uses device configurations as input.
 * @class
 * @constructor
 */
ayce.CameraManager = function () {

    var scope = this;

    var position = new ayce.Vector3();
    var orientation = new ayce.Quaternion();

    this.cameraProperties = {
        vrDevice: null,
        eyeTranslationL: -0.03,
        eyeTranslationR: 0.03,
        eyeFOVR: 90,
        renderRectWidth: null,
        renderRectHeight: null
    };

    /**
     * Returns true if WebVR is being used. Not necessarily the case for Cardboard websites.
     * @return {Boolean} isVR
     */
    this.isInputVR = function(){
        for(i=0; i<this.modifiers.length; i++){
            if(this.modifiers[i] instanceof ayce.WebVR){
                return true;
            }
        }
        return false;
    };

    this.modifiers = [];//(Array.isArray(device)) ? device: [device];
    var isHMDInitialized = false;// !this.isInputVR();

    /**
     * Sets up HMD input for the Oculus Rift.
     * @param {Object} HMDData
     */
    var initHMDControls = function(HMDData){
        var eyeParamsL = HMDData[0];
        var eyeParamsR = HMDData[1];

        scope.cameraProperties.vrDevice = vrDevice;
        scope.cameraProperties.eyeTranslationL = eyeParamsL.eyeTranslation.x;
        scope.cameraProperties.eyeTranslationR = eyeParamsR.eyeTranslation.x;
        scope.cameraProperties.eyeFOVL = eyeParamsL.recommendedFieldOfView;
        scope.cameraProperties.eyeFOVR = eyeParamsR.recommendedFieldOfView;

        //RenderRect size
        var leftEyeRect = eyeParamsL.renderRect;
        var rightEyeRect = eyeParamsR.renderRect;
        scope.cameraProperties.renderRectWidth = rightEyeRect.x + rightEyeRect.width;
        scope.cameraProperties.renderRectHeight = Math.max(leftEyeRect.y + leftEyeRect.height, rightEyeRect.y + rightEyeRect.height);
    };

    var i;
    /**
     * Updates position and orientation variables based on all added input methods.
     */
    this.update = function(){
        for(i=0; i<this.modifiers.length; i++){
            this.modifiers[i].update(this.getGlobalRotation().getConjugate());
        }
        
        position.nullVector();
        orientation.reset();
        
        for(i=0; i<this.modifiers.length; i++){
            if(!isHMDInitialized && this.modifiers[i] instanceof ayce.WebVR){
                var HMDData = this.modifiers[i].getHMDData();
                if(HMDData !== null){
                    initHMDControls(HMDData);
                    isHMDInitialized = true;
                }
            }
            orientation.multiply(orientation, this.modifiers[i].getOrientation());
            var pos = this.modifiers[i].getPosition();
            position.add(pos.x, pos.y, pos.z);
        }
    };

    /**
     * Returns current global camera position.
     * @return {ayce.Vector3} position
     */
    this.getGlobalPosition = function(){
        return position;
    };

    /**
     * Returns current global camera orientation.
     * @return {ayce.Quaternion} orientation
     */
    this.getGlobalRotation = function(){
        return orientation;
    };
    
    this.clearModifiers = function(){
        this.modifiers = [];
    };

};

ayce.CameraManager.prototype = {};