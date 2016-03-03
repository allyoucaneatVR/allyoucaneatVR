/**
 * jslint browser: true
 */

/**
 * Creates renderer for VR
 * @param {Canvas} canvas
 * @param {Boolean} distorted
 * @param {Ayce.CameraManager} cameraController
 * @class
 * @constructor
 */
Ayce.VRRenderer = function (canvas, distorted, cameraController) {

    Ayce.Renderer.call(this, canvas);

    var scope = this;

    var i = 0;

    var gl;

    var framebufferL, framebufferR;
    var textureL, textureR;
    var framebufferWidth;
    var framebufferHeight;

    var shader;
    var stride = 0;
    var interlacedBuffer;

    var vrSquare;

    var VALUES_PER_POSITION = 3;
    var VALUES_PER_TEXTURE_COORD = 2;


    var cameraDistortion;

    /*********************************************
     *
     *      Renderer initialization
     *
     *********************************************/

    /**
     * Handles canvas resizing
     */
    this.resize = function(){
        if(cameraController){
            canvas.width  = cameraController.cameraProperties.renderRectWidth;
            canvas.height = cameraController.cameraProperties.renderRectHeight;
        }
        else{
            console.warn("Can't get renderRect from cameraProperties.");
            canvas.width  = this.width *window.devicePixelRatio;
            canvas.height = this.height*window.devicePixelRatio;
        }

        canvas.style.width = this.width + 'px';
        canvas.style.height = this.height + 'px';

        console.log("Resolution: " + canvas.width +"x" + canvas.height, " Style: " + canvas.style.width +" - " + canvas.style.height);

        //gl stuff
        gl.viewportWidth =  canvas.width/2.0;
        gl.viewportHeight = canvas.height;
        //TODO doesn't do anything?
        scope.setViewportAndScissor(0, 0, gl.viewportWidth, gl.viewportHeight);
    };
    
    var init = this.init;
    /**
     * Initializes VR renderer
     */
    this.init = function(){
        console.log("Initializing VRRenderer");
        init(); //Ayce.Renderer.init();

        gl = this.getGL();
        var temp = initTextureFramebuffer();
        framebufferL = temp[0];
        textureL = temp[1];
        temp = initTextureFramebuffer();
        framebufferR = temp[0];
        textureR = temp[1];

        vrSquare = new Ayce.VRSquare();
        var vert = Ayce.VRRenderer.prototype.vrCanvasVert;//Ayce.XMLLoader.getSourceSynch(shaderPath + vrSquare.shader + ".vert");
        var frag = Ayce.VRRenderer.prototype.vrCanvasFrag;//Ayce.XMLLoader.getSourceSynch(shaderPath + vrSquare.shader + ".frag");
        shader = new Ayce.Shader(gl, vert, frag);
        shader.pMatrixUniform = shader.getUniformLocation("uPMatrix");
        shader.mvMatrixUniform = shader.getUniformLocation("uMVMatrix");
        shader.vertexPositionAttribute = shader.getAttribLocation("aVertexPosition");
        shader.textureCoordAttribute = shader.getAttribLocation("aTextureCoord");
        shader.samplerUniform = shader.getUniformLocation("uSampler");

        var config = new Ayce.CameraModifier();
        config.getPosition().set(0, 0, 2.3);
        config.getOrientation().set(0, 0, 0, 1);
        
        var controller = new Ayce.CameraManager();
        controller.modifiers.push(config);
        cameraDistortion = new Ayce.Camera(controller);
        cameraDistortion.isOrtho = true;
        cameraDistortion.updateProjectionMatrix();
        cameraDistortion.update();

        initBuffers();

        gl.enable(gl.SCISSOR_TEST);
    };

    /**
     * Initializes framebuffer for scene rendering for one eye
     * @return {Array} framebufferAndTexture
     */
    function initTextureFramebuffer() {
        var framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        framebufferWidth = framebuffer.width = 1024;//TODO calc correct dimensions
        framebufferHeight = framebuffer.height = 1024;

        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, framebuffer.width, framebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        var renderbuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, framebuffer.width, framebuffer.height);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return [framebuffer, texture];
    }

    /**
     * Initializes buffers for squares with texture (later converted to frame buffer)
     */
    function initBuffers() {
        var interlacedArray = vrSquare.vertices.slice();
        var i;
        for(i=VALUES_PER_POSITION; i<=vrSquare.vertices.length; i+=VALUES_PER_POSITION){    // Join Object3D arrays
            interlacedArray.splice(i+(i/VALUES_PER_POSITION-1)*VALUES_PER_TEXTURE_COORD, 0,
                vrSquare.textureCoords[(i/VALUES_PER_POSITION-1)*VALUES_PER_TEXTURE_COORD],    // x
                vrSquare.textureCoords[(i/VALUES_PER_POSITION-1)*VALUES_PER_TEXTURE_COORD+1]); // y
        }

        stride = (VALUES_PER_POSITION+VALUES_PER_TEXTURE_COORD)*4;
        interlacedBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, interlacedBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(interlacedArray), gl.STATIC_DRAW);
        interlacedBuffer.numItems = 4;

        gl.enableVertexAttribArray(shader.vertexPositionAttribute);
        gl.vertexAttribPointer(shader.vertexPositionAttribute, VALUES_PER_POSITION, gl.FLOAT, false, stride, 0);
        gl.enableVertexAttribArray(shader.textureCoordAttribute);
        gl.vertexAttribPointer(shader.textureCoordAttribute, VALUES_PER_TEXTURE_COORD, gl.FLOAT, false, stride, VALUES_PER_POSITION*4);
    }

    /*********************************************
     *
     *      Render current Scene
     *
     *********************************************/

    /**
     * Updates objects
     * @param {Camera} camera
     * @param {Ayce.Object3D[]} objects
     * @param {Ayce.Object3D[]} transparentObjects
     */
    this.update = function (camera, objects, transparentObjects) {
        for(i=0; i < objects.length; i++){
            objects[i].buffer.updateVR(camera);
        }
        
        for(i=0; i < transparentObjects.length; i++){
            transparentObjects[i].buffer.updateVR(camera);
        }
    };

    /**
     * Renders objects
     * @param {Camera} camera
     * @param {Ayce.Object3D[]} objects
     * @param {Ayce.Object3D[]} transparentObjects
     */
    this.render = function (camera, objects, transparentObjects) {
        if(distorted){
            vrRenderDistorted(objects, transparentObjects);
        }
        else{
            vrRender(objects, transparentObjects);
        }
    };

    /**
     * Renders scene to frame buffer with shader for barrel distortion correction and collor abberation
     * @param {Ayce.Object3D[]} objects
     * @param {Ayce.Object3D[]} transparentObjects
     */
    function vrRenderDistorted(objects, transparentObjects) {
        //Render Left Eye
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferL);
        scope.setViewportAndScissor(0, 0, framebufferWidth, framebufferHeight);

        renderObjects(objects, "left");
        renderObjects(transparentObjects, "left");

        //Render Right Eye
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferR);
        scope.setViewportAndScissor(0, 0, framebufferWidth, framebufferHeight);

        renderObjects(objects, "right");
        renderObjects(transparentObjects, "right");

        //Apply Distortion
        //Render Both Eyes to Canvas
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        shader.initShaders();

        gl.bindBuffer(gl.ARRAY_BUFFER, interlacedBuffer);
