/**
 * jslint browser: true
 */

/**
 * Creates new geometry with default values
 * @class
 * @constructor
 */
ayce.Geometry = function () {
    this.position = new ayce.Vector3(0, 0, 0);
    this.rotation = new ayce.Quaternion();
    this.scale = new ayce.Vector3(1, 1, 1);
    this.offset = new ayce.Vector3(0, 0, 0);
};
ayce.Geometry.prototype = {};

/**
 * Creates box as new ayce.Object3D
 * @class
 * @constructor
 * @param {Number} a
 * @param {Number} b
 * @param {Number} c
 */
ayce.Geometry.Box = function (a, b, c) {
    ayce.Geometry.call(this);

    this.a = a || 0;
    this.b = b || 0;
    this.c = c || 0;

};
ayce.Geometry.Box.prototype = new ayce.Geometry();
/**
 * Returns box geometry as ayce.Object3D
 * @param {Boolean} asWireframe
 * @return {ayce.Object3D} o3D
 */
ayce.Geometry.Box.prototype.getO3D = function (asWireframe) {

    var o3D = new ayce.Object3D();
    var o = this.offset;
    var a = this.a;
    var b = this.b;
    var c = this.c;

    o3D.vertices = [];
    o3D.vertices.push(o.x + 0, o.y + 0, o.z + 0);
    o3D.vertices.push(o.x + a, o.y + 0, o.z + 0);
    o3D.vertices.push(o.x + 0, o.y + b, o.z + 0);
    o3D.vertices.push(o.x + a, o.y + b, o.z + 0);

    o3D.vertices.push(o.x + 0, o.y + 0, o.z + c);
    o3D.vertices.push(o.x + a, o.y + 0, o.z + c);
    o3D.vertices.push(o.x + 0, o.y + b, o.z + c);
    o3D.vertices.push(o.x + a, o.y + b, o.z + c);

    o3D.normals = [];
    o3D.normals.push(-1, -1, -1);
    o3D.normals.push( 1, -1, -1);
    o3D.normals.push(-1,  1, -1);
    o3D.normals.push( 1,  1, -1);

    o3D.normals.push(-1, -1, 1);
    o3D.normals.push( 1, -1, 1);
    o3D.normals.push(-1,  1, 1);
    o3D.normals.push( 1,  1, 1);

    o3D.indices = [];
    if (asWireframe) {
        o3D.indices.push(0, 1);
        o3D.indices.push(5, 1);
        o3D.indices.push(4, 0);
        o3D.indices.push(4, 5);

        o3D.indices.push(2, 6);
        o3D.indices.push(6, 7);
        o3D.indices.push(7, 3);
        o3D.indices.push(3, 2);

        o3D.indices.push(0, 2);
        o3D.indices.push(4, 6);
        o3D.indices.push(5, 7);
        o3D.indices.push(3, 1);

        o3D.isWireframe = true;
    } else {
        //front
        o3D.indices.push(2, 1, 0);
        o3D.indices.push(2, 3, 1);
        //back
        o3D.indices.push(7, 4, 5);
        o3D.indices.push(7, 6, 4);
        //left
        o3D.indices.push(6, 0, 4);
        o3D.indices.push(6, 2, 0);
        //right
        o3D.indices.push(3, 5, 1);
        o3D.indices.push(3, 7, 5);
        //top
        o3D.indices.push(0, 5, 4);
        o3D.indices.push(0, 1, 5);
        //bottom
        o3D.indices.push(6, 3, 2);
        o3D.indices.push(6, 7, 3);
    }

    o3D.position = this.position;
    o3D.rotation = this.rotation;
    o3D.scale = this.scale;

    return o3D;
};
/**
 * Returns true if specified point is within geometry
 * @param {ayce.Vector3} vector3
 * @return b1
 */
