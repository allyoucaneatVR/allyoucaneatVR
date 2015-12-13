/**
 * Creates new gamepad input object for first person controls
 * @class
 * @constructor
 */
Ayce.Gamepad = function () {
    var scope = this;

    this.gamepads = [];

    var i;

    var rotX = 0;
    var rotY = 0;

    var offset = 0.3;
    var translationSpeed = 6.0;
    var rotationSpeed = 3.0;

    var position = new Ayce.Vector3();

    var velocity = new Ayce.Vector3();

    /**
     * Returns position based on gamepad input
     * @param {Ayce.Quaternion} orientation
     * @return {Ayce.Vector3} position
     */
    this.getPosition = function(orientation){
        var speed = 0.02;
        velocity.nullVector();
        scope.gamepads = Ayce.GamepadHandler.getGamepads();
        for(i=0;i<scope.gamepads.length; i++){
            if(scope.gamepads[i]){
                var translateX = 0;
                var translateZ = 0;
                if(scope.gamepads[i].axes[0]>offset||scope.gamepads[i].axes[0]<-offset)
                    translateX = scope.gamepads[i].axes[0]*translationSpeed;
                if(scope.gamepads[i].axes[1]>offset||scope.gamepads[i].axes[1]<-offset)
                    translateZ = scope.gamepads[i].axes[1]*translationSpeed;
                velocity.add(translateX, 0, translateZ);
            }
        }
        velocity = orientation.getConjugate().getRotatedPoint(velocity);
        position.add(velocity.x * speed, velocity.y * speed, velocity.z * speed);
        return position;
    };

    var xAxis = new Ayce.Quaternion();
    var yAxis = new Ayce.Quaternion();
    var trivialX = new Ayce.Vector3(1,0,0);
    var trivialY = new Ayce.Vector3(0,1,0);

    /**
     * Returns orientation based on gamepad input
     * @return {Ayce.Quaternion} xAxis
     */
    this.getOrientation = function(){
        xAxis.reset();
        scope.gamepads = Ayce.GamepadHandler.getGamepads();
        for(i=0;i<scope.gamepads.length; i++){
            if(scope.gamepads[i]){
                if(scope.gamepads[i].axes[2]>offset||scope.gamepads[i].axes[2]<-offset)
                    rotX += scope.gamepads[i].axes[2]*rotationSpeed;
                if(scope.gamepads[i].axes[3]>offset||scope.gamepads[i].axes[3]<-offset)
                    rotY += scope.gamepads[i].axes[3]*rotationSpeed;

                //Rotation around y axis from x mouse movment
                yAxis.reset();
                yAxis.fromAxisAngle(trivialY, rotX * Math.PI / 180);
                //Rotation around x axis from y mouse movment
                xAxis.reset();
                xAxis.fromAxisAngle(trivialX, rotY * Math.PI / 180);

                xAxis.multiply(xAxis, yAxis);
            }
        }
        return xAxis;
    };
};

Ayce.Gamepad.prototype = new Ayce.CameraModifier();