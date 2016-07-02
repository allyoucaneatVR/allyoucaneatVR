/**
 * lsint browser: true
 */

/**
 * Creates new camera object
 * @param {Ayce.CameraManager} cameraManager
 * @constructor
 */
Ayce.Camera = function (cameraManager) {
    var scope = this;
    this.useVR = false;
    var isFullscreen = false;

    var position = new Ayce.Vector3();     //local position
    var rotation = new Ayce.Quaternion();

    var viewMatrixPool = new Ayce.Matrix4();
    var viewMatrix = new Ayce.Matrix4();
    var viewMatrixLeft = new Ayce.Matrix4();
    var viewMatrixRight = new Ayce.Matrix4();

    var perspectiveMatrix = null;
    var perspectiveMatrixLeft = null;
    var perspectiveMatrixRight = null;

    this.fieldOfView = 60;
    this.nearPlane = 0.1;
    this.farPlane = 200.0;

    this.width = 1;
    this.height = 1;

    this.isOrtho = false;

    var forwardVector = new Ayce.Vector3();

    /**
     * Updates camera
     */
    this.update = function(){
        //update cameraController
        cameraManager.update();
        
        //update camera position and orientation from cameraController
        position = cameraManager.getGlobalPosition();
        rotation = cameraManager.getGlobalRotation().getConjugate();
        
        calculateViewMatrix();
    };

    /**
     * Updates projection matrix
     */
    this.updateProjectionMatrix = function (){
        var aspectRatio = this.width/this.height;
        if(cameraManager && cameraManager.isInputVR() && cameraManager.cameraProperties.eyeFOVL){
            perspectiveMatrixLeft = Ayce.Matrix4.makeVRPerspective(cameraManager.cameraProperties.eyeFOVL, this.nearPlane, this.farPlane);
            perspectiveMatrixRight = Ayce.Matrix4.makeVRPerspective(cameraManager.cameraProperties.eyeFOVR, this.nearPlane, this.farPlane);
        }else{
            if(!this.isOrtho) {
                perspectiveMatrix = Ayce.Matrix4.makePerspective(this.fieldOfView, aspectRatio, this.nearPlane, this.farPlane);
            }else{
                perspectiveMatrix = Ayce.Matrix4.makeOrthoPerspective(-1.0, 1.0, 1.0, -1.0, 0.5, 1.5);
            }
        }
    };

    /**
     * Sets canvas to full screen
     * @param {Boolean} boolean
     */
    this.setFullscreen = function (boolean, canvas) {
        if ( isFullscreen === boolean ) return;
        isFullscreen = boolean;
        
        //Enter Fullscreen
        if(boolean){
            if (canvas.requestFullscreen) {
              canvas.requestFullscreen();
            } else if (canvas.msRequestFullscreen) {
              canvas.msRequestFullscreen();
            } else if (canvas.mozRequestFullScreen) {
              canvas.mozRequestFullScreen();
            } else if (canvas.webkitRequestFullscreen) {
              canvas.webkitRequestFullscreen();
            }
        }
        //Exit Fullscreen
        else{
            if (document.exitFullscreen) {
              document.exitFullscreen();
            } else if (document.msExitFullscreen) {
              document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
            }
            return;
        }
    };

    /**
     * Calculates view matrices for both eyes
     */
    var calculateViewMatrix = function (){
        if(scope.useVR){
            var eyeL = cameraManager.cameraProperties.eyeTranslationL;
            var eyeR = cameraManager.cameraProperties.eyeTranslationR;
            
            //Left View Matrix
            viewMatrixLeft.identity();
            viewMatrixLeft.applyTranslation(-position.x, -position.y, -position.z);
            rotation.toRotationMatrix(viewMatrixPool);
            viewMatrixLeft.apply(viewMatrixPool);
            viewMatrixLeft.applyTranslation(-eyeL, 0, 0);
            
            //Right View Matrix
            viewMatrixRight.identity();
            viewMatrixRight.applyTranslation(-position.x, -position.y, -position.z);
            rotation.toRotationMatrix(viewMatrixPool);
            viewMatrixRight.apply(viewMatrixPool);
            viewMatrixRight.applyTranslation(-eyeR, 0, 0);
        } else{
            viewMatrix.identity();
            viewMatrix.applyTranslation(-position.x, -position.y, -position.z);
            rotation.toRotationMatrix(viewMatrixPool);
            viewMatrix.apply(viewMatrixPool);
        }
    };

    /**
     * Returns camera controller
     * @return {Ayce.CameraManager} cameraController
     */
    this.getManager = function(){
        return cameraManager;
    };

    /**
     * Returns view matrix for respective eye
     * @return {Ayce.Matrix4} viewMatrix
     */
    this.getViewMatrix = function(eye){
        if(eye === "left"){
            return viewMatrixLeft;
        }
        else if(eye === "right"){
            return viewMatrixRight;
        }
        else{
            return viewMatrix;
        }
    };

    /**
     * Returns perspective matrix for respective eye
     * @param {String} eye
     * @return {Ayce.Matrix4} perspectiveMatrix
     */
    this.getPerspectiveMatrix = function(eye){
        if(eye === "left" && perspectiveMatrixLeft !== null){
            return perspectiveMatrixLeft;
        }
        else if(eye === "right" && perspectiveMatrixRight !== null){
            return perspectiveMatrixRight;
        }
        else{
            return perspectiveMatrix;
        }
    };

    /**
     * Returns x eye distance from center for respective eye
     * @param {String} eye
     * @return {Number} distance
     */
    this.getEyeTranslation = function(eye){
        if(eye === "left"){
            return cameraManager.cameraProperties.eyeTranslationL;
        }
        else if(eye === "right"){
            return cameraManager.cameraProperties.eyeTranslationR;
        }
        else{
            return null;
        }
    };

    /**
     * Returns camera forvard vector
     * @return {Ayce.Vector3} forwardVector
     */
    this.getForwardVector = function(){
        if(scope.useVR){
            forwardVector.x = -viewMatrixLeft.data[2];
            forwardVector.y = -viewMatrixLeft.data[6];
            forwardVector.z = -viewMatrixLeft.data[10];
            return forwardVector;
        }else {
            forwardVector.x = -viewMatrix.data[2];
            forwardVector.y = -viewMatrix.data[6];
            forwardVector.z = -viewMatrix.data[10];
            return forwardVector;
        }
    };
    
    this.isFullscreen = function(){
        return isFullscreen;
    };
};

Ayce.Camera.prototype = {

};