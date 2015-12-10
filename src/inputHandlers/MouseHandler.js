/**
 * Handles mouse movement after mouse is locked
 * @class
 * @constructor
 */
ayce.MouseHandler = function(){

    var scope = this;

    this.addedMovement = new ayce.Vector2(0,0);
    this.movement = new ayce.Vector2(0,0);

    /**
     * Description
     */
    function lockChangeAlert() {
        if(document.pointerLockElement||
           document.mozPointerLockElement||
           document.webkitPointerLockElement
          ){
            document.addEventListener("mousemove", scope.onMouseLockMove, false);
        }else{
            document.removeEventListener("mousemove", scope.onMouseLockMove, false);
        }
    }

    /**
     * Updates x/y variables on mouse movement after mouse is locked. Only updates if mouse is being moved.
     * @param {Event} e
     */
    this.onMouseLockMove = function(e) {
        scope.addedMovement.x += e.movementX ||
            e.mozMovementX ||
            0;
        scope.movement.x = e.movementX ||
            e.mozMovementX ||
            0;

        scope.addedMovement.y += e.movementY ||
            e.mozMovementY ||
            0;
        scope.movement.y = e.movementY ||
            e.mozMovementY ||
            0;
    };

    document.addEventListener('pointerlockchange', lockChangeAlert, false);
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
    document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);
};

var mouseHandler = null;
var lastMovement = new ayce.Vector2(0,0);
var movement = new ayce.Vector2(0,0);
var x = 0;
var y = 0;
var newFrame = true;

/**
 * Returns mouse movement, regardless if mouse is being moved. Returns movement since last frame
 * @returns {ayce.Vector2}
 */
ayce.MouseHandler.getMovement = function(){
    if(mouseHandler === null){
        mouseHandler = new ayce.MouseHandler();
    }
    if(newFrame) {
        if (lastMovement.x - mouseHandler.addedMovement.x === 0) {
            movement.x = 0;
        } else {
            lastMovement.x = mouseHandler.addedMovement.x;
            movement.x = mouseHandler.movement.x;
        }
        if (lastMovement.y - mouseHandler.addedMovement.y === 0) {
            movement.y = 0;
        } else {
            lastMovement.y = mouseHandler.addedMovement.y;
            movement.y =  mouseHandler.movement.y;
        }
        newFrame = false;
    }
    return movement;
};

/**
 * Starts new frame for mouse handler. In most cases this should be called once a frame before getMovement is called.
 */
ayce.MouseHandler.setNewFrameTrue = function(){
    newFrame = true;
};