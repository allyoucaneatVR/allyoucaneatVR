/**
 * Generates shader from given values
 * @class
 * @constructor
 */
Ayce.ShaderGenerator = function () {

    this.lightsCount = 2;
    this.texturesCount = 1;
    this.useNormals = false;
    this.useVertexLighting = false;
    this.useFragmentLighting = false;
    this.useSpecularLighting = false;
    this.useTexture = false;
    this.useColor = false;
    this.useSpecularMap = false;
    this.useNormalMap = false;
    this.isParticleSystem = false;

//    var useLightingArray = true;//Boolean(this.lightsCount > 1);
    var useTextureArray = false;

    this.vertexShader = "";
    this.fragmentShader = "";

    /**
     * Assembles shader according to given variable values
     */
    this.init = function(){
        if (!this.useTexture) {
            this.useSpecularMap = false;
            this.useNormalMap = false;
        }
        useTextureArray = Boolean(this.texturesCount > 1);

        this.vertexShader +=
            "attribute vec3 aVertexPosition;";

        if(this.useColor){
            this.vertexShader +=
                "attribute vec4 aVertexColor;";
        }

        if(this.useTexture){
            this.vertexShader +=
                "attribute vec2 aTextureCoord;";
        }

        if (this.useNormals) {
            this.vertexShader +=
                "attribute vec3 aVertexNormal;";
        }

        if(this.isParticleSystem) {
            this.vertexShader +=
                "attribute vec3 aGeometryPosition;" +
                "attribute vec3 aVertexVelocity;" +
                "attribute vec3 aVertexRotation;" +
                "attribute float aLifetime;" +
                "attribute float aGravity;" +
                "attribute float aGravityExponent;";
        }

        if (this.useTexture && useTextureArray) {
            this.vertexShader +=
                "attribute float aTextureIndex;";
        }

        this.vertexShader +=
            "uniform mat4 uMVMatrix;" +
            "uniform mat4 uPMatrix;";

        if(this.isParticleSystem) {
            this.vertexShader +=
                "uniform float uTime;";

        }

        if (this.useNormals) {
            this.vertexShader +=
                "uniform mat3 uNMatrix;";
        }
        if (this.useVertexLighting) {
            this.vertexShader +=
                "uniform vec3 uAmbientColor;" +
                "uniform vec3 uPointLightingLocations[" + this.lightsCount + "];" +
                "uniform vec3 uPointLightingColors[" + this.lightsCount + "];" +
                "const int cLightCount = " + this.lightsCount + ";";

            if(this.useSpecularLighting){
                this.vertexShader +=
                "uniform float uShininess;";
            }

            if(this.useSpecularLighting){
                this.vertexShader +=
                "uniform vec3 uSpecularColors[" + this.lightsCount + "];";
            }

        }

        if(this.useColor){
            this.vertexShader +=
                "varying vec4 vColor;";
        }

        if(this.useTexture) {
            this.vertexShader +=
                "varying vec2 vTextureCoord;";
        }

        if (this.useVertexLighting) {
            this.vertexShader +=
                "varying vec3 vLightWeighting;";
        } else if (this.useFragmentLighting) {
            this.vertexShader +=
                "varying vec3 vTransformedNormal;" +
                "varying vec4 vPosition;";
        }

        if (this.useTexture) {
            if (useTextureArray) {
                this.vertexShader +=
                    "varying float vTextureIndex;";
            }
        }

        this.vertexShader +=
            "void main(void) {";
        if(this.isParticleSystem){
            this.vertexShader +=
                "float factor;" +
                "if(aLifetime==0.0){" +
                "factor = uTime;" +
                "}else{" +
                "factor = mod(uTime, aLifetime);" +
                "}" +
                "vec3 distance = aGeometryPosition - aVertexPosition;" +
                "float xAngle = aVertexRotation.x*factor;" +
                "float yAngle = aVertexRotation.y*factor;" +
                "float zAngle = aVertexRotation.z*factor;" +
                "mat4 xRotation = mat4(" +
                "1.0,	 		 0.0,			 0.0,			 0.0," +
                "0.0,			 cos(xAngle),	 sin(xAngle),	 0.0," +
                "0.0,			-sin(xAngle),	 cos(xAngle),	 0.0," +
                "0.0,	 		 0.0,			 0.0,			 1.0" +
                ");" +
                "mat4 yRotation = mat4(" +
                "cos(yAngle),	 0.0,			-sin(yAngle),	 0.0," +
                "0.0,			 1.0,	 		 0.0,			 0.0," +
                "sin(yAngle),	 0.0,	 		 cos(yAngle),	 0.0," +
                "0.0,			 0.0,	 		 0.0,			 1.0" +
                ");" +
                "mat4 zRotation = mat4(" +
                "cos(zAngle),	 sin(zAngle),	 0.0,			 0.0," +
                "-sin(zAngle),	 cos(zAngle),	 0.0,			 0.0," +
                "0.0,			 0.0,			 1.0,			 0.0," +
                "0.0,			 0.0,			 0.0,			 1.0" +
                ");" +
                "vec4 position = vec4(aGeometryPosition, 1.0)*xRotation*yRotation*zRotation;" +
                "position = position-vec4(distance, 0.0);" +
                "vec3 velocity = aVertexVelocity+vec3(0.0, aGravity*pow(factor, aGravityExponent),0.0);" +
                "position = uMVMatrix * vec4(position.xyz+velocity*factor, 1.0);";

        }else {
            if (!this.useFragmentLighting) { // only fragment lighting requires different code here
                this.vertexShader +=
                    "vec4 position = uMVMatrix * vec4(aVertexPosition, 1.0);";
            } else if (this.useFragmentLighting) {
                this.vertexShader +=
                    "vPosition = uMVMatrix * vec4(aVertexPosition, 1.0);" +
                    "vec4 position = vPosition;";
            }
        }

        this.vertexShader +=
            "gl_Position = uPMatrix * position;";

        if (this.useTexture && useTextureArray) {
            this.vertexShader +=
                "vTextureIndex = aTextureIndex;";
        }

        if (this.useTexture) {
            this.vertexShader +=
                "vTextureCoord = aTextureCoord;";
        }

        if (this.useColor) {
            this.vertexShader +=
                "vColor = aVertexColor;";
        }

        if (this.useVertexLighting) {
            this.vertexShader +=
                "vLightWeighting = uAmbientColor;";
            if(this.isParticleSystem) {
                this.vertexShader +=
                    "vec3 transformedNormal = uNMatrix * (vec4(aVertexNormal, 1.0) * xRotation * yRotation * zRotation).xyz;";
            }else{
                this.vertexShader +=
                    "vec3 transformedNormal = uNMatrix * aVertexNormal;";
            }
            this.vertexShader +=
                "vec3 normal = normalize(transformedNormal);" +
                "vec3 eyeDirection = normalize(-position.xyz);" +
                this.getVertexLightingWeightCalcArrayVertex(this.lightsCount, this.useSpecularLighting);
        } else if (this.useFragmentLighting) {
            if(this.isParticleSystem){
                this.vertexShader +=
                    "vTransformedNormal = uNMatrix * (vec4(aVertexNormal, 1.0) * xRotation * yRotation * zRotation).xyz;";
            }else {
                this.vertexShader +=
                    "vTransformedNormal = uNMatrix * aVertexNormal;";
            }
        }

        this.vertexShader +=
            "}";
///////////////////////////////////////////////////////////////////////////////////////

        this.fragmentShader +=
            "precision mediump float;";

        if (this.useVertexLighting) {
            this.fragmentShader +=
                "varying vec3 vLightWeighting;";
        } else if (this.useFragmentLighting) {
            this.fragmentShader +=
                "varying vec3 vTransformedNormal;" +
                "varying vec4 vPosition;" +
                "uniform vec3 uAmbientColor;" +
                "uniform vec3 uPointLightingLocations[" + this.lightsCount + "];" +
                "uniform vec3 uPointLightingColors[" + this.lightsCount + "];" +
                "const int cLightCount = " + this.lightsCount + ";";

            if(this.useSpecularLighting){
                this.fragmentShader +=
                    "uniform float uShininess;";
            }

            if(this.useSpecularLighting){
                this.fragmentShader +=
                    "uniform vec3 uSpecularColors[" + this.lightsCount + "];";
            }
        }

        if (this.useColor) {
            this.fragmentShader +=
                "varying vec4 vColor;";
        }

        if (this.useTexture) {
            this.fragmentShader +=
                "varying vec2 vTextureCoord;";
            if (useTextureArray) {
                this.fragmentShader +=
                "varying float vTextureIndex;" +
                "uniform sampler2D uSampler[" + this.texturesCount + "];";
            }
            else {
                this.fragmentShader +=
                "uniform sampler2D uSampler;";
            }
        }
        if (this.useSpecularMap) {
            this.fragmentShader +=
                "uniform sampler2D uSpecularMapSampler;";
        }

        if (this.useNormalMap) {
            this.fragmentShader +=
                "uniform sampler2D uNormalMapSampler;";
        }

        this.fragmentShader +=
            "void main(void) {" +
            "vec4 fragmentColor;";

        if (this.useFragmentLighting) {
            this.fragmentShader +=
                "vec3 lightWeighting = uAmbientColor;" +
                "vec3 normal = normalize(vTransformedNormal);" +
                "vec3 eyeDirection = normalize(-vPosition.xyz);" +
                this.getFragmentLightingWeightCalcArrayVertex(this.lightsCount, this.useSpecularMap, this.useNormalMap, this.useSpecularLighting);
        }

        if (this.useTexture && useTextureArray) {
            this.fragmentShader +=
                "if (vTextureCoord.x > -0.5 && vTextureCoord.y > -0.5) {" +
                "vec4 tex = vec4(0.0);" +
                "float i = vTextureIndex;" +
                this.getTextureCalcArray(this.texturesCount) +
                "fragmentColor = tex;" +
                "} else {";
            if (this.useColor) {
                this.fragmentShader +=
                    "fragmentColor = vColor;";
            }
            else {
                this.fragmentShader +=
                    "fragmentColor = vec4(0.5, 0.5, 0.5, 1.0);";
            }
            this.fragmentShader +=
                "}";
        }
        else if (this.useTexture) {
            this.fragmentShader +=
                "fragmentColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));";
        }
        else if (this.useColor) {
            this.fragmentShader +=
                "fragmentColor = vColor;";
        }
        else {
            this.fragmentShader +=
                "fragmentColor = vec4(0.5, 0.5, 0.5, 1.0);";
        }

        if (this.useVertexLighting) {
            this.fragmentShader +=
                "gl_FragColor = vec4(fragmentColor.rgb * vLightWeighting, fragmentColor.a);";
        } else if (this.useFragmentLighting) {
            this.fragmentShader +=
                "gl_FragColor = vec4(fragmentColor.rgb * lightWeighting, fragmentColor.a);";
        } else {
            this.fragmentShader +=
                "gl_FragColor = fragmentColor;";
        }
        this.fragmentShader += "}";
    };
};

