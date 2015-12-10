/*jslint browser: true*/
/*globals ayce*/

/**
 * Creates a new scene
 * @class
 * @param canvas
 * @constructor
 */
ayce.Scene = function (canvas) {

    var scope = this;
    var i = 0;
    var recalcBuffers = true;
    var camera = new ayce.Camera(new ayce.CameraManager());
    var audioContext = new ayce.AudioContext();
    var renderer = null;
    var keyboardHandler = new ayce.KeyboardHandler();
    
    this.render = true;
    this.width = canvas.parentNode.clientWidth;
    this.height = canvas.parentNode.clientHeight;

    var objects = [];
    var transparentObjects = [];
    var lightContainer = new ayce.LightContainer();
    var sounds = [];

/*********************************************
 *
 *      Scene initialization
 *
 *********************************************/

    /**
     * Should be called on window resize
     */
    this.resize = function () {
        this.width = canvas.parentNode.clientWidth;
        this.height = canvas.parentNode.clientHeight;
        renderer.width = this.width;
        renderer.height = this.height;
        renderer.resize();
        camera.width = renderer.getCanvasWidth();
        camera.height = renderer.getCanvasHeight();
        camera.updateProjectionMatrix();
    };

    /**
     * Returns true if WebVR compatible browser is being used
     * @returns {Boolean} isWebVR
     */
    this.useWebVR = function(){
        var m = camera.getManager().modifiers;
        if(m && m.length > 0)throw "Camera modifiers not empty. Please call camera.getManager().clearModifiers() first.";
        
        if(ayce.HMDHandler.isWebVRReady()){
            var cameraController = camera.getManager();
            cameraController.modifiers.push(new ayce.WebVR());
            this.setRenderer(new ayce.VRRenderer(canvas, false, cameraController));
            camera.useVR = true;
            this.resize();
        }
        else{
            console.warn("Browser dosen't support WebVR.");
            return false;
        }
        return true;
    };

    /**
     * Call for VR rendering for Google Cardboard (and similar viewers). Parameter used to toggle barrel distortion and color abberation on and off.
     * @param {Boolean} distorted
     */
    this.useCardboard = function(distorted){
        this.useMotionSensor();
        this.setRendererVR(distorted);
        camera.useVR = true;
        this.resize();
    };

    /**
     * Sets up motion sensors as input for Google Cardboard (and similar viewers).
     */
    this.useMotionSensor = function(){
        var m = camera.getManager().modifiers;
        if(m && m.length > 0)throw "Camera modifiers not empty. Please call camera.getManager().clearModifiers() first.";
        m.push(new ayce.Cardboard());
    };

    /**
     * Sets up rendering for desktop browsers
     */
    this.setRendererDesktop = function(){
        this.setRenderer(new ayce.Renderer(canvas));
        camera.useVR = false;
        this.resize();
    };

    /**
     * Sets up rendering for VR on mobile browsers
     * @param {Boolean} distorted
     */
    this.setRendererVR = function(distorted){
        this.setRenderer(new ayce.VRRenderer(canvas, distorted));
        camera.useVR = true;
        this.resize();
    };

    /**
     * Sets current renderer
     * @param {ayce.Renderer} rendererObject
     */
    this.setRenderer = function(rendererObject){
        var shaders = null;
        if(renderer){
            rendererObject.clearColor = renderer.clearColor;
            shaders = renderer.getGL().shaders;
        }
        
        renderer = rendererObject;
        renderer.width = this.width;
        renderer.height = this.height;
        renderer.init();
        canvas.style.width = "auto";
        canvas.style.height = "auto";
        
        if(shaders !== null){
            renderer.getGL().shaders = shaders;
        }
    };

    /**
     * Removes current renderer
     */
    this.setRendererNull = function(){
        renderer = null;
    };

    //setup scene
    this.setRendererDesktop();
    if(window.attachEvent) {
        window.attachEvent('onresize', this.resize);
    }
    else if(window.addEventListener) {
        window.addEventListener('resize', this.resize, true);
    }
/*********************************************
 *
 *      Scene Management
 *
 *********************************************/

    /**
     * Updates input, camera, lights, objects, renderer and sound
     */
    this.updateScene = function () {
        if(recalcBuffers){
            calcO3DBuffers(objects);
            calcO3DBuffers(transparentObjects);
            recalcBuffers = false;
        }
        
        //update keyboard inputHandlers
        keyboardHandler.update();
        
        //update camera
        camera.update();
        
        //update lights
        lightContainer.update(camera);
        
        //update objects
        for(i=0; i < objects.length; i++){
            objects[i].update();
        }
        for(i=0; i < transparentObjects.length; i++){
            transparentObjects[i].update();
        }
        renderer.update(camera, objects, transparentObjects);
        
        //update sounds
        for(i=0;i<sounds.length;i++){
            //sounds[i].listener = camera.getControls().position;
            sounds[i].listenerPosition = camera.getManager().getGlobalPosition();
            var orientation = camera.getManager().getGlobalRotation();
            var fwVector = orientation.getForwardVector();
            var upVector = orientation.getUpVector();
            sounds[i].listenerOrientationFront.x = fwVector.x;
            sounds[i].listenerOrientationFront.y = fwVector.y;
            sounds[i].listenerOrientationFront.z = fwVector.z;
            sounds[i].listenerOrientationUp.x = upVector.x;
            sounds[i].listenerOrientationUp.y = upVector.y;
            sounds[i].listenerOrientationUp.z = upVector.z;
            sounds[i].update();
        }
    };

    /**
     * Draws objects that have been added to the scene
     */
    this.drawScene = function () {
        if(this.render && ! recalcBuffers) {
            // Sort transparent objects for rendering
            var highestDistance = 0;
            for (var i = 0; i < transparentObjects.length; i++) {
                if (!transparentObjects[i].renderPriority) {     // Sort by distance to camera
                    var position = transparentObjects[i].getGlobalPosition();
                    var cc = camera.getManager();

                    transparentObjects[i].distance = Math.sqrt(
                        Math.pow(cc.getGlobalPosition().x - position.x, 2) +
                        Math.pow(cc.getGlobalPosition().y - position.y, 2) +
                        Math.pow(cc.getGlobalPosition().z - position.z, 2)
                    );

                    if (transparentObjects[i].distance > highestDistance) highestDistance = transparentObjects[i].distance;
                }
            }
            for (i = 0; i < transparentObjects.length; i++) {       // Sort by priority if available
                if (transparentObjects[i].renderPriority) {
                    if (transparentObjects[i].renderPriority > 0) {
                        transparentObjects[i].distance = highestDistance + transparentObjects[i].renderPriority;
                    } else {
                        transparentObjects[i].distance = transparentObjects[i].renderPriority;
                    }
                }
            }

            transparentObjects.sort(function (a, b) {
                return b.distance - a.distance;
            });

            //render scene
            renderer.render(camera, objects, transparentObjects);
        }
    };
    
    var calcO3DBuffers = function(o3DArray){
        for(i=0; i < o3DArray.length; i++){
            if(o3DArray[i].buffer){
                o3DArray[i].buffer.dispose();
            }
            o3DArray[i].buffer = renderer.getBuffer(o3DArray[i], lightContainer);
        }
    };

    /**
     * Adds light, object or sound to scene
     * @param {ayce.Light|ayce.Object3D|ayce.Sound} object
     */
    this.addToScene = function (object) {
        
        //Add Light to Scene
        if (object instanceof ayce.Light) {
            lightContainer.addLight(object);
            recalcBuffers = true;
        }
        
        //Add O3D to Scene
        else if (object instanceof ayce.Object3D) {
            if(!recalcBuffers){
                object.buffer = renderer.getBuffer(object, lightContainer);
            }
            object.calcBoundingBox();
            object.calcBoundingSphere();

            if(object.transparent){
                transparentObjects.push(object);
            }
            else{
                objects.push(object);
            }
            
        }
        
        //Add Sound
        else if(object instanceof ayce.Sound){
            object.init(audioContext);
            sounds.push(object);
        }
        
        //Unknown Object
        else {
            throw "Can't add to scene. Unknown type: " + typeof object;
        }
    };

    /**
     * Removes light, object or sound from scene
     * @param {ayce.Light|ayce.Object3D|ayce.Sound} object
     */
    this.removeFromScene = function (object) {
        //Remove Light from Scene
        if (object instanceof ayce.Light) {
            lightContainer.removeLight(object);
        }
        //Remove o3D from Scene
        else if (object instanceof ayce.Object3D) {
            for (i=0; i < objects.length; i++) {
                if (objects[i] === object) {
                    objects.splice(i, 1);
                }
            }
            for (i=0; i < transparentObjects.length; i++) {
                if (transparentObjects[i] === object) {
                    transparentObjects.splice(i, 1);
                }
            }
        }
        else if(object instanceof ayce.Sound){
            for (i=0; i < sounds.length; i++) {
                if (sounds[i] === object) {
                    sounds[i].stop();
                    sounds.splice(i, 1);
                }
            }
        }
        else {
            throw "Can't remove from scene: " + typeof object;
        }
    };
    
/*********************************************
 *
 *      Getter / Setter
 *
 *********************************************/

    /**
     * Returns camera object
     * @returns {ayce.Camera} camera
     */
    this.getCamera = function () {
        return camera;
    };
    
    this.setClearColor = function(red, green, blue){
        renderer.clearColor.red = red;
        renderer.clearColor.green = green;
        renderer.clearColor.blue = blue;
        renderer.getGL().clearColor(red, green, blue, 1.0);
    };
    
    this.setAmbientLight = function(red, green, blue){
        lightContainer.ambientLight.red = red;
        lightContainer.ambientLight.green = green;
        lightContainer.ambientLight.blue = blue;
    };

};