ayce.Geometry.Box.prototype.containsPoint = function (vector3) {

    var scope = this;

    var calcCorner = function (offset) {
        var p = scope.position.copy().addVector3(offset).addVector3(scope.offset);
        p.multiply(scope.scale.x, scope.scale.y, scope.scale.z);
        p = scope.rotation.getRotatedPoint(p);
        return p;
    };

    var pointPlane = function (s, a, b, p) {
        a = a.copy().subtract(s.x, s.y, s.z);
        b = b.copy().subtract(s.x, s.y, s.z);
        var normal = a.copy().crossProduct(b).normalize();
        var x = p.copy().subtract(s.x, s.y, s.z);
        var cross = normal.dotProduct(x);
        return cross;
    };

    var t1 = calcCorner(new ayce.Vector3(0, 0, 0));
    //    var t2 = calcCorner(new ayce.Vector3(this.a, 0, 0));
    var t3 = calcCorner(new ayce.Vector3(0, this.b, 0));
    var t4 = calcCorner(new ayce.Vector3(this.a, this.b, 0));

    var b1 = calcCorner(new ayce.Vector3(0, 0, this.c));
    var b2 = calcCorner(new ayce.Vector3(this.a, 0, this.c));
    var b3 = calcCorner(new ayce.Vector3(0, this.b, this.c));
    var b4 = calcCorner(new ayce.Vector3(this.a, this.b, this.c));

    var top = pointPlane(b3, t3, b4, vector3);
    var bottom = pointPlane(b1, b2, t1, vector3);
    var left = pointPlane(b3, b1, t1, vector3);
    var right = pointPlane(b4, t4, b2, vector3);
    var front = pointPlane(b3, b4, b1, vector3);
    var back = pointPlane(t3, t1, t4, vector3);

    //    console.log(top, bottom, left, right, front, back);

    var b1 = (top > 0 && bottom > 0 && left > 0 && right > 0 && front > 0 && back > 0);
    return b1;
};

/**
 * Creates sphere geometry as ayce.Object3D
 * @class
 * @constructor
 * @param {Number} r
 */
ayce.Geometry.Sphere = function (r) {
    ayce.Geometry.call(this);

    this.r = r || 0;
};
ayce.Geometry.Sphere.prototype = new ayce.Geometry();
/**
 * Returns sphere geometry as ayce.Object3D
 * @param {Boolean} asWireframe
 * @param {Number} segments
 * @param {Number} rings
 * @return {ayce.Object3D} o3D
 */
ayce.Geometry.Sphere.prototype.getO3D = function (asWireframe, segments, rings) {
    this.scale = null;
    var longitudeBands = segments || 10;
    var latitudeBands = rings || 10;
    var radius = this.r;

    var latNumber;
    var longNumber;

    var o = this.offset;

    var o3D = new ayce.Object3D();
    o3D.vertices = [];
    o3D.normals = [];
    o3D.textureCoords = [];

    for (latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1 - (longNumber / longitudeBands);
            var v = 1 - (latNumber / latitudeBands);

            o3D.normals.push(x, y, z);
            o3D.textureCoords.push(u, v);
            o3D.vertices.push(radius * x + o.x, radius * y + o.y, radius * z + o.z);
        }
    }

    if (asWireframe) {
        o3D.isWireframe = true;
    }

    o3D.indices = [];
    for (latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (longNumber = 0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;
            if (!asWireframe) {
                o3D.indices.push(first + 1, second, first);
                o3D.indices.push(first + 1, second + 1, second);
            } else {
                o3D.indices.push(second + 1, second);
                o3D.indices.push(second, first);
                o3D.indices.push(first + 1, first);
                o3D.indices.push(first + 1, second + 1);
            }
        }
    }

    o3D.position = this.position;
    o3D.rotation = this.rotation;
    //    o3D.scale = this.scale;

    return o3D;

};

/**
 * Creates grid of vertices as new ayce.Object3D. If splitSquares is true triangles are created as faces without sharing vertices.
 * @class
 * @constructor
 * @param {Number} a
 * @param {Number} b
 * @param {Number} xSubdivisions
 * @param {Number} ySubdivisions
 * @param {Boolean} splitSquares
 */
ayce.Geometry.Plane = function (a, b, xSubdivisions, ySubdivisions, splitSquares) {
    ayce.Geometry.call(this);

    this.a = a || 0;
    this.b = b || 0;
    this.xVertices = xSubdivisions || 2;
    this.yVertices = ySubdivisions || 2;
    this.splitSquares = splitSquares;

};
ayce.Geometry.Plane.prototype = new ayce.Geometry();
/**
 * Returns plane geometry as ayce.Object3D
 * @return {ayce.Object3D} o3D
 */