Ayce.ShaderGenerator.prototype = {
    /**
     * Returns shader code for lighting calculation per vertex
     * @param {Number} lightsCount
     * @return {String} string
     */
    getVertexLightingWeightCalcArrayVertex: function(lightsCount, useSpecularLighting){
        var string = "";
        string +=
            "for(int i = 0; i < cLightCount; i++){" +
            "vec3 lightDirection = normalize(uPointLightingLocations[i] - position.xyz);" +
            "vec3 reflectionDirection = reflect(-lightDirection, normal);" +
            "float diffuseLightWeighting = max(dot(normalize(transformedNormal), lightDirection), 0.0);";

        if(useSpecularLighting) {
            string +=
                "float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uShininess);" +
                "vLightWeighting += uPointLightingColors[i] * diffuseLightWeighting + uSpecularColors[i] * specularLightWeighting;";
        }else{
            string +=
                "vLightWeighting += uPointLightingColors[i] * diffuseLightWeighting;";
        }
        string+=
            "}";
        return string;
    },
    /**
     * Returns shader code for lighting calculation per fragment
     * @param {Number} lightsCount
     * @param {Boolean} useSpecularMap
     * @param {Boolean} useNormalMap
     * @param {Boolean} useSpecularLighting
     * @return {String} string
     */
    getFragmentLightingWeightCalcArrayVertex: function(lightsCount, useSpecularMap, useNormalMap, useSpecularLighting){
        var string = "";
        string += "" +
            "for(int i = 0; i < cLightCount; i++){" +
            "vec3 lightDirection = normalize(uPointLightingLocations[i] - vPosition.xyz);" +
            "vec3 reflectionDirection = reflect(-lightDirection, normal);";
        if(useSpecularMap){
            string +=
                "float shininess = texture2D(uSpecularMapSampler, 255.0-vec2(vTextureCoord.s, vTextureCoord.t)).r * 255.0 * uShininess;" +
                "float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), shininess);";
        }else {
            if(useSpecularLighting) {
                string +=
                    "float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uShininess);";
            }
        }

        if(useNormalMap){
            string+=
                "vec3 normalMap = texture2D(uNormalMapSampler, vec2(vTextureCoord.s, vTextureCoord.t)).rgb*2.0-1.0;" +
                "float diffuseLightWeighting = max(dot(normalize(normalMap), lightDirection), 0.0);";
        }else{
            string+=
                "float diffuseLightWeighting = max(dot(normalize(vTransformedNormal), lightDirection), 0.0);";
        }

        if(useSpecularLighting) {
            string +=
                "lightWeighting += uPointLightingColors[i] * diffuseLightWeighting + uSpecularColors[i] * specularLightWeighting;";
        }else{
            string +=
                "lightWeighting += uPointLightingColors[i] * diffuseLightWeighting;";
        }
        string+=
            "}";
        return string;
    },
    /**
     * Returns shader code for handling multiple shaders
     * @param {Number} textureCount
     * @return {String} string
     */
    getTextureCalcArray: function(textureCount){
        var string = "";
        for(var i=0; i<textureCount; i++){
            if(i !== 0) string += "else ";
            string +=
                "if(i-"+i+".0 < 0.01){" +
                "tex = texture2D(uSampler["+i+"], vec2(vTextureCoord.s, vTextureCoord.t));" +
                "}";
        }
        return string;
    }

};