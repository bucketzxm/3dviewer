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


function drawCoordinatePlane(scene){
    // x
    var materialX = new THREE.LineBasicMaterial({color: 0x0000ff});
    var geometryX = new THREE.Geometry();
    geometryX.vertices.push(new THREE.Vector3(0, 0, 0));
    geometryX.vertices.push(new THREE.Vector3(10, 0, 0));
    geometryX.vertices.push(new THREE.Vector3(100, 0, 0));

    var lineX = new THREE.Line(geometryX, materialX);
    scene.add(lineX);


    // y

    var materialY = new THREE.LineBasicMaterial({color: 0x00ff00});
    var geometryY = new THREE.Geometry();
    geometryY.vertices.push(new THREE.Vector3(0, 0, 0));
    geometryY.vertices.push(new THREE.Vector3(0, 10, 0));
    geometryY.vertices.push(new THREE.Vector3(0, 100, 0));

    var lineY = new THREE.Line(geometryY, materialY);

    scene.add(lineY);
    // z
    var materialZ = new THREE.LineBasicMaterial({color: 0xff0000});
    var geometryZ = new THREE.Geometry();
    geometryZ.vertices.push(new THREE.Vector3(0, 0, 0));
    geometryZ.vertices.push(new THREE.Vector3(0, 0, 10));
    geometryZ.vertices.push(new THREE.Vector3(0, 0, 100));

    var lineZ = new THREE.Line(geometryZ, materialZ);
    scene.add(lineZ);

}



export {
    getCentroid,
    getQueryStr,
    drawCoordinatePlane
}