ayce.Geometry.Plane.prototype.getO3D = function () {

    var o3D = new ayce.Object3D();
    var o = this.offset;
    var a = this.a;
    var b = this.b;
    var xVert = this.xVertices;
    var yVert = this.yVertices;

    o3D.vertices = [];

    var xDist = a/xVert;
    var yDist = b/yVert;

    var x, y;

    if(!this.splitSquares) {
        for (y = 0; y < this.yVertices; y++) {
            for (x = 0; x < this.xVertices; x++) {
                o3D.vertices.push(o.x + x * xDist, o.y + y * yDist, o.z);
            }
        }

        o3D.normals = [];
        for (i = 0; i < xVert * yVert; i++) {
            o3D.normals.push(0, 0, 1);
        }

        o3D.indices = [];

        for (i = 0; i < xVert * (yVert - 1); i++) {
            if ((i + 1) % xVert != 0) {
                o3D.indices.push(                       // square
                    i + 1, i + xVert, i,                // 1st triangle
                    i + xVert + 1, i + xVert, i + 1);   // 2nd triangle
            }
        }
    }else{
        for (y = 0; y < this.yVertices - 1; y++) {
            for (x = 0; x < this.xVertices - 1; x++) {
                o3D.vertices.push(
                    // first triangle
                    o.x + x * xDist, o.y + y * yDist, o.z,                  // origin
                    o.x + x * xDist + xDist, o.y + y * yDist, o.z,          // right of origin
                    o.x + x * xDist, o.y + y * yDist + yDist, o.z,          // top of origin
                    // second triangle
                    o.x + x * xDist + xDist, o.y + y * yDist, o.z,          // right of origin
                    o.x + x * xDist + xDist, o.y + y * yDist + yDist, o.z,  // top right of origin
                    o.x + x * xDist, o.y + y * yDist + yDist, o.z           // top of origin
                );
            }
        }

        o3D.normals = [];
        o3D.indices = [];
        for (var i = 0; i < o3D.vertices.length / 3; i++) {
            o3D.normals.push(0, 0, 1);
            o3D.indices.push(i);
        }
    }
    o3D.position = this.position;
    o3D.rotation = this.rotation;
    o3D.scale = this.scale;

    return o3D;
};

/**
 * Creates icosahedron with given number of subdivisions
 * @class
 * @constructor
 * @param {Number} subdivisions
 */
ayce.Geometry.Icosahedron = function (subdivisions) {
    this.subdivisions = subdivisions;
    ayce.Geometry.call(this);
};
ayce.Geometry.Icosahedron.prototype = new ayce.Geometry();
/**
 * Returns icosahedron geometry as ayce.Object3D
 * @return {ayce.Object3D} o3D
 */
