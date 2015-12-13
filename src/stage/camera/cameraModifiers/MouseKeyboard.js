/**
 * jslint browser: true
 */

/**
 * Creates new device configuration for use with mouse and keyboard for first person controls
 * @class
 * @param canvas
 * @constructor
 */
Ayce.MouseKeyboard = function (canvas, clickElement) {

    var moveSpeed = 0.2;
    var position = new Ayce.Vector3();
    var rotation = new Ayce.Quaternion();

    canvas.requestPointerLock = canvas.requestPointerLock ||
        canvas.mozRequestPointerLock ||
        canvas.webkitRequestPointerLock;

    document.exitPointerLock = document.exitPointerLock ||
        document.mozExitPointerLock ||
        document.webkitExitPointerLock;


    var moveVec = new Ayce.Vector3();
    var lastUpdate = Date.now();
    
    var xAxis = new Ayce.Quaternion();
    var yAxis = new Ayce.Quaternion();
    var trivialX = new Ayce.Vector3(1,0,0);
    var trivialY = new Ayce.Vector3(0,1,0);
    var rot = new Ayce.Vector2(0,0);
    var rotX = 0;
    var rotY = 0;

    /**
     * Updates position and orientation based on mouse and keyboard input
     * @param {Ayce.Quaternion} orientation
     */
    this.update = function(orientation){
        Ayce.MouseHandler.setNewFrameTrue();
        var p = (Date.now()-lastUpdate)/1000;
        
        //Keyboard input
        var speed = 5;
        var v = null;
        
        moveVec.x = 0;
        moveVec.y = 0;
        moveVec.z = 0;
        
        if (Ayce.KeyboardHandler.isKeyDown("W"))   v = moveVec.add(0, 0, -1);
        if (Ayce.KeyboardHandler.isKeyDown("S"))   v = moveVec.add(0, 0, 1);
        if (Ayce.KeyboardHandler.isKeyDown("D"))   v = moveVec.add(1, 0, 0);
        if (Ayce.KeyboardHandler.isKeyDown("A"))   v = moveVec.add(-1, 0, 0);

        if (v) {
            v = orientation.getRotatedPoint(v);
            position.add(v.x * speed * p, v.y * speed * p, v.z * speed * p);
        }
        lastUpdate = Date.now();

        rot = Ayce.MouseHandler.getMovement();
        rotX += rot.x;   // mouse movement in x direction
        rotY += rot.y;   // mouse movement in y direction

        //Cap rotaion around x axis
        if (rotY * moveSpeed > 90)
            rotY = 90 / moveSpeed;
        else if (rotY * moveSpeed < -90)
            rotY = -90 / moveSpeed;

        //Rotation around y axis from x mouse movment
        yAxis.reset();
        yAxis.fromAxisAngle(trivialY, rotX * moveSpeed * Math.PI / 180);
        //Rotation around x axis from y mouse movment
        xAxis.reset();
        xAxis.fromAxisAngle(trivialX, rotY * moveSpeed * Math.PI / 180);

        xAxis.multiply(xAxis, yAxis);
        rotation = xAxis;
    };

    this.getPosition = function(){
        return position;
    };

    this.getOrientation = function(){
        return rotation;
    };

    /**
     * Locks mouse on click on canvas
     */
    clickElement.onclick = function () {
        canvas.requestPointerLock();
    };

    this.isMouseLocked = function(){
        return (document.pointerLockElement === canvas ||
          document.mozPointerLockElement === canvas ||
          document.webkitPointerLockElement === canvas);
    };
};

Ayce.MouseKeyboard.prototype = new Ayce.CameraModifier();