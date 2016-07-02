/*jslint browser: true*/
/*globals Ayce*/
/**
 * Handles Oculus Rift input
 * @class
 * @constructor
 */


Ayce.HMDHandler = {
    /**
     * Description
     * @return ArrayExpression
     */
    onHMDReady: null,

    /**
     * Description
     * @return CallExpression
     */
    getPosition: function(){},
    getRotation: function(){},

    /**
     * Description
     */
    update: function(){},
    showInHMD: function(){},
    renderToHMD: function(){},
    exitHMD: function(){},
    resetSensor: function () {return null;},

    /**
     * Description
     * @return BinaryExpression
     */
    isWebVRReady: function(){
        return Boolean(navigator.getVRDisplays||navigator.getVRDevices);
    },

    isHMDReady: function(){return false;},

    getEyeTranslationL: function(){return null;},
    getEyeTranslationR: function(){return null;},
    getEyeFOVL:     function(){return null;},
    getEyeFOVR:     function(){return null;},
    getEyeWidthR:   function(){return null;},
    getEyeWidthL:   function(){return null;},
    getEyeHeightR:  function(){return null;},
    getEyeHeightL:  function(){return null;}
};


(function(){
    if (navigator.getVRDisplays){
        console.log("Using WebVR 1.0 API");
        navigator.getVRDisplays().then(onVRDisplay);
    }
    else if(navigator.getVRDevices){
        console.log("Using WebVR Deprecated API");
        navigator.getVRDevices().then(onVRDevices);
    }

    function onVRDisplay(displays){
        if (displays.length < 1)console.warn("WebVR supported, but no VRDisplays found.");

        var vrDisplay = displays[0];
        Ayce.HMDHandler = new WebVRHMDHandler(vrDisplay, Ayce.HMDHandler.onHMDReady);
    }
    function onVRDevices(devices){
        var vrDevice = null;
        var positionDevice = null;

        //HMD
        for(var i in devices){
            if(devices[i] instanceof HMDVRDevice){
                vrDevice = devices[i];
                break;
            }
        }

        //Position
        for(var i in devices){
            if(devices[i] instanceof PositionSensorVRDevice){
                positionDevice = devices[i];
                break;
            }
        }

        //
        Ayce.HMDHandler = new WebVRHMDHandler_Deprecated(vrDevice, positionDevice, Ayce.HMDHandler.onHMDReady);
        if(Ayce.HMDHandler.onHMDReady){
            Ayce.HMDHandler.onHMDReady();
        }
    }

})();

