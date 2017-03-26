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


export {getQueryStr}
