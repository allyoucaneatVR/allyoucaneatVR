/**
 * Handles Oculus Rift input
 * @class
 * @constructor
 */
Ayce.HMDHandler = function(){};

var vrDevice = null;
var positionDevice = null;

/**
 * Description
 * @return ArrayExpression
 */
Ayce.HMDHandler.getHMDData = function(){
    if(!vrDevice)return null;
    
    var eyeParamsL = vrDevice.getEyeParameters( 'left' );
    var eyeParamsR = vrDevice.getEyeParameters( 'right' );
    
    return [eyeParamsL, eyeParamsR];
};

/**
 * Description
 * @return CallExpression
 */
Ayce.HMDHandler.getPositionalData = function(){
    if(positionDevice === null)return;
    return positionDevice.getState();
};

/**
 * Description
 */
Ayce.HMDHandler.resetSensor = function () {
    if ( positionDevice === undefined ) return;

    if ( 'resetSensor' in positionDevice) {
        positionDevice.resetSensor();
    } else if ( 'zeroSensor' in positionDevice) {
        positionDevice.zeroSensor();
    }else{
        console.log("Can't reset position sensor.");
    }

};

(function(){
    if (!navigator.getVRDevices)return;
    navigator.getVRDevices().then( onVRDevices );
    
    function onVRDevices(devices){
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
    }
})();

/**
 * Description
 * @return BinaryExpression
 */
Ayce.HMDHandler.isWebVRReady = function(){
    return (navigator.getVRDevices !== undefined);
};

Ayce.HMDHandler.prototype = {};