/**
 * Handles gamepad input
 * @class
 * @constructor
 */
Ayce.GamepadHandler = function(){};

/**
 * Returns all detected gamepads
 */
Ayce.GamepadHandler.getGamepads = function(){
    if(APISupported){
        return navigator.getGamepads();
    }
};

var APISupported = null;

var init = function () {
    if (navigator.getGamepads) {
        APISupported = true;
        console.log("Gamepad API supported");
        if ('ongamepadconnected' in window) {       /* TODO: implement support for ongamepadconnected event
         (currently only available in canary browser builds)*/
            console.log("ongamepadconnected supported");
            //window.addEventListener('gamepadconnected', onGamepadConnect(), false);
            //window.addEventListener('gamepaddisconnected', onGamepadDisconnect(), false);
        } else {
            console.log("ongamepadconnected not supported");
        }
    }else{
        APISupported = false;
        console.log("Gamepad API not supported");
    }
};

//var onGamepadConnect = function (event) {
//    scope.gamepads.push(event.gamepad);
//
//    //startPolling();
//};
//
//var onGamepadDisconnect = function (event) {
//    for (var i in scope.gamepads) {
//        if (scope.gamepads[i].index == event.gamepad.index) {
//            scope.gamepads.splice(i, 1);
//            break;
//        }
//    }
//
//    if (scope.gamepads.length == 0) {
//        //stopPolling();
//    }
//};

init();