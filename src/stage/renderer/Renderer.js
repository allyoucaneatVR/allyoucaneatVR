/**
 * jslint browser: true
 */

/**
 * Creates renderer for desktop use
 * @param {Canvas} canvas
 * @class
 * @constructor
 */
Ayce.Renderer = function (canvas) {

    var gl;
    var i = 0;
    var scope = this;

    this.width = 0;
    this.height = 0;
    this.clearColor = {
        red: 0.0,
        green: 0.0,
        blue: 0.0
    };

    var objectIdentificationBuffer, objectIdentificationTexture;
    var identificationColor = new Uint8Array(4);

    /*********************************************
     *
     *      Renderer initialization
     *
     *********************************************/

    // should be called on initialization
    /**
     * Sets Canvas size and, enables extensions if available and initializes Renderer
     */
    this.init = function () {
        canvas.width = this.width;
        canvas.height = this.height;
        initGL(canvas);
        initRenderer();
    };

    /**
     * Handles canvas resizing
     */
    this.resize = function(){
        canvas.width = this.width;
        canvas.height = this.height;
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
        scope.setViewportAndScissor(0, 0, gl.viewportWidth, gl.viewportHeight);
    };

    this.enableScreenSpacePicking = function(){
        objectIdentificationBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, objectIdentificationBuffer);
        objectIdentificationBuffer.width = canvas.width;
        objectIdentificationBuffer.height = canvas.height;

        objectIdentificationTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, objectIdentificationTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, objectIdentificationBuffer.width, objectIdentificationBuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        var renderBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, objectIdentificationBuffer.width, objectIdentificationBuffer.height);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, objectIdentificationTexture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    // starts WebGL initialization
    /**
     * Initializes WebGL values
     */
    var initRenderer = function () {
        gl.clearColor(scope.clearColor.red, scope.clearColor.green, scope.clearColor.blue, 1.0);
        scope.setViewportAndScissor(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.FRONT);
        gl.frontFace(gl.CW);
        gl.enable(gl.SCISSOR_TEST);
    };

    //Initialises WebGL context
    /**
     * Sets up canvas for WebGL
     * @param {Canvas} canvas
     */
    var initGL = function (canvas) {
        try {
            var attr = { alpha: false };
            gl = canvas.getContext("webgl", attr);
            if(!gl)gl = canvas.getContext("experimental-webgl", attr);
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
            gl.ext = gl.getExtension("OES_vertex_array_object");
//            gl.ext = null;
            gl.shaders = {};
            if(!gl.ext)console.warn("Can't get OES_vertex_array_object extension.");

        } catch (e) {}
        if (!gl) {
            alert("Could not initialise WebGL.");
        }
    };


    /**
     * *******************************************
     * Render current Scene
     * *******************************************
     *
     * Updates objects
     * @param {Camera} camera
     * @param {Ayce.Object3D[]} objects
     * @param {Ayce.Object3D[]} transparentObjects
     */
    this.update = function(camera, objects, transparentObjects){
        for(i=0; i < objects.length; i++){
            objects[i].buffer.update(camera);
        }
        for(i=0; i < transparentObjects.length; i++){
            transparentObjects[i].buffer.update(camera);
        }
    };

    /**
     * Returns object identifier at given screen-space coordinates if picking is enabled.
     * @param {Number} x
     * @param {Number} y
     * @param {Ayce.Object3D[]} identificationBufferObjects
     * @param {Ayce.CameraManager} camera
     */
    this.getObjectIdentifierAt = function(x, y, identificationBufferObjects, camera){
        gl.bindFramebuffer(gl.FRAMEBUFFER, objectIdentificationBuffer);
        scope.setViewportAndScissor(0, 0, objectIdentificationBuffer.width, objectIdentificationBuffer.height);

        for(i=0; i < identificationBufferObjects.length; i++){
            identificationBufferObjects[i].buffer.update(camera);
        }

        var buffer;
        // Render objects off-screen for picking
        for (i = 0; i < identificationBufferObjects.length; i++) {
            buffer = identificationBufferObjects[i].buffer;
            buffer.render();
        }

        gl.readPixels(x, canvas.height-y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, identificationColor);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        scope.setViewportAndScissor(0, 0, gl.viewportWidth, gl.viewportHeight);

        return identificationColor;
    };

    /**
     * Renders objects
     * @param {Camera} camera
     * @param {Ayce.Object3D[]} objects
     * @param {Ayce.Object3D[]} transparentObjects
     */
    this.render = function (camera, objects, transparentObjects) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var buffer;
        // Render opaque objects
        for (i=0; i<objects.length; i++) {
            if(objects[i].visible) {
                buffer = objects[i].buffer;
                buffer.render();
            }
        }

        // Render transparent objects
        for (i=0; i<transparentObjects.length; i++) {
            if (transparentObjects[i].visible){
                buffer = transparentObjects[i].buffer;
                buffer.render();
            }
        }
    };


    /**
     * *******************************************
     * Render methods
     * *******************************************
     * @param {Number} x
     * @param {Number} y
     * @param {Number} width
     * @param {Number} height
     */
    this.setViewportAndScissor = function(x, y, width, height){
        gl.viewport(x, y, width, height);
        gl.scissor(x, y, width, height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    };

    /**
     * Returns buffer object for object
     * @param {Ayce.Object3D} object3D
     * @param {Ayce.LightContainer} lightContainer
     * @return {Ayce.BufferMulti} bufferMulti
     */
    this.getBuffer = function(object3D, lightContainer){
        if(!object3D instanceof Ayce.Object3D)throw "Can't get Buffer for " + object3D;

        return new Ayce.BufferMulti(gl, object3D, lightContainer);
    };

    /**
     * Returns viewport height of canvas
     * @return {Number} height
     */
    this.getCanvasHeight = function(){
        return gl.viewportHeight;
    };

    /**
     * Returns viewport height of canvas
     * @return {Number} width
     */
    this.getCanvasWidth = function(){
        return gl.viewportWidth;
    };

    /**
     * Returns GL object
     * @return {Object} gl
     */
    this.getGL = function(){
        return gl;
    };
};

Ayce.Renderer.prototype = {

};