ayce.Geometry.Icosahedron.prototype.getO3D = function () {

    var o3D = new ayce.Object3D();

    var golden = new ayce.Vector2(0.5, ((1 + Math.sqrt(5)) / 2) - ((1 + Math.sqrt(5)) / 2) / 2);

    var a = new ayce.Vector2(
        -golden.x,  // left top
        golden.y); // -0.5, 0.9
    var b = new ayce.Vector2(
        golden.x,   // right top
        golden.y);  // 0.5, 0.9
    var c = new ayce.Vector2(
        -golden.x,   // left bottom
        -golden.y);  // -0.5, -0.9
    var d = new ayce.Vector2(
        golden.x,   // right bottom
        -golden.y);  // 0.5, -0.9


    var unsortedVertices = [];

    unsortedVertices.push(
        a.x,    a.y,    0,  // 0 top left
        b.x,    b.y,    0,  // 1 top right
        c.x,    c.y,    0,  // 2 bottom left
        d.x,    d.y,    0,  // 3 bottom right

        0,      a.x,    a.y,// 4 near bottom
        0,      b.x,    b.y,// 5 near top
        0,      c.x,    c.y,// 6 far bottom
        0,      d.x,    d.y,// 7 far top

        a.y,    0,      a.x,// 8 far right
        b.y,    0,      b.x,// 9 near right
        c.y,    0,      c.x,// 10 far left
        d.y,    0,      d.x // 11 near left
    );

    o3D.vertices = [
        unsortedVertices[0], unsortedVertices[1], unsortedVertices[2],
        unsortedVertices[5 * 3], unsortedVertices[5 * 3 + 1], unsortedVertices[5 * 3 + 2],
        unsortedVertices[1 * 3], unsortedVertices[1 * 3 + 1], unsortedVertices[1 * 3 + 2],

        unsortedVertices[0], unsortedVertices[1], unsortedVertices[2],
        unsortedVertices[1 * 3], unsortedVertices[1 * 3 + 1], unsortedVertices[1 * 3 + 2],
        unsortedVertices[7 * 3], unsortedVertices[7 * 3 + 1], unsortedVertices[7 * 3 + 2],

        unsortedVertices[0], unsortedVertices[1], unsortedVertices[2],
        unsortedVertices[10 * 3], unsortedVertices[10 * 3 + 1], unsortedVertices[10 * 3 + 2],
        unsortedVertices[11 * 3], unsortedVertices[11 * 3 + 1], unsortedVertices[11 * 3 + 2],

        unsortedVertices[0], unsortedVertices[1], unsortedVertices[2],
        unsortedVertices[7 * 3], unsortedVertices[7 * 3 + 1], unsortedVertices[7 * 3 + 2],
        unsortedVertices[10 * 3], unsortedVertices[10 * 3 + 1], unsortedVertices[10 * 3 + 2],

        unsortedVertices[0], unsortedVertices[1], unsortedVertices[2],
        unsortedVertices[11 * 3], unsortedVertices[11 * 3 + 1], unsortedVertices[11 * 3 + 2],
        unsortedVertices[5 * 3], unsortedVertices[5 * 3 + 1], unsortedVertices[5 * 3 + 2],

        unsortedVertices[1 * 3], unsortedVertices[1 * 3 + 1], unsortedVertices[1 * 3 + 2],
        unsortedVertices[9 * 3], unsortedVertices[9 * 3 + 1], unsortedVertices[9 * 3 + 2],
        unsortedVertices[8 * 3], unsortedVertices[8 * 3 + 1], unsortedVertices[8 * 3 + 2],

        unsortedVertices[1 * 3], unsortedVertices[1 * 3 + 1], unsortedVertices[1 * 3 + 2],
        unsortedVertices[8 * 3], unsortedVertices[8 * 3 + 1], unsortedVertices[8 * 3 + 2],
        unsortedVertices[7 * 3], unsortedVertices[7 * 3 + 1], unsortedVertices[7 * 3 + 2],

        unsortedVertices[1 * 3], unsortedVertices[1 * 3 + 1], unsortedVertices[1 * 3 + 2],
        unsortedVertices[5 * 3], unsortedVertices[5 * 3 + 1], unsortedVertices[5 * 3 + 2],
        unsortedVertices[9 * 3], unsortedVertices[9 * 3 + 1], unsortedVertices[9 * 3 + 2],

        unsortedVertices[4 * 3], unsortedVertices[4 * 3 + 1], unsortedVertices[4 * 3 + 2],
        unsortedVertices[9 * 3], unsortedVertices[9 * 3 + 1], unsortedVertices[9 * 3 + 2],
        unsortedVertices[5 * 3], unsortedVertices[5 * 3 + 1], unsortedVertices[5 * 3 + 2],

        unsortedVertices[4 * 3], unsortedVertices[4 * 3 + 1], unsortedVertices[4 * 3 + 2],
        unsortedVertices[3 * 3], unsortedVertices[3 * 3 + 1], unsortedVertices[3 * 3 + 2],
        unsortedVertices[9 * 3], unsortedVertices[9 * 3 + 1], unsortedVertices[9 * 3 + 2],

        unsortedVertices[4 * 3], unsortedVertices[4 * 3 + 1], unsortedVertices[4 * 3 + 2],
        unsortedVertices[5 * 3], unsortedVertices[5 * 3 + 1], unsortedVertices[5 * 3 + 2],
        unsortedVertices[11 * 3], unsortedVertices[11 * 3 + 1], unsortedVertices[11 * 3 + 2],

        unsortedVertices[2 * 3], unsortedVertices[2 * 3 + 1], unsortedVertices[2 * 3 + 2],
        unsortedVertices[11 * 3], unsortedVertices[11 * 3 + 1], unsortedVertices[11 * 3 + 2],
        unsortedVertices[10 * 3], unsortedVertices[10 * 3 + 1], unsortedVertices[10 * 3 + 2],

        unsortedVertices[2 * 3], unsortedVertices[2 * 3 + 1], unsortedVertices[2 * 3 + 2],
        unsortedVertices[4 * 3], unsortedVertices[4 * 3 + 1], unsortedVertices[4 * 3 + 2],
        unsortedVertices[11 * 3], unsortedVertices[11 * 3 + 1], unsortedVertices[11 * 3 + 2],

        unsortedVertices[2 * 3], unsortedVertices[2 * 3 + 1], unsortedVertices[2 * 3 + 2],
        unsortedVertices[3 * 3], unsortedVertices[3 * 3 + 1], unsortedVertices[3 * 3 + 2],
        unsortedVertices[4 * 3], unsortedVertices[4 * 3 + 1], unsortedVertices[4 * 3 + 2],

        unsortedVertices[3 * 3], unsortedVertices[3 * 3 + 1], unsortedVertices[3 * 3 + 2],
        unsortedVertices[8 * 3], unsortedVertices[8 * 3 + 1], unsortedVertices[8 * 3 + 2],
        unsortedVertices[9 * 3], unsortedVertices[9 * 3 + 1], unsortedVertices[9 * 3 + 2],

        unsortedVertices[6 * 3], unsortedVertices[6 * 3 + 1], unsortedVertices[6 * 3 + 2],
        unsortedVertices[2 * 3], unsortedVertices[2 * 3 + 1], unsortedVertices[2 * 3 + 2],
        unsortedVertices[10 * 3], unsortedVertices[10 * 3 + 1], unsortedVertices[10 * 3 + 2],

        unsortedVertices[6 * 3], unsortedVertices[6 * 3 + 1], unsortedVertices[6 * 3 + 2],
        unsortedVertices[3 * 3], unsortedVertices[3 * 3 + 1], unsortedVertices[3 * 3 + 2],
        unsortedVertices[2 * 3], unsortedVertices[2 * 3 + 1], unsortedVertices[2 * 3 + 2],

        unsortedVertices[6 * 3], unsortedVertices[6 * 3 + 1], unsortedVertices[6 * 3 + 2],
        unsortedVertices[8 * 3], unsortedVertices[8 * 3 + 1], unsortedVertices[8 * 3 + 2],
        unsortedVertices[3 * 3], unsortedVertices[3 * 3 + 1], unsortedVertices[3 * 3 + 2],

        unsortedVertices[6 * 3], unsortedVertices[6 * 3 + 1], unsortedVertices[6 * 3 + 2],
        unsortedVertices[7 * 3], unsortedVertices[7 * 3 + 1], unsortedVertices[7 * 3 + 2],
        unsortedVertices[8 * 3], unsortedVertices[8 * 3 + 1], unsortedVertices[8 * 3 + 2],

        unsortedVertices[6 * 3], unsortedVertices[6 * 3 + 1], unsortedVertices[6 * 3 + 2],
        unsortedVertices[10 * 3], unsortedVertices[10 * 3 + 1], unsortedVertices[10 * 3 + 2],
        unsortedVertices[7 * 3], unsortedVertices[7 * 3 + 1], unsortedVertices[7 * 3 + 2],
    ];

    var radius = Math.sqrt(Math.pow(golden.x, 2) + Math.pow(golden.y, 2));

    var unprocessedFaces = [o3D.vertices];
    var recursions = this.subdivisions - 1;
    a = new ayce.Vector3(0, 0, 0);
    b = new ayce.Vector3(0, 0, 0);
    c = new ayce.Vector3(0, 0, 0);
    var ab = new ayce.Vector3(0, 0, 0);
    var bc = new ayce.Vector3(0, 0, 0);
    var ac = new ayce.Vector3(0, 0, 0);
    var dist;

    for(var i = 1; i < recursions + 1; i++){
        unprocessedFaces[i] = [];
    }


    for(i = 0; i < unprocessedFaces.length - 1; i++){  // iterate through rounds
        for(var j = 0; j < unprocessedFaces[i].length; j+=9){   //iterate through faces
            a.set(
                unprocessedFaces[i][j],
                unprocessedFaces[i][j + 1],
                a.z = unprocessedFaces[i][j + 2]
            );
            b.set(
                unprocessedFaces[i][j + 3],
                unprocessedFaces[i][j + 4],
                unprocessedFaces[i][j + 5]
            );
            c.set(
                unprocessedFaces[i][j + 6],
                unprocessedFaces[i][j + 7],
                unprocessedFaces[i][j + 8]
            );
            ab.set(
                (a.x + b.x) / 2,
                (a.y + b.y) / 2,
                (a.z + b.z) / 2
            );
            dist = radius / Math.sqrt(ab.x * ab.x + ab.y * ab.y + ab.z * ab.z); // distance between vertex and center (same for all vertices)
            ab.x*=dist;
            ab.y*=dist;
            ab.z*=dist;

            bc.set(
                (b.x + c.x) / 2 * dist,
                (b.y + c.y) / 2 * dist,
                (b.z + c.z) / 2 * dist
            );

            ac.set(
                (a.x + c.x) / 2 * dist,
                (a.y + c.y) / 2 * dist,
                (a.z + c.z) / 2 * dist
            );

            unprocessedFaces[i + 1].push(
                a.x, a.y, a.z, ab.x, ab.y, ab.z, ac.x, ac.y, ac.z,
                b.x, b.y, b.z, bc.x, bc.y, bc.z, ab.x, ab.y, ab.z,
                c.x, c.y, c.z, ac.x, ac.y, ac.z, bc.x, bc.y, bc.z,
                ab.x, ab.y, ab.z, bc.x, bc.y, bc.z, ac.x, ac.y, ac.z
            );

            if(j == unprocessedFaces[i].length-1){
                recursions--;
            }
        }
    }

    o3D.vertices = unprocessedFaces[unprocessedFaces.length - 1];

    o3D.indices = [];
    for(i = 0; i < o3D.vertices.length / 3; i++){
        o3D.indices.push(i);
    }

    var normal;

    o3D.normals = [];
    for(i = 0; i<o3D.vertices.length; i+=9){
        a.set(o3D.vertices[i], o3D.vertices[i + 1], o3D.vertices[i + 2]);
        b.set(o3D.vertices[i + 3], o3D.vertices[i + 4], o3D.vertices[i + 5]);
        c.set(o3D.vertices[i + 6], o3D.vertices[i + 7], o3D.vertices[i + 8]);
        ab = b.subtract(a.x, a.y, a.z);
        ac = c.subtract(a.x, a.y, a.z);
        normal = ab.crossProduct(ac);
        o3D.normals.push(normal.x, normal.y, normal.z, normal.x, normal.y, normal.z, normal.x, normal.y, normal.z);
    }

    o3D.position = this.position;
    o3D.rotation = this.rotation;
    o3D.scale = this.scale;

    return o3D;
};

