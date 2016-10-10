/*jslint browser: true*/
/*globals Ayce*/

/**
 * Creates a new scene
 * @class
 * @param canvas
 * @constructor
 */
Ayce.Scene = function(canvas) {
    var scope = this;
    var i = 0;
    var recalcBuffers = true;
    var camera = new Ayce.Camera(new Ayce.CameraManager());
    var audioContext = new Ayce.AudioContext();
    var renderer = null;
    var keyboardHandler = new Ayce.KeyboardHandler();

    var objects = [];
    var transparentObjects = [];
    var lightContainer = new Ayce.LightContainer();
    var sounds = [];

    this.render = true;
    this.width = canvas.parentNode.clientWidth;
    this.height = canvas.parentNode.clientHeight;

    //////////////////////////////////////////////////////////////////////////////////////
    //Scene presentation

    this.presentationPreset = {
        /**
         * Returns true if WebVR compatible browser is being used
         * @returns {Boolean} isWebVR
         */
        useWebVR: function() {
            var pushWebVRModifier = function() {
                var cMan = camera.getManager();
                cMan.modifiers.push(new Ayce.WebVR());
                camera.update();
                scope.setRenderer(new Ayce.VRRenderer(canvas, false, cMan));
                camera.useVR = true;
                cMan.initHMDControls();
                scope.resize();
            };
            var m = camera.getManager().modifiers;

            if (m && m.length > 0) {
                throw "Camera modifiers not empty. Please call camera.getManager().clearModifiers() first.";
            }

            if (Ayce.HMDHandler.isWebVRReady()) {
                if (Ayce.HMDHandler.isHMDReady()) {
                    pushWebVRModifier();
                } else {
                    Ayce.HMDHandler.onHMDReady = pushWebVRModifier;
                }
            } else {
                console.warn("Browser dosen't support WebVR.");
                return null;
            }

            return new Ayce.WebVRAccess(canvas);
        },
        /**
         * Call for VR rendering for Google Cardboard (and similar viewers). Parameter used to toggle barrel distortion and color abberation on and off.
         * @param {Boolean} distorted
         */
        useCardboard: function(distorted) {
            scope.useMotionSensor();
            scope.setRendererVR(distorted);
            camera.useVR = true;
            scope.resize();
        },
    };

    this.setFullscreenElement = function(domElement) {
        var scope = this;
        var lock = null;

        domElement.addEventListener('click', function() {
            var camera = scope.getCamera();
            camera.setFullscreen(!camera.isFullscreen(), canvas);

            //Mobile VR screenlock/wakeLock(TODO)
            if (camera.isFullscreen()) {
                if ('orientation' in screen) {
                    screen.orientation.lock('landscape-primary').catch(function() {});
                }
                if (window.navigator.requestWakeLock) {
                    lock = window.navigator.requestWakeLock('screen');
                }
                if (window.navigator.wakeLock) {
                    window.navigator.wakeLock.request('screen');
                }
                screen.keepAwake = true;
                Ayce.HMDHandler.showInHMD(canvas);
            } else {
                if ('orientation' in screen) {
                    screen.orientation.unlock().catch(function() {});
                }
                if (window.navigator.requestWakeLock && lock) {
                    lock.unlock();
                }
                screen.keepAwake = false;
            }

        });
    };


    //////////////////////////////////////////////////////////////////////////////////////
    //Scene input

    /**
     * Sets up motion sensors as input for Google Cardboard (and similar viewers).
     */
    this.useMotionSensor = function() {
        var m = camera.getManager().modifiers;
        if (m && m.length > 0) throw "Camera modifiers not empty. Please call camera.getManager().clearModifiers() first.";
        m.push(new Ayce.Cardboard());
    };

    //////////////////////////////////////////////////////////////////////////////////////
    //Scene initialization

    /**
     * Should be called on window resize
     */
    this.resize = function() {
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
     * Sets up rendering for desktop browsers
     */
    this.setRendererDesktop = function() {
        this.setRenderer(new Ayce.Renderer(canvas));
        camera.useVR = false;
        this.resize();
    };

    /**
     * Sets up rendering for VR on mobile browsers
     * @param {Boolean} distorted
     */
    this.setRendererVR = function(distorted) {
        this.setRenderer(new Ayce.VRRenderer(canvas, distorted));
        camera.useVR = true;
        this.resize();
    };

    /**
     * Sets current renderer
     * @param {Ayce.Renderer} rendererObject
     */
    this.setRenderer = function(rendererObject) {
        var shaders = null;
        if (renderer) {
            rendererObject.clearColor = renderer.clearColor;
            shaders = renderer.getGL().shaders;
        }

        renderer = rendererObject;
        renderer.width = this.width;
        renderer.height = this.height;
        renderer.init();
        canvas.style.width = "auto";
        canvas.style.height = "auto";

        if (shaders) {
            renderer.getGL().shaders = shaders;
        }
    };

    //setup scene
    this.setRendererDesktop();

    if (window.attachEvent) {
        window.attachEvent('onresize', this.resize);
    } else if (window.addEventListener) {
        window.addEventListener('resize', this.resize, true);
    }

    //////////////////////////////////////////////////////////////////////////////////////
    //Scene Management

    /**
     * Updates input, camera, lights, objects, renderer and sound
     */
    this.updateScene = function() {
        if (recalcBuffers) {
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
        for (i = 0; i < objects.length; i++) {
            objects[i].update();
        }
        for (i = 0; i < transparentObjects.length; i++) {
            transparentObjects[i].update();
        }
        renderer.update(camera, objects, transparentObjects);

        //update sounds
        for (i = 0; i < sounds.length; i++) {
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
    this.drawScene = function() {
        if (this.render && !recalcBuffers) {
            // Sort transparent objects for rendering
            var highestDistance = 0;
            for (var i = 0; i < transparentObjects.length; i++) {
                if (!transparentObjects[i].renderPriority) { // Sort by distance to camera
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
            for (i = 0; i < transparentObjects.length; i++) { // Sort by priority if available
                if (transparentObjects[i].renderPriority) {
                    if (transparentObjects[i].renderPriority > 0) {
                        transparentObjects[i].distance = highestDistance + transparentObjects[i].renderPriority;
                    } else {
                        transparentObjects[i].distance = transparentObjects[i].renderPriority;
                    }
                }
            }

            transparentObjects.sort(function(a, b) {
                return b.distance - a.distance;
            });

            //render scene
            renderer.render(camera, objects, transparentObjects);
        }
    };

    var calcO3DBuffers = function(o3DArray) {
        for (i = 0; i < o3DArray.length; i++) {
            if (o3DArray[i].buffer) {
                o3DArray[i].buffer.dispose();
            }
            o3DArray[i].buffer = renderer.getBuffer(o3DArray[i], lightContainer);
        }
    };

    /**
     * Adds light, object or sound to scene
     * @param {Ayce.Light|Ayce.Object3D|Ayce.Sound} object
     */
    this.addToScene = function(object) {

        //Add Light to Scene
        if (object instanceof Ayce.Light) {
            lightContainer.addLight(object);
            recalcBuffers = true;
        }

        //Add O3D to Scene
        else if (object instanceof Ayce.Object3D) {
            if (!recalcBuffers) {
                object.buffer = renderer.getBuffer(object, lightContainer);
            }
            object.calcBoundingBox();
            object.calcBoundingSphere();

            if (object.transparent) {
                transparentObjects.push(object);
            } else {
                objects.push(object);
            }

        }

        //Add Sound
        else if (object instanceof Ayce.Sound) {
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
     * @param {Ayce.Light|Ayce.Object3D|Ayce.Sound} object
     */
    this.removeFromScene = function(object) {
        //Remove Light from Scene
        if (object instanceof Ayce.Light) {
            lightContainer.removeLight(object);
        }
        //Remove o3D from Scene
        else if (object instanceof Ayce.Object3D) {
            for (i = 0; i < objects.length; i++) {
                if (objects[i] === object) {
                    objects.splice(i, 1);
                }
            }
            for (i = 0; i < transparentObjects.length; i++) {
                if (transparentObjects[i] === object) {
                    transparentObjects.splice(i, 1);
                }
            }
        } else if (object instanceof Ayce.Sound) {
            for (i = 0; i < sounds.length; i++) {
                if (sounds[i] === object) {
                    sounds[i].stop();
                    sounds.splice(i, 1);
                }
            }
        } else {
            throw "Can't remove from scene: " + typeof object;
        }
    };

    ///////////////////////////////////////////////////////////////////////////////////////
    //Getter / Setter

    /**
     * Returns camera object of the ayce scene
     * @returns {Ayce.Camera} camera
     */
    this.getCamera = function() {
        return camera;
    };

    /**
     * Sets the default clear color of the background
     * @param {Number} red - red value between 0.0 and 1.0
     * @param {Number} green - green value between 0.0 and 1.0
     * @param {Number} blue - blue value between 0.0 and 1.0
     */
    this.setClearColor = function(red, green, blue) {
        renderer.clearColor.red = red;
        renderer.clearColor.green = green;
        renderer.clearColor.blue = blue;
        renderer.getGL().clearColor(red, green, blue, 1.0);
    };

    /**
     * Sets the ambient light color of the scene
     * @param {Number} red - red value between 0.0 and 1.0
     * @param {Number} green - green value between 0.0 and 1.0
     * @param {Number} blue - blue value between 0.0 and 1.0
     */
    this.setAmbientLight = function(red, green, blue) {
        lightContainer.ambientLight.red = red;
        lightContainer.ambientLight.green = green;
        lightContainer.ambientLight.blue = blue;
    };

};

Ayce.WebVRAccess = function(canvas) {
    this.setHMDEnterElement = function(domElement) {
        domElement.addEventListener('click', function() {
            Ayce.HMDHandler.showInHMD(canvas);
        });
    };
    this.setHMDExitElement = function(domElement) {
        domElement.addEventListener('click', function() {
            Ayce.HMDHandler.exitHMD();
        });
    };
};