THREE = require('three');
Detector = require('./Detector.js');
MTLLoader = require('./MTLLoader.js');
OBJLoader = require('./OBJLoader.js');
TGALoader = require('./TGALoader.js');
OrbitControls = require('./OrbitControls.js');
helper = require('./helper.js');
Stats = require('stats.js');
urljoin = require('url-join');
detectWebGL();

var container;
var camera, controls, scene, renderer;
var cameraInitPosition, cameraInitFov;
// lookat variable should be a vector3
var cameraInitLookAt = new THREE.Vector3();
var modelInitPosition = new THREE.Vector3();
var lighting, ambient, keyLight, fillLight, backLight;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight /2;
var modelObject = null;
/* var BASE_URL = ".";*/
var BASE_URL = "http://10.101.1.151:8081";
var ASSETS_URL = "models/";

var CAMERA_DOLLY_SCALE = 3;

var CAMERA_DOLLY_MAX = 500;
var CAMERA_DOLLY_MIN = -500;


function detectWebGL(){
    if (!Detector.webgl){
        Detector.addGetWebGLMessage();
    }
}

function initSceneLights(){
    ambient = new THREE.AmbientLight(0xffffff ,1.0);

    keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
    keyLight.position.set(-100, 0, 100);

    fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
    fillLight.position.set(100, 0, -100).normalize();

    backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(100, 0, -100).normalize();

    scene.add(ambient);
    /* scene.add(keyLight);
     * scene.add(fillLight);
     * scene.add(backLight);
     */
}

// load shader example
function loadShader(vsPath, fgPath, vertexShader, fragmentShader){
    $.get(vsPath, function(vShader){
        $.get(fgPath, function(fShader){
            vertexShader = vShader;
            fragmentShader = fShader;
        });
    });

    // example:
    // when define material
    // material = new THREE.ShaderMaterial({
    //   vertexShader: vertexShader,
    //   fragmentShader: fragmentShader
    // });
}


function initControl(){
    // controls settings.
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.enableKeys = false;
}


function setPanMode(){
    controls.enablePan = true;
    controls.enableZoom = false;
    controls.enableRotate = false;

    controls.mouseButtons = {
        PAN: THREE.MOUSE.LEFT
    };
}

function setRotateMode(){
    controls.enableRotate = true;
    controls.enableZoom = false;
    controls.enbalePan = false;
    controls.mouseButtons = {
        ORBIT: THREE.MOUSE.LEFT
    };

};

function loadObj(objFilePath, mtlFilePath){
    var manager = new THREE.LoadingManager();
    manager.onStart = function(url, itemsLoaded, itemsTotal){
        console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    };
    manager.onLoad = function ( ) {
        console.log( 'Loading complete!');
    };
    manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
        console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    };
    manager.onError = function ( url ) {
        console.log( 'There was an error loading ' + url );
    };

    var mtlLoader = new THREE.MTLLoader(manager);
    mtlLoader.setPath(urljoin(BASE_URL,ASSETS_URL));
    mtlLoader.crossOrigin = '';

    var onProgress = function(xhr){
        if (xhr.lengthComputable){
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log(Math.round(percentComplete, 2) + '% downloaded');
        }
    };
    var onError =function( xhr ){
        console.log("loading object error " + xhr);
    };

    THREE.Loader.Handlers.add( /\.tga$/i, new THREE.TGALoader() );
    mtlLoader.load(mtlFilePath, function(materials){
        materials.preload();
        // console.log(materials.materials.default.map);
        // materials.materials.default.map.magFilter = THREE.NearestFilter;
        // materials.materials.default.map.minFilter = THREE.LinearFilter;
        var objLoader = new THREE.OBJLoader(manager);
        objLoader.setMaterials(materials);
        objLoader.setPath(urljoin(BASE_URL,ASSETS_URL));
        objLoader.load(objFilePath, function(object){
            // set all children to doubleside
            object.traverse(function(child){
                if( child instanceof THREE.Mesh){
                    child.material.side = THREE.DoubleSide;
                }
            });
            scene.add(object);
            modelObject = object;
            var centerPosition = new THREE.Vector3(0, 0 , 0);
            var boundingBox = null;
            object.traverse(function(child){
                if(child.geometry != undefined){
                    centerPosition = helper.getCentroid(child);
                    // set object center to the same as world center;
                    object.position.set(-centerPosition.x, -centerPosition.y, -centerPosition.z);

                    modelInitPosition = object.position;
                    boundingBox = helper.getBoundingBox(child);
                }
            });
            helper.drawBoundingBox(scene, object);


            var dist = Math.abs( boundingBox.min.z - boundingBox.max.z) * 3;
            var height = Math.abs( boundingBox.min.y - boundingBox.max.y) * 3;
            var fov = 2 * Math.atan( height / ( 2 * dist ) ) * ( 180 / Math.PI );

            camera.position.set(0, 0, dist);
            camera.fov = fov;
            camera.updateProjectionMatrix();
            // set initialize info
            cameraInitPosition = new THREE.Vector3(0, 0, dist);
            cameraInitFov = fov;
            cameraInitLookAt = camera.getWorldDirection();
            // end
        }, onProgress, onError);

    });

}