ayce.Geometry.CollisionMath = {};
ayce.Geometry.CollisionMath.ObjectPool ={
    corners1: [
        new ayce.Vector3(),
        new ayce.Vector3(),
        new ayce.Vector3(),
        new ayce.Vector3(),
        new ayce.Vector3(),
        new ayce.Vector3(),
        new ayce.Vector3(),
        new ayce.Vector3()
    ],
    corners2: [
        new ayce.Vector3(),
        new ayce.Vector3(),
        new ayce.Vector3(),
        new ayce.Vector3(),
        new ayce.Vector3(),
        new ayce.Vector3(),
        new ayce.Vector3(),
        new ayce.Vector3()
    ],
    normals: [
        new ayce.Vector3(),
        new ayce.Vector3(),
        new ayce.Vector3(),
        new ayce.Vector3(),
        new ayce.Vector3(),
        new ayce.Vector3(),
        new ayce.Vector3(),
        new ayce.Vector3(),
        new ayce.Vector3(),
        new ayce.Vector3(),
        new ayce.Vector3(),
        new ayce.Vector3(),
        new ayce.Vector3(),
        new ayce.Vector3(),
        new ayce.Vector3()
    ],
    edgeNormalV1:  new ayce.Vector3(),
    edgeNormalV2:  new ayce.Vector3()
};
/**
 * TODO: Description
 * @param {} outputVector
 * @param {} boxGeo
 * @param {} addA
 * @param {} addB
 * @param {} addC
 */
