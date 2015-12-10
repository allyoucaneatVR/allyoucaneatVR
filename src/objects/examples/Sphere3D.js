/**
 * jslint browser: true
 */
ayce.Sphere3D = function () {

    ayce.Object3D.call(this);

    this.imageSrc = "earth.jpg";

    this.specularMap = "earth-specular.gif";
    this.shininess = 10.0;

    this.useFragmentLighting = true;

    var latitudeBands = 30;
    var longitudeBands = 30;
    var radius = 5;

    this.vertices = [];
    this.normals = [];
    this.textureCoords = [];
    for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1 - (longNumber / longitudeBands);
            var v = 1 - (latNumber / latitudeBands);

            this.normals.push(x);
            this.normals.push(y);
            this.normals.push(z);
            this.textureCoords.push(u);
            this.textureCoords.push(v);
            this.vertices.push(radius * x);
            this.vertices.push(radius * y);
            this.vertices.push(radius * z);
        }
    }

    console.log(this.normals);
//    this.vertices.reverse();

    this.indices = [];
    for (latNumber=0; latNumber < latitudeBands; latNumber++) {
        for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;
            this.indices.push(first + 1);
            this.indices.push(second);
            this.indices.push(first);

            this.indices.push(first + 1);
            this.indices.push(second + 1);
            this.indices.push(second);
        }
    }

};

ayce.Sphere3D.prototype = ayce.Object3D.prototype;