/**
 * jslint browser: true
 */

/**
 * Creates new object with default values
 * @class
 * @constructor
 */
Ayce.Object3D = function () {
    var scope = this;

    //Position and Rotation of the object
    this.position = new Ayce.Vector3();
    this.rotation = new Ayce.Quaternion();
    var positionGlobal = new Ayce.Vector3();
    var rotationGlobal = new Ayce.Quaternion();
    var rotationMatrix = new Ayce.Matrix4();

    this.scale = new Ayce.Vector3(1, 1, 1);
    this.modelMatrix = new Ayce.Matrix4();

    this.parent = null;
    this.parentPositionWeight = new Ayce.Vector3(1, 1, 1);
    this.parentRotationWeight = new Ayce.Vector3(1, 1, 1);

    //Arrays for Buffer 
    this.vertices = null;
    this.normals = null;
    this.textureCoords = null;
    this.textureIndices = null;
    this.colors = null;
    this.indices = null;
    this.transparent = false;

    this.isWireframe = false;
    this.twoFaceTransparency = false;

    //Buffer
    this.buffer = null;

    //Texture Image
    this.imageSrc = null;

    //Shader
    this.shader = null;
    this.shaderAttributes = null;
    this.shaderUniforms = null;

    this.useFragmentLighting = false;
    this.specularMap = null;
    this.normalMap = null;

    this.useSpecularLighting = false;
    this.shininess = 1.0;

    //Sound
    this.soundFile = null;
    this.sound = null;

    //Skybox
    this.isSkybox = false;

    //Bounding
    this.boundingBox = null;
    this.boundingSphere = null;

    //Movement
    this.gravity = null;
    this.velocity = new Ayce.Vector3();
    this.collision = false;
    this.useBoundingSphere = false;
    this.collideWith = null;
    this.onCollision = null;
    var lastUpdateTime = Ayce.Timer.prototype.getCurrentTimeMs();
    
    //update
    this.onUpdate = null;

    //Transparent sorting
    this.renderPriority = null;

    //Hide or hide object
    this.visible = true;

    //Color used to identify object when picking
    this.identifier = null;

    //Log generated shader to console
    this.logVertexShader = false;
    this.logFragmentShader = false;

    /**
     * Description
     */
    this.calcBoundingBox = function(){
        if(!this.vertices)console.error("No Vertices set. Can't calc Bounding Box.");
        calcGlobalPosition();

        var xMin = this.vertices[0];
        var xMax = this.vertices[0];
        var yMin = this.vertices[1];
        var yMax = this.vertices[1];
        var zMin = this.vertices[2];
        var zMax = this.vertices[2];

        for(var i=0; i < this.vertices.length; i+=3){
            var x = this.vertices[i+0];
            var y = this.vertices[i+1];
            var z = this.vertices[i+2];

            if(x > xMax)xMax = x;
            if(x < xMin)xMin = x;

            if(y > yMax)yMax = y;
            if(y < yMin)yMin = y;

            if(z > zMax)zMax = z;
            if(z < zMin)zMin = z;
        }

        var a = xMax - xMin;
        var b = yMax - yMin;
        var c = zMax - zMin;

        this.boundingBox = new Ayce.Geometry.Box(a, b, c);
        this.boundingBox.position = positionGlobal;
        this.boundingBox.offset = new Ayce.Vector3(xMin, yMin, zMin);
        this.boundingBox.rotation = rotationGlobal;
        this.boundingBox.scale = this.scale;
    };

    /**
     * Description
     */
    this.calcBoundingSphere = function(){
        calcGlobalPosition();

        var s = this.scale;

        var xMin = this.vertices[0]*s.x;
        var xMax = this.vertices[0]*s.x;
        var yMin = this.vertices[1]*s.y;
        var yMax = this.vertices[1]*s.y;
        var zMin = this.vertices[2]*s.z;
        var zMax = this.vertices[2]*s.z;

        var i, x, y, z;
        for(i=0; i < this.vertices.length; i+=3){
            x = this.vertices[i+0]*s.x;
            y = this.vertices[i+1]*s.y;
            z = this.vertices[i+2]*s.z;

            if(x > xMax)xMax = x;
            if(x < xMin)xMin = x;

            if(y > yMax)yMax = y;
            if(y < yMin)yMin = y;

            if(z > zMax)zMax = z;
            if(z < zMin)zMin = z;
        }
        var centerPoint =  new Ayce.Vector3((xMax+xMin)/2, (yMax+yMin)/2, (zMax+zMin)/2);

        var radius = 0;
        for(i=0; i < this.vertices.length; i+=3){
            x = this.vertices[i+0]*this.scale.x;
            y = this.vertices[i+1]*this.scale.y;
            z = this.vertices[i+2]*this.scale.z;
            var r = Ayce.Vector3.prototype.distance(centerPoint, new Ayce.Vector3(x, y, z));
            if(r > radius)radius = r;
        }

        this.boundingSphere = new Ayce.Geometry.Sphere(radius);
        this.boundingSphere.position = positionGlobal;
        this.boundingSphere.offset = centerPoint;
        this.boundingSphere.rotation = rotationGlobal;
    };

    /**
     * Description
     */
    this.update = function(){
        var currentTime = Ayce.Timer.prototype.getCurrentTimeMs();
        var elapsedTime = currentTime-lastUpdateTime;

        //Update Movement
        var g = this.gravity;
        var v = this.velocity;

        if((g || (v.x !== 0 || v.y !== 0 || v.z !== 0)) && elapsedTime > 0){
            var p = elapsedTime/1000.0;

            if(g){
                if((g.x > 0 && v.x < g.x) || (g.x < 0 && v.x > g.x))v.x = (v.x + g.x*p);
                if((g.y > 0 && v.y < g.y) || (g.y < 0 && v.y > g.y))v.y = (v.y + g.y*p);
                if((g.z > 0 && v.z < g.z) || (g.z < 0 && v.z > g.z))v.z = (v.z + g.z*p);
            }

            this.position.x += v.x*p;
            this.position.y += v.y*p;
            this.position.z += v.z*p;

            calcGlobalPosition();

            if(this.collision && this.collideWith){
                for(var i=0; i < this.collideWith.length; i++){
                    var check = this.collideWith[i];

                    var x = (this.boundingSphere.position.x+this.boundingSphere.offset.x) - (check.boundingSphere.position.x+check.boundingSphere.offset.x);
                    var y = (this.boundingSphere.position.y+this.boundingSphere.offset.y) - (check.boundingSphere.position.y+check.boundingSphere.offset.y);
                    var z = (this.boundingSphere.position.z+this.boundingSphere.offset.z) - (check.boundingSphere.position.z+check.boundingSphere.offset.z);
                    var d = Math.sqrt (x * x + y * y + z * z);
                    var r = this.boundingSphere.r + check.boundingSphere.r;

                    if(d > r*1.3)continue;//TODO fix -> 1.3

                    var collisionCheck;

                    if(check.useBoundingSphere && this.useBoundingSphere){
                        collisionCheck = Ayce.Geometry.prototype.sphereSphereCollision(this.boundingSphere, check.boundingSphere);
                    }
                    else if(check.useBoundingSphere){
                        collisionCheck = Ayce.Geometry.prototype.boxSphereCollision(this.boundingBox, check.boundingSphere, true);
                    }
                    else if(this.useBoundingSphere){
                        collisionCheck = Ayce.Geometry.prototype.boxSphereCollision(check.boundingBox, this.boundingSphere);
                    }
                    else{
                        collisionCheck = Ayce.Geometry.prototype.boxBoxCollision(this.boundingBox, check.boundingBox);
                    }

                    if(collisionCheck){
                        this.position.subtract(collisionCheck.x, collisionCheck.y, collisionCheck.z);
                        if(this.onCollision){
                            var collisionData = {
                                collisionWith: check,
                                collisionVector: collisionCheck.negate()
                            };
                            this.onCollision(collisionData);
                        }
                    }
                }
            }
        }
        
        lastUpdateTime = currentTime;

        calcGlobalPosition();

        //Create ModelViewMatrix
        this.modelMatrix.identity();
        this.modelMatrix.applyScale(this.scale.x, this.scale.y, this.scale.z);

        rotationGlobal.toRotationMatrix(rotationMatrix);
        this.modelMatrix.apply(rotationMatrix);
        this.modelMatrix.applyTranslation(positionGlobal.x, positionGlobal.y, positionGlobal.z);
        
        if(this.onUpdate)this.onUpdate();
    };

    var poolVec = new Ayce.Vector3();
    var poolQuat = new Ayce.Quaternion();
    var calcGlobalPosition = function(){
        if(scope.parent){
            //rotation
            var r = scope.parent.getGlobalRotation();
            var qW = scope.parentRotationWeight;
            
            rotationGlobal.x = r.x * qW.x;
            rotationGlobal.y = r.y * qW.y;
            rotationGlobal.z = r.z * qW.z;
            rotationGlobal.w = r.w;
            
            Ayce.Quaternion.prototype.copyToQuaternion(rotationGlobal, poolQuat);
            rotationGlobal.getConjugate(poolQuat);
            
            rotationGlobal.normalize();
            rotationGlobal.multiply(scope.rotation, rotationGlobal);

            //position
            var pP = scope.parent.getGlobalPosition();
            var pW = scope.parentPositionWeight;
            poolVec.x = scope.position.x;
            poolVec.y = scope.position.y;
            poolVec.z = scope.position.z;
            poolQuat.rotatePoint(poolVec);
            
            positionGlobal.x = pP.x*pW.x + poolVec.x;
            positionGlobal.y = pP.y*pW.y + poolVec.y;
            positionGlobal.z = pP.z*pW.z + poolVec.z;
        }
        else{
            Ayce.Vector3.prototype.copyToVector(scope.position, positionGlobal);
            Ayce.Quaternion.prototype.copyToQuaternion(scope.rotation, rotationGlobal);

        }
    };

    /**
     * Description
     * @return positionGlobal
     */
    this.getGlobalPosition = function(){
        return positionGlobal;
    };

    /**
     * Description
     * @return rotationGlobal
     */
    this.getGlobalRotation = function(){
        return rotationGlobal;
    };
};

Ayce.Object3D.prototype = {
    /**
     * Description
     * @param {} attributeName
     * @param {} valueLength
     * @param {} sourceArray
     */
    addShaderAttribute: function(attributeName, valueLength, sourceArray){
        if(!this.shaderAttributes)this.shaderAttributes = [];
        this.shaderAttributes.push([attributeName, valueLength, sourceArray]);
    },
    /**
     * Description
     * @param {} uniformName
     * @param {} uniformType
     * @param {} object
     * @param {} args
     */
    addShaderUniform: function(uniformName, uniformType, object, args){
        if(!this.shaderUniforms)this.shaderUniforms = [];
        this.shaderUniforms.push([uniformName, uniformType, object, args]);
    }
};