ayce.Geometry.CollisionMath.calcCorner = function (outputVector,boxGeo, addA, addB, addC) {
    outputVector.x = addA ? boxGeo.a : 0;
    outputVector.y = addB ? boxGeo.b : 0;
    outputVector.z = addC ? boxGeo.c : 0;

    outputVector.addVector3(boxGeo.offset);
    outputVector.multiply(boxGeo.scale.x, boxGeo.scale.y, boxGeo.scale.z);
    boxGeo.rotation.getConjugate().rotatePoint(outputVector);
    outputVector.addVector3(boxGeo.position);
};
/**
 * Description
 * @param {} outputVector
 * @param {} s
 * @param {} u
 * @param {} v
 */
ayce.Geometry.CollisionMath.calcNormal = function (outputVector, s, u, v) {
    var x1 = u.x-s.x,
        y1 = u.y-s.y,
        z1 = u.z-s.z,
        x2 = v.x-s.x,
        y2 = v.y-s.y,
        z2 = v.z-s.z;

    outputVector.x = y1*z2 - z1*y2;
    outputVector.y = z1*x2 - x1*z2;
    outputVector.z = x1*y2 - y1*x2;
    outputVector.normalize();
};
/**
 * TODO: Description
 * @param {} v
 * @param {} c1
 * @param {} c2
 * @param {} sP
 */
