/**
 * jslint browser: true
 */

/**
 * Handles keyboard button presses
 * @class
 * @param {Canvas} canvas
 * @constructor
 */
Ayce.KeyboardHandler = function (canvas) {

    var keyDownState = [];
    var keyUpState = [];

    Ayce.KeyboardHandler.keys = [];

    /**
     * Description
     */
    this.update = function () {
        var key;
        //Key down
        for (key = 0; key < keyDownState.length; key++) {
            Ayce.KeyboardHandler.keys[keyDownState[key]] = true;
            keyDownState.splice(key, 1);
        }
        //Key up
        for (key = 0; key < keyUpState.length; key++) {
            Ayce.KeyboardHandler.keys[keyUpState[key]] = false;
            keyUpState.splice(key, 1);
        }
    };

    window.addEventListener('keydown', function (e) {
        var key = e.keyCode || e.which;
        if (!Ayce.KeyboardHandler.keys[key]) {
            keyDownState.push(key);
        }
    }, true);

    window.addEventListener('keyup', function (e) {
        var key = e.keyCode || e.which;
        keyUpState.push(key);
    }, true);
};

/**
 * Returns true if key is pressed
 * @param {String} key
 * @return {Boolean} isDown
 */
Ayce.KeyboardHandler.isKeyDown = function (key) {
    if (!Ayce.KeyboardHandler.keys) {
        console.log("KeyboardHandler not initialised");
        return;
    }
    
    if(key.length === 1){
        var keyCode = key.charCodeAt(0);
        return Ayce.KeyboardHandler.keys[keyCode];
    }
    else if(key.length > 1){
        //TODO "SPACE" "ENTER" "LEFT_ARROW"
        return false;
    }
    
    return false;
};

Ayce.KeyboardHandler.prototype = {

};