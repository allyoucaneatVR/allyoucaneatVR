var stats = new Stats();
var scene;

function initAyce(){
    //FPS counter
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.zIndex = '1000';
    stats.domElement.style.right = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);

    //Set up ayce canvas
    var canvas = document.getElementById("ayce_canvas");
    scene = new Ayce.Scene(canvas);
    //Set up ayce scene
    scene.setClearColor(0.2, 0.2, 0.35);
    scene.getCamera().fieldOfView = 90;
    scene.getCamera().updateProjectionMatrix();

    //Check if browser is webVR compatible
    var webVR = scene.presentationPreset.useWebVR();
    if(webVR){
        //Set up enter and exite dom elements, to show the ayce scene in an hmd
        var enterElement = document.querySelector("#enter-hmd");
        var exitElement = document.querySelector("#exit-hmd");
        webVR.setHMDEnterElement(enterElement);
        webVR.setHMDExitElement(exitElement);
    }
    initAyceScene();
    update();
}

function initAyceScene(){
    //Place lights
    var light = new Ayce.Light();
    light.position.set(1, 0, 2);
    light.color.red = 1.0;
    light.color.green = 1.0;
    light.color.blue = 1.0;
    scene.addToScene(light);

    //Place cubes and spheres
    var c = 0;
    var dim = new Ayce.Vector3(3, 3, 3);
    for(var x=0; x < dim.x; x++){
        for(var y=0; y < dim.y; y++){
            for(var z=0; z < dim.z; z++){
                var o3D = null;
                if(Math.random() < 0.5 || true){
                    var cube = new Ayce.Geometry.Box(0.1, 0.1, 0.1);
                    cube.offset.set(cube.a/2, cube.b/2, cube.c/2);
                    o3D = cube.getO3D();
                }
                else{
                    var sphere = new Ayce.Geometry.Sphere(0.5);
                    sphere.offset.set(sphere.r*2, sphere.r*2, sphere.r*2);
                    o3D = sphere.getO3D();
                }
                o3D.position.set(x + 0.3*x -(dim.x+dim.x*0.3)/2, y + 0.3*y -(dim.y+dim.y*0.3)/2, -1 - z + 0.3*z);
                scene.addToScene(o3D);
                c++;
            }
        }
    }
    console.log(c);

    //Enable object picking
    scene.enablePicking();
    document.addEventListener("click", function(e){
        console.log(scene.pickObjectAt(e.clientX, e.clientY));
    });
}

function update() {
    scene.updateScene();
    stats.begin();
    scene.drawScene();
    stats.end();
    Ayce.requestAnimFrame(update);
}

window.addEventListener("load", initAyce);