ayce.Geometry.CollisionMath.getEdgeNormal = function (v, c1, c2, sP) {
    var v1 = ayce.Geometry.CollisionMath.ObjectPool.edgeNormalV1;
    v1.x = c2.x-c1.x;
    v1.y = c2.y-c1.y;
    v1.z = c2.z-c1.z;
    v1.normalize();

    var dP = v1.x*(sP.x-c1.x) + v1.y*(sP.y-c1.y) + v1.z*(sP.z-c1.z);
    v.x = v1.x * dP + c1.x - sP.x;
    v.y = v1.y * dP + c1.y - sP.y;
    v.z = v1.z * dP + c1.z - sP.z;
    v.normalize();
};

/**
 * TODO: Description
 * @param {} box1
 * @param {} box2
 * @return mtd
 */
ayce.Geometry.prototype.boxBoxCollision = function (box1, box2) {
    var calcCorner = ayce.Geometry.CollisionMath.calcCorner;
    var calcNormal = ayce.Geometry.CollisionMath.calcNormal;

    var corners1 = ayce.Geometry.CollisionMath.ObjectPool.corners1;
    calcCorner(corners1[0], box1, false, false, false);
    calcCorner(corners1[1], box1, true, false, false);
    calcCorner(corners1[2], box1, false, true, false);
    calcCorner(corners1[3], box1, true, true, false);

    calcCorner(corners1[4], box1, false, false, true);
    calcCorner(corners1[5], box1, true, false, true);
    calcCorner(corners1[6], box1, false, true, true);
    calcCorner(corners1[7], box1, true, true, true);

    var corners2 = ayce.Geometry.CollisionMath.ObjectPool.corners2;
    calcCorner(corners2[0], box2, false, false, false);
    calcCorner(corners2[1], box2, true, false, false);
    calcCorner(corners2[2], box2, false, true, false);
    calcCorner(corners2[3], box2, true, true, false);

    calcCorner(corners2[4], box2, false, false, true);
    calcCorner(corners2[5], box2, true, false, true);
    calcCorner(corners2[6], box2, false, true, true);
    calcCorner(corners2[7], box2, true, true, true);

    var normals = ayce.Geometry.CollisionMath.ObjectPool.normals;
    var normalsCount = 6;
    calcNormal(normals[0], corners1[0], corners1[1], corners1[2]);
    calcNormal(normals[1], corners1[0], corners1[4], corners1[2]);
    calcNormal(normals[2], corners1[0], corners1[1], corners1[4]);

    calcNormal(normals[3], corners2[0], corners2[1], corners2[2]);
    calcNormal(normals[4], corners2[0], corners2[4], corners2[2]);
    calcNormal(normals[5], corners2[0], corners2[1], corners2[4]);

    var i;
    var j;
    var mtd = null; //Minimum Translation Distance

    for (i = 0; i < normalsCount; i++) {
        var normal = normals[i];
        if (normal.x === 0 && normal.y === 0 && normal.z === 0) continue;

        var min1 = null;
        var max1 = null;
        for (j = 0; j < corners1.length; j++) {
            var c = normal.dotProduct(corners1[j]);
            if (min1 === null || c < min1) min1 = c;
            if (max1 === null || c > max1) max1 = c;
        }

        var min2 = null;
        var max2 = null;
        for (j = 0; j < corners2.length; j++) {
            var c = normal.dotProduct(corners2[j]);
            if (min2 === null || c < min2) min2 = c;
            if (max2 === null || c > max2) max2 = c;
        }

        if (max1 < min2 || min1 > max2) return null;


        //Collision Distance
        var distance = max1 - min2;
        if (Math.abs(max2 - min1) < Math.abs(distance)) distance = max2 - min1;
        if (Math.abs(min1 - max2) < Math.abs(distance)) distance = min1 - max2;
        if (Math.abs(min2 - max1) < Math.abs(distance)) distance = min2 - max1;
        if (min1 > min2) distance = -distance;
        var mtdNew = normal.copy().scaleBy(distance);

        if ((mtd === null || mtd.getLength() > mtdNew.getLength())) {
            mtd = mtdNew;
            mtd.normal = normal;
            mtd.distance = distance;
        }
    }
    return mtd;
};
/**
 * TODO: Description
 * @param {} box
 * @param {} sphere
 * @param {} invert
 * @return mtd
 */