function loadJSON(jsonFilePath){

    var manager = new THREE.LoadingManager();


    manager.onLoad = function(){
        console.log("manager onload");
    }
    var loader = new THREE.JSONLoader(manager);
    loader.crossOrigin = '';
    THREE.Loader.Handlers.add( /\.tga$/i, new THREE.TGALoader() );

    loader.load(
        urljoin(BASE_URL,ASSETS_URL,jsonFilePath),
        function(geometry, materials){
            var material = new THREE.MultiMaterial(materials);
            var object = new THREE.Mesh(geometry, material);
            object.traverse(function(child){
                if( child instanceof THREE.Mesh){
                    child.material.side = THREE.DoubleSide;
                }
            });
            scene.add(object);
            modelObject = object;
            var centerPosition = new THREE.Vector3(0, 0 , 0);
            var boundingBox = null;
            object.traverse(function(child){
                if(child.geometry != undefined){
                    centerPosition = helper.getCentroid(child);
                    // set object center to the same as world center;
                    object.position.set(-centerPosition.x, -centerPosition.y, -centerPosition.z);

                    modelInitPosition = object.position;
                    boundingBox = helper.getBoundingBox(child);
                }
            });
            helper.drawBoundingBox(scene, object);


            var dist = Math.abs( boundingBox.min.z - boundingBox.max.z) * 3;
            var height = Math.abs( boundingBox.min.y - boundingBox.max.y) * 3;
            var fov = 2 * Math.atan( height / ( 2 * dist ) ) * ( 180 / Math.PI );

            camera.position.set(0, 0, dist);
            camera.fov = fov;
            camera.updateProjectionMatrix();
            // set initialize info
            cameraInitPosition = new THREE.Vector3(0, 0, dist);
            cameraInitFov = fov;
          cameraInitLookAt = camera.getWorldDirection();
            // en
        }
    );
}


function init() {
    // container = document.createElement('div');
    // document.body.appendChild(container);
    container = document.getElementById("container");
    camera = new THREE.PerspectiveCamera(89, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.z = 3;
    scene = new THREE.Scene();

    initSceneLights();

    mtlFilePath = helper.getQueryStr("mtlFilePath");
    objFilePath = helper.getQueryStr("objFilePath");
    modelId = helper.getQueryStr("modelId");
    console.log(modelId);
    if (mtlFilePath && objFilePath){
        loadObj(objFilePath, mtlFilePath);
    }
    else if(modelId){
        loadJSON(modelId+'.json');
    }
    else{
        throw "Not supported file format";
    }
    // draw coordinatePlane for debug
    helper.drawCoordinatePlane(scene);
    helper.drawCameraFrustum(scene, camera);
    renderer = new THREE.WebGLRenderer(
        {
            canvas: viewport,
            preserveDrawingBuffer :true //required to support .toDataURL()
        }
    );

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color("hsl(0, 0%, 10%)"));

    container.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);
    // initialize control settings.
    initControl();

}


