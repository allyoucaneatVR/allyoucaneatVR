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
    resetSensor: function () {return null;},
    showInHMD: function(){return null;},
    
    /**
     * Description
     * @return BinaryExpression
     */
    isWebVRReady: function(){
        return (navigator.getVRDevices !== undefined);
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
    if (!navigator.getVRDevices)return;
    navigator.getVRDevices().then( onVRDevices );
    
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
        Ayce.HMDHandler = new WebVRHMDHandler(vrDevice, positionDevice, Ayce.HMDHandler.onHMDReady);
        if(Ayce.HMDHandler.onHMDReady){
            Ayce.HMDHandler.onHMDReady();
        }
    }
})();

function WebVRHMDHandler(vrDevice, positionDevice, onReady){
    this.onHMDReady = onReady;
    var hmdInitialized = true;
    var eyeParamsL = vrDevice.getEyeParameters( 'left' );
    var eyeParamsR = vrDevice.getEyeParameters( 'right' );
    var position = new Ayce.Vector3();
    var orientation = new Ayce.Quaternion();
    
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
        return (navigator.getVRDevices !== undefined);
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
