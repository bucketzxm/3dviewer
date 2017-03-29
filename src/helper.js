function getQueryStr(argname)
{
  var url = document.location.href;
  var arrStr = url.substring(url.indexOf("?") + 1).split("&");
  //return arrStr;
  for (var i = 0; i < arrStr.length; i++)
  {
    var loc = arrStr[i].indexOf(argname+"=");
    if(loc!=-1){
      var ans =  arrStr[i].replace(argname + "=", "").replace("?", "");
      return ans;
      break;
    }
  }
  console.log('getQueryStr failed return empty "');
  return "";
}


function getCentroid(mesh){
    mesh.geometry.computeBoundingBox();
    boundingBox = mesh.geometry.boundingBox;

    var x0 = boundingBox.min.x;
    var x1 = boundingBox.max.x;
    var y0 = boundingBox.min.y;
    var y1 = boundingBox.max.y;
    var z0 = boundingBox.min.z;
    var z1 = boundingBox.max.z;

    var bWidth = (x0>x1)?x0-x1:x1-x0;
    var bHeight = (y0>y1)?y0-y1:y1-y0;
    var bDepth = (z0 > z1)?z0-z1:z1-z0;


    var centroidX = x0 + (bWidth /2)+mesh.position.x;
    var centroidY = y0 + (bHeight/2)+mesh.position.y;
    var centroidZ = z0 + (bDepth/2) + mesh.position.z;
    return mesh.geometry.centroid = {
        x: centroidX,
        y: centroidY,
        z: centroidZ
    };
}



export {getCentroid,
        getQueryStr}
