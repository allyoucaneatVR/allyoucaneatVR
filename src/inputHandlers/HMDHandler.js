/**
 * Handles Oculus Rift input
 * @class
 * @constructor
 */
ayce.HMDHandler = function(){};

var vrDevice = null;
var eyeParamsL = null;
var eyeParamsR = null;
var positionDevice = null;
var foundHMD = false;


/**
 * Description
 * @return ArrayExpression
 */
ayce.HMDHandler.getHMDData = function(){
    if(!eyeParamsL || !eyeParamsR){
        return null;
    }
    return [eyeParamsL, eyeParamsR];
};

/**
 * Description
 * @return CallExpression
 */
ayce.HMDHandler.getPositionalData = function(){
    if(positionDevice === null){return;}

    return positionDevice.getState();
};

/**
 * Description
 */
ayce.HMDHandler.isPositionDevice = function(){
    if(vrDevice === null && positionDevice !== null){
        return true;
    }else if(vrDevice !== null && positionDevice === null){
        return false;
    }
};

/**
 * Description
 */
ayce.HMDHandler.resetSensor = function () {
    if ( positionDevice === undefined ) return;

    if ( 'resetSensor' in positionDevice) {
        positionDevice.resetSensor();
    } else if ( 'zeroSensor' in positionDevice) {
        positionDevice.zeroSensor();
    }else{
        console.log("Can't reset position sensor.");
    }

};

var onVRDevices = function(devices){
    for(var i in devices){
        if(devices[i] instanceof HMDVRDevice && vrDevice === null){
            vrDevice = devices[i];
            eyeParamsL = vrDevice.getEyeParameters( 'left' );
            eyeParamsR = vrDevice.getEyeParameters( 'right' );
            foundHMD = true;
        }
        else if(devices[i] instanceof PositionSensorVRDevice && positionDevice === null){
            positionDevice = devices[i];
        }
    }
};

if (navigator.getVRDevices !== undefined ) {
    navigator.getVRDevices().then( onVRDevices );
}

/**
 * Description
 * @return BinaryExpression
 */
ayce.HMDHandler.isWebVRReady = function(){
    return (navigator.getVRDevices !== undefined);
};

ayce.HMDHandler.prototype = {

};