ayce.Geometry.prototype.boxSphereCollision = function (box, sphere, invert) {
    if(box.a === 0 || box.b === 0 || box.c === 0)invert = true;//TODO fix...

    var calcCorner = ayce.Geometry.CollisionMath.calcCorner;
    var calcNormal = ayce.Geometry.CollisionMath.calcNormal;
    var getEdgeNormal = ayce.Geometry.CollisionMath.getEdgeNormal;

    var corners1 = ayce.Geometry.CollisionMath.ObjectPool.corners1;
    calcCorner(corners1[0], box, false, false, false);
    calcCorner(corners1[1], box, true, false, false);
    calcCorner(corners1[2], box, false, true, false);
    calcCorner(corners1[3], box, true, true, false);

    calcCorner(corners1[4], box, false, false, true);
    calcCorner(corners1[5], box, true, false, true);
    calcCorner(corners1[6], box, false, true, true);
    calcCorner(corners1[7], box, true, true, true);

    var sP = sphere.position.copy().addVector3(sphere.offset);

    var normals = ayce.Geometry.CollisionMath.ObjectPool.normals;
    var normalsCount = 15;
    calcNormal(normals[0], corners1[0], corners1[1], corners1[2]);
    calcNormal(normals[1], corners1[0], corners1[2], corners1[4]);
    calcNormal(normals[2], corners1[0], corners1[4], corners1[1]);

    getEdgeNormal(normals[3], corners1[0], corners1[1], sP);
    getEdgeNormal(normals[4], corners1[1], corners1[5], sP);
    getEdgeNormal(normals[5], corners1[4], corners1[5], sP);
    getEdgeNormal(normals[6], corners1[4], corners1[0], sP);

    getEdgeNormal(normals[7], corners1[2], corners1[6], sP);
    getEdgeNormal(normals[8], corners1[7], corners1[6], sP);
    getEdgeNormal(normals[9], corners1[7], corners1[3], sP);
    getEdgeNormal(normals[10], corners1[3], corners1[2], sP);

    getEdgeNormal(normals[11], corners1[0], corners1[2], sP);
    getEdgeNormal(normals[12], corners1[1], corners1[3], sP);
    getEdgeNormal(normals[13], corners1[7], corners1[5], sP);
    getEdgeNormal(normals[14], corners1[6], corners1[4], sP);

    var i;
    var j;
    var mtd = null; //Minimum Translation Distance
    for (i = 0; i < normalsCount; i++) {
        var normal = normals[i];
        if (normal.x === 0 && normal.y === 0 && normal.z === 0) continue;

        var min1 = null;
        var max1 = null;
        for (j = 0; j < corners1.length; j++) {
            var c = normal.dotProduct(corners1[j]);
            if (min1 === null || c < min1) min1 = c;
            if (max1 === null || c > max1) max1 = c;
        }

        var p = normal.dotProduct(sP);
        var min2 = p - sphere.r;
        var max2 = p + sphere.r;

        if (max1 < min2 || min1 > max2){return null;}

        //Collision Distance
        var distance = max1 - min2;
        if (Math.abs(max2 - min1) < Math.abs(distance)) distance = max2 - min1;
        if (Math.abs(min1 - max2) < Math.abs(distance)) distance = min1 - max2;
        if (Math.abs(min2 - max1) < Math.abs(distance)) distance = min2 - max1;

        var mtdNew = normal.copy().scaleBy(distance);
        if ((invert && min1 > min2) || (!invert && min1 < min2)) mtdNew.negate();

        if ((mtd === null || mtd.getLength() > mtdNew.getLength())) {
            mtd = mtdNew;
            mtd.distance = distance;
            mtd.normal = normal;
        }
    }
    return mtd;
};
/**
 * TODO: Description
 * @param {} sphere1
 * @param {} sphere2
 * @return Literal
 */
ayce.Geometry.prototype.sphereSphereCollision = function (sphere1, sphere2) {

    var pos1 = sphere1.position.copy().addVector3(sphere1.offset);
    var pos2 = sphere2.position.copy().addVector3(sphere2.offset);

    var distance = pos1.copy().subtract(pos2.x, pos2.y, pos2.z).getLength();

    if (distance < sphere1.r + sphere2.r) {
        var p = sphere1.position;
        var mtd = sphere2.position.copy().subtract(p.x, p.y, p.z).normalize().scaleBy((sphere1.r + sphere2.r) - distance);
        mtd.distance = distance;
        mtd.normal = mtd;
        return mtd;
    }

    return null;
};