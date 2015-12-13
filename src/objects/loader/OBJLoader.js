/**
 * jslint browser: true
 */

/**
 * Creates new loader for a wavefront object (*.obj)
 * @class
 * @param pathString
 * @returns {Ayce.Object3D[]} object
 * @constructor
 */
Ayce.OBJLoader = function (pathString) {
    //Modified version of THREE.js' OBJLoader
    var pathFile = /(.*[\/|\\])(.*)/;
    var path = pathFile.exec(pathString)[1];
    var file = pathFile.exec(pathString)[2];
    var objTxt = Ayce.XMLLoader.getSourceSynch(path+file);
    var mtlName = this.getMtlName(objTxt);
    var mtlTxt = Ayce.XMLLoader.getSourceSynch(path+mtlName);

//    console.log("Processing .obj file");
    var objs = this.readObj(objTxt);
//    console.log("Processing .mtl file");
    var mtl = mtlName ? this.readMtl(mtlTxt) : null;
//    console.log("Creating O3D(s) from .obj");

    var o3Ds = [];
    for(var i=0; i<objs.length; i++){
        var o3d = this.createO3DFromOBJ(objs[i], mtl, path);
        var name = objs[i].name;
//        console.log("Name: " + name);
        o3Ds.push(o3d);
        o3Ds[name] = o3d;
    }
//    console.log("OBJ load finished. Containing " + o3Ds.length + " Object(s).");
    return o3Ds;
};

