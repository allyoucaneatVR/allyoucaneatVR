/**
 * Creates new buffer for object3D
 * @param {Object} gl
 * @param {Ayce.Object3D} object3D
 * @param {Ayce.Shader} shader
 * @param {Array} attributes
 * @param {Array} uniforms
 * @param {Number} drawMode
 * @class
 * @constructor
 */
Ayce.Buffer = function (gl, object3D, shader, attributes, uniforms, drawMode) {

    drawMode = drawMode || gl.TRIANGLES;

    var textures = [];
    var specularMaps = [];
    var normalMaps = [];
    
    var vertexIndexBuffer;
    var interlacedBuffer;

    var indicesSize;

    var vao;

    this.indices = null;
    this.useTexture = false;
    this.useSpecularMap = false;
    this.useTransparency = false;
    this.texturesO3D = null;
    this.isSkybox = false;

    var texturesLoading = false;
    var specularMapsLoading = false;
    var normalMapsLoading = false;

    var i = 0;
    var stride = 0;

    /**
     * *******************************************
     * Buffer initialization
     * *******************************************
     */
    this.init = function() {
        texturesLoading = this.useTexture;
        specularMapsLoading = this.useSpecularMap;
        normalMapsLoading = this.useNormalMap;

        //Get Shader Attribute Locations
        var a;
        var offset = 0;
        for(i=0; i<attributes.length; i++){
            a = attributes[i];
            a[3] = shader.getAttribLocation(a[0]);
            a[4] = offset;
            offset += a[1]*4;
            stride += a[1]*4;
        }

        //Get Shader Uniform Locations
        for(i=0; i < uniforms.length; i++){
            var u = uniforms[i];
            u[4] = new Array(1+u[3].length);
            u[4][0] = shader.getUniformLocation(u[0]);
            
//            u[5] = new Array(3);
//            u[5][0] = gl[u[1]];
//            u[5][1] = shader.getUniformLocation(u[0]);
//            var data;
//            if(u[1] == "uniformMatrix2fv" || u[1] == "uniformMatrix3fv" || u[1] == "uniformMatrix4fv"){
//                data = new Array(3); 
//            }
//            else{
//                data = new Array(2);
//                data[1] = [];
//            }
//            u[5][2] = [];
        }

        //Bind Textures
        if (this.useTexture) {
            shader.samplerUniform = shader.getUniformLocation("uSampler");
            for(i=0; i<this.texturesO3D.length; i++){
                textures.push(this.loadImage(gl, this.texturesO3D[i], this.isSkybox));
            }
        }
        if(this.useSpecularMap){
            this.texturesO3D = (Array.isArray(object3D.specularMap)) ? object3D.specularMap : [object3D.specularMap];
            shader.specularMapUniform = shader.getUniformLocation("uSpecularMapSampler");
            for(i=0; i<this.texturesO3D.length; i++){
                specularMaps.push(this.loadImage(gl, this.texturesO3D[i], this.isSkybox));
            }
        }
        if(this.useNormalMap){
            this.texturesO3D = (Array.isArray(object3D.normalMap)) ? object3D.normalMap : [object3D.normalMap];
            shader.normalMapUniform = shader.getUniformLocation("uNormalMapSampler");
            for(i=0; i<this.texturesO3D.length; i++){
                normalMaps.push(this.loadImage(gl, this.texturesO3D[i], this.isSkybox));
            }
        }

        //Interlaced array generation
        var interlacedArray = [];
        for (var index=0; index < attributes[0][2].length/attributes[0][1]; index++) {
            for(i=0; i<attributes.length; i++){
                a = attributes[i];
                this.pushData(interlacedArray, a[2], index, a[1]);
            }
        }

        //Bind interlaced Buffer
        interlacedBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, interlacedBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(interlacedArray), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        //Bind Index VBO
        vertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        indicesSize = this.indices.length;

        //Bind VAO
        if(gl.ext){
            vao = gl.ext.createVertexArrayOES();

            gl.ext.bindVertexArrayOES(vao);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
            gl.bindBuffer(gl.ARRAY_BUFFER, interlacedBuffer);

            //Enable attributes
            for(i=0; i<attributes.length; i++){
                a = attributes[i];
                this.setupAttribPointer(gl, a[3], a[1], stride, a[4]);
                offset += a[1]*4;
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.ext.bindVertexArrayOES(null);
        }
    };

    /**
     * *******************************************
     * Render function
     * *******************************************
     */
    this.update = function () {
        if(texturesLoading)     {texturesLoading     = areTexturesLoaded(texturesLoading, textures);}
        if(specularMapsLoading) {specularMapsLoading = areTexturesLoaded(specularMapsLoading, specularMaps);}
        if(normalMapsLoading)   {normalMapsLoading   = areTexturesLoaded(normalMapsLoading, normalMaps);}

//        for(i=0; i < uniforms.length; i++){
//            var u = uniforms[i];
//            u[4][1] = u[3];
//            
//            if(u[2]){
//                for(var j=0; j<u[3].length; j++){
//                    u[4][j+1] = u[2][u[3][j]];
//                }
//            }
//        }
    };

    /**
     * Indicates if all textures are done loading
     * @param {Boolean} currentStatus
     * @param {Object[]} textures
     * @return {Boolean} currentStatus
     */
    var areTexturesLoaded = function(currentStatus, textures){
        if(currentStatus){
            var allLoaded = true;
            for(i=0; i < textures.length; i++){
                if(!textures[i].loaded){
                    allLoaded = false;
                    break;
                }
            }
            currentStatus = !allLoaded;
        }
        return currentStatus;
    };

    /**
     * Renders buffer
     */
    this.render = function () {
        //TODO Alternative Texture?
        if(texturesLoading || specularMapsLoading || normalMapsLoading)return;

        //Handle transparency
        if(this.useTransparency){
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        }

        //Init Shader Program
        shader.initShaders();

        //Set Texture active
        if (this.useTexture) {
            this.activateTextures(gl, shader.samplerUniform, textures);
        }

        //Set SpecularMap texture active
        if (this.useSpecularMap) {
            for(i=0; i<specularMaps.length; i++){
                //console.log(textures.length);
                gl.activeTexture(gl.TEXTURE0+textures.length+i);
                gl.bindTexture(gl.TEXTURE_2D, specularMaps[i]);
            }
            gl.uniform1i(shader.specularMapUniform, 1);
        }

        //Set NormalMap texture active
        if (this.useNormalMap) {
            for(i=0; i<normalMaps.length; i++){
                gl.activeTexture(gl.TEXTURE0+textures.length+i);
                gl.bindTexture(gl.TEXTURE_2D, normalMaps[i]);
            }
            gl.uniform1i(shader.normalMapUniform, 1);
        }

        //Update uniform data
        for(i=0; i < uniforms.length; i++){
            var u = uniforms[i];
            u[4][1] = u[3];//UniLocation

            if(u[2]){
                for(var j=0; j<u[3].length; j++){
                    u[4][j+1] = u[2][u[3][j]];//UniData
                }
            }
        }
        //Send uniforms
        for(i=0; i < uniforms.length; i++){
//            gl[uniforms[i][1]].apply(gl, uniforms[i][4]);
//            uniforms[i][5][0].apply(gl, uniforms[i][4]);
            
            //uniform1
            if(uniforms[i][1] === "uniform1f"){
                gl.uniform1f(uniforms[i][4][0], uniforms[i][4][1]);
            }
            else if(uniforms[i][1] === "uniform1fv"){
                gl.uniform1fv(uniforms[i][4][0], uniforms[i][4][1]);
            }
            else if(uniforms[i][1] === "uniform1i"){
                gl.uniform1i(uniforms[i][4][0], uniforms[i][4][1]);
            }
            else if(uniforms[i][1] === "uniform1iv"){
                gl.uniform1iv(uniforms[i][4][0], uniforms[i][4][1]);
            }
            //uniform2
            else if(uniforms[i][1] === "uniform2f"){
                gl.uniform2f(uniforms[i][4][0], uniforms[i][4][1], uniforms[i][4][2]);
            }
            else if(uniforms[i][1] === "uniform2fv"){
                gl.uniform2fv(uniforms[i][4][0], uniforms[i][4][1]);
            }
            else if(uniforms[i][1] === "uniform2i"){
                gl.uniform2i(uniforms[i][4][0], uniforms[i][4][1], uniforms[i][4][2]);
            }
            else if(uniforms[i][1] === "uniform2iv"){
                gl.uniform2iv(uniforms[i][4][0], uniforms[i][4][1]);
            }
            //uniform3
            else if(uniforms[i][1] === "uniform3f"){
                gl.uniform3f(uniforms[i][4][0], uniforms[i][4][1], uniforms[i][4][2], uniforms[i][4][3]);
            }
            else if(uniforms[i][1] === "uniform3fv"){
                gl.uniform3fv(uniforms[i][4][0], uniforms[i][4][1]);
            }
            else if(uniforms[i][1] === "uniform3i"){
                gl.uniform3i(uniforms[i][4][0], uniforms[i][4][1], uniforms[i][4][2], uniforms[i][4][3]);
            }
            else if(uniforms[i][1] === "uniform3iv"){
                gl.uniform3iv(uniforms[i][4][0], uniforms[i][4][1]);
            }
            //uniform4
            else if(uniforms[i][1] === "uniform4f"){
                gl.uniform4f(uniforms[i][4][0], uniforms[i][4][1], uniforms[i][4][2], uniforms[i][4][3], uniforms[i][4][4]);
            }
            else if(uniforms[i][1] === "uniform4fv"){
                gl.uniform4fv(uniforms[i][4][0], uniforms[i][4][1]);
            }
            else if(uniforms[i][1] === "uniform4i"){
                gl.uniform4i(uniforms[i][4][0], uniforms[i][4][1], uniforms[i][4][2], uniforms[i][4][3], uniforms[i][4][4]);
            }
            else if(uniforms[i][1] === "uniform4iv"){
                gl.uniform4iv(uniforms[i][4][0], uniforms[i][4][1]);
            }
            //matrices
            else if(uniforms[i][1] === "uniformMatrix2fv"){
                gl.uniformMatrix2fv(uniforms[i][4][0], uniforms[i][4][1], uniforms[i][4][2]);
            }
            else if(uniforms[i][1] === "uniformMatrix3fv"){
                gl.uniformMatrix3fv(uniforms[i][4][0], uniforms[i][4][1], uniforms[i][4][2]);
            }
            else if(uniforms[i][1] === "uniformMatrix4fv"){
                gl.uniformMatrix4fv(uniforms[i][4][0], uniforms[i][4][1], uniforms[i][4][2]);
            }
            
            else{
                throw "Unkown: " + uniforms[i][1];
            }
        }

        //Bind VAO and Draw O3D
        if(gl.ext){
            gl.ext.bindVertexArrayOES(vao);
            gl.drawElements(drawMode, indicesSize, gl.UNSIGNED_SHORT, 0);
            gl.ext.bindVertexArrayOES(null);
        }
        else{
            gl.bindBuffer(gl.ARRAY_BUFFER, interlacedBuffer);

            //Enable attributes
            for(i=0; i<attributes.length; i++){
                var a = attributes[i];
                this.setupAttribPointer(gl, a[3], a[1], stride, a[4]);
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
            gl.drawElements(drawMode, indicesSize, gl.UNSIGNED_SHORT, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }

//        gl.useProgram(null);

        if(this.useTransparency){
            gl.disable(gl.BLEND);
        }
    };
    
    this.dispose = function(){
        gl.deleteBuffer(vertexIndexBuffer);
        gl.deleteBuffer(interlacedBuffer);
//        for(i=0; i < textures.length; i++){
//            gl.deleteTexture(textures[i]);
//        }
    };
    
    this.getTextureData = function(){
        return {
            textures: textures,
            specularMaps: specularMaps,
            normalMaps: normalMaps
        };
    };
};

Ayce.Buffer.prototype = {
    /**
     * Adds data to interlaced Array
     * @param {Array} array
     * @param {Number[]} values
     * @param {Number} index
     * @param {Number} numItems
     */
    pushData: function(array, values, index, numItems){
        var i;
        for (i = 0; i < numItems; i++) {
            array.push(values[index*numItems+i]);
        }
    },
    /**
     * Enables attribute and sets attribute pointer
     * @param {Object} gl
     * @param {Number} attribute
     * @param {Number} numValues
     * @param {Number} stride
     * @param {Number} offset
     */
    setupAttribPointer: function(gl, attribute, numValues, stride, offset){
//        console.log(attribute);
        gl.enableVertexAttribArray(attribute);
        gl.vertexAttribPointer(attribute, numValues, gl.FLOAT, false, stride, offset);
    },
    loadedTextures: {},
    /**
     * Description
     * @param {Object} gl
     * @param {Object} source
     * @param {Boolean} clampToEdge
     * @return {Object} texture
     */
    loadImage: function(gl, source, clampToEdge){
        var scope = this;
        // generate texture
        var texture = gl.createTexture();
        //Bind Texture
        texture.loaded = false;

        var wrapMode = gl.REPEAT;
        if(clampToEdge || source.clamp) wrapMode = gl.CLAMP_TO_EDGE;
        source = source.source ? source.source : source;

        if(this.loadedTextures[source]){
            texture.loaded = true;
            return this.loadedTextures[source];
        }
        else{
            texture.image = new Image();
            texture.image.src = source;

            /**
             * Description
             */
            texture.image.onload = function () {
                if(false){
                    var canvas = document.createElement("canvas");
                    var a = Math.min(texture.image.width, texture.image.height)/128;

                    canvas.width = texture.image.width/a;
                    canvas.height = texture.image.height/a;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(texture.image, 0, 0, canvas.width, canvas.height);
                    texture.image = canvas;
                }
                scope.loadTexture(gl, texture, texture.image, wrapMode);
                texture.loaded = true;
            };
            this.loadedTextures[source] = texture;
        }
        return texture;
    },
    loadTexture: function(gl, glTexture, image, wrapMode){
        wrapMode = wrapMode || gl.REPEAT;
        gl.bindTexture(gl.TEXTURE_2D, glTexture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapMode);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapMode);
            gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    },
    /**
     * Activates and binds texture
     * @param {Object} gl
     * @param {String} samplerUniform
     * @param {Object[]} textures
     */
    activateTextures: function(gl, samplerUniform, textures){
        var a = [];
        for(var i=0; i<textures.length; i++){
            gl.activeTexture(gl.TEXTURE0+i);
            gl.bindTexture(gl.TEXTURE_2D, textures[i]);
            a.push(i);
        }
        gl.uniform1iv(samplerUniform, a);
    }
};