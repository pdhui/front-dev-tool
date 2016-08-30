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
  }
};