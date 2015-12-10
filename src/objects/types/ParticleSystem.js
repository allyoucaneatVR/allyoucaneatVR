/**
 * Creates new particle system
 * @param {ayce.Scene} scene
 * @param {ayce.Object3D} geometry
 * @param {Number} quantity
 * @param {Number} prewarmTime
 * @class
 * @constructor
 */
ayce.ParticleSystem = function (scene, geometry, quantity, prewarmTime) {

    ayce.Object3D.call(this);

    var VALUES_PER_POSITION = 3;
    var VALUES_PER_VELOCITY = 3;
    var VALUES_PER_ROTATION = 3;
    var VALUES_PER_LIFETIME = 1;
    var VALUES_PER_GRAVITY = 1;
    var VALUES_PER_GRAVITY_EXP = 1;

    this.particles = [];

    var i;
    for(i=0;i<quantity;i++){
        this.particles.push(new ayce.Particle());
    }

    this.vertices = [];
    this.colors = null;
    this.textureCoords = null;
    this.indices = [];
    this.velocities = [];
    this.lifetimes = [];
    this.gravities = [];
    this.gravityExps = [];
    this.geometries = [];
    this.rotationAngles = [];
    this.normals = null;

    this.imageSrc = geometry.imageSrc;

    this.shader = null;

    var timeObject = {
        time: 0,
        startTime: Date.now()
    };

    this.shaderAttributes = [];
    this.shaderAttributes.push(["aGeometryPosition", VALUES_PER_POSITION, this.geometries]);
    this.shaderAttributes.push(["aVertexVelocity", VALUES_PER_VELOCITY, this.velocities]);
    this.shaderAttributes.push(["aVertexRotation", VALUES_PER_ROTATION, this.rotationAngles]);
    this.shaderAttributes.push(["aLifetime", VALUES_PER_LIFETIME, this.lifetimes]);
    this.shaderAttributes.push(["aGravity", VALUES_PER_GRAVITY, this.gravities]);
    this.shaderAttributes.push(["aGravityExponent", VALUES_PER_GRAVITY_EXP, this.gravityExps]);

    this.shaderUniforms = [];
    this.shaderUniforms.push(["uTime", "uniform1f", timeObject, ["time"]]);

    /**
     * Initializes particle system after all values have been set
     */
    this.initParticleArrays = function() {
        var j;
        for (i = 0; i < this.particles.length; i++) {   // create global vertex for every vertex in the particle system
            var particle = this.particles[i];
            for (j = 0; j < geometry.vertices.length; j += 3) {
                this.vertices.push(geometry.vertices[j]*particle.scale.x + particle.position.x);     //x
                this.vertices.push(geometry.vertices[j + 1]*particle.scale.y + particle.position.y); //y
                this.vertices.push(geometry.vertices[j + 2]*particle.scale.z + particle.position.z); //z
                this.geometries.push(geometry.vertices[j] * particle.scale.x);
                this.geometries.push(geometry.vertices[j + 1] * particle.scale.y);
                this.geometries.push(geometry.vertices[j + 2] * particle.scale.z);
            }
        }

        if(geometry.textureCoords&&geometry.textureCoords[0]!=-1){
            this.textureCoords = [];
            for (i = 0; i < this.particles.length; i++) {
                this.textureCoords = this.textureCoords.concat(geometry.textureCoords);
            }
        }else {
            this.colors = [];
            for (i = 0; i < this.particles.length; i++) {
                if(this.particles[i].colors){
                    this.colors = this.colors.concat(this.particles[i].colors);
                }else{
                    this.colors = this.colors.concat(geometry.colors);
                }
            }
        }
        for (i = 0; i < this.particles.length; i++) {
            for (j = 0; j < geometry.indices.length; j++) {
                this.indices.push(geometry.indices[j] + i * geometry.vertices.length / VALUES_PER_POSITION);
            }
        }
        for (i = 0; i < this.particles.length; i++) {
            for (j = 0; j < geometry.vertices.length/VALUES_PER_POSITION; j++) {
                if(geometry.velocities){  // if geometry is particle system
                    this.velocities.push(this.particles[i].velocity.x+geometry.velocities[j*VALUES_PER_VELOCITY]);
                    this.velocities.push(this.particles[i].velocity.y+geometry.velocities[j*VALUES_PER_VELOCITY+1]);
                    this.velocities.push(this.particles[i].velocity.z+geometry.velocities[j*VALUES_PER_VELOCITY+2]);
                }else { // geometry is regular geometry
                    this.velocities.push(this.particles[i].velocity.x);
                    this.velocities.push(this.particles[i].velocity.y);
                    this.velocities.push(this.particles[i].velocity.z);
                }
            }
        }
        for (i = 0; i < this.particles.length; i++) {
            for (j = 0; j < geometry.vertices.length/VALUES_PER_POSITION; j++) {
                if(geometry.lifetimes){ // if geometry is particle system
                    if(geometry.lifetimes[j] === 0.0){
                        this.lifetimes.push(this.particles[i].lifetime);
                    }else {
                        this.lifetimes.push(Math.min(this.particles[i].lifetime, geometry.lifetimes[j]));
                    }
                }else{ // geometry is regular geometry
                    this.lifetimes.push(this.particles[i].lifetime);
                }
            }
        }
        for (i = 0; i < this.particles.length; i++) {
            for (j = 0; j < geometry.vertices.length/VALUES_PER_POSITION; j++) {
                if(geometry.gravities){
                    this.gravities.push(this.particles[i].gravity+geometry.gravities[j]);
                }else{
                    this.gravities.push(this.particles[i].gravity);
                }
                this.gravityExps.push(this.particles[i].gravityExponent);
            }
        }
        for (i = 0; i < this.particles.length; i++) {
            for (j = 0; j < geometry.vertices.length/VALUES_PER_POSITION; j++) {
                this.rotationAngles.push(this.particles[i].rotationAngle.x);
                this.rotationAngles.push(this.particles[i].rotationAngle.y);
                this.rotationAngles.push(this.particles[i].rotationAngle.z);
            }
        }

        if(geometry.normals){
            this.normals = [];
            for (i = 0; i < this.particles.length; i++) {
                this.normals = this.normals.concat(geometry.normals);
            }
        }

//        console.log(
//            this.vertices.length / VALUES_PER_POSITION + " vertices;\n" +
//            this.geometries.length / VALUES_PER_POSITION + " geometries;\n" +
//            this.colors.length / 4 + " colors;\n" +
//            this.indices.length + " indices;\n" +
//            this.velocities.length / 3 + " velocities;\n" +
//            this.lifetimes.length + " lifetimes;\n" +
//            this.gravities.length + " gravities;\n" +
//            this.gravityExps.length + " gravity exponents;\n" +
//            this.rotationAngles.length / 3 + " rotationAngles."
//        );
    };

    var superUpdate = this.update;
    /**
     * Updates time for particle system animation
     */
    this.update = function(){
        superUpdate.call(this);
        timeObject.time = Date.now()+prewarmTime-timeObject.startTime;
    };
};

ayce.ParticleSystem.prototype = new ayce.Object3D();

/**
 * Creates new particle
 * @class
 * @constructor
 */
ayce.Particle = function () {
    this.position = new ayce.Vector3(0.0, 0.0, 0.0);
    this.rotationAngle = new ayce.Vector3(0.0, 0.0, 0.0);
    this.scale = new ayce.Vector3(1, 1, 1);

    this.vertices = [];
    this.colors = null;
    this.velocity = new ayce.Vector3(0.0,0.0,0.0);
    this.lifetime = 0.0;
    this.gravity = 0.0;
    this.gravityExponent = 1.0;
};