/**
 * Creates new skybox object
 * @param front
 * @param back
 * @param top
 * @param bottom
 * @param right
 * @param left
 * @param prefix
 * @param camera
 * @param farPlane
 * @class
 * @constructor
 */
Ayce.Skybox = function (front, back, top, bottom, right, left, prefix, camera, farPlane) {

    this.isSkybox = true;
    this.imageSrc = [prefix+front, prefix+back, prefix+top, prefix+bottom, prefix+right, prefix+left];
    this.parent = camera;
    this.parentRotationWeight = new Ayce.Vector3(0.0,0.0,0.0);
    this.parentPositionWeight = new Ayce.Vector3(1.0,1.0,1.0);
    var scale = (farPlane*2)/Math.sqrt(3);
    this.scale = new Ayce.Vector3(
        scale,
        scale,
        scale);

    this.vertices = [
        // Front face
        -0.5, -0.5, 0.5,
        0.5, -0.5, 0.5,
        0.5, 0.5, 0.5,
        -0.5, 0.5, 0.5,

        // Back face
        -0.5, -0.5, -0.5,
        -0.5, 0.5, -0.5,
        0.5, 0.5, -0.5,
        0.5, -0.5, -0.5,

        // Top face
        -0.5, 0.5, -0.5,
        -0.5, 0.5, 0.5,
        0.5, 0.5, 0.5,
        0.5, 0.5, -0.5,

        // Bottom face
        -0.5, -0.5, -0.5,
        0.5, -0.5, -0.5,
        0.5, -0.5, 0.5,
        -0.5, -0.5, 0.5,

        // Right face
        0.5, -0.5, -0.5,
        0.5, 0.5, -0.5,
        0.5, 0.5, 0.5,
        0.5, -0.5, 0.5,

        // Left face
        -0.5, -0.5, 0.5,
        -0.5, 0.5, 0.5,
        -0.5, 0.5, -0.5,
        -0.5, -0.5, -0.5
    ];
    this.textureCoords = [

        // Front face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        // Back face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,

        // Top face
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,

        // Bottom face
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,

        // Right face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,

        // Left face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0
    ];

    this.textureIndices = [
        0, 0, 0, 0,
        1, 1, 1, 1,
        2, 2, 2, 2,
        3, 3, 3, 3,
        4, 4, 4, 4,
        5, 5, 5, 5
    ];

    this.normals = null;

    this.indices = [
        0, 1, 2, 0, 2, 3, // Front face
        4, 5, 6, 4, 6, 7, // Back face
        8, 9, 10, 8, 10, 11, // Top face
        12, 13, 14, 12, 14, 15, // Bottom face
        16, 17, 18, 16, 18, 19, // Right face
        20, 21, 22, 20, 22, 23 // Left face
    ];
    this.indices.reverse();

    this.calcBoundingBox();
};

Ayce.Skybox.prototype = new Ayce.Object3D();