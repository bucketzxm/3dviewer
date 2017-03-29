THREE = require('three');
Detector = require('./Detector.js');
MTLLoader = require('./MTLLoader.js');
OBJLoader = require('./OBJLoader.js');
TGALoader = require('./TGALoader.js');
OrbitControls = require('./OrbitControls.js');
helper = require('./helper.js');
Stats = require('stats.js');

detectWebGL();

var container;
var camera, controls, scene, renderer;
var lighting, ambient, keyLight, fillLight, backLight;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight /2;
var modelObject = null;

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
    scene.add(keyLight);
    scene.add(fillLight);
    scene.add(backLight);

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

function init() {
    // container = document.createElement('div');
    // document.body.appendChild(container);
    container = document.getElementById("container");
    camera = new THREE.PerspectiveCamera(89, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.z = 3;
    scene = new THREE.Scene();

    initSceneLights();

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
    mtlLoader.setPath('http://localhost:8000/assets/');
    mtlLoader.crossOrigin = '';

    mtlFilePath = helper.getQueryStr("mtlFilePath");
    objFilePath = helper.getQueryStr("objFilePath");

    console.log("mtlFilePath=" + mtlFilePath + " objFilePath="+ objFilePath);


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
        objLoader.setPath("http://localhost:8000/assets/");
        objLoader.load(objFilePath, function(object){
            // set all children to doubleside
            object.traverse(function(child){
                if( child instanceof THREE.Mesh){
                    child.material.side = THREE.DoubleSide;
                }
            });
            scene.add(object);
            modelObject = object;

            helper.drawBoundingBox(scene, object);
            /* modelObject.traverse(function(child){
             *     if(child.geometry != undefined){
             *         positions = helper.getCentroid(child);
             *         camera.lookAt(new THREE.Vector3(positions.x, positions.y, positions.z));
             *         console.log("model mesh center position" + positions.x + positions.y + positions.z);
             *     }
             * });*/
        }, onProgress, onError);
    });
    // draw coordinatePlane for debug
    helper.drawCoordinatePlane(scene);
    renderer = new THREE.WebGLRenderer({canvas: viewport});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color("hsl(0, 0%, 10%)"));

    container.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);
}


var stats = new Stats();
stats.showPanel(1);
document.body.appendChild(stats.dom);



function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windwoHalfY = window.innerHeight / 2;

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
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}


function zoomInCamera(delta){
}


function addOnClickEvents(){
    var recoverButton = document.getElementById("recover");
    recover.onclick = function(){
        console.log("Set Camera lookAt " + scene.position.x + ' ' + scene.position.y + ' ' + scene.position.z);
        camera.lookAt(scene.position);
    };

    var moveButton = document.getElementById("move");

    moveButton.onclick = function(){
        console.log("move button is clicked");
    };
    var rotateButton = document.getElementById("rotate");

    rotateButton.onclick = function(){
        console.log("rotate button is clicked");
    };
    var zoomOutButton = document.getElementById("zoomout");
    zoomOutButton.onclick = function(){
        console.log("zoomOut button is clicked");
        console.log(camera.zoom)
        debugger;
    };
    var zoomInButton = document.getElementById("zoomin");
    zoomInButton.onclick = function(){
        console.log("zoomIn button is clicked");
    };
    var vrmodeButton = document.getElementById("vrmode");
    vrmodeButton.onclick = function(){
        console.log("vrmode button is clicked");

    };
}

addOnClickEvents();
init();

controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

animate();


function fitCamera(){
    var dist = '';   // distance from the camera to the closest face of the cube.

    var height = ""; // height of the cube

    // set the camera field-of-view
}


