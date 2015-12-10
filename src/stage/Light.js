/**
 * lsint browser: true
 */

/**
 * Creates new light
 * @class
 * @constructor
 */
ayce.Light = function () {
    this.position = new ayce.Vector3();
    this.color = {
        red: 1.0,
        green: 1.0,
        blue: 1.0
    };
    this.specularColor = {
        red: 1.0,
        green: 1.0,
        blue: 1.0
    };
};

/**
 * Stores light information
 * @class
 * @constructor
 */
ayce.LightContainer = function(){

    var lights = [];

    this.locationsArray = [];
    this.locationsArrayLeftEye = [];
    this.locationsArrayRightEye = [];
    this.colorsArray = [];
    this.specColorsArray = [];
    this.lightsCount = 0;
    this.ambientLight = {
        red: 0.5,
        green: 0.5,
        blue: 0.5
    };
    var poolPos = new ayce.Vector3();

    /**
     * Adds light to light container
     * @param {ayce.Light} light
     */
    this.addLight = function(light){
        lights.push(light);
        this.lightsCount = lights.length;
    };

    /**
     * Removes light from light container
     * @param {ayce.Light} light
     */
    this.removeLight = function(light){
        var index = lights.indexOf(light);
        if (index !== -1) lights.splice(index, 1);
        this.locationsArray.splice(index, 1);
        this.colorsArray.splice(index, 1);
        this.specColorsArray.splice(index, 1);
    };

    /**
     * Updates light locations
     * @param {ayce.Camera} camera
     */
    this.update = function(camera){
        var i = 0;
        var viewMatrix, p;

        if(camera.useVR){
            viewMatrix = camera.getViewMatrix("left");

            for(i=0; i<lights.length; i++){
                ayce.Vector3.prototype.copyToVector(lights[i].position, poolPos);
                p = viewMatrix.transformVector(poolPos);

                this.locationsArrayLeftEye[i*3 + 0] = p.x;
                this.locationsArrayLeftEye[i*3 + 1] = p.y;
                this.locationsArrayLeftEye[i*3 + 2] = p.z;
            }
            
            viewMatrix = camera.getViewMatrix("right");

            for(i=0; i<lights.length; i++){
                ayce.Vector3.prototype.copyToVector(lights[i].position, poolPos);
                p = viewMatrix.transformVector(poolPos);

                this.locationsArrayRightEye[i*3 + 0] = p.x;
                this.locationsArrayRightEye[i*3 + 1] = p.y;
                this.locationsArrayRightEye[i*3 + 2] = p.z;
            }
        }else{
            viewMatrix = camera.getViewMatrix();

            for(i=0; i<lights.length; i++){
                ayce.Vector3.prototype.copyToVector(lights[i].position, poolPos);
                p = viewMatrix.transformVector(poolPos);

                this.locationsArray[i*3 + 0] = p.x;
                this.locationsArray[i*3 + 1] = p.y;
                this.locationsArray[i*3 + 2] = p.z;
            }
        }

        for(i=0; i<lights.length; i++){
            this.colorsArray[i*3 + 0] = lights[i].color.red;
            this.colorsArray[i*3 + 1] = lights[i].color.green;
            this.colorsArray[i*3 + 2] = lights[i].color.blue;

            this.specColorsArray[i*3 + 0] = lights[i].specularColor.red;
            this.specColorsArray[i*3 + 1] = lights[i].specularColor.green;
            this.specColorsArray[i*3 + 2] = lights[i].specularColor.blue;
        }
        this.lightsCount = lights.length;
    };

};

ayce.LightContainer.prototype = {};