/**
 * Creates buffer and sets up shaders for an object3D
 * @param {Object} gl
 * @param {Ayce.Object3D} object3D
 * @param {Ayce.LightContainer} lightContainer
 * @class
 * @constructor
 */
Ayce.BufferMulti = function (gl, object3D, lightContainer) {
    if (!object3D instanceof Ayce.Object3D) throw "Can't create buffers for " + object3D;

    var modelViewMatrix = new Ayce.Matrix4();
    modelViewMatrix.transposeUniform = false;
    //VR 
    var leftMatrix = new Ayce.Matrix4();
    var rightMatrix = new Ayce.Matrix4();
    var leftNormalMatrix = new Ayce.Matrix3();
    var rightNormalMatrix = new Ayce.Matrix3();
    var leftPerspektive = null;
    var rightPerspektive = null;


    var VALUES_PER_POSITION = 3;
    var VALUES_PER_NORMAL = 3;
    var VALUES_PER_TEXTURE_COORD = 2;
    var VALUES_PER_TEXTURE_INDEX = 1;
    var VALUES_PER_COLOR = 4;

    var useLighting = Boolean(object3D.normals) && lightContainer.lightsCount > 0;
    var useNormals = Boolean(object3D.normals) && (useLighting || object3D.shader);
    var textureCount = Array.isArray(object3D.imageSrc) ? object3D.imageSrc.length : 1;
    var useWireframe = object3D.isWireframe;
    this.transparent = object3D.transparent;
    var isParticleSystem = Boolean(object3D.geometries && object3D.velocities && object3D.rotationAngles && object3D.lifetimes && object3D.gravities && object3D.gravityExps);

    //Shader Attributes
    //[attributeName, valueLength, array]
    var attributes = [];
    attributes.push(["aVertexPosition", VALUES_PER_POSITION, object3D.vertices]);
    if(object3D.textureCoords && object3D.imageSrc)  attributes.push(["aTextureCoord", VALUES_PER_TEXTURE_COORD, object3D.textureCoords]);
    if(object3D.textureCoords && object3D.imageSrc && object3D.textureIndices && textureCount > 1) attributes.push(["aTextureIndex", VALUES_PER_TEXTURE_INDEX, object3D.textureIndices]);
    if(object3D.colors)attributes.push(["aVertexColor", VALUES_PER_COLOR, object3D.colors]);
    if(useNormals)attributes.push(["aVertexNormal", VALUES_PER_NORMAL, object3D.normals]);
    if(object3D.shaderAttributes)Array.prototype.push.apply(attributes, object3D.shaderAttributes);
    
    //Shader Uniforms
    var pMatrixUniform = {
        transposeUniform: false,
        data: []
    };
    var timeObject = {
        time: 0,
        startTime: Date.now()
    };

    var uniformValues = {
        useTexture: Boolean(object3D.textureCoords && object3D.imageSrc),
        useLighting: useLighting,
        useMultiTex: Boolean(object3D.textureIndices),
        normalMatrix: new Ayce.Matrix3(),
        useSpecularMap: Boolean(object3D.specularMap),
        useNormalMap: Boolean(object3D.normalMap)
    };

    var uniforms = [];
    //[uniformName, uniformType, valueObject, uniformArguments]
    uniforms.push(["uPMatrix", "uniformMatrix4fv", pMatrixUniform, ["transposeUniform", "data"]]);
    uniforms.push(["uMVMatrix", "uniformMatrix4fv", modelViewMatrix, ["transposeUniform", "data"]]);
    if(useNormals){  
        uniformValues.normalMatrix.transposeUniform = false;
        uniforms.push(["uNMatrix", "uniformMatrix3fv", uniformValues.normalMatrix, ["transposeUniform", "data"]]);
    }
    if(useLighting){
        uniforms.push(["uAmbientColor", "uniform3f", lightContainer.ambientLight, ["red", "green", "blue"]]);

        //uniforms.push(["uLightIndex", "uniform1f", lightContainer, ["lightsCount"]]);
        uniforms.push(["uPointLightingLocations", "uniform3fv", lightContainer, ["locationsArray"]]);
        uniforms.push(["uPointLightingColors", "uniform3fv", lightContainer, ["colorsArray"]]);
        uniforms.push(["uSpecularColors", "uniform3fv", lightContainer, ["specColorsArray"]]);

        uniforms.push(["uShininess", "uniform1f", object3D, ["shininess"]]);
    }
    if(isParticleSystem){
        uniforms.push(["uTime", "uniform1f", timeObject, ["time"]]);
    }
    if(object3D.shaderUniforms)Array.prototype.push.apply(uniforms, object3D.shaderUniforms);


    //Load Shader
    var shaderVert = null;
    var shaderFrag = null;
    var shaderID = "";

    if(object3D.shader){
//        console.log("Loading Shader File: " + object3D.shader);
        shaderVert = Ayce.XMLLoader.getSourceSynch(object3D.shader + ".vert");
        shaderFrag = Ayce.XMLLoader.getSourceSynch(object3D.shader + ".frag");
        shaderID = "A"+object3D.shader;
        if(object3D.logVertexShader) console.log(shaderVert);
        if(object3D.logFragmentShader) console.log(shaderFrag);
    }else{
//        console.log("Generating Shader...");
        var shaderGenerator = new Ayce.ShaderGenerator();
        
        if(useLighting){
            shaderGenerator.useVertexLighting = Boolean(object3D.normals && !object3D.useFragmentLighting);
            shaderGenerator.lightsCount = lightContainer.lightsCount;
            shaderGenerator.useFragmentLighting = Boolean(object3D.normals && object3D.useFragmentLighting);
            shaderGenerator.useSpecularLighting = object3D.useSpecularLighting;
        }
        shaderGenerator.useNormals = useNormals;
        shaderGenerator.useColor = Boolean(object3D.colors);
        
        shaderGenerator.texturesCount = Array.isArray(object3D.imageSrc) ? object3D.imageSrc.length : 1;
        shaderGenerator.useTexture = Boolean(object3D.imageSrc && object3D.textureCoords);
        shaderGenerator.useSpecularMap = Boolean(object3D.specularMap && object3D.useSpecularLighting);
        shaderGenerator.useNormalMap = Boolean(object3D.normalMap);
        
        shaderGenerator.isParticleSystem = isParticleSystem;
        
        shaderGenerator.init();
        shaderVert = shaderGenerator.vertexShader;
        shaderFrag = shaderGenerator.fragmentShader;

        shaderID = "B"+shaderGenerator.useNormals+shaderGenerator.lightsCount+shaderGenerator.texturesCount+
            shaderGenerator.useVertexLighting+shaderGenerator.useFragmentLighting+
            shaderGenerator.useTexture+shaderGenerator.useColor+shaderGenerator.useSpecularMap+
            shaderGenerator.useNormalMap+shaderGenerator.isParticleSystem;

        if(object3D.logVertexShader) console.log(shaderVert.replace(/;/g, ";\n").replace(/{/g, "{\n").replace(/}/g, "}\n"));
        if(object3D.logFragmentShader) console.log(shaderFrag.replace(/;/g, ";\n").replace(/{/g, "{\n").replace(/}/g, "}\n"));
    }

    var shader = null;
    if(gl.shaders[shaderID]){
        shader = gl.shaders[shaderID];
    }
    else{
        shader = new Ayce.Shader(gl, shaderVert, shaderFrag);
        gl.shaders[shaderID] = shader;
    }

    //Create Buffer
    var drawMode = useWireframe ? gl.LINES : undefined;
    var buffer = new Ayce.Buffer(gl, object3D, shader, attributes, uniforms, drawMode);
    if(object3D.twoFaceTransparency) {
        var indices = object3D.indices;
        indices = indices.slice().reverse().concat(indices);
        buffer.indices = new Uint16Array(indices);
    }
    else{
        buffer.indices = new Uint16Array(object3D.indices);
    }
    buffer.useTexture = Boolean(object3D.textureCoords && object3D.imageSrc);
    buffer.useSpecularMap = Boolean(object3D.textureCoords && object3D.specularMap);
    buffer.useNormalMap = Boolean(object3D.textureCoords && object3D.normalMap);
    buffer.useTransparency = object3D.transparent;
    buffer.texturesO3D = (Array.isArray(object3D.imageSrc)) ? object3D.imageSrc : [object3D.imageSrc];
    buffer.isSkybox = Boolean(object3D.isSkybox);

    buffer.init();

    /*********************************************
     *
     *      Render function
     *
     *********************************************/

    var copyMatrix = new Ayce.Matrix4();
    /**
     * Updates perspective Matrix
     * @param {Ayce.Camera} camera
     */
    this.update = function (camera) {
        //Create ModelViewMatrix
        Ayce.Matrix4.prototype.copyToMatrix(object3D.modelMatrix, modelViewMatrix);
        modelViewMatrix.apply(camera.getViewMatrix());
        
        Ayce.Matrix4.prototype.copyToMatrix(modelViewMatrix, copyMatrix);
        copyMatrix.invert();
        copyMatrix.transpose();
        copyMatrix.getMatrix3(uniformValues.normalMatrix);

        pMatrixUniform.data = camera.getPerspectiveMatrix().data;
        timeObject = Date.now()-timeObject.startTime;

        buffer.update();
    };

    /**
     * Renders buffer
     */
    this.render = function(){
        if(!object3D.visible)return;
        buffer.render();
    };

    /**
     * Updates VR perspective Matrices
     * @param {Ayce.Camera} camera
     */
    this.updateVR = function(camera){
        //Create ModelViewMatrix Left eye
        Ayce.Matrix4.prototype.copyToMatrix(object3D.modelMatrix, leftMatrix);
        leftMatrix.apply(camera.getViewMatrix("left"));

        Ayce.Matrix4.prototype.copyToMatrix(leftMatrix, copyMatrix);
        copyMatrix.invert();
        copyMatrix.transpose();
        copyMatrix.getMatrix3(leftNormalMatrix);

        //Create ModelViewMatrix Right eye
        Ayce.Matrix4.prototype.copyToMatrix(object3D.modelMatrix, rightMatrix);
        rightMatrix.apply(camera.getViewMatrix("right"));

        Ayce.Matrix4.prototype.copyToMatrix(rightMatrix, copyMatrix);
        copyMatrix.invert();
        copyMatrix.transpose();
        copyMatrix.getMatrix3(rightNormalMatrix);

        //Set Perspektive Matrix
        leftPerspektive = camera.getPerspectiveMatrix("left");
        rightPerspektive = camera.getPerspectiveMatrix("right");

        //Update Buffer
        buffer.update();
    };

    /**
     * Renders VR buffers
     * @param {String} eye
     */
    this.renderVR = function(eye){
        if(!object3D.visible)return;
        if(eye === "left"){
            modelViewMatrix.data = leftMatrix.data;
            uniformValues.normalMatrix.data = leftNormalMatrix.data;
            pMatrixUniform.data = leftPerspektive.data;
            lightContainer.locationsArray = lightContainer.locationsArrayLeftEye;
        }
        else if(eye === "right"){
            modelViewMatrix.data = rightMatrix.data;
            uniformValues.normalMatrix.data = rightNormalMatrix.data;
            pMatrixUniform.data = rightPerspektive.data;
            lightContainer.locationsArray = lightContainer.locationsArrayRightEye;
        }
        buffer.render();
    };
    
    this.dispose = function(){
        buffer.dispose();
    };
    
    this.updateTexture = function(glTexture, image){
        Ayce.Buffer.prototype.loadTexture(gl, glTexture, image);
    };
    
    this.getTextureData = function(){
        return buffer.getTextureData();
    };
};

Ayce.BufferMulti.prototype = {
    
};