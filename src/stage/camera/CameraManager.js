/**
 * jslint browser: true
 */

/**
 * Creates new camera manager that uses device configurations as input.
 * @class
 * @constructor
 */
Ayce.CameraManager = function() {
    var scope = this;

    var position = new Ayce.Vector3();
    var orientation = new Ayce.Quaternion();

    this.cameraProperties = {
        eyeTranslationL: -0.03,
        eyeTranslationR: 0.03,
        eyeFOVR: 90,
        eyeFOVL: null,
        renderRectWidth: null,
        renderRectHeight: null
    };

    this.modifiers = [];

    /**
     * Sets up HMD input for the Oculus Rift.
     * @param {Object} hmdData
     */
    this.initHMDControls = function() {
        scope.cameraProperties.eyeTranslationL = Ayce.HMDHandler.getEyeTranslationL();
        scope.cameraProperties.eyeTranslationR = Ayce.HMDHandler.getEyeTranslationR();
        scope.cameraProperties.eyeFOVL = Ayce.HMDHandler.getEyeFOVL();
        scope.cameraProperties.eyeFOVR = Ayce.HMDHandler.getEyeFOVR();
        scope.cameraProperties.renderRectWidth = Ayce.HMDHandler.getEyeWidthR() + Ayce.HMDHandler.getEyeWidthL();
        scope.cameraProperties.renderRectHeight = Math.max(Ayce.HMDHandler.getEyeHeightR(), Ayce.HMDHandler.getEyeHeightL());
    };

    /**
     * Updates position and orientation variables based on all added input methods.
     */
    this.update = function() {
        var i;
        for (i = 0; i < this.modifiers.length; i++) {
            this.modifiers[i].update(this.getGlobalRotation().getConjugate());
        }

        position.nullVector();
        orientation.reset();

        for (i = 0; i < this.modifiers.length; i++) {
            orientation.multiply(orientation, this.modifiers[i].getOrientation());
            var pos = this.modifiers[i].getPosition();
            position.add(pos.x, pos.y, pos.z);
        }
    };

    /**
     * Returns current global camera position.
     * @return {Ayce.Vector3} position
     */
    this.getGlobalPosition = function() {
        return position;
    };

    /**
     * Returns current global camera orientation.
     * @return {Ayce.Quaternion} orientation
     */
    this.getGlobalRotation = function() {
        return orientation;
    };

    this.clearModifiers = function() {
        this.modifiers = [];
    };

    /**
     * Returns true if WebVR is being used. Not necessarily the case for Cardboard websites.
     * @return {Boolean} isVR
     */
    this.isInputVR = function() {
        for (var i = 0; i < this.modifiers.length; i++) {
            if (this.modifiers[i] instanceof Ayce.WebVR) {
                return true;
            }
        }
        return false;
    };

};

Ayce.CameraManager.prototype = {};