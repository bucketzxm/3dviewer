THREE = require('three');
Detector = require('./Detector.js');
MTLLoader = require('./MTLLoader.js');
OBJLoader = require('./OBJLoader.js');
OrbitControls = require('./OrbitControls.js');

detectWebGL();

var container;
var camera, controls, scene, renderer;

var lighting, ambient, keyLight, fillLight, backLight;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight /2;


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
  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 3;

  scene = new THREE.Scene();

  initSceneLights();

  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.setPath('http://localhost:8000/assets/');
  // mtlLoader.crossOrigin = '';

  mtlLoader.load('deer-obj.mtl', function(materials){
    materials.preload();
    // console.log(materials.materials.default.map);
    // materials.materials.default.map.magFilter = THREE.NearestFilter;
    // materials.materials.default.map.minFilter = THREE.LinearFilter;
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath("http://localhost:8000/assets/");
    objLoader.load('deer-obj.obj', function(object){
      // set all children to doubleside

      object.traverse(function(child){
        if( child instanceof THREE.Mesh){
          child.material.side = THREE.DoubleSide;
        }
      });


      scene.add(object);
    });
  });

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(new THREE.Color("hsl(0, 0%, 10%)"));

  container.appendChild(renderer.domElement);

  loadFunctionKeys(scene);
}

function loadFunctionKeys(){
  var textureLoader = new THREE.TextureLoader();
  textureLoader.crossOrigin = "";
  textureLoader.setPath("http://localhost:8000/public/images/");
  var zoomOutTexture = new THREE.Texture();

  zoomOutTexture = textureLoader.load(
    "zoomout_u322.png"
  );
  // zoomOutTexture.image = image;

  // zoom out
  var zoomOutGeometry = new THREE.Geometry();
  zoomOutGeometry.vertices.push(
    new THREE.Vector3(0.0, 0.0, 0.0),
    new THREE.Vector3(1.0, 0.0, 0.0),
    new THREE.Vector3(1.0, 1.0, 0.0),
    new THREE.Vector3(0.0, 1.0, 0.0)
  );

  zoomOutGeometry.faces.push(new THREE.Face3(0, 1, 3));
  zoomOutGeometry.faces.push(new THREE.Face3(1, 2, 3));





  zoomOutGeometry.faceVertexUvs[0] = [];

  var icon = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(1, 0),
    new THREE.Vector2(1, 1),
    new THREE.Vector2(0, 1)
  ];
  zoomOutGeometry.faceVertexUvs[0][0] = [
    icon[0],
    icon[1],
    icon[3]
  ];
  zoomOutGeometry.faceVertexUvs[0][1] = [
    icon[1],
    icon[2],
    icon[3]
  ];

  zoomOutGeometry.computeFaceNormals();
  // zoomOutGeometry.computeCentroids();
  zoomOutGeometry.computeVertexNormals();

  var zoomOutMaterial = new THREE.MeshBasicMaterial(
    {
      color: 0xffffff,
      opacity: 0.0,
      map: zoomOutTexture
    });

  // set material show double side
  zoomOutMaterial.side = THREE.DoubleSide;
  var zoomOutMesh = new THREE.Mesh(zoomOutGeometry, zoomOutMaterial);
  //TODO keep position fixed related to camera position.
  zoomOutMesh.position.set(1.5, 0.0, 0.0);
  zoomOutMesh.transparent = true;

  scene.add(zoomOutMesh);
  // zoom out end
  // zoom in
  var zoomInGeometry = new THREE.Geometry();
  zoomInGeometry.vertices.push(
    new THREE.Vector3(-1.0, 1.0, 0.0),
    new THREE.Vector3(1.0, 1.0, 0.0),
    new THREE.Vector3(1.0, -1.0, 0.0),
    new THREE.Vector3(-1.0, -1.0, 0.0)
  );
  // zoom in end
}


function animate(){
  setTimeout(function() {
    requestAnimationFrame(animate);
  }, 1000/30);
  render();
}

function render(){
  requestAnimationFrame(render);
  controls.update();
  renderer.render(scene, camera);
}


init();

controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

animate();
