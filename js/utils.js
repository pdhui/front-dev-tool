module.exports = {
  assign: function(){
    var temp = arguments[0];
    var args = [].slice.call(arguments, 1);
    for(var i=0,len=args.length;i<len;i++){
      var item = args[i];
      for(var p in item){
        if(item.hasOwnProperty(p)){
          temp[p] = item[p];
        }
      }
    }
    return temp;
  },
  angleToRadian: function(angle){
    return angle * Math.PI  / 180;
  },
  createHtmlDom: (function createHtml(){
    var div = document.createElement('div');

    return function(html){
      var temp;
      div.innerHTML = html;
      temp = div.children[0];
      div.removeChild(temp);
      return temp;
    }
  })()
};