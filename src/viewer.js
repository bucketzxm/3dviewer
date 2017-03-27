THREE = require('three');
Detector = require('./Detector.js');
MTLLoader = require('./MTLLoader.js');
OBJLoader = require('./OBJLoader.js');
OrbitControls = require('./OrbitControls.js');
helper = require('./helper.js');

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
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100000);
    camera.position.z = 3;
    scene = new THREE.Scene();

    initSceneLights();


    var manager = new THREE.LoadingManager();
    manager.onStart = function(url, itemsLoaded, itemsTotal){
        console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    }
    manager.onLoad = function ( ) {
	console.log( 'Loading complete!');
        console.log("Model loaded " + modelObject);
        camera.lookAt(modelObject.position);
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
        });
    });
    renderer = new THREE.WebGLRenderer({canvas: viewport});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color("hsl(0, 0%, 10%)"));

    container.appendChild(renderer.domElement);
}

function animate(){
    setTimeout(function() {
        requestAnimationFrame(animate);
    }, 1000/300);
    render();
}

function render(){
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);
}

function addOnClickEvents(){
    var recoverButton = document.getElementById("recover");
    recover.onclick = function(){
        console.log("recovery button is clicked");
        console.log("Set Camera lookAt " + modelObject.position.x + ' ' + modelObject.position.y + ' ' + modelObject.position.z);
        camera.lookAt(modelObject.position);
    };

    var moveButton = document.getElementById("move");

    moveButton.onclick = function(){
        console.log("move button is clicked");
    };
    var rotateButton = document.getElementById("rotate");

    moveButton.onclick = function(){
        console.log("move button is clicked");
    };
    var zoomOutButton = document.getElementById("zoomout");
    moveButton.onclick = function(){
        console.log("move button is clicked");
    };
    var zoominButton = document.getElementById("zoomin");
    moveButton.onclick = function(){
        console.log("move button is clicked");
    };
    var vrmode = document.getElementById("vrmode");
    moveButton.onclick = function(){
        console.log("move button is clicked");

    };
}
addOnClickEvents();
init();
controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

animate();

