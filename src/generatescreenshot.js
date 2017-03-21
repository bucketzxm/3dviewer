function getScreenshotFromModel (filePath){

  var mesh;
  var strDownloadMime = "iamge/octet-stream";

  init();
  animate();


  function init(){
    var saveLink = document.createElement("div");
    saveLink.style.position = 'absollute';
  }

  renderer = new THREE.WebGLRenderer({
    preserveDrawingBuffer: true
  });
  var strMime = "image/jpeg";
  imageData = renderer.domElement.toDataURL(strMime);


 };

function saveAsImage(){
  var imageData, imageNode;
  try{
    var strMime = "image/jpeg";
    imageData = renderer.domElement.toDataURL(strMime);
  } catch (e) {
    console.log(e);
    return;
  }
}



export {getScreenshotFromModel}