//        gl.enableVertexAttribArray(shader.vertexPositionAttribute);
//        gl.enableVertexAttribArray(shader.textureCoordAttribute);
        gl.vertexAttribPointer(shader.vertexPositionAttribute, VALUES_PER_POSITION, gl.FLOAT, false, stride, 0);
        gl.vertexAttribPointer(shader.textureCoordAttribute, VALUES_PER_TEXTURE_COORD, gl.FLOAT, false, stride, VALUES_PER_POSITION*4);

        //Left
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureL);
        gl.uniform1i(shader.samplerUniform, 0);
        scope.setViewportAndScissor(0, 0, gl.viewportWidth, gl.viewportHeight);
        
        gl.uniformMatrix4fv(shader.pMatrixUniform, false, cameraDistortion.getPerspectiveMatrix().data);
        gl.uniformMatrix4fv(shader.mvMatrixUniform, false, cameraDistortion.getViewMatrix().data);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, interlacedBuffer.numItems);

        //Right
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureR);
        gl.uniform1i(shader.samplerUniform, 0);
        scope.setViewportAndScissor(gl.viewportWidth, 0, gl.viewportWidth, gl.viewportHeight);

        gl.uniformMatrix4fv(shader.pMatrixUniform, false, cameraDistortion.getPerspectiveMatrix().data);
        gl.uniformMatrix4fv(shader.mvMatrixUniform, false, cameraDistortion.getViewMatrix().data);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, interlacedBuffer.numItems);

        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    /**
     * Renders scene to frame buffers
     * @param {Ayce.Object3D[]} objects
     * @param {Ayce.Object3D[]} transparentObjects
     */
    function vrRender(objects, transparentObjects) {
        //Render Left Eye
        scope.setViewportAndScissor(0, 0, gl.viewportWidth, gl.viewportHeight);

        renderObjects(objects, "left");
        renderObjects(transparentObjects, "left");

        //Render Right Eye
        scope.setViewportAndScissor(gl.viewportWidth, 0, gl.viewportWidth, gl.viewportHeight);

        renderObjects(objects, "right");
        renderObjects(transparentObjects, "right");
        
        Ayce.HMDHandler.renderToHMD();
    }

    /**
     * Renders Objects
     * @param {Ayce.Object3D[]} objects
     * @param {String} eye
     */
    function renderObjects (objects, eye) {
        for (var i=0; i<objects.length; i++) {
            objects[i].buffer.renderVR(eye);
        }
    }
};