Ayce.OBJLoader.prototype = {
    /**
     * TODO: Description
     * @param {String} objTxt
     * @return objCollection
     */
    readObj: function(objTxt){
        var vertex_pattern = /v( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;
        // vn float float float
        var normal_pattern = /vn( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;
        // vt float float
        var uv_pattern = /vt( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;
        // f vertex vertex vertex ...
        var face_pattern1 = /f( +-?\d+)( +-?\d+)( +-?\d+)( +-?\d+)?/;
        // f vertex/uv vertex/uv vertex/uv ...
        var face_pattern2 = /f( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))?/;
        // f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...
        var face_pattern3 = /f( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))?/;
        // f vertex//normal vertex//normal vertex//normal ...
        var face_pattern4 = /f( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))?/;

        var objCollection = [];
        var currentObj = {};
        currentObj.name = "";
        currentObj.vertices = [];
        currentObj.normals = [];
        currentObj.uvs = [];
        currentObj.faces = [];

        var currentMtl;

        var addFace = function(vertexPos, vertexUV, VertexNormal){
            // VertexPos/VertexUV/VertexNormal
            if(vertexPos[3] !== undefined)throw("obj quad rendering not supported");

            var face = [];
            for(var i=0; i<3; i++){
                var pos     = vertexPos[i];
                var uv      = vertexUV      ? vertexUV[i]     : undefined;
                var normal  = VertexNormal  ? VertexNormal[i] : undefined;
                face.push([pos, uv, normal]);
            }
            face.push(currentMtl);
            currentObj.faces.push(face);
        };

        var lines = objTxt.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            line = line.trim();

            var result;

            if (line.length === 0 || line.charAt(0) === '#') {
                continue;
            }
            // ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
            else if ((result = vertex_pattern.exec(line)) !== null) {

                currentObj.vertices.push([
                        parseFloat(result[1]),
                        parseFloat(result[2]),
                        parseFloat(result[3])]
                );

            }
            // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
            else if ((result = normal_pattern.exec(line)) !== null) {

                currentObj.normals.push([
                        parseFloat(result[1]),
                        parseFloat(result[2]),
                        parseFloat(result[3])]
                );

            }
            // ["vt 0.1 0.2", "0.1", "0.2"]
            else if ((result = uv_pattern.exec(line)) !== null) {
                currentObj.uvs.push([parseFloat(result[1]), parseFloat(result[2])]);
            }
            // VertexPos
            // ["f 1 2 3", "1", "2", "3", undefined]
            else if ((result = face_pattern1.exec(line)) !== null) {

                addFace(
                    [result[1], result[2], result[3], result[4]]
                );
            }
            // VertexPos/VertexTexture
            // ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]
            else if ((result = face_pattern2.exec(line)) !== null) {
                addFace(
                    [result[2], result[5], result[8], result[11]],
                    [result[3], result[6], result[9], result[12]]
                );

            }
            // VertexPos/VertexTexture/VertexNormal
            // ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]
            else if ((result = face_pattern3.exec(line)) !== null) {
                addFace(
                    [result[2], result[6], result[10], result[14]],
                    [result[3], result[7], result[11], result[15]],
                    [result[4], result[8], result[12], result[16]]
                );

            }
            // VertexPos//VertexNormal
            // ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]
            else if ((result = face_pattern4.exec(line)) !== null) {
                addFace(
                    [result[2], result[5], result[8], result[11]],
                    undefined,
                    [result[3], result[6], result[9], result[12]]
                );

            } else if (/^o /.test(line) || /^g /.test(line)) {
                if(currentObj.faces.length > 0)currentObj.faces = this.getCorrectIndices(currentObj.faces);
                if(currentObj.faces.length > 0)objCollection.push(currentObj);
                currentObj = {};
                currentObj.name = line.substring(2).trim();
                currentObj.vertices = [];
                currentObj.normals = [];
                currentObj.uvs = [];
                currentObj.faces = [];
            } else if (/^g /.test(line)) {
                //TODO
            } else if (/^mtllib /.test(line)) {
                //ignore
            } else if (/^usemtl /.test(line)) {
                currentMtl = line.substring(7).trim();
            } else if (/^s /.test(line)) {
                //TODO smooth shading
            } else {
//                console.log( "Ayce.OBJLoader: Unhandled line " + line );
            }
        }

        if(objCollection.length > 0)currentObj.faces = this.getCorrectIndices(currentObj.faces);
        objCollection.push(currentObj);
        return objCollection;
    },
    /**
     * Returns material name
     * @param {String} mtlTxt
     * @return {String} name
     */
    getMtlName: function(mtlTxt){
        var lines = mtlTxt.split('\n');

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            line = line.trim();
            if (/^mtllib /.test(line)) {
                return(line.substring(7).trim());
            }
        }
        return null;
    },
    /**
     * Description
     * @param {String} mtlTxt
     * @return mtlContainer
     */
    readMtl: function(mtlTxt){
        var lines = mtlTxt.split('\n');

        var kd_pattern = /Kd ([\d|\.|\+|\-|e|E]+) ([\d|\.|\+|\-|e|E]+) ([\d|\.|\+|\-|e|E]+)/;

        var mtlContainer = {};

        var mtlIndex = -1;
        mtlContainer.mtlName = [];
        mtlContainer.kd = [];
        mtlContainer.mapKd = [];

        for (var i=0; i < lines.length; i++) {
            var line = lines[i];
            var result;

            if (/^newmtl /.test(line)) {
                mtlIndex++;
                mtlContainer.mtlName[mtlIndex] = line.substring(7).trim();
            }
            else if ((result = kd_pattern.exec(line)) !== null) {
                mtlContainer.kd[mtlIndex] = [
                    parseFloat(result[1]),
                    parseFloat(result[2]),
                    parseFloat(result[3]),
                    1.0 //TODO read alpha
                ];
            }
            else if (/^map_Kd /.test(line)) {
                mtlContainer.mapKd[mtlIndex] = line.substring(7).trim();
            }
        }

        return mtlContainer;
    },
    /**
     * TODO: Description
     * @param {} array
     * @return array
     */
    getCorrectIndices: function(array){
        var minPosInx = parseInt(array[0][0][0]);
        var minUvInx  = parseInt(array[0][0][1]);
        var minNorInx = parseInt(array[0][0][2]);

        for(var i=0; i<array.length; i++){
            for(var j=0; j<3; j++){
                if(parseInt(array[i][j][0]) < minPosInx)minPosInx = parseInt(array[i][j][0]);
                if(parseInt(array[i][j][1]) < minUvInx) minUvInx  = parseInt(array[i][j][1]);
                if(parseInt(array[i][j][2]) < minNorInx)minNorInx = parseInt(array[i][j][2]);
            }
        }
        minPosInx -= 1;
        minUvInx -= 1;
        minNorInx -= 1;

        for(var i=0; i<array.length; i++){
            for(var j=0; j<3; j++){
                array[i][j][0] -= minPosInx;
                array[i][j][1] -= minUvInx;
                array[i][j][2] -= minNorInx;
            }
        }
        return array;
    },
    /**
     * Creates Object3D from wavefront (*.obj)
     * @param {} obj
     * @param {} mtl
     * @param {} texturePath
     * @return {Ayce.Object3D} object3D
     */
    createO3DFromOBJ: function(obj, mtl, texturePath){
        var verticesO3D = [];
        var colorO3D    = [];
        var uvO3D       = [];
        var texIndexO3D = [];
        var normalsO3D  = [];
        var indicesO3D  = [];
        var materialsO3D = [];
        var index = 0;
        var useTexture = !mtl || mtl.mapKd.length > 0;
        var multiTexture = !mtl || (useTexture && mtl.mapKd.length > 1);

        for(var i=0; i<obj.faces.length; i++){
            //faces = [[Pos/Tex/Nor][Pos/Tex/Nor][Pos/Tex/Nor][textureName]] [...] [...]
            //face = [Pos/Tex/Nor][Pos/Tex/Nor][Pos/Tex/Nor][textureName]
            var face = obj.faces[i];

            var material;
            var materialIndex = 0;
            var texture = false;
            if(!mtl || (mtl.kd.length === 0 && mtl.mapKd.length === 0)){
                material = [0.5, 0.5, 0.5, 1.0];
            }
            else{
                var mtlIndex = mtl.mtlName.indexOf(face[3]);
                texture = Boolean(mtl.mapKd[mtlIndex]);
                material = texture ? mtl.mapKd[mtlIndex] : mtl.kd[mtlIndex];

                if(texture){
                    materialIndex = materialsO3D.indexOf(material);
                    if(materialIndex < 0){
                        materialsO3D.push(material);
                        materialIndex = materialsO3D.indexOf(material);
                    }
                }
            }

            for(var j=0; j<3; j++){
                var iPos = face[j][0]-1;
                var iTex = face[j][1]-1;
                var iNor = face[j][2]-1;

                var alreadyUsed = false;
                if(false){//TODO 
                    for(var m=0; m<indicesO3D.length; m++){
                        //Existing Values
                        //Position
                        var x = verticesO3D[m*3 + 0];
                        var y = verticesO3D[m*3 + 1];
                        var z = verticesO3D[m*3 + 2];

                        //UV
                        var u = uvO3D[m*2 + 0];
                        var v = uvO3D[m*2 + 1];

                        //color
                        var r = colorO3D[m*4 + 0];
                        var g = colorO3D[m*4 + 1];
                        var b = colorO3D[m*4 + 2];
                        var a = colorO3D[m*4 + 3];

                        //Texture Indice
                        var ti = texIndexO3D[m];

                        //Normal
                        var xN = normalsO3D[m*3 + 0];
                        var yN = normalsO3D[m*3 + 1];
                        var zN = normalsO3D[m*3 + 2];


                        //New Value
                        var vO  = obj.vertices[iPos];
                        var uvO = obj.uvs[iTex];
                        var cO = material;
                        var tiO = materialIndex;
                        var nO  = obj.normals[iNor];

                        var vertexBool  = vO  ? vO[0] === x && vO[1] === y && vO[2] === z : !(x || y || z);
                        var uvBool      = uvO ? uvO[0] === u && uvO[1] === v : !(u || v);
                        var normalBool  = nO  ? nO[0] === xN && nO[1] === yN && nO[2] === zN : !(xN || yN || zN);
                        var tiBool      = tiO === ti;
                        var matBool = Boolean(texture);
                        if(!matBool){
                            tiBool = true;
                            uvBool = true;
                            matBool = cO ? cO[0] === r && cO[1] === g && cO[2] === b && cO[3] === a : !(r || g || b || a);
                        }

                        if(vertexBool && uvBool && normalBool && tiBool && matBool){
                            indicesO3D.push(parseInt(m));
                            alreadyUsed = true;
                            m = indicesO3D.length;
                        }
                    }
                }

                if(!alreadyUsed){
                    Array.prototype.push.apply(verticesO3D, obj.vertices[iPos]);
                    Array.prototype.push.apply(normalsO3D, obj.normals[iNor]);
                    if(texture){
                        Array.prototype.push.apply(uvO3D, obj.uvs[iTex]);
                        Array.prototype.push.apply(colorO3D, [0.5, 0.5, 0.5, 2.0]);
                    }
                    else{
                        Array.prototype.push.apply(colorO3D, material);
                        //TODO
//                        Array.prototype.push.apply(uvO3D, [-1.0, -1.0]);
                        Array.prototype.push.apply(uvO3D, obj.uvs[iTex]);
                    }
                    texIndexO3D.push(materialIndex);
                    indicesO3D.push(index++);
                }
            }
        }

//        console.log("Vertices: " + verticesO3D.length/3);
//        console.log("Colors:   " + colorO3D.length/4);
//        console.log("UVs:      " + uvO3D.length/2);
//        console.log("Normals:  " + normalsO3D.length/3);
//        console.log("TexIndic: " + texIndexO3D.length);
//        console.log("Indices:  " + indicesO3D.length);
//        console.log("Highest Index:  " + index);
//        console.log("---");

        var object3D = new Ayce.Object3D();
        if(verticesO3D.length > 0)  object3D.vertices = verticesO3D;
        if(colorO3D.length > 0)     object3D.colors = colorO3D;
        if(uvO3D.length > 0)        object3D.textureCoords = uvO3D;
        if(multiTexture)            object3D.textureIndices = texIndexO3D;
        if(normalsO3D.length > 0)   object3D.normals = normalsO3D;
        if(indicesO3D.length > 0)   object3D.indices = indicesO3D;

        if(useTexture){
            for(var i=0; i<materialsO3D.length; i++){
                materialsO3D[i] = texturePath+materialsO3D[i].replace(/\\/g, '/');
            }
            if(materialsO3D && materialsO3D.length > 10)throw "OBJ Loader: Can't use more than 10 Textures";
            if(materialsO3D.length > 0)object3D.imageSrc = materialsO3D;
        }

        return object3D;
    },

    /**
     * TODO: description
     * @param originO3D
     * @returns {Ayce.Object3D}
     */
    copyOBJO3D: function(originO3D){
        var newO3D = new Ayce.Object3D();
        if(originO3D.vertices)      newO3D.vertices       = originO3D.vertices.slice();
        if(originO3D.colors)        newO3D.colors         = originO3D.colors.slice();
        if(originO3D.textureCoords) newO3D.textureCoords  = originO3D.textureCoords.slice();
        if(originO3D.textureIndices)newO3D.textureIndices = originO3D.textureIndices.slice();
        if(originO3D.normals)       newO3D.normals        = originO3D.normals.slice();
        if(originO3D.indices)       newO3D.indices        = originO3D.indices.slice();
        
        newO3D.imageSrc = originO3D.imageSrc;
        return newO3D;
    }
};