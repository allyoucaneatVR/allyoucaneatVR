/**
 * jslint browser: true
 */
/**
 * Creates an object holding multiple level of detail geometries
 * @param {Array} geometriesHighToLowRes
 * @param {Number} distance
 * @param {Ayce.CameraManager} cameraManager
 * @class
 * @constructor
 */
Ayce.LODObject3D = function (geometriesHighToLowRes, distance, cameraManager) {

    Ayce.Object3D.call(this);

    var scope = this;

    this.geometries = geometriesHighToLowRes;
    this.distance = distance;

    var activeLevel = 0;
    var cameraPosition = cameraManager.getGlobalPosition();
    var lastCameraPosition = new Ayce.Vector3(cameraPosition.x+1, cameraPosition.y, cameraPosition.z);
    var lastObjectPosition = new Ayce.Vector3();

    for(var i = 0; i < this.geometries.length; i++){
        this.geometries[i].visible = false;
        scope.geometries[i].position = scope.position;
        scope.geometries[i].rotation = scope.rotation;
    }

    this.update();

    var getDistance = function(objA, objB){
        return Math.sqrt(
            Math.pow(objA.x - objB.x, 2) +
            Math.pow(objA.y - objB.y, 2) +
            Math.pow(objA.z - objB.z, 2)
        )
    };

    var setLevelActive = function(level){
        activeLevel = level;
        scope.geometries[level].visible = true;
        scope.buffer = scope.geometries[level].buffer;
    };

    var areVectorsEqual = function(vecA, vecB){
        return (vecA.x == vecB.x && vecA.y == vecB.y && vecA.z == vecB.z);
    };

    this.update = function(){
        cameraPosition = cameraManager.getGlobalPosition();
        if(!areVectorsEqual(lastCameraPosition, cameraPosition) || !areVectorsEqual(lastObjectPosition, scope.position)) {  // Only calculate LOD if cameraManager or object changed
            scope.geometries[activeLevel].visible = false;
            var currentDistance = getDistance(cameraPosition, scope.position);
            var isLODAssigned = false;
            for (var i = scope.geometries.length - 1; i >= 0; i--) {
                if (currentDistance > distance * (i + 1)) {
                    setLevelActive(i);
                    isLODAssigned = true;
                    break;
                }
            }
            if (!isLODAssigned) { // if cameraManager is closer than first LOD
                setLevelActive(0);
            }
            lastCameraPosition.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
            lastObjectPosition.set(scope.position.x, scope.position.y, scope.position.z);
        }
        scope.geometries[activeLevel].update();
    }
};

Ayce.LODObject3D.prototype = new Ayce.Object3D();//Ayce.Object3D.prototype;