Ayce.VRRenderer.prototype = new Ayce.Renderer();
Ayce.VRRenderer.prototype.vrCanvasVert = 
    "attribute vec3 aVertexPosition;"+
    "attribute vec2 aTextureCoord;"+

    "uniform mat4 uMVMatrix;"+
    "uniform mat4 uPMatrix;"+

    "varying vec2 vTextureCoord;"+


    "void main(void) {"+
      "gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);"+
      "vTextureCoord = aTextureCoord;"+
    "}";
Ayce.VRRenderer.prototype.vrCanvasFrag =
"precision mediump float;"+

"uniform sampler2D uSampler;"+
"uniform bool uUseTextures;"+

"varying vec2 vTextureCoord;"+
"varying vec4 vColor;"+

"void main(void) {"+
    // Abstand zwischen 0.5|0.5 und S|T
"    float distance = sqrt(abs(0.5-vTextureCoord.s)*abs(0.5-vTextureCoord.s)+abs(0.5-vTextureCoord.t)*abs(0.5-vTextureCoord.t));"+
    // X-/Y-Abstand
"    float distanceS = (0.5-vTextureCoord.s);"+
"    float distanceT = (0.5-vTextureCoord.t);"+
    // 0.22 und 0.24 sind die Koeffizienten von den Linsen des Oculus
"    float factor = 1.0+0.22*distance*distance+0.24*distance*distance*distance*distance;"+
    // Umwandlung der Texturkoordinaten in OpenGL-Koordinaten (-0.5<x<0.5|-0.5<y<0.5), Multiplizierung mit dem Faktor
"    float newCoordS = (vTextureCoord.s-0.5)*factor;"+
"    float newCoordT = (vTextureCoord.t-0.5)*factor;"+

    // Chromatic abberation (Farbkorrektur)
    //1.0 => keine Korrektur
"    float offsetR = 1.0;"+
"    float offsetG = 0.995;"+
"    float offsetB = 0.980;"+

    // Chromatic abberation und Rückumwandlung in Texturkoordinaten
"    float newCoordSR = newCoordS/offsetR+0.5;"+
"    float newCoordSG = newCoordS/offsetG+0.5;"+
"    float newCoordSB = newCoordS/offsetB+0.5;"+

"    float newCoordTR = newCoordT/offsetR+0.5;"+
"    float newCoordTG = newCoordT/offsetG+0.5;"+
"    float newCoordTB = newCoordT/offsetB+0.5;"+

"    if(newCoordSR<0.0||newCoordSR>1.0"+
"    ||newCoordSG<0.0||newCoordSG>1.0"+
"    ||newCoordSB<0.0||newCoordSB>1.0"+
"    ||newCoordTR<0.0||newCoordTR>1.0"+
"    ||newCoordTG<0.0||newCoordTG>1.0"+
"    ||newCoordTB<0.0||newCoordTB>1.0){"+
        // Wenn Koordinaten außerhalb der Textur, schwarzer Pixel
        //gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
"        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);"+
"    }else{"+

"        float r = texture2D(uSampler, vec2(newCoordSR, newCoordTR)).r;"+
"        float g = texture2D(uSampler, vec2(newCoordSG, newCoordTG)).g;"+
"        float b = texture2D(uSampler, vec2(newCoordSB, newCoordTB)).b;"+
"        gl_FragColor = vec4(r, g, b, 1.0);"+
"    }"+
"}";
