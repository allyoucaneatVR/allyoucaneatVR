/**
 * Creates vertex and fragment shader from given strings
 * @param {Object} gl
 * @param {String} vertexString
 * @param {String} fragmentString
 * @class
 * @constructor
 */
Ayce.Shader = function (gl, vertexString, fragmentString) {
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexString);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert("ShaderVert: " + "\n" + gl.getShaderInfoLog(vertexShader));
        return null;
    }

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentString);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert("ShaderFrag: " + "\n" + gl.getShaderInfoLog(fragmentShader));
        return null;
    }

    var shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
    gl.validateProgram(shaderProgram);

    /**
     * Uses shader program
     */
    this.initShaders = function () {
        if(shaderProgram === Ayce.Shader.prototype.currentShader){
            return;
        }
        gl.useProgram(shaderProgram);
        Ayce.Shader.prototype.currentShader = shaderProgram;
    };

    /**
     * Returns the location of a shader attribute
     * @param {String} varName
     * @return {Number} attributeLocation
     */
    this.getAttribLocation = function (varName){
        return gl.getAttribLocation(shaderProgram, varName);
    };

    /**
     * Returns the location of a shader uniform
     * @param {String} varName
     * @return {Number} uniformLocation
     */
    this.getUniformLocation = function (varName){
        return gl.getUniformLocation(shaderProgram, varName);
    };
};

Ayce.Shader.prototype = {
    currentShader: null
};