var stats = new Stats();
stats.showPanel(1);
document.body.appendChild(stats.dom);


function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = windwo.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


function animate(){
    setTimeout(function() {
        requestAnimationFrame(animate);
        stats.begin();
        render();
        stats.end();
    }, 1000/300);
}

function render(){
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);
}



var scale = 1;
var zoomSpeed = 1;
var dollyStart = new THREE.Vector2();
var dollyEnd = new THREE.Vector2();


function checkDollyRangeIsValid(x, y, z){
    if( x > CAMERA_DOLLY_MAX || y > CAMERA_DOLLY_MAX || z > CAMERA_DOLLY_MAX ){
        return false;
    }
    if( x < CAMERA_DOLLY_MIN || y < CAMERA_DOLLY_MIN || z < CAMERA_DOLLY_MIN){
        return false;
    }
    return true;
}



function getDollyDistance(){
    var direction = camera.getWorldDirection();
    var xaxis = new THREE.Vector3(1, 0, 0);
    var yaxis = new THREE.Vector3(0, 1, 0);
    var zaxis = new THREE.Vector3(0, 0, 1);

    var xcos = Math.cos(direction.angleTo(xaxis));
    var ycos = Math.cos(direction.angleTo(yaxis));
    var zcos = Math.cos(direction.angleTo(zaxis));

    var xdelta = CAMERA_DOLLY_SCALE*xcos;
    var ydelta = CAMERA_DOLLY_SCALE*ycos;
    var zdelta = CAMERA_DOLLY_SCALE*zcos;

    return {
        x: xdelta,
        y: ydelta,
        z: zdelta
    }
}

function setDollyCamera(x, y, z){
    if(checkDollyRangeIsValid(x, y, z)){
        camera.position.set(x, y, z);
    }
    camera.updateProjectionMatrix();
}

function handleDollyIn(){
    var delta = getDollyDistance()
    var afterX = camera.position.x - delta.x;
    var afterY = camera.position.y - delta.y;
    var afterZ = camera.position.z - delta.z;
    setDollyCamera(afterX, afterY, afterZ);
}

function handleDollyOut(){
    var delta = getDollyDistance();
    var afterX = camera.position.x + delta.x;
    var afterY = camera.position.y + delta.y;
    var afterZ = camera.position.z + delta.z;

    setDollyCamera(afterX, afterY, afterZ);
}

function addOnClickEvents(){
    var recoverButton = document.getElementById("recover");
    recover.onclick = function(){
        console.log("recover button clicked.");
        console.log("CameraInitPosition: " + cameraInitPosition +", "+"CameraInitFov: "+cameraInitFov+", " + "CameraInitLookAt: " + cameraInitLookAt );
        //reset camera and model
        controls.reset();
        camera.position.set(cameraInitPosition.x, cameraInitPosition.y, cameraInitPosition.z);
        camera.fov = cameraInitFov;
        camera.updateProjectionMatrix();
        var dataUrl = renderer.domElement.toDataURL("image/png");
        console.log(dataUrl);

    };

    var moveButton = document.getElementById("move");

    moveButton.onclick = function(){
        console.log("move button is clicked");
        setPanMode();
    };
    var rotateButton = document.getElementById("rotate");

    rotateButton.onclick = function(){
        console.log("rotate button is clicked");
        setRotateMode();
    };
    var zoomOutButton = document.getElementById("zoomout");
    zoomOutButton.onclick = function(){
        console.log("zoomOut button is clicked");
        handleDollyOut();
    };
    var zoomInButton = document.getElementById("zoomin");
    zoomInButton.onclick = function(){
        console.log("zoomIn button is clicked");
        handleDollyIn();
    };
    var vrmodeButton = document.getElementById("vrmode");
    vrmodeButton.onclick = function(){
        console.log("vrmode button is clicked");

    };
}

addOnClickEvents();
init();
animate();


function fitCamera(){
    var dist = '';   // distance from the camera to the closest face of the cube.

    var height = ""; // height of the cube

    // set the camera field-of-view
}