function WebVRHMDHandler(vrDisplay, onReady){
    this.onHMDReady = onReady;
    var hmdInitialized = true;
    var eyeParamsL = vrDisplay.getEyeParameters( 'left' );
    var eyeParamsR = vrDisplay.getEyeParameters( 'right' );
    var position = new Ayce.Vector3();
    var orientation = new Ayce.Quaternion();
    var currentPose = vrDisplay.getPose();
    window.addEventListener('vrdisplaypresentchange', onVRPresentChange, false);

    this.update = function(){
        currentPose = vrDisplay.getPose();
    };

    this.getPosition = function(){
        var p = currentPose.position;
        if(p)position.set(p[0], p[1], p[2]);
        return position;
    };

    this.getRotation = function(){
        var o = currentPose.orientation;
        orientation.set(o[0], o[1], o[2], o[3]);
        return orientation;
    };

    /**
     * Description
     */
    this.resetSensor = function () {
        vrDisplay.resetPose();
    };

    this.showInHMD = function(canvas){
        vrDisplay.requestPresent([{ source: canvas }]).then(function () {
            //...
        }, function () {
          console.warn("vrDisplay: requestPresent failed.");
        });
    };

    this.exitHMD = function(){
        vrDisplay.exitPresent().then(function () {
            //...
        }, function () {
          console.warn("vrDisplay: exitPresent failed.");
        });
    };

    function onVRPresentChange(state){
        console.log("Presenting in HMD: ",  state);
    }

    this.isHMDReady = function(){
        return hmdInitialized;
    };

    this.renderToHMD = function(){
        if(vrDisplay.isPresenting){
            vrDisplay.submitFrame(currentPose);
        }
    };

    this.getAnimFrame = function(func){
        if(vrDisplay && vrDisplay.isPresenting){
            vrDisplay.requestAnimationFrame(func);
            return true;
        }
        return false;
    };

    /**
     * Description
     * @return BinaryExpression
     */
    this.isWebVRReady = function(){
        return Boolean(navigator.getVRDisplays||navigator.getVRDevices);
    };

    this.getEyeTranslationL = function(){
        return eyeParamsL.offset[0];
    };

    this.getEyeTranslationR = function(){
        return eyeParamsR.offset[0];
    };

    this.getEyeFOVL = function(){
        return eyeParamsL.fieldOfView;
    };

    this.getEyeFOVR = function(){
        return eyeParamsR.fieldOfView;
    };

    this.getEyeWidthR = function(){
        return eyeParamsR.renderWidth;
    };

    this.getEyeWidthL = function(){
        return eyeParamsL.renderWidth;
    };

    this.getEyeHeightR = function(){
        return eyeParamsR.renderHeight;
    };

    this.getEyeHeightL = function(){
        return eyeParamsL.renderHeight;
    };
}
function WebVRHMDHandler_Deprecated(vrDevice, positionDevice, onReady){
    this.onHMDReady = onReady;
    var hmdInitialized = true;
    var eyeParamsL = vrDevice.getEyeParameters( 'left' );
    var eyeParamsR = vrDevice.getEyeParameters( 'right' );
    var position = new Ayce.Vector3();
    var orientation = new Ayce.Quaternion();

    //Not supported
    this.update = function(){};
    this.renderToHMD = function(){};
    this.exitHMD = function(){};


    //
    this.getPosition = function(){
        var p = positionDevice.getState().position;
        if(p)position.set(p.x, p.y, p.z);
        return position;
    };

    this.getRotation = function(){
        var o = positionDevice.getState().orientation;
        orientation.set(o.x, o.y, o.z, o.w);
        return orientation;
    };

    /**
     * Description
     */
    this.resetSensor = function () {
        if ( positionDevice === undefined ) return;

        if ( 'resetSensor' in positionDevice) {
            positionDevice.resetSensor();
        } else if ( 'zeroSensor' in positionDevice) {
            positionDevice.zeroSensor();
        }else{
            console.log("Can't reset position sensor.");
        }

    };

    this.showInHMD = function(canvas){
        var vr = {};
        vr.vrDisplay = vrDevice;
        vr.vrTimewarp = true;

        if (canvas.requestFullscreen) {
          canvas.requestFullscreen(vr);
        } else if (canvas.msRequestFullscreen) {
          canvas.msRequestFullscreen(vr);
        } else if (canvas.mozRequestFullScreen) {
          canvas.mozRequestFullScreen(vr);
        } else if (canvas.webkitRequestFullscreen) {
          canvas.webkitRequestFullscreen(vr);
        }
    };

    this.isHMDReady = function(){
        return hmdInitialized;
    };

    /**
     * Description
     * @return BinaryExpression
     */
    this.isWebVRReady = function(){
        return Boolean(navigator.getVRDisplays||navigator.getVRDevices);
    };

    this.getEyeTranslationL = function(){
        return eyeParamsL.eyeTranslation.x;
    };

    this.getEyeTranslationR = function(){
        return eyeParamsR.eyeTranslation.x;
    };

    this.getEyeFOVL = function(){
        return eyeParamsL.recommendedFieldOfView;
    };

    this.getEyeFOVR = function(){
        return eyeParamsR.recommendedFieldOfView;
    };

    this.getEyeWidthR = function(){
        return eyeParamsR.renderRect.width;
    };

    this.getEyeWidthL = function(){
        return eyeParamsL.renderRect.width;
    };

    this.getEyeHeightR = function(){
        return eyeParamsR.renderRect.height;
    };

    this.getEyeHeightL = function(){
        return eyeParamsL.renderRect.height;
    };
}
